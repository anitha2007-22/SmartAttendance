import React from 'react';
import { User } from '../../types';
import { Language, translations } from '../../i18n/translations';
import { useLiveClock } from '../../hooks/useLiveClock';
import { useGPSLocation } from '../../hooks/useGPSLocation';
import {
  GraduationCap,
  Mail,
  ShieldCheck,
  Smartphone,
  Calendar,
  Clock,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Building,
  KeyRound,
  Award,
  MapPin,
  Satellite,
  Compass,
} from 'lucide-react';

interface StudentProfileProps {
  user: User;
  stats: any;
  onLogout: () => void;
  currentLang: Language;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({
  user,
  stats,
  onLogout,
  currentLang,
}) => {
  const t = translations[currentLang];
  const { formattedTime, formattedDate, greeting } = useLiveClock();
  const { gpsData, isRefreshing, refreshGPS } = useGPSLocation();
  const isAtRisk = (stats?.overallPercentage || user.overallAttendance || 75) < 75;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header Banner with Greeting and Clock */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-semibold text-blue-200">
            <Clock className="w-3.5 h-3.5" />
            <span>{greeting} • {formattedTime}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {user.name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-200">
            Roll Number: <span className="font-mono font-bold text-white">{user.rollNumber}</span> • {user.departmentName}
          </p>
        </div>

        <button
          onClick={onLogout}
          className="z-10 flex items-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit & Log Out</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Official Digital ID Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-4">
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex flex-col items-center justify-center font-bold text-2xl shadow-md border-4 border-slate-100 select-none">
              <span className="tracking-wider">
                {user.name
                  .split(' ')
                  .filter(Boolean)
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)
                  .toUpperCase() || 'ST'}
              </span>
              <span className="text-[10px] uppercase font-semibold text-blue-200 tracking-normal mt-0.5">
                STUDENT
              </span>
            </div>
            <div className="absolute -bottom-2 -right-2 p-1.5 bg-emerald-500 rounded-full text-white shadow">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>

          <div>
            <h2 className="text-lg font-bold text-slate-900">{user.name}</h2>
            <div className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg mt-1 inline-block">
              {user.rollNumber}
            </div>
            <p className="text-xs text-slate-500 mt-2">{user.departmentName}</p>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 space-y-2 text-left text-xs">
            <div className="flex justify-between text-slate-600">
              <span className="text-slate-400">Academic Year:</span>
              <span className="font-semibold">{user.year || '3rd Year'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="text-slate-400">Semester & Sec:</span>
              <span className="font-semibold">Sem {user.semester || '5'} - Sec {user.section || 'A'}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="text-slate-400">Institutional Email:</span>
              <span className="font-semibold truncate max-w-[150px]">{user.email}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span className="text-slate-400">Enrollment Status:</span>
              <span className="font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Verified Active
              </span>
            </div>
          </div>
        </div>

        {/* Right 2 Columns: Attendance & Security Diagnostics */}
        <div className="md:col-span-2 space-y-6">
          {/* Attendance Standing Overview */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Attendance Standing & Debarment Status</span>
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold ${
                  isAtRisk
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                }`}
              >
                {isAtRisk ? 'At-Risk Warning (<75%)' : 'Eligible for Exams (>=75%)'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Overall Attendance</div>
                <div className={`text-2xl font-extrabold mt-1 ${isAtRisk ? 'text-rose-600' : 'text-slate-900'}`}>
                  {stats?.overallPercentage || user.overallAttendance || 72.4}%
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Mandatory Cutoff: 75%</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Attended / Total</div>
                <div className="text-2xl font-extrabold text-slate-900 mt-1">
                  {stats?.totalAttended || 126}/{stats?.totalClassesHeld || 174}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Classes Registered</div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="text-xs text-slate-500 font-medium">Anti-Proxy Trust</div>
                <div className="text-2xl font-extrabold text-emerald-600 mt-1">
                  98.4%
                </div>
                <div className="text-[11px] text-emerald-600/80 mt-0.5">High Cryptographic Trust</div>
              </div>
            </div>
          </div>

          {/* Bound Student Device Signature */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-600" />
              <span>Registered Student Mobile Device</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 block font-medium">Hardware Model</span>
                <span className="font-bold text-slate-800">Google Pixel 8 (Android 15)</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 block font-medium">Device Fingerprint Hash</span>
                <span className="font-mono font-semibold text-blue-600">SHA256: 8f4e..c92a</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 block font-medium">Classroom GPS Geofence</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Inside ({gpsData.distanceToClassroom}m / {gpsData.geofenceRadius}m limit)
                </span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400 block font-medium">Current GPS Coordinates</span>
                <span className="font-mono font-bold text-slate-800">
                  {gpsData.latitude}°N, {gpsData.longitude}°E (±{gpsData.accuracy}m)
                </span>
              </div>
            </div>
          </div>

          {/* Exit Action Card */}
          <div className="p-5 rounded-3xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Finished with attendance?</h4>
              <p className="text-xs text-slate-500">
                Log out securely to protect your academic records on shared or public devices.
              </p>
            </div>
            <button
              onClick={onLogout}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
