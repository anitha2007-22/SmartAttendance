import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DEPARTMENTS, TIMETABLE_TODAY } from '../../data/mockDatabase';
import {
  UserPlus,
  Calendar,
  KeyRound,
  Trash2,
  Edit2,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building,
  GraduationCap,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  BookOpen,
  UserCheck,
  ShieldCheck,
} from 'lucide-react';

export const AdminManagementPanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'students' | 'timetable'>('students');

  // Student State
  const [students, setStudents] = useState<any[]>([]);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [showPasswords, setShowPasswords] = useState<{ [id: string]: boolean }>({});
  const [studentFormOpen, setStudentFormOpen] = useState(false);

  // New Student Form
  const [newStudent, setNewStudent] = useState({
    name: '',
    rollNumber: '',
    email: '',
    departmentName: 'Computer Science & Engineering',
    password: 'Password@123',
    year: '3rd Year',
    semester: '5th Sem',
  });
  const [studentSuccessMessage, setStudentSuccessMessage] = useState('');
  const [studentErrorMessage, setStudentErrorMessage] = useState('');

  // Timetable State
  const [timetable, setTimetable] = useState<any[]>([]);
  const [timetableFormOpen, setTimetableFormOpen] = useState(false);
  const [newSlot, setNewSlot] = useState({
    subjectName: '',
    subjectCode: '',
    facultyName: 'Dr. R. Ramanathan',
    roomNumber: 'LH-302',
    timeSlot: '11:15 AM - 12:15 PM',
    targetBatch: 'CSE-3A',
    departmentName: 'Computer Science & Engineering',
    status: 'upcoming',
  });
  const [timetableSuccessMessage, setTimetableSuccessMessage] = useState('');

  useEffect(() => {
    loadStudents();
    loadTimetable();
  }, []);

  const loadStudents = async () => {
    try {
      const data = await api.getEnrolledStudents();
      setStudents(data);
    } catch (e) {
      console.warn(e);
    }
  };

  const loadTimetable = async () => {
    try {
      const data = await api.getTimetableSchedule();
      setTimetable(data);
    } catch (e) {
      console.warn(e);
    }
  };

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let pwd = '';
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewStudent({ ...newStudent, password: pwd });
  };

  const handleEnrollStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name || !newStudent.rollNumber || !newStudent.password) {
      setStudentErrorMessage('Please fill in student name, roll number, and security password.');
      return;
    }

    try {
      const res = await api.enrollStudent(newStudent);
      if (res.student) {
        setStudents((prev) => [res.student, ...prev]);
      }
      setStudentSuccessMessage(`Student ${newStudent.name} (${newStudent.rollNumber}) enrolled successfully with password.`);
      setNewStudent({
        name: '',
        rollNumber: '',
        email: '',
        departmentName: 'Computer Science & Engineering',
        password: 'Password@123',
        year: '3rd Year',
        semester: '5th Sem',
      });
      setStudentFormOpen(false);
      setStudentErrorMessage('');
      setTimeout(() => setStudentSuccessMessage(''), 3500);
    } catch (err: any) {
      setStudentErrorMessage(err.message || 'Failed to enroll student');
    }
  };

  const handleDeleteStudent = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove ${name} from the active institution roster?`)) {
      await api.deleteStudent(id);
      setStudents((prev) => prev.filter((s) => s.id !== id));
      setStudentSuccessMessage(`Removed student record for ${name}.`);
      setTimeout(() => setStudentSuccessMessage(''), 3000);
    }
  };

  const handleAddTimetableSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlot.subjectName || !newSlot.subjectCode || !newSlot.timeSlot) {
      return;
    }

    const res = await api.addTimetableSlot(newSlot);
    if (res.slot) {
      setTimetable((prev) => [...prev, res.slot]);
    }
    setTimetableSuccessMessage(`New timetable slot ${newSlot.subjectCode} assigned to ${newSlot.facultyName}.`);
    setNewSlot({
      subjectName: '',
      subjectCode: '',
      facultyName: 'Dr. R. Ramanathan',
      roomNumber: 'LH-302',
      timeSlot: '11:15 AM - 12:15 PM',
      targetBatch: 'CSE-3A',
      departmentName: 'Computer Science & Engineering',
      status: 'upcoming',
    });
    setTimetableFormOpen(false);
    setTimeout(() => setTimetableSuccessMessage(''), 3500);
  };

  const handleDeleteTimetableSlot = async (id: string) => {
    await api.deleteTimetableSlot(id);
    setTimetable((prev) => prev.filter((s) => s.id !== id));
    setTimetableSuccessMessage('Timetable slot removed successfully.');
    setTimeout(() => setTimetableSuccessMessage(''), 3000);
  };

  const togglePasswordVisibility = (id: string) => {
    setShowPasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredStudents = students.filter((stu) => {
    const matchesSearch =
      stu.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      stu.rollNumber.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (stu.email && stu.email.toLowerCase().includes(studentSearch.toLowerCase()));
    const matchesDept = selectedDeptFilter === 'all' || stu.departmentName === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-blue-600 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Administrative Roster & Timetable Governance</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
            Student Enrollment & Faculty Timetable Control
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Register students with secure credentials and manage real-time faculty class schedules
          </p>
        </div>

        {/* Sub-tab switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 self-start sm:self-auto">
          <button
            onClick={() => setActiveSubTab('students')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'students'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Student Enrollment ({students.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('timetable')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'timetable'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Faculty Timetable ({timetable.length})</span>
          </button>
        </div>
      </div>

      {/* TAB 1: STUDENT ENROLLMENT WITH PASSWORD */}
      {activeSubTab === 'students' && (
        <div className="space-y-5">
          {studentSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{studentSuccessMessage}</span>
            </div>
          )}

          {studentErrorMessage && (
            <div className="p-3.5 bg-rose-50 text-rose-900 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{studentErrorMessage}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 flex-1">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search students by name, roll number, or email..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none"
                />
              </div>

              <select
                value={selectedDeptFilter}
                onChange={(e) => setSelectedDeptFilter(e.target.value)}
                className="px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
              >
                <option value="all">All Departments</option>
                <option value="Computer Science & Engineering">Computer Science & Eng</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Electronics & Communication">Electronics & Comm</option>
                <option value="Electrical & Electronics">Electrical & Electronics</option>
              </select>
            </div>

            <button
              onClick={() => setStudentFormOpen(!studentFormOpen)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              <span>{studentFormOpen ? 'Close Form' : 'Enroll New Student'}</span>
            </button>
          </div>

          {/* New Student Enrollment Form Modal / Expandable Card */}
          {studentFormOpen && (
            <div className="bg-white p-6 rounded-2xl border-2 border-blue-500/30 shadow-md space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>Register & Enroll Student with Password</span>
                </h3>
                <span className="text-xs text-slate-400">Institutional Database Access</span>
              </div>

              <form onSubmit={handleEnrollStudent} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Student Full Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Anandha Krishnan"
                      value={newStudent.name}
                      onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Roll Number / Register No *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 717822P149"
                      value={newStudent.rollNumber}
                      onChange={(e) => setNewStudent({ ...newStudent, rollNumber: e.target.value.toUpperCase() })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-mono uppercase"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Institutional Email</label>
                    <input
                      type="email"
                      placeholder="e.g. anand.k@smartatt.edu"
                      value={newStudent.email}
                      onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Department</label>
                    <select
                      value={newStudent.departmentName}
                      onChange={(e) => setNewStudent({ ...newStudent, departmentName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Computer Science & Engineering">Computer Science & Engineering</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics & Communication">Electronics & Communication</option>
                      <option value="Electrical & Electronics">Electrical & Electronics</option>
                      <option value="Mechanical Engineering">Mechanical Engineering</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Academic Year & Semester</label>
                    <div className="grid grid-cols-2 gap-2">
                      <select
                        value={newStudent.year}
                        onChange={(e) => setNewStudent({ ...newStudent, year: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                      <select
                        value={newStudent.semester}
                        onChange={(e) => setNewStudent({ ...newStudent, semester: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                      >
                        <option value="1st Sem">1st Sem</option>
                        <option value="3rd Sem">3rd Sem</option>
                        <option value="5th Sem">5th Sem</option>
                        <option value="7th Sem">7th Sem</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-700 block">Student Password *</label>
                      <button
                        type="button"
                        onClick={generateRandomPassword}
                        className="text-[10px] text-blue-600 hover:underline font-semibold"
                      >
                        Generate Strong
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={newStudent.password}
                        onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-mono"
                      />
                      <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStudentFormOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    Confirm & Enroll Student
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Students Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px] border-b border-slate-200">
                  <tr>
                    <th className="p-3.5 pl-5">Student / Roll No</th>
                    <th className="p-3.5">Department</th>
                    <th className="p-3.5">Year / Sem</th>
                    <th className="p-3.5">Assigned Password</th>
                    <th className="p-3.5">Attendance</th>
                    <th className="p-3.5 pr-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {filteredStudents.map((stu) => (
                    <tr key={stu.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3.5 pl-5">
                        <div className="font-bold text-slate-900">{stu.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{stu.rollNumber}</div>
                        {stu.email && <div className="text-[10px] text-slate-400">{stu.email}</div>}
                      </td>
                      <td className="p-3.5 text-slate-600 font-medium">
                        {stu.departmentName}
                      </td>
                      <td className="p-3.5 text-slate-600">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[10px] font-semibold">
                          {stu.year} • {stu.semester}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span>
                            {showPasswords[stu.id] ? stu.password : '••••••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => togglePasswordVisibility(stu.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100"
                            title={showPasswords[stu.id] ? 'Hide Password' : 'Show Password'}
                          >
                            {showPasswords[stu.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                            (stu.attendancePercentage || 75) >= 75
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {stu.attendancePercentage || 75}%
                        </span>
                      </td>
                      <td className="p-3.5 pr-5 text-right">
                        <button
                          onClick={() => handleDeleteStudent(stu.id, stu.name)}
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Remove student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {filteredStudents.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No enrolled students found matching the selected filter criteria.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: FACULTY TIMETABLE & SCHEDULE GOVERNANCE */}
      {activeSubTab === 'timetable' && (
        <div className="space-y-5">
          {timetableSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{timetableSuccessMessage}</span>
            </div>
          )}

          {/* Action Bar */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Official Daily Lecture Timetable Master
              </h2>
              <p className="text-xs text-slate-500">
                Configure classroom schedule slots, assign faculty in-charge, and allocate lecture halls
              </p>
            </div>

            <button
              onClick={() => setTimetableFormOpen(!timetableFormOpen)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{timetableFormOpen ? 'Close Form' : 'Add Class Schedule Slot'}</span>
            </button>
          </div>

          {/* Add Timetable Slot Form */}
          {timetableFormOpen && (
            <div className="bg-white p-6 rounded-2xl border-2 border-blue-500/30 shadow-md space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-blue-600" />
                  <span>Assign New Lecture Slot to Faculty Timetable</span>
                </h3>
              </div>

              <form onSubmit={handleAddTimetableSlot} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Subject Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Distributed Cloud Systems"
                      value={newSlot.subjectName}
                      onChange={(e) => setNewSlot({ ...newSlot, subjectName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Subject Code *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. CS8601"
                      value={newSlot.subjectCode}
                      onChange={(e) => setNewSlot({ ...newSlot, subjectCode: e.target.value.toUpperCase() })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 uppercase font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Faculty In-Charge *</label>
                    <select
                      value={newSlot.facultyName}
                      onChange={(e) => setNewSlot({ ...newSlot, facultyName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="Dr. R. Ramanathan">Dr. R. Ramanathan (Professor)</option>
                      <option value="Dr. K. Jayanthi">Dr. K. Jayanthi (Dean / HoD)</option>
                      <option value="Prof. M. Senthil">Prof. M. Senthil (Assoc. Prof)</option>
                      <option value="Dr. S. Anitha">Dr. S. Anitha (Asst. Prof)</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Time Slot *</label>
                    <select
                      value={newSlot.timeSlot}
                      onChange={(e) => setNewSlot({ ...newSlot, timeSlot: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="09:00 AM - 10:00 AM">09:00 AM - 10:00 AM</option>
                      <option value="10:00 AM - 11:00 AM">10:00 AM - 11:00 AM</option>
                      <option value="11:15 AM - 12:15 PM">11:15 AM - 12:15 PM</option>
                      <option value="01:15 PM - 02:15 PM">01:15 PM - 02:15 PM</option>
                      <option value="02:15 PM - 03:15 PM">02:15 PM - 03:15 PM</option>
                      <option value="03:30 PM - 04:30 PM">03:30 PM - 04:30 PM</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Room / Lecture Hall</label>
                    <input
                      type="text"
                      placeholder="e.g. LH-302"
                      value={newSlot.roomNumber}
                      onChange={(e) => setNewSlot({ ...newSlot, roomNumber: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Target Batch</label>
                    <input
                      type="text"
                      placeholder="e.g. CSE-3A"
                      value={newSlot.targetBatch}
                      onChange={(e) => setNewSlot({ ...newSlot, targetBatch: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 outline-none focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTimetableFormOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
                  >
                    Save Slot to Timetable
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Timetable Schedule Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timetable.map((slot) => (
              <div
                key={slot.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-3 hover:border-blue-300 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-700 px-2 py-0.5 bg-blue-50 rounded-md border border-blue-200">
                      {slot.subjectCode}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        slot.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : slot.status === 'completed'
                          ? 'bg-slate-100 text-slate-600'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                    >
                      {slot.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-2">
                    {slot.subjectName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                    <span>{slot.facultyName}</span>
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-1 text-[11px] font-medium text-slate-700">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{slot.timeSlot}</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Building className="w-3 h-3 text-slate-400" />
                      <span>{slot.roomNumber} ({slot.targetBatch})</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTimetableSlot(slot.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="Remove slot"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
