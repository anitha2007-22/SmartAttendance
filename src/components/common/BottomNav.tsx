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
  FileSpreadsheet,
  Building,
  UserCheck,
} from 'lucide-react';

interface BottomNavProps {
  role: UserRole;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  currentLang: Language;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  role,
  activeTab,
  onSelectTab,
  currentLang,
}) => {
  const t = translations[currentLang];

  const getTabs = () => {
    switch (role) {
      case 'student':
        return [
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'scan', label: 'Scan / Write', icon: QrCode, isPrimary: true },
          { id: 'profile', label: 'Profile', icon: UserCheck },
          { id: 'analytics', label: 'Trends', icon: LineChart },
          { id: 'risk', label: 'Risk', icon: ShieldAlert },
        ];
      case 'faculty':
        return [
          { id: 'dashboard', label: 'Classes', icon: LayoutDashboard },
          { id: 'live', label: 'Live QR', icon: Radio, isPrimary: true },
          { id: 'health', label: 'Health', icon: Activity },
          { id: 'anomalies', label: 'Anomalies', icon: ShieldAlert },
          { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
          { id: 'management', label: 'Enroll & TT', icon: UserCheck, isPrimary: true },
          { id: 'departments', label: 'Depts', icon: Building },
          { id: 'anomalies', label: 'Anti-Proxy', icon: ShieldAlert },
          { id: 'reports', label: 'Reports', icon: FileSpreadsheet },
        ];
    }
  };

  const tabs = getTabs();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-2 py-1.5 shadow-lg transition-colors">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          if (tab.isPrimary) {
            return (
              <button
                key={tab.id}
                id={`bottom-nav-${tab.id}`}
                onClick={() => onSelectTab(tab.id)}
                className="flex flex-col items-center justify-center -mt-5 relative cursor-pointer"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white shadow-md transition-transform active:scale-95 ${
                    isActive
                      ? 'bg-blue-700 ring-4 ring-blue-100 dark:ring-blue-900'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className={`text-[10px] font-semibold mt-1 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-600 dark:text-slate-400'}`}>
                  {tab.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={tab.id}
              id={`bottom-nav-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                isActive ? 'text-blue-600 dark:text-blue-400 font-semibold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
