import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export class LocalTimestamp {
  seconds: number;
  nanoseconds: number;

  constructor(date: Date = new Date()) {
    this.seconds = Math.floor(date.getTime() / 1000);
    this.nanoseconds = (date.getTime() % 1000) * 1e6;
  }

  toDate(): Date {
    return new Date(this.seconds * 1000 + Math.floor(this.nanoseconds / 1e6));
  }

  toISOString(): string {
    return this.toDate().toISOString();
  }

  static fromDate(d: Date): LocalTimestamp {
    return new LocalTimestamp(d);
  }

  static now(): LocalTimestamp {
    return new LocalTimestamp();
  }
}

function reviveDoc(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const copy: any = { ...data };
  for (const key of Object.keys(copy)) {
    const val = copy[key];
    if (val && typeof val === 'object' && typeof val.seconds === 'number' && typeof val.nanoseconds === 'number') {
      const ts = new LocalTimestamp();
      ts.seconds = val.seconds;
      ts.nanoseconds = val.nanoseconds;
      copy[key] = ts;
    } else if (key.endsWith('At') && typeof val === 'string' && !isNaN(Date.parse(val))) {
      copy[key] = new LocalTimestamp(new Date(val));
    }
  }
  return copy;
}

export class LocalDbStore {
  private filePath: string;
  private data: Record<string, Record<string, any>> = {};
  private saveTimer: any = null;

  constructor() {
    const dataDir = path.resolve(process.cwd(), '.data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    this.filePath = path.join(dataDir, 'yokubo_db.json');
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        this.data = JSON.parse(raw);
      }
    } catch (err) {
      console.error('Failed to load local database:', err);
      this.data = {};
    }
  }

  private scheduleSave() {
    if (this.saveTimer) clearTimeout(this.saveTimer);
    this.saveTimer = setTimeout(() => {
      try {
        fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (err) {
        console.error('Failed to persist local database:', err);
      }
    }, 200);
  }

  public flush() {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch {}
  }

  getCollection(name: string): any[] {
    const col = this.data[name] || {};
    return Object.keys(col).map(id => reviveDoc({ ...col[id], id }));
  }

  getDoc(collectionName: string, id: string): any | null {
    const col = this.data[collectionName] || {};
    const item = col[id];
    return item ? reviveDoc({ ...item, id }) : null;
  }

  setDoc(collectionName: string, id: string, docData: any) {
    if (!this.data[collectionName]) this.data[collectionName] = {};
    const cleanData = { ...docData };
    delete cleanData.id;
    this.data[collectionName][id] = cleanData;
    this.scheduleSave();
  }

  updateDoc(collectionName: string, id: string, docData: any) {
    if (!this.data[collectionName]) this.data[collectionName] = {};
    const existing = this.data[collectionName][id] || {};
    const cleanData = { ...docData };
    delete cleanData.id;
    this.data[collectionName][id] = { ...existing, ...cleanData };
    this.scheduleSave();
  }

  deleteDoc(collectionName: string, id: string) {
    if (this.data[collectionName] && this.data[collectionName][id]) {
      delete this.data[collectionName][id];
      this.scheduleSave();
    }
  }
}

export class LocalDocRef {
  id: string;
  collectionName: string;
  private store: LocalDbStore;

  constructor(collectionName: string, id: string, store: LocalDbStore) {
    this.collectionName = collectionName;
    this.id = id;
    this.store = store;
  }

  async get() {
    const doc = this.store.getDoc(this.collectionName, this.id);
    return {
      id: this.id,
      exists: Boolean(doc),
      data: () => doc ? { ...doc } : undefined,
      ref: this
    };
  }

  async set(data: any) {
    const payload = this.normalizePayload(data);
    this.store.setDoc(this.collectionName, this.id, payload);
    return { id: this.id };
  }

  async update(data: any) {
    const payload = this.normalizePayload(data);
    this.store.updateDoc(this.collectionName, this.id, payload);
    return { id: this.id };
  }

  async delete() {
    this.store.deleteDoc(this.collectionName, this.id);
  }

  private normalizePayload(data: any): any {
    return normalizeValue(data);
  }
}

function normalizeValue(val: any): any {
  if (!val) return val;
  if (typeof val === 'object') {
    if (val._isServerTimestamp || val.constructor?.name === 'ServerTimestampTransform') {
      return new LocalTimestamp();
    }
    if (typeof val.toDate === 'function') {
      return new LocalTimestamp(val.toDate());
    }
    if (Array.isArray(val)) {
      return val.map(normalizeValue);
    }
    const res: any = {};
    for (const k of Object.keys(val)) {
      res[k] = normalizeValue(val[k]);
    }
    return res;
  }
  return val;
}

export class LocalQuery {
  protected collectionName: string;
  protected store: LocalDbStore;
  private filters: Array<{ field: string; op: string; value: any }> = [];
  private orderBys: Array<{ field: string; dir: 'asc' | 'desc' }> = [];
  private limitCount?: number;

  constructor(collectionName: string, store: LocalDbStore) {
    this.collectionName = collectionName;
    this.store = store;
  }

  where(field: string, op: string, value: any): LocalQuery {
    const q = this.clone();
    q.filters.push({ field, op, value });
    return q;
  }

  orderBy(field: string, dir: 'asc' | 'desc' = 'asc'): LocalQuery {
    const q = this.clone();
    q.orderBys.push({ field, dir });
    return q;
  }

  limit(count: number): LocalQuery {
    const q = this.clone();
    q.limitCount = count;
    return q;
  }

  count() {
    return {
      get: async () => {
        const snap = await this.get();
        return {
          data: () => ({ count: snap.docs.length })
        };
      }
    };
  }

  private clone(): LocalQuery {
    const q = new LocalQuery(this.collectionName, this.store);
    q.filters = [...this.filters];
    q.orderBys = [...this.orderBys];
    q.limitCount = this.limitCount;
    return q;
  }

  async get() {
    let items = this.store.getCollection(this.collectionName);

    // Apply filters
    for (const f of this.filters) {
      items = items.filter(doc => {
        const docVal = doc[f.field];
        if (f.op === '==') return docVal === f.value;
        if (f.op === '!=') return docVal !== f.value;
        if (f.op === '>') return docVal > f.value;
        if (f.op === '>=') return docVal >= f.value;
        if (f.op === '<') return docVal < f.value;
        if (f.op === '<=') return docVal <= f.value;
        return true;
      });
    }

    // Apply sorting
    for (const o of this.orderBys) {
      items.sort((a, b) => {
        let va = a[o.field];
        let vb = b[o.field];
        if (va && typeof va.toDate === 'function') va = va.toDate().getTime();
        if (vb && typeof vb.toDate === 'function') vb = vb.toDate().getTime();
        if (va === vb) return 0;
        const comp = va > vb ? 1 : -1;
        return o.dir === 'desc' ? -comp : comp;
      });
    }

    // Apply limit
    if (this.limitCount !== undefined) {
      items = items.slice(0, this.limitCount);
    }

    const docs = items.map(item => ({
      id: item.id,
      exists: true,
      data: () => ({ ...item }),
      ref: new LocalDocRef(this.collectionName, item.id, this.store)
    }));

    return {
      docs,
      empty: docs.length === 0,
      size: docs.length
    };
  }
}

export class LocalCollectionRef extends LocalQuery {
  constructor(collectionName: string, store: LocalDbStore) {
    super(collectionName, store);
  }

  doc(id?: string): LocalDocRef {
    const docId = id || crypto.randomUUID();
    return new LocalDocRef(this.collectionName, docId, this.store);
  }

  async add(data: any): Promise<LocalDocRef> {
    const docId = crypto.randomUUID();
    const docRef = new LocalDocRef(this.collectionName, docId, this.store);
    await docRef.set(data);
    return docRef;
  }
}

export class LocalBatch {
  private operations: Array<() => Promise<void>> = [];

  delete(ref: LocalDocRef) {
    this.operations.push(async () => {
      await ref.delete();
    });
    return this;
  }

  set(ref: LocalDocRef, data: any) {
    this.operations.push(async () => {
      await ref.set(data);
    });
    return this;
  }

  update(ref: LocalDocRef, data: any) {
    this.operations.push(async () => {
      await ref.update(data);
    });
    return this;
  }

  async commit() {
    for (const op of this.operations) {
      await op();
    }
  }
}

export class LocalFirestore {
  private store: LocalDbStore;

  constructor() {
    this.store = new LocalDbStore();
  }

  collection(name: string): LocalCollectionRef {
    return new LocalCollectionRef(name, this.store);
  }

  batch(): LocalBatch {
    return new LocalBatch();
  }
}

export const localFieldValue = {
  serverTimestamp: () => ({ _isServerTimestamp: true })
};
