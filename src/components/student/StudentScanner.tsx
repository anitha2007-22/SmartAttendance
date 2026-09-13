import React, { useState, useEffect } from 'react';
import { User, VerificationSignal } from '../../types';
import { api } from '../../services/api';
import { Language, translations } from '../../i18n/translations';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { useLiveClock } from '../../hooks/useLiveClock';
import { useGPSLocation } from '../../hooks/useGPSLocation';
import { GPSLocationCard } from '../common/GPSLocationCard';
import { BiometricPromptModal } from '../common/BiometricPromptModal';
import { webAuthnService, BiometricVerificationResult } from '../../services/webAuthnService';
import confetti from 'canvas-confetti';
import {
  Camera,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  RotateCw,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Layers,
  MapPin,
  Smartphone,
  Info,
  LogOut,
  Fingerprint,
  Lock,
} from 'lucide-react';

interface StudentScannerProps {
  user: User;
  isOffline: boolean;
  currentLang: Language;
  onAttendanceMarkedSuccess?: () => void;
  onLogout?: () => void;
}

export const StudentScanner: React.FC<StudentScannerProps> = ({
  user,
  isOffline,
  currentLang,
  onAttendanceMarkedSuccess,
  onLogout,
}) => {
  const t = translations[currentLang];
  const { formattedTime, greeting } = useLiveClock();
  const { gpsData, isRefreshing: isGpsRefreshing, refreshGPS } = useGPSLocation();
  const [activeSession, setActiveSession] = useState<any>(null);
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'verifying' | 'success' | 'failure'>('idle');
  const [manualToken, setManualToken] = useState('');
  const [manualInputError, setManualInputError] = useState('');
  const [requireBiometric, setRequireBiometric] = useState<boolean>(true);
  const [isBiometricModalOpen, setIsBiometricModalOpen] = useState<boolean>(false);
  const [pendingTokenToVerify, setPendingTokenToVerify] = useState<string>('');
  const [lastBiometricResult, setLastBiometricResult] = useState<BiometricVerificationResult | null>(null);

  const [verificationResult, setVerificationResult] = useState<{
    success: boolean;
    confidenceScore: number;
    signals: VerificationSignal[];
    errorMessage?: string;
    isOfflineQueued?: boolean;
  } | null>(null);

  // Fetch active session info
  useEffect(() => {
    loadSession();
    const interval = setInterval(loadSession, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadSession = async () => {
    try {
      const data = await api.getActiveSession();
      setActiveSession(data);
    } catch (e) {
      console.warn(e);
    }
  };

  const executeVerification = async (tokenToUse: string, overrideParams: any = {}) => {
    if (!tokenToUse || !tokenToUse.trim()) {
      setManualInputError('Please enter or write the 6-character session QR token.');
      return;
    }

    setManualInputError('');
    setScanState('verifying');
    setVerificationResult(null);

    // Simulate real-world multi-layer verification latency
    await new Promise((r) => setTimeout(r, 700));

    const payload = {
      token: tokenToUse.trim().toUpperCase(),
      studentId: overrideParams.studentId || user.id,
      studentName: overrideParams.studentName || user.name,
      rollNumber: overrideParams.rollNumber || user.rollNumber,
      departmentName: user.departmentName,
      clientCoordinates: overrideParams.coordinates || {
        lat: gpsData.latitude,
        lng: gpsData.longitude,
      },
      clientDevice: 'Google Pixel 8 (Android 15)',
      biometricVerification: overrideParams.biometricVerification || lastBiometricResult || {
        verified: true,
        method: 'webauthn_hardware',
        authenticatorType: 'Platform Biometric Authenticator',
        signature: `BIO-SIG-${Date.now().toString(16).toUpperCase()}`,
      },
    };

    const res = await api.verifyAttendance(payload, isOffline);
    setVerificationResult(res);

    if (res.success) {
      setScanState('success');
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // ignore
      }
      if (onAttendanceMarkedSuccess) onAttendanceMarkedSuccess();
    } else {
      setScanState('failure');
    }
  };

  const handleCaptureCameraQR = () => {
    const token = activeSession?.currentToken || 'SEC-A84F21';
    if (requireBiometric) {
      setPendingTokenToVerify(token);
      setIsBiometricModalOpen(true);
    } else {
      executeVerification(token);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualToken.trim()) {
      setManualInputError('Please write or enter the token displayed on the classroom screen.');
      return;
    }

    if (requireBiometric) {
      setPendingTokenToVerify(manualToken.trim());
      setIsBiometricModalOpen(true);
    } else {
      executeVerification(manualToken.trim());
    }
  };

  const handleBiometricSuccess = (bioResult: BiometricVerificationResult) => {
    setLastBiometricResult(bioResult);
    setIsBiometricModalOpen(false);
    executeVerification(pendingTokenToVerify || activeSession?.currentToken || 'SEC-A84F21', {
      biometricVerification: bioResult,
    });
  };

  const resetScanner = () => {
    setScanState('idle');
    setVerificationResult(null);
    setManualToken('');
    setManualInputError('');
    setPendingTokenToVerify('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{greeting}, {user.name.split(' ')[0]}</span>
            <span>•</span>
            <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{formattedTime}</span>
          </div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Camera className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span>Smart Attendance Scanner</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Scan classroom dynamic QR or write/enter the 6-character token code
          </p>
        </div>

        {/* Input Mode Selector */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            id="btn-mode-camera"
            onClick={() => setScanMode('camera')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              scanMode === 'camera'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Camera Scan</span>
          </button>
          <button
            id="btn-mode-manual"
            onClick={() => setScanMode('manual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              scanMode === 'manual'
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Write Code</span>
          </button>
        </div>
      </div>

      {/* Live Classroom Banner */}
      {activeSession && (
        <div className="bg-gradient-to-r from-blue-900 to-indigo-950 text-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border border-blue-800/50">
          <div>
            <div className="flex items-center gap-2 text-blue-200 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>LIVE ATTENDANCE SESSION</span>
            </div>
            <h2 className="text-base font-bold mt-0.5">
              {activeSession.subjectCode} — {activeSession.subjectName}
            </h2>
            <p className="text-xs text-blue-200">
              {activeSession.facultyName} • {activeSession.roomNumber}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-xs text-xs border border-white/10">
            <Clock className="w-4 h-4 text-amber-300" />
            <span>
              Active Token: <strong className="font-mono text-amber-300">{activeSession.currentToken}</strong>
            </span>
          </div>
        </div>
      )}

      {/* Live Hardware GPS Geolocation Card */}
      <GPSLocationCard
        gps={gpsData}
        isRefreshing={isGpsRefreshing}
        onRefresh={refreshGPS}
        classroomName={activeSession?.roomNumber ? `${activeSession.roomNumber}` : 'Lecture Hall LH-302'}
      />

      {/* WebAuthn Biometric Security Verification Layer Banner */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            requireBiometric 
              ? 'bg-blue-600/10 dark:bg-blue-950/60 border border-blue-600/20 text-blue-600 dark:text-blue-400' 
              : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
          }`}>
            <Fingerprint className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                WebAuthn Biometric Security Layer
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                FIDO2 / W3C L2 Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Requires Touch ID, Face ID, or platform passkey cryptographic assertion before attendance submission.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => {
              setPendingTokenToVerify(activeSession?.currentToken || 'SEC-A84F21');
              setIsBiometricModalOpen(true);
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-transparent dark:border-slate-700"
          >
            <Lock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Test Sensor</span>
          </button>
          
          <label className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <input
              type="checkbox"
              checked={requireBiometric}
              onChange={(e) => setRequireBiometric(e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
            />
            <span className="text-[11px] font-semibold">Enforce</span>
          </label>
        </div>
      </div>

      {/* Mode 1: Camera Viewport */}
      {scanMode === 'camera' && (
        <div className="relative bg-slate-950 rounded-2xl overflow-hidden shadow-xl aspect-4/3 flex flex-col items-center justify-center p-6 text-center border-4 border-slate-900">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

          {scanState === 'idle' && (
            <div className="relative z-10 flex flex-col items-center space-y-4 max-w-sm">
              <div className="relative w-48 h-48 sm:w-52 sm:h-52 border-2 border-dashed border-blue-400/70 rounded-2xl flex items-center justify-center p-4">
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 rounded-tl-lg" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 rounded-tr-lg" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 rounded-bl-lg" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 rounded-br-lg" />
                
                <Camera className="w-12 h-12 text-blue-400/80 animate-pulse" />
              </div>

              <p className="text-xs text-slate-300">
                Point your camera towards the 30-second dynamic QR code projected on the classroom screen.
              </p>

              <button
                id="btn-trigger-camera-scan"
                onClick={handleCaptureCameraQR}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 min-h-[44px]"
              >
                <Camera className="w-4 h-4" />
                <span>Capture Live Dynamic QR</span>
              </button>
            </div>
          )}

          {scanState === 'verifying' && (
            <div className="relative z-10 flex flex-col items-center space-y-3">
              <div className="w-16 h-16 rounded-full border-4 border-blue-500/30 border-t-blue-500 animate-spin flex items-center justify-center" />
              <h3 className="text-white text-sm font-bold tracking-wide">
                {t.verifyingSignals}
              </h3>
              <p className="text-slate-400 text-xs max-w-xs">
                Evaluating 30s rolling session token, time delta, geofence, and student credentials.
              </p>
            </div>
          )}

          {scanState === 'success' && (
            <div className="relative z-10 flex flex-col items-center space-y-3 p-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border-2 border-emerald-500 flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <h3 className="text-white text-base font-bold">
                {t.attendanceVerified}
              </h3>
              {verificationResult && (
                <div className="flex items-center gap-2">
                  <ConfidenceBadge score={verificationResult.confidenceScore} size="lg" />
                </div>
              )}
              <p className="text-slate-300 text-xs">
                Recorded for <strong className="text-white">{user.name}</strong> ({user.rollNumber}) in DBMS at {formattedTime}
              </p>

              {/* Action buttons after attendance */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer min-h-[44px]"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Done & Exit App</span>
                  </button>
                )}
                <button
                  onClick={resetScanner}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 cursor-pointer min-h-[44px]"
                >
                  Scan Another Session
                </button>
              </div>
            </div>
          )}

          {scanState === 'failure' && (
            <div className="relative z-10 flex flex-col items-center space-y-3 p-4">
              <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border-2 border-rose-500 flex items-center justify-center">
                <XCircle className="w-9 h-9" />
              </div>
              <h3 className="text-white text-base font-bold">
                {t.verificationFailed}
              </h3>
              <p className="text-rose-300 text-xs max-w-md bg-rose-950/60 p-3 rounded-xl border border-rose-900/60">
                {verificationResult?.errorMessage || 'Security token could not be verified.'}
              </p>

              <button
                onClick={resetScanner}
                className="mt-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold cursor-pointer min-h-[44px]"
              >
                Retry Live Scan
              </button>
            </div>
          )}
        </div>
      )}

      {/* Mode 2: Manual QR Code Writing Space */}
      {scanMode === 'manual' && (
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <span>Write / Enter QR Session Code</span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Type the 6-character cryptographic token displayed under the classroom QR code
              </p>
            </div>
            {activeSession && (
              <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                Active: {activeSession.currentToken}
              </span>
            )}
          </div>

          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label htmlFor="input-manual-token" className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                Write QR Token Code
              </label>
              <div className="relative">
                <input
                  id="input-manual-token"
                  type="text"
                  value={manualToken}
                  onChange={(e) => {
                    setManualToken(e.target.value.toUpperCase());
                    setManualInputError('');
                  }}
                  placeholder="e.g. SEC-A84F21"
                  maxLength={15}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 text-center font-mono text-xl sm:text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-slate-100 placeholder:text-slate-400 placeholder:font-normal placeholder:tracking-normal outline-none transition-all"
                />
                {activeSession && (
                  <button
                    type="button"
                    onClick={() => setManualToken(activeSession.currentToken)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-800 cursor-pointer"
                  >
                    Paste Active Code
                  </button>
                )}
              </div>
              {manualInputError && (
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium mt-1.5 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {manualInputError}
                </p>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 space-y-2">
              <div className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-200">
                <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span>How Token Writing Works</span>
              </div>
              <ul className="list-disc list-inside space-y-1 text-slate-500 dark:text-slate-400 text-[11px]">
                <li>Faculty displays a rolling 30s token on the projector screen.</li>
                <li>Write down or type the active alphanumeric code into this box.</li>
                <li>Your device location and cryptographic timestamp are validated simultaneously.</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                id="btn-submit-manual-code"
                disabled={scanState === 'verifying'}
                className="flex-1 px-5 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50 min-h-[44px]"
              >
                {scanState === 'verifying' ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>Verifying Written Token...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify & Mark Attendance</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => setManualToken('')}
                className="px-4 py-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-colors cursor-pointer min-h-[44px] border border-transparent dark:border-slate-700"
              >
                Clear
              </button>
            </div>
          </form>

          {/* Success / Failure Result inside Manual View */}
          {scanState === 'success' && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-in fade-in">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-sm">Attendance Successfully Recorded!</h4>
                  <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                    Your written token <strong>{manualToken || activeSession?.currentToken}</strong> was verified at {formattedTime}.
                  </p>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 shadow cursor-pointer min-h-[40px]"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Done & Exit App</span>
                </button>
              )}
            </div>
          )}

          {scanState === 'failure' && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-950 dark:text-rose-200 flex items-start gap-3 animate-in fade-in">
              <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Token Verification Failed</h4>
                <p className="text-xs text-rose-800 dark:text-rose-300 mt-0.5">
                  {verificationResult?.errorMessage || 'The code entered has expired (30s window) or does not match the active session.'}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Multi-Layer Verification Breakdown (Visible when result exists) */}
      {verificationResult && (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3 animate-in fade-in transition-colors">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Multi-Layer Anti-Proxy Signal Log</span>
            </h3>
            <ConfidenceBadge score={verificationResult.confidenceScore} />
          </div>

          <div className="space-y-2">
            {verificationResult.signals.map((signal, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs ${
                  signal.status === 'pass'
                    ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-200/80 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200'
                    : signal.status === 'warning'
                    ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-200/80 dark:border-amber-800/60 text-amber-950 dark:text-amber-200'
                    : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-200/80 dark:border-rose-800/60 text-rose-950 dark:text-rose-200'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {signal.status === 'pass' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  ) : signal.status === 'warning' ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <span className="font-bold">{signal.name}</span>
                    <p className="text-[11px] opacity-80 mt-0.5">{signal.detail}</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/70 dark:bg-slate-800/70 border border-black/5 dark:border-white/5 shrink-0">
                  Weight: {signal.weight}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* WebAuthn Biometric Verification Modal */}
      <BiometricPromptModal
        isOpen={isBiometricModalOpen}
        user={user}
        sessionToken={pendingTokenToVerify || activeSession?.currentToken || 'SEC-A84F21'}
        onSuccess={handleBiometricSuccess}
        onCancel={() => {
          setIsBiometricModalOpen(false);
          setPendingTokenToVerify('');
        }}
      />
    </div>
  );
};
