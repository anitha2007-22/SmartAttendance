import React from 'react';
import { Department } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { HealthScoreGauge } from '../common/HealthScoreGauge';
import {
  Building2,
  Users,
  GraduationCap,
  TrendingDown,
  TrendingUp,
  Activity,
  AlertTriangle,
  FileSpreadsheet,
} from 'lucide-react';

interface DepartmentAnalyticsProps {
  departments: Department[];
  currentLang: Language;
}

export const DepartmentAnalytics: React.FC<DepartmentAnalyticsProps> = ({ departments, currentLang }) => {
  const t = translations[currentLang];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-blue-600" />
          <span>Department-Wise Longitudinal Analytics</span>
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Comparative compliance, health indices, student delinquency rates, and faculty ratios across all branches
        </p>
      </div>

      {/* Grid of Department Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => {
          const isCrit = dept.averageAttendance < 75;
          const isWarn = dept.averageAttendance >= 75 && dept.averageAttendance < 80;

          return (
            <div
              key={dept.id}
              className={`p-5 sm:p-6 rounded-2xl border bg-white shadow-xs space-y-4 flex flex-col justify-between ${
                isCrit ? 'border-rose-200 ring-1 ring-rose-400/20' : 'border-slate-200/80'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                      {dept.code}
                    </span>
                    <h2 className="text-base font-bold text-slate-900 mt-1.5">{dept.name}</h2>
                  </div>
                  <div className="text-right">
                    <span
                      className={`text-2xl font-extrabold block ${
                        isCrit ? 'text-rose-600' : isWarn ? 'text-amber-600' : 'text-slate-900'
                      }`}
                    >
                      {dept.averageAttendance}%
                    </span>
                    <span className="text-[10px] text-slate-400">Avg Attendance</span>
                  </div>
                </div>

                <div className="my-3 flex justify-center">
                  <HealthScoreGauge score={dept.healthScore} size={110} />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Students</span>
                    <span className="text-sm font-extrabold text-slate-900">{dept.totalStudents}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Faculty</span>
                    <span className="text-sm font-extrabold text-slate-900">{dept.totalFaculty}</span>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-rose-50/70 border border-rose-200 text-xs flex items-center justify-between">
                <span className="text-rose-800 font-semibold">At-Risk Students:</span>
                <span className="font-extrabold text-rose-700">{dept.atRiskCount} Students</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
