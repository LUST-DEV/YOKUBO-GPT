import React, { useEffect, useState } from 'react';

export interface ThemeOverlayState {
  targetTheme: 'dark' | 'light';
  pos: { x: number; y: number };
  timestamp: number;
}

interface ThemeTransitionOverlayProps {
  overlayState: ThemeOverlayState | null;
  onAnimationEnd?: () => void;
}

/**
 * Premium ANN UIX Theme Transition Overlay
 * Provides a fluid, sensory ripple/bloom transition between Dark (cyber-gothic) and Light (ANN executive) modes.
 * Hardware-accelerated with CSS animations and pointer-events-none.
 */
export const ThemeTransitionOverlay: React.FC<ThemeTransitionOverlayProps> = ({
  overlayState,
  onAnimationEnd,
}) => {
  const [active, setActive] = useState(false);
  const [current, setCurrent] = useState<ThemeOverlayState | null>(null);

  useEffect(() => {
    if (!overlayState) return;

    setCurrent(overlayState);
    setActive(true);

    const timer = setTimeout(() => {
      setActive(false);
      if (onAnimationEnd) onAnimationEnd();
    }, 650);

    return () => clearTimeout(timer);
  }, [overlayState, onAnimationEnd]);

  if (!active || !current) return null;

  const isToLight = current.targetTheme === 'light';
  const { x, y } = current.pos;

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-[99999] overflow-hidden"
      aria-hidden="true"
    >
      {/* 1. Epicenter Radiant Ripple Wave */}
      <div
        className="absolute rounded-full"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: '40px',
          height: '40px',
          marginLeft: '-20px',
          marginTop: '-20px',
          animation: 'theme-wave-bloom 650ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          background: isToLight
            ? 'radial-gradient(circle, rgba(255, 255, 255, 0.95) 0%, rgba(224, 242, 254, 0.6) 35%, rgba(186, 230, 253, 0.2) 65%, transparent 100%)'
            : 'radial-gradient(circle, rgba(5, 3, 8, 0.98) 0%, rgba(24, 8, 40, 0.7) 40%, rgba(255, 0, 64, 0.15) 75%, transparent 100%)',
          boxShadow: isToLight
            ? '0 0 100px 40px rgba(255, 255, 255, 0.5)'
            : '0 0 100px 40px rgba(255, 0, 64, 0.25)',
        }}
      />

      {/* 2. Soft Ambient Fullscreen Glaze Flash */}
      <div
        className="absolute inset-0"
        style={{
          animation: 'theme-ambient-dissolve 650ms cubic-bezier(0.2, 0.8, 0.2, 1) forwards',
          background: isToLight
            ? 'radial-gradient(ellipse at 50% 50%, rgba(255, 255, 255, 0.45) 0%, rgba(241, 245, 249, 0.3) 50%, transparent 85%)'
            : 'radial-gradient(ellipse at 50% 50%, rgba(5, 3, 8, 0.5) 0%, rgba(10, 5, 20, 0.35) 60%, transparent 90%)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
        }}
      />

      {/* 3. Subtle Cybernetic Prism Halo Ring */}
      <div
        className="absolute rounded-full border"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: '60px',
          height: '60px',
          marginLeft: '-30px',
          marginTop: '-30px',
          animation: 'theme-ring-expand 650ms cubic-bezier(0.12, 0.8, 0.32, 1) forwards',
          borderColor: isToLight ? 'rgba(0, 229, 255, 0.35)' : 'rgba(255, 0, 64, 0.45)',
          boxShadow: isToLight 
            ? '0 0 25px rgba(0, 229, 255, 0.3), inset 0 0 25px rgba(255, 255, 255, 0.5)' 
            : '0 0 25px rgba(255, 0, 64, 0.4), inset 0 0 25px rgba(153, 0, 255, 0.3)',
        }}
      />
    </div>
  );
};
