import React from 'react';
import { RiskPrediction } from '../../types';
import { RiskIndicator } from '../common/RiskIndicator';
import {
  ShieldAlert,
  Sparkles,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Brain,
  Sliders,
  ArrowRight,
  UserCheck,
  Bell,
} from 'lucide-react';

interface RiskExplainerModalProps {
  prediction: RiskPrediction;
  onClose?: () => void;
  onOpenWhatIf?: () => void;
}

export const RiskExplainerModal: React.FC<RiskExplainerModalProps> = ({
  prediction,
  onClose,
  onOpenWhatIf,
}) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
            <Brain className="w-4 h-4" />
            <span>Explainable AI (XAI) Attendance Risk Framework</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Why is {prediction.studentName} classified as {prediction.riskLevel} Risk?
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Transparent algorithmic factor attribution and early-intervention guidance
          </p>
        </div>

        <div className="shrink-0">
          <RiskIndicator level={prediction.riskLevel} size="lg" />
        </div>
      </div>

      {/* Primary Forecast Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Current Attendance</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            {prediction.overallAttendance}%
          </div>
          <p className="text-xs text-rose-600 font-semibold mt-1">2.6% below 75% threshold</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Forecast Next Month</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">
            {prediction.predictedAttendanceNextMonth}%
          </div>
          <p className="text-xs text-slate-500 mt-1">Projected if trajectory continues</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Velocity Change</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">
            {prediction.trendPercentageChange}%
          </div>
          <p className="text-xs text-slate-500 mt-1">Steep negative 3-week decline</p>
        </div>
      </div>

      {/* Feature Attribution Weights */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-600" />
            <span>AI Model Feature Attribution Weights</span>
          </h2>
          <span className="text-xs text-slate-500 font-mono">Random Forest & Gradient Boosting XAI</span>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>1. Negative Attendance Velocity (3-Week Slope)</span>
              <span className="text-blue-600 font-bold">42% Attribution</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-blue-600 rounded-full" style={{ width: '42%' }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>2. Consecutive Missed Classes (3 DBMS Sessions)</span>
              <span className="text-indigo-600 font-bold">28% Attribution</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-600 rounded-full" style={{ width: '28%' }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>3. Low Subject Performance (DBMS 61.9%, CN 58.3%)</span>
              <span className="text-amber-600 font-bold">20% Attribution</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-amber-500 rounded-full" style={{ width: '20%' }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700 mb-1">
              <span>4. Temporal Clustering (Mon/Fri Afternoon Slump)</span>
              <span className="text-slate-600 font-bold">10% Attribution</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-slate-600 rounded-full" style={{ width: '10%' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Concrete Explainable Reasons List */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500" />
          <span>Specific Risk Factors Identified</span>
        </h2>

        <div className="space-y-2.5">
          {prediction.reasons.map((reason, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-start gap-3 text-xs">
              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[11px]">
                {idx + 1}
              </span>
              <p className="text-slate-800 leading-relaxed">{reason}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended Action Box */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-5 sm:p-6 rounded-2xl shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
          <Sparkles className="w-4 h-4" />
          <span>Recommended Early Intervention</span>
        </div>
        <p className="text-sm text-slate-100 leading-relaxed">
          {prediction.recommendedAction}
        </p>

        {onOpenWhatIf && (
          <div className="pt-2">
            <button
              onClick={onOpenWhatIf}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors flex items-center gap-2 cursor-pointer"
            >
              <span>Launch What-If Recovery Simulator</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
