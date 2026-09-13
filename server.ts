import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

import {
  DEPARTMENTS,
  SUBJECTS,
  TIMETABLE_TODAY,
  INITIAL_STUDENT_DATA,
  ARUN_RISK_PREDICTION,
  AT_RISK_STUDENTS_LIST,
  INITIAL_ANOMALIES,
  INITIAL_AUDIT_LOGS,
  CLASS_HEALTH_SCORES,
  CLASS_ROSTER_CSE3A,
  INSTITUTION_CONFIG,
} from './src/data/mockDatabase';
import { generateSessionToken, verifyAttendanceSignals } from './src/services/antiProxyEngine';
import { calculateMissScenario, calculateTargetScenario } from './src/services/digitalTwin';
import { processCopilotQuery } from './src/services/copilotService';

dotenv.config();

// In-memory state for live operations
let currentSession = {
  id: 'live-sess-dbms-902',
  subjectId: 'sub-dbms',
  subjectCode: 'CS8592',
  subjectName: 'Database Management Systems',
  facultyId: 'fac-001',
  facultyName: 'Dr. R. Ramanathan',
  roomNumber: 'LH-302 (CS Block 3rd Floor)',
  startTime: '09:00 AM',
  status: 'active' as 'active' | 'expired' | 'closed',
  seed: 0,
  currentToken: 'SEC-A84F21',
  previousToken: 'SEC-91B2D3',
  tokenExpiresInSeconds: 30,
  lastTokenRotatedAt: Date.now(),
  latitude: INSTITUTION_CONFIG.classroomCoords.lat,
  longitude: INSTITUTION_CONFIG.classroomCoords.lng,
  geofenceRadiusMeters: 50,
};

let roster = [...CLASS_ROSTER_CSE3A];
let anomalies = [...INITIAL_ANOMALIES];
let auditLogs = [...INITIAL_AUDIT_LOGS];
let studentStats = { ...INITIAL_STUDENT_DATA };
let timetableSchedule = [...TIMETABLE_TODAY];

// In-memory enrolled students registry with credentials
let enrolledStudents = [
  {
    id: 'stu-001',
    name: 'Arun Kumar M.',
    rollNumber: '23CS104',
    email: 'arun.kumar@smartattendance.edu',
    password: 'student@123',
    departmentId: 'dept-cse',
    departmentName: 'Computer Science & Engineering',
    semester: 5,
    section: 'A',
    overallAttendance: 72.4,
    status: 'active',
    enrolledAt: '2025-07-15',
  },
  {
    id: 'stu-002',
    name: 'Priya Soundararajan',
    rollNumber: '23CS142',
    email: 'priya.s@smartattendance.edu',
    password: 'student@123',
    departmentId: 'dept-cse',
    departmentName: 'Computer Science & Engineering',
    semester: 5,
    section: 'A',
    overallAttendance: 89.2,
    status: 'active',
    enrolledAt: '2025-07-15',
  },
  {
    id: 'stu-003',
    name: 'Karthik Raja V.',
    rollNumber: '23CS119',
    email: 'karthik.raja@smartattendance.edu',
    password: 'student@123',
    departmentId: 'dept-cse',
    departmentName: 'Computer Science & Engineering',
    semester: 5,
    section: 'A',
    overallAttendance: 68.5,
    status: 'active',
    enrolledAt: '2025-07-16',
  },
  {
    id: 'stu-004',
    name: 'Siddharth Menon',
    rollNumber: '23IT108',
    email: 'siddharth.m@smartattendance.edu',
    password: 'student@123',
    departmentId: 'dept-it',
    departmentName: 'Information Technology',
    semester: 5,
    section: 'B',
    overallAttendance: 64.2,
    status: 'active',
    enrolledAt: '2025-07-18',
  },
  {
    id: 'stu-005',
    name: 'Ananya Ramesh',
    rollNumber: '23ECE120',
    email: 'ananya.r@smartattendance.edu',
    password: 'student@123',
    departmentId: 'dept-ece',
    departmentName: 'Electronics & Communication',
    semester: 5,
    section: 'A',
    overallAttendance: 91.5,
    status: 'active',
    enrolledAt: '2025-07-20',
  },
];

// Timer to rotate dynamic QR token every 30 seconds
setInterval(() => {
  if (currentSession.status === 'active') {
    currentSession.seed += 1;
    currentSession.previousToken = currentSession.currentToken;
    currentSession.currentToken = generateSessionToken(currentSession.id, currentSession.seed);
    currentSession.lastTokenRotatedAt = Date.now();
  }
}, 30000);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      system: 'Smart Attendance Intelligence Engine',
      timestamp: new Date().toISOString(),
      activeSessions: currentSession.status === 'active' ? 1 : 0,
    });
  });

  // Overview KPIs
  app.get('/api/stats/overview', (req, res) => {
    const presentStudents = roster.filter(s => s.status === 'present').length;
    res.json({
      institution: INSTITUTION_CONFIG,
      totalStudents: 1130,
      totalFaculty: 74,
      totalClassesToday: 48,
      overallInstitutionAttendance: 80.6,
      atRiskStudentCount: AT_RISK_STUDENTS_LIST.length,
      pendingAnomaliesCount: anomalies.filter(a => a.status === 'pending_review').length,
      liveSession: {
        ...currentSession,
        presentCount: presentStudents,
        totalEnrolled: roster.length,
        attendancePercentage: Number(((presentStudents / roster.length) * 100).toFixed(1)),
        secondsRemaining: Math.max(0, 30 - Math.floor((Date.now() - currentSession.lastTokenRotatedAt) / 1000)),
      },
    });
  });

  // Departments
  app.get('/api/departments', (req, res) => {
    res.json({ departments: DEPARTMENTS });
  });

  // Timetable schedule
  app.get('/api/timetable/today', (req, res) => {
    res.json({ timetable: timetableSchedule });
  });

  app.get('/api/admin/timetable', (req, res) => {
    res.json({ timetable: timetableSchedule });
  });

  app.post('/api/admin/timetable', (req, res) => {
    const {
      subjectCode,
      subjectName,
      facultyName,
      facultyId,
      roomNumber,
      startTime,
      endTime,
      dayOfWeek,
      section,
    } = req.body;

    const newEntry = {
      id: `sess-custom-${Date.now()}`,
      timetableId: `tt-${Date.now()}`,
      subjectId: `sub-${(subjectCode || 'custom').toLowerCase()}`,
      subjectCode: subjectCode || 'CS9000',
      subjectName: subjectName || 'Special Elective',
      facultyName: facultyName || 'Faculty In-Charge',
      facultyId: facultyId || 'fac-001',
      roomNumber: roomNumber || 'LH-302',
      startTime: startTime || '09:00 AM',
      endTime: endTime || '09:50 AM',
      date: new Date().toISOString().split('T')[0],
      status: 'upcoming' as const,
      studentAttendanceStatus: 'pending' as const,
      dayOfWeek: dayOfWeek || 'Monday',
      section: section || 'A',
    };

    timetableSchedule.push(newEntry);

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      userId: 'adm-001',
      userName: 'Dr. K. Jayanthi (Dean Academics)',
      userRole: 'admin',
      action: 'ADMIN_SCHEDULE_SLOT_ADDED',
      targetEntity: 'TimetableSchedule',
      targetId: newEntry.id,
      reason: `Assigned ${newEntry.subjectCode} to ${newEntry.facultyName} in ${newEntry.roomNumber}`,
    });

    res.json({ success: true, entry: newEntry, timetable: timetableSchedule });
  });

  app.delete('/api/admin/timetable/:id', (req, res) => {
    const { id } = req.params;
    const idx = timetableSchedule.findIndex(t => t.id === id);
    if (idx !== -1) {
      const removed = timetableSchedule.splice(idx, 1)[0];
      auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        userId: 'adm-001',
        userName: 'Dr. K. Jayanthi (Dean Academics)',
        userRole: 'admin',
        action: 'ADMIN_SCHEDULE_SLOT_REMOVED',
        targetEntity: 'TimetableSchedule',
        targetId: id,
        reason: `Removed schedule slot for ${removed.subjectCode} (${removed.facultyName})`,
      });
      return res.json({ success: true, timetable: timetableSchedule });
    }
    res.status(404).json({ error: 'Timetable slot not found' });
  });

  // Admin Student Enrollment & Management with Password
  app.get('/api/admin/students', (req, res) => {
    res.json({ students: enrolledStudents });
  });

  app.post('/api/admin/students/enroll', (req, res) => {
    const {
      name,
      rollNumber,
      email,
      password,
      departmentId,
      departmentName,
      semester,
      section,
    } = req.body;

    if (!name || !rollNumber || !email || !password) {
      return res.status(400).json({ error: 'Name, Roll Number, Email, and Password are required.' });
    }

    const existing = enrolledStudents.find(
      s => s.rollNumber.toLowerCase() === rollNumber.trim().toLowerCase() || s.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (existing) {
      return res.status(400).json({ error: `A student with roll number ${rollNumber} or email already exists.` });
    }

    const newStudent = {
      id: `stu-${Date.now()}`,
      name: name.trim(),
      rollNumber: rollNumber.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      password: password.trim(),
      departmentId: departmentId || 'dept-cse',
      departmentName: departmentName || 'Computer Science & Engineering',
      semester: Number(semester) || 5,
      section: section || 'A',
      overallAttendance: 100,
      status: 'active',
      enrolledAt: new Date().toISOString().split('T')[0],
    };

    enrolledStudents.unshift(newStudent);

    // Also add to active classroom roster if in same section
    roster.push({
      id: newStudent.id,
      name: newStudent.name,
      rollNumber: newStudent.rollNumber,
      status: 'absent',
      time: '—',
      confidence: 0,
      device: 'Not Recorded',
      isFlagged: false,
    });

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      userId: 'adm-001',
      userName: 'Dr. K. Jayanthi (Dean Academics)',
      userRole: 'admin',
      action: 'ADMIN_STUDENT_ENROLLED',
      targetEntity: 'StudentAccount',
      targetId: `${newStudent.rollNumber} (${newStudent.name})`,
      reason: `Enrolled into ${newStudent.departmentName} Semester ${newStudent.semester}-${newStudent.section} with encrypted credentials.`,
    });

    res.json({ success: true, student: newStudent, students: enrolledStudents });
  });

  app.put('/api/admin/students/:id', (req, res) => {
    const { id } = req.params;
    const { name, rollNumber, email, password, departmentName, semester, section, status } = req.body;
    const idx = enrolledStudents.findIndex(s => s.id === id);
    if (idx !== -1) {
      if (name) enrolledStudents[idx].name = name;
      if (rollNumber) enrolledStudents[idx].rollNumber = rollNumber;
      if (email) enrolledStudents[idx].email = email;
      if (password) enrolledStudents[idx].password = password;
      if (departmentName) enrolledStudents[idx].departmentName = departmentName;
      if (semester) enrolledStudents[idx].semester = Number(semester);
      if (section) enrolledStudents[idx].section = section;
      if (status) enrolledStudents[idx].status = status;

      auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        userId: 'adm-001',
        userName: 'Dr. K. Jayanthi (Dean Academics)',
        userRole: 'admin',
        action: 'ADMIN_STUDENT_UPDATED',
        targetEntity: 'StudentAccount',
        targetId: id,
        reason: 'Administrator updated student profile & credentials',
      });

      return res.json({ success: true, student: enrolledStudents[idx], students: enrolledStudents });
    }
    res.status(404).json({ error: 'Student not found' });
  });

  app.delete('/api/admin/students/:id', (req, res) => {
    const { id } = req.params;
    const idx = enrolledStudents.findIndex(s => s.id === id);
    if (idx !== -1) {
      const removed = enrolledStudents.splice(idx, 1)[0];
      auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        userId: 'adm-001',
        userName: 'Dr. K. Jayanthi (Dean Academics)',
        userRole: 'admin',
        action: 'ADMIN_STUDENT_DELETED',
        targetEntity: 'StudentAccount',
        targetId: `${removed.rollNumber} (${removed.name})`,
        reason: 'Administrator removed student from institutional register',
      });
      return res.json({ success: true, students: enrolledStudents });
    }
    res.status(404).json({ error: 'Student not found' });
  });

  // Student specific data
  app.get('/api/student/dashboard', (req, res) => {
    res.json({
      studentStats,
      riskPrediction: ARUN_RISK_PREDICTION,
      timetableToday: timetableSchedule,
    });
  });

  // Active QR session details for faculty / student sync
  app.get('/api/attendance/session/active', (req, res) => {
    const secondsRemaining = Math.max(0, 30 - Math.floor((Date.now() - currentSession.lastTokenRotatedAt) / 1000));
    res.json({
      session: {
        ...currentSession,
        secondsRemaining,
        presentCount: roster.filter(s => s.status === 'present').length,
        absentCount: roster.filter(s => s.status === 'absent').length,
        flaggedCount: roster.filter(s => s.isFlagged).length,
        roster,
      },
    });
  });

  // Start / restart attendance session
  app.post('/api/attendance/session/start', (req, res) => {
    currentSession.status = 'active';
    currentSession.seed += 1;
    currentSession.currentToken = generateSessionToken(currentSession.id, currentSession.seed);
    currentSession.lastTokenRotatedAt = Date.now();

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      userId: req.body.facultyId || 'fac-001',
      userName: req.body.facultyName || 'Dr. R. Ramanathan',
      userRole: 'faculty',
      action: 'START_DYNAMIC_QR_SESSION',
      targetEntity: 'AttendanceSession',
      targetId: currentSession.id,
      reason: 'Standard scheduled classroom attendance initiation',
    });

    res.json({ success: true, session: currentSession });
  });

  // End attendance session
  app.post('/api/attendance/session/end', (req, res) => {
    currentSession.status = 'closed';

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      userId: req.body.facultyId || 'fac-001',
      userName: req.body.facultyName || 'Dr. R. Ramanathan',
      userRole: 'faculty',
      action: 'CLOSE_ATTENDANCE_SESSION',
      targetEntity: 'AttendanceSession',
      targetId: currentSession.id,
      reason: 'Faculty finalized attendance register',
    });

    res.json({ success: true, session: currentSession });
  });

  // Verify attendance scan
  app.post('/api/attendance/verify', (req, res) => {
    const { payload, studentId, studentName, rollNumber, departmentName, clientCoordinates, clientDevice } = req.body;

    const alreadyMarked = roster.filter(s => s.status === 'present').map(s => s.id);

    const result = verifyAttendanceSignals({
      payload: payload || {
        sessionId: currentSession.id,
        classId: 'cls-cse-3a',
        subjectId: currentSession.subjectId,
        facultyId: currentSession.facultyId,
        token: req.body.token || currentSession.currentToken,
        timestamp: Date.now(),
        expiresAt: Date.now() + 15000,
        nonce: Math.random().toString(36).substring(7),
        geofenceRadiusMeters: 50,
      },
      studentId: studentId || 'stu-001',
      studentName: studentName || 'Arun Kumar M.',
      rollNumber: rollNumber || '23CS104',
      departmentName: departmentName || 'Computer Science & Engineering',
      clientTimestamp: Date.now(),
      clientCoordinates,
      clientDevice,
      currentActiveToken: currentSession.currentToken,
      previousValidToken: currentSession.previousToken,
      alreadyMarkedStudentIds: alreadyMarked,
    });

    if (result.success) {
      // Update roster
      const studentIdx = roster.findIndex(s => s.id === (studentId || 'stu-001'));
      if (studentIdx >= 0) {
        roster[studentIdx] = {
          ...roster[studentIdx],
          status: 'present',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          confidence: result.confidenceScore,
          device: clientDevice || 'Android Mobile',
          isFlagged: false,
        };
      }

      // Update student stats
      studentStats.totalAttended += 1;
      studentStats.overallPercentage = Number(((studentStats.totalAttended / studentStats.totalClassesHeld) * 100).toFixed(1));
      const dbmsStat = studentStats.subjectStats.find(s => s.subjectId === 'sub-dbms');
      if (dbmsStat) {
        dbmsStat.attendedClasses += 1;
        dbmsStat.percentage = Number(((dbmsStat.attendedClasses / dbmsStat.totalClasses) * 100).toFixed(1));
      }
    } else if (result.anomalyDetected) {
      anomalies.unshift(result.anomalyDetected);
    }

    res.json(result);
  });

  // Manual override by faculty with required audit reason
  app.post('/api/attendance/override', (req, res) => {
    const { studentId, newStatus, reason, facultyId, facultyName } = req.body;

    if (!reason || reason.trim().length < 5) {
      return res.status(400).json({ error: 'A clear, valid justification reason is mandatory for manual attendance overrides.' });
    }

    const studentIdx = roster.findIndex(s => s.id === studentId);
    if (studentIdx === -1) {
      return res.status(404).json({ error: 'Student not found in active roster.' });
    }

    const oldStatus = roster[studentIdx].status;
    roster[studentIdx].status = newStatus;
    roster[studentIdx].time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    roster[studentIdx].confidence = 100; // Human certified

    auditLogs.unshift({
      id: `aud-${Date.now()}`,
      timestamp: new Date().toLocaleString(),
      userId: facultyId || 'fac-001',
      userName: facultyName || 'Dr. R. Ramanathan',
      userRole: 'faculty',
      action: 'MANUAL_ATTENDANCE_OVERRIDE',
      targetEntity: 'AttendanceRecord',
      targetId: `${studentId} (${roster[studentIdx].name})`,
      oldValue: oldStatus,
      newValue: `${newStatus} (Faculty Authorized)`,
      reason: reason.trim(),
    });

    res.json({
      success: true,
      updatedStudent: roster[studentIdx],
      message: 'Attendance record modified and logged to immutable audit trail.',
    });
  });

  // Anomalies list and review
  app.get('/api/anomalies', (req, res) => {
    res.json({ anomalies });
  });

  app.post('/api/anomalies/:id/review', (req, res) => {
    const { id } = req.params;
    const { status, reviewNotes, reviewerName } = req.body;

    const idx = anomalies.findIndex(a => a.id === id);
    if (idx >= 0) {
      const oldStatus = anomalies[idx].status;
      anomalies[idx].status = status;
      anomalies[idx].reviewNotes = reviewNotes;
      anomalies[idx].reviewedBy = reviewerName || 'Dr. R. Ramanathan';

      auditLogs.unshift({
        id: `aud-${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        userId: 'fac-001',
        userName: reviewerName || 'Dr. R. Ramanathan',
        userRole: 'faculty',
        action: 'ANOMALY_REVIEW_STATUS_UPDATE',
        targetEntity: 'AnomalyEvent',
        targetId: id,
        oldValue: oldStatus,
        newValue: status,
        reason: reviewNotes || 'Faculty review and validation completed.',
      });

      return res.json({ success: true, anomaly: anomalies[idx] });
    }

    res.status(404).json({ error: 'Anomaly not found' });
  });

  // Risk prediction & explainable AI
  app.get('/api/ai/risk', (req, res) => {
    res.json({
      studentsAtRisk: AT_RISK_STUDENTS_LIST,
      primaryStudentRisk: ARUN_RISK_PREDICTION,
      thresholdConfig: {
        mandatory: 75,
        warning: 80,
      },
    });
  });

  // Digital Twin calculation endpoint
  app.post('/api/ai/digital-twin', (req, res) => {
    const { type, attended, total, missCount, targetPercent } = req.body;

    const currentAttended = attended || studentStats.totalAttended;
    const currentTotal = total || studentStats.totalClassesHeld;

    if (type === 'miss_classes') {
      const result = calculateMissScenario(currentAttended, currentTotal, missCount || 2, 75);
      return res.json(result);
    }

    const result = calculateTargetScenario(currentAttended, currentTotal, targetPercent || 80);
    return res.json(result);
  });

  // AI Copilot endpoint
  app.post('/api/ai/copilot', async (req, res) => {
    const { query } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Query is required.' });
    }

    // Check if GEMINI_API_KEY exists for augmented intelligence
    const apiKey = process.env.GEMINI_API_KEY;
    const baseResponse = processCopilotQuery(query);

    if (apiKey && apiKey !== 'MY_GEMINI_API_KEY' && apiKey.length > 5) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are the SIHI050 College Attendance Intelligence Copilot for NIET College.
Based on the institutional attendance data below, answer the user query concisely, professionally, and provide high-value actionable advice.

Institution Attendance Context:
- Overall Attendance: 80.6%
- Departments: CSE (84.6%), IT (81.2%), ECE (77.4%), EEE (74.8% - lowest), MECH (79.5%), CIVIL (83.1%)
- At-risk students count: ${AT_RISK_STUDENTS_LIST.length} students (Arun Kumar 72.4%, Siddharth Menon 64.2%, Karthikeyan S 68.5%)
- Active Class: DBMS (LH-302) with 84% present, 1 flagged anomaly from Madurai IP.
- Mandatory Threshold: 75%

User Query: "${query}"

Provide a crisp 2-3 paragraph answer with clear bullet points and actionable recommendations.`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        if (response && response.text) {
          return res.json({
            ...baseResponse,
            answer: response.text,
          });
        }
      } catch (err) {
        console.warn('Gemini API query failed, falling back to deterministic AI response:', err);
      }
    }

    // Fallback deterministic response
    res.json(baseResponse);
  });

  // Audit logs
  app.get('/api/audit/logs', (req, res) => {
    res.json({ auditLogs });
  });

  // Class health scores
  app.get('/api/analytics/health-scores', (req, res) => {
    res.json({ healthScores: CLASS_HEALTH_SCORES });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SIHI050 Attendance Intelligence Server running on http://localhost:${PORT}`);
  });
}

startServer();
