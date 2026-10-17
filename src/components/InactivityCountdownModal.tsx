import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Clock, LogOut, RefreshCw } from 'lucide-react';

interface InactivityCountdownModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  onStayLoggedIn: () => void;
  onLogout: () => void;
}

export const InactivityCountdownModal: React.FC<InactivityCountdownModalProps> = ({
  isOpen,
  remainingSeconds,
  onStayLoggedIn,
  onLogout,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(remainingSeconds);

  useEffect(() => {
    setSecondsLeft(remainingSeconds);
  }, [remainingSeconds]);

  useEffect(() => {
    if (!isOpen) return;

    if (secondsLeft <= 0) {
      onLogout();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, secondsLeft, onLogout]);

  const formattedSeconds = String(secondsLeft).padStart(2, '0');
  const progressPercent = Math.max(0, Math.min(100, (secondsLeft / 60) * 100));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop with dark blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md glass-panel rounded-2xl p-6 border border-red-500/30 shadow-[0_0_60px_rgba(255,0,64,0.25)] z-10 overflow-hidden text-center"
          >
            {/* Pulsing warning line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0040] via-amber-500 to-[#ff0040] animate-pulse" />

            {/* Warning Icon with pulsating halo */}
            <div className="relative mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-[#ff0040] mb-4">
              <div className="absolute inset-0 rounded-full bg-red-500/20 animate-ping opacity-25" />
              <ShieldAlert size={28} className="animate-pulse" />
            </div>

            <h3 className="text-base font-display font-bold uppercase tracking-wider text-slate-100 mb-1">
              INACTIVITÉ DÉTECTÉE
            </h3>
            <p className="text-xs text-slate-400 font-sans leading-relaxed mb-5">
              Pour préserver la confidentialité de vos discussions et clés de session, votre compte sera automatiquement déconnecté.
            </p>

            {/* Countdown Badge & Progress Bar */}
            <div className="p-4 rounded-xl bg-[#090212] border border-red-500/20 mb-6 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <Clock size={13} /> Fermeture dans :
                </span>
                <span className="text-2xl font-bold font-mono text-[#ff0040] tabular-nums tracking-widest">
                  00:{formattedSeconds}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-[#ff0040] rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(255,0,64,0.5)]"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={onStayLoggedIn}
                className="flex-1 py-3 px-4 bg-gradient-to-r from-[#ff0040] to-[#c200d6] hover:from-[#ff1a53] hover:to-[#d000e6] text-white font-display text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(255,0,64,0.3)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw size={14} /> Rester Connecté
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="py-3 px-4 bg-white/5 hover:bg-white/10 text-slate-400 hover:text-red-400 border border-white/10 rounded-xl text-xs font-mono uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <LogOut size={13} /> Déconnexion
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
