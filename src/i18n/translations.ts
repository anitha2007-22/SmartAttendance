export type Language = 'en' | 'ta';

export const translations = {
  en: {
    appName: 'Smart Attendance Platform',
    appSubtitle: 'Automated Attendance Intelligence & Analytics',
    tagline: 'Verify • Record • Monitor • Detect • Analyze • Predict • Explain • Alert • Recommend',
    
    // Roles
    student: 'Student',
    faculty: 'Faculty',
    admin: 'Institution Admin',
    
    // Common Actions
    login: 'Log In',
    logout: 'Log Out',
    getStarted: 'Get Started',
    explorePlatform: 'Explore Platform',
    markAttendance: 'Mark Attendance',
    startSession: 'Start Live Attendance',
    endSession: 'End Attendance Session',
    scanQR: 'Scan Classroom QR',
    switchRole: 'Switch Role / User',
    exportReport: 'Export Report',
    downloadCSV: 'Download CSV',
    printPDF: 'Print PDF Report',
    refresh: 'Refresh',
    submit: 'Submit',
    cancel: 'Cancel',
    save: 'Save Changes',
    search: 'Search...',
    filter: 'Filter',
    review: 'Review Anomaly',
    override: 'Manual Override',
    
    // Navigation
    dashboard: 'Dashboard',
    timetable: 'Timetable',
    analytics: 'Analytics',
    riskPrediction: 'Risk Prediction',
    whatIfSimulator: 'What-If Planner',
    anomalyCenter: 'Anomaly Detection',
    healthScores: 'Class Health',
    auditLogs: 'Audit Trail',
    copilot: 'AI Copilot',
    reports: 'Reports',
    settings: 'System Config',
    sihScenarios: 'Demo Scenarios',
    
    // Statuses & Badges
    overallAttendance: 'Overall Attendance',
    healthy: 'Healthy',
    warning: 'Warning',
    critical: 'Critical',
    present: 'Present',
    absent: 'Absent',
    pending: 'Pending',
    flagged: 'Flagged / Suspicious',
    confidenceScore: 'Confidence Score',
    highRisk: 'High Risk',
    mediumRisk: 'Medium Risk',
    lowRisk: 'Low Risk',
    
    // QR & Verification
    qrExpiresIn: 'QR Token Refreshes in',
    qrSessionActive: 'Live Dynamic QR Session Active',
    qrSessionExpired: 'Attendance Session Expired',
    positionCamera: 'Position camera over the classroom dynamic QR screen',
    verifyingSignals: 'Verifying multi-layer authentication signals...',
    attendanceVerified: 'Attendance Successfully Verified & Recorded!',
    verificationFailed: 'Attendance Verification Rejected',
    
    // Digital Twin / What-If
    simulatorTitle: 'Attendance Digital Twin (What-If Simulator)',
    missQuery: 'If I miss the next',
    classesText: 'classes',
    targetQuery: 'To reach attendance target of',
    calculate: 'Calculate Impact',
    projectedOutcome: 'Projected Attendance Rate',
    classesRequired: 'Consecutive Classes Required',
    
    // AI Copilot
    copilotTitle: 'AI Attendance Copilot',
    copilotPlaceholder: 'Ask attendance intelligence questions (e.g. Which students below 75%?)...',
    speakPrompt: 'Click microphone to ask by voice',
    listening: 'Listening to your voice query...',
    
    // Offline
    offlineMode: 'Offline Mode Active',
    offlineDesc: 'Attendance captured locally. Will sync automatically when connection is restored.',
    syncNow: 'Sync 2 Queued Scans',
    allSynced: 'All Attendance Records Synced with Cloud Database',
  },
  
  ta: {
    appName: 'ஸ்மார்ட் வருகைப் பதிவு தளம்',
    appSubtitle: 'தானியங்கி கல்லூரி வருகை கண்காணிப்பு & பகுப்பாய்வு',
    tagline: 'சரிபார் • பதிவு செய் • கண்காணி • கண்டறி • பகுப்பாய்வு • கணிப்பு • விளக்கு • எச்சரி • பரிந்துரை',
    
    // Roles
    student: 'மாணவர்',
    faculty: 'பேராசிரியர்',
    admin: 'கல்லூரி நிர்வாகி',
    
    // Common Actions
    login: 'உள்நுழைக',
    logout: 'வெளியேறு',
    getStarted: 'தொடங்குக',
    explorePlatform: 'தளத்தை காண்க',
    markAttendance: 'வருகையைப் பதிவு செய்',
    startSession: 'நேரலை வருகைப் பதிவை தொடங்கு',
    endSession: 'வருகைப் பதிவை முடிக்க',
    scanQR: 'வகுப்பறை QR குறியீட்டை ஸ்கேன் செய்',
    switchRole: 'பயனரை மாற்று',
    exportReport: 'அறிக்கையைப் பதிவிறக்கு',
    downloadCSV: 'CSV பதிவிறக்கம்',
    printPDF: 'PDF அச்சிடு',
    refresh: 'புதுப்பி',
    submit: 'சமர்ப்பி',
    cancel: 'ரத்துசெய்',
    save: 'சேமி',
    search: 'தேடுக...',
    filter: 'வடிகட்டு',
    review: 'முரண்பாட்டை மறுஆய்வு செய்',
    override: 'கைமுறை மாற்றம்',
    
    // Navigation
    dashboard: 'முகப்பு பலகை',
    timetable: 'பாட அட்டவணை',
    analytics: 'பகுப்பாய்வு',
    riskPrediction: 'அபாயக் கணிப்பு',
    whatIfSimulator: 'எதிர்கால திட்டமிடுநர் (What-If)',
    anomalyCenter: 'போலி வருகை கண்டறிதல்',
    healthScores: 'வகுப்பு ஆரோக்கிய குறியீடு',
    auditLogs: 'தணிக்கை பதிவு',
    copilot: 'AI துணை வழிகாட்டி',
    reports: 'அறிக்கைகள்',
    settings: 'அமைப்புகள்',
    sihScenarios: 'SIH 2026 செயல்முறை காட்சிகள்',
    
    // Statuses & Badges
    overallAttendance: 'மொத்த வருகை சதவீதம்',
    healthy: 'நலமாக உள்ளது',
    warning: 'எச்சரிக்கை தேவை',
    critical: 'ஆபத்தான நிலை',
    present: 'வந்தவர்',
    absent: 'வராதவர்',
    pending: 'காத்திருப்பு',
    flagged: 'சந்தேகத்திற்குரியது',
    confidenceScore: 'நம்பகத்தன்மை குறியீடு',
    highRisk: 'அதிக அபாயம்',
    mediumRisk: 'நடுத்தர அபாயம்',
    lowRisk: 'குறைந்த அபாயம்',
    
    // QR & Verification
    qrExpiresIn: 'QR டோக்கன் மாறும் நேரம்:',
    qrSessionActive: 'நேரலை டைனமிக் QR இயங்குகிறது',
    qrSessionExpired: 'வருகை அமர்வு முடிந்தது',
    positionCamera: 'கேமராவை வகுப்பறை QR குறியீட்டின் மேல் வைக்கவும்',
    verifyingSignals: 'பல அடுக்கு பாதுகாப்பு சமிக்ஞைகள் சரிபார்க்கப்படுகின்றன...',
    attendanceVerified: 'வருகை வெற்றிகரமாக சரிபார்க்கப்பட்டு பதிவானது!',
    verificationFailed: 'வருகை சரிபார்ப்பு நிராகரிக்கப்பட்டது',
    
    // Digital Twin / What-If
    simulatorTitle: 'வருகை டிஜிட்டல் இரட்டை (What-If மாதிரி)',
    missQuery: 'அடுத்த வகுப்புகளை தவறவிட்டால்:',
    classesText: 'வகுப்புகள்',
    targetQuery: 'இலக்கு வருகை சதவீதத்தை அடைய:',
    calculate: 'கணக்கிடு',
    projectedOutcome: 'எதிர்பார்க்கப்படும் வருகை சதவீதம்',
    classesRequired: 'தொடர்ந்து வர வேண்டிய வகுப்புகள்',
    
    // AI Copilot
    copilotTitle: 'AI வருகை துணை வழிகாட்டி',
    copilotPlaceholder: 'வருகை பற்றிய கேள்விகளைக் கேளுங்கள் (எ.கா: 75% கீழ் உள்ள மாணவர்கள் யார்?)...',
    speakPrompt: 'குரல் மூலம் கேட்க மைக்ரோஃபோனை அழுத்தவும்',
    listening: 'உங்கள் குரலைக் கவனிக்கிறது...',
    
    // Offline
    offlineMode: 'இணையற்ற பயன்முறை',
    offlineDesc: 'வருகை உள்ளூரில் சேமிக்கப்பட்டது. இணையம் வந்ததும் தானாக புதுப்பிக்கப்படும்.',
    syncNow: '2 பதிவுகளை புதுப்பிக்கவும்',
    allSynced: 'அனைத்து பதிவுகளும் மேகக்கணி தரவுத்தளத்தில் இணைக்கப்பட்டன',
  },
};
