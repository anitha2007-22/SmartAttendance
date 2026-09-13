import React, { useState } from 'react';
import { AnomalyEvent, AnomalySeverity } from '../../types';
import { api } from '../../services/api';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { Language, translations } from '../../i18n/translations';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Eye,
  Sliders,
  Sparkles,
  User,
  Clock,
  MapPin,
  Smartphone,
  Check,
} from 'lucide-react';

interface AnomalyReviewPanelProps {
  anomalies: AnomalyEvent[];
  onRefresh?: () => void;
  currentLang: Language;
}

export const AnomalyReviewPanel: React.FC<AnomalyReviewPanelProps> = ({
  anomalies,
  onRefresh,
  currentLang,
}) => {
  const t = translations[currentLang];
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [reviewingEvent, setReviewingEvent] = useState<AnomalyEvent | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReviewAction = async (status: 'reviewed' | 'cleared' | 'confirmed_proxy') => {
    if (!reviewingEvent) return;
    setIsSubmitting(true);
    try {
      await api.reviewAnomaly(reviewingEvent.id, reviewNotes || 'Human faculty review completed.', status);
      setReviewingEvent(null);
      setReviewNotes('');
      if (onRefresh) onRefresh();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = anomalies.filter(
    (a) => selectedSeverity === 'all' || a.severity === selectedSeverity
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider">
            <ShieldAlert className="w-4 h-4" />
            <span>Anti-Proxy Security Engine</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Suspicious Attendance & Anomaly Review Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Human-in-the-loop validation: AI flags potential proxy patterns for authorized faculty decision
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {(['all', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <button
              key={sev}
              onClick={() => setSelectedSeverity(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedSeverity === sev
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sev === 'all' ? 'All Alerts' : sev}
            </button>
          ))}
        </div>
      </div>

      {/* AI Safety Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold block">AI Safety & Institutional Fairness Principle:</span>
          <p className="text-blue-800 leading-relaxed">
            Attendance algorithms detect statistical signals (e.g. impossible velocity, token forwarding delay, hardware duplicates) with a calculated confidence percentage. No disciplinary actions or penalties are executed automatically without verified faculty sign-off.
          </p>
        </div>
      </div>

      {/* Anomalies List */}
      <div className="space-y-4">
        {filtered.map((anomaly) => {
          const isHigh = anomaly.severity === 'HIGH';
          const isMed = anomaly.severity === 'MEDIUM';
          const isPending = anomaly.status === 'pending_review';

          return (
            <div
              key={anomaly.id}
              className={`p-5 rounded-2xl border bg-white shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                isPending ? 'border-amber-200 ring-1 ring-amber-400/20' : 'border-slate-200'
              }`}
            >
              <div className="space-y-2.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                      isHigh
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : isMed
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {anomaly.severity} Severity
                  </span>

                  <span className="text-xs font-mono font-semibold text-slate-500">
                    ID: {anomaly.id}
                  </span>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      isPending
                        ? 'bg-amber-100 text-amber-900 animate-pulse'
                        : 'bg-emerald-100 text-emerald-900'
                    }`}
                  >
                    Status: {anomaly.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span>{anomaly.studentName}</span>
                    <span className="text-xs font-mono font-normal text-slate-500">
                      ({anomaly.rollNumber})
                    </span>
                    <span>•</span>
                    <span className="text-xs font-medium text-slate-600">{anomaly.subjectName}</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80 leading-relaxed font-sans">
                    {anomaly.reason}
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {anomaly.date} at {anomaly.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <ConfidenceBadge score={anomaly.confidenceScore} size="sm" />
                  </span>
                  {anomaly.reviewedBy && (
                    <span className="text-emerald-700 font-medium">
                      Reviewed by {anomaly.reviewedBy}
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100">
                {isPending ? (
                  <button
                    onClick={() => setReviewingEvent(anomaly)}
                    className="w-full lg:w-auto px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Review & Take Action</span>
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Signed Off</span>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Dialog Modal */}
      {reviewingEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Faculty Anti-Proxy Investigation
                </h3>
              </div>
              <button
                onClick={() => setReviewingEvent(null)}
                className="text-slate-400 hover:text-slate-600 text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <p>
                  <strong>Student:</strong> {reviewingEvent.studentName} ({reviewingEvent.rollNumber})
                </p>
                <p className="mt-1">
                  <strong>Subject:</strong> {reviewingEvent.subjectName}
                </p>
                <p className="mt-1">
                  <strong>Timestamp:</strong> {reviewingEvent.date} {reviewingEvent.time}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-900">
                <strong>Algorithmic Detection Reason:</strong>
                <p className="mt-1 leading-relaxed">{reviewingEvent.reason}</p>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Faculty Review Notes & Resolution
                </label>
                <textarea
                  rows={3}
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="e.g. Student provided valid medical leave note / IP glitch verified on campus Wi-Fi AP..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                onClick={() => handleReviewAction('cleared')}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Clear Anomaly (Mark Genuine)
              </button>
              <button
                onClick={() => handleReviewAction('confirmed_proxy')}
                disabled={isSubmitting}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer"
              >
                Confirm Proxy (Reject Attendance)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
