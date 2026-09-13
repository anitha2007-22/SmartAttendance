import React, { useState, useMemo } from 'react';
import { User, ClassSessionToday, RiskPrediction, AtRiskEmailAlert } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { HealthScoreGauge } from '../common/HealthScoreGauge';
import { EmailAlertModal } from '../common/EmailAlertModal';
import { NotificationHistoryModal } from '../common/NotificationHistoryModal';
import { notificationService } from '../../services/notificationService';
import {
  Radio,
  Users,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Calendar,
  Clock,
  MapPin,
  Play,
  ArrowRight,
  BookOpen,
  Activity,
  CheckCircle2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Mail,
  Search,
  Filter,
  AlertTriangle,
  Send,
  History,
  Sparkles,
  Loader2,
} from 'lucide-react';

interface FacultyDashboardProps {
  user: User;
  timetable: ClassSessionToday[];
  atRiskStudents: RiskPrediction[];
  onNavigateToLive: () => void;
  onNavigateToHealth: () => void;
  onNavigateToAnomalies: () => void;
  currentLang: Language;
}

type SortField = 'name' | 'attendance' | 'riskLevel' | 'trend';
type SortOrder = 'asc' | 'desc';

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({
  user,
  timetable,
  atRiskStudents,
  onNavigateToLive,
  onNavigateToHealth,
  onNavigateToAnomalies,
  currentLang,
}) => {
  const t = translations[currentLang];

  // Sorting & Filtering State for At-Risk Students
  const [sortField, setSortField] = useState<SortField>('attendance');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc'); // lowest attendance first by default
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRiskLevel, setFilterRiskLevel] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  // Modal State for Email Alerts
  const [selectedStudentForEmail, setSelectedStudentForEmail] = useState<RiskPrediction | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [lastDispatchedToast, setLastDispatchedToast] = useState<string | null>(null);
  const [isBatchSending, setIsBatchSending] = useState(false);

  // Sorted and filtered students
  const processedStudents = useMemo(() => {
    return atRiskStudents
      .filter((s) => {
        const matchesSearch =
          s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.rollNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.departmentName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRisk = filterRiskLevel === 'ALL' || s.riskLevel === filterRiskLevel;
        return matchesSearch && matchesRisk;
      })
      .sort((a, b) => {
        let compare = 0;
        if (sortField === 'name') {
          compare = a.studentName.localeCompare(b.studentName);
        } else if (sortField === 'attendance') {
          compare = a.overallAttendance - b.overallAttendance;
        } else if (sortField === 'riskLevel') {
          const rank: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          compare = rank[a.riskLevel] - rank[b.riskLevel];
        } else if (sortField === 'trend') {
          compare = a.trendPercentageChange - b.trendPercentageChange;
        }
        return sortOrder === 'asc' ? compare : -compare;
      });
  }, [atRiskStudents, searchQuery, filterRiskLevel, sortField, sortOrder]);

  const handleSortToggle = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      // Default to ascending for attendance & name, descending for risk & trend
      setSortOrder(field === 'attendance' ? 'asc' : 'desc');
    }
  };

  const handleSendEmailDirect = async (student: RiskPrediction) => {
    try {
      const alert = await notificationService.sendAtRiskEmailAlert(student);
      setLastDispatchedToast(`Official email advisory sent to ${student.studentName} (${student.rollNumber})!`);
      setTimeout(() => setLastDispatchedToast(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotifyAllAtRisk = async () => {
    const targets = processedStudents.length > 0 ? processedStudents : atRiskStudents;
    if (targets.length === 0 || isBatchSending) return;

    setIsBatchSending(true);
    try {
      const result = await notificationService.sendBatchAtRiskEmailAlerts(targets);
      setLastDispatchedToast(`Personalized email advisories successfully dispatched to all ${result.count} at-risk students!`);
      setTimeout(() => setLastDispatchedToast(null), 4500);
    } catch (err) {
      console.error('Batch notification failed:', err);
    } finally {
      setIsBatchSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {lastDispatchedToast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-semibold animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{lastDispatchedToast}</span>
        </div>
      )}

      {/* Faculty Greeting Header */}
      <div className="bg-white dark:bg-slate-900 p-5 sm:p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>{user.departmentName}</span>
            <span>•</span>
            <span>{user.employeeId}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 mt-1">
            Welcome, {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {user.designation} • 3 Assigned Subjects This Semester
          </p>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2.5 min-h-[42px] rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-colors cursor-pointer border border-transparent dark:border-slate-700"
          >
            <History className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Alert Logs ({notificationService.getAlertHistory().length})</span>
          </button>

          <button
            id="btn-start-attendance-hero"
            onClick={onNavigateToLive}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 min-h-[42px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-blue-500/25 transition-all cursor-pointer"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Launch Live QR</span>
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Active Session */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Live Session</span>
            <span className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Radio className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              DBMS (LH-302)
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              Active • 84% Present (29 / 35 Verified)
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onNavigateToLive}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Session</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 2: Students At Risk */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">At-Risk Students</span>
            <span className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {atRiskStudents.length} Students
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Triggered &gt;10% drop or below 75%
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
            <button
              onClick={handleNotifyAllAtRisk}
              disabled={isBatchSending || atRiskStudents.length === 0}
              className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 flex items-center gap-1 cursor-pointer disabled:opacity-50"
            >
              {isBatchSending ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Notifying all...</span>
                </>
              ) : (
                <>
                  <Send className="w-3 h-3" />
                  <span>Notify All ({atRiskStudents.length})</span>
                </>
              )}
            </button>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Auto-Alerts
            </span>
          </div>
        </div>

        {/* Card 3: Class Health Score */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Class Health</span>
            <span className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
              86 / 100
            </div>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
              Healthy Overall Performance
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onNavigateToHealth}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>View Heatmap Breakdown</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Card 4: Anti-Proxy Anomalies */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Proxy Detection</span>
            <span className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              1 Flagged
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Madurai IP geolocation anomaly pending review
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onNavigateToAnomalies}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Investigate Anomaly</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Interactive At-Risk Students Section with Sorting Controls */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-6 space-y-4 transition-colors">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <TrendingDown className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                <span>At-Risk Students Early Warning & Email Advisory</span>
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                {processedStudents.length} Students Flagged
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Multi-criteria sorting & automated institutional email alert triggers
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsHistoryModalOpen(true)}
              className="flex-1 sm:flex-initial px-3.5 py-2.5 min-h-[42px] sm:min-h-0 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-slate-200/80 dark:border-slate-700"
            >
              <History className="w-3.5 h-3.5" />
              <span>Email Logs</span>
            </button>

            <button
              id="btn-notify-all-at-risk"
              onClick={handleNotifyAllAtRisk}
              disabled={isBatchSending || processedStudents.length === 0}
              className="flex-1 sm:flex-initial px-4 py-2.5 min-h-[42px] sm:min-h-0 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm shadow-rose-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              {isBatchSending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Dispatching Emails...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Notify All At-Risk ({processedStudents.length})</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Search, Risk Filters, and Sorting Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700">
          {/* Search Box */}
          <div className="relative w-full lg:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search student, roll number, dept..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none min-h-[40px]"
            />
          </div>

          {/* Risk Level Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1 flex items-center gap-1 shrink-0">
              <Filter className="w-3 h-3" />
              <span>Filter:</span>
            </span>
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterRiskLevel(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer min-h-[34px] flex items-center justify-center ${
                  filterRiskLevel === lvl
                    ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          {/* Sorting Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1 flex items-center gap-1 shrink-0">
              <ArrowUpDown className="w-3 h-3" />
              <span>Sort:</span>
            </span>

            <button
              onClick={() => handleSortToggle('name')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer min-h-[34px] ${
                sortField === 'name'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>Name</span>
              {sortField === 'name' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
            </button>

            <button
              onClick={() => handleSortToggle('attendance')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer min-h-[34px] ${
                sortField === 'attendance'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>Attendance %</span>
              {sortField === 'attendance' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
            </button>

            <button
              onClick={() => handleSortToggle('riskLevel')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer min-h-[34px] ${
                sortField === 'riskLevel'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>Risk</span>
              {sortField === 'riskLevel' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
            </button>

            <button
              onClick={() => handleSortToggle('trend')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer min-h-[34px] ${
                sortField === 'trend'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>Velocity</span>
              {sortField === 'trend' && (sortOrder === 'asc' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />)}
            </button>
          </div>
        </div>

        {/* Student Cards List */}
        <div className="space-y-3">
          {processedStudents.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs">
              No at-risk student records match the selected filter or search terms.
            </div>
          ) : (
            processedStudents.map((student) => (
              <div
                key={student.studentId}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/90 transition-all shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-3.5">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                      student.riskLevel === 'HIGH'
                        ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                    }`}
                  >
                    {student.studentName.charAt(0)}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">{student.studentName}</span>
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">({student.rollNumber})</span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          student.riskLevel === 'HIGH'
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        }`}
                      >
                        {student.riskLevel} RISK
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span>{student.departmentName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400">
                        <TrendingDown className="w-3.5 h-3.5" />
                        {student.trendPercentageChange}% 30-day drop
                      </span>
                      <span>•</span>
                      <span>{student.consecutiveAbsences} consecutive absences</span>
                    </div>
                  </div>
                </div>

                {/* Metrics & Notification Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between lg:justify-end gap-3 border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 dark:border-slate-800">
                  <div className="text-left sm:text-right">
                    <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Cumulative Attendance</div>
                    <div className="text-lg font-black text-rose-600 dark:text-rose-400">
                      {student.overallAttendance}%
                      <span className="text-[11px] font-normal text-slate-400 ml-1">/ 75% cutoff</span>
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500">
                      Forecast: {student.predictedAttendanceNextMonth}% next month
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => handleSendEmailDirect(student)}
                      title="Quick auto-dispatch email alert"
                      className="flex-1 sm:flex-initial px-3.5 py-2 min-h-[40px] rounded-xl bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold border border-rose-200 dark:border-rose-800 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Alert</span>
                    </button>

                    <button
                      onClick={() => {
                        setSelectedStudentForEmail(student);
                        setIsEmailModalOpen(true);
                      }}
                      className="flex-1 sm:flex-initial px-3.5 py-2 min-h-[40px] rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Custom Notice</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Today's Teaching Schedule */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 sm:p-6 transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Assigned Schedule for Today</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Friday • Department of Computer Science & Engineering</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          {timetable.map((cls) => {
            const isLive = cls.status === 'live';
            return (
              <div
                key={cls.id}
                className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isLive
                    ? 'bg-blue-50/50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/80 ring-1 ring-blue-500/20'
                    : 'bg-slate-50/50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold text-xs shrink-0 ${
                      isLive ? 'bg-blue-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <span>{cls.startTime.split(' ')[0]}</span>
                    <span className="text-[9px] uppercase font-normal">{cls.startTime.split(' ')[1]}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-200/50 dark:border-blue-800/50">
                        {cls.subjectCode}
                      </span>
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{cls.subjectName}</span>
                      {isLive && (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-pulse">
                          LIVE SESSION NOW
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        {cls.startTime} - {cls.endTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        {cls.roomNumber}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {isLive ? (
                    <button
                      onClick={onNavigateToLive}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Radio className="w-3.5 h-3.5" />
                      <span>Monitor Live Register</span>
                    </button>
                  ) : (
                    <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-transparent dark:border-slate-700">
                      Scheduled at {cls.startTime}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Email Alert Composer Modal */}
      <EmailAlertModal
        isOpen={isEmailModalOpen}
        student={selectedStudentForEmail}
        onClose={() => {
          setIsEmailModalOpen(false);
          setSelectedStudentForEmail(null);
        }}
        onAlertSent={(alert) => {
          setLastDispatchedToast(`Email notice dispatched to ${alert.studentName}!`);
          setTimeout(() => setLastDispatchedToast(null), 3500);
        }}
      />

      {/* Notification History & Batch Modal */}
      <NotificationHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        studentsList={atRiskStudents}
      />
    </div>
  );
};

