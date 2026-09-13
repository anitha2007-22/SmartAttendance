import React from 'react';
import { ClassHealthScore } from '../../types';
import { HealthScoreGauge } from '../common/HealthScoreGauge';
import { ATTENDANCE_HEATMAP_DATA } from '../../data/mockDatabase';
import { Language, translations } from '../../i18n/translations';
import {
  Activity,
  Calendar,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface ClassHealthViewProps {
  healthScores: ClassHealthScore[];
  currentLang: Language;
}

export const ClassHealthView: React.FC<ClassHealthViewProps> = ({ healthScores, currentLang }) => {
  const t = translations[currentLang];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600" />
          <span>Class Attendance Health Index & Heatmaps</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Holistic 0–100 index calculating rate consistency, low-risk student ratio, trend stability, and anti-proxy cleanliness
        </p>
      </div>

      {/* Class Health Score Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {healthScores.map((scoreObj) => (
          <div
            key={scoreObj.classId}
            className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-5 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{scoreObj.department}</span>
                  <h2 className="text-base font-bold text-slate-900 mt-0.5">{scoreObj.className}</h2>
                </div>
              </div>

              <div className="my-4 flex justify-center">
                <HealthScoreGauge score={scoreObj.score} size={130} sublabel={scoreObj.status} />
              </div>

              {/* Breakdown Bars */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Attendance Rate (40%)</span>
                    <span className="font-bold">{scoreObj.breakdown.attendanceRateScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: `${scoreObj.breakdown.attendanceRateScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Trend Stability (25%)</span>
                    <span className="font-bold">{scoreObj.breakdown.trendStabilityScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${scoreObj.breakdown.trendStabilityScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Low-Risk Ratio (20%)</span>
                    <span className="font-bold">{scoreObj.breakdown.lowRiskRatioScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-600 rounded-full" style={{ width: `${scoreObj.breakdown.lowRiskRatioScore}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-slate-600 mb-1">
                    <span>Anti-Proxy Cleanliness (15%)</span>
                    <span className="font-bold">{scoreObj.breakdown.anomalyRateScore}/100</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${scoreObj.breakdown.anomalyRateScore}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Key Insights List */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 text-xs space-y-1.5">
              <span className="font-bold text-slate-700 block">Key Observations:</span>
              {scoreObj.insights.map((insight, idx) => (
                <p key={idx} className="text-slate-600 text-[11px] leading-relaxed">
                  • {insight}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Hourly Attendance Heatmap */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="pb-2 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>Full Semester Time-Slot Attendance Heatmap</span>
            </h2>
            <p className="text-xs text-slate-500">
              Correlates subject periods with student presence density
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-400" /> &gt;85% High</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-400" /> 75-85% Normal</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-rose-400" /> &lt;75% Slump</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[650px] grid grid-cols-5 gap-3">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => {
              const dayCells = ATTENDANCE_HEATMAP_DATA.filter((c) => c.day === day);
              return (
                <div key={day} className="space-y-2">
                  <div className="text-center font-bold text-xs text-slate-800 p-1.5 bg-slate-100 rounded-lg">
                    {day}
                  </div>
                  {dayCells.map((cell, idx) => {
                    const isLow = cell.attendancePercent < 75;
                    const isMed = cell.attendancePercent >= 75 && cell.attendancePercent < 85;
                    const bg = isLow
                      ? 'bg-rose-100 text-rose-950 border-rose-300'
                      : isMed
                      ? 'bg-blue-100 text-blue-950 border-blue-300'
                      : 'bg-emerald-100 text-emerald-950 border-emerald-300';
                    return (
                      <div
                        key={idx}
                        className={`p-2.5 rounded-xl border text-center transition-all hover:scale-102 cursor-default ${bg}`}
                      >
                        <div className="text-[10px] font-semibold opacity-75 truncate">{cell.subject}</div>
                        <div className="text-sm font-extrabold">{cell.attendancePercent}%</div>
                        <div className="text-[9px] opacity-60 font-mono">{cell.timeSlot.split(' ')[0]}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
