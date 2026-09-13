import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { api } from '../../services/api';
import { Language, translations } from '../../i18n/translations';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import {
  Radio,
  Clock,
  QrCode,
  Users,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCw,
  Edit3,
  CheckCircle2,
  XCircle,
  Search,
  Sliders,
  Sparkles,
  Download,
} from 'lucide-react';

interface LiveAttendanceSessionProps {
  currentLang: Language;
}

export const LiveAttendanceSession: React.FC<LiveAttendanceSessionProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const [session, setSession] = useState<any>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(28);
  const [roster, setRoster] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent' | 'flagged'>('all');
  
  // Manual override modal state
  const [overrideModalStudent, setOverrideModalStudent] = useState<any | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<string>('present');
  const [overrideReason, setOverrideReason] = useState<string>('');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);
  const [overrideSuccessMsg, setOverrideSuccessMsg] = useState('');

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Load session
  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 3000);
    return () => clearInterval(interval);
  }, []);

  // Countdown timer locally with 30s cycle
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Render QR Code onto canvas whenever token changes
  useEffect(() => {
    if (session?.currentToken && qrCanvasRef.current) {
      const qrData = JSON.stringify({
        sessionId: session.id,
        classId: 'cls-cse-3a',
        subjectId: session.subjectId,
        token: session.currentToken,
        expiresIn: 30000,
        timestamp: Date.now(),
      });

      QRCode.toCanvas(qrCanvasRef.current, qrData, {
        width: 220,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      }).catch(console.error);
    }
  }, [session?.currentToken]);

  const fetchSession = async () => {
    try {
      const data = await api.getActiveSession();
      setSession(data);
      if (data.roster) {
        setRoster(data.roster);
      }
    } catch (e) {
      console.warn(e);
    }
  };

  const handleEndSession = async () => {
    try {
      await fetch('/api/attendance/session/end', { method: 'POST' });
      fetchSession();
    } catch (e) {
      console.warn(e);
    }
  };

  const handleStartSession = async () => {
    try {
      await fetch('/api/attendance/session/start', { method: 'POST' });
      fetchSession();
    } catch (e) {
      console.warn(e);
    }
  };

  const handleExecuteOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!overrideModalStudent || !overrideReason.trim()) return;

    setIsSubmittingOverride(true);
    try {
      const res = await api.manualOverride({
        studentId: overrideModalStudent.id,
        newStatus: overrideStatus,
        reason: overrideReason.trim(),
        facultyId: 'fac-001',
        facultyName: 'Dr. R. Ramanathan',
      });

      setOverrideSuccessMsg('Override recorded in immutable audit trail!');
      setTimeout(() => {
        setOverrideModalStudent(null);
        setOverrideReason('');
        setOverrideSuccessMsg('');
        fetchSession();
      }, 1200);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  const filteredRoster = roster.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'present' && s.status === 'present') ||
      (statusFilter === 'absent' && s.status === 'absent') ||
      (statusFilter === 'flagged' && s.isFlagged);
    return matchesSearch && matchesStatus;
  });

  const presentCount = roster.filter((s) => s.status === 'present').length;
  const totalCount = roster.length || 35;
  const attendanceRate = Number(((presentCount / totalCount) * 100).toFixed(1));

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Session Title Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>CS8592 • Database Management Systems</span>
            <span>•</span>
            <span>LH-302</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-600 animate-pulse" />
            <span>Live Dynamic Attendance Controller</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Auto-rotating cryptographic token with multi-layer verification signals
          </p>
        </div>

        <div className="flex items-center gap-3">
          {session?.status === 'active' ? (
            <button
              id="btn-end-session"
              onClick={handleEndSession}
              className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs border border-rose-200 transition-colors cursor-pointer"
            >
              End Attendance Session
            </button>
          ) : (
            <button
              id="btn-restart-session"
              onClick={handleStartSession}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors cursor-pointer"
            >
              Re-Open Dynamic QR Session
            </button>
          )}
        </div>
      </div>

      {/* Main Grid: QR Projector Display on Left, Real-Time KPIs on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 5 Cols: Dynamic QR Projector Viewport */}
        <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 text-white p-6 rounded-2xl shadow-xl flex flex-col items-center justify-between text-center border border-slate-800 space-y-4">
          <div className="flex items-center justify-between w-full border-b border-slate-800 pb-3">
            <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>PROJECTOR READY</span>
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Geofence: 50m</span>
          </div>

          {/* QR Canvas Box */}
          <div className="relative p-4 bg-white rounded-2xl shadow-2xl flex flex-col items-center">
            <canvas ref={qrCanvasRef} className="rounded-lg shadow-inner" />
            <div className="mt-3 flex items-center gap-2 text-xs font-mono font-bold text-slate-900 bg-slate-100 px-3 py-1 rounded-lg">
              <span>Token:</span>
              <span className="text-blue-600 tracking-wider">{session?.currentToken || 'SEC-A84F21'}</span>
            </div>
          </div>

          {/* Rolling Timer Bar */}
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Token refreshes in:</span>
              </span>
              <span className="font-mono font-bold text-amber-400">
                00:{secondsRemaining.toString().padStart(2, '0')}s
              </span>
            </div>
            <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-amber-400 transition-all duration-1000 ease-linear"
                style={{ width: `${(secondsRemaining / 30) * 100}%` }}
              />
            </div>
          </div>

          <p className="text-[11px] text-slate-400 max-w-xs">
            Dynamic QR rotates automatically every 30 seconds. Students can scan or write the 6-character token to mark verified attendance.
          </p>

          <div className="w-full p-2.5 rounded-xl bg-blue-950/60 border border-blue-800/60 text-left flex items-start gap-2 text-[11px] text-blue-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Picture-in-Picture Dock:</strong> Feel free to switch tabs (Dashboard, Analytics, Reports) — the live QR stays visible in a small floating tab at the bottom right.
            </span>
          </div>
        </div>

        {/* Right 7 Cols: Real-Time Attendance Statistics */}
        <div className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Metric 1: Verified Present */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Present</span>
              <div className="text-3xl font-extrabold text-emerald-600 mt-1">
                {presentCount} <span className="text-sm font-normal text-slate-400">/ {totalCount}</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">{attendanceRate}% of class verified</p>
            </div>

            {/* Metric 2: Absent / Pending */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unmarked</span>
              <div className="text-3xl font-extrabold text-slate-700 mt-1">
                {totalCount - presentCount}
              </div>
              <p className="text-xs text-slate-500 mt-1">Pending scan or absent</p>
            </div>

            {/* Metric 3: Flagged Suspicious */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Flagged</span>
              <div className="text-3xl font-extrabold text-amber-600 mt-1">
                1 Case
              </div>
              <p className="text-xs text-slate-500 mt-1">Madurai IP anomaly</p>
            </div>
          </div>

          {/* Quick Roster Filter & Search */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search student by name or roll number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                {(['all', 'present', 'absent', 'flagged'] as const).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setStatusFilter(filter)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer ${
                      statusFilter === filter
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            {/* Live Student Table */}
            <div className="overflow-x-auto max-h-[380px] overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider sticky top-0">
                  <tr>
                    <th className="p-3">Student</th>
                    <th className="p-3">Roll No</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Verified Time</th>
                    <th className="p-3">Confidence</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRoster.map((student) => {
                    const isPresent = student.status === 'present';
                    const isFlagged = student.isFlagged;
                    return (
                      <tr key={student.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-semibold text-slate-900">
                          {student.name}
                        </td>
                        <td className="p-3 text-slate-500 font-mono">{student.rollNumber}</td>
                        <td className="p-3">
                          {isFlagged ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                              <AlertTriangle className="w-3 h-3" /> Flagged
                            </span>
                          ) : isPresent ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" /> Present
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                              <XCircle className="w-3 h-3" /> Absent
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-500">{student.time || '—'}</td>
                        <td className="p-3">
                          {isPresent ? (
                            <ConfidenceBadge score={student.confidence || 96} size="sm" />
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setOverrideModalStudent(student);
                              setOverrideStatus(isPresent ? 'absent' : 'present');
                            }}
                            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                            title="Manual Override with Audit Justification"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Manual Override Dialog Modal */}
      {overrideModalStudent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-slate-900">Manual Attendance Override</h3>
              </div>
              <button
                onClick={() => setOverrideModalStudent(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div>
                Target Student: <strong className="text-slate-900">{overrideModalStudent.name}</strong> ({overrideModalStudent.rollNumber})
              </div>
              <div>Current Status: <span className="font-semibold capitalize">{overrideModalStudent.status}</span></div>
            </div>

            <form onSubmit={handleExecuteOverride} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Set New Attendance Status</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setOverrideStatus('present')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      overrideStatus === 'present'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Mark Present
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverrideStatus('absent')}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                      overrideStatus === 'absent'
                        ? 'bg-rose-50 text-rose-800 border-rose-300 ring-2 ring-rose-500/20'
                        : 'bg-white text-slate-600 border-slate-200'
                    }`}
                  >
                    Mark Absent
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Mandatory Audit Justification Reason <span className="text-rose-600">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Approved medical prescription from campus clinic #MED-8819..."
                  value={overrideReason}
                  onChange={(e) => setOverrideReason(e.target.value)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  This explanation is permanently committed to the immutable compliance audit log.
                </p>
              </div>

              {overrideSuccessMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{overrideSuccessMsg}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setOverrideModalStudent(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOverride || overrideReason.trim().length < 4}
                  className="px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-xs cursor-pointer"
                >
                  {isSubmittingOverride ? 'Recording Audit...' : 'Confirm & Commit Override'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
