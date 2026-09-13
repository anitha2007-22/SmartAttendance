import React from 'react';
import { User, ClassSessionToday, RiskPrediction } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { RiskIndicator } from '../common/RiskIndicator';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { useLiveClock } from '../../hooks/useLiveClock';
import { useGPSLocation } from '../../hooks/useGPSLocation';
import { GPSLocationCard } from '../common/GPSLocationCard';
import {
  Clock,
  MapPin,
  QrCode,
  AlertTriangle,
  CheckCircle2,
  TrendingDown,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calendar,
  Layers,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

interface StudentDashboardProps {
  user: User;
  stats: any;
  timetable: ClassSessionToday[];
  riskPrediction: RiskPrediction;
  onNavigateToScan: () => void;
  onNavigateToWhatIf: () => void;
  onNavigateToRisk: () => void;
  onLogout?: () => void;
  currentLang: Language;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  user,
  stats,
  timetable,
  riskPrediction,
  onNavigateToScan,
  onNavigateToWhatIf,
  onNavigateToRisk,
  onLogout,
  currentLang,
}) => {
  const t = translations[currentLang];
  const { formattedTime, formattedDate, greeting } = useLiveClock();
  const { gpsData, isRefreshing: isGpsRefreshing, refreshGPS } = useGPSLocation();
  const isAtRisk = stats.overallPercentage < 75;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Greeting Header with Live Clock & Direct Exit */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>{user.departmentName}</span>
            <span>•</span>
            <span>Sem {user.semester || '5'}</span>
            <span>•</span>
            <span>Sec {user.section || 'A'}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-1 flex items-center gap-2">
            <span>{greeting}, {user.name}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1.5">
            <span>
              Roll No: <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{user.rollNumber}</span>
            </span>
            <span>•</span>
            <div className="inline-flex items-center gap-1.5 font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-0.5 rounded-lg border border-blue-100 dark:border-blue-900">
              <Clock className="w-3.5 h-3.5" />
              <span className="font-mono font-bold">{formattedTime}</span>
              <span className="text-slate-400 hidden sm:inline">•</span>
              <span className="hidden sm:inline">{formattedDate}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="btn-quick-scan-hero"
            onClick={onNavigateToScan}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-blue-500/25 transition-all cursor-pointer min-h-[40px]"
          >
            <QrCode className="w-4 h-4" />
            <span>{t.scanQR}</span>
          </button>

          <button
            id="btn-open-whatif-hero"
            onClick={onNavigateToWhatIf}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm transition-all cursor-pointer min-h-[40px] border border-transparent dark:border-slate-700"
          >
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="hidden sm:inline">What-If Planner</span>
          </button>

          {onLogout && (
            <button
              id="btn-dashboard-logout"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold text-xs transition-all cursor-pointer border border-rose-200 dark:border-rose-800 min-h-[40px]"
              title="Exit and Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          )}
        </div>
      </div>


      {/* Top 3 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Overall Attendance Rate */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.overallAttendance}</span>
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <BookOpen className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${isAtRisk ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
                {stats.overallPercentage}%
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">({stats.totalAttended}/{stats.totalClassesHeld} Classes)</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${isAtRisk ? 'bg-rose-500' : 'bg-blue-600'}`}
                style={{ width: `${Math.min(100, stats.overallPercentage)}%` }}
              />
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Threshold: 75%</span>
            <span className={isAtRisk ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-emerald-600 dark:text-emerald-400 font-semibold'}>
              {isAtRisk ? `${(75 - stats.overallPercentage).toFixed(1)}% deficit` : 'Safely above'}
            </span>
          </div>
        </div>

        {/* Card 2: Attendance Status */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Standing Status</span>
            <span className={`p-2 rounded-xl ${isAtRisk ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400'}`}>
              {isAtRisk ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            </span>
          </div>
          <div className="mt-3">
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {isAtRisk ? 'Academic Warning' : 'Good Standing'}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isAtRisk ? 'Subject debarment risk if absences continue' : 'Eligible for end-semester examinations'}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Debarment check:</span>
            <span className="font-semibold text-slate-700 dark:text-slate-300">Strict 75% Rule</span>
          </div>
        </div>

        {/* Card 3: AI Risk Prediction Level */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">AI Risk Forecast</span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-center gap-2">
              <RiskIndicator level={riskPrediction.riskLevel} />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Trend: <span className="font-semibold text-rose-600 dark:text-rose-400">{riskPrediction.trendPercentageChange}%</span> in last 3 weeks
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={onNavigateToRisk}
              className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Explain Why</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Multi-Layer Verification Security */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Anti-Proxy Trust</span>
            <span className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Layers className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <ConfidenceBadge score={96} size="lg" />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-mono text-[11px]">
              GPS: {gpsData.latitude}°N, {gpsData.longitude}°E
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Classroom Geofence:</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {gpsData.distanceToClassroom}m / {gpsData.geofenceRadius}m
            </span>
          </div>
        </div>
      </div>

      {/* High Risk Alert Banner (if applicable) */}
      {isAtRisk && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200/90 dark:border-rose-800/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-rose-900 dark:text-rose-200">Attendance Risk Alert — Immediate Action Required</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-200 dark:bg-rose-900 text-rose-800 dark:text-rose-200">
                  {riskPrediction.reasons.length} Factors Detected
                </span>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-1 max-w-2xl leading-relaxed">
                Your Database Management Systems attendance is at <span className="font-semibold">61.9%</span>. Missing even 1 more session may trigger formal debarment from the Anna University end-semester practical examinations.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
            <button
              onClick={onNavigateToWhatIf}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer text-center"
            >
              Simulate Recovery Plan
            </button>
            <button
              onClick={onNavigateToRisk}
              className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-rose-100/50 dark:hover:bg-slate-700 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-700 text-xs font-semibold transition-colors cursor-pointer"
            >
              View Reasons
            </button>
          </div>
        </div>
      )}

      {/* Today's Timetable & Live Sessions */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 sm:p-6 transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Today's Classes & Live Sessions</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Friday, 15 August 2026 • 5th Semester CSE Section A</p>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">4 Scheduled Periods</span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3">
          {timetable.map((cls) => {
            const isLive = cls.status === 'live';
            return (
              <div
                key={cls.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isLive
                    ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 shadow-xs ring-1 ring-blue-500/20'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold ${
                      isLive ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span className="text-xs">{cls.startTime.split(' ')[0]}</span>
                    <span className="text-[9px] font-normal uppercase">{cls.startTime.split(' ')[1]}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100/70 dark:bg-blue-900/50 px-2 py-0.5 rounded-md">
                        {cls.subjectCode}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{cls.subjectName}</span>
                      {isLive && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 animate-pulse">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                          Session Live Now
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        {cls.startTime} – {cls.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {cls.roomNumber}
                      </span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">{cls.facultyName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isLive ? (
                    <button
                      id={`btn-mark-attendance-${cls.id}`}
                      onClick={onNavigateToScan}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4" />
                      <span>{t.markAttendance}</span>
                    </button>
                  ) : (
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                      Upcoming at {cls.startTime}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Subject Wise Attendance Summary */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 sm:p-6 transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">Subject-Wise Attendance</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Minimum requirement: 75% in each subject individually</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.subjectStats.map((sub: any) => {
            const isSubCritical = sub.percentage < 75;
            return (
              <div key={sub.subjectId} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">{sub.subjectCode}</span>
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">{sub.subjectName}</h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">{sub.facultyName}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-base font-extrabold ${isSubCritical ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'}`}>
                      {sub.percentage}%
                    </span>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{sub.attendedClasses}/{sub.totalClasses} classes</p>
                  </div>
                </div>

                <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isSubCritical ? 'bg-rose-500' : 'bg-emerald-500'}`}
                    style={{ width: `${Math.min(100, sub.percentage)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className={`font-semibold ${isSubCritical ? 'text-rose-700 dark:text-rose-300' : 'text-emerald-700 dark:text-emerald-300'}`}>
                    {isSubCritical ? 'Critical (Below 75%)' : 'Healthy Standing'}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">Trend: {sub.trend === 'down' ? 'Declining' : sub.trend === 'up' ? 'Improving' : 'Stable'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
