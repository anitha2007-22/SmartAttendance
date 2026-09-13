import React from 'react';
import { Department, RiskPrediction, AnomalyEvent, AuditLog } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { ConfidenceBadge } from '../common/ConfidenceBadge';
import { RiskIndicator } from '../common/RiskIndicator';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
} from 'recharts';
import {
  Building2,
  Users,
  GraduationCap,
  TrendingUp,
  TrendingDown,
  ShieldAlert,
  FileSpreadsheet,
  Sliders,
  History,
  Activity,
  ArrowRight,
  UserPlus,
  Calendar,
  UserCheck,
} from 'lucide-react';

interface AdminDashboardProps {
  departments: Department[];
  atRiskStudents: RiskPrediction[];
  anomalies: AnomalyEvent[];
  onNavigateToDepts: () => void;
  onNavigateToAnomalies: () => void;
  onNavigateToReports: () => void;
  onNavigateToManagement?: () => void;
  currentLang: Language;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  departments,
  atRiskStudents,
  anomalies,
  onNavigateToDepts,
  onNavigateToAnomalies,
  onNavigateToReports,
  onNavigateToManagement,
  currentLang,
}) => {
  const t = translations[currentLang];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>Executive Command Center</span>
            <span>•</span>
            <span>Academic Affairs & Compliance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Institution Attendance Intelligence Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time analytics across 6 engineering departments & 1,130 enrolled students
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {onNavigateToManagement && (
            <button
              onClick={onNavigateToManagement}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs sm:text-sm transition-colors cursor-pointer border border-slate-200"
            >
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Enroll Students & Timetable</span>
            </button>
          )}

          <button
            onClick={onNavigateToReports}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Generate Official Report</span>
          </button>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Enrolled</span>
            <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            1,130
          </div>
          <p className="text-xs text-slate-500 mt-1">Across 6 Departments • 74 Faculty</p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Institutional Avg</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            80.6%
          </div>
          <p className="text-xs text-slate-500 mt-1">Benchmark: 75% Mandatory Pass</p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">At-Risk Students</span>
            <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <TrendingDown className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-rose-600 mt-2">
            125 Cases
          </div>
          <p className="text-xs text-slate-500 mt-1">Highest in EEE (32) & ECE (29)</p>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Anti-Proxy Integrity</span>
            <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldAlert className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 mt-2">
            97.4%
          </div>
          <p className="text-xs text-slate-500 mt-1">Verification Confidence Average</p>
        </div>
      </div>

      {/* Department Comparison Chart */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Department Attendance Comparison
            </h2>
            <p className="text-xs text-slate-500">
              CSE leads at 84.6%, while EEE is lowest at 74.8% (requiring intervention)
            </p>
          </div>
          <button
            onClick={onNavigateToDepts}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Detailed Department Table</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departments} margin={{ top: 15, right: 15, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="code" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                formatter={(val: any) => [`${val}%`, 'Avg Attendance']}
              />
              <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '75% Threshold', fill: '#ef4444', fontSize: 11 }} />
              <Bar dataKey="averageAttendance" radius={[8, 8, 0, 0]}>
                {departments.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.averageAttendance < 75 ? '#f43f5e' : entry.averageAttendance < 80 ? '#f59e0b' : '#3b82f6'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two Columns: High-Risk Students & Recent Anti-Proxy Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: High-Risk Students */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Priority At-Risk Students</h2>
              <p className="text-xs text-slate-500">Predicted to fall below debarment limit</p>
            </div>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
              {atRiskStudents.length} Flagged
            </span>
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto">
            {atRiskStudents.map((stu) => (
              <div
                key={stu.studentId}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span>{stu.studentName}</span>
                    <span className="text-[11px] font-mono text-slate-500">({stu.rollNumber})</span>
                  </div>
                  <p className="text-[11px] text-slate-500">{stu.departmentName}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-sm font-extrabold text-rose-600 block">{stu.overallAttendance}%</span>
                  <RiskIndicator level={stu.riskLevel} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Recent Anti-Proxy Anomalies */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">Anti-Proxy Audit Alerts</h2>
              <p className="text-xs text-slate-500">AI detection signals requiring review</p>
            </div>
            <button
              onClick={onNavigateToAnomalies}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-3 max-h-[320px] overflow-y-auto">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 space-y-1.5 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">{anom.studentName} ({anom.rollNumber})</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    {anom.severity}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                  {anom.reason}
                </p>
                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>{anom.time}</span>
                  <ConfidenceBadge score={anom.confidenceScore} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
