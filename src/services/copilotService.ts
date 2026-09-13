import { DEPARTMENTS, AT_RISK_STUDENTS_LIST, CLASS_HEALTH_SCORES, CLASS_ROSTER_CSE3A } from '../data/mockDatabase';

export interface CopilotResponse {
  query: string;
  answer: string;
  intent: string;
  suggestedFollowups?: string[];
  dataPoints?: Array<{ label: string; value: string | number; badge?: string; detail?: string }>;
  tableData?: {
    headers: string[];
    rows: Array<Array<string | number>>;
  };
  chartData?: Array<{ name: string; value: number; benchmark?: number }>;
  recommendedAction?: string;
}

export function processCopilotQuery(query: string): CopilotResponse {
  const q = query.toLowerCase().trim();

  // Intent 1: Below 75% or at-risk query
  if (q.includes('below 75') || q.includes('under 75') || q.includes('at risk') || q.includes('at-risk') || q.includes('low attendance') || q.includes('arun')) {
    const atRisk = AT_RISK_STUDENTS_LIST;
    return {
      query,
      intent: 'AT_RISK_STUDENTS_QUERY',
      suggestedFollowups: [
        'How many DBMS classes needed for 80%?',
        'Compare department attendance averages',
        'Explain the Madurai proxy anomaly',
      ],
      answer: `Found ${atRisk.length} students currently below or in immediate danger of falling below the 75% mandatory threshold. The highest critical case is Siddharth Menon (64.2%) followed by Karthikeyan S. (68.5%) and Arun Kumar (72.4%).`,
      dataPoints: atRisk.map(s => ({
        label: `${s.studentName} (${s.rollNumber})`,
        value: `${s.overallAttendance}%`,
        badge: s.riskLevel,
        detail: s.reasons[0],
      })),
      tableData: {
        headers: ['Roll No', 'Student Name', 'Department', 'Current %', 'Predicted Next %', 'Risk Level'],
        rows: atRisk.map(s => [
          s.rollNumber,
          s.studentName,
          s.departmentName,
          `${s.overallAttendance}%`,
          `${s.predictedAttendanceNextMonth}%`,
          s.riskLevel,
        ]),
      },
      chartData: atRisk.map(s => ({
        name: s.studentName.split(' ')[0],
        value: s.overallAttendance,
        benchmark: 75,
      })),
      recommendedAction: 'Dispatch Phase-1 Early Warning alerts and mandate faculty mentoring for students below 70%.',
    };
  }

  // Intent 2: Lowest department or department comparison
  if (q.includes('department') || q.includes('lowest') || q.includes('departments') || q.includes('compare') || q.includes('college')) {
    const sorted = [...DEPARTMENTS].sort((a, b) => a.averageAttendance - b.averageAttendance);
    const lowest = sorted[0];
    const highest = sorted[sorted.length - 1];

    return {
      query,
      intent: 'DEPARTMENT_ANALYSIS',
      suggestedFollowups: [
        'Which students are below 75%?',
        'What is class health score for CSE 3A?',
        'Show active live session stats',
      ],
      answer: `The **${lowest.name} (${lowest.code})** department currently has the lowest overall attendance at **${lowest.averageAttendance}%** with ${lowest.atRiskCount} at-risk students. In contrast, **${highest.name} (${highest.code})** is leading with **${highest.averageAttendance}%** attendance.`,
      dataPoints: sorted.map(d => ({
        label: d.name,
        value: `${d.averageAttendance}%`,
        badge: d.healthScore >= 80 ? 'Healthy' : d.healthScore >= 70 ? 'Moderate' : 'Needs Attention',
        detail: `${d.atRiskCount} students at risk`,
      })),
      chartData: sorted.map(d => ({
        name: d.code,
        value: d.averageAttendance,
        benchmark: 75,
      })),
      tableData: {
        headers: ['Department', 'Students', 'Faculty', 'Avg Attendance', 'At-Risk Count', 'Health Score'],
        rows: sorted.map(d => [
          `${d.name} (${d.code})`,
          d.totalStudents,
          d.totalFaculty,
          `${d.averageAttendance}%`,
          d.atRiskCount,
          `${d.healthScore}/100`,
        ]),
      },
      recommendedAction: 'Schedule an academic review with EEE and ECE department heads regarding practical lab attendance retention.',
    };
  }

  // Intent 3: Attendance drop or trend decline
  if (q.includes('drop') || q.includes('declined') || q.includes('decrease') || q.includes('10%') || q.includes('biggest drop')) {
    const droppedStudents = AT_RISK_STUDENTS_LIST.filter(s => s.trendPercentageChange <= -5);
    return {
      query,
      intent: 'ATTENDANCE_DROP_ANALYSIS',
      suggestedFollowups: [
        'Why is Arun Kumar at risk?',
        'How many DBMS classes needed for 80%?',
        'Show today summary',
      ],
      answer: `The largest attendance drops this month were observed in **Siddharth Menon (-14.0%)**, **Arun Kumar (-11.2%)**, and **Karthikeyan S. (-9.5%)**. On a subject level, **Database Management Systems** registered the steepest Monday/Friday afternoon slump.`,
      dataPoints: droppedStudents.map(s => ({
        label: s.studentName,
        value: `${s.trendPercentageChange}%`,
        badge: 'Steep Decline',
        detail: `${s.recentAbsencesCount} recent absences`,
      })),
      chartData: droppedStudents.map(s => ({
        name: s.studentName.split(' ')[0],
        value: Math.abs(s.trendPercentageChange),
        benchmark: 10,
      })),
      recommendedAction: 'Trigger What-If remediation plans and alert subject teachers before next weekly timetable cycle.',
    };
  }

  // Intent 4: Today's summary or Live attendance
  if (q.includes('today') || q.includes('summary') || q.includes('live') || q.includes('now') || q.includes('current')) {
    const presentCount = CLASS_ROSTER_CSE3A.filter(s => s.status === 'present').length;
    const totalCount = CLASS_ROSTER_CSE3A.length;
    const pct = ((presentCount / totalCount) * 100).toFixed(1);
    
    return {
      query,
      intent: 'TODAY_SUMMARY',
      suggestedFollowups: [
        'Explain the Madurai proxy anomaly',
        'Which students are below 75%?',
        'What is class health score for CSE 3A?',
      ],
      answer: `Today's active session for **DBMS (LH-302)** has **${presentCount} of ${totalCount} (${pct}%)** students verified present. Average dynamic QR verification confidence is **94.8%**. 1 suspicious scan from Madurai IP has been flagged for review.`,
      dataPoints: [
        { label: 'Present Students', value: `${presentCount} / ${totalCount}`, badge: '84% Present' },
        { label: 'Absent Students', value: `${totalCount - presentCount}`, badge: 'Unmarked' },
        { label: 'Verification Confidence', value: '94.8%', badge: 'High Trust' },
        { label: 'Flagged Anomalies', value: '1 pending', badge: 'Alert' },
      ],
      chartData: [
        { name: 'Present', value: presentCount },
        { name: 'Absent', value: totalCount - presentCount },
      ],
      recommendedAction: 'Faculty can proceed with lecture; 1 anomaly logged in Anomaly Center for manual sign-off.',
    };
  }

  // Intent 5: Class health or scoring
  if (q.includes('health') || q.includes('score') || q.includes('performance')) {
    return {
      query,
      intent: 'CLASS_HEALTH_QUERY',
      suggestedFollowups: [
        'Compare department attendance averages',
        'Which students are below 75%?',
        'Show today summary',
      ],
      answer: `Institution-wide average Class Health Score is **78/100**. CSE 3rd Year Section A leads at **86/100 (Healthy)**, while ECE 3rd Year Section B requires attention at **67/100** due to low lab attendance on Thursdays.`,
      dataPoints: CLASS_HEALTH_SCORES.map(c => ({
        label: c.className,
        value: `${c.score}/100`,
        badge: c.status,
        detail: c.insights[0],
      })),
      recommendedAction: 'Encourage departmental student councils to utilize the Digital Twin simulator for self-monitoring.',
    };
  }

  // Default intelligent fallback
  return {
    query,
    intent: 'GENERAL_ATTENDANCE_INTELLIGENCE',
    suggestedFollowups: [
      'Why is Arun Kumar at risk?',
      'How many DBMS classes needed for 80%?',
      'Explain the Madurai proxy anomaly',
      'What is our college average attendance?',
    ],
    answer: `Analysis for "${query}": The campus-wide attendance is currently **80.1%** across 6 departments. We are actively tracking **${AT_RISK_STUDENTS_LIST.length} at-risk students**, and multi-layer verification has achieved a **97.4% proxy-prevention confidence rate** this semester.`,
    dataPoints: [
      { label: 'Total Enrolled', value: '1,130 Students' },
      { label: 'Institutional Average', value: '80.1%' },
      { label: 'At-Risk Count', value: '125 Students' },
      { label: 'Active Dynamic Sessions', value: '18 Live' },
    ],
    chartData: DEPARTMENTS.map(d => ({
      name: d.code,
      value: d.averageAttendance,
      benchmark: 75,
    })),
    recommendedAction: 'Use the preset query chips below or explore the Anomaly Center and What-If Simulator for deep-dive analytics.',
  };
}
