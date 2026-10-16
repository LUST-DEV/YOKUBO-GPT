import React from 'react';

export interface GeometricIconDef {
  id: string;
  name: string;
  color: string;
  glowColor: string;
  render: (size: number) => React.ReactNode;
}

export const GEOMETRIC_ICONS: GeometricIconDef[] = [
  {
    id: 'geom:cyber-eye',
    name: 'Cyber Eye',
    color: '#ff0040',
    glowColor: 'rgba(255, 0, 64, 0.4)',
    render: (size = 20) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.2" />
        <circle cx="12" cy="12" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'geom:hex-core',
    name: 'Hex Core',
    color: '#00e5ff',
    glowColor: 'rgba(0, 229, 255, 0.4)',
    render: (size = 20) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l8.5 5v10L12 22l-8.5-5V7L12 2z" />
        <circle cx="12" cy="12" r="2.5" fill="currentColor" fillOpacity="0.3" />
        <line x1="12" y1="2" x2="12" y2="7" />
        <line x1="12" y1="17" x2="12" y2="22" />
      </svg>
    ),
  },
  {
    id: 'geom:shield-node',
    name: 'Shield Node',
    color: '#10b981',
    glowColor: 'rgba(16, 185, 129, 0.4)',
    render: (size = 20) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="M12 8v8" strokeDasharray="2 2" />
        <circle cx="12" cy="12" r="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'geom:quantum-cube',
    name: 'Quantum Cube',
    color: '#c200d6',
    glowColor: 'rgba(194, 0, 214, 0.4)',
    render: (size = 20) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L3 7l9 5 9-5-9-5z" />
        <path d="M3 7v10l9 5V12L3 7z" fill="currentColor" fillOpacity="0.1" />
        <path d="M21 7v10l-9 5V12l9-5z" fill="currentColor" fillOpacity="0.2" />
      </svg>
    ),
  },
  {
    id: 'geom:matrix-delta',
    name: 'Matrix Delta',
    color: '#f59e0b',
    glowColor: 'rgba(245, 158, 11, 0.4)',
    render: (size = 20) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 22 20 2 20" />
        <polygon points="12 8 18 18 6 18" fill="currentColor" fillOpacity="0.2" />
      </svg>
    ),
  },
  {
    id: 'geom:flame-key',
    name: 'Flame Key',
    color: '#ff5500',
    glowColor: 'rgba(255, 85, 0, 0.4)',
    render: (size = 20) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="8" cy="8" r="4" fill="currentColor" fillOpacity="0.2" />
        <path d="M11 11l9 9" />
        <path d="M17 14l2 2" />
        <path d="M15 17l2 2" />
      </svg>
    ),
  },
  {
    id: 'geom:cyber-lotus',
    name: 'Cyber Lotus',
    color: '#9900ff',
    glowColor: 'rgba(153, 0, 255, 0.4)',
    render: (size = 20) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" fill="currentColor" fillOpacity="0.3" />
        <circle cx="12" cy="5" r="3" strokeDasharray="1 1" />
        <circle cx="12" cy="19" r="3" strokeDasharray="1 1" />
        <circle cx="5" cy="12" r="3" strokeDasharray="1 1" />
        <circle cx="19" cy="12" r="3" strokeDasharray="1 1" />
      </svg>
    ),
  },
  {
    id: 'geom:orbital-atom',
    name: 'Orbital Ring',
    color: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.4)',
    render: (size = 20) => (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="2" fill="currentColor" />
        <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(30 12 12)" />
        <ellipse cx="12" cy="12" rx="9" ry="4" transform="rotate(-30 12 12)" />
      </svg>
    ),
  },
];

interface UserAvatarProps {
  avatar?: string | null;
  name?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatar,
  name,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    xs: { box: 'w-6 h-6', iconSize: 13, text: 'text-[9px]' },
    sm: { box: 'w-7 h-7', iconSize: 15, text: 'text-[10px]' },
    md: { box: 'w-8 h-8', iconSize: 17, text: 'text-xs' },
    lg: { box: 'w-10 h-10', iconSize: 22, text: 'text-sm' },
    xl: { box: 'w-14 h-14', iconSize: 30, text: 'text-lg' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  // Case 1: Uploaded photo image
  if (avatar && (avatar.startsWith('data:image/') || avatar.startsWith('http://') || avatar.startsWith('https://') || avatar.startsWith('/'))) {
    return (
      <div
        className={`${currentSize.box} rounded-full overflow-hidden border border-red-500/30 shrink-0 bg-[#07030e] shadow-[0_0_12px_rgba(255,0,64,0.15)] ${className}`}
      >
        <img
          src={avatar}
          alt={name || 'Avatar'}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  // Case 2: Selected geometric preset icon
  if (avatar && avatar.startsWith('geom:')) {
    const geo = GEOMETRIC_ICONS.find((g) => g.id === avatar) || GEOMETRIC_ICONS[0];
    return (
      <div
        className={`${currentSize.box} rounded-full flex items-center justify-center shrink-0 border transition-all ${className}`}
        style={{
          color: geo.color,
          borderColor: `${geo.color}50`,
          backgroundColor: `${geo.color}15`,
          boxShadow: `0 0 10px ${geo.glowColor}`,
        }}
        title={geo.name}
      >
        {geo.render(currentSize.iconSize)}
      </div>
    );
  }

  // Case 3: Fallback Initial Letter
  const initial = name ? name.trim().charAt(0).toUpperCase() : 'U';
  return (
    <div
      className={`${currentSize.box} rounded-full flex items-center justify-center font-bold font-display shrink-0 border bg-[#ff0040]/10 border-red-500/30 text-red-400 gothic-glow-crimson ${currentSize.text} ${className}`}
    >
      {initial}
    </div>
  );
};
