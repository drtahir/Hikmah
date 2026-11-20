import {
  Expense,
  Income,
  Bill,
  BcCommittee,
  Loan,
  SavingsGoal,
  NoteEntry,
  TimetableEntry,
  PasswordEntry,
  UserProfile
} from '../types';

const defaultProfile: UserProfile = {
  name: 'Dr. Tahir Khan',
  occupation: 'Medical Superintendent (MS)',
  email: 'ms.catdpachakalay@healthkp.gov.pk',
  phone: '0939-510000',
  city: 'Pacha Kalay, Buner, KP',
  hijriOffset: 1,
  darkTheme: false
};

const defaultExpenses: Expense[] = [
  { id: 'exp-1', title: 'Hospital Surgical Gauze & Disposables', amount: 14500, category: 'Medical Supplies', date: '2026-10-28', note: 'Procured for Emergency & OPD' },
  { id: 'exp-2', title: 'Solar Inverter Battery Water & Maintenance', amount: 3200, category: 'Utilities', date: '2026-10-25', note: 'Hospital Admin Block backup' },
  { id: 'exp-3', title: 'Department Stationary & Printer Toner', amount: 4800, category: 'Office Supplies', date: '2026-10-20', note: 'Clerical OPD registers' },
  { id: 'exp-4', title: 'Fuel for Hospital Generator', amount: 18000, category: 'Fuel', date: '2026-10-15', note: 'Emergency standby' }
];

const defaultIncome: Income[] = [
  { id: 'inc-1', title: 'Health Department Govt KP Monthly Salary', amount: 245000, source: 'Government Salary', date: '2026-10-01', note: 'Direct Credit' },
  { id: 'inc-2', title: 'Consultancy & Evening Clinic OPD', amount: 78000, source: 'Private Clinic', date: '2026-10-15', note: 'Buner Clinical Practice' },
  { id: 'inc-3', title: 'Medical Research & Faculty Honorarium', amount: 35000, source: 'Honorarium', date: '2026-10-22', note: 'Nursing College Visiting Lecture' }
];

const defaultBills: Bill[] = [
  { id: 'bill-1', name: 'WAPDA PESCO Electricity Bill', amount: 24800, dueDate: '2026-11-10', isPaid: 0, category: 'Electricity' },
  { id: 'bill-2', name: 'Sui Northern Gas Pipeline (SNGPL)', amount: 4200, dueDate: '2026-11-12', isPaid: 0, category: 'Gas' },
  { id: 'bill-3', name: 'PTCL Optical Fiber Broadband (Cat-D MS Office)', amount: 3500, dueDate: '2026-11-05', isPaid: 1, category: 'Internet' },
  { id: 'bill-4', name: 'District Water Supply & Sanitation Board', amount: 1800, dueDate: '2026-11-18', isPaid: 0, category: 'Water' }
];

const defaultCommittees: BcCommittee[] = [
  {
    id: 'bc-1',
    name: 'Hospital Doctors Welfare Committee (10 Lakh)',
    amountPerHead: 50000,
    totalMembers: 20,
    startDate: '2026-01-01',
    frequency: 'Monthly',
    members: [
      { id: 'm-1', committeeId: 'bc-1', name: 'Dr. Tahir Khan (MS)', payoutPosition: 1, hasReceived: 1, paidMonths: ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'] },
      { id: 'm-2', committeeId: 'bc-1', name: 'Dr. SaadUllah', payoutPosition: 2, hasReceived: 1, paidMonths: ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'] },
      { id: 'm-3', committeeId: 'bc-1', name: 'Dr. Harinder Kumar', payoutPosition: 3, hasReceived: 1, paidMonths: ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'] },
      { id: 'm-4', committeeId: 'bc-1', name: 'Dr. Jehan Said', payoutPosition: 4, hasReceived: 0, paidMonths: ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10'] },
      { id: 'm-5', committeeId: 'bc-1', name: 'Dr. Ahmad Ghani', payoutPosition: 5, hasReceived: 0, paidMonths: ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'] },
      { id: 'm-6', committeeId: 'bc-1', name: 'Dr. Akhtar Khan', payoutPosition: 6, hasReceived: 0, paidMonths: ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08'] }
    ]
  }
];

const defaultLoans: Loan[] = [
  { id: 'loan-1', personName: 'Pharmacist Tariq Mahmood', amount: 30000, type: 'I Lent', date: '2026-09-15', dueDate: '2026-11-15', isSettled: 0, note: 'Emergency medicine procurement loan' },
  { id: 'loan-2', personName: 'Lab Tech Shah Faisal', amount: 15000, type: 'I Lent', date: '2026-08-10', dueDate: '2026-10-10', isSettled: 1, note: 'Settled via cash transfer' },
  { id: 'loan-3', personName: 'Medical Equipment Supplier (Peshawar)', amount: 50000, type: 'I Borrowed', date: '2026-10-05', dueDate: '2026-12-05', isSettled: 0, note: 'Advance invoice payment' }
];

const defaultSavings: SavingsGoal[] = [
  { id: 'save-1', title: 'Hajj Mubarak Pilgrimage Fund', targetAmount: 1200000, currentAmount: 950000, targetDate: '2027-05-01', color: '#059669' },
  { id: 'save-2', title: 'Emergency Hospital Medical Aid Reserve', targetAmount: 500000, currentAmount: 340000, targetDate: '2027-01-01', color: '#0284c7' },
  { id: 'save-3', title: 'Children Higher Education Endowment', targetAmount: 2000000, currentAmount: 1100000, targetDate: '2028-09-01', color: '#7c3aed' }
];

const defaultNotes: NoteEntry[] = [
  { id: 'note-1', title: 'Cat-D Hospital Morning Round Protocols', content: '1. Review ICU vitals and Oxygen pressure manifold.\n2. Confirm duty roster presence for Pediatric & Gynecology ward.\n3. Check emergency drug stock including Atropine, Adrenaline, IV Ceftriaxone.', category: 'Clinical', createdAt: '2026-10-25', updatedAt: '2026-10-25', isPinned: 1 },
  { id: 'note-2', title: 'KPK Health Department Annual Inspection Checklist', content: 'Bio-waste disposal incinerator log, Attendance biometric records, Fire extinguisher servicing certificates, Blood bank cross-match reagents inventory.', category: 'Administration', createdAt: '2026-10-27', updatedAt: '2026-10-27', isPinned: 1 }
];

const defaultTimetable: TimetableEntry[] = [
  { id: 'tt-1', subject: 'Ward Rounds & Handover', teacher: 'Dr. Tahir Khan (MS)', room: 'Main Inpatient Ward', dayOfWeek: 1, startTime: '08:00', endTime: '09:30', color: '#0284c7' },
  { id: 'tt-2', subject: 'General & Pediatric OPD', teacher: 'Dr. Tahir Khan & Dr. SaadUllah', room: 'OPD Room #4', dayOfWeek: 1, startTime: '09:30', endTime: '13:00', color: '#059669' },
  { id: 'tt-3', subject: 'Administrative Office & Dispatches', teacher: 'Medical Superintendent Office', room: 'Admin Block', dayOfWeek: 1, startTime: '13:30', endTime: '15:30', color: '#d97706' },
  { id: 'tt-4', subject: 'Clinical Nursing Lecture: Pharmacology', teacher: 'Dr. Tahir Khan', room: 'Auditorium', dayOfWeek: 2, startTime: '11:00', endTime: '12:30', color: '#7c3aed' },
  { id: 'tt-5', subject: 'Emergency Triage & Casualty Supervision', teacher: 'ER Team', room: 'Emergency Dept', dayOfWeek: 3, startTime: '10:00', endTime: '13:00', color: '#dc2626' }
];

export const StorageService = {
  getProfile: (): UserProfile => {
    try {
      const data = localStorage.getItem('hikmah_profile');
      return data ? JSON.parse(data) : defaultProfile;
    } catch {
      return defaultProfile;
    }
  },
  saveProfile: (p: UserProfile) => {
    localStorage.setItem('hikmah_profile', JSON.stringify(p));
  },
  getUserProfile: (): UserProfile => StorageService.getProfile(),
  saveUserProfile: (p: UserProfile) => StorageService.saveProfile(p),

  getHijriOffset: (): number => {
    return StorageService.getProfile().hijriOffset || 0;
  },
  saveHijriOffset: (offset: number) => {
    const p = StorageService.getProfile();
    p.hijriOffset = offset;
    StorageService.saveProfile(p);
  },

  getExpenses: (): Expense[] => {
    try {
      const data = localStorage.getItem('hikmah_expenses');
      return data ? JSON.parse(data) : defaultExpenses;
    } catch {
      return defaultExpenses;
    }
  },
  saveExpenses: (list: Expense[]) => {
    localStorage.setItem('hikmah_expenses', JSON.stringify(list));
  },

  getIncome: (): Income[] => {
    try {
      const data = localStorage.getItem('hikmah_income');
      return data ? JSON.parse(data) : defaultIncome;
    } catch {
      return defaultIncome;
    }
  },
  saveIncome: (list: Income[]) => {
    localStorage.setItem('hikmah_income', JSON.stringify(list));
  },

  getBills: (): Bill[] => {
    try {
      const data = localStorage.getItem('hikmah_bills');
      return data ? JSON.parse(data) : defaultBills;
    } catch {
      return defaultBills;
    }
  },
  saveBills: (list: Bill[]) => {
    localStorage.setItem('hikmah_bills', JSON.stringify(list));
  },

  getCommittees: (): BcCommittee[] => {
    try {
      const data = localStorage.getItem('hikmah_committees');
      return data ? JSON.parse(data) : defaultCommittees;
    } catch {
      return defaultCommittees;
    }
  },
  saveCommittees: (list: BcCommittee[]) => {
    localStorage.setItem('hikmah_committees', JSON.stringify(list));
  },

  getLoans: (): Loan[] => {
    try {
      const data = localStorage.getItem('hikmah_loans');
      return data ? JSON.parse(data) : defaultLoans;
    } catch {
      return defaultLoans;
    }
  },
  saveLoans: (list: Loan[]) => {
    localStorage.setItem('hikmah_loans', JSON.stringify(list));
  },

  getSavings: (): SavingsGoal[] => {
    try {
      const data = localStorage.getItem('hikmah_savings');
      return data ? JSON.parse(data) : defaultSavings;
    } catch {
      return defaultSavings;
    }
  },
  saveSavings: (list: SavingsGoal[]) => {
    localStorage.setItem('hikmah_savings', JSON.stringify(list));
  },

  getNotes: (): NoteEntry[] => {
    try {
      const data = localStorage.getItem('hikmah_notes');
      return data ? JSON.parse(data) : defaultNotes;
    } catch {
      return defaultNotes;
    }
  },
  saveNotes: (list: NoteEntry[]) => {
    localStorage.setItem('hikmah_notes', JSON.stringify(list));
  },
  saveNote: (n: NoteEntry) => {
    const list = StorageService.getNotes();
    const updated = [n, ...list.filter(item => item.id !== n.id)];
    StorageService.saveNotes(updated);
  },
  deleteNote: (id: string) => {
    const list = StorageService.getNotes();
    StorageService.saveNotes(list.filter(item => item.id !== id));
  },

  getTimetable: (): TimetableEntry[] => {
    try {
      const data = localStorage.getItem('hikmah_timetable');
      return data ? JSON.parse(data) : defaultTimetable;
    } catch {
      return defaultTimetable;
    }
  },
  saveTimetable: (list: TimetableEntry[]) => {
    localStorage.setItem('hikmah_timetable', JSON.stringify(list));
  },
  saveTimetableEntry: (entry: TimetableEntry) => {
    const list = StorageService.getTimetable();
    const updated = [entry, ...list.filter(item => item.id !== entry.id)];
    StorageService.saveTimetable(updated);
  },
  deleteTimetableEntry: (id: string) => {
    const list = StorageService.getTimetable();
    StorageService.saveTimetable(list.filter(item => item.id !== id));
  },

  getPasswords: (): PasswordEntry[] => {
    try {
      const data = localStorage.getItem('hikmah_passwords');
      return data ? JSON.parse(data) : [
        { id: 'pw-1', title: 'Health KP HRMIS Portal', username: 'dr.tahir.buneri', passwordEncrypted: 'KpkHealth#2026!Sec', category: 'Government', website: 'hrmis.healthkp.gov.pk', createdAt: '2026-09-01' },
        { id: 'pw-2', title: 'Hospital PESCO Electricity Portal', username: 'pesco_buner_catd', passwordEncrypted: 'CatDBuner@786', category: 'Utilities', website: 'pesco.gov.pk', createdAt: '2026-09-15' }
      ];
    } catch {
      return [];
    }
  },
  savePasswords: (list: PasswordEntry[]) => {
    localStorage.setItem('hikmah_passwords', JSON.stringify(list));
  },
  savePassword: (pw: any) => {
    const list = StorageService.getPasswords();
    const updated = [pw, ...list.filter(p => p.id !== pw.id)];
    StorageService.savePasswords(updated);
  },
  deletePassword: (id: string) => {
    const list = StorageService.getPasswords();
    StorageService.savePasswords(list.filter(p => p.id !== id));
  }
};
