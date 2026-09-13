import React from 'react';

interface HealthScoreGaugeProps {
  score: number; // 0 to 100
  size?: number;
  label?: string;
  sublabel?: string;
}

export const HealthScoreGauge: React.FC<HealthScoreGaugeProps> = ({
  score,
  size = 120,
  label = 'Class Health',
  sublabel,
}) => {
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  let strokeColor = '#10B981'; // green
  let statusText = 'Healthy';
  let badgeColor = 'text-emerald-700 bg-emerald-50 border-emerald-200';

  if (score < 70) {
    strokeColor = '#F43F5E'; // rose
    statusText = 'Needs Attention';
    badgeColor = 'text-rose-700 bg-rose-50 border-rose-200';
  } else if (score < 80) {
    strokeColor = '#F59E0B'; // amber
    statusText = 'Moderate';
    badgeColor = 'text-amber-700 bg-amber-50 border-amber-200';
  }

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="transform -rotate-90" width={size} height={size}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-2xl font-bold tracking-tight text-slate-800">{score}</span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">/100</span>
        </div>
      </div>

      {label && <span className="mt-2 text-xs font-medium text-slate-600">{label}</span>}
      <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badgeColor}`}>
        {sublabel || statusText}
      </span>
    </div>
  );
};
