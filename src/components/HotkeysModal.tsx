import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard, Sparkles, Command } from 'lucide-react';

interface HotkeysModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'Navigation' | 'Chat & Édition' | 'Système';
}

const SHORTCUTS: ShortcutItem[] = [
  {
    keys: ['Ctrl', '/'],
    description: 'Afficher / Masquer ce guide des raccourcis',
    category: 'Système'
  },
  {
    keys: ['Ctrl', 'K'],
    description: 'Focaliser instantanément le champ de saisie du chat',
    category: 'Chat & Édition'
  },
  {
    keys: ['Ctrl', 'Entrée'],
    description: 'Envoyer le message ou la requête immédiatement',
    category: 'Chat & Édition'
  },
  {
    keys: ['Ctrl', 'N'],
    description: 'Démarrer une nouvelle discussion sécurisée',
    category: 'Navigation'
  },
  {
    keys: ['Ctrl', 'S'],
    description: 'Ouvrir les Paramètres du compte et de sécurité',
    category: 'Navigation'
  },
  {
    keys: ['↑', '↓'],
    description: 'Naviguer dans la liste des conversations (hors saisie)',
    category: 'Navigation'
  },
  {
    keys: ['Entrée'],
    description: 'Ouvrir la conversation surlignée au clavier',
    category: 'Navigation'
  },
  {
    keys: ['Échap'],
    description: 'Fermer les modales, menus et retourner au chat',
    category: 'Système'
  }
];

export const HotkeysModal: React.FC<HotkeysModalProps> = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md"
          />

          {/* Modal Container */}
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
                <div className="w-9 h-9 rounded-lg bg-[#ff0040]/10 border border-red-500/30 flex items-center justify-center text-[#ff0040]">
                  <Keyboard size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold uppercase tracking-widest text-slate-100 flex items-center gap-2">
                    RACCOURCIS CLAVIER <span className="text-[10px] font-mono font-normal text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">HOTKEYS</span>
                  </h3>
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Gagnez en rapidité avec les combinaisons rapides YOKUBO
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                title="Fermer (Échap)"
              >
                <X size={16} />
              </button>
            </div>

            {/* List of shortcuts grouped */}
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
              {(['Chat & Édition', 'Navigation', 'Système'] as const).map((category) => (
                <div key={category} className="space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-red-400/90 font-semibold flex items-center gap-1.5">
                    <Sparkles size={11} className="text-[#ff0040]" />
                    {category}
                  </div>
                  <div className="space-y-1.5">
                    {SHORTCUTS.filter((s) => s.category === category).map((shortcut, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2.5 rounded-lg bg-[#07030e]/80 border border-white/5 hover:border-red-500/20 transition-colors"
                      >
                        <span className="text-xs text-slate-300 font-sans">
                          {shortcut.description}
                        </span>
                        <div className="flex items-center gap-1 shrink-0 ml-3">
                          {shortcut.keys.map((k, kIdx) => (
                            <React.Fragment key={kIdx}>
                              <kbd className="px-2 py-1 text-[10px] font-mono font-bold bg-[#140624] text-slate-200 border border-red-500/20 rounded shadow-sm">
                                {k}
                              </kbd>
                              {kIdx < shortcut.keys.length - 1 && (
                                <span className="text-slate-600 text-[10px] font-mono">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="mt-5 pt-3 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span className="flex items-center gap-1">
                <Command size={11} /> Compatible Windows, Mac (⌘) et Linux
              </span>
              <button
                onClick={onClose}
                className="px-3 py-1 bg-white/5 hover:bg-white/10 text-slate-300 rounded text-[10px] font-mono uppercase tracking-wider transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
