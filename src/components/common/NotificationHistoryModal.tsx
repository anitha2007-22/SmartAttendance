import React, { useState, useEffect } from 'react';
import { AtRiskEmailAlert, RiskPrediction } from '../../types';
import { notificationService } from '../../services/notificationService';
import {
  Mail,
  Send,
  CheckCircle2,
  Clock,
  RefreshCw,
  Search,
  Filter,
  X,
  Eye,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';

interface NotificationHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentsList?: RiskPrediction[];
}

export const NotificationHistoryModal: React.FC<NotificationHistoryModalProps> = ({
  isOpen,
  onClose,
  studentsList,
}) => {
  const [alerts, setAlerts] = useState<AtRiskEmailAlert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<AtRiskEmailAlert | null>(null);
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchResult, setBatchResult] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadAlerts();
      setSelectedAlert(null);
      setBatchResult(null);
    }
  }, [isOpen]);

  const loadAlerts = () => {
    setAlerts(notificationService.getAlertHistory());
  };

  const handleRunBatch = async () => {
    setIsBatchRunning(true);
    setBatchResult(null);
    try {
      const res = await notificationService.runAutomatedBatchDispatch(studentsList);
      loadAlerts();
      setBatchResult(`Successfully dispatched automated email alerts to ${res.dispatchedCount} at-risk students!`);
      setTimeout(() => setBatchResult(null), 4000);
    } catch (e) {
      console.error(e);
    } finally {
      setIsBatchRunning(false);
    }
  };

  if (!isOpen) return null;

  const filteredAlerts = alerts.filter(
    (a) =>
      a.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh] transition-colors">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                At-Risk Student Email Alert Logs
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Automated predictive early warning notifications
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleRunBatch}
              disabled={isBatchRunning}
              className="px-3.5 py-2 min-h-[38px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isBatchRunning ? 'animate-spin' : ''}`} />
              <span>{isBatchRunning ? 'Scanning & Sending...' : 'Auto-Scan & Alert'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 min-h-[38px] min-w-[38px] flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Batch Success Notice */}
        {batchResult && (
          <div className="px-6 py-3 bg-emerald-50 dark:bg-emerald-950/50 border-b border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{batchResult}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by student name, roll number, or email..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
            />
          </div>
        </div>

        {/* Alert List and Detail View */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredAlerts.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Mail className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p>No email alert records found matching your query.</p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                onClick={() => setSelectedAlert(selectedAlert?.id === alert.id ? null : alert)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  selectedAlert?.id === alert.id
                    ? 'border-blue-500 bg-blue-50/40 dark:bg-blue-950/30 ring-1 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      alert.riskLevel === 'HIGH' ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                    }`}>
                      {alert.studentName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 dark:text-slate-100">{alert.studentName}</span>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">({alert.rollNumber})</span>
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase ${
                          alert.riskLevel === 'HIGH' ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800' : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}>
                          {alert.attendancePercentage}% Attendance
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{alert.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 shrink-0 self-end sm:self-auto">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {alert.sentAt}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-bold text-[10px]">
                      {alert.status}
                    </span>
                  </div>
                </div>

                {/* Expanded Message View */}
                {selectedAlert?.id === alert.id && (
                  <div className="mt-3 pt-3 border-t border-slate-200/80 dark:border-slate-700 space-y-2 text-xs animate-in fade-in">
                    <div className="font-semibold text-slate-800 dark:text-slate-200">
                      Subject: <span className="font-normal text-slate-700 dark:text-slate-300">{alert.subject}</span>
                    </div>
                    <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono whitespace-pre-wrap leading-relaxed overflow-x-auto">
                      {alert.bodyPreview}
                    </pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 shrink-0">
          <span>Total Alerts Dispatched: <strong>{alerts.length}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
