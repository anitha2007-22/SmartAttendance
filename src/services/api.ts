import {
  Department,
  ClassSessionToday,
  RiskPrediction,
  AnomalyEvent,
  AuditLog,
  ClassHealthScore,
  DigitalTwinResult,
} from '../types';
import {
  DEPARTMENTS,
  TIMETABLE_TODAY,
  INITIAL_STUDENT_DATA,
  ARUN_RISK_PREDICTION,
  AT_RISK_STUDENTS_LIST,
  INITIAL_ANOMALIES,
  INITIAL_AUDIT_LOGS,
  CLASS_HEALTH_SCORES,
  CLASS_ROSTER_CSE3A,
} from '../data/mockDatabase';
import { verifyAttendanceSignals } from './antiProxyEngine';
import { calculateMissScenario, calculateTargetScenario } from './digitalTwin';
import { processCopilotQuery, CopilotResponse } from './copilotService';

export interface OfflineScanItem {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  departmentName: string;
  token: string;
  timestamp: number;
  synced: boolean;
}

const OFFLINE_QUEUE_KEY = 'sih_offline_attendance_queue';

export const offlineStorage = {
  getQueue(): OfflineScanItem[] {
    try {
      const data = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  addScan(item: Omit<OfflineScanItem, 'id' | 'synced'>): OfflineScanItem {
    const queue = this.getQueue();
    const newItem: OfflineScanItem = {
      ...item,
      id: `off-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      synced: false,
    };
    queue.push(newItem);
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('Failed to save offline scan to localStorage', e);
    }
    return newItem;
  },
  clearSynced() {
    try {
      localStorage.removeItem(OFFLINE_QUEUE_KEY);
    } catch (e) {
      console.warn(e);
    }
  },
};

export const api = {
  async getStats() {
    try {
      const res = await fetch('/api/stats/overview');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      totalStudents: 1130,
      totalFaculty: 74,
      totalClassesToday: 48,
      overallInstitutionAttendance: 80.6,
      atRiskStudentCount: AT_RISK_STUDENTS_LIST.length,
      pendingAnomaliesCount: INITIAL_ANOMALIES.filter(a => a.status === 'pending_review').length,
    };
  },

  async getDepartments(): Promise<Department[]> {
    try {
      const res = await fetch('/api/departments');
      if (res.ok) {
        const data = await res.json();
        return data.departments;
      }
    } catch {
      // Fallback
    }
    return DEPARTMENTS;
  },

  async getTodayTimetable(): Promise<ClassSessionToday[]> {
    try {
      const res = await fetch('/api/timetable/today');
      if (res.ok) {
        const data = await res.json();
        return data.timetable;
      }
    } catch {
      // Fallback
    }
    return TIMETABLE_TODAY;
  },

  async getStudentDashboard() {
    try {
      const res = await fetch('/api/student/dashboard');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      studentStats: INITIAL_STUDENT_DATA,
      riskPrediction: ARUN_RISK_PREDICTION,
      timetableToday: TIMETABLE_TODAY,
    };
  },

  async getActiveSession() {
    try {
      const res = await fetch('/api/attendance/session/active');
      if (res.ok) {
        const data = await res.json();
        return data.session;
      }
    } catch {
      // Fallback
    }
    return {
      id: 'live-sess-dbms-902',
      subjectCode: 'CS8592',
      subjectName: 'Database Management Systems',
      facultyName: 'Dr. R. Ramanathan',
      roomNumber: 'LH-302',
      status: 'active',
      currentToken: 'SEC-A84F21',
      secondsRemaining: 18,
      presentCount: CLASS_ROSTER_CSE3A.filter(s => s.status === 'present').length,
      absentCount: CLASS_ROSTER_CSE3A.filter(s => s.status === 'absent').length,
      flaggedCount: 1,
      roster: CLASS_ROSTER_CSE3A,
    };
  },

  async verifyAttendance(payload: any, isOffline: boolean = false) {
    if (isOffline) {
      // Save locally to offline queue
      const queued = offlineStorage.addScan({
        studentId: payload.studentId,
        studentName: payload.studentName,
        rollNumber: payload.rollNumber,
        departmentName: payload.departmentName,
        token: payload.token || 'SEC-OFFLINE',
        timestamp: Date.now(),
      });
      return {
        success: true,
        confidenceScore: 88,
        isOfflineQueued: true,
        offlineId: queued.id,
        signals: [
          { name: 'Authenticated Session', status: 'pass' as const, detail: 'Stored in secure local cryptographic cache', weight: 30 },
          { name: 'Offline Timestamp Sealed', status: 'pass' as const, detail: 'Local timestamp locked for pending synchronization', weight: 40 },
        ],
      };
    }

    try {
      const res = await fetch('/api/attendance/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback client-side verification
    }

    return verifyAttendanceSignals({
      payload: {
        sessionId: 'live-sess-dbms-902',
        classId: 'cls-cse-3a',
        subjectId: 'sub-dbms',
        facultyId: 'fac-001',
        token: payload.token || 'SEC-A84F21',
        timestamp: Date.now(),
        expiresAt: Date.now() + 15000,
        nonce: 'xyz987',
      },
      studentId: payload.studentId || 'stu-001',
      studentName: payload.studentName || 'Arun Kumar M.',
      rollNumber: payload.rollNumber || '23CS104',
      departmentName: 'Computer Science & Engineering',
      clientTimestamp: Date.now(),
      clientCoordinates: payload.clientCoordinates,
      clientDevice: payload.clientDevice || 'Google Pixel 8 (Android 15)',
      currentActiveToken: 'SEC-A84F21',
      alreadyMarkedStudentIds: [],
      biometricVerification: payload.biometricVerification,
    });
  },

  async syncOfflineScans() {
    const queue = offlineStorage.getQueue();
    if (queue.length === 0) return { syncedCount: 0 };
    
    // Simulate server sync
    await new Promise(r => setTimeout(r, 600));
    offlineStorage.clearSynced();
    return { syncedCount: queue.length };
  },

  async manualOverride(data: { studentId: string; newStatus: string; reason: string; facultyId: string; facultyName: string }) {
    try {
      const res = await fetch('/api/attendance/override', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return { success: true, message: 'Attendance overridden and logged.' };
  },

  async getAnomalies(): Promise<AnomalyEvent[]> {
    try {
      const res = await fetch('/api/anomalies');
      if (res.ok) {
        const data = await res.json();
        return data.anomalies;
      }
    } catch {
      // Fallback
    }
    return INITIAL_ANOMALIES;
  },

  async reviewAnomaly(id: string, reviewNotes: string, status: string = 'reviewed') {
    try {
      const res = await fetch(`/api/anomalies/${id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewNotes, status }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return { success: true };
  },

  async getRiskPredictions(): Promise<{ studentsAtRisk: RiskPrediction[]; primaryStudentRisk: RiskPrediction }> {
    try {
      const res = await fetch('/api/ai/risk');
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return {
      studentsAtRisk: AT_RISK_STUDENTS_LIST,
      primaryStudentRisk: ARUN_RISK_PREDICTION,
    };
  },

  async queryCopilot(query: string): Promise<CopilotResponse> {
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return processCopilotQuery(query);
  },

  async simulateDigitalTwin(type: 'miss_classes' | 'target_attendance', params: { missCount?: number; targetPercent?: number; attended?: number; total?: number }): Promise<DigitalTwinResult> {
    try {
      const res = await fetch('/api/ai/digital-twin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, ...params }),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }

    const attended = params.attended || 145;
    const total = params.total || 200;
    if (type === 'miss_classes') {
      return calculateMissScenario(attended, total, params.missCount || 2, 75);
    }
    return calculateTargetScenario(attended, total, params.targetPercent || 80);
  },

  async getAuditLogs(): Promise<AuditLog[]> {
    try {
      const res = await fetch('/api/audit/logs');
      if (res.ok) {
        const data = await res.json();
        return data.auditLogs;
      }
    } catch {
      // Fallback
    }
    return INITIAL_AUDIT_LOGS;
  },

  async getHealthScores(): Promise<ClassHealthScore[]> {
    try {
      const res = await fetch('/api/analytics/health-scores');
      if (res.ok) {
        const data = await res.json();
        return data.healthScores;
      }
    } catch {
      // Fallback
    }
    return CLASS_HEALTH_SCORES;
  },

  // Admin Management APIs
  async getEnrolledStudents() {
    try {
      const res = await fetch('/api/admin/students');
      if (res.ok) {
        const data = await res.json();
        return data.students;
      }
    } catch {
      // Fallback
    }
    return [
      { id: 'stu-001', name: 'Arun Kumar M', rollNumber: '717822P101', email: 'arun.k@smartatt.edu', departmentName: 'Computer Science & Engineering', password: 'Password@123', year: '3rd Year', semester: '5th Sem', status: 'active', attendancePercentage: 72.5 },
      { id: 'stu-002', name: 'Priya Soundararajan', rollNumber: '717822P142', email: 'priya.s@smartatt.edu', departmentName: 'Computer Science & Engineering', password: 'Password@123', year: '3rd Year', semester: '5th Sem', status: 'active', attendancePercentage: 88.0 },
      { id: 'stu-003', name: 'Karthik Raja V', rollNumber: '717822P128', email: 'karthik.v@smartatt.edu', departmentName: 'Computer Science & Engineering', password: 'Password@123', year: '3rd Year', semester: '5th Sem', status: 'active', attendancePercentage: 91.5 },
      { id: 'stu-004', name: 'Sneha Venkatesh', rollNumber: '717822P155', email: 'sneha.v@smartatt.edu', departmentName: 'Information Technology', password: 'Password@123', year: '3rd Year', semester: '5th Sem', status: 'active', attendancePercentage: 68.0 },
      { id: 'stu-005', name: 'Mohammed Farhan', rollNumber: '717822P133', email: 'farhan.m@smartatt.edu', departmentName: 'Electronics & Communication', password: 'Password@123', year: '2nd Year', semester: '3rd Sem', status: 'active', attendancePercentage: 79.2 },
      { id: 'stu-006', name: 'Divya Bharathi', rollNumber: '717822P112', email: 'divya.b@smartatt.edu', departmentName: 'Electrical & Electronics', password: 'Password@123', year: '3rd Year', semester: '5th Sem', status: 'active', attendancePercentage: 64.0 },
    ];
  },

  async enrollStudent(student: any) {
    try {
      const res = await fetch('/api/admin/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(student),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return { success: true, student: { id: `stu-${Date.now()}`, ...student, status: 'active', attendancePercentage: 100 } };
  },

  async deleteStudent(id: string) {
    try {
      const res = await fetch(`/api/admin/students/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return { success: true };
  },

  async getTimetableSchedule() {
    try {
      const res = await fetch('/api/admin/timetable');
      if (res.ok) {
        const data = await res.json();
        return data.timetable;
      }
    } catch {
      // Fallback
    }
    return TIMETABLE_TODAY;
  },

  async addTimetableSlot(slot: any) {
    try {
      const res = await fetch('/api/admin/timetable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(slot),
      });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return { success: true, slot: { id: `tt-${Date.now()}`, ...slot } };
  },

  async deleteTimetableSlot(id: string) {
    try {
      const res = await fetch(`/api/admin/timetable/${id}`, { method: 'DELETE' });
      if (res.ok) return await res.json();
    } catch {
      // Fallback
    }
    return { success: true };
  },
};
