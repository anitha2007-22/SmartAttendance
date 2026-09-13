import React from 'react';
import { RiskLevel } from '../../types';
import { ShieldAlert, AlertCircle, CheckCircle2 } from 'lucide-react';

interface RiskIndicatorProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const RiskIndicator: React.FC<RiskIndicatorProps> = ({ level, size = 'md', showLabel = true }) => {
  const configs = {
    HIGH: {
      bg: 'bg-rose-50 border-rose-200 text-rose-700',
      dot: 'bg-rose-500 animate-pulse',
      icon: ShieldAlert,
      label: 'High Attendance Risk',
    },
    MEDIUM: {
      bg: 'bg-amber-50 border-amber-200 text-amber-700',
      dot: 'bg-amber-500',
      icon: AlertCircle,
      label: 'Medium Risk (Warning)',
    },
    LOW: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
      label: 'Healthy Standing',
    },
  }[level];

  const Icon = configs.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1.5',
    md: 'text-xs px-2.5 py-1 gap-2 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-semibold',
  }[size];

  return (
    <span className={`inline-flex items-center rounded-full border ${configs.bg} ${sizeClasses}`}>
      <span className={`w-2 h-2 rounded-full ${configs.dot}`} />
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      {showLabel && <span>{configs.label}</span>}
    </span>
  );
};
