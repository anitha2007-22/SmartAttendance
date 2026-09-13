import React, { useState } from 'react';
import { AtRiskEmailAlert, RiskPrediction } from '../../types';
import { notificationService } from '../../services/notificationService';
import {
  Mail,
  Send,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Clock,
  User,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface EmailAlertModalProps {
  isOpen: boolean;
  student: RiskPrediction | null;
  onClose: () => void;
  onAlertSent?: (alert: AtRiskEmailAlert) => void;
}

export const EmailAlertModal: React.FC<EmailAlertModalProps> = ({
  isOpen,
  student,
  onClose,
  onAlertSent,
}) => {
  const [isSending, setIsSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [customAction, setCustomAction] = useState('');

  if (!isOpen || !student) return null;

  const triggerInfo = notificationService.evaluateRiskTriggers(student);

  const handleSend = async () => {
    setIsSending(true);
    try {
      const studentToAlert = {
        ...student,
        recommendedAction: customAction.trim() || student.recommendedAction,
      };
      const alert = await notificationService.sendAtRiskEmailAlert(studentToAlert);
      setSentSuccess(true);
      if (onAlertSent) onAlertSent(alert);
      setTimeout(() => {
        setSentSuccess(false);
        setCustomAction('');
        onClose();
      }, 1400);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Automated At-Risk Email Dispatch
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Early Warning & Attendance Recovery Notice
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {sentSuccess ? (
            <div className="py-8 text-center space-y-3 animate-in zoom-in-95">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">Email Dispatched Successfully!</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Official attendance alert has been sent to <strong>{student.studentName}</strong> and CC'd to academic advisors.
              </p>
            </div>
          ) : (
            <>
              {/* Recipient Details */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Recipient:</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {student.studentName} ({student.rollNumber})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Student Email:</span>
                  <span className="font-mono text-blue-600 dark:text-blue-400 font-semibold">
                    {student.studentName.toLowerCase().replace(/\s+/g, '.')}@institution.edu
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Current Attendance:</span>
                  <span className="font-bold text-rose-600 dark:text-rose-400">
                    {student.overallAttendance}% (Deficit: {(Math.max(0, 75 - student.overallAttendance)).toFixed(1)}%)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">Risk Priority:</span>
                  <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                    student.riskLevel === 'HIGH' ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                  }`}>
                    {student.riskLevel} Priority Trigger
                  </span>
                </div>
              </div>

              {/* Trigger Analysis */}
              <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 text-xs text-rose-950 dark:text-rose-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-rose-900 dark:text-rose-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                  <span>Automated Risk Trigger Cause</span>
                </div>
                <p className="text-[11px] text-rose-800 dark:text-rose-300 leading-relaxed">
                  {triggerInfo.triggerReason}
                </p>
              </div>

              {/* Action Plan Guidance */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Corrective Action Plan / Instructions
                </label>
                <textarea
                  value={customAction}
                  onChange={(e) => setCustomAction(e.target.value)}
                  placeholder={student.recommendedAction || 'e.g. Attend all remaining 14 classes to achieve 75%+ eligibility...'}
                  rows={3}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none resize-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              {/* Modal Footer Actions */}
              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 min-h-[42px] rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSend}
                  disabled={isSending}
                  className="px-5 py-2.5 min-h-[42px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSending ? (
                    <span>Sending Alert...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Email Alert</span>
                    </>
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
