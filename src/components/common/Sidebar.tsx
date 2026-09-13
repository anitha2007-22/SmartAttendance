import React from 'react';
import { UserRole } from '../../types';
import { Language, translations } from '../../i18n/translations';
import {
  LayoutDashboard,
  QrCode,
  LineChart,
  Calculator,
  ShieldAlert,
  Radio,
  Activity,
  History,
  Building,
  FileSpreadsheet,
  Sliders,
  Sparkles,
  PlayCircle,
  AlertTriangle,
  UserCheck,
  Calendar,
} from 'lucide-react';

interface SidebarProps {
  role: UserRole;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentLang: Language;
  pendingAnomaliesCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  role,
  activeTab,
  onSelectTab,
  currentLang,
  pendingAnomaliesCount = 2,
}) => {
  const t = translations[currentLang];

  const getMenuItems = () => {
    switch (role) {
      case 'student':
        return [
          { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
          { id: 'scan', label: 'Scan / Write QR', icon: QrCode, highlight: true },
          { id: 'profile', label: 'My Student Profile', icon: UserCheck },
          { id: 'analytics', label: t.analytics, icon: LineChart },
          { id: 'whatif', label: t.whatIfSimulator, icon: Calculator },
          { id: 'risk', label: t.riskPrediction, icon: ShieldAlert },
        ];
      case 'faculty':
        return [
          { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
          { id: 'live', label: 'Live Dynamic QR', icon: Radio, highlight: true },
          { id: 'health', label: t.healthScores, icon: Activity },
          { id: 'anomalies', label: t.anomalyCenter, icon: ShieldAlert, badge: pendingAnomaliesCount },
          { id: 'audit', label: t.auditLogs, icon: History },
          { id: 'reports', label: t.reports, icon: FileSpreadsheet },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Institution Command', icon: LayoutDashboard },
          { id: 'management', label: 'Enrollment & Timetable', icon: UserCheck, highlight: true },
          { id: 'departments', label: 'Department Analytics', icon: Building },
          { id: 'anomalies', label: 'Anti-Proxy Events', icon: ShieldAlert, badge: pendingAnomaliesCount },
          { id: 'reports', label: 'Export Reports', icon: FileSpreadsheet },
          { id: 'settings', label: t.settings, icon: Sliders },
          { id: 'audit', label: t.auditLogs, icon: History },
        ];
    }
  };

  const menuItems = getMenuItems();

  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/80 backdrop-blur-xs min-h-[calc(100vh-4rem)] p-4 shrink-0 transition-colors">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
        {role === 'student' ? 'Student Portal' : role === 'faculty' ? 'Faculty Workspace' : 'Executive Admin'}
      </div>

      <nav className="space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`sidebar-nav-${item.id}`}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs shadow-blue-500/20'
                  : item.highlight
                  ? 'bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 border border-blue-200/60 dark:border-blue-800/60'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge ? (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white text-blue-700' : 'bg-rose-500 text-white'
                  }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Bottom SIH Innovation Badge */}
      <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800">
        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 text-white shadow-xs">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Architecture</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-1 leading-snug">
            Deterministic mathematical simulation paired with explainable risk analytics.
          </p>
          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-white/10">
            <span>Threshold: 75%</span>
            <span className="text-emerald-400 font-semibold">Active Engine</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
