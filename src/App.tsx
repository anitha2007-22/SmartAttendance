/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Department, ClassSessionToday, RiskPrediction, AnomalyEvent, AuditLog, ClassHealthScore } from './types';
import { DEMO_USERS, DEPARTMENTS, TIMETABLE_TODAY, INITIAL_STUDENT_DATA, ARUN_RISK_PREDICTION, AT_RISK_STUDENTS_LIST, INITIAL_ANOMALIES, INITIAL_AUDIT_LOGS, CLASS_HEALTH_SCORES } from './data/mockDatabase';
import { Language } from './i18n/translations';
import { api, offlineStorage } from './services/api';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { BottomNav } from './components/common/BottomNav';
import { AICopilotDrawer } from './components/common/AICopilotDrawer';
import { SIHScenariosModal } from './components/common/SIHScenariosModal';

// Student Module Components
import { LoginPage } from './components/auth/LoginPage';
import { StudentDashboard } from './components/student/StudentDashboard';
import { StudentScanner } from './components/student/StudentScanner';
import { StudentAnalytics } from './components/student/StudentAnalytics';
import { WhatIfSimulator } from './components/student/WhatIfSimulator';
import { RiskExplainerModal } from './components/student/RiskExplainerModal';
import { StudentProfile } from './components/student/StudentProfile';

// Faculty Module Components
import { FacultyDashboard } from './components/faculty/FacultyDashboard';
import { LiveAttendanceSession } from './components/faculty/LiveAttendanceSession';
import { ClassHealthView } from './components/faculty/ClassHealthView';
import { AnomalyReviewPanel } from './components/faculty/AnomalyReviewPanel';
import { FloatingMiniQRDock } from './components/faculty/FloatingMiniQRDock';

// Admin Module Components
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DepartmentAnalytics } from './components/admin/DepartmentAnalytics';
import { ReportsGenerator } from './components/admin/ReportsGenerator';
import { SystemSettings } from './components/admin/SystemSettings';
import { AdminManagementPanel } from './components/admin/AdminManagementPanel';

export default function App() {
  // Authentication / Active Role State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User>(DEMO_USERS[0]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [currentLang, setCurrentLang] = useState<Language>('en');

  // Offline Simulator State
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [queuedOfflineCount, setQueuedOfflineCount] = useState<number>(() => offlineStorage.getQueue().length);
  const [syncToast, setSyncToast] = useState<string>('');

  // Modals & Drawers
  const [isCopilotOpen, setIsCopilotOpen] = useState<boolean>(false);
  const [isSIHModalOpen, setIsSIHModalOpen] = useState<boolean>(false);

  // Live Data States
  const [departments, setDepartments] = useState<Department[]>(DEPARTMENTS);
  const [timetable, setTimetable] = useState<ClassSessionToday[]>(TIMETABLE_TODAY);
  const [studentStats, setStudentStats] = useState<any>(INITIAL_STUDENT_DATA);
  const [riskPrediction, setRiskPrediction] = useState<RiskPrediction>(ARUN_RISK_PREDICTION);
  const [atRiskStudents, setAtRiskStudents] = useState<RiskPrediction[]>(AT_RISK_STUDENTS_LIST);
  const [anomalies, setAnomalies] = useState<AnomalyEvent[]>(INITIAL_ANOMALIES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [healthScores, setHealthScores] = useState<ClassHealthScore[]>(CLASS_HEALTH_SCORES);

  // Fetch initial data from server or fallbacks
  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      const depts = await api.getDepartments();
      setDepartments(depts);

      const tt = await api.getTodayTimetable();
      setTimetable(tt);

      const stuData = await api.getStudentDashboard();
      if (stuData.studentStats) setStudentStats(stuData.studentStats);
      if (stuData.riskPrediction) setRiskPrediction(stuData.riskPrediction);

      const anoms = await api.getAnomalies();
      setAnomalies(anoms);

      const auds = await api.getAuditLogs();
      setAuditLogs(auds);

      const hs = await api.getHealthScores();
      setHealthScores(hs);

      const riskData = await api.getRiskPredictions();
      if (riskData.studentsAtRisk) setAtRiskStudents(riskData.studentsAtRisk);
    } catch (e) {
      console.warn('Initial data load completed with default database', e);
    }
  };

  // Sync offline queue
  const handleSyncOffline = async () => {
    const res = await api.syncOfflineScans();
    setQueuedOfflineCount(0);
    setSyncToast(`Successfully synchronized ${res.syncedCount} offline attendance record(s) to live database!`);
    loadAllData();
    setTimeout(() => setSyncToast(''), 3000);
  };

  // Handle switching test persona / role
  const handleSwitchUser = (newUser: User) => {
    setCurrentUser(newUser);
    setActiveTab('dashboard');
  };

  // Handle Scenario Launch from SIH Scenarios Modal
  const handleSelectScenario = (scenarioId: string) => {
    switch (scenarioId) {
      case 'sc-dynamic-qr':
        // Switch to faculty and open live QR
        setCurrentUser(DEMO_USERS[2]); // Dr. Ramanathan
        setActiveTab('live');
        break;
      case 'sc-screenshot-block':
      case 'sc-impossible-geo':
        // Switch to faculty anomalies review
        setCurrentUser(DEMO_USERS[2]);
        setActiveTab('anomalies');
        break;
      case 'sc-xai-risk':
        // Switch to high risk student Arun Kumar risk explanation
        setCurrentUser(DEMO_USERS[0]);
        setActiveTab('risk');
        break;
      case 'sc-digital-twin':
        // Switch to student What-If simulator
        setCurrentUser(DEMO_USERS[0]);
        setActiveTab('whatif');
        break;
      case 'sc-human-override':
        // Switch to faculty live session for manual override
        setCurrentUser(DEMO_USERS[2]);
        setActiveTab('live');
        break;
      case 'sc-offline-sync':
        // Switch to student scanner in offline mode
        setCurrentUser(DEMO_USERS[0]);
        setIsOffline(true);
        setActiveTab('scan');
        break;
      default:
        setActiveTab('dashboard');
        break;
    }
  };

  const pendingAnomaliesCount = anomalies.filter((a) => a.status === 'pending_review').length;

  if (!isAuthenticated) {
    return (
      <LoginPage
        onLogin={(user) => {
          setCurrentUser(user);
          setIsAuthenticated(true);
          setActiveTab('dashboard');
        }}
        currentLang={currentLang}
        onToggleLang={setCurrentLang}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Top Universal Navbar */}
      <Navbar
        currentUser={currentUser}
        onSwitchUser={handleSwitchUser}
        onLogout={() => setIsAuthenticated(false)}
        currentLang={currentLang}
        onToggleLang={setCurrentLang}
        isOffline={isOffline}
        onToggleOffline={() => setIsOffline(!isOffline)}
        queuedOfflineCount={queuedOfflineCount}
        onSyncOffline={handleSyncOffline}
        onOpenCopilot={() => setIsCopilotOpen(true)}
        onOpenSIHScenarios={() => setIsSIHModalOpen(true)}
        unreadNotifsCount={pendingAnomaliesCount}
      />

      {/* Offline sync notification toast */}
      {syncToast && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-xl border border-emerald-500 text-xs font-semibold animate-in fade-in slide-in-from-top-4 flex items-center gap-2">
          <span>{syncToast}</span>
        </div>
      )}

      {/* Main Body Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Left Sidebar */}
        <Sidebar
          role={currentUser.role}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          currentLang={currentLang}
          pendingAnomaliesCount={pendingAnomaliesCount}
        />

        {/* Dynamic Center Stage Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 pb-24 md:pb-8 overflow-y-auto max-w-5xl">
          {/* ========================================================================= */}
          {/* STUDENT ROLE VIEWS                                                        */}
          {/* ========================================================================= */}
          {currentUser.role === 'student' && (
            <>
              {activeTab === 'dashboard' && (
                <StudentDashboard
                  user={currentUser}
                  stats={studentStats}
                  timetable={timetable}
                  riskPrediction={riskPrediction}
                  onNavigateToScan={() => setActiveTab('scan')}
                  onNavigateToWhatIf={() => setActiveTab('whatif')}
                  onNavigateToRisk={() => setActiveTab('risk')}
                  onLogout={() => setIsAuthenticated(false)}
                  currentLang={currentLang}
                />
              )}

              {activeTab === 'scan' && (
                <StudentScanner
                  user={currentUser}
                  isOffline={isOffline}
                  currentLang={currentLang}
                  onLogout={() => setIsAuthenticated(false)}
                  onAttendanceMarkedSuccess={() => {
                    loadAllData();
                    if (isOffline) {
                      setQueuedOfflineCount(offlineStorage.getQueue().length);
                    }
                  }}
                />
              )}

              {activeTab === 'profile' && (
                <StudentProfile
                  user={currentUser}
                  stats={studentStats}
                  onLogout={() => setIsAuthenticated(false)}
                  currentLang={currentLang}
                />
              )}

              {activeTab === 'analytics' && (
                <StudentAnalytics stats={studentStats} currentLang={currentLang} />
              )}

              {activeTab === 'whatif' && (
                <WhatIfSimulator stats={studentStats} currentLang={currentLang} />
              )}

              {activeTab === 'risk' && (
                <RiskExplainerModal
                  prediction={riskPrediction}
                  onOpenWhatIf={() => setActiveTab('whatif')}
                />
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* FACULTY ROLE VIEWS                                                        */}
          {/* ========================================================================= */}
          {currentUser.role === 'faculty' && (
            <>
              {activeTab === 'dashboard' && (
                <FacultyDashboard
                  user={currentUser}
                  timetable={timetable}
                  atRiskStudents={atRiskStudents}
                  onNavigateToLive={() => setActiveTab('live')}
                  onNavigateToHealth={() => setActiveTab('health')}
                  onNavigateToAnomalies={() => setActiveTab('anomalies')}
                  currentLang={currentLang}
                />
              )}

              {activeTab === 'live' && (
                <LiveAttendanceSession currentLang={currentLang} />
              )}

              {activeTab === 'health' && (
                <ClassHealthView healthScores={healthScores} currentLang={currentLang} />
              )}

              {activeTab === 'anomalies' && (
                <AnomalyReviewPanel
                  anomalies={anomalies}
                  onRefresh={loadAllData}
                  currentLang={currentLang}
                />
              )}

              {activeTab === 'audit' && (
                <SystemSettings auditLogs={auditLogs} currentLang={currentLang} />
              )}

              {activeTab === 'reports' && (
                <ReportsGenerator currentLang={currentLang} />
              )}
            </>
          )}

          {/* ========================================================================= */}
          {/* ADMIN ROLE VIEWS                                                          */}
          {/* ========================================================================= */}
          {currentUser.role === 'admin' && (
            <>
              {activeTab === 'dashboard' && (
                <AdminDashboard
                  departments={departments}
                  atRiskStudents={atRiskStudents}
                  anomalies={anomalies}
                  onNavigateToDepts={() => setActiveTab('departments')}
                  onNavigateToAnomalies={() => setActiveTab('anomalies')}
                  onNavigateToReports={() => setActiveTab('reports')}
                  onNavigateToManagement={() => setActiveTab('management')}
                  currentLang={currentLang}
                />
              )}

              {activeTab === 'management' && (
                <AdminManagementPanel />
              )}

              {activeTab === 'departments' && (
                <DepartmentAnalytics departments={departments} currentLang={currentLang} />
              )}

              {activeTab === 'anomalies' && (
                <AnomalyReviewPanel
                  anomalies={anomalies}
                  onRefresh={loadAllData}
                  currentLang={currentLang}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsGenerator currentLang={currentLang} />
              )}

              {activeTab === 'settings' && (
                <SystemSettings auditLogs={auditLogs} currentLang={currentLang} />
              )}

              {activeTab === 'audit' && (
                <SystemSettings auditLogs={auditLogs} currentLang={currentLang} />
              )}
            </>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <BottomNav
        role={currentUser.role}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        currentLang={currentLang}
      />

      {/* AI Copilot Drawer */}
      <AICopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
        currentLang={currentLang}
        onNavigateToWhatIf={() => {
          if (currentUser.role !== 'student') setCurrentUser(DEMO_USERS[0]);
          setActiveTab('whatif');
        }}
        onNavigateToRisk={() => {
          if (currentUser.role !== 'student') setCurrentUser(DEMO_USERS[0]);
          setActiveTab('risk');
        }}
      />

      {/* SIH Scenarios Interactive Selector Modal */}
      <SIHScenariosModal
        isOpen={isSIHModalOpen}
        onClose={() => setIsSIHModalOpen(false)}
        onSelectScenario={handleSelectScenario}
        currentLang={currentLang}
      />

      {/* Floating Picture-in-Picture Mini QR Dock when Faculty switches tabs */}
      {currentUser.role === 'faculty' && (
        <FloatingMiniQRDock
          currentTab={activeTab}
          onNavigateToLive={() => setActiveTab('live')}
          currentLang={currentLang}
        />
      )}
    </div>
  );
}
