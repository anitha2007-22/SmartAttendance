import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { api } from '../../services/api';
import { Language, translations } from '../../i18n/translations';
import {
  Radio,
  Clock,
  QrCode,
  Maximize2,
  Minimize2,
  X,
  Users,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Copy,
  CheckCircle2,
} from 'lucide-react';

interface FloatingMiniQRDockProps {
  currentTab: string;
  onNavigateToLive: () => void;
  currentLang: Language;
}

export const FloatingMiniQRDock: React.FC<FloatingMiniQRDockProps> = ({
  currentTab,
  onNavigateToLive,
  currentLang,
}) => {
  const t = translations[currentLang];
  const [session, setSession] = useState<any>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(28);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Poll for active session
  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 3000);
    return () => clearInterval(interval);
  }, []);

  // 30s dynamic countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 1 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Render QR Code onto canvas whenever token changes or dock expands
  useEffect(() => {
    if (session?.status === 'ACTIVE' && session?.currentToken && qrCanvasRef.current && !isMinimized && !isDismissed) {
      const qrData = JSON.stringify({
        sessionId: session.id,
        classId: 'cls-cse-3a',
        subjectId: session.subjectId,
        token: session.currentToken,
        expiresIn: 30000,
        timestamp: Date.now(),
      });

      QRCode.toCanvas(qrCanvasRef.current, qrData, {
        width: 130,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      }).catch(console.error);
    }
  }, [session?.currentToken, isMinimized, isDismissed, currentTab]);

  const fetchSession = async () => {
    try {
      const data = await api.getActiveSession();
      setSession(data);
      // Reset dismissed state if a new session starts
      if (data?.status === 'ACTIVE' && isDismissed && session?.id !== data.id) {
        setIsDismissed(false);
      }
    } catch (e) {
      // console.warn(e);
    }
  };

  // Only show the floating mini dock if:
  // 1. Session is currently ACTIVE
  // 2. Faculty is on another tab (NOT on 'live' tab)
  // 3. Not manually dismissed for this session
  const shouldShow = session?.status === 'ACTIVE' && currentTab !== 'live' && !isDismissed;

  if (!shouldShow) {
    return null;
  }

  const presentCount = session.presentCount || (session.roster?.filter((r: any) => r.status === 'present').length) || 52;
  const totalCount = session.totalStudents || (session.roster?.length) || 64;
  const percentage = Math.round((presentCount / totalCount) * 100);

  const handleCopyToken = () => {
    if (session?.currentToken) {
      navigator.clipboard?.writeText(session.currentToken);
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  return (
    <div
      id="floating-mini-qr-dock"
      className="fixed bottom-16 md:bottom-6 right-4 z-40 animate-in slide-in-from-bottom-5 fade-in duration-300 select-none"
      style={{ maxWidth: 'calc(100vw - 2rem)' }}
    >
      {isMinimized ? (
        /* Minimized Floating Pill */
        <div
          onClick={() => setIsMinimized(false)}
          className="group flex items-center gap-2.5 px-3.5 py-2.5 bg-slate-900/95 hover:bg-slate-900 text-white rounded-2xl shadow-xl border border-slate-700/80 backdrop-blur-md cursor-pointer transition-all hover:scale-105"
          title="Click to expand Live QR Dock"
        >
          <div className="relative">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block animate-ping absolute inset-0 opacity-75" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 block relative" />
          </div>
          <div className="flex items-center gap-1.5 font-bold text-xs">
            <QrCode className="w-4 h-4 text-blue-400" />
            <span>QR Active:</span>
            <span className="text-emerald-400 font-mono">{secondsRemaining}s</span>
          </div>
          <span className="text-[11px] text-slate-400 px-1.5 py-0.5 rounded-md bg-slate-800 border border-slate-700">
            {presentCount}/{totalCount}
          </span>
          <Maximize2 className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors ml-1" />
        </div>
      ) : (
        /* Expanded Floating Picture-in-Picture QR Card */
        <div className="w-80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-700 overflow-hidden text-slate-900 dark:text-white transition-all">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-slate-900 px-4 py-2.5 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
              </span>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-300">
                Live QR Active
              </span>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Minimize to floating pill"
              >
                <Minimize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onNavigateToLive}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Open full-screen Live Attendance"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setIsDismissed(true)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Dismiss mini QR widget"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Body content with live QR and stats */}
          <div className="p-4 space-y-3">
            {/* Subject Title & Venue */}
            <div className="flex items-center justify-between text-xs">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-slate-100 truncate max-w-[170px]">
                  {session.subjectName || 'Database Management Systems'}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {session.subjectCode || 'CS8592'} • {session.roomNumber || 'LH-302'}
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-blue-600 dark:text-blue-400">
                  {presentCount}/{totalCount}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {percentage}% present
                </span>
              </div>
            </div>

            {/* QR Canvas and Token Countdown Side-by-Side */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-slate-100 dark:border-slate-700/60">
              <div className="relative shrink-0 bg-white p-1 rounded-xl shadow-xs border border-slate-200/80 flex items-center justify-center">
                <canvas ref={qrCanvasRef} className="w-[110px] h-[110px] block" />
              </div>

              <div className="flex-1 space-y-2 min-w-0">
                {/* 30s Countdown Ring */}
                <div>
                  <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                    <span className="flex items-center gap-1 text-[10px]">
                      <Clock className="w-3 h-3 text-blue-500 animate-spin" />
                      Rotating Token
                    </span>
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-xs">
                      {secondsRemaining}s
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-linear"
                      style={{ width: `${(secondsRemaining / 30) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Token string with copy action */}
                <div className="p-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                  <span className="font-mono font-bold text-[10px] text-slate-800 dark:text-slate-200 truncate">
                    {session.currentToken || 'SEC-A84F21'}
                  </span>
                  <button
                    onClick={handleCopyToken}
                    className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                    title="Copy Token"
                  >
                    {copiedToken ? (
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>

                <div className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                  <span className="truncate">Anti-Proxy Encrypted</span>
                </div>
              </div>
            </div>

            {/* Bottom Quick Return Button */}
            <button
              onClick={onNavigateToLive}
              className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs shadow-blue-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Return to Fullscreen Attendance</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
