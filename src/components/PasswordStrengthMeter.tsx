import React from 'react';
import { Check, X, Shield, ShieldCheck, ShieldAlert } from 'lucide-react';

interface PasswordStrengthMeterProps {
  password: string;
}

export interface PasswordCriterion {
  id: string;
  label: string;
  met: boolean;
}

export function evaluatePassword(pwd: string): {
  score: number;
  label: string;
  color: string;
  bgGlow: string;
  criteria: PasswordCriterion[];
} {
  const criteria: PasswordCriterion[] = [
    {
      id: 'length',
      label: 'Au moins 8 caractères',
      met: pwd.length >= 8,
    },
    {
      id: 'cases',
      label: 'Majuscules & minuscules (a-z, A-Z)',
      met: /[a-z]/.test(pwd) && /[A-Z]/.test(pwd),
    },
    {
      id: 'number',
      label: 'Au moins un chiffre (0-9)',
      met: /\d/.test(pwd),
    },
    {
      id: 'special',
      label: 'Symbole ou caractère spécial (!@#$%...)',
      met: /[^A-Za-z0-9]/.test(pwd),
    },
  ];

  const metCount = criteria.filter((c) => c.met).length;

  let score = 0;
  let label = 'Trop court';
  let color = '#64748b';
  let bgGlow = 'rgba(100, 116, 139, 0.15)';

  if (!pwd) {
    return { score: 0, label: 'Vide', color: '#475569', bgGlow: 'transparent', criteria };
  }

  if (metCount === 1) {
    score = 1;
    label = 'Très faible';
    color = '#ff0040';
    bgGlow = 'rgba(255, 0, 64, 0.2)';
  } else if (metCount === 2) {
    score = 2;
    label = 'Moyen';
    color = '#f59e0b';
    bgGlow = 'rgba(245, 158, 11, 0.2)';
  } else if (metCount === 3) {
    score = 3;
    label = 'Bon niveau';
    color = '#00e5ff';
    bgGlow = 'rgba(0, 229, 255, 0.2)';
  } else if (metCount === 4) {
    score = 4;
    label = 'Robuste & Blindé';
    color = '#10b981';
    bgGlow = 'rgba(16, 185, 129, 0.25)';
  }

  return { score, label, color, bgGlow, criteria };
}

export const PasswordStrengthMeter: React.FC<PasswordStrengthMeterProps> = ({ password }) => {
  const { score, label, color, criteria } = evaluatePassword(password);

  if (!password) {
    return null;
  }

  return (
    <div className="mt-2.5 p-3 rounded-lg bg-[#07020d] border border-white/5 space-y-2.5 transition-all">
      {/* Header with visual bar and score label */}
      <div className="flex items-center justify-between text-[10px] font-mono">
        <span className="text-slate-400 flex items-center gap-1.5 font-sans font-semibold">
          {score >= 3 ? (
            <ShieldCheck size={12} style={{ color }} />
          ) : score >= 2 ? (
            <Shield size={12} style={{ color }} />
          ) : (
            <ShieldAlert size={12} style={{ color }} />
          )}
          Complexité du mot de passe
        </span>
        <span
          className="font-bold uppercase tracking-wider px-2 py-0.5 rounded text-[9px] border"
          style={{
            color,
            borderColor: `${color}40`,
            backgroundColor: `${color}15`,
          }}
        >
          {label}
        </span>
      </div>

      {/* 4 Segment Progress Bar */}
      <div className="grid grid-cols-4 gap-1.5 h-1.5">
        {[1, 2, 3, 4].map((step) => {
          const isActive = score >= step;
          return (
            <div
              key={step}
              className="h-full rounded-full transition-all duration-300"
              style={{
                backgroundColor: isActive ? color : 'rgba(255, 255, 255, 0.08)',
                boxShadow: isActive ? `0 0 8px ${color}80` : 'none',
              }}
            />
          );
        })}
      </div>

      {/* Criteria Checklist */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pt-1 text-[10px] font-mono">
        {criteria.map((c) => (
          <div
            key={c.id}
            className={`flex items-center gap-1.5 transition-colors ${
              c.met ? 'text-emerald-400' : 'text-slate-500'
            }`}
          >
            {c.met ? (
              <Check size={11} className="text-emerald-400 shrink-0" />
            ) : (
              <X size={11} className="text-slate-600 shrink-0" />
            )}
            <span className="truncate">{c.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
