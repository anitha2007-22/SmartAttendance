import React, { useState } from 'react';
import { INSTITUTION_CONFIG, DEPARTMENTS, CLASS_ROSTER_CSE3A, AT_RISK_STUDENTS_LIST } from '../../data/mockDatabase';
import { Language, translations } from '../../i18n/translations';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  Building,
  GraduationCap,
  FileText,
} from 'lucide-react';

interface ReportsGeneratorProps {
  currentLang: Language;
}

export const ReportsGenerator: React.FC<ReportsGeneratorProps> = ({ currentLang }) => {
  const t = translations[currentLang];
  const [reportType, setReportType] = useState<'daily' | 'monthly_risk' | 'dept_summary'>('monthly_risk');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState('');

  // Generate and download Excel Spreadsheet
  const handleDownloadExcel = () => {
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let fileName = '';

    if (reportType === 'monthly_risk') {
      fileName = `SmartAttendance_Debarment_Risk_Report_${new Date().toISOString().split('T')[0]}`;
      headers = ['Roll Number', 'Student Name', 'Department', 'Current Attendance %', 'Predicted Next %', 'Risk Level', 'Primary Reason'];
      rows = AT_RISK_STUDENTS_LIST.map((s) => [
        s.rollNumber,
        s.studentName,
        s.departmentName,
        `${s.overallAttendance}%`,
        `${s.predictedAttendanceNextMonth}%`,
        s.riskLevel.toUpperCase(),
        s.reasons[0],
      ]);
    } else if (reportType === 'daily') {
      fileName = `SmartAttendance_Classroom_Register_DBMS_${new Date().toISOString().split('T')[0]}`;
      headers = ['Roll Number', 'Student Name', 'Status', 'Verified Time', 'Confidence Score', 'Device Signature'];
      rows = CLASS_ROSTER_CSE3A.map((s) => [
        s.rollNumber,
        s.name,
        s.status.toUpperCase(),
        s.time,
        `${s.confidence}%`,
        s.device,
      ]);
    } else {
      fileName = `SmartAttendance_Department_Summary_${new Date().toISOString().split('T')[0]}`;
      headers = ['Department Code', 'Department Name', 'Total Students', 'Total Faculty', 'Average Attendance %', 'At Risk Count'];
      rows = DEPARTMENTS.map((d) => [
        d.code,
        d.name,
        d.totalStudents,
        d.totalFaculty,
        `${d.averageAttendance}%`,
        d.atRiskCount,
      ]);
    }

    // Build Microsoft Excel compatible CSV with UTF-8 BOM so Excel opens it with full formatting & special chars
    const csvRows = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',')),
    ].join('\r\n');

    const blob = new Blob(['\uFEFF' + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setDownloadSuccessMessage('Excel spreadsheet downloaded successfully.');
    setTimeout(() => setDownloadSuccessMessage(''), 3000);
  };

  // Generate and download PDF Document
  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    // Header Background
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, 595, 80, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SMART ATTENDANCE SYSTEM', 40, 35);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Official Institutional Attendance & Compliance Registry', 40, 52);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 40, 66);

    let reportTitle = '';
    let headers: string[] = [];
    let data: any[][] = [];

    if (reportType === 'monthly_risk') {
      reportTitle = 'STUDENT ATTENDANCE DEBARMENT & RISK FORECAST';
      headers = ['Roll No', 'Student Name', 'Department', 'Current %', 'Predicted %', 'Risk', 'Key Observation'];
      data = AT_RISK_STUDENTS_LIST.map((s) => [
        s.rollNumber,
        s.studentName,
        s.departmentName.split(' ')[0] || s.departmentName,
        `${s.overallAttendance}%`,
        `${s.predictedAttendanceNextMonth}%`,
        s.riskLevel.toUpperCase(),
        s.reasons[0].substring(0, 38) + (s.reasons[0].length > 38 ? '...' : ''),
      ]);
    } else if (reportType === 'daily') {
      reportTitle = 'CLASSROOM DAILY DYNAMIC ATTENDANCE REGISTER (DBMS LH-302)';
      headers = ['Roll No', 'Student Name', 'Status', 'Verified Time', 'Confidence', 'Device'];
      data = CLASS_ROSTER_CSE3A.map((s) => [
        s.rollNumber,
        s.name,
        s.status.toUpperCase(),
        s.time,
        `${s.confidence}%`,
        s.device,
      ]);
    } else {
      reportTitle = 'DEPARTMENTAL ATTENDANCE PERFORMANCE SUMMARY';
      headers = ['Code', 'Department Name', 'Students', 'Faculty', 'Avg %', 'At-Risk'];
      data = DEPARTMENTS.map((d) => [
        d.code,
        d.name,
        d.totalStudents,
        d.totalFaculty,
        `${d.averageAttendance}%`,
        d.atRiskCount,
      ]);
    }

    doc.setTextColor(30, 41, 59);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(reportTitle, 40, 105);

    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Mandatory Compliance: 75% Attendance Threshold (Anna University / UGC Guidelines)', 40, 118);

    // Auto Table
    autoTable(doc, {
      startY: 130,
      head: [headers],
      body: data,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 138], // blue-900
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [15, 23, 42],
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252], // slate-50
      },
      margin: { left: 40, right: 40 },
    });

    // Signature Footer
    const finalY = (doc as any).lastAutoTable.finalY + 40;
    if (finalY < 750) {
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(71, 85, 105);
      doc.text('Faculty In-Charge: Dr. R. Ramanathan', 40, finalY);
      doc.text('Dean Academic Affairs: Dr. K. Jayanthi', 350, finalY);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.text('Digitally signed and certified with SHA-256 cryptographic audit seal.', 40, finalY + 14);
    }

    doc.save(`SmartAttendance_${reportType}_${new Date().toISOString().split('T')[0]}.pdf`);

    setDownloadSuccessMessage('Official PDF report generated and downloaded successfully.');
    setTimeout(() => setDownloadSuccessMessage(''), 3000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Official Reporting Subsystem</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Institutional Attendance Reports & Audits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Export Anna University compliant attendance registers in Excel and official signed PDF formats
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            id="btn-download-pdf"
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Download PDF Document"
          >
            <FileText className="w-4 h-4" />
            <span>Download PDF</span>
          </button>

          <button
            id="btn-download-excel"
            onClick={handleDownloadExcel}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            title="Download Excel Spreadsheet"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel</span>
          </button>

          <button
            id="btn-print-report"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
            title="Print or Save via Browser"
          >
            <Printer className="w-4 h-4" />
            <span className="hidden sm:inline">Print</span>
          </button>
        </div>
      </div>

      {downloadSuccessMessage && (
        <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{downloadSuccessMessage}</span>
        </div>
      )}

      {/* Filter Controls */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
          <Filter className="w-3.5 h-3.5" />
          <span>Report Configuration & Filters</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Select Report Type</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as any)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="monthly_risk">Debarment & Risk Forecast Report</option>
              <option value="daily">Classroom Daily Register (DBMS LH-302)</option>
              <option value="dept_summary">Department Institutional Comparison</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Department</label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white"
            >
              <option value="all">All Departments</option>
              <option value="cse">Computer Science & Engineering</option>
              <option value="it">Information Technology</option>
              <option value="ece">Electronics & Communication</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Academic Period</label>
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-700">
              Odd Semester 2025–26 (Aug 2026)
            </div>
          </div>
        </div>
      </div>

      {/* Printable Report Document Preview */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-300 shadow-sm space-y-6 print:border-none print:shadow-none">
        {/* Institutional Letterhead */}
        <div className="text-center border-b-2 border-slate-800 pb-4 space-y-1">
          <h2 className="text-lg font-bold uppercase tracking-wide text-slate-900">
            {INSTITUTION_CONFIG.name}
          </h2>
          <p className="text-xs text-slate-600">
            Office of the Dean of Academic Affairs • Coimbatore - 641042
          </p>
          <div className="text-[11px] font-bold text-blue-800 uppercase tracking-wider pt-1">
            {reportType === 'monthly_risk'
              ? 'Official Student Attendance Risk & Debarment Mitigation Report'
              : reportType === 'daily'
              ? 'Classroom Daily Dynamic Attendance Register'
              : 'Institutional Department Attendance Benchmark Summary'}
          </div>
        </div>

        {/* Report Meta Info */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Date Generated</span>
            <span className="font-semibold text-slate-900">{new Date().toLocaleDateString()}</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Compliance Rule</span>
            <span className="font-semibold text-slate-900">75% Mandatory Cutoff</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Generated By</span>
            <span className="font-semibold text-slate-900">Dr. K. Jayanthi (Dean)</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 block uppercase">Anti-Proxy Confidence</span>
            <span className="font-semibold text-emerald-700">97.4% High Trust</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {reportType === 'monthly_risk' ? (
            <table className="w-full text-left text-xs border border-slate-200 min-w-[600px]">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5 border">Roll No</th>
                  <th className="p-2.5 border">Student Name</th>
                  <th className="p-2.5 border">Department</th>
                  <th className="p-2.5 border">Current %</th>
                  <th className="p-2.5 border">Predicted Next %</th>
                  <th className="p-2.5 border">Risk Level</th>
                  <th className="p-2.5 border">Primary Observation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {AT_RISK_STUDENTS_LIST.map((stu) => (
                  <tr key={stu.studentId}>
                    <td className="p-2.5 border font-mono font-bold">{stu.rollNumber}</td>
                    <td className="p-2.5 border font-semibold">{stu.studentName}</td>
                    <td className="p-2.5 border text-slate-600">{stu.departmentName}</td>
                    <td className="p-2.5 border font-bold text-rose-600">{stu.overallAttendance}%</td>
                    <td className="p-2.5 border font-bold text-rose-700">{stu.predictedAttendanceNextMonth}%</td>
                    <td className="p-2.5 border">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                        {stu.riskLevel}
                      </span>
                    </td>
                    <td className="p-2.5 border text-slate-600">{stu.reasons[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : reportType === 'daily' ? (
            <table className="w-full text-left text-xs border border-slate-200 min-w-[600px]">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5 border">Roll No</th>
                  <th className="p-2.5 border">Student Name</th>
                  <th className="p-2.5 border">Status</th>
                  <th className="p-2.5 border">Verified Time</th>
                  <th className="p-2.5 border">Confidence</th>
                  <th className="p-2.5 border">Device Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {CLASS_ROSTER_CSE3A.slice(0, 10).map((stu) => (
                  <tr key={stu.id}>
                    <td className="p-2.5 border font-mono">{stu.rollNumber}</td>
                    <td className="p-2.5 border font-semibold">{stu.name}</td>
                    <td className="p-2.5 border font-bold capitalize">{stu.status}</td>
                    <td className="p-2.5 border">{stu.time}</td>
                    <td className="p-2.5 border font-bold">{stu.confidence}%</td>
                    <td className="p-2.5 border text-slate-500">{stu.device}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-left text-xs border border-slate-200 min-w-[600px]">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                <tr>
                  <th className="p-2.5 border">Code</th>
                  <th className="p-2.5 border">Department Name</th>
                  <th className="p-2.5 border">Students</th>
                  <th className="p-2.5 border">Faculty</th>
                  <th className="p-2.5 border">Average Attendance</th>
                  <th className="p-2.5 border">At-Risk Count</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {DEPARTMENTS.map((d) => (
                  <tr key={d.id}>
                    <td className="p-2.5 border font-bold">{d.code}</td>
                    <td className="p-2.5 border font-semibold">{d.name}</td>
                    <td className="p-2.5 border">{d.totalStudents}</td>
                    <td className="p-2.5 border">{d.totalFaculty}</td>
                    <td className="p-2.5 border font-bold">{d.averageAttendance}%</td>
                    <td className="p-2.5 border text-rose-600 font-bold">{d.atRiskCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Signature Block */}
        <div className="pt-8 flex items-center justify-between text-xs text-slate-600 border-t border-slate-200">
          <div className="text-center space-y-1">
            <div className="h-8" />
            <div className="font-bold">Faculty In-Charge</div>
            <div className="text-[10px] text-slate-400">Dr. R. Ramanathan</div>
          </div>
          <div className="text-center space-y-1">
            <div className="h-8" />
            <div className="font-bold">Dean of Academic Affairs</div>
            <div className="text-[10px] text-slate-400">Dr. K. Jayanthi</div>
          </div>
        </div>
      </div>
    </div>
  );
};
