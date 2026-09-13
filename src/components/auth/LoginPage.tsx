import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { DEMO_USERS, INSTITUTION_CONFIG } from '../../data/mockDatabase';
import { Language, translations } from '../../i18n/translations';
import { useLiveClock } from '../../hooks/useLiveClock';
import { useTheme } from '../../context/ThemeContext';
import {
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Building2,
  Lock,
  Mail,
  User as UserIcon,
  ArrowRight,
  Eye,
  EyeOff,
  Sparkles,
  QrCode,
  CheckCircle2,
  Brain,
  Activity,
  Globe,
  Clock,
  KeyRound,
  AlertCircle,
  Sun,
  Moon,
} from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: User) => void;
  currentLang: Language;
  onToggleLang: (lang: Language) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLogin,
  currentLang,
  onToggleLang,
}) => {
  const t = translations[currentLang];
  const { theme, isDark, toggleTheme } = useTheme();
  const { formattedTime, formattedDate, greeting } = useLiveClock();
  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [identifier, setIdentifier] = useState('23CS104');
  const [password, setPassword] = useState('student@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Sync default identifier when switching role tab
  const handleRoleSelect = (role: UserRole) => {
    setSelectedRole(role);
    setErrorMsg('');
    if (role === 'student') {
      setIdentifier('23CS104');
      setPassword('student@123');
    } else if (role === 'faculty') {
      setIdentifier('ramanathan.r@smartattendance.edu');
      setPassword('faculty@123');
    } else {
      setIdentifier('dean.academics@smartattendance.edu');
      setPassword('admin@123');
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setErrorMsg('Please enter your roll number, ID, or institutional email.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    setTimeout(() => {
      // Find matching user or fallback to corresponding role demo user
      let matchedUser: User | undefined;

      if (selectedRole === 'student') {
        matchedUser = DEMO_USERS.find(
          (u) =>
            u.role === 'student' &&
            (u.rollNumber?.toLowerCase() === identifier.trim().toLowerCase() ||
              u.email.toLowerCase() === identifier.trim().toLowerCase())
        );
        if (!matchedUser) {
          // Check if custom roll number entered, create dynamic active student profile
          matchedUser = {
            id: `stu-${Date.now()}`,
            name: identifier.includes('@') ? identifier.split('@')[0] : `Student (${identifier.toUpperCase()})`,
            email: identifier.includes('@') ? identifier : `${identifier.toLowerCase()}@smartattendance.edu`,
            role: 'student',
            departmentId: 'dept-cse',
            departmentName: 'Computer Science & Engineering',
            rollNumber: identifier.toUpperCase(),
            semester: 5,
            section: 'A',
            year: '3rd Year',
            overallAttendance: 85.0,
            hasBiometricEnrolled: true,
          };
        }
      } else if (selectedRole === 'faculty') {
        matchedUser = DEMO_USERS.find(
          (u) =>
            u.role === 'faculty' &&
            (u.email.toLowerCase() === identifier.trim().toLowerCase() ||
              u.employeeId?.toLowerCase() === identifier.trim().toLowerCase())
        );
        if (!matchedUser) {
          matchedUser = DEMO_USERS.find((u) => u.role === 'faculty') || DEMO_USERS[1];
        }
      } else {
        matchedUser = DEMO_USERS.find(
          (u) =>
            u.role === 'admin' &&
            u.email.toLowerCase() === identifier.trim().toLowerCase()
        );
        if (!matchedUser) {
          matchedUser = DEMO_USERS.find((u) => u.role === 'admin') || DEMO_USERS[2];
        }
      }

      setIsLoading(false);
      onLogin(matchedUser);
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Background Decorative Blur Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 border border-blue-400/30">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">
                Smart <span className="text-blue-400 font-semibold">Attendance</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {INSTITUTION_CONFIG.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Live Clock & Dynamic Greeting */}
          <div className="flex items-center gap-2 text-xs text-blue-200 bg-slate-800/80 border border-slate-700/80 px-3.5 py-1.5 rounded-xl shadow-xs">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="font-medium">{greeting}</span>
            <span className="text-slate-500 hidden sm:inline">•</span>
            <span className="font-mono font-bold text-white hidden sm:inline">{formattedTime}</span>
          </div>

          <button
            onClick={() => onToggleLang(currentLang === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            title="Switch Language / மொழியை மாற்று"
          >
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            <span>{currentLang === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-all cursor-pointer"
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex-1 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Hero Information & Core Highlights */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/15 border border-blue-400/25 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Next-Gen Institutional Attendance Engine</span>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                Secure, Automated & <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">Predictive Attendance</span>
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
                Eliminate proxy attendance with cryptographic 30-second dynamic rolling QR tokens, multi-signal geofencing, explainable risk forecasts, and automated institutional governance.
              </p>
            </div>

            {/* Feature Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3 backdrop-blur-xs">
                <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 shrink-0">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Dynamic Rolling QR</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">SHA-256 tokens auto-rotating every 30s to block screenshot proxies.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3 backdrop-blur-xs">
                <div className="p-2 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 shrink-0">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Predictive Digital Twin</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">What-If simulation forecasting 75% attendance compliance trajectories.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3 backdrop-blur-xs">
                <div className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Multi-Signal Trust</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">50m classroom geofence + device fingerprint verification.</p>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 flex items-start gap-3 backdrop-blur-xs">
                <div className="p-2 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-500/30 shrink-0">
                  <Activity className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white">Class Health Index</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Composite 0-100 analytics with immutable audit log compliance.</p>
                </div>
              </div>
            </div>

            {/* Current Real-Time Institutional Session Status */}
            <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Active Academic Session: <strong>{formattedDate}</strong></span>
              </div>
              <span className="text-[11px] font-mono text-blue-400 font-semibold">{formattedTime}</span>
            </div>
          </div>

          {/* Right Column: Interactive Login Card */}
          <div className="lg:col-span-6 flex justify-center">
            <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl shadow-black/50 space-y-6">
              
              {/* Role Switcher Tabs */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-left">
                  Select Login Portal
                </label>
                <div className="grid grid-cols-3 p-1 rounded-2xl bg-slate-800/80 border border-slate-700/70">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('student')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedRole === 'student'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                    <span>Student</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('faculty')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedRole === 'faculty'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Faculty</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleRoleSelect('admin')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedRole === 'admin'
                        ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Admin</span>
                  </button>
                </div>
              </div>

              {/* Portal Context Banner */}
              <div
                className={`p-3 rounded-2xl border text-xs flex items-center gap-2.5 ${
                  selectedRole === 'student'
                    ? 'bg-blue-950/40 border-blue-800/50 text-blue-200'
                    : selectedRole === 'faculty'
                    ? 'bg-purple-950/40 border-purple-800/50 text-purple-200'
                    : 'bg-amber-950/40 border-amber-800/50 text-amber-200'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${
                    selectedRole === 'student'
                      ? 'bg-blue-600/30 text-blue-400'
                      : selectedRole === 'faculty'
                      ? 'bg-purple-600/30 text-purple-400'
                      : 'bg-amber-600/30 text-amber-400'
                  }`}
                >
                  {selectedRole === 'student' ? (
                    <UserIcon className="w-4 h-4" />
                  ) : selectedRole === 'faculty' ? (
                    <UserCheck className="w-4 h-4" />
                  ) : (
                    <Building2 className="w-4 h-4" />
                  )}
                </div>
                <div className="text-left">
                  <span className="font-bold block">
                    {selectedRole === 'student'
                      ? 'Student Attendance & Risk Portal'
                      : selectedRole === 'faculty'
                      ? 'Faculty Attendance & QR Hub'
                      : 'Institutional Administration Portal'}
                  </span>
                  <span className="text-[10px] opacity-80 block">
                    {selectedRole === 'student'
                      ? 'Scan dynamic QRs, view subject % and simulation trends.'
                      : selectedRole === 'faculty'
                      ? 'Broadcast rolling QR tokens & review proxy anomalies.'
                      : 'Department analytics, debarment mitigation & audit logs.'}
                  </span>
                </div>
              </div>

              {/* Error Message */}
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4 text-left">
                {/* Identifier input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>
                      {selectedRole === 'student'
                        ? 'Roll Number / Student Email'
                        : selectedRole === 'faculty'
                        ? 'Faculty Email / Staff ID'
                        : 'Administrator Email'}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {selectedRole === 'student' ? 'e.g. 23CS104' : 'institutional domain'}
                    </span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      {selectedRole === 'student' ? (
                        <KeyRound className="w-4 h-4" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                    </div>
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={
                        selectedRole === 'student'
                          ? '23CS104'
                          : selectedRole === 'faculty'
                          ? 'ramanathan.r@smartattendance.edu'
                          : 'dean.academics@smartattendance.edu'
                      }
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-white text-xs font-medium placeholder-slate-500 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Password input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      Password / Security PIN
                    </label>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-white text-xs font-medium placeholder-slate-500 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Help */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-400 hover:text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded border-slate-700 bg-slate-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                    />
                    <span>Remember this session</span>
                  </label>

                  <span className="text-[11px] text-slate-500 font-mono">
                    {formattedTime}
                  </span>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3 px-4 rounded-xl text-white font-bold text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    selectedRole === 'student'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-600/30'
                      : selectedRole === 'faculty'
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-purple-600/30'
                      : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-amber-600/30'
                  } disabled:opacity-50 min-h-[44px]`}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Authenticating Credentials...</span>
                    </div>
                  ) : (
                    <>
                      <span>Sign In to {selectedRole === 'student' ? 'Student' : selectedRole === 'faculty' ? 'Faculty' : 'Admin'} Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Security Footnote */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  256-Bit Cryptographic Session
                </span>
                <span>Smart Campus Network</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
        <div>
          © 2026 Smart Attendance Platform • {INSTITUTION_CONFIG.name}
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Security Policy</span>
          <span>•</span>
          <span>Attendance Compliance (75% Rule)</span>
          <span>•</span>
          <span>Audit Registry</span>
        </div>
      </footer>
    </div>
  );
};

