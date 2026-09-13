export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  departmentId: string;
  departmentName: string;
  // Student-specific
  rollNumber?: string;
  semester?: number;
  section?: string;
  year?: string;
  overallAttendance?: number;
  hasBiometricEnrolled?: boolean;
  // Faculty-specific
  designation?: string;
  employeeId?: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  totalStudents: number;
  totalFaculty: number;
  averageAttendance: number;
  atRiskCount: number;
  healthScore: number;
}

export interface Subject {
  id: string;
  code: string;
  name: string;
  departmentId: string;
  facultyId: string;
  facultyName: string;
  credits: number;
  totalClassesHeld: number;
  targetAttendancePercent: number;
}

export interface TimetableEntry {
  id: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: number;
  startTime: string;
  endTime: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  roomNumber: string;
  departmentId: string;
  semester: number;
  section: string;
}

export interface ClassSessionToday {
  id: string;
  timetableId: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  facultyId: string;
  roomNumber: string;
  startTime: string;
  endTime: string;
  date: string;
  status: 'upcoming' | 'live' | 'completed';
  studentAttendanceStatus?: 'present' | 'absent' | 'pending' | 'flagged';
  attendanceSessionId?: string;
  verifiedAt?: string;
  confidenceScore?: number;
}

export interface DynamicQRPayload {
  sessionId: string;
  classId: string;
  subjectId: string;
  facultyId: string;
  token: string;
  timestamp: number;
  expiresAt: number;
  nonce: string;
  latitude?: number;
  longitude?: number;
  geofenceRadiusMeters?: number;
}

export interface VerificationSignal {
  name: string;
  status: 'pass' | 'warning' | 'fail';
  detail: string;
  weight: number;
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  subjectId: string;
  subjectName: string;
  facultyId: string;
  date: string;
  timestamp: string;
  status: 'present' | 'absent' | 'flagged' | 'manual_override';
  confidenceScore: number;
  verificationSignals: VerificationSignal[];
  deviceId?: string;
  ipAddress?: string;
  location?: { lat: number; lng: number; distanceMeters?: number };
  isOfflineSync?: boolean;
  manualOverrideReason?: string;
  modifiedBy?: string;
}

export interface AttendanceSession {
  id: string;
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  facultyId: string;
  facultyName: string;
  roomNumber: string;
  date: string;
  startTime: string;
  endTime?: string;
  status: 'active' | 'expired' | 'closed';
  currentToken: string;
  tokenExpiresInSeconds: number;
  totalEnrolled: number;
  presentCount: number;
  absentCount: number;
  flaggedCount: number;
  latitude: number;
  longitude: number;
  geofenceRadiusMeters: number;
}

export type AnomalySeverity = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AnomalyEvent {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  departmentName: string;
  subjectId: string;
  subjectName: string;
  date: string;
  time: string;
  severity: AnomalySeverity;
  type: 'rapid_device_switch' | 'impossible_travel' | 'duplicate_attempt' | 'expired_token' | 'out_of_geofence' | 'unusual_velocity';
  reason: string;
  confidenceScore: number;
  status: 'pending_review' | 'reviewed' | 'cleared' | 'confirmed_proxy';
  reviewedBy?: string;
  reviewNotes?: string;
}

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export interface RiskPrediction {
  studentId: string;
  studentName: string;
  rollNumber: string;
  departmentName: string;
  overallAttendance: number;
  riskLevel: RiskLevel;
  predictedAttendanceNextMonth: number;
  trendPercentageChange: number; // e.g. -11.5%
  recentAbsencesCount: number;
  consecutiveAbsences: number;
  lowSubjectCount: number;
  reasons: string[];
  recommendedAction: string;
  featureWeights: {
    trendDecline: number;
    consecutiveMisses: number;
    subjectWeakness: number;
    historicalPattern: number;
  };
}

export interface StudentSubjectStat {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  facultyName: string;
  attendedClasses: number;
  totalClasses: number;
  percentage: number;
  status: 'healthy' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
}

export interface DigitalTwinResult {
  currentPercentage: number;
  totalClassesHeld: number;
  totalAttended: number;
  scenario: {
    type: 'miss_classes' | 'target_attendance' | 'custom_forecast';
    missCount?: number;
    targetPercent?: number;
    futureAttendCount?: number;
    futureMissCount?: number;
  };
  projectedPercentage: number;
  projectedStatus: 'healthy' | 'warning' | 'critical';
  thresholdWarning: boolean;
  differencePercent: number;
  classesRequiredForTarget?: number;
  maxClassesCanMiss?: number;
  aiExplanation: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  targetEntity: string;
  targetId: string;
  oldValue?: string;
  newValue?: string;
  reason: string;
  ipAddress?: string;
}

export interface ClassHealthScore {
  classId: string;
  className: string;
  department: string;
  score: number; // 0 - 100
  status: 'Healthy' | 'Moderate' | 'Needs Attention';
  breakdown: {
    attendanceRateScore: number;
    trendStabilityScore: number;
    lowRiskRatioScore: number;
    anomalyRateScore: number;
  };
  insights: string[];
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'alert' | 'warning' | 'info' | 'success';
  read: boolean;
  actionUrl?: string;
}

export interface AtRiskEmailAlert {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  email: string;
  attendancePercentage: number;
  riskLevel: RiskLevel;
  triggerReason: string;
  recommendedAction: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'opened';
  subject: string;
  bodyPreview: string;
}

export interface HeatmapCell {
  day: 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat';
  period: number;
  timeSlot: string;
  attendancePercent: number;
  subject: string;
}

export interface SIHScenario {
  id: string;
  title: string;
  category: string;
  description: string;
  expectedOutcome: string;
  iconName: string;
}
