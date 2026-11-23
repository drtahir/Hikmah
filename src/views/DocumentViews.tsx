import React, { useState, useRef } from 'react';
import {
  FileText, Download, Printer, Plus, Trash2,
  Calendar, Building2, User, Phone, Mail, Award,
  CheckCircle, RefreshCw, ArrowLeft, Home, Search,
  ShoppingCart, Receipt, Package, BarChart3, Users, Settings,
  ScanBarcode, PauseCircle, Clock, RotateCcw, Edit3, CreditCard, X,
  Lock, Unlock, Truck, Wallet, History, Send, UserPlus,
  Tag, Upload, FileSpreadsheet
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface DocumentViewsProps {
  onBack: () => void;
  showToast: (msg: string) => void;
  onHome?: () => void;
}

// 1. Professional CV / Resume Builder (A4 format with instant Print / PDF)
export const CvResumeBuilderView: React.FC<DocumentViewsProps> = ({ onBack, showToast }) => {
  const profile = StorageService.getUserProfile();
  const [fullName, setFullName] = useState(profile.name || 'Dr. Muhammad Tahir');
  const [title, setTitle] = useState('Medical Officer / Clinical Researcher');
  const [phone, setPhone] = useState(profile.phone || '+92 344 9876543');
  const [email, setEmail] = useState(profile.email || 'tahir.buner@studentkit.edu.pk');
  const [address, setAddress] = useState(profile.institution || 'Cat-D Hospital Pacha Kalay, Buner, Khyber Pakhtunkhwa');
  const [summary, setSummary] = useState(
    'Dedicated Medical Officer with extensive experience in emergency triage, inpatient ward management, surgical assistance, and clinical research. Demonstrated proficiency in healthcare administration, staff rota scheduling, and health informatics.'
  );

  const [experiences, setExperiences] = useState([
    {
      role: 'Medical Officer (General Surgery & Emergency)',
      hospital: 'Category-D Hospital Pacha Kalay, Buner',
      period: '2022 - Present',
      points: 'Supervised 24/7 ER emergency admissions, managed mass casualty incidents, organized monthly duty rotas, conducted surgical pre-op preparation.'
    },
    {
      role: 'House Officer',
      hospital: 'Saidu Teaching Hospital, Swat',
      period: '2021 - 2022',
      points: 'Rotations in General Medicine, Surgery, Pediatrics, and Gynaecology. Managed emergency resuscitations and routine clinical investigations.'
    }
  ]);

  const [education, setEducation] = useState([
    { degree: 'MBBS (Bachelor of Medicine & Surgery)', institution: 'Khyber Medical University (KMU), Peshawar', year: '2021' },
    { degree: 'FSc (Pre-Medical)', institution: 'Government Degree College Daggar, Buner', year: '2016' }
  ]);

  const [skills, setSkills] = useState([
    'Emergency Life Support (BLS / ACLS)', 'Trauma Resuscitation', 'Clinical Rota Scheduling',
    'Electronic Health Records', 'Patient Counselling', 'Medical Auditing & Reporting'
  ]);
  const [newSkill, setNewSkill] = useState('');

  const addExperience = () => {
    setExperiences([...experiences, { role: 'Position Title', hospital: 'Organization / Hospital', period: '2023 - 2024', points: 'Key duties and achievements.' }]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const addEducation = () => {
    setEducation([...education, { degree: 'Degree Name', institution: 'University / Board', year: '2020' }]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addSkill = () => {
    if (newSkill.trim()) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (s: string) => {
    setSkills(skills.filter(item => item !== s));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            Medical CV & Resume Builder (A4)
          </h2>
          <p className="text-sm text-slate-500">Live preview & PDF generation formatted for Pakistan PMDC, Khyber Pakhtunkhwa DOH, & Overseas jobs.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Editor Form */}
        <div className="lg:col-span-5 space-y-6 print:hidden">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Personal Details</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Professional Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Phone</label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 block mb-1">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Address / Hospital Location</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Professional Summary</label>
                <textarea
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Experience list */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white text-base">Work Experience</h3>
              <button onClick={addExperience} className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
            {experiences.map((exp, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2 border border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-700 dark:text-slate-200">Position #{idx + 1}</span>
                  <button onClick={() => removeExperience(idx)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Role"
                  value={exp.role}
                  onChange={(e) => {
                    const updated = [...experiences];
                    updated[idx].role = e.target.value;
                    setExperiences(updated);
                  }}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Hospital / Org"
                  value={exp.hospital}
                  onChange={(e) => {
                    const updated = [...experiences];
                    updated[idx].hospital = e.target.value;
                    setExperiences(updated);
                  }}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                />
                <input
                  type="text"
                  placeholder="Period"
                  value={exp.period}
                  onChange={(e) => {
                    const updated = [...experiences];
                    updated[idx].period = e.target.value;
                    setExperiences(updated);
                  }}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                />
                <textarea
                  rows={2}
                  placeholder="Responsibilities"
                  value={exp.points}
                  onChange={(e) => {
                    const updated = [...experiences];
                    updated[idx].points = e.target.value;
                    setExperiences(updated);
                  }}
                  className="w-full px-2 py-1.5 rounded border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Key Skills</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add clinical or technical skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill()}
                className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
              />
              <button onClick={addSkill} className="px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold">
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {skills.map((s) => (
                <span key={s} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs flex items-center gap-1.5">
                  {s}
                  <button onClick={() => removeSkill(s)} className="text-slate-400 hover:text-red-500">×</button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Live A4 Document Preview */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg min-h-[850px] print:shadow-none print:border-none print:p-0 print:m-0 text-slate-900 dark:text-slate-100">
          {/* Header */}
          <div className="border-b-2 border-emerald-600 pb-5 mb-5">
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">{fullName}</h1>
            <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400 mt-0.5">{title}</p>
            <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-600 dark:text-slate-400 mt-3">
              <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5 text-emerald-600" />{phone}</span>
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5 text-emerald-600" />{email}</span>
              <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5 text-emerald-600" />{address}</span>
            </div>
          </div>

          {/* Summary */}
          <div className="mb-5">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">Professional Profile</h2>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{summary}</p>
          </div>

          {/* Clinical & Professional Experience */}
          <div className="mb-5">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-3 border-b border-slate-200 dark:border-slate-800 pb-1">
              Work & Clinical Experience
            </h2>
            <div className="space-y-4">
              {experiences.map((exp, i) => (
                <div key={i}>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{exp.role}</span>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{exp.period}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-500 mb-1">{exp.hospital}</div>
                  <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">{exp.points}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="mb-5">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-3 border-b border-slate-200 dark:border-slate-800 pb-1">
              Education & Qualifications
            </h2>
            <div className="space-y-2">
              {education.map((edu, i) => (
                <div key={i} className="flex justify-between items-baseline text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{edu.degree}</span>
                    <div className="text-slate-500">{edu.institution}</div>
                  </div>
                  <span className="font-semibold text-emerald-600">{edu.year}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Skills */}
          <div>
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2 border-b border-slate-200 dark:border-slate-800 pb-1">
              Clinical Core Competencies
            </h2>
            <div className="grid grid-cols-2 gap-1.5 text-xs text-slate-700 dark:text-slate-300">
              {skills.map((s, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Hospital Rota Scheduler (Category-D Hospital Buner specific)
export const DutyRotaCreatorView: React.FC<DocumentViewsProps> = ({ onBack, showToast }) => {
  const [department, setDepartment] = useState('Emergency Department (ED)');
  const [month, setMonth] = useState('May 2025');
  const [staffList, setStaffList] = useState([
    { name: 'Dr. Muhammad Tahir', designation: 'Medical Officer', shifts: ['Morning', 'Evening', 'Night', 'Off', 'Morning', 'Night', 'Off'] },
    { name: 'Dr. Shahab Ud Din', designation: 'Casualty Medical Officer', shifts: ['Evening', 'Night', 'Off', 'Morning', 'Evening', 'Off', 'Morning'] },
    { name: 'Nurse Rabia Bibi', designation: 'Charge Nurse (ICU)', shifts: ['Night', 'Off', 'Morning', 'Morning', 'Off', 'Evening', 'Night'] },
    { name: 'Staff Usman Khan', designation: 'OT Technician', shifts: ['Morning', 'Morning', 'Evening', 'Night', 'Off', 'Off', 'Morning'] },
    { name: 'Dr. Farhan Ali', designation: 'TMO Pediatrics', shifts: ['Off', 'Morning', 'Night', 'Off', 'Evening', 'Morning', 'Night'] }
  ]);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const shiftColors: Record<string, string> = {
    Morning: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    Evening: 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300',
    Night: 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300',
    Off: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
  };

  const cycleShift = (staffIdx: number, dayIdx: number) => {
    const cycle = ['Morning', 'Evening', 'Night', 'Off'];
    const current = staffList[staffIdx].shifts[dayIdx];
    const next = cycle[(cycle.indexOf(current) + 1) % cycle.length];
    const updated = [...staffList];
    updated[staffIdx].shifts[dayIdx] = next;
    setStaffList(updated);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-600" />
            Hospital Duty Rota Creator
          </h2>
          <p className="text-sm text-slate-500">Government Cat-D Hospital Pacha Kalay Buner Official Shift Schedule</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Print Duty Rota
          </button>
        </div>
      </div>

      {/* Printable Sheet */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto print:p-0 print:border-none print:shadow-none">
        <div className="text-center pb-4 mb-4 border-b border-slate-200 dark:border-slate-800">
          <h1 className="text-lg font-black uppercase text-slate-900 dark:text-white">Office of the Medical Superintendent</h1>
          <h2 className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Category-D Hospital Pacha Kalay, District Buner</h2>
          <p className="text-xs text-slate-500 mt-1">Official Duty Rota for {department} — {month}</p>
        </div>

        <table className="w-full text-left text-xs border-collapse border border-slate-300 dark:border-slate-700">
          <thead>
            <tr className="bg-slate-100 dark:bg-slate-800">
              <th className="border border-slate-300 dark:border-slate-700 p-2.5 font-bold">Staff Member</th>
              <th className="border border-slate-300 dark:border-slate-700 p-2.5 font-bold">Designation</th>
              {days.map(d => (
                <th key={d} className="border border-slate-300 dark:border-slate-700 p-2.5 font-bold text-center">{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staffList.map((staff, sIdx) => (
              <tr key={sIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                <td className="border border-slate-300 dark:border-slate-700 p-2.5 font-bold text-slate-900 dark:text-white">{staff.name}</td>
                <td className="border border-slate-300 dark:border-slate-700 p-2.5 text-slate-600 dark:text-slate-400">{staff.designation}</td>
                {staff.shifts.map((shift, dIdx) => (
                  <td
                    key={dIdx}
                    onClick={() => cycleShift(sIdx, dIdx)}
                    className="border border-slate-300 dark:border-slate-700 p-2 text-center cursor-pointer select-none"
                  >
                    <span className={`px-2 py-1 rounded font-bold text-[11px] ${shiftColors[shift] || ''}`}>
                      {shift}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-8 pt-6 flex justify-between text-xs text-slate-700 dark:text-slate-300">
          <div>
            <p className="font-semibold">Shift Timing Guidelines:</p>
            <p className="text-[11px] text-slate-500">Morning: 08:00 AM - 02:00 PM | Evening: 02:00 PM - 08:00 PM | Night: 08:00 PM - 08:00 AM</p>
          </div>
          <div className="text-right">
            <div className="h-10 border-b border-dashed border-slate-400 w-48 mb-1"></div>
            <p className="font-bold">Medical Superintendent (MS)</p>
            <p className="text-[11px] text-slate-500">Cat-D Hospital Pacha Kalay Buner</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// 3. Hospital Clerical & MS Kit (Show Cause, Transfer Order, Explanation Notice)
export const HospitalClericalAdminView: React.FC<DocumentViewsProps> = ({ onBack, showToast }) => {
  const [template, setTemplate] = useState<'show_cause' | 'duty_order' | 'medical_certificate'>('show_cause');
  const [empName, setEmpName] = useState('Mr. Zahir Khan');
  const [empDesignation, setEmpDesignation] = useState('Ward Orderly (BPS-04)');
  const [dispatchNo, setDispatchNo] = useState('CDH/BNR/2025/1104');
  const [issueDate, setIssueDate] = useState('02-May-2025');
  const [reason, setReason] = useState('Continuous unauthorized absence from emergency night duty on 28th April 2025 without prior approval or leave application.');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-emerald-600" />
            Hospital Clerical & MS Admin Kit
          </h2>
          <p className="text-sm text-slate-500">Official Government Department of Health Khyber Pakhtunkhwa Office Orders & Notices</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Print Official Notice
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 space-y-4 print:hidden">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block">Select Template</label>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setTemplate('show_cause')}
                className={`text-left p-3 rounded-xl border text-xs font-bold transition ${template === 'show_cause' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700' : 'border-slate-200 dark:border-slate-700'}`}
              >
                1. Show Cause Notice / Explanation Letter
              </button>
              <button
                onClick={() => setTemplate('duty_order')}
                className={`text-left p-3 rounded-xl border text-xs font-bold transition ${template === 'duty_order' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700' : 'border-slate-200 dark:border-slate-700'}`}
              >
                2. Official Office Order / Posting
              </button>
              <button
                onClick={() => setTemplate('medical_certificate')}
                className={`text-left p-3 rounded-xl border text-xs font-bold transition ${template === 'medical_certificate' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700' : 'border-slate-200 dark:border-slate-700'}`}
              >
                3. Medical Fitness & Leave Certificate
              </button>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Dispatch / Memo No.</label>
                <input
                  type="text"
                  value={dispatchNo}
                  onChange={(e) => setDispatchNo(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Employee Name</label>
                <input
                  type="text"
                  value={empName}
                  onChange={(e) => setEmpName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Designation</label>
                <input
                  type="text"
                  value={empDesignation}
                  onChange={(e) => setEmpDesignation(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 block mb-1">Matter / Description</label>
                <textarea
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Printable Official Document */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg min-h-[700px] text-slate-900 dark:text-slate-100 print:shadow-none print:border-none print:p-0">
          <div className="text-center pb-4 border-b-2 border-slate-800 dark:border-slate-200 mb-6">
            <h2 className="text-xs uppercase font-extrabold tracking-widest text-slate-600 dark:text-slate-400">Government of Khyber Pakhtunkhwa</h2>
            <h1 className="text-base font-black uppercase text-slate-900 dark:text-white">Office of the Medical Superintendent</h1>
            <h3 className="text-xs font-bold text-emerald-700 dark:text-emerald-400">Category-D Hospital Pacha Kalay, District Buner</h3>
            <div className="flex justify-between items-center text-xs mt-4 px-2">
              <span><strong>Dispatch No:</strong> {dispatchNo}</span>
              <span><strong>Dated:</strong> {issueDate}</span>
            </div>
          </div>

          {template === 'show_cause' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h4 className="text-center text-sm font-black underline uppercase">SHOW CAUSE NOTICE / EXPLANATION CALL</h4>
              <p><strong>To:</strong><br />{empName},<br />{empDesignation},<br />Cat-D Hospital Pacha Kalay, Buner.</p>
              <p><strong>Subject: EXPLANATION REGARDING DERELICTION OF DUTY</strong></p>
              <p>WHEREAS, it has been reported by the In-charge Emergency Officer that you were found in gross negligence and non-compliance of hospital operating procedures:</p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 border-l-4 border-red-500 rounded-r-lg italic">
                "{reason}"
              </div>
              <p>NOW THEREFORE, you are hereby directed to submit your written defense explanation to the undersigned within <strong>03 (three) days</strong> of receipt of this notice, failing which ex-parte disciplinary action under KP E&D Rules shall be initiated against you.</p>
              <div className="mt-16 text-right">
                <div className="h-10 border-b border-dashed border-slate-400 w-48 inline-block mb-1"></div>
                <p className="font-bold">Medical Superintendent</p>
                <p className="text-[11px] text-slate-500">Cat-D Hospital Pacha Kalay, Buner</p>
              </div>
            </div>
          )}

          {template === 'duty_order' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h4 className="text-center text-sm font-black underline uppercase">OFFICE ORDER</h4>
              <p>In the interest of public service and patient care, the following posting/internal duty adjustment is hereby ordered with immediate effect:</p>
              <table className="w-full border-collapse border border-slate-300 dark:border-slate-700 my-4 text-left">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800">
                    <th className="border border-slate-300 dark:border-slate-700 p-2">Official Name</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-2">Designation</th>
                    <th className="border border-slate-300 dark:border-slate-700 p-2">New Assignment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-300 dark:border-slate-700 p-2 font-bold">{empName}</td>
                    <td className="border border-slate-300 dark:border-slate-700 p-2">{empDesignation}</td>
                    <td className="border border-slate-300 dark:border-slate-700 p-2 text-emerald-700 font-semibold">{reason}</td>
                  </tr>
                </tbody>
              </table>
              <p>The aforementioned staff member is directed to report to the respective ward/section head immediately without fail.</p>
              <div className="mt-16 text-right">
                <div className="h-10 border-b border-dashed border-slate-400 w-48 inline-block mb-1"></div>
                <p className="font-bold">Medical Superintendent</p>
                <p className="text-[11px] text-slate-500">Cat-D Hospital Pacha Kalay, Buner</p>
              </div>
            </div>
          )}

          {template === 'medical_certificate' && (
            <div className="space-y-4 text-xs leading-relaxed">
              <h4 className="text-center text-sm font-black underline uppercase">MEDICAL FITNESS / SICKNESS CERTIFICATE</h4>
              <p>This is to certify that I have carefully examined <strong>{empName}</strong>, {empDesignation}.</p>
              <p>Upon comprehensive clinical examination and laboratory findings, the patient is diagnosed with:</p>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 border-l-4 border-emerald-500 rounded-r-lg font-medium">
                "{reason}"
              </div>
              <p>In view of the acute medical condition, patient is advised bed rest and medical convalescence for a period of <strong>07 (seven) days</strong> from {issueDate}.</p>
              <div className="mt-16 flex justify-between">
                <div>
                  <p className="text-[11px] text-slate-500">Patient Thumb / Signature</p>
                </div>
                <div className="text-right">
                  <div className="h-10 border-b border-dashed border-slate-400 w-48 inline-block mb-1"></div>
                  <p className="font-bold">Authorized Medical Officer</p>
                  <p className="text-[11px] text-slate-500">PMDC Reg # 98452-K</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// 4. OmniPOS Enterprise Suite — Pack A/B/C Core POS Engine (Parity with Android)
interface PosItem {
  id: string;
  name: string;
  category: string;
  price: number;
  wholesalePrice?: number;
  costPrice: number;
  stock: number;
  unit: string;
  sku: string;
  barcode: string;
  minStockAlert: number;
  batchNumber?: string;
  expiryDate?: string;
}

function getExpiryStatus(expiryDate?: string): 0 | 1 | 2 {
  if (!expiryDate || !expiryDate.trim()) return 0;
  const parsed = new Date(expiryDate.trim());
  if (Number.isNaN(parsed.getTime())) return 0;
  const diffDays = (parsed.getTime() - Date.now()) / 86400000;
  if (diffDays < 0) return 2;
  if (diffDays <= 60) return 1;
  return 0;
}

interface PosOrderLine {
  id: string;
  productId: string;
  name: string;
  quantity: number;
  price: number;
  costPrice: number;
  returnedQty: number;
}

interface PosOrderRecord {
  id: string;
  date: string;
  customer: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  itemsCount: number;
  documentType: 'Invoice' | 'Receipt' | 'Estimate' | 'Credit Note';
  paymentMethod: string;
  paymentBreakdown: string;
  paidAmount: number;
  changeDue: number;
  dueAmount: number;
  status: string;
  clientId?: string;
  cashierName?: string;
  loyaltyEarned?: number;
  orderMode?: 'Counter' | 'Table / Ward' | 'Delivery';
  tableOrRef?: string;
  items: PosOrderLine[];
}

interface PosClientRecord {
  id: string;
  name: string;
  phone: string;
  address: string;
  partyType: 'CUSTOMER' | 'SUPPLIER';
  creditBalance: number;
  creditLimit: number;
  loyaltyPoints: number;
  totalSpent: number;
}

interface PosKhataTx {
  id: string;
  clientId: string;
  clientName: string;
  date: string;
  type: 'Credit Sale' | 'Payment Received' | 'Credit Reversal' | 'Supplier Purchase' | 'Supplier Payment';
  amount: number;
  referenceId: string;
  paymentMethod: string;
  note: string;
}

interface PosExpenseItem {
  id: string;
  title: string;
  category: string;
  amount: number;
  date: string;
  paymentMethod: string;
  notes: string;
}

interface PosPurchaseOrderRec {
  id: string;
  supplierId: string;
  supplierName: string;
  date: string;
  totalAmount: number;
  paidAmount: number;
  status: 'Received' | 'Partial Paid' | 'Unpaid';
  itemsSummary: string;
}

interface PosDrawerSession {
  id: string;
  openedAt: string;
  closedAt?: string;
  openedBy: string;
  openingFloat: number;
  expectedCash?: number;
  countedCash?: number;
  variance?: number;
  status: 'OPEN' | 'CLOSED';
  notes: string;
}

interface HeldBill {
  id: string;
  label: string;
  clientId: string | null;
  cart: Record<string, number>;
  discountPct: number;
  taxPct: number;
  heldAt: string;
}

const DEFAULT_POS_PRODUCTS: PosItem[] = [
  { id: 'p1', name: 'Panadol Extra 500mg (Box)', category: 'Pharmacy', price: 180, wholesalePrice: 155, costPrice: 135, stock: 150, unit: 'Box', sku: 'PHM-001', barcode: '8964001230011', minStockAlert: 20, batchNumber: 'B-2611A', expiryDate: '2027-08-15' },
  { id: 'p2', name: 'A4 Printing Paper Ream (500 Sheets)', category: 'Stationery', price: 1250, wholesalePrice: 1120, costPrice: 980, stock: 40, unit: 'Ream', sku: 'STN-006', barcode: '8964001230066', minStockAlert: 8 },
  { id: 'p3', name: 'Digital BP Monitor', category: 'Equipment', price: 4200, wholesalePrice: 3700, costPrice: 2950, stock: 25, unit: 'Unit', sku: 'EQP-003', barcode: '8964001230035', minStockAlert: 5 },
  { id: 'p4', name: 'Surgical Face Mask (50 pcs)', category: 'Medical', price: 350, wholesalePrice: 290, costPrice: 220, stock: 80, unit: 'Box', sku: 'MED-002', barcode: '8964001230028', minStockAlert: 15, batchNumber: 'M-9910', expiryDate: '2028-02-01' },
  { id: 'p5', name: 'Infrared Thermometer', category: 'Equipment', price: 1950, wholesalePrice: 1720, costPrice: 1380, stock: 30, unit: 'Unit', sku: 'EQP-008', barcode: '8964001230080', minStockAlert: 6 },
  { id: 'p6', name: 'Hand Sanitizer 500ml', category: 'Hygiene', price: 290, wholesalePrice: 240, costPrice: 185, stock: 95, unit: 'Bottle', sku: 'HYG-004', barcode: '8964001230042', minStockAlert: 15, batchNumber: 'H-402', expiryDate: '2026-12-25' },
];

const DEFAULT_POS_CLIENTS: PosClientRecord[] = [
  { id: 'c1', name: 'Al-Khidmat Pharmacy, Daggar', phone: '+92 300 9123456', address: 'Main Bazaar, Daggar, Buner', partyType: 'CUSTOMER', creditBalance: 4500, creditLimit: 50000, loyaltyPoints: 245, totalSpent: 31200 },
  { id: 'c2', name: 'Buner Medical Complex', phone: '+92 344 8877665', address: 'Swari Road, Buner', partyType: 'CUSTOMER', creditBalance: 0, creditLimit: 25000, loyaltyPoints: 120, totalSpent: 12500 },
  { id: 's1', name: 'Peshawar Pharma Distributors', phone: '+92 333 5511223', address: 'Khyber Bazaar, Peshawar', partyType: 'SUPPLIER', creditBalance: 18500, creditLimit: 200000, loyaltyPoints: 0, totalSpent: 94000 },
  { id: 's2', name: 'Swat Surgical & Lab Supplies', phone: '+92 312 4400991', address: 'Mingora, Swat', partyType: 'SUPPLIER', creditBalance: 0, creditLimit: 100000, loyaltyPoints: 0, totalSpent: 42000 },
];

const DEFAULT_POS_STAFF = [
  { id: 'st-0', name: 'Administrator', role: 'Owner / Admin', pin: '0000' },
  { id: 'st-1', name: 'Ali Khan', role: 'Senior Cashier', pin: '1234' },
  { id: 'st-2', name: 'Sarah Ahmed', role: 'Shift Supervisor', pin: '2233' },
];

export const InvoiceGeneratorView: React.FC<DocumentViewsProps> = ({ onBack, onHome, showToast }) => {
  const [activeTab, setActiveTab] = useState<'pos' | 'invoices' | 'stock' | 'reports' | 'staff' | 'setup'>('pos');
  const [invoiceSubTab, setInvoiceSubTab] = useState<'bills' | 'khata' | 'expenses'>('bills');
  const [stockSubTab, setStockSubTab] = useState<'catalog' | 'suppliers'>('catalog');

  const [products, setProducts] = useState<PosItem[]>(DEFAULT_POS_PRODUCTS);
  const [clients, setClients] = useState<PosClientRecord[]>(DEFAULT_POS_CLIENTS);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [redeemLoyaltyPoints, setRedeemLoyaltyPoints] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCat, setSelectedCat] = useState('All');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [discountPct, setDiscountPct] = useState(0);
  const [defaultTaxPct, setDefaultTaxPct] = useState(0);
  const [taxPct, setTaxPct] = useState(0);
  const [isWholesaleMode, setIsWholesaleMode] = useState(false);
  const [orderMode, setOrderMode] = useState<'Counter' | 'Table / Ward' | 'Delivery'>('Counter');
  const [tableOrRef, setTableOrRef] = useState('');
  const [receiptFooter, setReceiptFooter] = useState('Thank you for your business!');
  const [autoKickDrawer, setAutoKickDrawer] = useState(true);
  const [loyaltyPtsPer100, setLoyaltyPtsPer100] = useState(1);
  const [showLabelsModal, setShowLabelsModal] = useState(false);
  const [backupJsonInput, setBackupJsonInput] = useState('');

  // Staff PIN & Cash Drawer Sessions
  const [activeCashier, setActiveCashier] = useState(DEFAULT_POS_STAFF[0]);
  const [drawerSessions, setDrawerSessions] = useState<PosDrawerSession[]>([
    { id: 'DRW-101', openedAt: 'Today 08:30 AM', openedBy: 'Administrator', openingFloat: 5000, status: 'OPEN', notes: 'Morning Till Opening' },
  ]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [floatInput, setFloatInput] = useState('5000');
  const [countedCashInput, setCountedCashInput] = useState('');
  const [drawerNoteInput, setDrawerNoteInput] = useState('');

  // Khata Ledger, Expenses & Supplier GRNs
  const [khataTx, setKhataTx] = useState<PosKhataTx[]>([
    { id: 'KHT-101', clientId: 'c1', clientName: 'Al-Khidmat Pharmacy, Daggar', date: '18-Nov-2026', type: 'Credit Sale', amount: 4500, referenceId: 'INV-88390', paymentMethod: 'Credit / Khata', note: 'Net-15 Pharmacy Supply' },
  ]);
  const [posExpenses, setPosExpenses] = useState<PosExpenseItem[]>([
    { id: 'EXP-1', title: 'WAPDA Electricity Bill', category: 'Utilities', amount: 3200, date: '20-Nov-2026', paymentMethod: 'Cash Drawer', notes: 'Monthly shop meter' },
    { id: 'EXP-2', title: 'Shop Helper Tea & Stationery', category: 'Petty Cash Out', amount: 450, date: '20-Nov-2026', paymentMethod: 'Cash Drawer', notes: 'Daily petty cash' },
  ]);
  const [purchaseOrders, setPurchaseOrders] = useState<PosPurchaseOrderRec[]>([
    { id: 'GRN-7701', supplierId: 's1', supplierName: 'Peshawar Pharma Distributors', date: '19-Nov-2026', totalAmount: 28500, paidAmount: 10000, status: 'Partial Paid', itemsSummary: 'Panadol Extra 500mg x100, Surgical Mask x50' },
  ]);

  // Pack B Modals
  const [showClientModal, setShowClientModal] = useState(false);
  const [clientForm, setClientForm] = useState({ name: '', phone: '', address: '', partyType: 'CUSTOMER' as 'CUSTOMER' | 'SUPPLIER', creditLimit: '50000' });
  const [khataSettleTarget, setKhataSettleTarget] = useState<PosClientRecord | null>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleMethod, setSettleMethod] = useState<'Cash' | 'Card POS' | 'QR Wallet'>('Cash');
  const [settleNote, setSettleNote] = useState('');
  const [khataHistoryTarget, setKhataHistoryTarget] = useState<PosClientRecord | null>(null);

  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseForm, setExpenseForm] = useState({ title: '', category: 'Rent', amount: '', paymentMethod: 'Cash Drawer', notes: '' });

  const [showGrnModal, setShowGrnModal] = useState(false);
  const [grnSupplierId, setGrnSupplierId] = useState('s1');
  const [grnProductId, setGrnProductId] = useState('p1');
  const [grnQty, setGrnQty] = useState('20');
  const [grnCost, setGrnCost] = useState('135');
  const [grnPaidNow, setGrnPaidNow] = useState('');

  // Hold / Parked Bills
  const [heldBills, setHeldBills] = useState<HeldBill[]>([]);
  const [showHeldModal, setShowHeldModal] = useState(false);

  // Quick Barcode Simulator / Scanner Modal
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scanCodeInput, setScanCodeInput] = useState('');

  // Checkout Payment & Split Tender Modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutDocType, setCheckoutDocType] = useState<'Invoice' | 'Receipt' | 'Estimate'>('Invoice');
  const [payMethod, setPayMethod] = useState<'Cash' | 'Card POS' | 'QR Wallet' | 'Split' | 'Credit / Khata'>('Cash');
  const [cashTendered, setCashTendered] = useState('');
  const [splitCash, setSplitCash] = useState('');
  const [splitCard, setSplitCard] = useState('');
  const [splitQr, setSplitQr] = useState('');

  // Stock Filter & Add/Edit Product Modal
  const [stockFilter, setStockFilter] = useState<'All' | 'Low' | 'Out' | 'Expiring'>('All');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProd, setEditingProd] = useState<PosItem | null>(null);
  const [prodForm, setProdForm] = useState({ name: '', category: 'Pharmacy', price: '', wholesalePrice: '', costPrice: '', stock: '50', unit: 'Piece', sku: '', barcode: '', minStockAlert: '10', batchNumber: '', expiryDate: '' });

  // Return / Refund Modal
  const [returnOrder, setReturnOrder] = useState<PosOrderRecord | null>(null);
  const [returnQtyMap, setReturnQtyMap] = useState<Record<string, number>>({});
  const [restockOnReturn, setRestockOnReturn] = useState(true);

  const [orders, setOrders] = useState<PosOrderRecord[]>([
    {
      id: 'INV-88412',
      date: '20-Nov-2026',
      customer: 'Al-Khidmat Pharmacy, Daggar',
      clientId: 'c1',
      cashierName: 'Administrator',
      loyaltyEarned: 67,
      subtotal: 6700,
      discount: 0,
      tax: 0,
      total: 6700,
      itemsCount: 3,
      documentType: 'Invoice',
      paymentMethod: 'Cash',
      paymentBreakdown: '',
      paidAmount: 6700,
      changeDue: 0,
      dueAmount: 0,
      status: 'Paid',
      items: [
        { id: 'ol-1', productId: 'p3', name: 'Digital BP Monitor', quantity: 1, price: 4200, costPrice: 2950, returnedQty: 0 },
        { id: 'ol-2', productId: 'p2', name: 'A4 Printing Paper Ream (500 Sheets)', quantity: 2, price: 1250, costPrice: 980, returnedQty: 0 },
      ],
    },
  ]);

  const customerList = clients.filter((c) => c.partyType === 'CUSTOMER');
  const supplierList = clients.filter((c) => c.partyType === 'SUPPLIER');
  const selectedClient = customerList.find((c) => c.id === selectedClientId) || null;
  const customerName = selectedClient ? selectedClient.name : 'Walking Customer / Cash';

  const openDrawerSession = drawerSessions.find((s) => s.status === 'OPEN') || null;
  const cashSalesTotal = orders
    .filter((o) => o.documentType !== 'Estimate' && o.documentType !== 'Credit Note' && o.paymentMethod === 'Cash')
    .reduce((s, o) => s + Math.min(o.total, o.paidAmount), 0);
  const cashRefundsTotal = orders
    .filter((o) => o.documentType === 'Credit Note' && o.paymentMethod === 'Cash')
    .reduce((s, o) => s + Math.abs(o.total), 0);
  const cashKhataCollections = khataTx
    .filter((t) => t.type === 'Payment Received' && t.paymentMethod === 'Cash')
    .reduce((s, t) => s + t.amount, 0);
  const cashExpensesOut = posExpenses
    .filter((e) => e.paymentMethod === 'Cash Drawer' && e.category !== 'Cash In Top-up')
    .reduce((s, e) => s + e.amount, 0);
  const cashTopupsIn = posExpenses
    .filter((e) => e.category === 'Cash In Top-up')
    .reduce((s, e) => s + e.amount, 0);
  const liveDrawerExpected =
    (openDrawerSession?.openingFloat || 0) + cashSalesTotal + cashKhataCollections + cashTopupsIn - cashRefundsTotal - cashExpensesOut;

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];
  const filteredProducts = products.filter(
    (p) =>
      (selectedCat === 'All' || p.category === selectedCat) &&
      (searchQuery.trim() === '' ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.barcode.includes(searchQuery.trim()))
  );

  const cartEntries = Object.entries(cart)
    .map(([id, qty]) => {
      const prod = products.find((p) => p.id === id);
      return prod ? { prod, qty } : null;
    })
    .filter((x): x is { prod: PosItem; qty: number } => Boolean(x));

  const getUnitPrice = (p: PosItem) => (isWholesaleMode ? (p.wholesalePrice && p.wholesalePrice > 0 ? p.wholesalePrice : Math.round(p.price * 0.85)) : p.price);

  const subtotal = cartEntries.reduce((s, { prod, qty }) => s + getUnitPrice(prod) * qty, 0);
  const discountAmt = subtotal * (discountPct / 100);
  const baseAfterDisc = Math.max(0, subtotal - discountAmt);
  const pointsToRedeem = redeemLoyaltyPoints && selectedClient ? Math.min(selectedClient.loyaltyPoints, 500, Math.floor(baseAfterDisc)) : 0;
  const loyaltyDiscountAmt = pointsToRedeem;
  const taxableBase = Math.max(0, baseAfterDisc - loyaltyDiscountAmt);
  const taxAmt = taxableBase * (taxPct / 100);
  const grandTotal = Math.max(0, taxableBase + taxAmt);

  const addToCart = (id: string) => {
    const prod = products.find((p) => p.id === id);
    const currentQty = cart[id] || 0;
    if (prod) {
      if (prod.stock <= 0) {
        showToast(`${prod.name} is OUT OF STOCK`);
        return;
      }
      if (currentQty >= prod.stock) {
        showToast(`Max available stock (${prod.stock} ${prod.unit}) reached`);
        return;
      }
    }
    setCart((prev) => ({ ...prev, [id]: currentQty + 1 }));
  };

  const removeFromCart = (id: string) =>
    setCart((prev) => {
      const next = { ...prev };
      if ((next[id] || 0) <= 1) delete next[id];
      else next[id] -= 1;
      return next;
    });

  const handleBarcodeLookup = (code: string) => {
    const clean = code.trim().toLowerCase();
    const match = products.find(
      (p) => p.barcode.toLowerCase() === clean || p.sku.toLowerCase() === clean || p.id.toLowerCase() === clean
    );
    if (match) {
      addToCart(match.id);
      showToast(`Scanned: ${match.name}`);
      setScanCodeInput('');
      setShowScannerModal(false);
    } else {
      showToast(`No product matches barcode "${code}". Opening catalog editor.`);
      setShowScannerModal(false);
      setEditingProd(null);
      setProdForm({ name: '', category: 'Pharmacy', price: '', wholesalePrice: '', costPrice: '', stock: '50', unit: 'Piece', sku: '', barcode: code.trim(), minStockAlert: '10', batchNumber: '', expiryDate: '' });
      setShowProductModal(true);
    }
  };

  const handleHoldCart = () => {
    if (cartEntries.length === 0) return;
    const held: HeldBill = {
      id: `HOLD-${Date.now() % 10000}`,
      label: customerName || 'Walk-in Customer',
      clientId: selectedClientId,
      cart: { ...cart },
      discountPct,
      taxPct,
      heldAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setHeldBills([held, ...heldBills]);
    setCart({});
    setDiscountPct(0);
    setRedeemLoyaltyPoints(false);
    showToast(`Bill parked for ${held.label}`);
  };

  const openCheckoutFlow = () => {
    if (cartEntries.length === 0) {
      showToast('Cart is empty. Tap items to add.');
      return;
    }
    setCheckoutDocType('Invoice');
    setPayMethod('Cash');
    setCashTendered(Math.round(grandTotal).toString());
    setSplitCash(Math.round(grandTotal / 2).toString());
    setSplitCard(Math.round(grandTotal - Math.round(grandTotal / 2)).toString());
    setSplitQr('0');
    setShowCheckoutModal(true);
  };

  const finalizeCheckout = () => {
    if (payMethod === 'Credit / Khata' && checkoutDocType !== 'Estimate' && !selectedClient) {
      showToast('Select or add a Customer first for Credit / Khata billing');
      return;
    }
    const tendered =
      payMethod === 'Cash'
        ? Number(cashTendered) || 0
        : payMethod === 'Split'
        ? (Number(splitCash) || 0) + (Number(splitCard) || 0) + (Number(splitQr) || 0)
        : payMethod === 'Credit / Khata'
        ? 0
        : grandTotal;

    const changeDue = checkoutDocType !== 'Estimate' && payMethod !== 'Credit / Khata' ? Math.max(0, tendered - grandTotal) : 0;
    const dueAmount = checkoutDocType === 'Estimate' ? 0 : payMethod === 'Credit / Khata' ? grandTotal : Math.max(0, grandTotal - tendered);
    const status =
      checkoutDocType === 'Estimate' ? 'Estimate' : dueAmount >= grandTotal && grandTotal > 0 ? 'Unpaid' : dueAmount > 0 ? 'Partial' : 'Paid';
    const breakdown =
      payMethod === 'Split'
        ? [
            Number(splitCash) > 0 ? `Cash: ${splitCash}` : '',
            Number(splitCard) > 0 ? `Card: ${splitCard}` : '',
            Number(splitQr) > 0 ? `QR: ${splitQr}` : '',
          ]
            .filter(Boolean)
            .join(' | ')
        : '';

    const earnedPts = checkoutDocType !== 'Estimate' && selectedClient ? Math.floor((grandTotal / 100) * loyaltyPtsPer100) : 0;
    const orderId = `${checkoutDocType === 'Estimate' ? 'EST' : 'INV'}-${Math.floor(10000 + Math.random() * 89999)}`;
    const todayStr = new Date().toLocaleDateString('en-GB');

    const orderItems: PosOrderLine[] = cartEntries.map(({ prod, qty }, idx) => {
      const unitP = getUnitPrice(prod);
      return {
        id: `ol-${Date.now()}-${idx}`,
        productId: prod.id,
        name: isWholesaleMode ? `${prod.name} [W/S]` : prod.name,
        quantity: qty,
        price: unitP,
        costPrice: prod.costPrice,
        returnedQty: 0,
      };
    });

    const newOrder: PosOrderRecord = {
      id: orderId,
      date: todayStr,
      customer: customerName,
      clientId: selectedClient?.id,
      cashierName: activeCashier.name,
      loyaltyEarned: earnedPts,
      orderMode,
      tableOrRef: tableOrRef.trim(),
      subtotal,
      discount: discountAmt + loyaltyDiscountAmt,
      tax: taxAmt,
      total: Math.round(grandTotal),
      itemsCount: cartEntries.reduce((s, x) => s + x.qty, 0),
      documentType: checkoutDocType,
      paymentMethod: checkoutDocType === 'Estimate' ? 'Quotation' : payMethod,
      paymentBreakdown: breakdown,
      paidAmount: tendered,
      changeDue,
      dueAmount,
      status,
      items: orderItems,
    };

    if (checkoutDocType !== 'Estimate') {
      setProducts((prev) =>
        prev.map((p) => {
          const sold = cart[p.id] || 0;
          return sold > 0 ? { ...p, stock: Math.max(0, p.stock - sold) } : p;
        })
      );
      if (selectedClient) {
        setClients((prev) =>
          prev.map((c) =>
            c.id === selectedClient.id
              ? {
                  ...c,
                  creditBalance: c.creditBalance + dueAmount,
                  loyaltyPoints: Math.max(0, c.loyaltyPoints - pointsToRedeem + earnedPts),
                  totalSpent: c.totalSpent + Math.round(grandTotal),
                }
              : c
          )
        );
        if (dueAmount > 0) {
          setKhataTx((prev) => [
            {
              id: `KHT-${Date.now() % 100000}`,
              clientId: selectedClient.id,
              clientName: selectedClient.name,
              date: todayStr,
              type: 'Credit Sale',
              amount: Math.round(dueAmount),
              referenceId: orderId,
              paymentMethod: payMethod,
              note: `Unpaid bill balance (${status})`,
            },
            ...prev,
          ]);
        }
      }
    }

    setOrders([newOrder, ...orders]);
    setCart({});
    setRedeemLoyaltyPoints(false);
    setShowCheckoutModal(false);
    showToast(`${newOrder.id} (${status}) saved & Khata synced!`);
    setActiveTab('invoices');
  };

  const confirmReturnOrder = () => {
    if (!returnOrder) return;
    const creditLines: PosOrderLine[] = [];
    let refundSub = 0;

    const updatedOrigItems = returnOrder.items.map((item) => {
      const rq = Math.min(item.quantity - item.returnedQty, Math.max(0, returnQtyMap[item.id] || 0));
      if (rq > 0) {
        refundSub += item.price * rq;
        creditLines.push({
          id: `cr-${Date.now()}-${item.id}`,
          productId: item.productId,
          name: `[RETURN] ${item.name}`,
          quantity: rq,
          price: -item.price,
          costPrice: -item.costPrice,
          returnedQty: 0,
        });
        return { ...item, returnedQty: item.returnedQty + rq };
      }
      return item;
    });

    if (creditLines.length === 0) return;

    if (restockOnReturn) {
      setProducts((prev) =>
        prev.map((p) => {
          const addBack = creditLines.filter((c) => c.productId === p.id).reduce((s, c) => s + c.quantity, 0);
          return addBack > 0 ? { ...p, stock: p.stock + addBack } : p;
        })
      );
    }

    const netRefund = Math.round(refundSub);
    const crnId = `CRN-${Math.floor(10000 + Math.random() * 89999)}`;
    const todayStr = new Date().toLocaleDateString('en-GB');

    if (returnOrder.clientId) {
      const revDue = returnOrder.dueAmount > 0 ? Math.min(returnOrder.dueAmount, netRefund) : 0;
      const revPts = Math.floor(netRefund / 100);
      setClients((prev) =>
        prev.map((c) =>
          c.id === returnOrder.clientId
            ? {
                ...c,
                creditBalance: Math.max(0, c.creditBalance - revDue),
                totalSpent: Math.max(0, c.totalSpent - netRefund),
                loyaltyPoints: Math.max(0, c.loyaltyPoints - revPts),
              }
            : c
        )
      );
      if (revDue > 0) {
        setKhataTx((prev) => [
          {
            id: `REV-${Date.now() % 100000}`,
            clientId: returnOrder.clientId!,
            clientName: returnOrder.customer,
            date: todayStr,
            type: 'Credit Reversal',
            amount: revDue,
            referenceId: crnId,
            paymentMethod: 'Cash',
            note: `Khata reversed from ${crnId}`,
          },
          ...prev,
        ]);
      }
    }

    const allReturned = updatedOrigItems.every((i) => i.returnedQty >= i.quantity);
    const creditOrder: PosOrderRecord = {
      id: crnId,
      date: todayStr,
      customer: returnOrder.customer,
      clientId: returnOrder.clientId,
      cashierName: activeCashier.name,
      subtotal: -refundSub,
      discount: 0,
      tax: 0,
      total: -netRefund,
      itemsCount: creditLines.reduce((s, c) => s + c.quantity, 0),
      documentType: 'Credit Note',
      paymentMethod: 'Cash',
      paymentBreakdown: `Refund for ${returnOrder.id}`,
      paidAmount: netRefund,
      changeDue: 0,
      dueAmount: 0,
      status: 'Refunded',
      items: creditLines,
    };

    setOrders((prev) => [
      creditOrder,
      ...prev.map((o) =>
        o.id === returnOrder.id ? { ...o, status: allReturned ? 'Returned' : 'Partial Return', items: updatedOrigItems } : o
      ),
    ]);
    setReturnOrder(null);
    showToast(`Credit Note ${creditOrder.id} issued (${restockOnReturn ? 'stock restored' : 'no restock'})`);
  };

  const openAddProductModal = () => {
    setEditingProd(null);
    setProdForm({ name: '', category: 'Pharmacy', price: '', wholesalePrice: '', costPrice: '', stock: '50', unit: 'Piece', sku: '', barcode: '', minStockAlert: '10', batchNumber: '', expiryDate: '' });
    setShowProductModal(true);
  };

  const openEditProductModal = (prod: PosItem) => {
    setEditingProd(prod);
    setProdForm({
      name: prod.name,
      category: prod.category,
      price: String(prod.price),
      wholesalePrice: prod.wholesalePrice ? String(prod.wholesalePrice) : '',
      costPrice: String(prod.costPrice),
      stock: String(prod.stock),
      unit: prod.unit,
      sku: prod.sku,
      barcode: prod.barcode,
      minStockAlert: String(prod.minStockAlert),
      batchNumber: prod.batchNumber || '',
      expiryDate: prod.expiryDate || '',
    });
    setShowProductModal(true);
  };

  const saveProductModal = () => {
    if (!prodForm.name.trim()) return;
    const item: PosItem = {
      id: editingProd?.id || `p-${Date.now()}`,
      name: prodForm.name.trim(),
      category: prodForm.category.trim() || 'General',
      price: Number(prodForm.price) || 100,
      wholesalePrice: Number(prodForm.wholesalePrice) || 0,
      costPrice: Number(prodForm.costPrice) || 0,
      stock: Number(prodForm.stock) || 0,
      unit: prodForm.unit.trim() || 'Piece',
      sku: prodForm.sku.trim(),
      barcode: prodForm.barcode.trim(),
      minStockAlert: Number(prodForm.minStockAlert) || 10,
      batchNumber: prodForm.batchNumber.trim(),
      expiryDate: prodForm.expiryDate.trim(),
    };
    setProducts((prev) => (editingProd ? prev.map((p) => (p.id === editingProd.id ? item : p)) : [item, ...prev]));
    setShowProductModal(false);
    showToast(editingProd ? 'Product updated' : 'Product added to catalog');
  };

  const handleSaveClient = () => {
    if (!clientForm.name.trim()) return;
    const rec: PosClientRecord = {
      id: `${clientForm.partyType === 'SUPPLIER' ? 's' : 'c'}-${Date.now()}`,
      name: clientForm.name.trim(),
      phone: clientForm.phone.trim(),
      address: clientForm.address.trim(),
      partyType: clientForm.partyType,
      creditBalance: 0,
      creditLimit: Number(clientForm.creditLimit) || 50000,
      loyaltyPoints: 0,
      totalSpent: 0,
    };
    setClients((prev) => [rec, ...prev]);
    if (rec.partyType === 'CUSTOMER') setSelectedClientId(rec.id);
    else setGrnSupplierId(rec.id);
    setShowClientModal(false);
    showToast(`${rec.partyType === 'SUPPLIER' ? 'Supplier' : 'Customer'} ${rec.name} saved`);
  };

  const handleConfirmKhataSettle = () => {
    if (!khataSettleTarget) return;
    const amt = Number(settleAmount) || 0;
    if (amt <= 0) return;
    const isSupplier = khataSettleTarget.partyType === 'SUPPLIER';
    setClients((prev) =>
      prev.map((c) => (c.id === khataSettleTarget.id ? { ...c, creditBalance: Math.max(0, c.creditBalance - amt) } : c))
    );
    setKhataTx((prev) => [
      {
        id: `SET-${Date.now() % 100000}`,
        clientId: khataSettleTarget.id,
        clientName: khataSettleTarget.name,
        date: new Date().toLocaleDateString('en-GB'),
        type: isSupplier ? 'Supplier Payment' : 'Payment Received',
        amount: amt,
        referenceId: isSupplier ? 'SUP-PAY' : 'KHT-SET',
        paymentMethod: settleMethod,
        note: settleNote || (isSupplier ? 'Paid supplier invoice balance' : 'Customer Khata collection'),
      },
      ...prev,
    ]);
    showToast(`${isSupplier ? 'Paid' : 'Collected'} Rs ${amt.toLocaleString()} for ${khataSettleTarget.name}`);
    setKhataSettleTarget(null);
  };

  const handleConfirmGrn = () => {
    const supplier = supplierList.find((s) => s.id === grnSupplierId);
    const product = products.find((p) => p.id === grnProductId);
    const qty = Number(grnQty) || 0;
    const cost = Number(grnCost) || 0;
    if (!supplier || !product || qty <= 0) return;

    const total = Math.round(qty * cost);
    const paid = Math.min(total, Number(grnPaidNow) || 0);
    const due = total - paid;
    const grnId = `GRN-${Math.floor(1000 + Math.random() * 9000)}`;
    const todayStr = new Date().toLocaleDateString('en-GB');

    setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, stock: p.stock + qty, costPrice: cost } : p)));
    setClients((prev) =>
      prev.map((s) =>
        s.id === supplier.id ? { ...s, creditBalance: s.creditBalance + due, totalSpent: s.totalSpent + total } : s
      )
    );
    setPurchaseOrders((prev) => [
      {
        id: grnId,
        supplierId: supplier.id,
        supplierName: supplier.name,
        date: todayStr,
        totalAmount: total,
        paidAmount: paid,
        status: due <= 0 ? 'Received' : paid > 0 ? 'Partial Paid' : 'Unpaid',
        itemsSummary: `${product.name} x${qty} @ Rs ${cost}`,
      },
      ...prev,
    ]);
    if (due > 0) {
      setKhataTx((prev) => [
        {
          id: `SUP-${Date.now() % 100000}`,
          clientId: supplier.id,
          clientName: supplier.name,
          date: todayStr,
          type: 'Supplier Purchase',
          amount: due,
          referenceId: grnId,
          paymentMethod: 'Supplier Credit',
          note: `Unpaid GRN balance for ${product.name}`,
        },
        ...prev,
      ]);
    }
    setShowGrnModal(false);
    showToast(`${grnId} received: +${qty} ${product.name} @ Rs ${cost}`);
  };

  const handleSaveExpense = () => {
    const amt = Number(expenseForm.amount) || 0;
    if (!expenseForm.title.trim() || amt <= 0) return;
    setPosExpenses((prev) => [
      {
        id: `EXP-${Date.now() % 100000}`,
        title: expenseForm.title.trim(),
        category: expenseForm.category,
        amount: amt,
        date: new Date().toLocaleDateString('en-GB'),
        paymentMethod: expenseForm.paymentMethod,
        notes: expenseForm.notes.trim(),
      },
      ...prev,
    ]);
    setShowExpenseModal(false);
    setExpenseForm({ title: '', category: 'Rent', amount: '', paymentMethod: 'Cash Drawer', notes: '' });
    showToast(`Logged Rs ${amt.toLocaleString()} (${expenseForm.category})`);
  };

  const activeOrdersForStats = orders.filter((o) => o.documentType !== 'Estimate');
  const totalRevenue = activeOrdersForStats.reduce((s, o) => s + o.total, 0);
  const totalCogs = activeOrdersForStats
    .filter((o) => o.documentType !== 'Credit Note')
    .reduce(
      (s, o) => s + o.items.reduce((ls, it) => ls + (it.costPrice || it.price * 0.58) * Math.max(0, it.quantity - it.returnedQty), 0),
      0
    );
  const grossProfit = totalRevenue - totalCogs;
  const totalExpensesOut = posExpenses.filter((e) => e.category !== 'Cash In Top-up').reduce((s, e) => s + e.amount, 0);
  const netOperatingProfit = grossProfit - totalExpensesOut;
  const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
  const totalReceivables = customerList.reduce((s, c) => s + c.creditBalance, 0);
  const totalPayables = supplierList.reduce((s, c) => s + c.creditBalance, 0);

  const posNav = [
    { id: 'pos', label: 'POS', icon: ShoppingCart },
    { id: 'invoices', label: 'Invoices', icon: Receipt },
    { id: 'stock', label: 'Stock', icon: Package },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
    { id: 'staff', label: 'Staff', icon: Users },
    { id: 'setup', label: 'Setup', icon: Settings },
  ] as const;

  return (
    <div className="flex flex-col flex-1 min-h-full bg-slate-50 dark:bg-slate-950">
      {/* Slim Single-Row OmniPOS Top Bar (Zero Blank Space) */}
      <div className="sticky top-0 z-30 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-2.5 py-2 flex items-center justify-between gap-2 no-print">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onBack} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200" title="Back">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="font-bold text-sm text-slate-900 dark:text-white leading-tight truncate">OmniPOS Suite</h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate font-semibold">
              {activeCashier.name} • {openDrawerSession ? `Drawer Open: Rs ${Math.round(liveDrawerExpected).toLocaleString()}` : 'Register Closed'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => {
              setCountedCashInput(Math.round(liveDrawerExpected).toString());
              setShowRegisterModal(true);
            }}
            className={`px-2 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1 border ${
              openDrawerSession
                ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
            }`}
            title="Cash Drawer & Staff PIN Switch"
          >
            {openDrawerSession ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{openDrawerSession ? 'Till' : 'Closed'}</span>
          </button>
          <button
            onClick={openAddProductModal}
            className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
            title="Add Product"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button onClick={() => window.print()} className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800" title="Print">
            <Printer className="w-4 h-4" />
          </button>
          <button onClick={onHome || onBack} className="p-2 rounded-xl text-emerald-600 dark:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800" title="Home">
            <Home className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Dedicated Workspace */}
      <div className="flex-1 overflow-y-auto p-2.5 sm:p-3">
        {activeTab === 'pos' && (
          <div className="grid grid-cols-12 gap-2.5 h-full">
            {/* Catalog Column */}
            <div className="col-span-7 space-y-2">
              <div className="flex gap-1.5">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        handleBarcodeLookup(searchQuery);
                        setSearchQuery('');
                      }
                    }}
                    placeholder="Search name, SKU, barcode..."
                    className="w-full pl-8 pr-2.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  onClick={() => setShowScannerModal(true)}
                  className="px-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center"
                  title="Scan Barcode"
                >
                  <ScanBarcode className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
                {categories.map((c) => (
                  <button
                    key={c}
                    onClick={() => setSelectedCat(c)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap ${
                      selectedCat === c ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {filteredProducts.map((prod) => {
                  const count = cart[prod.id] || 0;
                  const isOut = prod.stock <= 0;
                  const isLow = prod.stock > 0 && prod.stock <= 5;
                  const expStat = getExpiryStatus(prod.expiryDate);
                  const effPrice = getUnitPrice(prod);
                  return (
                    <button
                      key={prod.id}
                      onClick={() => addToCart(prod.id)}
                      className={`text-left p-2.5 rounded-xl border transition space-y-1.5 ${
                        isOut
                          ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900 opacity-75'
                          : count > 0
                          ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {prod.category}
                        </span>
                        <div className="flex items-center gap-1">
                          {expStat > 0 && (
                            <span className={`text-[8px] font-bold px-1 py-0.5 rounded ${expStat === 2 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                              {expStat === 2 ? 'EXPIRED' : 'EXP SOON'}
                            </span>
                          )}
                          {count > 0 && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white tabular-nums">
                              {count}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 leading-snug">{prod.name}</div>
                      {prod.sku && <div className="text-[9px] text-slate-400 font-mono">{prod.sku}{prod.batchNumber ? ` • ${prod.batchNumber}` : ''}</div>}
                      <div className="flex justify-between items-center pt-1">
                        <span className={`font-extrabold text-xs tabular-nums ${isWholesaleMode ? 'text-teal-600 dark:text-teal-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                          Rs {effPrice}{isWholesaleMode ? ' W/S' : ''}
                        </span>
                        <span className={`text-[10px] font-semibold tabular-nums ${isOut ? 'text-rose-600 font-bold' : isLow ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                          {isOut ? 'OUT' : isLow ? `Low: ${prod.stock}` : `Qty: ${prod.stock}`}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Live Billing Cart Column */}
            <div className="col-span-5 bg-slate-100/80 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-2.5 flex flex-col justify-between gap-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">
                      Cart ({cartEntries.reduce((s, x) => s + x.qty, 0)})
                    </span>
                    <button
                      onClick={() => setIsWholesaleMode((v) => !v)}
                      className={`px-1.5 py-0.5 rounded text-[9px] font-bold border ${
                        isWholesaleMode ? 'bg-teal-600 text-white border-teal-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      {isWholesaleMode ? 'Wholesale' : 'Retail'}
                    </button>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setShowHeldModal(true)}
                      className="relative p-1 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800"
                      title="Held Bills"
                    >
                      <Clock className="w-3.5 h-3.5" />
                      {heldBills.length > 0 && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center">
                          {heldBills.length}
                        </span>
                      )}
                    </button>
                    {cartEntries.length > 0 && (
                      <>
                        <button onClick={handleHoldCart} className="p-1 rounded-lg text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40" title="Hold / Park Bill">
                          <PauseCircle className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => setCart({})} className="text-[10px] font-bold text-rose-500">Clear</button>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 overflow-x-auto">
                  {(['Counter', 'Table / Ward', 'Delivery'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setOrderMode(m)}
                      className={`px-2 py-0.5 rounded text-[9.5px] font-bold whitespace-nowrap border ${
                        orderMode === m ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                {orderMode !== 'Counter' && (
                  <input
                    type="text"
                    placeholder={orderMode === 'Table / Ward' ? 'Table # / Ward / Bed...' : 'Delivery Address / Rider...'}
                    value={tableOrRef}
                    onChange={(e) => setTableOrRef(e.target.value)}
                    className="w-full px-2 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10.5px]"
                  />
                )}
                <div className="flex gap-1 items-center">
                  <select
                    value={selectedClientId || ''}
                    onChange={(e) => {
                      setSelectedClientId(e.target.value || null);
                      setRedeemLoyaltyPoints(false);
                    }}
                    className="flex-1 min-w-0 px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px] font-semibold text-slate-900 dark:text-white"
                  >
                    <option value="">Walking Customer / Cash</option>
                    {customerList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.creditBalance > 0 ? `(Due Rs ${c.creditBalance})` : ''}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => {
                      setClientForm({ name: '', phone: '', address: '', partyType: 'CUSTOMER', creditLimit: '50000' });
                      setShowClientModal(true);
                    }}
                    className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
                    title="Add Customer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
                {selectedClient && (
                  <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-1">
                    <div className="flex justify-between text-[10px] font-bold">
                      <span className={selectedClient.creditBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                        Due: Rs {selectedClient.creditBalance.toLocaleString()}
                      </span>
                      <span className="text-amber-600">{selectedClient.loyaltyPoints} pts</span>
                    </div>
                    {selectedClient.loyaltyPoints >= 10 && cartEntries.length > 0 && (
                      <label className="flex items-center justify-between text-[10px] font-semibold text-teal-700 dark:text-teal-300 cursor-pointer">
                        <span>Redeem {Math.min(selectedClient.loyaltyPoints, 500)} pts (-Rs {Math.min(selectedClient.loyaltyPoints, 500, Math.floor(baseAfterDisc))})</span>
                        <input type="checkbox" checked={redeemLoyaltyPoints} onChange={(e) => setRedeemLoyaltyPoints(e.target.checked)} />
                      </label>
                    )}
                  </div>
                )}
                <div className="bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 p-2 min-h-28 max-h-44 overflow-y-auto space-y-1.5">
                  {cartEntries.length === 0 ? (
                    <div className="h-24 flex items-center justify-center text-center text-[11px] text-slate-400">
                      Cart is empty<br />Tap items or scan barcode
                    </div>
                  ) : (
                    cartEntries.map(({ prod, qty }) => (
                      <div key={prod.id} className="flex items-center justify-between gap-1 text-[11px] bg-slate-50 dark:bg-slate-900 p-1.5 rounded-lg">
                        <span className="truncate font-semibold text-slate-800 dark:text-slate-200">{prod.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => removeFromCart(prod.id)} className="w-4 h-4 rounded bg-slate-200 dark:bg-slate-700 font-bold">-</button>
                          <span className="font-mono font-bold w-4 text-center">{qty}</span>
                          <button onClick={() => addToCart(prod.id)} className="w-4 h-4 rounded bg-emerald-600 text-white font-bold">+</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <div className="grid grid-cols-2 gap-1.5">
                  <input
                    type="number"
                    placeholder="Disc %"
                    value={discountPct || ''}
                    onChange={(e) => setDiscountPct(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]"
                  />
                  <input
                    type="number"
                    placeholder="Tax %"
                    value={taxPct || ''}
                    onChange={(e) => setTaxPct(Number(e.target.value) || 0)}
                    className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]"
                  />
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 space-y-1 text-xs">
                  <div className="flex justify-between text-slate-600 dark:text-slate-300 tabular-nums">
                    <span>Subtotal</span>
                    <span>Rs {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-extrabold text-blue-700 dark:text-blue-300 tabular-nums">
                    <span>TOTAL</span>
                    <span>Rs {grandTotal.toFixed(2)}</span>
                  </div>
                </div>
                <button
                  onClick={openCheckoutFlow}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay &amp; Bill</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'invoices' && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              {([
                { id: 'bills', label: `All Bills (${orders.length})` },
                { id: 'khata', label: `Khata (${customerList.length})` },
                { id: 'expenses', label: `Expenses (${posExpenses.length})` },
              ] as const).map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => setInvoiceSubTab(sub.id)}
                  className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition ${
                    invoiceSubTab === sub.id ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>

            {invoiceSubTab === 'bills' && (
              <div className="space-y-2.5">
                {orders.map((o) => {
                  const canReturn = o.documentType !== 'Estimate' && o.documentType !== 'Credit Note' && o.status !== 'Returned';
                  return (
                    <div key={o.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">{o.id}</span>
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">{o.documentType}</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            o.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : o.status === 'Returned' || o.status === 'Refunded' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                          }`}>{o.status}</span>
                        </div>
                        <div className="text-xs text-slate-600 dark:text-slate-300 truncate">{o.customer}</div>
                        <div className="text-[11px] text-slate-500">
                          {o.date} • {o.itemsCount} item(s) • {o.paymentMethod}
                          {o.orderMode && o.orderMode !== 'Counter' ? ` • ${o.orderMode}${o.tableOrRef ? ` (${o.tableOrRef})` : ''}` : ''}
                          {o.cashierName ? ` • ${o.cashierName}` : ''}
                        </div>
                        {o.dueAmount > 0 && <div className="text-[10px] font-bold text-rose-600">Due: Rs {o.dueAmount.toLocaleString()}</div>}
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`font-extrabold text-sm tabular-nums ${o.total < 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                          Rs {o.total.toLocaleString()}
                        </div>
                        <button
                          onClick={() => {
                            const kotTxt = `KOT SLIP • ${o.id} (${o.orderMode || 'Counter'}${o.tableOrRef ? ` ${o.tableOrRef}` : ''}): ` + o.items.map((i) => `${i.name} x${i.quantity}`).join(', ');
                            navigator.clipboard?.writeText(kotTxt).catch(() => {});
                            showToast(`KOT Packing Slip ready: ${o.items.length} item(s)`);
                          }}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200"
                          title="KOT / Packing Slip"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                        {canReturn && (
                          <button
                            onClick={() => {
                              setReturnOrder(o);
                              const initMap: Record<string, number> = {};
                              o.items.forEach((it) => (initMap[it.id] = 0));
                              setReturnQtyMap(initMap);
                              setRestockOnReturn(true);
                            }}
                            className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 hover:bg-amber-100"
                            title="Return / Refund"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {invoiceSubTab === 'khata' && (
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-rose-600">Total Customer Khata Receivable</div>
                    <div className="text-base font-extrabold text-rose-700 dark:text-rose-300 tabular-nums">Rs {totalReceivables.toLocaleString()}</div>
                  </div>
                  <button
                    onClick={() => {
                      setClientForm({ name: '', phone: '', address: '', partyType: 'CUSTOMER', creditLimit: '50000' });
                      setShowClientModal(true);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> Add Customer
                  </button>
                </div>
                {customerList.map((c) => (
                  <div key={c.id} className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{c.name}</div>
                      <div className="text-[11px] text-slate-500">{c.phone || 'No phone'} • Spend: Rs {c.totalSpent.toLocaleString()} • {c.loyaltyPoints} pts</div>
                      <div className={`text-xs font-extrabold tabular-nums mt-0.5 ${c.creditBalance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {c.creditBalance > 0 ? `Receivable Due: Rs ${c.creditBalance.toLocaleString()}` : 'Khata Clear (Rs 0)'}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {c.creditBalance > 0 && (
                        <button
                          onClick={() => {
                            setKhataSettleTarget(c);
                            setSettleAmount(String(Math.round(c.creditBalance)));
                            setSettleMethod('Cash');
                            setSettleNote('');
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
                        >
                          Collect
                        </button>
                      )}
                      {c.phone && c.creditBalance > 0 && (
                        <button
                          onClick={() => {
                            const msg = `Assalam-o-Alaikum ${c.name}, your pending Khata balance at OmniPOS is Rs ${c.creditBalance.toLocaleString()}. Thank you!`;
                            navigator.clipboard?.writeText(msg).catch(() => {});
                            showToast(`WhatsApp reminder copied for ${c.name}`);
                          }}
                          className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300"
                          title="Copy WhatsApp Khata Reminder"
                        >
                          <Send className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => setKhataHistoryTarget(c)}
                        className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        title="Ledger History"
                      >
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {invoiceSubTab === 'expenses' && (
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-center justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-300">Store Overheads &amp; Petty Cash</div>
                    <div className="text-base font-extrabold text-amber-800 dark:text-amber-200 tabular-nums">Rs {totalExpensesOut.toLocaleString()}</div>
                  </div>
                  <button
                    onClick={() => setShowExpenseModal(true)}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Log Expense
                  </button>
                </div>
                {posExpenses.map((e) => (
                  <div key={e.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{e.title}</div>
                      <div className="text-[10px] text-slate-500">{e.category} • {e.paymentMethod} • {e.date}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`font-extrabold text-xs tabular-nums ${e.category === 'Cash In Top-up' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {e.category === 'Cash In Top-up' ? '+' : '-'}Rs {e.amount.toLocaleString()}
                      </span>
                      <button
                        onClick={() => setPosExpenses((prev) => prev.filter((x) => x.id !== e.id))}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stock' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-1.5 p-1 rounded-xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setStockSubTab('catalog')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition ${
                  stockSubTab === 'catalog' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Catalog &amp; Stock ({products.length})
              </button>
              <button
                onClick={() => setStockSubTab('suppliers')}
                className={`py-1.5 px-2 rounded-lg text-[11px] font-bold transition ${
                  stockSubTab === 'suppliers' ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 shadow-xs' : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Suppliers &amp; GRN ({purchaseOrders.length})
              </button>
            </div>

            {stockSubTab === 'catalog' && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex gap-1.5 flex-wrap">
                    {(['All', 'Low', 'Out', 'Expiring'] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => setStockFilter(f)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                          stockFilter === f ? 'bg-emerald-600 text-white' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        {f === 'All'
                          ? `All (${products.length})`
                          : f === 'Low'
                          ? `Low (${products.filter((p) => p.stock > 0 && p.stock <= p.minStockAlert).length})`
                          : f === 'Out'
                          ? `Out (${products.filter((p) => p.stock <= 0).length})`
                          : `Expiring (${products.filter((p) => getExpiryStatus(p.expiryDate) > 0).length})`}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => setShowLabelsModal(true)} className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5" /> Price Labels
                    </button>
                    <button onClick={openAddProductModal} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" /> Add Item
                    </button>
                  </div>
                </div>
                {products
                  .filter((p) =>
                    stockFilter === 'Out'
                      ? p.stock <= 0
                      : stockFilter === 'Low'
                      ? p.stock > 0 && p.stock <= p.minStockAlert
                      : stockFilter === 'Expiring'
                      ? getExpiryStatus(p.expiryDate) > 0
                      : true
                  )
                  .map((p) => {
                    const margin = p.price > 0 && p.costPrice > 0 ? (((p.price - p.costPrice) / p.price) * 100).toFixed(1) : '0';
                    const expStat = getExpiryStatus(p.expiryDate);
                    return (
                      <div key={p.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{p.name}</div>
                          <div className="text-[11px] text-slate-500">
                            {p.category} • {p.sku || 'No SKU'}{p.batchNumber ? ` • B:${p.batchNumber}` : ''} • Stock: <strong className={p.stock <= p.minStockAlert ? 'text-rose-600' : ''}>{p.stock}</strong>
                          </div>
                          <div className={`text-[10px] font-semibold ${expStat === 2 ? 'text-rose-600' : expStat === 1 ? 'text-amber-600' : 'text-emerald-600'}`}>
                            Cost: Rs {p.costPrice} ({margin}%) {p.wholesalePrice ? `• W/S: Rs ${p.wholesalePrice}` : ''} {p.expiryDate ? `• Exp: ${p.expiryDate}` : ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="font-bold text-xs text-emerald-600 tabular-nums mr-1">Rs {p.price}</span>
                          <button
                            onClick={() => {
                              setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, stock: x.stock + 10 } : x)));
                              showToast(`+10 stock added to ${p.name}`);
                            }}
                            className="px-2 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold"
                          >
                            +10
                          </button>
                          <button onClick={() => openEditProductModal(p)} className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800" title="Edit">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setProducts((prev) => prev.filter((x) => x.id !== p.id))}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}

            {stockSubTab === 'suppliers' && (
              <div className="space-y-2.5">
                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <div className="text-[10px] font-bold uppercase text-slate-500">Supplier Payables Due</div>
                    <div className="text-base font-extrabold text-amber-600 tabular-nums">Rs {totalPayables.toLocaleString()}</div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setClientForm({ name: '', phone: '', address: '', partyType: 'SUPPLIER', creditLimit: '100000' });
                        setShowClientModal(true);
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold"
                    >
                      + Supplier
                    </button>
                    <button
                      onClick={() => {
                        const firstProd = products[0];
                        if (firstProd) {
                          setGrnProductId(firstProd.id);
                          setGrnCost(String(firstProd.costPrice || Math.round(firstProd.price * 0.7)));
                        }
                        if (supplierList[0]) setGrnSupplierId(supplierList[0].id);
                        setShowGrnModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center gap-1"
                    >
                      <Truck className="w-3.5 h-3.5" /> Receive GRN
                    </button>
                  </div>
                </div>
                {supplierList.map((sup) => (
                  <div key={sup.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{sup.name}</div>
                      <div className="text-[10px] text-slate-500">{sup.phone} • Purchased: Rs {sup.totalSpent.toLocaleString()}</div>
                      <div className={`text-xs font-bold tabular-nums ${sup.creditBalance > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {sup.creditBalance > 0 ? `Payable: Rs ${sup.creditBalance.toLocaleString()}` : 'Settled (Rs 0)'}
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      {sup.creditBalance > 0 && (
                        <button
                          onClick={() => {
                            setKhataSettleTarget(sup);
                            setSettleAmount(String(sup.creditBalance));
                            setSettleMethod('Cash');
                            setSettleNote('');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[11px] font-bold"
                        >
                          Pay Due
                        </button>
                      )}
                      <button onClick={() => setKhataHistoryTarget(sup)} className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600">
                        <History className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
                {purchaseOrders.map((po) => (
                  <div key={po.id} className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-bold text-xs">{po.id} • {po.supplierName}</div>
                      <div className="text-[10px] text-slate-500">{po.itemsSummary}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-xs tabular-nums">Rs {po.totalAmount.toLocaleString()}</div>
                      <div className="text-[10px] font-semibold text-amber-600">{po.status}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Net Sales</div>
                <div className="text-base font-extrabold text-emerald-600 tabular-nums">Rs {totalRevenue.toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Real COGS</div>
                <div className="text-base font-extrabold text-slate-800 dark:text-white tabular-nums">Rs {Math.round(totalCogs).toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Gross Profit ({grossMarginPct.toFixed(1)}%)</div>
                <div className="text-base font-extrabold text-blue-600 tabular-nums">Rs {Math.round(grossProfit).toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Store Expenses</div>
                <div className="text-base font-extrabold text-rose-600 tabular-nums">Rs {totalExpensesOut.toLocaleString()}</div>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900">
                <div className="text-[10px] text-emerald-700 dark:text-emerald-300 uppercase font-bold">Net Operating Profit</div>
                <div className={`text-base font-extrabold tabular-nums ${netOperatingProfit >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-600'}`}>
                  Rs {Math.round(netOperatingProfit).toLocaleString()}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Khata Due / Payable</div>
                <div className="text-xs font-extrabold text-amber-600 tabular-nums">
                  Rec: Rs {totalReceivables.toLocaleString()} • Pay: Rs {totalPayables.toLocaleString()}
                </div>
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Z-Report &amp; Real P&amp;L Reconciliation</h3>
              <p className="text-xs text-slate-500">
                Active Operator: <strong>{activeCashier.name}</strong> • Live Expected Drawer Cash: <strong>Rs {Math.round(liveDrawerExpected).toLocaleString()}</strong> • Active Tickets: {activeOrdersForStats.length} • Low Stock SKUs: {products.filter((p) => p.stock <= p.minStockAlert).length}
              </p>
            </div>
          </div>
        )}

        {activeTab === 'staff' && (
          <div className="space-y-2.5">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Cashier Shifts &amp; 4-Digit PIN Switcher</h3>
                <p className="text-xs text-slate-500">Current Operator: <strong>{activeCashier.name}</strong> ({activeCashier.role})</p>
              </div>
              <button
                onClick={() => {
                  setCountedCashInput(Math.round(liveDrawerExpected).toString());
                  setShowRegisterModal(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
              >
                Switch PIN / Till
              </button>
            </div>
            {DEFAULT_POS_STAFF.map((st) => (
              <div key={st.id} className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{st.name}</div>
                  <div className="text-[11px] text-slate-500">{st.role} • PIN: {st.pin}</div>
                </div>
                <button
                  onClick={() => {
                    setActiveCashier(st);
                    showToast(`Switched operator to ${st.name}`);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                    activeCashier.id === st.id ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {activeCashier.id === st.id ? 'Active' : 'Activate'}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'setup' && (
          <div className="space-y-3">
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Receipt Branding, Default Tax &amp; Loyalty</h3>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Default Tax %</label>
                  <input
                    type="number"
                    value={defaultTaxPct}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      setDefaultTaxPct(val);
                      setTaxPct(val);
                    }}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-500">Loyalty Pts / Rs 100</label>
                  <input
                    type="number"
                    value={loyaltyPtsPer100}
                    onChange={(e) => setLoyaltyPtsPer100(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500">Custom Receipt Footer</label>
                <input
                  type="text"
                  value={receiptFooter}
                  onChange={(e) => setReceiptFooter(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
              </div>
              <label className="flex items-center justify-between text-xs font-semibold">
                <span>Auto-kick RJ11 Cash Drawer on thermal print</span>
                <input type="checkbox" checked={autoKickDrawer} onChange={(e) => setAutoKickDrawer(e.target.checked)} />
              </label>
            </div>

            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">Enterprise Cloud/Local Backup (.JSON) &amp; Bulk CSV Catalog</h3>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const snapshot = JSON.stringify({ version: 12, products, clients, orders, khataTx, posExpenses, purchaseOrders }, null, 2);
                    const blob = new Blob([snapshot], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `OmniPOS_Backup_${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast('Exported full store JSON backup');
                  }}
                  className="py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" /> Export .JSON
                </button>
                <button
                  onClick={() => {
                    const rows = [
                      ['id', 'name', 'category', 'price', 'wholesalePrice', 'costPrice', 'stock', 'unit', 'sku', 'barcode', 'batchNumber', 'expiryDate'].join(','),
                      ...products.map((p) =>
                        [p.id, `"${p.name.replace(/"/g, '""')}"`, p.category, p.price, p.wholesalePrice || 0, p.costPrice, p.stock, p.unit, p.sku, p.barcode, p.batchNumber || '', p.expiryDate || ''].join(',')
                      ),
                    ].join('\n');
                    const blob = new Blob([rows], { type: 'text/csv' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `OmniPOS_Catalog_${new Date().toISOString().slice(0, 10)}.csv`;
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast(`Exported ${products.length} SKUs to CSV`);
                  }}
                  className="py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" /> Export CSV Stock
                </button>
              </div>
              <textarea
                rows={2}
                placeholder="Paste JSON backup snapshot here to restore..."
                value={backupJsonInput}
                onChange={(e) => setBackupJsonInput(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[11px] font-mono"
              />
              <button
                onClick={() => {
                  try {
                    const parsed = JSON.parse(backupJsonInput);
                    if (Array.isArray(parsed.products)) setProducts(parsed.products);
                    if (Array.isArray(parsed.clients)) setClients(parsed.clients);
                    if (Array.isArray(parsed.orders)) setOrders(parsed.orders);
                    setBackupJsonInput('');
                    showToast('Backup snapshot restored successfully!');
                  } catch {
                    showToast('Invalid JSON backup payload');
                  }
                }}
                disabled={!backupJsonInput.trim()}
                className="w-full py-2 rounded-xl border border-emerald-600 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-40"
              >
                <Upload className="w-3.5 h-3.5" /> Restore .JSON Snapshot
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Checkout Payment / Split Tender / Change Modal */}
      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">Confirm Payment &amp; Issue</h3>
                <p className="text-[11px] text-slate-500">{customerName}</p>
              </div>
              <button onClick={() => setShowCheckoutModal(false)} className="p-1 text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">NET PAYABLE</span>
              <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-300 tabular-nums">Rs {grandTotal.toFixed(2)}</span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {(['Invoice', 'Receipt', 'Estimate'] as const).map((dt) => (
                <button
                  key={dt}
                  onClick={() => setCheckoutDocType(dt)}
                  className={`py-1.5 rounded-lg text-xs font-bold ${checkoutDocType === dt ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900' : 'bg-slate-100 dark:bg-slate-800 text-slate-600'}`}
                >
                  {dt}
                </button>
              ))}
            </div>
            {checkoutDocType !== 'Estimate' && (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {(['Cash', 'Card POS', 'QR Wallet', 'Split', 'Credit / Khata'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setPayMethod(m)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${payMethod === m ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
                {payMethod === 'Cash' && (
                  <div className="space-y-1.5">
                    <input
                      type="number"
                      value={cashTendered}
                      onChange={(e) => setCashTendered(e.target.value)}
                      placeholder="Cash Tendered"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold"
                    />
                    <div className="flex gap-1.5 overflow-x-auto">
                      {[Math.round(grandTotal), 500, 1000, 2000, 5000].map((amt, i) => (
                        <button key={i} onClick={() => setCashTendered(String(amt))} className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
                          {i === 0 ? 'Exact' : `Rs ${amt}`}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                {payMethod === 'Split' && (
                  <div className="grid grid-cols-3 gap-1.5">
                    <input type="number" value={splitCash} onChange={(e) => setSplitCash(e.target.value)} placeholder="Cash" className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
                    <input type="number" value={splitCard} onChange={(e) => setSplitCard(e.target.value)} placeholder="Card" className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
                    <input type="number" value={splitQr} onChange={(e) => setSplitQr(e.target.value)} placeholder="QR" className="px-2 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
                  </div>
                )}
              </>
            )}
            <button onClick={finalizeCheckout} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs">
              Confirm &amp; Issue Bill
            </button>
          </div>
        </div>
      )}

      {/* Held / Parked Bills Modal */}
      {showHeldModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Parked Bills ({heldBills.length})</h3>
              <button onClick={() => setShowHeldModal(false)}><X className="w-4 h-4" /></button>
            </div>
            {heldBills.length === 0 ? (
              <p className="text-xs text-slate-500">No held bills. Tap Hold icon in the cart to park a bill.</p>
            ) : (
              heldBills.map((b) => (
                <div key={b.id} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs">{b.label}</div>
                    <div className="text-[11px] text-slate-500">{Object.values(b.cart).reduce((s, q) => s + q, 0)} items • {b.heldAt}</div>
                  </div>
                  <button
                    onClick={() => {
                      setCart(b.cart);
                      setSelectedClientId(b.clientId);
                      setDiscountPct(b.discountPct);
                      setTaxPct(b.taxPct);
                      setHeldBills((prev) => prev.filter((x) => x.id !== b.id));
                      setShowHeldModal(false);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-xs font-bold"
                  >
                    Resume
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Cash Drawer & Staff PIN Switch Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-3 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Cash Register &amp; Staff PIN</h3>
              <button onClick={() => setShowRegisterModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex gap-2 items-center">
              <input
                type="password"
                maxLength={6}
                placeholder="Enter 4-digit Staff PIN (0000 / 1234)"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
              />
              <button
                onClick={() => {
                  const found = DEFAULT_POS_STAFF.find((s) => s.pin === pinInput.trim());
                  if (found) {
                    setActiveCashier(found);
                    setPinInput('');
                    showToast(`Operator switched to ${found.name}`);
                  } else {
                    showToast('Invalid PIN (Try 0000, 1234, or 2233)');
                  }
                }}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold"
              >
                Switch
              </button>
            </div>
            {openDrawerSession ? (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 space-y-2">
                <div className="text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  Register Open ({openDrawerSession.openedBy}) • Float Rs {openDrawerSession.openingFloat.toLocaleString()}
                </div>
                <div className="text-xs font-extrabold tabular-nums">Expected Drawer Cash: Rs {Math.round(liveDrawerExpected).toLocaleString()}</div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => {
                      setPosExpenses((prev) => [
                        { id: `IN-${Date.now() % 10000}`, title: 'Drawer Cash In Top-up', category: 'Cash In Top-up', amount: 1000, date: new Date().toLocaleDateString('en-GB'), paymentMethod: 'Cash Drawer', notes: 'Change float' },
                        ...prev,
                      ]);
                      showToast('+Rs 1,000 Cash In logged');
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 text-white text-[11px] font-bold"
                  >
                    +Rs 1,000 In
                  </button>
                  <button
                    onClick={() => {
                      setPosExpenses((prev) => [
                        { id: `OUT-${Date.now() % 10000}`, title: 'Petty Cash Drop', category: 'Petty Cash Out', amount: 500, date: new Date().toLocaleDateString('en-GB'), paymentMethod: 'Cash Drawer', notes: 'Safe drop' },
                        ...prev,
                      ]);
                      showToast('-Rs 500 Petty Cash Out logged');
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-amber-600 text-white text-[11px] font-bold"
                  >
                    -Rs 500 Out
                  </button>
                </div>
                <input
                  type="number"
                  placeholder="Counted Physical Cash (Rs)"
                  value={countedCashInput}
                  onChange={(e) => setCountedCashInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <input
                  type="text"
                  placeholder="Closing remarks (optional)"
                  value={drawerNoteInput}
                  onChange={(e) => setDrawerNoteInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs"
                />
                <button
                  onClick={() => {
                    const counted = Number(countedCashInput) || Math.round(liveDrawerExpected);
                    const variance = counted - Math.round(liveDrawerExpected);
                    setDrawerSessions((prev) =>
                      prev.map((s) =>
                        s.id === openDrawerSession.id
                          ? { ...s, status: 'CLOSED', closedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), expectedCash: Math.round(liveDrawerExpected), countedCash: counted, variance, notes: drawerNoteInput || s.notes }
                          : s
                      )
                    );
                    showToast(`Register closed (Variance: Rs ${variance})`);
                    setShowRegisterModal(false);
                  }}
                  className="w-full py-2 rounded-xl bg-rose-600 text-white text-xs font-bold"
                >
                  Close Shift &amp; Reconcile Till
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <input
                  type="number"
                  placeholder="Opening Float (Rs)"
                  value={floatInput}
                  onChange={(e) => setFloatInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
                />
                <button
                  onClick={() => {
                    setDrawerSessions((prev) => [
                      { id: `DRW-${Date.now() % 1000}`, openedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), openedBy: activeCashier.name, openingFloat: Number(floatInput) || 0, status: 'OPEN', notes: 'Shift Start' },
                      ...prev,
                    ]);
                    showToast(`Drawer opened by ${activeCashier.name}`);
                    setShowRegisterModal(false);
                  }}
                  className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  Open Cash Register
                </button>
              </div>
            )}
            <button
              onClick={() => showToast('⚡ ESC/POS RJ11 Cash Drawer Kick Pulse Dispatched')}
              className="w-full py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold"
            >
              ⚡ Kick RJ11 Hardware Cash Drawer
            </button>
          </div>
        </div>
      )}

      {/* Add Customer / Supplier Modal */}
      {showClientModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-2.5">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Add {clientForm.partyType === 'SUPPLIER' ? 'Supplier' : 'Customer'}</h3>
              <button onClick={() => setShowClientModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <input type="text" placeholder="Full Name / Business" value={clientForm.name} onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
            <input type="text" placeholder="WhatsApp / Phone" value={clientForm.phone} onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
            <input type="text" placeholder="Address" value={clientForm.address} onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
            <input type="number" placeholder="Khata Credit Limit (Rs)" value={clientForm.creditLimit} onChange={(e) => setClientForm({ ...clientForm, creditLimit: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
            <button onClick={handleSaveClient} className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">Save Party</button>
          </div>
        </div>
      )}

      {/* Settle Khata / Pay Supplier Modal */}
      {khataSettleTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-2.5">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">{khataSettleTarget.partyType === 'SUPPLIER' ? 'Pay Supplier' : 'Collect Khata'} — {khataSettleTarget.name}</h3>
              <button onClick={() => setKhataSettleTarget(null)}><X className="w-4 h-4" /></button>
            </div>
            <div className="text-xs font-bold text-rose-600">Current Balance: Rs {khataSettleTarget.creditBalance.toLocaleString()}</div>
            <input type="number" value={settleAmount} onChange={(e) => setSettleAmount(e.target.value)} placeholder="Amount (Rs)" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold" />
            <div className="flex gap-1.5">
              {(['Cash', 'Card POS', 'QR Wallet'] as const).map((m) => (
                <button key={m} onClick={() => setSettleMethod(m)} className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold ${settleMethod === m ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{m}</button>
              ))}
            </div>
            <input type="text" value={settleNote} onChange={(e) => setSettleNote(e.target.value)} placeholder="Receipt note" className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
            <button onClick={handleConfirmKhataSettle} className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">Confirm Settlement</button>
          </div>
        </div>
      )}

      {/* Khata History Modal */}
      {khataHistoryTarget && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-2.5">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Ledger: {khataHistoryTarget.name}</h3>
              <button onClick={() => setKhataHistoryTarget(null)}><X className="w-4 h-4" /></button>
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1.5">
              {khataTx.filter((t) => t.clientId === khataHistoryTarget.id).length === 0 ? (
                <p className="text-xs text-slate-500">No ledger entries yet.</p>
              ) : (
                khataTx
                  .filter((t) => t.clientId === khataHistoryTarget.id)
                  .map((t) => (
                    <div key={t.id} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 flex justify-between items-center">
                      <div>
                        <div className="font-bold text-xs">{t.type} ({t.referenceId})</div>
                        <div className="text-[10px] text-slate-500">{t.date} • {t.paymentMethod}</div>
                      </div>
                      <span className={`font-extrabold text-xs tabular-nums ${t.type === 'Credit Sale' || t.type === 'Supplier Purchase' ? 'text-rose-600' : 'text-emerald-600'}`}>
                        Rs {t.amount.toLocaleString()}
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Receive Supplier GRN Modal */}
      {showGrnModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-2.5">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Receive Purchase Stock (GRN)</h3>
              <button onClick={() => setShowGrnModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <select value={grnSupplierId} onChange={(e) => setGrnSupplierId(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs">
              {supplierList.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select
              value={grnProductId}
              onChange={(e) => {
                setGrnProductId(e.target.value);
                const p = products.find((x) => x.id === e.target.value);
                if (p) setGrnCost(String(p.costPrice || Math.round(p.price * 0.7)));
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            >
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} (Stock: {p.stock})</option>)}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Qty" value={grnQty} onChange={(e) => setGrnQty(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
              <input type="number" placeholder="Unit Cost (Rs)" value={grnCost} onChange={(e) => setGrnCost(e.target.value)} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
            </div>
            <input type="number" placeholder={`Paid Now (Total Rs ${(Number(grnQty) || 0) * (Number(grnCost) || 0)})`} value={grnPaidNow} onChange={(e) => setGrnPaidNow(e.target.value)} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
            <button onClick={handleConfirmGrn} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold">Post GRN &amp; Update Stock</button>
          </div>
        </div>
      )}

      {/* Log Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-2.5">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Log Store Expense</h3>
              <button onClick={() => setShowExpenseModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {['Rent', 'Utilities', 'Supplies', 'Petty Cash Out', 'Cash In Top-up'].map((cat) => (
                <button key={cat} onClick={() => setExpenseForm({ ...expenseForm, category: cat })} className={`px-2 py-1 rounded-lg text-[10px] font-bold ${expenseForm.category === cat ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}>{cat}</button>
              ))}
            </div>
            <input type="text" placeholder="Expense Title" value={expenseForm.title} onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
            <input type="number" placeholder="Amount (Rs)" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
            <button onClick={handleSaveExpense} className="w-full py-2 rounded-xl bg-rose-600 text-white text-xs font-bold">Save Entry</button>
          </div>
        </div>
      )}

      {/* Barcode Scan Input Modal */}
      {showScannerModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Scan / Enter Barcode</h3>
              <button onClick={() => setShowScannerModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <input
              type="text"
              value={scanCodeInput}
              onChange={(e) => setScanCodeInput(e.target.value)}
              placeholder="e.g. 8964001230011 or PHM-001"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs"
            />
            <div className="flex gap-1.5 flex-wrap">
              {products.slice(0, 3).map((p) => (
                <button key={p.id} onClick={() => handleBarcodeLookup(p.barcode || p.sku)} className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-[10px] font-mono">
                  Test: {p.sku}
                </button>
              ))}
            </div>
            <button onClick={() => scanCodeInput.trim() && handleBarcodeLookup(scanCodeInput)} className="w-full py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold">
              Match &amp; Add to Cart
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-2.5">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">{editingProd ? 'Edit Catalog Item' : 'Add Catalog Item'}</h3>
              <button onClick={() => setShowProductModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <input type="text" placeholder="Item Name" value={prodForm.name} onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })} className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Category" value={prodForm.category} onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
              <input type="text" placeholder="Unit (Box/Piece)" value={prodForm.unit} onChange={(e) => setProdForm({ ...prodForm, unit: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input type="number" placeholder="Retail (Rs)" value={prodForm.price} onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })} className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
              <input type="number" placeholder="Wholesale (Rs)" value={prodForm.wholesalePrice} onChange={(e) => setProdForm({ ...prodForm, wholesalePrice: e.target.value })} className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
              <input type="number" placeholder="Cost (Rs)" value={prodForm.costPrice} onChange={(e) => setProdForm({ ...prodForm, costPrice: e.target.value })} className="px-2.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="number" placeholder="Stock Qty" value={prodForm.stock} onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
              <input type="number" placeholder="Low Stock Alert" value={prodForm.minStockAlert} onChange={(e) => setProdForm({ ...prodForm, minStockAlert: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="Batch / Lot #" value={prodForm.batchNumber} onChange={(e) => setProdForm({ ...prodForm, batchNumber: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
              <input type="date" placeholder="Expiry Date" value={prodForm.expiryDate} onChange={(e) => setProdForm({ ...prodForm, expiryDate: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input type="text" placeholder="SKU Code" value={prodForm.sku} onChange={(e) => setProdForm({ ...prodForm, sku: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
              <input type="text" placeholder="Barcode / EAN-13" value={prodForm.barcode} onChange={(e) => setProdForm({ ...prodForm, barcode: e.target.value })} className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs" />
            </div>
            <button onClick={saveProductModal} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold">
              {editingProd ? 'Save Changes' : 'Add Product'}
            </button>
          </div>
        </div>
      )}

      {/* Price Labels / Barcode Shelf Stickers Sheet Modal */}
      {showLabelsModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-3 max-h-[88vh] overflow-y-auto">
            <div className="flex justify-between items-center no-print">
              <h3 className="font-bold text-sm">Barcode Price-Tag Labels ({products.length} SKUs)</h3>
              <button onClick={() => setShowLabelsModal(false)}><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {products.map((p) => (
                <div key={p.id} className="p-2.5 rounded-lg border border-dashed border-slate-400 text-center space-y-1 bg-white text-slate-900">
                  <div className="text-[10px] font-bold truncate">{p.name}</div>
                  <div className="text-sm font-extrabold text-emerald-700">Rs {p.price}</div>
                  {p.batchNumber && <div className="text-[9px] text-slate-500">B:{p.batchNumber} {p.expiryDate ? `• ${p.expiryDate}` : ''}</div>}
                  <div className="h-5 w-full bg-[repeating-linear-gradient(90deg,#111_0px,#111_2px,transparent_2px,transparent_4px)]" />
                  <div className="text-[9px] font-mono">{p.barcode || p.sku}</div>
                </div>
              ))}
            </div>
            <button onClick={() => window.print()} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 no-print">
              <Printer className="w-4 h-4" /> Print A4 Shelf Sticker Sheet
            </button>
          </div>
        </div>
      )}

      {/* Return & Refund Modal */}
      {returnOrder && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-sm">Return / Refund {returnOrder.id}</h3>
              <button onClick={() => setReturnOrder(null)}><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-2 max-h-56 overflow-y-auto">
              {returnOrder.items.map((it) => {
                const maxRet = Math.max(0, it.quantity - it.returnedQty);
                const val = returnQtyMap[it.id] || 0;
                return (
                  <div key={it.id} className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-xs">{it.name}</div>
                      <div className="text-[10px] text-slate-500">Sold: {it.quantity} • Returned: {it.returnedQty} • Rs {it.price}</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => setReturnQtyMap({ ...returnQtyMap, [it.id]: Math.max(0, val - 1) })} className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-700 font-bold">-</button>
                      <span className="text-xs font-bold w-4 text-center">{val}</span>
                      <button onClick={() => setReturnQtyMap({ ...returnQtyMap, [it.id]: Math.min(maxRet, val + 1) })} className="w-6 h-6 rounded bg-amber-600 text-white font-bold">+</button>
                    </div>
                  </div>
                );
              })}
            </div>
            <label className="flex items-center justify-between text-xs font-medium">
              <span>Restock returned items to inventory</span>
              <input type="checkbox" checked={restockOnReturn} onChange={(e) => setRestockOnReturn(e.target.checked)} />
            </label>
            <button onClick={confirmReturnOrder} className="w-full py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold">
              Issue Credit Note &amp; Refund
            </button>
          </div>
        </div>
      )}

      {/* Dedicated 6-Tab OmniPOS Footer Navigation Bar */}
      <nav aria-label="OmniPOS Footer Navigation" className="sticky bottom-0 z-30 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 grid grid-cols-6 h-16 px-1 no-print">
        {posNav.map((tab) => {
          const IconComp = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center gap-1 min-h-11 rounded-xl transition"
            >
              <div className={`px-2.5 py-1 rounded-full ${active ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400'}`}>
                <IconComp className="w-4 h-4" />
              </div>
              <span className={`text-[10px] font-semibold ${active ? 'text-emerald-700 dark:text-emerald-300 font-bold' : 'text-slate-500 dark:text-slate-400'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
