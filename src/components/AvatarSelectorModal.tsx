import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Check, Trash2, Camera, Sparkles } from 'lucide-react';
import { GEOMETRIC_ICONS, UserAvatar } from './UserAvatar';

interface AvatarSelectorModalProps {
  isOpen: boolean;
  currentAvatar?: string | null;
  userName?: string | null;
  onClose: () => void;
  onSave: (newAvatar: string | null) => Promise<void>;
}

export const AvatarSelectorModal: React.FC<AvatarSelectorModalProps> = ({
  isOpen,
  currentAvatar,
  userName,
  onClose,
  onSave,
}) => {
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(currentAvatar || null);
  const [isSaving, setIsSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if modal opens
  React.useEffect(() => {
    setSelectedAvatar(currentAvatar || null);
    setUploadError(null);
  }, [isOpen, currentAvatar]);

  // Client-side image resize helper to keep payloads lean (< 50KB)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Veuillez sélectionner un fichier image valide (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('La taille du fichier est trop grande (maximum 5 Mo).');
      return;
    }

    setUploadError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize and crop to square 256x256
        const canvas = document.createElement('canvas');
        const size = 256;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setSelectedAvatar(dataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(selectedAvatar);
      onClose();
    } catch (err) {
      setUploadError('Échec de la sauvegarde de l\'avatar.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-lg glass-panel rounded-xl p-6 border border-red-500/20 shadow-[0_0_50px_rgba(255,0,64,0.15)] z-10 overflow-hidden"
          >
            {/* Top decorative gradient line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0040] via-[#c200d6] to-[#00e5ff]" />

            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-red-500/10 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#c200d6]/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Camera size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold uppercase tracking-widest text-slate-100 flex items-center gap-2">
                    CHOISIR MON AVATAR <span className="text-[10px] font-mono font-normal text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">PROFIL</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Sélectionnez une icône géométrique cyber ou importez votre photo
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Current Active Preview */}
            <div className="flex items-center gap-4 p-4 rounded-lg bg-[#080310] border border-white/5 mb-5">
              <UserAvatar avatar={selectedAvatar} name={userName} size="xl" />
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-200 font-sans">
                  Aperçu de votre identité
                </div>
                <div className="text-[10px] font-mono text-slate-400">
                  {selectedAvatar?.startsWith('geom:')
                    ? `Icône géométrique : ${GEOMETRIC_ICONS.find((g) => g.id === selectedAvatar)?.name}`
                    : selectedAvatar
                    ? 'Photo personnalisée importée'
                    : 'Initiales textuelles classiques'}
                </div>
                {selectedAvatar && (
                  <button
                    onClick={() => setSelectedAvatar(null)}
                    className="text-[10px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1 pt-1 cursor-pointer"
                  >
                    <Trash2 size={11} /> Revenir aux initiales textuelles
                  </button>
                )}
              </div>
            </div>

            {/* Error message */}
            {uploadError && (
              <div className="mb-4 p-2.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {uploadError}
              </div>
            )}

            {/* Tab 1: Geometric Icons Grid */}
            <div className="space-y-2 mb-5">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Sparkles size={11} className="text-[#00e5ff]" />
                Collection d'Icônes Géométriques
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                {GEOMETRIC_ICONS.map((geo) => {
                  const isSelected = selectedAvatar === geo.id;
                  return (
                    <button
                      key={geo.id}
                      type="button"
                      onClick={() => setSelectedAvatar(geo.id)}
                      className={`relative flex flex-col items-center justify-center p-3 rounded-lg border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#ff0040] bg-[#1a0524] shadow-[0_0_15px_rgba(255,0,64,0.3)] ring-1 ring-[#ff0040]'
                          : 'border-slate-800 bg-[#06020a] hover:border-slate-700 hover:bg-[#0c0515]'
                      }`}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center mb-1.5 transition-transform group-hover:scale-110"
                        style={{
                          color: geo.color,
                          backgroundColor: `${geo.color}15`,
                          border: `1px solid ${geo.color}40`,
                        }}
                      >
                        {geo.render(22)}
                      </div>
                      <span className="text-[9px] font-mono text-slate-300 truncate w-full text-center">
                        {geo.name}
                      </span>
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-3.5 h-3.5 rounded-full bg-[#ff0040] flex items-center justify-center text-white">
                          <Check size={9} strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tab 2: Custom Photo Upload */}
            <div className="space-y-2 mb-6">
              <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                <Upload size={11} className="text-purple-400" />
                Ou Importer une Photo Personnelle
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-3 px-4 rounded-lg border border-dashed border-slate-700 hover:border-purple-500/50 bg-[#07020d] hover:bg-[#0e0419] text-xs text-slate-300 font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Camera size={14} className="text-purple-400" />
                {selectedAvatar?.startsWith('data:image/')
                  ? 'Remplacer la photo sélectionnée'
                  : 'Parcourir un fichier image (JPG, PNG, WebP)'}
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="gothic-btn-primary px-5 py-2 rounded text-xs font-semibold uppercase tracking-wider font-display flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSaving ? 'Enregistrement...' : 'Enregistrer l\'Avatar'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
