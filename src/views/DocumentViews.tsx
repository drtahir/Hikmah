import React, { useState, useRef } from 'react';
import {
  FileText, Download, Printer, Plus, Trash2,
  Calendar, Building2, User, Phone, Mail, Award,
  CheckCircle, RefreshCw
} from 'lucide-react';
import { StorageService } from '../services/storage';

interface DocumentViewsProps {
  onBack: () => void;
  showToast: (msg: string) => void;
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

// 4. Digital Invoice & Fee Receipt Generator
export const InvoiceGeneratorView: React.FC<DocumentViewsProps> = ({ onBack, showToast }) => {
  const [invoiceNo, setInvoiceNo] = useState('INV-2025-089');
  const [clientName, setClientName] = useState('Dr. Muhammad Tahir Clinical Services');
  const [patientName, setPatientName] = useState('Ahmadullah Khan (Cat-D Buner)');
  const [items, setItems] = useState([
    { description: 'Specialist Medical Consultation (General OPD)', qty: 1, rate: 1000 },
    { description: 'ECG 12-Lead Diagnostic & Interpretation', qty: 1, rate: 800 },
    { description: 'Random Blood Sugar (Glucometer Strip)', qty: 1, rate: 150 },
    { description: 'Emergency Wound Dressing & Suturing Kit', qty: 1, rate: 650 }
  ]);

  const addItem = () => {
    setItems([...items, { description: 'New Service / Test', qty: 1, rate: 500 }]);
  };

  const removeItem = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const total = items.reduce((acc, it) => acc + it.qty * it.rate, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-emerald-600" />
            Medical Fee & Invoice Generator
          </h2>
          <p className="text-sm text-slate-500">Create itemized receipts, diagnostic fee invoices, and pharmacy slips</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-sm transition"
        >
          <Printer className="w-4 h-4" />
          Print Invoice
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-4 print:hidden">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
            <h3 className="font-bold text-slate-800 dark:text-white text-sm">Invoice Configuration</h3>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Invoice / Receipt #</label>
              <input
                type="text"
                value={invoiceNo}
                onChange={(e) => setInvoiceNo(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 block mb-1">Patient / Client Name</label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
              />
            </div>
            <div className="pt-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Bill Items</span>
                <button onClick={addItem} className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>
              {items.map((it, idx) => (
                <div key={idx} className="flex gap-2 items-center mb-2">
                  <input
                    type="text"
                    value={it.description}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].description = e.target.value;
                      setItems(updated);
                    }}
                    className="flex-1 px-2 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <input
                    type="number"
                    value={it.qty}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].qty = Number(e.target.value) || 1;
                      setItems(updated);
                    }}
                    className="w-12 px-1 py-1 text-xs text-center rounded border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <input
                    type="number"
                    value={it.rate}
                    onChange={(e) => {
                      const updated = [...items];
                      updated[idx].rate = Number(e.target.value) || 0;
                      setItems(updated);
                    }}
                    className="w-20 px-2 py-1 text-xs text-right rounded border border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                  />
                  <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Invoice View */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-lg min-h-[600px] text-slate-900 dark:text-slate-100 print:shadow-none print:border-none print:p-0">
          <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-5 mb-5">
            <div>
              <h1 className="text-xl font-black text-emerald-700 dark:text-emerald-400">CLINICAL RECEIPT</h1>
              <p className="text-xs text-slate-500 font-semibold">{clientName}</p>
              <p className="text-[11px] text-slate-400">Pacha Kalay, Buner, Khyber Pakhtunkhwa</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-bold">Invoice: {invoiceNo}</p>
              <p className="text-slate-500">Date: {new Date().toLocaleDateString('en-GB')}</p>
            </div>
          </div>

          <div className="mb-6 text-xs">
            <span className="text-slate-400 block font-semibold">Billed To Patient:</span>
            <span className="font-bold text-sm text-slate-800 dark:text-slate-200">{patientName}</span>
          </div>

          <table className="w-full text-xs border-collapse mb-6">
            <thead>
              <tr className="border-b-2 border-slate-300 dark:border-slate-700 text-left font-bold text-slate-600 dark:text-slate-400">
                <th className="py-2">Description</th>
                <th className="py-2 text-center">Qty</th>
                <th className="py-2 text-right">Rate (PKR)</th>
                <th className="py-2 text-right">Amount (PKR)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-2.5 font-medium">{it.description}</td>
                  <td className="py-2.5 text-center">{it.qty}</td>
                  <td className="py-2.5 text-right">{it.rate.toLocaleString()}</td>
                  <td className="py-2.5 text-right font-bold">{(it.qty * it.rate).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end pt-4 border-t-2 border-slate-300 dark:border-slate-700">
            <div className="w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span>PKR {total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Hospital Discount:</span>
                <span>PKR 0</span>
              </div>
              <div className="flex justify-between text-base font-black text-emerald-700 dark:text-emerald-400 pt-2 border-t border-slate-200 dark:border-slate-800">
                <span>Total Due:</span>
                <span>PKR {total.toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="mt-14 pt-4 border-t border-dashed border-slate-300 dark:border-slate-800 text-[11px] text-slate-400 text-center">
            Thank you for trusting Cat-D Hospital Pacha Kalay Buner Healthcare Services. Computer generated receipt.
          </div>
        </div>
      </div>
    </div>
  );
};
