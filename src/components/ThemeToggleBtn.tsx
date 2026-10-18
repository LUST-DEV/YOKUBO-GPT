import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleBtnProps {
  theme: 'dark' | 'light';
  onToggle: (targetTheme?: 'dark' | 'light', e?: React.MouseEvent) => void;
  className?: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ThemeToggleBtn: React.FC<ThemeToggleBtnProps> = ({
  theme,
  onToggle,
  className = '',
  showLabel = false,
  size = 'md',
}) => {
  const isDark = theme === 'dark';

  const sizeClasses = {
    sm: 'p-1.5 text-xs',
    md: 'p-2 text-sm',
    lg: 'px-3.5 py-2 text-sm',
  }[size];

  const iconSizes = {
    sm: 13,
    md: 15,
    lg: 17,
  }[size];

  return (
    <button
      onClick={(e) => onToggle(undefined, e)}
      type="button"
      className={`group relative inline-flex items-center gap-2 rounded-lg border transition-all duration-300 cursor-pointer overflow-hidden ${
        isDark
          ? 'bg-[#12041c]/80 hover:bg-[#1f0730] border-red-500/20 hover:border-red-500/50 text-slate-300 hover:text-amber-300 shadow-[0_2px_10px_rgba(0,0,0,0.4)]'
          : 'bg-white/90 hover:bg-slate-100 border-slate-300/80 hover:border-slate-400 text-slate-700 hover:text-indigo-600 shadow-[0_2px_8px_rgba(0,0,0,0.06)]'
      } ${sizeClasses} ${className}`}
      title={isDark ? 'Passer en Mode Clair (ANN UIX)' : 'Passer en Mode Sombre (Cyber-Gothique)'}
      aria-label="Basculer le thème"
    >
      <div className="relative flex items-center justify-center w-4 h-4">
        {/* Sun Icon */}
        <Sun
          size={iconSizes}
          className={`absolute transition-all duration-400 transform text-amber-400 ${
            isDark 
              ? 'opacity-0 rotate-90 scale-50 pointer-events-none' 
              : 'opacity-100 rotate-0 scale-100'
          }`}
        />
        {/* Moon Icon */}
        <Moon
          size={iconSizes}
          className={`absolute transition-all duration-400 transform text-indigo-300 group-hover:text-amber-200 ${
            isDark 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-50 pointer-events-none'
          }`}
        />
      </div>

      {showLabel && (
        <span className="font-mono text-[10px] tracking-wider uppercase font-semibold select-none">
          {isDark ? 'Mode Sombre' : 'Mode Clair'}
        </span>
      )}
    </button>
  );
};
