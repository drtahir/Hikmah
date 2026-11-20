export type ScreenType =
  | 'Dashboard'
  | 'ExpenseTracker'
  | 'IncomeTracker'
  | 'UtilityBills'
  | 'ZakatCalculator'
  | 'BcCommittee'
  | 'LoanTracker'
  | 'SavingsGoals'
  | 'FinanceReportAndBackup'
  | 'CvBuilder'
  | 'InvoiceGenerator'
  | 'DutyRotaCreator'
  | 'HospitalClerkAdmin'
  | 'IdCardScanner'
  | 'AssignmentOcrStudio'
  | 'SignaturePad'
  | 'Calculator'
  | 'UnitConverter'
  | 'QrGenerator'
  | 'BarcodeGenerator'
  | 'PasswordManager'
  | 'AgeCalculator'
  | 'Steganography'
  | 'Teleprompter'
  | 'Notes'
  | 'StudyTimer'
  | 'Timetable'
  | 'BmiCalculator'
  | 'GpaCalculator'
  | 'IvCalculator'
  | 'DosageCalculator'
  | 'GfrCalculator'
  | 'AnatomyAtlas'
  | 'PharmacyExam'
  | 'NursingExam'
  | 'HajjMedicalPrep'
  | 'IslamicHub'
  | 'ManzilBook'
  | 'HisnulMuslim'
  | 'QuranMajeed'
  | 'About'
  | 'Settings';

export interface UserProfile {
  name: string;
  occupation?: string;
  email: string;
  phone: string;
  city?: string;
  institution?: string;
  department?: string;
  registrationNumber?: string;
  hijriOffset: number;
  darkTheme: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  note?: string;
  isRecurring?: number;
}

export interface Income {
  id: string;
  title: string;
  amount: number;
  source: string;
  date: string;
  note?: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
  isPaid: number;
  category: string;
  isRecurring?: number;
}

export interface BcCommittee {
  id: string;
  name: string;
  amountPerHead: number;
  totalMembers: number;
  startDate: string;
  frequency: string;
  members: BcMember[];
}

export interface BcMember {
  id: string;
  committeeId: string;
  name: string;
  phone?: string;
  payoutPosition: number;
  hasReceived: number;
  paidMonths: string[];
}

export interface Loan {
  id: string;
  personName: string;
  amount: number;
  type: 'I Lent' | 'I Borrowed';
  date: string;
  dueDate?: string;
  isSettled: number;
  note?: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  color?: string;
}

export interface NoteEntry {
  id: string;
  title: string;
  content: string;
  category?: string;
  createdAt?: string;
  updatedAt: string;
  isPinned?: number;
}

export interface TimetableEntry {
  id: string;
  subject: string;
  teacher?: string;
  room?: string;
  dayOfWeek?: number;
  day?: string;
  time?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  color?: string;
}

export interface PasswordEntry {
  id: string;
  title: string;
  username: string;
  passwordEncrypted?: string;
  password?: string;
  category: string;
  website?: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface QuestionItem {
  id: string | number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category?: string;
}

export interface AnatomyPart {
  name: string;
  scientificName: string;
  description: string;
  clinicalNotes: string;
  drugTargetNotes: string;
  funFact: string;
}

export interface AnatomySystem {
  id: string;
  name: string;
  image: string;
  themeColor: string;
  overview: string;
  parts: AnatomyPart[];
}

export interface SurahMeta {
  number: number;
  englishName: string;
  englishNameTranslation: string;
  arabicName: string;
  numberOfAyahs: number;
  revelationType: string;
  startPage?: number;
}
