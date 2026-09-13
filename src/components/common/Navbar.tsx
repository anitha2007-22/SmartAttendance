import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { DEMO_USERS, INSTITUTION_CONFIG } from '../../data/mockDatabase';
import { Language, translations } from '../../i18n/translations';
import { useLiveClock } from '../../hooks/useLiveClock';
import { useTheme } from '../../context/ThemeContext';
import {
  GraduationCap,
  Globe,
  Bell,
  Wifi,
  WifiOff,
  Bot,
  Sparkles,
  ChevronDown,
  UserCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  Layers,
  Clock,
  User as UserIcon,
  ShieldCheck,
  Smartphone,
  Sun,
  Moon,
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onSwitchUser: (user: User) => void;
  onLogout?: () => void;
  currentLang: Language;
  onToggleLang: (lang: Language) => void;
  isOffline: boolean;
  onToggleOffline: () => void;
  queuedOfflineCount: number;
  onSyncOffline: () => void;
  onOpenCopilot: () => void;
  onOpenSIHScenarios: () => void;
  unreadNotifsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSwitchUser,
  onLogout,
  currentLang,
  onToggleLang,
  isOffline,
  onToggleOffline,
  queuedOfflineCount,
  onSyncOffline,
  onOpenCopilot,
  onOpenSIHScenarios,
  unreadNotifsCount,
}) => {
  const t = translations[currentLang];
  const { theme, isDark, toggleTheme } = useTheme();
  const { formattedTime, formattedShortTime, greeting } = useLiveClock();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const isStudent = currentUser.role === 'student';

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'student':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">Student</span>;
      case 'faculty':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-200">Faculty</span>;
      case 'admin':
        return <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">Admin</span>;
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Left: Brand Identity & Live Clock */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center text-white shadow-sm shadow-blue-500/20 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-slate-100 leading-tight">
                Smart <span className="text-blue-600 dark:text-blue-400 font-semibold">Attendance</span>
              </span>
              <span className="hidden md:inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {currentUser.role === 'student' ? 'Student Portal' : currentUser.role === 'faculty' ? 'Faculty Hub' : 'Admin Console'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate max-w-[200px] lg:max-w-none">
              {INSTITUTION_CONFIG.name}
            </p>
          </div>
        </div>

        {/* Center/Right: Live Clock & Dynamic Greeting */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs">
          <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold text-slate-700 dark:text-slate-300">{greeting}, {currentUser.name.split(' ')[0]}</span>
          <span className="text-slate-300 dark:text-slate-600">•</span>
          <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{formattedTime}</span>
        </div>

        {/* Right: Actions & Switchers */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* AI Copilot Button */}
          <button
            id="btn-navbar-copilot"
            onClick={onOpenCopilot}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 transition-all cursor-pointer"
            title="Ask AI Attendance Copilot"
          >
            <Bot className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">{t.copilot}</span>
            <Sparkles className="w-3 h-3 text-amber-500" />
          </button>

          {/* Offline Simulator Toggle */}
          <button
            id="btn-toggle-offline"
            onClick={onToggleOffline}
            className={`flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
              isOffline
                ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800 animate-pulse'
                : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
            title={isOffline ? 'Offline Mode Active - Scans saved locally' : 'Online Mode - Live server connection'}
          >
            {isOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
            <span className="hidden xl:inline">{isOffline ? 'Offline' : 'Online'}</span>
            {queuedOfflineCount > 0 && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onSyncOffline();
                }}
                className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white hover:bg-amber-600 cursor-pointer"
                title="Click to sync offline queued records"
              >
                {queuedOfflineCount}
              </span>
            )}
          </button>

          {/* Language Toggle */}
          <button
            id="btn-toggle-language"
            onClick={() => onToggleLang(currentLang === 'en' ? 'ta' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            title="Switch Language / மொழியை மாற்று"
          >
            <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>{currentLang === 'en' ? 'தமிழ்' : 'English'}</span>
          </button>

          {/* Global Theme Toggle (Light / Dark) */}
          <button
            id="btn-toggle-theme"
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Dark</span>
              </>
            )}
          </button>

          {/* User Profile Menu */}
          <div className="relative">
            <button
              id="btn-user-menu"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-xs select-none ${
                  currentUser.role === 'student'
                    ? 'bg-blue-600'
                    : currentUser.role === 'faculty'
                    ? 'bg-emerald-600'
                    : 'bg-purple-600'
                }`}
              >
                {currentUser.name
                  .split(' ')
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'U'}
              </div>
              <div className="text-left hidden md:block">
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate max-w-[110px]">
                  {currentUser.name}
                </div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                  {isStudent ? currentUser.rollNumber : currentUser.departmentName.split(' ')[0]}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 space-y-3">
                {/* Profile Card Alone for Students */}
                {isStudent ? (
                  <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-100 dark:border-blue-900 text-left space-y-2.5">
                    <div className="flex items-start gap-3">
                      <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0 select-none">
                        {currentUser.name
                          .split(' ')
                          .filter(Boolean)
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase() || 'ST'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {currentUser.name}
                          </h4>
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-blue-600 text-white">
                            STUDENT
                          </span>
                        </div>
                        <p className="text-[11px] font-mono font-bold text-blue-700 dark:text-blue-400 mt-0.5">
                          Roll: {currentUser.rollNumber}
                        </p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {currentUser.departmentName}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-blue-200/60 dark:border-blue-800/60 grid grid-cols-2 gap-2 text-[11px]">
                      <div className="bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-lg border border-blue-100/80 dark:border-blue-800/60">
                        <span className="text-[10px] text-slate-400 block">Class</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-300">Sem {currentUser.semester || '5'} - Sec {currentUser.section || 'A'}</span>
                      </div>
                      <div className="bg-white/80 dark:bg-slate-900/80 p-1.5 rounded-lg border border-blue-100/80 dark:border-blue-800/60">
                        <span className="text-[10px] text-slate-400 block">Attendance</span>
                        <span className="font-bold text-blue-700 dark:text-blue-400">{currentUser.overallAttendance || 72.4}%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Faculty or Admin Profile View */
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left space-y-1.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white shadow-xs shrink-0 select-none ${
                          currentUser.role === 'faculty' ? 'bg-emerald-600' : 'bg-purple-600'
                        }`}
                      >
                        {currentUser.name
                          .split(' ')
                          .filter(Boolean)
                          .map((n) => n[0])
                          .join('')
                          .slice(0, 2)
                          .toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {currentUser.name}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                          {currentUser.designation || currentUser.role}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Direct Log Out Button */}
                {onLogout && (
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full py-2.5 px-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer border border-rose-200 dark:border-rose-800"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Exit & Log Out</span>
                  </button>
                )}

                <div className="px-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400 flex items-center justify-between">
                  <span>Smart Attendance v2026</span>
                  <span className="font-mono">{formattedShortTime}</span>
                </div>
              </div>
            )}
          </div>

          {/* Standalone Quick Logout / Exit Button on Navbar for instantaneous exit */}
          {onLogout && (
            <button
              id="btn-navbar-quick-logout"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 transition-all cursor-pointer"
              title="Exit and Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Log Out</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

