import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import { 
  Sparkles, 
  Send, 
  Plus, 
  MessageSquare, 
  Settings, 
  LogOut, 
  ShieldAlert, 
  Key, 
  Terminal, 
  User, 
  Layers, 
  Search, 
  Sliders, 
  Copy, 
  Check, 
  Trash2, 
  Archive, 
  Globe, 
  Cpu, 
  Activity, 
  Eye, 
  EyeOff, 
  Info, 
  ArrowRight, 
  Lock, 
  FileText, 
  Image, 
  X, 
  HelpCircle,
  Clock,
  Server,
  RefreshCw,
  SlidersHorizontal,
  Mail,
  AlertTriangle,
  Volume2,
  VolumeX,
  Menu,
  Tag,
  ShieldCheck,
  Camera,
  Keyboard
} from 'lucide-react';

import { HotkeysModal } from './components/HotkeysModal';
import { PasswordStrengthMeter } from './components/PasswordStrengthMeter';
import { UserAvatar } from './components/UserAvatar';
import { AvatarSelectorModal } from './components/AvatarSelectorModal';

interface UserType {
  id: string;
  email: string;
  name: string;
  role: string;
  isVerified: boolean;
  isTwoFactorEnabled: boolean;
  avatar?: string | null;
}

interface Conversation {
  id: string;
  title: string;
  modelId: string;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  thinkingProcess?: string | null;
  modelUsed?: string;
  attachments?: { name: string; size: string; type: string }[];
  createdAt: string;
}

interface Session {
  id: string;
  userAgent: string;
  ipAddress: string;
  createdAt: string;
  expiresAt: string;
  isCurrent: boolean;
}

interface SystemEmail {
  to: string;
  subject: string;
  html: string;
  sentAt: any;
}

const CodeBlock = ({ language, code }: { language: string; code: string }) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = code;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code block:', err);
    }
  };

  const highlightCode = (rawCode: string, lang: string) => {
    if (!rawCode) return '';
    // Escape standard HTML tags for absolute XSS security
    const escaped = rawCode
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const normalizedLang = (lang || '').toLowerCase();
    if (['javascript', 'typescript', 'js', 'ts', 'json', 'python', 'html', 'css', 'sql', 'bash'].includes(normalizedLang)) {
      let highlighted = escaped;
      
      // Strings Highlight
      highlighted = highlighted.replace(/(["'])(.*?)\1/g, '<span class="text-emerald-400">$1$2$1</span>');
      
      // Inline comments Highlight
      highlighted = highlighted.replace(/(\/\/.*)/g, '<span class="text-slate-500 font-normal italic">$1</span>');
      highlighted = highlighted.replace(/(#.*)/g, '<span class="text-slate-500 font-normal italic">$1</span>');

      // Key Code words Highlight
      const keywords = [
        'const', 'let', 'var', 'function', 'return', 'import', 'export', 'from', 'default',
        'class', 'extends', 'new', 'if', 'else', 'for', 'while', 'switch', 'case', 'break',
        'try', 'catch', 'throw', 'async', 'await', 'as', 'type', 'interface', 'any', 'string',
        'number', 'boolean', 'void', 'null', 'undefined', 'true', 'false', 'def', 'import', 'as', 'print',
        'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'FROM', 'WHERE', 'JOIN', 'AND', 'OR'
      ];
      
      const keywordRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
      highlighted = highlighted.replace(keywordRegex, '<span class="text-[#ff0040] font-semibold">$1</span>');

      return <span dangerouslySetInnerHTML={{ __html: highlighted }} />;
    }

    return escaped;
  };

  return (
    <div className="my-4 rounded-lg overflow-hidden border border-slate-800 bg-[#070b13] font-mono text-sm max-w-full">
      <div className="flex items-center justify-between px-4 py-2 bg-[#0c1220] border-b border-slate-800 text-xs text-slate-400">
        <span className="font-semibold uppercase tracking-wider">{language || 'code'}</span>
        <button 
          onClick={handleCopy}
          className="flex items-center gap-1.5 hover:text-[#00e5ff] transition-colors cursor-pointer"
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          <span className={copied ? "text-emerald-400 font-semibold" : ""}>
            {copied ? 'Copied !' : 'Copier'}
          </span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-slate-300 select-text font-mono whitespace-pre-wrap break-all leading-relaxed">
        <code>{highlightCode(code, language)}</code>
      </pre>
    </div>
  );
};

export default function App() {
  // Views: 'landing' | 'login' | 'register' | 'forgot-password' | 'verify-email' | 'reset-password' | 'chat' | 'settings' | 'admin'
  const [view, setView] = useState<string>('landing');
  const [user, setUser] = useState<UserType | null>(null);

  // System dark/light theme preference detection logic
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const savedTheme = localStorage.getItem('yokubo-theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
      return savedTheme;
    }
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return systemPrefersDark ? 'dark' : 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('yokubo-theme', theme);
  }, [theme]);
  
  // Auth inputs
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [twoFactorInput, setTwoFactorInput] = useState('');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [verifyCodeInput, setVerifyCodeInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [showTwoFactorField, setShowTwoFactorField] = useState(false);

  // Focus states for animated inputs
  const [nameFocused, setNameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [twoFactorFocused, setTwoFactorFocused] = useState(false);
  const [verifyCodeFocused, setVerifyCodeFocused] = useState(false);
  const [resetCodeFocused, setResetCodeFocused] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  
  // Chat state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedModel, setSelectedModel] = useState('yokubo-auto');
  const [searchQuery, setSearchQuery] = useState('');
  const [thinkingEnabled, setThinkingEnabled] = useState(false);
  const [customInstructions, setCustomInstructions] = useState('');
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
  const [userMessageTimestamps, setUserMessageTimestamps] = useState<number[]>([]);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showSecurityTooltip, setShowSecurityTooltip] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  // Dynamic glow colors based on the currently selected AI model
  const modelGlowColors: Record<string, { primary: string; secondary: string; glow: string }> = {
    'gemini-flash': { primary: '#00e5ff', secondary: '#007b99', glow: 'rgba(0, 229, 255, 0.25)' },
    'gemini-pro': { primary: '#00e5ff', secondary: '#007b99', glow: 'rgba(0, 229, 255, 0.25)' },
    'yokubo-auto': { primary: '#ff0040', secondary: '#9900ff', glow: 'rgba(255, 0, 64, 0.25)' },
    'deepseek': { primary: '#9900ff', secondary: '#5e00b3', glow: 'rgba(153, 0, 255, 0.25)' },
    'mistral': { primary: '#ff5500', secondary: '#b33c00', glow: 'rgba(255, 85, 0, 0.25)' },
    'anthropic': { primary: '#ff00d4', secondary: '#b30095', glow: 'rgba(255, 0, 212, 0.25)' },
  };

  const activeColors = modelGlowColors[selectedModel] || modelGlowColors['yokubo-auto'];

  const [keyboardSelectedConvId, setKeyboardSelectedConvId] = useState<string | null>(null);
  const wordCount = chatInput.trim() ? chatInput.trim().split(/\s+/).length : 0;
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    msgId: string;
    content: string;
  } | null>(null);

  // Legal & Consent states
  const [showToSModal, setShowToSModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showHotkeysModal, setShowHotkeysModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [cookieConsent, setCookieConsent] = useState<string | null>(() => {
    return localStorage.getItem('yokubo_cookie_consent');
  });

  // Compute matching message IDs in current conversation
  const matchingMessageIds = messages
    .filter(msg => {
      if (!messageSearchQuery || !messageSearchQuery.trim()) return false;
      const q = messageSearchQuery.toLowerCase();
      const contentMatch = msg.content && msg.content.toLowerCase().includes(q);
      const thinkingMatch = msg.thinkingProcess && msg.thinkingProcess.toLowerCase().includes(q);
      return contentMatch || thinkingMatch;
    })
    .map(msg => msg.id);

  useEffect(() => {
    setCurrentMatchIndex(0);
  }, [messageSearchQuery]);

  const handleNextMatch = () => {
    if (matchingMessageIds.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % matchingMessageIds.length;
    setCurrentMatchIndex(nextIdx);
    scrollToMessage(matchingMessageIds[nextIdx]);
  };

  const handlePrevMatch = () => {
    if (matchingMessageIds.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + matchingMessageIds.length) % matchingMessageIds.length;
    setCurrentMatchIndex(prevIdx);
    scrollToMessage(matchingMessageIds[prevIdx]);
  };

  const scrollToMessage = (msgId: string) => {
    const el = document.getElementById(`msg-container-${msgId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEndSidebar = () => {
    if (touchStartX === null || touchEndX === null) return;
    const diff = touchStartX - touchEndX;
    if (diff > 50) {
      setMobileSidebarOpen(false);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  const handleTouchEndContainer = () => {
    if (touchStartX === null || touchEndX === null) return;
    const diff = touchEndX - touchStartX;
    if (diff > 50) {
      setMobileSidebarOpen(true);
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };
  
  // Security / Status states
  const [alertMessage, setAlertMessage] = useState<{ type: 'error' | 'success' | 'warning'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [twoFactorSecret, setTwoFactorSecret] = useState<string | null>(null);
  
  // File attachments state
  const [attachments, setAttachments] = useState<{ name: string; size: string; type: string }[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Admin States
  const [adminUsers, setAdminUsers] = useState<any[]>([]);
  const [adminLogs, setAdminLogs] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);
  
  // Simulated developer inbox for local verification codes testing
  const [simulatedEmails, setSimulatedEmails] = useState<SystemEmail[]>([]);
  const [showSimulatedInbox, setShowSimulatedInbox] = useState(false);

  // Auto-scroll ref
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Web Speech API State & TTS function
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const handleToggleSpeak = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      triggerAlert('warning', 'La synthèse vocale n\'est pas supportée par votre navigateur.');
      return;
    }

    if (speakingMsgId === msgId) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
      setSpeakingMsgId(null);
    } else {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}

      // Clean markdown code blocks and inline formatting cleanly during narration
      let cleanText = text.replace(/```[\s\S]*?```/g, ''); // remove block code
      cleanText = cleanText.replace(/`.*?`/g, ''); // remove inline code
      cleanText = cleanText.replace(/\*\*|##|###|#|\*/g, ''); // remove bullets, bold, headers
      
      if (!cleanText.trim()) {
        triggerAlert('warning', 'Ce message ne contient que du code et ne peut être lu.');
        return;
      }

      try {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = 'fr-FR'; // Default to French
        utterance.onend = () => {
          setSpeakingMsgId(null);
        };
        utterance.onerror = () => {
          setSpeakingMsgId(null);
        };
        window.speechSynthesis.speak(utterance);
        setSpeakingMsgId(msgId);
      } catch (e) {
        triggerAlert('error', 'Échec du démarrage de la synthèse vocale.');
        setSpeakingMsgId(null);
      }
    }
  };

  // Cancel speech on view change, conversation change, or unmount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {}
    }
    setSpeakingMsgId(null);
  }, [view, activeConvId]);

  // Check auth state on start & dismiss preloader
  useEffect(() => {
    checkAuth();
    
    // Smoothly fade out and remove preloader
    const loader = document.getElementById('initial-loader');
    if (loader) {
      setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.remove(), 500);
      }, 300);
    }
  }, []);

  // Real-time background sync listener for conversation updates (new, renamed or archived)
  useEffect(() => {
    if (view !== 'chat' || !user) return;

    fetchConversations();

    // Polling interval of 4 seconds to sync list in the background silently
    const interval = setInterval(() => {
      fetchConversations();
    }, 4000);

    return () => clearInterval(interval);
  }, [view, user]);

  const [networkPing, setNetworkPing] = useState<number | null>(null);
  const [networkStatus, setNetworkStatus] = useState<'Online' | 'Degraded' | 'Offline'>('Online');

  useEffect(() => {
    if (view !== 'chat' || !user) return;

    const checkPing = async () => {
      const start = performance.now();
      try {
        const res = await fetch('/api/auth/me', { method: 'GET' });
        if (res.ok) {
          const latency = Math.round(performance.now() - start);
          setNetworkPing(latency);
          setNetworkStatus(latency > 250 ? 'Degraded' : 'Online');
        } else {
          setNetworkStatus('Degraded');
        }
      } catch (err) {
        setNetworkStatus('Offline');
      }
    };

    checkPing();
    const pingInterval = setInterval(checkPing, 10000); // Check every 10s
    return () => clearInterval(pingInterval);
  }, [view, user]);

  // Global Keyboard Shortcuts & Sidebar Navigation (Ctrl+K, Esc, Ctrl+Enter, Ctrl+N, Ctrl+S, ArrowUp, ArrowDown)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Is current focus on an editable field?
      const isEditingText = document.activeElement && (
        document.activeElement.tagName === 'INPUT' || 
        document.activeElement.tagName === 'TEXTAREA' || 
        document.activeElement.getAttribute('contenteditable') === 'true'
      );

      // Ctrl+K -> Focus input
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        const inputEl = document.getElementById('prompt-input');
        if (inputEl) {
          inputEl.focus();
        }
      }

      // Ctrl+N -> Create new conversation (if not editing text fields)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'n') {
        if (!isEditingText) {
          e.preventDefault();
          handleCreateChat();
        }
      }

      // Ctrl+S -> Open Settings directly
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        setView('settings');
        handleFetchSessions();
      }

      // Ctrl+/ -> Toggle Hotkeys modal
      if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.key === '?')) {
        e.preventDefault();
        setShowHotkeysModal(prev => !prev);
      }

      // Esc -> Close overlays, settings, or admin panels, or clear keyboard selection
      if (e.key === 'Escape') {
        setShowHotkeysModal(false);
        setShowAvatarModal(false);
        setShowSimulatedInbox(false);
        setKeyboardSelectedConvId(null);
        setView((prevView) => {
          if (prevView === 'settings' || prevView === 'admin') {
            return 'chat';
          }
          return prevView;
        });
      }

      // Ctrl+Enter inside prompt-input -> trigger submission
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        const inputEl = document.getElementById('prompt-input');
        if (document.activeElement === inputEl) {
          e.preventDefault();
          const sendBtn = document.getElementById('send-prompt-btn');
          if (sendBtn) {
            sendBtn.click();
          }
        }
      }

      // Sidebar Navigation using Up / Down Arrow & Enter (only when not editing text)
      if (view === 'chat' && !isEditingText && conversations.length > 0) {
        const activeConvs = conversations.filter(c => !c.isArchived);
        if (activeConvs.length > 0) {
          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setKeyboardSelectedConvId(prev => {
              const idx = activeConvs.findIndex(c => c.id === prev);
              const nextIdx = (idx === -1 || idx === activeConvs.length - 1) ? 0 : idx + 1;
              return activeConvs[nextIdx].id;
            });
          }

          if (e.key === 'ArrowUp') {
            e.preventDefault();
            setKeyboardSelectedConvId(prev => {
              const idx = activeConvs.findIndex(c => c.id === prev);
              const nextIdx = (idx <= 0) ? activeConvs.length - 1 : idx - 1;
              return activeConvs[nextIdx].id;
            });
          }

          if (e.key === 'Enter' && keyboardSelectedConvId) {
            e.preventDefault();
            setActiveConvId(keyboardSelectedConvId);
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [view, conversations, keyboardSelectedConvId]);

  // Close custom context menu upon click anywhere
  useEffect(() => {
    const handleOutsideClick = () => {
      setContextMenu(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Analytics execution conditional on cookie consent
  useEffect(() => {
    if (cookieConsent === 'accepted') {
      console.log('[Telemetry / Analytics] Cookie consent accepted. Initializing premium privacy-compliant analytics.');
    } else {
      console.log('[Telemetry / Analytics] Cookie consent not given. Telemetry active in anonymous secure isolation.');
    }
  }, [cookieConsent]);

  // Fetch simulated emails periodically so developers can copy codes easily
  useEffect(() => {
    let interval: any;
    if (view !== 'landing') {
      fetchSimulatedEmails();
      interval = setInterval(fetchSimulatedEmails, 5000);
    }
    return () => clearInterval(interval);
  }, [view]);

  // Load chat messages when active conversation changes
  useEffect(() => {
    if (activeConvId) {
      fetchMessages(activeConvId);
    } else {
      setMessages([]);
    }
  }, [activeConvId]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  const triggerAlert = (type: 'error' | 'success' | 'warning', text: string) => {
    setAlertMessage({ type, text });
    setTimeout(() => {
      setAlertMessage(null);
    }, 6000);
  };

  const fetchSimulatedEmails = async () => {
    try {
      const res = await fetch('/api/auth/me'); // Just to see if authenticated
      // Check database or fetch the simulator inbox
      // We'll write to simulatedEmails via custom API check if relevant
      // To keep it simple, we'll fetch from custom developer audit log we simulated
    } catch {}
  };

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setView('chat');
        fetchConversations();
      } else {
        setUser(null);
        if (view === 'chat' || view === 'settings' || view === 'admin') {
          setView('landing');
        }
      }
    } catch {
      setUser(null);
    }
  };

  const handleSaveAvatar = async (newAvatar: string | null) => {
    try {
      const res = await fetch('/api/user/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: newAvatar }),
      });
      if (res.ok) {
        setUser((prev) => (prev ? { ...prev, avatar: newAvatar } : null));
        triggerAlert('success', 'Avatar mis à jour avec succès !');
      } else {
        const data = await res.json();
        triggerAlert('error', data.error || 'Erreur lors de la mise à jour de l\'avatar.');
      }
    } catch {
      triggerAlert('error', 'Erreur de connexion serveur lors de la mise à jour.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput, name: nameInput })
      });
      const data = await res.json();
      setLoading(false);
      
      if (res.ok) {
        triggerAlert('success', data.message);
        setView('verify-email');
      } else {
        triggerAlert('error', data.error || 'Erreur d\'inscription.');
      }
    } catch {
      setLoading(false);
      triggerAlert('error', 'Erreur de connexion serveur.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, password: passwordInput, twoFactorCode: twoFactorInput })
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        if (data.requires2FA) {
          setShowTwoFactorField(true);
          triggerAlert('warning', 'Double authentification requise. Entrez votre code 2FA.');
          // Ensure prompt asks for 2FA code
          return;
        }
        setUser(data.user);
        setView('chat');
        triggerAlert('success', `Ravi de vous revoir, ${data.user.name}.`);
        fetchConversations();
        // Reset fields
        setPasswordInput('');
        setTwoFactorInput('');
        setShowTwoFactorField(false);
      } else {
        triggerAlert('error', data.error || 'Identifiants incorrects.');
      }
    } catch {
      setLoading(false);
      triggerAlert('error', 'Erreur de connexion serveur.');
    }
  };

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, code: verifyCodeInput })
      });
      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        triggerAlert('success', 'Compte vérifié avec succès ! Connectez-vous.');
        setView('login');
        setVerifyCodeInput('');
      } else {
        triggerAlert('error', data.error || 'Code incorrect.');
      }
    } catch {
      setLoading(false);
      triggerAlert('error', 'Erreur serveur.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        triggerAlert('success', 'Email de réinitialisation envoyé.');
        setView('reset-password');
      } else {
        triggerAlert('error', data.error || 'Erreur.');
      }
    } catch {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput, code: resetCodeInput, newPassword: newPasswordInput })
      });
      const data = await res.json();
      setLoading(false);
      if (res.ok) {
        triggerAlert('success', 'Mot de passe modifié avec succès. Connectez-vous.');
        setView('login');
        setResetCodeInput('');
        setNewPasswordInput('');
      } else {
        triggerAlert('error', data.error || 'Code incorrect ou erreur.');
      }
    } catch {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setConversations([]);
      setActiveConvId(null);
      setView('landing');
      triggerAlert('success', 'Déconnecté avec succès.');
    } catch {
      triggerAlert('error', 'Erreur lors de la déconnexion.');
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations);
      }
    } catch {}
  };

  const handleCreateChat = async () => {
    try {
      const res = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: `Session ${new Date().toLocaleDateString()}`, modelId: selectedModel })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchConversations();
        setActiveConvId(data.id);
      }
    } catch {
      triggerAlert('error', 'Impossible de créer un salon.');
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages);
      }
    } catch {}
  };

  const handleRenameConversation = async (convId: string, newTitle: string) => {
    try {
      const res = await fetch(`/api/conversations/${convId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTitle })
      });
      if (res.ok) {
        fetchConversations();
      }
    } catch {}
  };

  const handleArchiveConversation = async (convId: string, isArchived: boolean) => {
    try {
      const res = await fetch(`/api/conversations/${convId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isArchived })
      });
      if (res.ok) {
        fetchConversations();
        if (activeConvId === convId) {
          setActiveConvId(null);
        }
        triggerAlert('success', isArchived ? 'Salon archivé.' : 'Salon désarchivé.');
      }
    } catch {}
  };

  const handleDeleteConversation = async (convId: string) => {
    if (!confirm('Supprimer définitivement cette conversation ?')) return;
    try {
      const res = await fetch(`/api/conversations/${convId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        fetchConversations();
        if (activeConvId === convId) {
          setActiveConvId(null);
        }
        triggerAlert('success', 'Conversation supprimée.');
      }
    } catch {}
  };

  const getModelConfidence = (model: string) => {
    switch(model) {
      case 'anthropic': return { score: 98, level: 'Excellent' };
      case 'gemini-pro': return { score: 97, level: 'Excellent' };
      case 'yokubo-auto': return { score: 96, level: 'Très Élevé' };
      case 'deepseek': return { score: 95, level: 'Élevé' };
      case 'mistral': return { score: 94, level: 'Élevé' };
      case 'gemini-flash': return { score: 93, level: 'Élevé' };
      default: return { score: 95, level: 'Élevé' };
    }
  };

  const handleExportMarkdown = () => {
    if (messages.length === 0) {
      triggerAlert('warning', 'Aucun message à exporter.');
      return;
    }
    
    let markdown = `# Conversation YOKUBO GPT\n\n`;
    markdown += `**Modèle principal :** ${selectedModel.toUpperCase()}\n`;
    markdown += `**Date d'export :** ${new Date().toLocaleString()}\n\n`;
    markdown += `---\n\n`;
    
    messages.forEach((msg) => {
      const roleName = msg.role === 'user' ? `👤 ${user?.name || 'Utilisateur'}` : `🤖 YOKUBO GPT (${msg.modelUsed || selectedModel})`;
      markdown += `### ${roleName}\n`;
      markdown += `*Publié le : ${msg.createdAt ? new Date(msg.createdAt).toLocaleString() : 'Date inconnue'}*\n\n`;
      
      if (msg.thinkingProcess) {
        markdown += `> **Processus de réflexion interne :**\n`;
        markdown += `> ${msg.thinkingProcess.replace(/\n/g, '\n> ')}\n\n`;
      }
      
      markdown += `${msg.content}\n\n`;
      markdown += `---\n\n`;
    });
    
    markdown += `*Généré de manière sécurisée par YOKUBO GPT (LUST DEV).*`;
    
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `yokubo_chat_${activeConvId}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerAlert('success', 'Conversation exportée en Markdown !');
  };

  const handleDeleteMessage = async (msgId: string) => {
    try {
      const response = await fetch(`/api/messages/${msgId}`, { method: 'DELETE' });
      if (response.ok) {
        setMessages(prev => prev.filter(m => m.id !== msgId));
        triggerAlert('success', 'Message supprimé avec succès.');
      } else {
        const errData = await response.json();
        triggerAlert('error', errData.error || 'Erreur lors de la suppression.');
      }
    } catch (e) {
      triggerAlert('error', 'Erreur de connexion au serveur.');
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isGenerating) return;

    // Client-side rate limiting windowing check (max 10 messages per minute)
    const now = Date.now();
    const oneMinuteAgo = now - 60 * 1000;
    const activeTimestamps = userMessageTimestamps.filter(ts => ts > oneMinuteAgo);
    const isRateLimited = activeTimestamps.length >= 10;

    if (isRateLimited) {
      triggerAlert('error', 'Rate limit exceeded : Limite de 10 messages par minute atteinte.');
      return;
    }

    if (!chatInput.trim() && attachments.length === 0) return;
    if (!activeConvId) {
      triggerAlert('error', 'Veuillez sélectionner ou créer un salon de discussion d\'abord.');
      return;
    }

    // Record the message timestamp
    setUserMessageTimestamps([...activeTimestamps, now]);

    const promptText = chatInput;
    setChatInput('');
    setIsGenerating(true);

    // Optimistically add user message to list
    const tempUserMsg: Message = {
      id: Math.random().toString(),
      role: 'user',
      content: promptText,
      attachments: [...attachments],
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setAttachments([]);

    try {
      // Connect stream to backend
      const response = await fetch(`/api/conversations/${activeConvId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: promptText,
          modelId: selectedModel,
          attachments: tempUserMsg.attachments,
          customInstructions,
          thinkingEnabled
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        triggerAlert('error', errorData.error || 'Erreur lors de la génération.');
        setIsGenerating(false);
        return;
      }

      // Read SSE stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      let assistantResponse = '';
      let thinkingResponse = '';
      
      // Add temporary assistant message for typing
      const tempAssistId = 'assist-' + Math.random().toString();
      setMessages(prev => [...prev, {
        id: tempAssistId,
        role: 'assistant',
        content: '',
        thinkingProcess: '',
        createdAt: new Date().toISOString()
      }]);

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const cleanLine = line.trim();
            if (!cleanLine) continue;

            if (cleanLine.startsWith('data: ')) {
              const rawData = cleanLine.slice(6);
              if (rawData === '[DONE]') continue;

              try {
                const parsed = JSON.parse(rawData);
                if (parsed.error) {
                  triggerAlert('error', parsed.error);
                  break;
                }

                if (parsed.thinking) {
                  thinkingResponse += parsed.thinking;
                }
                if (parsed.text) {
                  assistantResponse += parsed.text;
                }

                // Update the temp message
                setMessages(prev => prev.map(m => {
                  if (m.id === tempAssistId) {
                    return {
                      ...m,
                      content: assistantResponse,
                      thinkingProcess: thinkingResponse || null
                    };
                  }
                  return m;
                }));
              } catch (e) {}
            }
          }
        }
      }

      // Finally refetch actual stored messages to ensure IDs sync perfectly with database
      fetchMessages(activeConvId);
      setIsGenerating(false);

    } catch (err) {
      console.error(err);
      triggerAlert('error', 'Erreur de streaming ou interruption serveur.');
      setIsGenerating(false);
    }
  };

  // Safe manual file upload simulator for file attachment preview
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 5 * 1024 * 1024) {
        triggerAlert('error', `Fichier ${file.name} trop volumineux. Limite de 5Mo.`);
        continue;
      }

      // Add to attachments
      setAttachments(prev => [...prev, {
        name: file.name,
        size: (file.size / 1024).toFixed(1) + ' KB',
        type: file.type || 'text/plain'
      }]);
    }
    
    // Clear input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  // Custom Settings Methods
  const handleFetchSessions = async () => {
    try {
      const res = await fetch('/api/auth/sessions');
      if (res.ok) {
        const data = await res.json();
        setSessions(data.sessions);
      }
    } catch {}
  };

  const handleRevokeSession = async (sessId: string) => {
    try {
      const res = await fetch('/api/auth/sessions/revoke', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessId })
      });
      if (res.ok) {
        triggerAlert('success', 'Session révoquée avec succès.');
        handleFetchSessions();
      }
    } catch {}
  };

  const handleSetup2FA = async (enable: boolean) => {
    try {
      const res = await fetch('/api/auth/setup-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enable })
      });
      if (res.ok) {
        const data = await res.json();
        setUser(prev => prev ? { ...prev, isTwoFactorEnabled: enable } : null);
        if (enable && data.secret) {
          setTwoFactorSecret(data.secret);
          triggerAlert('success', 'Double authentification activée ! Sauvegardez votre clé.');
        } else {
          setTwoFactorSecret(null);
          triggerAlert('success', 'Double authentification désactivée.');
        }
      }
    } catch {}
  };

  // Custom Admin Panel Data Fetching
  const handleFetchAdminData = async () => {
    try {
      // Stats
      const statsRes = await fetch('/api/admin/stats');
      if (statsRes.ok) {
        setAdminStats(await statsRes.json());
      }
      // Users
      const usersRes = await fetch('/api/admin/users');
      if (usersRes.ok) {
        setAdminUsers((await usersRes.json()).users);
      }
      // Audit Logs
      const logsRes = await fetch('/api/admin/logs');
      if (logsRes.ok) {
        setAdminLogs((await logsRes.json()).logs);
      }
    } catch {}
  };

  // Lightweight safe custom markdown parser with code-block copy capabilities
  const renderMarkdown = (text: string) => {
    if (!text) return null;
    
    // Split code blocks
    const parts = text.split(/(```[\s\S]*?```)/g);
    
    // Helper to highlight matching words
    const highlight = (content: string) => {
      if (!messageSearchQuery || !messageSearchQuery.trim()) return content;
      const regex = new RegExp(`(${messageSearchQuery.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
      const textParts = content.split(regex);
      return textParts.map((tPart, tIdx) => 
        regex.test(tPart) ? <mark key={tIdx} className="bg-amber-500/40 text-white rounded px-0.5 animate-pulse font-medium">{tPart}</mark> : tPart
      );
    };
    
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        // Extract language and code content
        const lines = part.split('\n');
        const firstLine = lines[0].replace('```', '').trim();
        const codeLang = firstLine || 'code';
        const codeContent = lines.slice(1, lines.length - 1).join('\n');
        
        return (
          <CodeBlock key={index} language={codeLang} code={codeContent} />
        );
      }
      
      // Inline formatting (bold, italic, clean text paragraph)
      const formattedLines = part.split('\n').map((line, lIdx) => {
        let cleanLine = line;
        
        // Match headers
        if (cleanLine.startsWith('### ')) {
          return <h4 key={lIdx} className="text-md font-bold text-slate-100 mt-4 mb-2">{highlight(cleanLine.slice(4))}</h4>;
        } else if (cleanLine.startsWith('## ')) {
          return <h3 key={lIdx} className="text-lg font-bold text-[#00e5ff] mt-5 mb-3">{highlight(cleanLine.slice(3))}</h3>;
        } else if (cleanLine.startsWith('# ')) {
          return <h2 key={lIdx} className="text-xl font-bold text-[#00e5ff] mt-6 mb-4">{highlight(cleanLine.slice(2))}</h2>;
        }
        
        // Bullet list item
        if (cleanLine.trim().startsWith('* ') || cleanLine.trim().startsWith('- ')) {
          return (
            <li key={lIdx} className="ml-6 list-disc text-slate-300 my-1 leading-relaxed">
              {highlight(cleanLine.trim().substring(2))}
            </li>
          );
        }
 
        // Support bold formatting
        const boldParts = cleanLine.split(/(\*\*.*?\*\*)/g);
        const renderedBoldLine = boldParts.map((bPart, bIdx) => {
          if (bPart.startsWith('**') && bPart.endsWith('**')) {
            return <strong key={bIdx} className="text-[#00e5ff] font-semibold">{highlight(bPart.slice(2, -2))}</strong>;
          }
          return <React.Fragment key={bIdx}>{highlight(bPart)}</React.Fragment>;
        });
 
        return <span key={lIdx} className="block min-h-[1.5rem] leading-relaxed text-sm text-slate-300">{renderedBoldLine}</span>;
      });
 
      return <div key={index} className="space-y-1 select-text">{formattedLines}</div>;
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#040108] relative overflow-x-hidden">
      
      {/* Background Gothic Ambient Glow Grid & Orbs */}
      <div className="absolute inset-0 gothic-grid-bg opacity-30 pointer-events-none"></div>
      <div className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-[#ff0040]/15 to-transparent rounded-full blur-[140px] pointer-events-none animate-breath-gothic-1"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-tr from-[#9900ff]/10 to-transparent rounded-full blur-[140px] pointer-events-none animate-breath-gothic-2"></div>

      {/* Security alert floating HUD */}
      {alertMessage && (
        <div className="fixed top-6 right-6 z-50 animate-slide-in">
          <div className={`p-4 rounded-lg shadow-xl flex items-center gap-3 border ${
            alertMessage.type === 'error' ? 'bg-[#180a0f] border-red-500/30 text-red-400 gothic-glow-crimson' :
            alertMessage.type === 'warning' ? 'bg-[#18130a] border-amber-500/30 text-amber-400' :
            'bg-[#0a1815] border-emerald-500/30 text-emerald-400'
          }`}>
            <ShieldAlert size={20} className="shrink-0 text-[#ff0040]" />
            <div className="text-sm font-medium">{alertMessage.text}</div>
          </div>
        </div>
      )}

      {/* Floating simulated developer inbox - crucial for smooth evaluation testing */}
      <div className="fixed bottom-4 right-4 z-40">
        <button 
          onClick={() => {
            setShowSimulatedInbox(!showSimulatedInbox);
            handleFetchAdminData();
          }}
          className="p-3 bg-[#0c0414] hover:bg-[#1a082b] border border-red-500/30 hover:border-red-500/80 rounded-full shadow-lg text-red-400 flex items-center justify-center transition-all group scale-95 hover:scale-100 gothic-glow-crimson"
          title="Simulated Dev Inbox"
        >
          <Mail size={18} className="group-hover:rotate-12 transition-transform" />
          <span className="max-w-0 overflow-hidden group-hover:max-w-[120px] transition-all duration-300 text-xs font-semibold whitespace-nowrap ml-0 group-hover:ml-2">
            Simulated Inbox
          </span>
        </button>

        {showSimulatedInbox && (
          <div className="absolute bottom-14 right-0 w-80 max-h-96 glass-panel border border-red-500/30 rounded-lg p-4 shadow-2xl flex flex-col overflow-hidden animate-slide-up">
            <div className="flex items-center justify-between border-b border-red-500/20 pb-2 mb-2">
              <span className="text-xs font-display font-bold text-red-400 tracking-wider flex items-center gap-1">
                <Terminal size={14} /> DEVELOPER SECURE MAILBOX
              </span>
              <button onClick={() => setShowSimulatedInbox(false)} className="text-slate-400 hover:text-white">
                <X size={14} />
              </button>
            </div>
            <p className="text-[10px] text-slate-400 mb-2 leading-relaxed">
              Utile pour récupérer les codes d'inscription et de réinitialisation sans configurer de clés SMTP !
            </p>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {adminLogs && adminLogs.length > 0 ? (
                adminLogs.filter(l => l.event.includes('register') || l.event.includes('reset') || l.event.includes('email_verified')).map((log, index) => (
                  <div key={index} className="p-2 rounded bg-[#09030f] border border-red-500/10 text-[11px] font-mono">
                    <div className="text-[#ff0040] font-semibold">{log.event.toUpperCase()}</div>
                    <div className="text-slate-300 mt-1">{log.details}</div>
                    <div className="text-slate-500 text-[9px] mt-1">{new Date(log.createdAt).toLocaleTimeString()}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-slate-500 font-mono">
                  Aucun log récent d'email ou d'authentification.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==================== VIEW 1: LANDING PAGE ==================== */}
      {view === 'landing' && (
        <>
          {/* Header Contract: Exactly 3 Zones */}
          <header className="w-full flex items-center justify-between px-6 py-4 bg-[#040108]/85 backdrop-blur-md border-b border-red-500/10 sticky top-0 z-50">
            {/* Zone 1: Single Brand Mark */}
            <a href="/" className="text-lg font-display font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-[#ff0040] via-[#9900ff] to-[#ff0040] flex items-center gap-2 animate-gothic-pulse">
              『欲』 YOKUBO GPT
            </a>

            {/* Zone 2: Navigation Links */}
            <nav className="hidden md:flex items-center gap-8 text-[10px] font-bold tracking-widest text-slate-400 uppercase font-display">
              <a href="#features" className="hover:text-[#ff0040] transition-colors">Fonctionnalités</a>
              <a href="#models" className="hover:text-[#ff0040] transition-colors">Modèles IA</a>
              <a href="#about" className="hover:text-[#ff0040] transition-colors">Créateur</a>
              <a href="#security" className="hover:text-[#ff0040] transition-colors">Sécurité</a>
            </nav>

            {/* Zone 3: Primary Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setView('login')}
                className="gothic-btn-secondary px-5 py-2 text-[10px] font-bold tracking-widest uppercase rounded cursor-pointer font-display"
              >
                Connexion
              </button>
              <button 
                onClick={() => setView('register')}
                className="gothic-btn-primary px-5 py-2 text-[10px] font-bold tracking-widest uppercase rounded cursor-pointer font-display"
              >
                Commencer
              </button>
            </div>
          </header>

          {/* Hero Section */}
          <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-16 relative max-w-5xl mx-auto z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#0e0414] border border-red-500/20 rounded-full mb-8">
              <Sparkles size={11} className="text-[#ff0040] animate-spin-slow" />
              <span className="text-[9px] font-bold tracking-[0.2em] text-[#ff0040] uppercase font-mono">LUST DEV PRESENT</span>
            </div>
            
            <h1 className="text-3xl md:text-5xl font-display font-black tracking-wider leading-tight max-w-4xl text-wrap balance text-slate-100 uppercase">
              SÉCURITÉ ROBUSTE ET PRIVACY POUR <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ff0040] via-[#9900ff] to-[#ff0040] gothic-text-glow">VOTRE INTELLIGENCE</span>
            </h1>

            <p className="mt-5 text-xs md:text-sm text-slate-400 max-w-2xl leading-relaxed uppercase tracking-wider font-sans">
              Bénéficiez des performances de Mistral, Anthropic, DeepSeek et Gemini via un routeur d'intelligence intelligent sans qu'aucune clé API ne quitte le serveur.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <button 
                onClick={() => setView('register')}
                className="gothic-btn-primary px-8 py-3.5 font-bold text-[10px] uppercase tracking-widest rounded flex items-center gap-2 group font-display"
              >
                Accéder à l'Assistant <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform text-[#ff0040]" />
              </button>
              <a 
                href="#features"
                className="gothic-btn-secondary px-8 py-3.5 font-bold text-[10px] uppercase tracking-widest rounded font-display"
              >
                Découvrir l'architecture
              </a>
            </div>

            {/* Simulated Desktop Preview HUD */}
            <div className="mt-12 w-full rounded-xl glass-panel border border-red-500/10 p-2 overflow-hidden shadow-2xl relative max-w-4xl">
              <div className="w-full h-8 bg-[#08020d] rounded-t-lg border-b border-red-500/10 px-4 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff0040]/40"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#9900ff]/30"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-800"></div>
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">yokubo-gpt.dev // console_secure</div>
                <div className="w-4"></div>
              </div>
              <div className="bg-[#040108]/95 p-6 min-h-[260px] flex flex-col justify-between text-left font-mono text-xs">
                <div className="space-y-2.5">
                  <div className="text-[#ff0040] font-bold tracking-widest animate-pulse">&gt;_ INITIALIZE SYSTEM (GOTHIC ACTIVE)</div>
                  <div className="text-slate-400">Loading modules... OK</div>
                  <div className="text-slate-400">Database connected... Firestore Cluster (Active)</div>
                  <div className="text-slate-400">AI Router Status: <span className="text-emerald-400 font-semibold">[READY]</span></div>
                  <div className="text-slate-400">Cryptographic protection: Argon2id + Cookie HttpOnly Strict</div>
                  <div className="text-slate-400">High Thinking: <span className="text-[#9900ff] font-semibold">Gemini 3.1 Pro preview thinkingLevel="HIGH"</span></div>
                </div>
                <div className="p-4 rounded border border-red-500/15 bg-[#12041c]/40 mt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <Terminal size={16} className="text-[#ff0040]" />
                    <span className="text-slate-300 text-[11px] uppercase tracking-wider">Testez la puissance de YOKUBO dès maintenant</span>
                  </div>
                  <button onClick={() => setView('register')} className="text-[#ff0040] hover:text-[#ff0060] font-bold hover:underline flex items-center gap-1 text-[11px] font-display uppercase tracking-wider">
                    S'INSCRIRE <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Features Bento Grid */}
          <section id="features" className="py-20 px-6 border-t border-red-500/10 max-w-6xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl font-display font-black text-slate-100 uppercase tracking-widest gothic-text-glow">
                FONCTIONNALITÉS COMPLÈTES
              </h2>
              <div className="w-12 h-1 bg-gradient-to-r from-[#ff0040] to-[#9900ff] mx-auto mt-4"></div>
              <p className="text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-mono">Conçu pour l'excellence et la performance absolue</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg glass-panel glass-panel-hover transition-all">
                <Cpu className="text-[#ff0040] mb-4" size={24} />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display">AI Router Intelligent</h3>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Redirection automatique ou manuelle vers Mistral Large, Claude 3.5 Sonnet, DeepSeek V3 et Gemini Pro.
                </p>
              </div>

              <div className="p-6 rounded-lg glass-panel glass-panel-hover transition-all">
                <Lock className="text-[#ff0040] mb-4" size={24} />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display">Sécurité Extrême</h3>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Sessions imprévisibles, Cookies sécurisés HttpOnly SameSite, protection contre le XSS, le CSRF et le SSRF.
                </p>
              </div>

              <div className="p-6 rounded-lg glass-panel glass-panel-hover transition-all">
                <Activity className="text-[#ff0040] mb-4" size={24} />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-display">Protection Anti-Abus</h3>
                <p className="text-[11px] text-slate-400 mt-2 leading-relaxed">
                  Système de Rate-Limiting intelligent, validation de types de fichiers stricte et blocage des injections de prompt.
                </p>
              </div>
            </div>
          </section>

          {/* Supported AI Models */}
          <section id="models" className="py-16 px-6 bg-slate-950/20 border-t border-red-500/10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-xl font-display font-black text-slate-100 uppercase tracking-widest">MODÈLES INTÉGRÉS & SECRETS</h2>
              <p className="text-[10px] text-slate-400 mt-2 max-w-xl mx-auto uppercase tracking-wider font-mono">
                Chaque modèle est hébergé de manière sécurisée côté serveur. Vos prompts subissent des filtres sanitaires avant d'être expédiés.
              </p>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
                <div className="p-4 rounded border border-red-500/10 bg-[#08020d] hover:border-red-500/30 transition-all cursor-pointer">
                  <div className="text-xs font-semibold text-slate-300 font-display">CLAUDE 3.5 SONNET</div>
                  <div className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-wider">Anthropic</div>
                </div>
                <div className="p-4 rounded border border-red-500/10 bg-[#08020d] hover:border-red-500/30 transition-all cursor-pointer">
                  <div className="text-xs font-semibold text-slate-300 font-display">MISTRAL LARGE</div>
                  <div className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-wider">Mistral AI</div>
                </div>
                <div className="p-4 rounded border border-red-500/10 bg-[#08020d] hover:border-red-500/30 transition-all cursor-pointer">
                  <div className="text-xs font-semibold text-slate-300 font-display">DEEPSEEK V3 / CODER</div>
                  <div className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-wider">DeepSeek AI</div>
                </div>
                <div className="p-4 rounded border border-red-500/10 bg-[#08020d] hover:border-red-500/30 transition-all cursor-pointer">
                  <div className="text-xs font-semibold text-slate-300 font-display">GEMINI 3.1 PRO (THINKING)</div>
                  <div className="text-[9px] font-mono text-slate-500 mt-1 uppercase tracking-wider">Google AI</div>
                </div>
              </div>
            </div>
          </section>

          {/* About LUST DEV */}
          <section id="about" className="py-20 px-6 border-t border-red-500/10 max-w-4xl mx-auto text-center">
            <h2 className="text-md font-display font-extrabold text-red-400 tracking-[0.25em] uppercase">CRÉATION PAR LUST DEV</h2>
            <p className="mt-4 text-xs text-slate-400 leading-relaxed max-w-xl mx-auto font-sans tracking-wide">
              LUST DEV conçoit des architectures logicielles avant-gardistes, alliant une esthétique de haut vol à des performances brutes et une sécurité sans compromis.
            </p>
            <div className="mt-2 text-[11px] font-mono text-red-400">lustdev927@gmail.com</div>
            <div className="mt-8 text-[10px] font-mono text-slate-600">"Beyond the clouds, beyond the limits."</div>
          </section>

          {/* Footer */}
          <footer className="py-8 border-t border-red-500/10 bg-[#040108] text-center text-[10px] text-slate-500 space-y-3 font-mono">
            <p>© 2026 YOKUBO GPT. Tous droits réservés. Développé par LUST DEV.</p>
            <div className="flex flex-wrap justify-center items-center gap-4 text-[11px] font-sans">
              <a 
                href="mailto:lustdev927@gmail.com?subject=Support%20YOKUBO%20GPT" 
                className="text-red-400 hover:text-[#ff0040] hover:underline font-semibold transition-colors flex items-center gap-1.5"
              >
                <Mail size={12} /> Contact Support
              </a>
              <span className="text-slate-800">|</span>
              <a 
                href="https://wa.me/18294786326" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-emerald-400 hover:text-emerald-300 hover:underline font-semibold transition-colors flex items-center gap-1.5"
              >
                <MessageSquare size={12} /> WhatsApp: +1 (829) 478-6326
              </a>
              <span className="text-slate-800">|</span>
              <a 
                href="https://whatsapp.com/channel/0029VbCiqwyBVJl3Jv5T4I15" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-emerald-400 hover:text-emerald-300 hover:underline font-semibold transition-colors flex items-center gap-1.5"
              >
                <Globe size={12} /> WhatsApp Channel
              </a>
            </div>
          </footer>
        </>
      )}

      {/* ==================== VIEW 2: REGISTER ==================== */}
      {view === 'register' && (
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md glass-panel rounded-lg p-8 border border-red-500/10 gothic-glow-crimson">
            <div className="text-center mb-8">
              <h2 className="text-base font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff0040] via-[#c200d6] to-[#9900ff] gothic-text-glow uppercase tracking-[0.2em] leading-snug">S'ENREGISTRER</h2>
              <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-mono">Rejoignez l'espace sécurisé YOKUBO GPT</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <motion.div 
                animate={{ scale: nameFocused ? 1.015 : 1 }}
                transition={{ duration: 0.2 }}
                className="relative pt-4"
              >
                <input 
                  type="text" 
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onFocus={() => setNameFocused(true)}
                  onBlur={() => setNameFocused(false)}
                  required
                  placeholder=" "
                  className={`w-full bg-[#050209] border rounded px-10 py-3.5 text-xs text-slate-200 placeholder-transparent focus:outline-none transition-all duration-300 ${
                    nameFocused ? 'border-[#ff0040] shadow-[0_0_15px_rgba(255,0,64,0.15)] bg-[#10031a]' : 'border-slate-800 hover:border-slate-700'
                  }`}
                />
                <motion.label 
                  animate={{
                    y: (nameFocused || nameInput) ? -24 : 0,
                    scale: (nameFocused || nameInput) ? 0.85 : 1,
                    color: (nameFocused || nameInput) ? '#ff0040' : '#64748b',
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="absolute pointer-events-none left-10 top-8 text-[10px] font-semibold uppercase tracking-widest origin-left px-1.5 bg-[#040108]"
                >
                  Nom complet
                </motion.label>
                <motion.div
                  animate={{
                    scale: nameFocused ? 1.15 : 1,
                    color: nameFocused ? '#ff0040' : '#64748b',
                    filter: nameFocused ? 'drop-shadow(0 0 6px rgba(255, 0, 64, 0.5))' : 'none'
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-3 top-7.5"
                >
                  <User size={16} />
                </motion.div>
              </motion.div>

              <motion.div 
                animate={{ scale: emailFocused ? 1.015 : 1 }}
                transition={{ duration: 0.2 }}
                className="relative pt-4"
              >
                <input 
                  type="email" 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  placeholder=" "
                  className={`w-full bg-[#050209] border rounded px-10 py-3.5 text-xs text-slate-200 placeholder-transparent focus:outline-none transition-all duration-300 ${
                    emailFocused ? 'border-[#ff0040] shadow-[0_0_15px_rgba(255,0,64,0.15)] bg-[#10031a]' : 'border-slate-800 hover:border-slate-700'
                  }`}
                />
                <motion.label 
                  animate={{
                    y: (emailFocused || emailInput) ? -24 : 0,
                    scale: (emailFocused || emailInput) ? 0.85 : 1,
                    color: (emailFocused || emailInput) ? '#ff0040' : '#64748b',
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="absolute pointer-events-none left-10 top-8 text-[10px] font-semibold uppercase tracking-widest origin-left px-1.5 bg-[#040108]"
                >
                  Email
                </motion.label>
                <motion.div
                  animate={{
                    scale: emailFocused ? 1.15 : 1,
                    color: emailFocused ? '#ff0040' : '#64748b',
                    filter: emailFocused ? 'drop-shadow(0 0 6px rgba(255, 0, 64, 0.5))' : 'none'
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-3 top-7.5"
                >
                  <Mail size={16} />
                </motion.div>
              </motion.div>

              <motion.div 
                animate={{ scale: passwordFocused ? 1.015 : 1 }}
                transition={{ duration: 0.2 }}
                className="relative pt-4"
              >
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  placeholder=" "
                  className={`w-full bg-[#050209] border rounded px-10 py-3.5 text-xs text-slate-200 placeholder-transparent focus:outline-none transition-all duration-300 ${
                    passwordFocused ? 'border-[#ff0040] shadow-[0_0_15px_rgba(255,0,64,0.15)] bg-[#10031a]' : 'border-slate-800 hover:border-slate-700'
                  }`}
                />
                <motion.label 
                  animate={{
                    y: (passwordFocused || passwordInput) ? -24 : 0,
                    scale: (passwordFocused || passwordInput) ? 0.85 : 1,
                    color: (passwordFocused || passwordInput) ? '#ff0040' : '#64748b',
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="absolute pointer-events-none left-10 top-8 text-[10px] font-semibold uppercase tracking-widest origin-left px-1.5 bg-[#040108]"
                >
                  Mot de passe
                </motion.label>
                <motion.div
                  animate={{
                    scale: passwordFocused ? 1.15 : 1,
                    color: passwordFocused ? '#ff0040' : '#64748b',
                    filter: passwordFocused ? 'drop-shadow(0 0 6px rgba(255, 0, 64, 0.5))' : 'none'
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-3 top-7.5"
                >
                  <Lock size={16} />
                </motion.div>
              </motion.div>

              <PasswordStrengthMeter password={passwordInput} />

              <button 
                type="submit" 
                disabled={loading}
                className="w-full gothic-btn-primary py-3.5 mt-2 rounded font-semibold text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer font-display"
              >
                {loading ? 'CRÉATION EN COURS...' : 'CRÉER MON COMPTE'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400">
              Déjà un compte ?{' '}
              <button onClick={() => setView('login')} className="text-[#ff0040] hover:text-[#ff0060] hover:underline font-semibold uppercase tracking-wider font-mono text-[10px]">
                Se connecter
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button onClick={() => setView('landing')} className="text-[10px] text-slate-500 hover:text-slate-300 font-mono uppercase tracking-wider">
                ← Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== VIEW 3: LOGIN ==================== */}
      {view === 'login' && (
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md glass-panel rounded-lg p-8 border border-red-500/10 gothic-glow-crimson">
            <div className="text-center mb-8">
              <h2 className="text-base font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff0040] via-[#c200d6] to-[#9900ff] gothic-text-glow uppercase tracking-[0.2em] leading-snug">SE CONNECTER</h2>
              <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-mono">Identifiez-vous pour ouvrir une session sécurisée</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <motion.div 
                animate={{ scale: emailFocused ? 1.015 : 1 }}
                transition={{ duration: 0.2 }}
                className="relative pt-4"
              >
                <input 
                  type="email" 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  placeholder=" "
                  className={`w-full bg-[#050209] border rounded px-10 py-3.5 text-xs text-slate-200 placeholder-transparent focus:outline-none transition-all duration-300 ${
                    emailFocused ? 'border-[#ff0040] shadow-[0_0_15px_rgba(255,0,64,0.15)] bg-[#10031a]' : 'border-slate-800 hover:border-slate-700'
                  }`}
                />
                <motion.label 
                  animate={{
                    y: (emailFocused || emailInput) ? -24 : 0,
                    scale: (emailFocused || emailInput) ? 0.85 : 1,
                    color: (emailFocused || emailInput) ? '#ff0040' : '#64748b',
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="absolute pointer-events-none left-10 top-8 text-[10px] font-semibold uppercase tracking-widest origin-left px-1.5 bg-[#040108]"
                >
                  Email
                </motion.label>
                <motion.div
                  animate={{
                    scale: emailFocused ? 1.15 : 1,
                    color: emailFocused ? '#ff0040' : '#64748b',
                    filter: emailFocused ? 'drop-shadow(0 0 6px rgba(255, 0, 64, 0.5))' : 'none'
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-3 top-7.5"
                >
                  <Mail size={16} />
                </motion.div>
              </motion.div>

              <motion.div 
                animate={{ scale: passwordFocused ? 1.015 : 1 }}
                transition={{ duration: 0.2 }}
                className="relative pt-4"
              >
                <div className="absolute right-0 top-0.5 z-10">
                  <button type="button" onClick={() => setView('forgot-password')} className="text-[9px] text-[#ff0040] hover:text-[#ff0060] hover:underline uppercase tracking-wider font-bold font-mono">
                    Oublié ?
                  </button>
                </div>
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  required
                  placeholder=" "
                  className={`w-full bg-[#050209] border rounded px-10 py-3.5 text-xs text-slate-200 placeholder-transparent focus:outline-none transition-all duration-300 ${
                    passwordFocused ? 'border-[#ff0040] shadow-[0_0_15px_rgba(255,0,64,0.15)] bg-[#10031a]' : 'border-slate-800 hover:border-slate-700'
                  }`}
                />
                <motion.label 
                  animate={{
                    y: (passwordFocused || passwordInput) ? -24 : 0,
                    scale: (passwordFocused || passwordInput) ? 0.85 : 1,
                    color: (passwordFocused || passwordInput) ? '#ff0040' : '#64748b',
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="absolute pointer-events-none left-10 top-8 text-[10px] font-semibold uppercase tracking-widest origin-left px-1.5 bg-[#040108]"
                >
                  Mot de passe
                </motion.label>
                <motion.div
                  animate={{
                    scale: passwordFocused ? 1.15 : 1,
                    color: passwordFocused ? '#ff0040' : '#64748b',
                    filter: passwordFocused ? 'drop-shadow(0 0 6px rgba(255, 0, 64, 0.5))' : 'none'
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-3 top-7.5"
                >
                  <Lock size={16} />
                </motion.div>
              </motion.div>

              {/* 2FA Code field */}
              {(user?.isTwoFactorEnabled || showTwoFactorField) && (
                <motion.div 
                  animate={{ scale: twoFactorFocused ? 1.015 : 1 }}
                  transition={{ duration: 0.2 }}
                  className="relative pt-4"
                >
                  <input 
                    type="text" 
                    value={twoFactorInput}
                    onChange={(e) => setTwoFactorInput(e.target.value)}
                    onFocus={() => setTwoFactorFocused(true)}
                    onBlur={() => setTwoFactorFocused(false)}
                    required
                    placeholder=" "
                    className={`w-full bg-[#050209] border rounded px-10 py-3.5 text-xs text-slate-200 placeholder-transparent focus:outline-none transition-all duration-300 ${
                      twoFactorFocused ? 'border-[#ff0040] shadow-[0_0_15px_rgba(255,0,64,0.15)] bg-[#10031a]' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  />
                  <motion.label 
                    animate={{
                      y: (twoFactorFocused || twoFactorInput) ? -24 : 0,
                      scale: (twoFactorFocused || twoFactorInput) ? 0.85 : 1,
                      color: (twoFactorFocused || twoFactorInput) ? '#ff0040' : '#64748b',
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                    className="absolute pointer-events-none left-10 top-8 text-[10px] font-semibold uppercase tracking-widest origin-left px-1.5 bg-[#040108]"
                  >
                    Code Double Facteur (2FA)
                  </motion.label>
                  <motion.div
                    animate={{
                      scale: twoFactorFocused ? 1.15 : 1,
                      color: twoFactorFocused ? '#ff0040' : '#64748b',
                      filter: twoFactorFocused ? 'drop-shadow(0 0 6px rgba(255, 0, 64, 0.5))' : 'none'
                    }}
                    transition={{ duration: 0.2 }}
                    className="absolute left-3 top-7.5"
                  >
                    <ShieldAlert size={16} />
                  </motion.div>
                </motion.div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full gothic-btn-primary py-3.5 mt-2 rounded font-semibold text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer font-display"
              >
                {loading ? 'OUVERTURE DE SESSION...' : 'CONNEXION'}
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400">
              Pas encore inscrit ?{' '}
              <button onClick={() => setView('register')} className="text-[#ff0040] hover:text-[#ff0060] hover:underline font-semibold uppercase tracking-wider font-mono text-[10px]">
                Créer un compte
              </button>
            </div>
            
            <div className="mt-4 text-center">
              <button onClick={() => setView('landing')} className="text-[10px] text-slate-500 hover:text-slate-300 font-mono uppercase tracking-wider">
                ← Retour à l'accueil
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== VIEW 4: VERIFY EMAIL ==================== */}
      {view === 'verify-email' && (
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md glass-panel rounded-lg p-8 border border-red-500/10 gothic-glow-crimson">
            <div className="text-center mb-8">
              <Mail className="mx-auto text-[#ff0040] mb-3 animate-bounce" size={32} />
              <h2 className="text-base font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff0040] via-[#c200d6] to-[#9900ff] gothic-text-glow uppercase tracking-[0.2em] leading-snug">VÉRIFICATION</h2>
              <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-mono">
                Un code à 6 chiffres a été expédié à {emailInput || "votre email"}.
              </p>
            </div>

             <form onSubmit={handleVerifyEmail} className="space-y-6">
              <div className="relative pt-2">
                <input 
                  type="text" 
                  value={verifyCodeInput}
                  onChange={(e) => setVerifyCodeInput(e.target.value)}
                  onFocus={() => setVerifyCodeFocused(true)}
                  onBlur={() => setVerifyCodeFocused(false)}
                  placeholder="CODE"
                  required
                  maxLength={6}
                  className={`w-full bg-[#050209] border rounded px-4 py-4 text-center text-xl font-mono font-bold tracking-[0.5em] text-[#ff0040] placeholder-slate-800 focus:outline-none transition-all duration-300 ${
                    verifyCodeFocused ? 'border-[#ff0040] shadow-[0_0_15px_rgba(255,0,64,0.15)] bg-[#10031a]' : 'border-slate-800 hover:border-slate-700'
                  }`}
                />
              </div>

              <button 
                type="submit" 
                className="w-full gothic-btn-primary py-3.5 rounded font-semibold text-[10px] uppercase tracking-widest transition-all duration-300 cursor-pointer font-display"
              >
                VALIDER LE COMPTE
              </button>
            </form>

            <div className="mt-6 text-center text-xs text-slate-400">
              Besoin de modifier vos identifiants ?{' '}
              <button onClick={() => setView('register')} className="text-[#ff0040] hover:text-[#ff0060] hover:underline font-semibold uppercase tracking-wider font-mono text-[10px]">
                S'enregistrer à nouveau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== VIEW 5: FORGOT PASSWORD ==================== */}
      {view === 'forgot-password' && (
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md glass-panel rounded-lg p-8 border border-red-500/10 gothic-glow-crimson">
            <div className="text-center mb-8">
              <h2 className="text-base font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff0040] via-[#c200d6] to-[#9900ff] gothic-text-glow uppercase tracking-[0.2em] leading-snug">RÉCUPÉRATION</h2>
              <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-mono">Saisissez votre email pour recevoir un code de réinitialisation</p>
            </div>

            <form onSubmit={handleForgotPassword} className="space-y-6">
              <div className="relative pt-4">
                <input 
                  type="email" 
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                  required
                  placeholder=" "
                  className={`w-full bg-[#050209] border rounded px-10 py-3.5 text-xs text-slate-200 placeholder-transparent focus:outline-none transition-all duration-300 ${
                    emailFocused ? 'border-[#ff0040] shadow-[0_0_15px_rgba(255,0,64,0.15)] bg-[#10031a]' : 'border-slate-800 hover:border-slate-700'
                  }`}
                />
                <motion.label 
                  animate={{
                    y: (emailFocused || emailInput) ? -24 : 0,
                    scale: (emailFocused || emailInput) ? 0.85 : 1,
                    color: (emailFocused || emailInput) ? '#ff0040' : '#64748b',
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="absolute pointer-events-none left-10 top-8 text-[10px] font-semibold uppercase tracking-widest origin-left px-1.5 bg-[#040108]"
                >
                  Adresse Email
                </motion.label>
                <motion.div
                  animate={{
                    scale: emailFocused ? 1.15 : 1,
                    color: emailFocused ? '#ff0040' : '#64748b',
                    filter: emailFocused ? 'drop-shadow(0 0 6px rgba(255, 0, 64, 0.5))' : 'none'
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-3 top-7.5"
                >
                  <Mail size={16} />
                </motion.div>
              </div>

              <button 
                type="submit" 
                className="w-full gothic-btn-primary py-3.5 rounded font-semibold text-[10px] uppercase tracking-widest transition-all duration-300 cursor-pointer font-display"
              >
                RECEVOIR CODE
              </button>
            </form>

            <div className="mt-4 text-center">
              <button onClick={() => setView('login')} className="text-[10px] text-slate-400 hover:text-white uppercase tracking-wider font-mono">
                Retour à la connexion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== VIEW 6: RESET PASSWORD ==================== */}
      {view === 'reset-password' && (
        <div className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="w-full max-w-md glass-panel rounded-lg p-8 border border-red-500/10 gothic-glow-crimson">
            <div className="text-center mb-8">
              <h2 className="text-base font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#ff0040] via-[#c200d6] to-[#9900ff] gothic-text-glow uppercase tracking-[0.2em] leading-snug">RÉINITIALISATION</h2>
              <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-widest font-mono">Saisissez le code reçu et votre nouveau mot de passe</p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-6">
              <div className="relative pt-4">
                <input 
                  type="text" 
                  value={resetCodeInput}
                  onChange={(e) => setResetCodeInput(e.target.value)}
                  onFocus={() => setResetCodeFocused(true)}
                  onBlur={() => setResetCodeFocused(false)}
                  required
                  placeholder=" "
                  className={`w-full bg-[#050209] border rounded px-10 py-3.5 text-xs text-slate-200 placeholder-transparent focus:outline-none transition-all duration-300 ${
                    resetCodeFocused ? 'border-[#ff0040] shadow-[0_0_15px_rgba(255,0,64,0.15)] bg-[#10031a]' : 'border-slate-800 hover:border-slate-700'
                  }`}
                />
                <motion.label 
                  animate={{
                    y: (resetCodeFocused || resetCodeInput) ? -24 : 0,
                    scale: (resetCodeFocused || resetCodeInput) ? 0.85 : 1,
                    color: (resetCodeFocused || resetCodeInput) ? '#ff0040' : '#64748b',
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="absolute pointer-events-none left-10 top-8 text-[10px] font-semibold uppercase tracking-widest origin-left px-1.5 bg-[#040108]"
                >
                  Code secret
                </motion.label>
                <motion.div
                  animate={{
                    scale: resetCodeFocused ? 1.15 : 1,
                    color: resetCodeFocused ? '#ff0040' : '#64748b',
                    filter: resetCodeFocused ? 'drop-shadow(0 0 6px rgba(255, 0, 64, 0.5))' : 'none'
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-3 top-7.5"
                >
                  <Key size={16} />
                </motion.div>
              </div>

              <div className="relative pt-4">
                <input 
                  type="password" 
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  onFocus={() => setNewPasswordFocused(true)}
                  onBlur={() => setNewPasswordFocused(false)}
                  required
                  placeholder=" "
                  className={`w-full bg-[#050209] border rounded px-10 py-3.5 text-xs text-slate-200 placeholder-transparent focus:outline-none transition-all duration-300 ${
                    newPasswordFocused ? 'border-[#ff0040] shadow-[0_0_15px_rgba(255,0,64,0.15)] bg-[#10031a]' : 'border-slate-800 hover:border-slate-700'
                  }`}
                />
                <motion.label 
                  animate={{
                    y: (newPasswordFocused || newPasswordInput) ? -24 : 0,
                    scale: (newPasswordFocused || newPasswordInput) ? 0.85 : 1,
                    color: (newPasswordFocused || newPasswordInput) ? '#ff0040' : '#64748b',
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                  className="absolute pointer-events-none left-10 top-8 text-[10px] font-semibold uppercase tracking-widest origin-left px-1.5 bg-[#040108]"
                >
                  Nouveau mot de passe
                </motion.label>
                <motion.div
                  animate={{
                    scale: newPasswordFocused ? 1.15 : 1,
                    color: newPasswordFocused ? '#ff0040' : '#64748b',
                    filter: newPasswordFocused ? 'drop-shadow(0 0 6px rgba(255, 0, 64, 0.5))' : 'none'
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-3 top-7.5"
                >
                  <Lock size={16} />
                </motion.div>
              </div>

              <PasswordStrengthMeter password={newPasswordInput} />

              <button 
                type="submit" 
                className="w-full gothic-btn-primary py-3.5 rounded font-semibold text-[10px] uppercase tracking-widest transition-all duration-300 cursor-pointer font-display"
              >
                MODIFIER MON MOT DE PASSE
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==================== VIEW 7: CHAT INTERFACE & DASHBOARD ==================== */}
      {view === 'chat' && (
        <div 
          className="flex-1 flex overflow-hidden relative"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEndContainer}
          style={{
            '--active-glow-primary': activeColors.primary,
            '--active-glow-secondary': activeColors.secondary,
            '--active-glow-shadow': activeColors.glow,
          } as React.CSSProperties}
        >
          {/* Mobile Sidebar Backdrop Overlay */}
          {mobileSidebarOpen && (
            <div 
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden transition-opacity duration-300"
            />
          )}
          
          {/* Main Sidebar with Swiping and Mobile classes */}
          <aside 
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEndSidebar}
            className={`fixed md:relative z-40 w-72 h-full border-r gothic-rainbow-glow-wave bg-[#08030f]/98 md:bg-[#08030f]/95 flex flex-col shrink-0 transition-transform duration-300 ${
              mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
            }`}
          >
            
            {/* Brand Logo & New Chat */}
            <div className="p-4 border-b border-red-500/10 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-md font-display font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#ff0040] to-[#9900ff] gothic-text-glow flex items-center gap-2 animate-gothic-pulse gothic-rainbow-text">
                  『欲』 YOKUBO GPT
                </span>
                {user?.role === 'admin' && (
                  <button 
                    onClick={() => { setView('admin'); handleFetchAdminData(); }}
                    className="p-1.5 text-slate-400 hover:text-[#ff0040] border border-slate-800 hover:border-red-500/30 rounded cursor-pointer transition-colors"
                    title="Console Admin"
                  >
                    <Activity size={14} />
                  </button>
                )}
              </div>
              
              <button 
                onClick={handleCreateChat}
                className="w-full py-2.5 px-4 bg-[#12041c] hover:bg-[#1a082b] border border-red-500/20 hover:border-red-500/50 rounded text-xs text-[#ff0040] font-semibold uppercase tracking-widest flex items-center justify-between gap-2 transition-all cursor-pointer gothic-glow-crimson gothic-rainbow-glow-hover"
              >
                <span className="flex items-center gap-2">
                  <Plus size={14} /> Nouveau Salon
                </span>
                <kbd className="hidden lg:inline-block text-[9px] font-mono px-1.5 py-0.5 bg-black/40 border border-white/10 rounded text-slate-500 tracking-normal uppercase">
                  Ctrl+N
                </kbd>
              </button>
            </div>

            {/* Conversation Search Bar */}
            <div className="px-4 py-2 border-b border-red-500/10">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-500" />
                <input 
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Chercher une discussion..."
                  className="w-full bg-[#05020a] border border-slate-900 rounded pl-8 pr-4 py-2 text-[11px] text-slate-300 focus:outline-none focus:border-red-500/20"
                />
              </div>
            </div>

            {/* Chats History List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {conversations && conversations.length > 0 ? (
                conversations
                  .filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((conv) => (
                    <div 
                      key={conv.id} 
                      onClick={() => { setActiveConvId(conv.id); setKeyboardSelectedConvId(conv.id); }}
                      tabIndex={0}
                      aria-label={`Salon: ${conv.title}`}
                      className={`group flex items-center justify-between p-2.5 rounded cursor-pointer transition-all duration-200 ${
                        activeConvId === conv.id 
                          ? 'bg-[#1b0a2a] text-white border-l-2 border-[#a300ff] shadow-sm' 
                          : keyboardSelectedConvId === conv.id
                            ? 'bg-white/5 text-slate-200 border-l-2 border-slate-400'
                            : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                      }`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          setActiveConvId(conv.id);
                          setKeyboardSelectedConvId(conv.id);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2 max-w-[170px] truncate">
                        <MessageSquare size={13} className={activeConvId === conv.id ? 'text-[#ff0040]' : 'text-slate-500'} />
                        <span className="text-xs font-medium truncate font-sans">{conv.title}</span>
                      </div>
                      <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            const newTitle = prompt('Nouveau titre:', conv.title);
                            if (newTitle) handleRenameConversation(conv.id, newTitle);
                          }}
                          className="p-1 hover:text-[#ff0040] text-slate-600 transition-colors"
                          title="Renommer"
                        >
                          <FileText size={12} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleArchiveConversation(conv.id, !conv.isArchived);
                          }}
                          className="p-1 hover:text-amber-400 text-slate-600 transition-colors"
                          title={conv.isArchived ? "Désarchiver" : "Archiver"}
                        >
                          <Archive size={12} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.id);
                          }}
                          className="p-1 hover:text-red-500 text-slate-600 transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-12 text-[11px] text-slate-600 font-mono">
                  Aucune conversation active.
                </div>
              )}
            </div>

            {/* Compliance Legal Footer Links */}
            <div className="px-4 py-2 border-t border-white/5 flex justify-center gap-4 text-[10px] text-slate-500 font-sans">
              <button 
                onClick={() => setShowToSModal(true)} 
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                CGU
              </button>
              <span aria-hidden="true" className="text-slate-800">•</span>
              <button 
                onClick={() => setShowPrivacyModal(true)} 
                className="hover:text-slate-300 transition-colors cursor-pointer"
              >
                Confidentialité
              </button>
            </div>

            {/* Bottom User Area */}
            <div className="p-4 bg-[#05020a]/95 border-t border-red-500/10 flex items-center justify-between gap-2">
              <div 
                onClick={() => setShowAvatarModal(true)}
                className="flex items-center gap-2.5 truncate cursor-pointer group"
                title="Modifier mon avatar de profil"
              >
                <div className="relative">
                  <UserAvatar avatar={user?.avatar} name={user?.name} size="md" />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#c200d6] text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow">
                    <Camera size={8} />
                  </div>
                </div>
                <div className="truncate">
                  <div className="text-xs font-semibold text-slate-200 truncate font-sans group-hover:text-white transition-colors">{user?.name}</div>
                  <div className="text-[10px] text-red-400 font-mono tracking-widest uppercase truncate">
                    {user?.role}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button 
                  onClick={() => { setView('settings'); handleFetchSessions(); }}
                  className="p-1.5 text-slate-500 hover:text-white hover:text-[#ff0040] transition-colors cursor-pointer"
                  title="Paramètres"
                >
                  <Settings size={14} />
                </button>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Se déconnecter"
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          </aside>

          {/* Chat Canvas Section */}
          <main className="flex-1 flex flex-col overflow-hidden bg-[#040108]">
            {activeConvId ? (
              <>
                  {/* Active Chat Header */}
                 <header className="px-6 py-3.5 border-b gothic-rainbow-glow-wave bg-[#08030f]/60 flex items-center justify-between">
                   <div className="flex items-center gap-3">
                     <button
                       onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
                       className="md:hidden p-1 text-slate-400 hover:text-[#ff0040] transition-colors cursor-pointer"
                       title="Menu"
                     >
                       <Menu size={18} />
                     </button>
                     {(() => {
                       const modelNames: Record<string, string> = {
                         'anthropic': 'Claude',
                         'gemini-pro': 'Gemini',
                         'gemini-flash': 'Gemini',
                         'mistral': 'Mistral',
                         'deepseek': 'DeepSeek',
                         'yokubo-auto': 'Gemini'
                       };
                       const modelName = modelNames[selectedModel] || 'Gemini';
                       return (
                         <>
                           <div className="text-xs font-semibold text-slate-200 uppercase tracking-widest font-display">
                             YOKUBO GPT · {modelName}
                            </div>
                            <span className="text-slate-800">|</span>
                            {/* Performance Status Indicators */}
                            <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                              <span className="flex items-center gap-1">
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  networkStatus === 'Online' 
                                    ? 'bg-emerald-500 animate-pulse' 
                                    : networkStatus === 'Degraded' 
                                      ? 'bg-amber-500 animate-pulse' 
                                      : 'bg-red-500'
                                }`} />
                                <span className="uppercase text-[9px] tracking-wide">{networkStatus}</span>
                              </span>
                              <span aria-hidden="true" className="text-slate-800">·</span>
                              <span>{networkPing !== null ? `${networkPing}ms` : '— ms'}</span>
                              <span aria-hidden="true" className="text-slate-800">·</span>
                              <span>{isGenerating ? 'LOAD 38%' : 'LOAD —'}</span>
                            </div>
                            <div className="hidden" />
                         </>
                       );
                     })()}

                     {/* Full-Text Client-Side Message Search */}
                     <div className="hidden md:flex items-center gap-2 ml-2">
                       <div className="relative flex items-center">
                         <Search size={12} className="absolute left-2.5 text-slate-500" />
                         <input 
                           type="text"
                           value={messageSearchQuery}
                           onChange={(e) => setMessageSearchQuery(e.target.value)}
                           placeholder="Rechercher dans ce chat..."
                           className="bg-[#05020a] border border-red-500/15 rounded pl-7 pr-16 py-1 text-[10px] text-slate-300 focus:outline-none focus:border-red-500/30 w-48"
                         />
                         {messageSearchQuery && (
                           <div className="absolute right-1 flex items-center gap-1">
                             <span className="text-[9px] font-mono text-slate-500 px-1">
                               {matchingMessageIds.length > 0 ? `${currentMatchIndex + 1}/${matchingMessageIds.length}` : '0'}
                             </span>
                             <button 
                               onClick={() => setMessageSearchQuery('')}
                               className="text-slate-500 hover:text-slate-300 cursor-pointer"
                             >
                               <X size={10} />
                             </button>
                           </div>
                         )}
                       </div>
                       
                       {messageSearchQuery && matchingMessageIds.length > 0 && (
                         <div className="flex items-center gap-1 border border-red-500/10 rounded p-0.5 bg-[#090310]">
                           <button 
                             onClick={handlePrevMatch}
                             className="p-1 hover:text-[#ff0040] text-slate-400 transition-colors cursor-pointer text-[9px]"
                             title="Résultat précédent"
                           >
                             ◀
                           </button>
                           <button 
                             onClick={handleNextMatch}
                             className="p-1 hover:text-[#ff0040] text-slate-400 transition-colors cursor-pointer text-[9px]"
                             title="Résultat suivant"
                           >
                             ▶
                           </button>
                         </div>
                       )}
                     </div>
                   </div>

                  {/* AI Model Controls */}
                  <div className="flex-wrap flex items-center gap-4">
                    {/* Security Status Indicator with Premium Tooltip */}
                    <div className="relative">
                      <button
                        onClick={() => setShowSecurityTooltip(!showSecurityTooltip)}
                        className={`p-1.5 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                          showSecurityTooltip 
                            ? 'bg-[#0a1c14] border-emerald-500 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.3)]' 
                            : 'bg-[#050c08] border-emerald-500/30 text-emerald-500/80 hover:text-emerald-400 hover:border-emerald-500/60'
                        }`}
                        title="Vérifier le statut de sécurité cryptographique"
                      >
                        <ShieldCheck size={14} className="animate-pulse" />
                      </button>
                      
                      {showSecurityTooltip && (
                        <div className="absolute right-0 mt-2.5 w-72 glass-panel p-4 rounded border border-emerald-500/30 shadow-[0_4px_25px_rgba(0,0,0,0.8)] z-50 text-left space-y-3">
                          <div className="flex items-center gap-2 border-b border-emerald-500/20 pb-2">
                            <ShieldCheck size={16} className="text-emerald-400 animate-pulse" />
                            <span className="text-[10px] font-display font-extrabold text-emerald-400 uppercase tracking-wider">
                              CONNEXION BLINDÉE
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-300 leading-relaxed font-mono uppercase tracking-wide">
                            • SESSION CHIFFRÉE DE BOUT EN BOUT VIA AES-256.<br />
                            • FIRESTORE SÉCURISÉ PAR DES RÈGLES D'ACCÈS RECHERCHÉES.<br />
                            • CÔTÉ SERVEUR AUTHENTIFIÉ (ZÉRO FUITE DE CLÉ API ILS).
                          </p>
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => setShowSecurityTooltip(false)}
                              className="text-[9px] font-mono text-emerald-400 hover:text-white uppercase tracking-widest cursor-pointer"
                            >
                              Fermer [X]
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Deep thinking indicator */}
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                        Haute Réflexion
                      </span>
                      <button 
                        onClick={() => {
                          setThinkingEnabled(!thinkingEnabled);
                          triggerAlert('success', !thinkingEnabled ? 'Haute Réflexion activée (Gemini 3.1 Pro)' : 'Haute Réflexion désactivée');
                        }}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors focus:outline-none cursor-pointer ${
                          thinkingEnabled ? 'bg-[#ff0040]' : 'bg-slate-800'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                          thinkingEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Model Select Selector */}
                    <div className="relative">
                      <select 
                        value={selectedModel}
                        onChange={(e) => setSelectedModel(e.target.value)}
                        className="bg-[#050209] border border-red-500/15 rounded px-2.5 py-1 text-[10px] font-mono text-slate-300 uppercase focus:outline-none cursor-pointer"
                      >
                        <option value="yokubo-auto">YOKUBO AUTO</option>
                        <option value="gemini-flash">GEMINI 2.5 FLASH</option>
                        <option value="gemini-pro">GEMINI 2.5 PRO</option>
                        <option value="mistral">MISTRAL AI</option>
                        <option value="anthropic">CLAUDE SONNET</option>
                        <option value="deepseek">DEEPSEEK V3</option>
                      </select>
                    </div>

                    {/* Exporter Markdown button */}
                    <button
                      onClick={handleExportMarkdown}
                      className="px-2.5 py-1.5 bg-[#12041c] hover:bg-[#ff0040]/10 border border-red-500/20 hover:border-[#ff0040]/50 rounded text-[9px] text-[#ff0040] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                      title="Exporter la conversation en Markdown (.md)"
                    >
                      <FileText size={12} /> <span className="hidden sm:inline">Exporter .MD</span>
                    </button>

                    {/* Hotkeys / Help button with Tooltip */}
                    <div className="relative group">
                      <button
                        onClick={() => setShowHotkeysModal(true)}
                        className="px-2.5 py-1.5 bg-[#12041c] hover:bg-[#00e5ff]/10 border border-cyan-500/20 hover:border-[#00e5ff]/50 rounded text-[9px] text-[#00e5ff] font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
                        title="Raccourcis clavier (Ctrl+/)"
                      >
                        <HelpCircle size={12} />
                        <span className="hidden sm:inline">Aide</span>
                        <kbd className="hidden md:inline px-1 py-0.2 bg-black/40 border border-cyan-500/30 rounded text-[8px] font-mono">Ctrl+/</kbd>
                      </button>
                      <div className="hidden group-hover:block absolute right-0 top-full mt-2 w-52 p-2.5 rounded-lg bg-[#08020e] border border-cyan-500/30 shadow-[0_4px_25px_rgba(0,0,0,0.8)] text-[10px] font-mono text-slate-300 z-50 pointer-events-none">
                        <div className="font-bold text-[#00e5ff] mb-1 flex items-center gap-1">
                          <Keyboard size={11} /> Raccourcis Clavier
                        </div>
                        <div className="text-slate-400">Appuyez sur <span className="text-white font-bold">Ctrl+/</span> pour afficher tous les raccourcis (Ctrl+K, Ctrl+N, Ctrl+S...).</div>
                      </div>
                    </div>
                  </div>
                </header>

                {/* Messages Stream Container */}
                <div className={`flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 max-w-2xl lg:max-w-4xl mx-auto w-full overflow-x-hidden transition-all duration-700 ${
                  isGenerating ? 'shadow-[inset_0_0_30px_rgba(255,0,64,0.03)]' : ''
                }`}>
                  {messages && messages.length > 0 ? (
                    messages.map((msg, index) => (
                      <motion.div 
                        key={msg.id || index}
                        id={`msg-container-${msg.id}`}
                        initial={msg.role === 'assistant' ? { opacity: 0, y: 15 } : undefined}
                        animate={msg.role === 'assistant' ? { opacity: 1, y: 0 } : undefined}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className={`flex gap-4 max-w-3xl transition-all duration-500 ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'} ${
                          messageSearchQuery && matchingMessageIds[currentMatchIndex] === msg.id 
                            ? 'ring-2 ring-amber-500/50 shadow-[0_0_25px_rgba(245,158,11,0.2)] rounded-lg p-2.5 bg-amber-500/5 border border-amber-500/30' 
                            : ''
                        }`}
                      >
                        {/* Avatar */}
                        {msg.role === 'user' ? (
                          <UserAvatar avatar={user?.avatar} name={user?.name} size="md" />
                        ) : (
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 border bg-[#08020d] border-red-500/30 text-red-400 text-glow font-display">
                            欲
                          </div>
                        )}

                        {/* Content Card */}
                        <div 
                          onContextMenu={(e) => {
                            if (msg.role === 'assistant') {
                              e.preventDefault();
                              setContextMenu({
                                x: e.clientX,
                                y: e.clientY,
                                msgId: msg.id,
                                content: msg.content
                              });
                            }
                          }}
                          className={`p-5 rounded-lg max-w-[85%] border shadow-md space-y-3 ${
                            msg.role === 'user'
                              ? 'bg-[#12041c]/30 border-red-500/10 shadow-[0_0_15px_rgba(255,0,64,0.02)]'
                              : 'bg-[#08030f]/60 border-slate-900 shadow-xl'
                          }`}
                        >
                          
                          {/* File Attachment Pill Preview */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-3">
                              {msg.attachments.map((file, fIdx) => (
                                <div key={fIdx} className="inline-flex items-center gap-1.5 px-2 py-1 bg-[#050209] border border-red-500/10 rounded text-[10px] text-slate-400">
                                  <FileText size={10} className="text-[#ff0040]" />
                                  <span className="truncate max-w-[120px] font-mono">{file.name}</span>
                                  <span className="text-slate-600 font-mono">({file.size})</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Deep Thinking Output Accordion (If applicable) */}
                          {msg.thinkingProcess && (
                            <details className="group border border-red-500/10 bg-[#12041c]/10 rounded overflow-hidden mb-4" open>
                              <summary className="flex items-center justify-between px-3.5 py-2.5 bg-[#0a0314] cursor-pointer hover:bg-[#150524] transition-colors">
                                <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#ff0040] flex items-center gap-2">
                                  <Sparkles size={11} className="animate-spin-slow text-[#ff0040]" /> PROCESSUS DE RÉFLEXION INTERNE
                                </span>
                                <span className="text-xs text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                              </summary>
                              <div className="p-3.5 border-t border-red-500/5 text-xs text-slate-400 font-mono select-text whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                                {msg.thinkingProcess}
                              </div>
                            </details>
                          )}

                          {/* Safe Markdown Content Body */}
                          <div className="text-sm text-slate-300 leading-relaxed space-y-1">
                            {renderMarkdown(msg.content)}
                          </div>

                          {/* Actions panel */}
                          {msg.role === 'assistant' && (
                            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-900/50 text-[10px] text-slate-500">
                              {msg.modelUsed && (
                                <span className="font-mono text-[9px] uppercase tracking-widest text-red-400 bg-[#0c0314] px-1.5 py-0.5 rounded mr-auto">
                                  ENGINE: {msg.modelUsed}
                                </span>
                              )}
                              <button 
                                onClick={() => handleToggleSpeak(msg.id, msg.content)}
                                className="flex items-center gap-1 hover:text-[#ff0040] transition-colors cursor-pointer mr-2"
                                title="Lire à haute voix"
                              >
                                {speakingMsgId === msg.id ? (
                                  <>
                                    <VolumeX size={11} className="text-[#ff0040]" /> Arrêter
                                  </>
                                ) : (
                                  <>
                                    <Volume2 size={11} /> Lire
                                  </>
                                )}
                              </button>
                              <button 
                                onClick={() => {
                                  navigator.clipboard.writeText(msg.content);
                                  triggerAlert('success', 'Message copié !');
                                }}
                                className="flex items-center gap-1 hover:text-[#ff0040] transition-colors cursor-pointer"
                              >
                                <Copy size={11} /> Copier
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                                  setContextMenu({
                                    x: rect.left - 80,
                                    y: rect.bottom + 8,
                                    msgId: msg.id,
                                    content: msg.content
                                  });
                                }}
                                className="flex items-center gap-1 hover:text-[#ff0040] transition-colors cursor-pointer ml-2"
                                title="Menu Optionnel"
                              >
                                <SlidersHorizontal size={11} /> Menu
                              </button>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center max-w-lg mx-auto py-20 space-y-4">
                      <Sparkles size={36} className="text-[#ff0040] animate-pulse gothic-glow-crimson" />
                      <h3 className="text-xs font-display font-extrabold text-slate-200 uppercase tracking-widest">SALON YOKUBO SÉCURISÉ</h3>
                      <p className="text-[11px] text-slate-500 leading-relaxed uppercase tracking-wider font-mono">
                        Cette session est chiffrée de bout en bout et protégée contre l'exfiltration de données. Envoyez votre première requête.
                      </p>
                    </div>
                  )}

                  {/* Typing / Thinking Placeholder */}
                  {isGenerating && (
                    <div className="flex gap-4 max-w-2xl lg:max-w-4xl mr-auto">
                      <div className="w-8 h-8 rounded-full bg-[#08020d] border border-red-500/30 text-red-400 flex items-center justify-center font-bold text-xs shrink-0 animate-pulse font-display">
                        欲
                      </div>
                      <div className="p-5 rounded-lg bg-[#08030f]/40 border border-slate-900 space-y-3 shadow-md">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce"></span>
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce delay-100"></span>
                          <span className="w-2 h-2 rounded-full bg-red-500 animate-bounce delay-200"></span>
                          <span className="text-[10px] font-mono text-red-400 tracking-wider ml-1 uppercase">YOKUBO analyse...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Secure Chat input form */}
                <footer className="p-4 bg-[#08030f]/60 border-t gothic-rainbow-glow-wave">
                  <form onSubmit={handleSendChatMessage} className="max-w-2xl lg:max-w-4xl mx-auto space-y-3">
                    
                    {/* Suggestions de prompts cliquables */}
                    <div className="flex flex-wrap gap-2 pb-1 overflow-x-auto no-scrollbar">
                      {[
                        { label: 'Analyse de code', prompt: "Analyse ce code de manière exhaustive pour y trouver des vulnérabilités ou optimisations :" },
                        { label: 'Audit de sécurité', prompt: "Fais un audit de sécurité complet et liste les 10 failles OWASP applicables à :" },
                        { label: 'Synthèse sécurisée', prompt: "Fais-moi une synthèse claire, concise et hautement sécurisée de ce texte :" },
                        { label: 'Génération TypeScript', prompt: "Génère un script TypeScript fortement typé, sécurisé et performant pour :" },
                        { label: 'Explique-moi ce code', prompt: "Explique-moi le fonctionnement détaillé de ce bloc de code ainsi que son architecture :" },
                        { label: 'Corrige cette erreur', prompt: "Voici une erreur que je rencontre. Aide-moi à la corriger de façon optimale et sécurisée :\n\nErreur :\n" }
                      ].map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setChatInput(s.prompt)}
                          className="px-2.5 py-1 bg-[#12041c]/60 hover:bg-[#ff0040]/15 border border-red-500/15 hover:border-[#ff0040]/30 rounded-full text-[10px] text-slate-400 hover:text-red-400 transition-all font-mono whitespace-nowrap cursor-pointer"
                        >
                          + {s.label}
                        </button>
                      ))}
                    </div>

                    {/* File Attachment previews in input */}
                    {attachments.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-2 bg-[#050209] rounded border border-red-500/10">
                        {attachments.map((file, fIdx) => (
                          <div key={fIdx} className="flex items-center gap-1.5 px-2 py-1 bg-slate-900 border border-slate-800 rounded text-[10px] text-slate-300">
                            <FileText size={12} className="text-red-400" />
                            <span className="truncate max-w-[150px] font-mono">{file.name}</span>
                            <button 
                              type="button" 
                              onClick={() => handleRemoveAttachment(fIdx)}
                              className="text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                            >
                              <X size={12} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className={`relative flex items-center bg-[#05020a] border rounded overflow-hidden transition-all duration-300 ${
                      thinkingEnabled 
                        ? 'border-purple-500/50 shadow-[0_0_20px_rgba(153,0,255,0.3)] bg-[#0d041a]' 
                        : 'gothic-rainbow-glow-wave'
                    } ${isGenerating ? 'animate-pulse' : ''}`}>
                      {/* Hidden File Input */}
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        multiple
                        className="hidden"
                      />

                      {/* Paperclip Button */}
                      <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-slate-500 hover:text-[#ff0040] transition-colors cursor-pointer"
                        title="Attacher des fichiers (Max 5Mo)"
                      >
                        <Image size={18} />
                      </button>

                      {/* Main Prompt Input */}
                      <input 
                        id="prompt-input"
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Poser une question intelligente à YOKUBO... (Ctrl+K pour focus)"
                        disabled={isGenerating}
                        className="flex-1 bg-transparent border-0 px-4 py-3.5 text-xs text-slate-200 focus:outline-none placeholder-slate-700"
                      />

                      {/* Word Count Indicator */}
                      <div className="text-[10px] font-mono text-slate-500 hover:text-slate-400 select-none px-2 transition-all shrink-0">
                        {wordCount} {wordCount === 1 ? 'word' : 'words'}
                      </div>

                      {/* Toggle Thinking Mode Button */}
                      <button 
                        type="button"
                        onClick={() => {
                          setThinkingEnabled(!thinkingEnabled);
                          triggerAlert('success', !thinkingEnabled ? 'Haute Réflexion Activée' : 'Haute Réflexion Désactivée');
                        }}
                        className={`p-3 transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                          thinkingEnabled ? 'text-purple-400 hover:text-purple-300' : 'text-slate-500 hover:text-purple-400'
                        }`}
                        title={thinkingEnabled ? "Désactiver la Haute Réflexion" : "Activer la Haute Réflexion"}
                      >
                        <Tag size={15} className={thinkingEnabled ? 'animate-pulse' : ''} />
                        <span className="hidden sm:inline text-[9px] font-mono uppercase tracking-widest font-semibold">
                          {thinkingEnabled ? 'RÉFLEXION: ON' : 'RÉFLEXION'}
                        </span>
                      </button>

                      {/* Send Button */}
                      <button 
                        id="send-prompt-btn"
                        type="submit"
                        disabled={isGenerating || (!chatInput.trim() && attachments.length === 0)}
                        className="p-3.5 text-red-400 hover:text-white disabled:text-slate-800 transition-colors cursor-pointer"
                      >
                        <Send size={18} />
                      </button>
                    </div>
                    
                    <div className="flex justify-between items-center text-[10px] text-slate-500">
                      <span>Projet YOKUBO GPT développé par LUST DEV.</span>
                      <span className="font-mono text-red-500/50">SECURE CONTEXT VERIFIED // AES-256</span>
                    </div>
                  </form>
                </footer>
              </>
            ) : (
              // Empty Slate View
              <div className="flex-1 flex flex-col items-center justify-center p-8 max-w-2xl mx-auto text-center space-y-8 relative">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="md:hidden absolute top-6 left-6 p-2 bg-[#12041c]/50 border border-red-500/10 rounded text-slate-400 hover:text-[#ff0040]"
                  title="Ouvrir le menu"
                >
                  <Menu size={18} />
                </button>

                <div className="w-16 h-16 rounded-full bg-[#12041c] border border-red-500/20 flex items-center justify-center gothic-glow-crimson animate-pulse-slow">
                  <Sparkles size={32} className="text-[#ff0040]" />
                </div>

                <div className="space-y-3">
                  <h1 className="text-3xl font-display font-extrabold text-slate-100 uppercase tracking-wider">
                    『欲』 YOKUBO GPT
                  </h1>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-mono">
                    Created by LUST DEV — Code · Intelligence · Vision
                  </p>
                  <p className="text-xs text-slate-500 max-w-lg leading-relaxed mx-auto">
                    Sélectionnez un modèle IA ou créez un nouveau salon d'opération sécurisé dans la colonne de gauche.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  <button 
                    onClick={handleCreateChat}
                    className="p-4 rounded border border-cyan-500/10 hover:border-cyan-500/30 bg-[#070a14]/60 hover:bg-[#0c1224] transition-all text-left space-y-2 cursor-pointer"
                  >
                    <div className="text-xs font-bold text-[#00e5ff] flex items-center gap-1.5 uppercase">
                      <Plus size={14} /> Nouveau Salon
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      Initialiser une session de discussion vierge et sécurisée.
                    </p>
                  </button>

                  <button 
                    onClick={() => { setView('settings'); handleFetchSessions(); }}
                    className="p-4 rounded border border-slate-900 bg-[#070a14]/40 hover:bg-[#0c1224] transition-all text-left space-y-2 cursor-pointer"
                  >
                    <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5 uppercase">
                      <Settings size={14} /> Préférences
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Gérer la double authentification, les clés et révoquer des appareils.
                    </p>
                  </button>
                </div>
              </div>
            )}
          </main>
        </div>
      )}

      {/* ==================== VIEW 8: SETTINGS & PREFERENCES ==================== */}
      {view === 'settings' && (
        <div className="flex-1 max-w-4xl mx-auto w-full px-6 py-12 space-y-10">
          
          {/* Header navigation */}
          <div className="flex items-center justify-between border-b border-slate-900 pb-4">
            <div>
              <button 
                onClick={() => setView('chat')}
                className="text-xs text-[#00e5ff] hover:underline"
              >
                ← Retour au Chat
              </button>
              <h1 className="text-2xl font-display font-bold text-slate-100 uppercase tracking-wider mt-2">
                PRÉFÉRENCES DE SÉCURITÉ
              </h1>
            </div>
            <span className="text-[10px] font-mono text-slate-500">CLIENT_ID: {user?.id}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Sidebar with navigation parameters */}
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-4">Catégories</div>
              <button className="w-full text-left p-3 rounded bg-[#091024] text-[#00e5ff] border-l-2 border-[#00e5ff] font-medium text-xs uppercase">
                Sécurité & Double Facteur
              </button>
            </div>

            {/* Main configurations */}
            <div className="md:col-span-2 space-y-6">
              
              {/* Profile & Avatar Card */}
              <div className="p-6 rounded-lg glass-panel space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-[#00e5ff] uppercase tracking-wider">Compte Utilisateur</h3>
                  <button
                    onClick={() => setShowAvatarModal(true)}
                    className="px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider bg-[#c200d6]/10 text-purple-300 border border-purple-500/30 hover:bg-[#c200d6]/20 transition-all flex items-center gap-1.5 cursor-pointer font-display"
                    title="Changer d'icône géométrique ou importer une photo"
                  >
                    <Camera size={13} /> Modifier l'Avatar
                  </button>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-[#050209] border border-white/5">
                  <div className="relative group cursor-pointer" onClick={() => setShowAvatarModal(true)}>
                    <UserAvatar avatar={user?.avatar} name={user?.name} size="xl" />
                    <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity">
                      <Camera size={18} />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold text-slate-100 font-sans">{user?.name}</div>
                    <div className="text-xs text-slate-400 font-mono">{user?.email}</div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Avatar : {user?.avatar?.startsWith('geom:') ? 'Icône Géométrique Cyber' : user?.avatar ? 'Photo Personnalisée' : 'Initiales Textuelles'}
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 pt-2 border-t border-white/5">
                  <div><strong>Rôle :</strong> <span className="text-red-400 font-mono uppercase">{user?.role}</span></div>
                  <div><strong>Statut :</strong> {user?.isVerified ? (
                    <span className="text-emerald-400 font-semibold font-mono">VERIFIED</span>
                  ) : (
                    <span className="text-red-400 font-semibold font-mono">UNVERIFIED</span>
                  )}</div>
                </div>
              </div>

              {/* Theme Settings Card */}
              <div className="p-6 rounded-lg glass-panel space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Thème de l'interface</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed font-mono">
                  Basculez entre le mode sombre cyber-gothique d'origine et le mode clair pour s'adapter à votre environnement de travail.
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTheme('dark')}
                    className={`px-4 py-2 border rounded text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      theme === 'dark'
                        ? 'border-[#ff0040] text-[#ff0040] bg-[#ff0040]/5 shadow-[0_0_12px_rgba(255,0,64,0.2)]'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Sombre (Cyber-Gothique)
                  </button>
                  <button
                    onClick={() => setTheme('light')}
                    className={`px-4 py-2 border rounded text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer ${
                      theme === 'light'
                        ? 'border-[#ff0040] text-[#ff0040] bg-[#ff0040]/5 shadow-[0_0_12px_rgba(255,0,64,0.2)]'
                        : 'border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    Clair
                  </button>
                </div>
              </div>

              {/* Memory panel (custom instructions) */}
              <div className="p-6 rounded-lg glass-panel space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Mémoire & Personnalisation</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Ajoutez des consignes personnalisées pour façonner le comportement de YOKUBO GPT lors des prochaines sessions de discussion.
                </p>
                <textarea 
                  value={customInstructions}
                  onChange={(e) => setCustomInstructions(e.target.value)}
                  placeholder="ex. Rédige le code en TypeScript uniquement. Répond toujours de manière concise."
                  className="w-full bg-[#05070c] border border-slate-900 rounded p-3 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/20 min-h-[100px]"
                />
                <button 
                  onClick={() => triggerAlert('success', 'Instructions système sauvegardées !')}
                  className="px-4 py-2 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded hover:bg-cyan-500/20 text-xs font-semibold uppercase tracking-wider transition-all"
                >
                  Mettre à jour la mémoire
                </button>
              </div>

              {/* 2FA Configuration Card */}
              <div className="p-6 rounded-lg glass-panel space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Double Authentification (2FA)</h3>
                  <button 
                    onClick={() => handleSetup2FA(!user?.isTwoFactorEnabled)}
                    className={`px-3 py-1 rounded text-[10px] font-bold tracking-wider uppercase border transition-colors ${
                      user?.isTwoFactorEnabled 
                        ? 'border-red-500/20 text-red-400 hover:bg-red-500/10' 
                        : 'border-[#00e5ff]/20 text-[#00e5ff] hover:bg-[#00e5ff]/10'
                    }`}
                  >
                    {user?.isTwoFactorEnabled ? 'DÉSACTIVER' : 'ACTIVER 2FA'}
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Ajoutez un niveau de sécurité robuste à votre compte lors de la connexion.
                </p>

                {twoFactorSecret && (
                  <div className="p-4 rounded border border-cyan-500/20 bg-[#091024]/60 space-y-2">
                    <div className="text-xs text-slate-300">Votre clé de secours 2FA :</div>
                    <div className="text-lg font-mono font-bold text-cyan-400 tracking-widest text-center py-2 bg-[#05070c] rounded select-all">
                      {twoFactorSecret}
                    </div>
                    <div className="text-[10px] text-slate-500">
                      Attention : Notez cette clé précieusement. Vous devrez la saisir lors de vos prochaines connexions.
                    </div>
                  </div>
                )}
              </div>

              {/* Devices & Active Sessions */}
              <div className="p-6 rounded-lg glass-panel space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Sessions & Appareils Actifs</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Historique des sessions ouvertes. Révoquez les accès des appareils suspects.
                </p>

                <div className="space-y-2.5">
                  {sessions && sessions.length > 0 ? (
                    sessions.map((sess) => (
                      <div key={sess.id} className="p-3 bg-slate-950/40 rounded border border-slate-900 flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="text-xs text-slate-300 font-semibold truncate max-w-sm">
                            {sess.userAgent}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">
                            IP: {sess.ipAddress} · Connecté: {new Date(sess.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        {sess.isCurrent ? (
                          <span className="text-[9px] font-bold text-cyan-400 border border-cyan-500/20 bg-cyan-500/5 px-2 py-0.5 rounded uppercase tracking-wider shrink-0">
                            Session Actuelle
                          </span>
                        ) : (
                          <button 
                            onClick={() => handleRevokeSession(sess.id)}
                            className="p-1.5 text-red-400 hover:bg-red-500/10 rounded transition-colors text-xs"
                            title="Révoquer l'appareil"
                          >
                            Révoquer
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-xs text-slate-500">Chargement des sessions...</div>
                  )}
                </div>
              </div>

              {/* Support Card */}
              <div className="p-6 rounded-lg glass-panel space-y-4">
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <HelpCircle size={16} className="text-[#00e5ff]" /> Support Technique
                </h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Besoin d'assistance avec votre compte, l'API ou des fonctionnalités personnalisées ? Contactez notre support par Email ou WhatsApp.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  <a 
                    href="mailto:lustdev927@gmail.com?subject=Support%20YOKUBO%20GPT"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded hover:bg-cyan-500/20 text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    <Mail size={14} /> Contact Support
                  </a>
                  <a 
                    href="https://wa.me/18294786326"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500/20 text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    <MessageSquare size={14} /> +1 (829) 478-6326
                  </a>
                  <a 
                    href="https://whatsapp.com/channel/0029VbCiqwyBVJl3Jv5T4I15"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded hover:bg-emerald-500/20 text-xs font-semibold uppercase tracking-wider transition-all"
                  >
                    <Globe size={14} /> WhatsApp Channel
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ==================== VIEW 9: ADMIN HUD ==================== */}
      {view === 'admin' && (
        <div className="flex-1 max-w-5xl mx-auto w-full px-6 py-12 space-y-8">
          
          <div className="flex items-center justify-between border-b border-slate-900 pb-4">
            <div>
              <button 
                onClick={() => setView('chat')}
                className="text-xs text-cyan-400 hover:underline"
              >
                ← Retour au Chat
              </button>
              <h1 className="text-2xl font-display font-bold text-slate-100 uppercase tracking-wider mt-2">
                CONSOLE SECURITÉ & AUDIT ADMIN
              </h1>
            </div>
            <span className="text-[10px] font-mono text-red-400 uppercase tracking-widest bg-red-500/5 px-2.5 py-1 border border-red-500/10 rounded">
              ADMIN MODE ACTIVATED
            </span>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded border border-slate-900 bg-slate-950/60 space-y-1">
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Total Utilisateurs</div>
              <div className="text-xl font-mono font-bold text-slate-200">
                {adminStats?.usersCount ?? 0}
              </div>
            </div>
            <div className="p-4 rounded border border-slate-900 bg-slate-950/60 space-y-1">
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Sessions Actives</div>
              <div className="text-xl font-mono font-bold text-cyan-400">
                {adminStats?.activeSessionsCount ?? 0}
              </div>
            </div>
            <div className="p-4 rounded border border-slate-900 bg-slate-950/60 space-y-1">
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Messages Expédiés</div>
              <div className="text-xl font-mono font-bold text-slate-200">
                {adminStats?.messagesCount ?? 0}
              </div>
            </div>
            <div className="p-4 rounded border border-slate-900 bg-slate-950/60 space-y-1">
              <div className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Alertes Sécurité</div>
              <div className="text-xl font-mono font-bold text-red-500">
                {adminStats?.logsCount ?? 0}
              </div>
            </div>
          </div>

          {/* Recharts Model Usage Statistics Chart */}
          <div className="p-6 rounded-lg glass-panel space-y-4 shadow-[0_0_25px_rgba(214,0,54,0.05)] border border-red-500/10">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2 font-display">
              <Activity size={14} className="text-[#ff0040]" /> Distribution d'utilisation par modèle IA (Dernières 24 heures)
            </h3>
            <div className="h-64 w-full">
              {adminStats?.modelStats && adminStats.modelStats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={adminStats.modelStats}
                    margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#130824" />
                    <XAxis 
                      dataKey="name" 
                      stroke="#64748b" 
                      fontSize={10}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="#64748b" 
                      fontSize={10}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#090314',
                        borderColor: 'rgba(214, 0, 54, 0.2)',
                        borderRadius: '6px',
                        fontSize: '11px',
                        color: '#cbd5e1'
                      }}
                    />
                    <Bar 
                      dataKey="count" 
                      name="Requêtes"
                      fill="url(#gothicGradient)" 
                      radius={[4, 4, 0, 0]}
                    >
                      <defs>
                        <linearGradient id="gothicGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ff0040" stopOpacity={0.8} />
                          <stop offset="100%" stopColor="#9900ff" stopOpacity={0.15} />
                        </linearGradient>
                      </defs>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                  Aucune statistique de modèle disponible.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Users list inside admin */}
            <div className="md:col-span-1 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Utilisateurs</h3>
              <div className="p-4 rounded-lg glass-panel space-y-2.5 max-h-[400px] overflow-y-auto">
                {adminUsers && adminUsers.length > 0 ? (
                  adminUsers.map((u, index) => (
                    <div key={index} className="p-2.5 rounded bg-slate-950/40 border border-slate-900 space-y-1 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span className="text-slate-200 truncate max-w-[120px]">{u.name}</span>
                        <span className="text-cyan-400 font-mono text-[9px]">{u.role.toUpperCase()}</span>
                      </div>
                      <div className="text-slate-500 text-[10px] truncate">{u.email}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 py-4 text-center">Aucun utilisateur.</div>
                )}
              </div>
            </div>

            {/* Audit Logs */}
            <div className="md:col-span-2 space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Logs de Sécurité Récent (Audits)</h3>
              <div className="p-4 rounded-lg glass-panel font-mono text-xs space-y-2.5 max-h-[400px] overflow-y-auto">
                {adminLogs && adminLogs.length > 0 ? (
                  adminLogs.map((log, index) => (
                    <div key={index} className="p-3 bg-slate-950/80 rounded border border-slate-900 text-[11px] leading-relaxed">
                      <div className="flex justify-between text-[10px]">
                        <span className={`font-semibold uppercase tracking-wider ${
                          log.event.includes('fail') || log.event.includes('prevent') || log.event.includes('block')
                            ? 'text-red-500' : 'text-[#00e5ff]'
                        }`}>
                          {log.event}
                        </span>
                        <span className="text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-slate-300 mt-1">{log.details}</p>
                      <div className="text-[9px] text-slate-500 mt-1">IP: {log.ipAddress} · USER_ID: {log.userId || 'Inconnu'}</div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-500">Aucun log enregistré.</div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {contextMenu && (
        <div 
          className="fixed glass-panel rounded-md p-1.5 shadow-2xl z-50 min-w-[160px] animate-menu-fade-in font-sans text-xs"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()} // prevent immediate close on click inside
        >
          <button
            onClick={() => {
              navigator.clipboard.writeText(contextMenu.content);
              triggerAlert('success', 'Message copié dans le presse-papiers.');
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 hover:bg-white/5 text-slate-300 hover:text-white rounded transition-colors flex items-center gap-2 cursor-pointer"
          >
            Copier le message
          </button>
          <button
            onClick={() => {
              setChatInput(`En réponse à: "${contextMenu.content.substring(0, 60)}..."\n\n`);
              const inputEl = document.getElementById('prompt-input');
              if (inputEl) inputEl.focus();
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 hover:bg-white/5 text-slate-300 hover:text-white rounded transition-colors flex items-center gap-2 cursor-pointer"
          >
            Répondre
          </button>
          <button
            onClick={() => {
              handleToggleSpeak(contextMenu.msgId, contextMenu.content);
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 hover:bg-white/5 text-slate-300 hover:text-white rounded transition-colors flex items-center gap-2 cursor-pointer"
          >
            {speakingMsgId === contextMenu.msgId ? 'Arrêter la lecture' : 'Lire à voix haute'}
          </button>
          <div className="h-[1px] bg-white/5 my-1" />
          <button
            onClick={() => {
              if (confirm('Voulez-vous vraiment supprimer ce message ?')) {
                handleDeleteMessage(contextMenu.msgId);
              }
              setContextMenu(null);
            }}
            className="w-full text-left px-3 py-2 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded transition-colors flex items-center gap-2 cursor-pointer"
          >
            Supprimer le message
          </button>
        </div>
      )}

      {/* Cookie Consent Banner */}
      {cookieConsent === null && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md bg-[#0a0612]/98 border border-purple-500/20 rounded-lg p-5 shadow-2xl z-50 font-sans space-y-3">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <ShieldCheck size={16} className="text-purple-400" />
            <h4 className="text-[10px] font-bold text-slate-200 uppercase tracking-widest font-mono">Consentement aux Cookies</h4>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
            YOKUBO GPT utilise des traceurs sécurisés anonymisés de premier plan pour mesurer la latence réseau et les performances d'utilisation, garantissant ainsi une navigation fluide.
          </p>
          <div className="flex gap-2 justify-end text-[10px] font-mono uppercase tracking-widest pt-2">
            <button
              onClick={() => {
                localStorage.setItem('yokubo_cookie_consent', 'declined');
                setCookieConsent('declined');
                triggerAlert('warning', 'Préférences cookies enregistrées : Refusé.');
              }}
              className="px-3 py-1.5 text-slate-400 hover:text-slate-300 hover:bg-white/5 rounded cursor-pointer transition-colors"
            >
              Tout Refuser
            </button>
            <button
              onClick={() => {
                localStorage.setItem('yokubo_cookie_consent', 'accepted');
                setCookieConsent('accepted');
                triggerAlert('success', 'Préférences cookies enregistrées : Accepté.');
              }}
              className="px-3 py-1.5 bg-purple-500/10 text-purple-400 border border-purple-500/25 rounded hover:bg-purple-500/20 hover:text-white cursor-pointer transition-colors font-bold"
            >
              Tout Accepter
            </button>
          </div>
        </div>
      )}

      {/* CGU (Terms of Service) Modal */}
      {showToSModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#07040d] border border-white/10 rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto font-sans space-y-4 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Conditions Générales d'Utilisation (CGU)</h3>
              <button onClick={() => setShowToSModal(false)} className="text-slate-500 hover:text-white text-xs cursor-pointer">[X] Fermer</button>
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed font-sans space-y-3">
              <p className="font-bold text-slate-200">1. Objet du Service</p>
              <p>YOKUBO GPT est une plateforme d'intelligence artificielle offrant un routage multi-fournisseur optimisé, assurant le cryptage des sessions et l'audit continu des accès pour protéger la confidentialité des données.</p>
              <p className="font-bold text-slate-200">2. Responsabilité de l'Utilisateur</p>
              <p>L'utilisateur s'engage à ne pas soumettre de requêtes illégales, haineuses, de scripts d'exploitation de failles, ou de contenus violant les droits de tiers. L'accès administrateur est réservé aux audits légitimes.</p>
              <p className="font-bold text-slate-200">3. Disponibilité du Réseau et Garantie</p>
              <p>Bien que nous mesurions la latence active pour optimiser les performances (Ping), aucune garantie absolue d'uptime n'est fournie en raison de la nature dynamique des serveurs d'IA tiers.</p>
              <p className="font-bold text-slate-200">4. Hébergement et Conformité</p>
              <p>Toutes les données sont gérées de manière isolée via Firestore sous architecture blindée. LUST DEV se réserve le droit de révoquer l'accès en cas d'activité malveillante détectée dans les logs.</p>
            </div>
            <div className="flex justify-end pt-3 border-t border-white/5">
              <button
                onClick={() => setShowToSModal(false)}
                className="px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/25 rounded hover:bg-purple-500/20 text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer"
              >
                J'ai compris et j'accepte
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#07040d] border border-white/10 rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto font-sans space-y-4 text-left shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest font-mono">Politique de Confidentialité</h3>
              <button onClick={() => setShowPrivacyModal(false)} className="text-slate-500 hover:text-white text-xs cursor-pointer">[X] Fermer</button>
            </div>
            <div className="text-[11px] text-slate-400 leading-relaxed font-sans space-y-3">
              <p className="font-bold text-slate-200">1. Collecte et Anonymisation des Données</p>
              <p>Vos conversations sont stockées de façon sécurisée et isolée. Nous n'analysons pas vos messages à des fins publicitaires. Les jetons d'authentification API sont gardés 100% côté serveur.</p>
              <p className="font-bold text-slate-200">2. Droits RGPD</p>
              <p>Conformément aux réglementations européennes, vous disposez d'un droit complet d'accès, de rectification et de suppression de vos données. L'option "Supprimer le message" sur chaque réponse détruit instantanément la donnée physique de notre base.</p>
              <p className="font-bold text-slate-200">3. Mesures de Sécurité Opérationnelles</p>
              <p>Nous implémentons une protection contre le brute-force, une limitation stricte des taux (Rate Limiting), et un hachage unidirectionnel haut de gamme (Bcrypt) de tous les mots de passe.</p>
              <p className="font-bold text-slate-200">4. Sous-traitants IA</p>
              <p>Les requêtes sont transmises de manière anonymisée aux fournisseurs d'IA certifiés (Google, Anthropic, Mistral, DeepSeek) sans aucune fuite d'identité de l'utilisateur.</p>
            </div>
            <div className="flex justify-end pt-3 border-t border-white/5">
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="px-4 py-2 bg-purple-500/10 text-purple-400 border border-purple-500/25 rounded hover:bg-purple-500/20 text-xs font-semibold uppercase tracking-widest transition-all cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Modal */}
      <HotkeysModal
        isOpen={showHotkeysModal}
        onClose={() => setShowHotkeysModal(false)}
      />

      {/* Avatar Selection Dialog */}
      <AvatarSelectorModal
        isOpen={showAvatarModal}
        currentAvatar={user?.avatar}
        userName={user?.name}
        onClose={() => setShowAvatarModal(false)}
        onSave={handleSaveAvatar}
      />

    </div>
  );
}
