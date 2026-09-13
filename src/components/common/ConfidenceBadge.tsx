import React from 'react';
import { ShieldCheck, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ConfidenceBadgeProps {
  score: number;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const ConfidenceBadge: React.FC<ConfidenceBadgeProps> = ({ score, showIcon = true, size = 'md' }) => {
  let colorClasses = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let Icon = ShieldCheck;

  if (score < 50) {
    colorClasses = 'bg-rose-50 text-rose-700 border-rose-200';
    Icon = ShieldAlert;
  } else if (score < 80) {
    colorClasses = 'bg-amber-50 text-amber-700 border-amber-200';
    Icon = AlertTriangle;
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span
      className={`inline-flex items-center rounded-full border ${colorClasses} ${sizeClasses}`}
      title={`Multi-layer verification confidence: ${score}%`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />}
      <span>{score}% Confidence</span>
    </span>
  );
};
