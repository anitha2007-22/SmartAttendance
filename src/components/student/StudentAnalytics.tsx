import React, { useState } from 'react';
import { Language, translations } from '../../i18n/translations';
import { ATTENDANCE_HEATMAP_DATA } from '../../data/mockDatabase';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
} from 'recharts';
import {
  LineChart as LineChartIcon,
  Calendar as CalendarIcon,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

interface StudentAnalyticsProps {
  stats: any;
  currentLang: Language;
}

export const StudentAnalytics: React.FC<StudentAnalyticsProps> = ({ stats, currentLang }) => {
  const t = translations[currentLang];
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState<string>('all');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <LineChartIcon className="w-5 h-5 text-blue-600" />
          <span>Attendance Analytics & Longitudinal Trends</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Detailed breakdown across 6-week progression, monthly averages, and hourly classroom heatmaps
        </p>
      </div>

      {/* Weekly Trend Line Chart */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              6-Week Overall Attendance Trajectory
            </h2>
            <p className="text-xs text-slate-500">
              Visualizes the negative slope: dropped from 88% in Week 1 to 72.4% in Week 6
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>-15.6% Slope Decline</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.weeklyTrend} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} tickLine={false} />
              <YAxis domain={[50, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                formatter={(value: any) => [`${value}%`, 'Attendance']}
              />
              <ReferenceLine y={75} stroke="#ef4444" strokeDasharray="4 4" label={{ value: '75% Mandatory Benchmark', position: 'top', fill: '#ef4444', fontSize: 11 }} />
              <Line
                type="monotone"
                dataKey="percentage"
                stroke="#2563eb"
                strokeWidth={3}
                dot={{ r: 5, fill: '#2563eb', strokeWidth: 2, stroke: '#ffffff' }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Monthly Comparison & Subject Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend Bar Chart */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-2 border-b border-slate-100">
            <h2 className="text-sm sm:text-base font-bold text-slate-900">
              Monthly Average Benchmark
            </h2>
            <p className="text-xs text-slate-500">June (91%) → July (84%) → August (72%)</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', borderColor: '#e2e8f0', fontSize: '12px' }}
                  formatter={(val: any) => [`${val}%`, 'Average Rate']}
                />
                <ReferenceLine y={80} stroke="#10b981" strokeDasharray="3 3" />
                <Bar dataKey="percentage" fill="#3b82f6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Individual Subject Standing */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-2 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900">Subject-Level Compliance</h2>
              <p className="text-xs text-slate-500">2 subjects currently under debarment risk</p>
            </div>
            <BookOpen className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-3">
            {stats.subjectStats.map((sub: any) => {
              const isCrit = sub.percentage < 75;
              return (
                <div key={sub.subjectId} className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-900">{sub.subjectCode} — {sub.subjectName}</span>
                    <p className="text-[11px] text-slate-500">{sub.attendedClasses} / {sub.totalClasses} classes attended</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-extrabold ${isCrit ? 'text-rose-600' : 'text-emerald-700'}`}>
                      {sub.percentage}%
                    </span>
                    <p className={`text-[10px] font-semibold ${isCrit ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isCrit ? 'Debarment Risk' : 'Eligible'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hourly Attendance Heatmap */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="pb-2 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-blue-600" />
              <span>Weekly Timetable Attendance Heatmap</span>
            </h2>
            <p className="text-xs text-slate-500">
              AI Insight: Noticeable attendance slump on Tuesday 2nd Period (71%) and Thursday afternoon labs (65%)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-500" /> &gt;85%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-blue-500" /> 75-85%</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-rose-500" /> &lt;75%</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[600px] grid grid-cols-6 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day) => {
              const dayCells = ATTENDANCE_HEATMAP_DATA.filter((c) => c.day === day);
              return (
                <div key={day} className="space-y-2">
                  <div className="text-center font-bold text-xs text-slate-700 p-1 bg-slate-100 rounded-lg">
                    {day}
                  </div>
                  {dayCells.map((cell, idx) => {
                    const isLow = cell.attendancePercent < 75;
                    const isMed = cell.attendancePercent >= 75 && cell.attendancePercent < 85;
                    const bg = isLow ? 'bg-rose-100 text-rose-900 border-rose-200' : isMed ? 'bg-blue-100 text-blue-900 border-blue-200' : 'bg-emerald-100 text-emerald-900 border-emerald-200';
                    return (
                      <div
                        key={idx}
                        className={`p-2 rounded-xl border text-center transition-all hover:scale-102 ${bg}`}
                        title={`${cell.timeSlot} - ${cell.subject}: ${cell.attendancePercent}%`}
                      >
                        <div className="text-[10px] font-semibold opacity-75">{cell.subject}</div>
                        <div className="text-xs font-extrabold">{cell.attendancePercent}%</div>
                        <div className="text-[9px] opacity-60">P{cell.period}</div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
