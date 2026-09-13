import React, { useState } from 'react';
import { AuditLog } from '../../types';
import { INSTITUTION_CONFIG } from '../../data/mockDatabase';
import { Language, translations } from '../../i18n/translations';
import {
  Sliders,
  ShieldCheck,
  Bell,
  MapPin,
  Save,
  CheckCircle2,
  History,
  RotateCw,
} from 'lucide-react';

interface SystemSettingsProps {
  auditLogs: AuditLog[];
  currentLang: Language;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({ auditLogs, currentLang }) => {
  const t = translations[currentLang];
  const [minThreshold, setMinThreshold] = useState<number>(75);
  const [warningThreshold, setWarningThreshold] = useState<number>(80);
  const [geofenceRadius, setGeofenceRadius] = useState<number>(50);
  const [qrExpirySeconds, setQrExpirySeconds] = useState<number>(20);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <Sliders className="w-5 h-5 text-blue-600" />
          <span>Institutional Policies & Verification Configuration</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure global attendance thresholds, geofence radius tolerances, dynamic token rolling speeds, and automated warning triggers
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>System policy configurations updated and recorded in compliance audit log.</span>
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Box 1: Compliance Thresholds */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Attendance Compliance Thresholds</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Mandatory Debarment Cutoff Percentage (%)
              </label>
              <input
                type="number"
                min="50"
                max="90"
                value={minThreshold}
                onChange={(e) => setMinThreshold(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Students below this value at semester end will be debarred from writing Anna University theory/lab exams.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Early Warning Buffer Trigger (%)
              </label>
              <input
                type="number"
                min="60"
                max="95"
                value={warningThreshold}
                onChange={(e) => setWarningThreshold(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Triggers proactive What-If recommendations and faculty advisory alerts before threshold is crossed.
              </p>
            </div>
          </div>
        </div>

        {/* Box 2: Anti-Proxy & QR Security Parameters */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-blue-600" />
            <span>Anti-Proxy & Geofence Security Engine</span>
          </h2>

          <div className="space-y-4 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Classroom Geofence Radius (Meters)
              </label>
              <input
                type="number"
                min="10"
                max="500"
                value={geofenceRadius}
                onChange={(e) => setGeofenceRadius(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Scans outside this radial distance from LH-302 (11.0168° N, 76.9558° E) trigger high-severity anomalies.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Dynamic QR Token Rotation Window (Seconds)
              </label>
              <input
                type="number"
                min="10"
                max="60"
                value={qrExpirySeconds}
                onChange={(e) => setQrExpirySeconds(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl border border-slate-200"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Interval at which cryptographic QR tokens cycle to render forwarded screenshots useless.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save & Apply Policy Updates</span>
          </button>
        </div>
      </form>

      {/* Immutable Audit Logs Viewer */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-blue-600" />
              <span>Immutable System Audit Trail</span>
            </h2>
            <p className="text-xs text-slate-500">
              Cryptographically verified modification records with mandatory justification logs
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border border-slate-200">
            <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] font-bold">
              <tr>
                <th className="p-3 border">Timestamp</th>
                <th className="p-3 border">Actor</th>
                <th className="p-3 border">Action Type</th>
                <th className="p-3 border">Target Entity</th>
                <th className="p-3 border">Old → New Value</th>
                <th className="p-3 border">Mandatory Justification Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3 border font-mono text-[11px] text-slate-500 whitespace-nowrap">
                    {log.timestamp}
                  </td>
                  <td className="p-3 border font-semibold">
                    {log.userName}{' '}
                    <span className="text-[10px] uppercase font-bold text-slate-400">({log.userRole})</span>
                  </td>
                  <td className="p-3 border font-mono font-bold text-blue-700">{log.action}</td>
                  <td className="p-3 border text-slate-600">{log.targetEntity} • {log.targetId}</td>
                  <td className="p-3 border font-semibold text-slate-800">
                    {log.oldValue ? `${log.oldValue} → ${log.newValue}` : log.newValue || 'Updated'}
                  </td>
                  <td className="p-3 border text-slate-600 italic">{log.reason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
