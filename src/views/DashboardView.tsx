import React, { useState } from 'react';
import { ScreenType, Expense, Income, Bill, Loan } from '../types';
import {
  TrendingDown,
  TrendingUp,
  Receipt,
  Landmark,
  Users,
  ArrowRightLeft,
  Target,
  FileText,
  CreditCard,
  Camera,
  PenTool,
  Printer,
  Table,
  Building2,
  Stethoscope,
  FileCheck,
  Calculator,
  Shuffle,
  QrCode,
  Barcode,
  Clock,
  KeyRound,
  Binary,
  Video,
  BookMarked,
  Timer,
  Calendar,
  Activity,
  GraduationCap,
  Droplet,
  Microscope,
  HeartPulse,
  Award,
  Compass,
  BookOpen,
  Scroll,
  Sparkles,
  Search,
  Pill
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (screen: ScreenType) => void;
  expenses: Expense[];
  income: Income[];
  bills: Bill[];
  loans: Loan[];
  searchQuery: string;
}

interface ToolCardItem {
  id: string;
  title: string;
  description: string;
  category: 'Finance' | 'Documents' | 'Medical' | 'Islamic' | 'Utilities' | 'Study';
  screen: ScreenType;
  icon: React.ElementType;
  color: string;
  badge?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  expenses,
  income,
  bills,
  loans,
  searchQuery
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const totalIncome = income.reduce((sum, item) => sum + item.amount, 0);
  const unpaidBillsCount = bills.filter((b) => !b.isPaid).length;
  const netSavings = totalIncome - totalExpense;

  const tools: ToolCardItem[] = [
    // 🕌 Finance
    { id: 'expense', title: 'Expense Tracker', description: 'Log & categorize daily cash outflows with receipt notes', category: 'Finance', screen: 'ExpenseTracker', icon: TrendingDown, color: 'from-rose-500 to-red-600', badge: 'SQLITE' },
    { id: 'income', title: 'Income Tracker', description: 'Monitor salary, clinic earnings & freelancing streams', category: 'Finance', screen: 'IncomeTracker', icon: TrendingUp, color: 'from-emerald-500 to-green-600', badge: 'REVENUE' },
    { id: 'bills', title: 'Utility Bills', description: 'Reminders & logs for WAPDA, Sui Gas, Internet & Water', category: 'Finance', screen: 'UtilityBills', icon: Receipt, color: 'from-blue-500 to-indigo-600', badge: `${unpaidBillsCount} DUE` },
    { id: 'zakat', title: 'Zakat Calculator', description: 'Accurate wealth Zakat calculation for Gold, Silver & Cash', category: 'Finance', screen: 'ZakatCalculator', icon: Landmark, color: 'from-teal-500 to-emerald-600', badge: '2.5% NISAB' },
    { id: 'committee', title: 'BC Kommittees', description: 'Monthly lucky draw simulator & Kameti member payout tracker', category: 'Finance', screen: 'BcCommittee', icon: Users, color: 'from-purple-500 to-violet-600', badge: 'DRAWS' },
    { id: 'loans', title: 'Loan Ledger', description: 'Track borrowed funds and loans lent with due dates', category: 'Finance', screen: 'LoanTracker', icon: ArrowRightLeft, color: 'from-amber-500 to-orange-600', badge: 'LEDGER' },
    { id: 'savings', title: 'Savings Goals', description: 'Target funds, deposits tracking & visual progress bars', category: 'Finance', screen: 'SavingsGoals', icon: Target, color: 'from-cyan-500 to-blue-600', badge: 'GOALS' },
    { id: 'fin_backup', title: 'Finance Report & Backup', description: 'Export complete accounts & balance statement in JSON', category: 'Finance', screen: 'FinanceReportAndBackup', icon: CreditCard, color: 'from-slate-600 to-slate-800', badge: 'BACKUP' },

    // 📄 Documents & Hospital Administration
    { id: 'cv_builder', title: 'CV Resume Builder', description: 'Create custom print-ready A4 PDF resumes with templates', category: 'Documents', screen: 'CvBuilder', icon: FileText, color: 'from-green-600 to-emerald-700', badge: 'A4 PRINT' },
    { id: 'invoice_gen', title: 'Invoice Maker', description: 'Professional printable PDF invoices with taxes & terms', category: 'Documents', screen: 'InvoiceGenerator', icon: Printer, color: 'from-sky-600 to-blue-700', badge: 'PDF EXPORT' },
    { id: 'duty_rota', title: 'Duty Rota Creator', description: 'Official hospital OPD & ER shift rosters with MS stamp', category: 'Documents', screen: 'DutyRotaCreator', icon: Table, color: 'from-indigo-600 to-blue-800', badge: 'WORD DOCX' },
    { id: 'hospital_clerk', title: 'Hospital Clerk & MS Kit', description: 'Official office orders, show causes, transfers & letters', category: 'Documents', screen: 'HospitalClerkAdmin', icon: Building2, color: 'from-teal-600 to-teal-800', badge: 'GOVT KP' },
    { id: 'id_scanner', title: 'ID Card & Doc Scanner', description: 'Dual-side composite layout combining front & back on A4', category: 'Documents', screen: 'IdCardScanner', icon: Camera, color: 'from-blue-600 to-cyan-700', badge: '2-IN-1' },
    { id: 'assignment_ocr', title: 'Handwritten Assignment OCR', description: 'Convert typed or scanned text into ruled notebook paper', category: 'Documents', screen: 'AssignmentOcrStudio', icon: PenTool, color: 'from-purple-600 to-pink-700', badge: 'RULED PDF' },
    { id: 'stamp_sign', title: 'Signature & Stamp Pad', description: 'Draw freehand digital signatures & export transparent PNG', category: 'Documents', screen: 'SignaturePad', icon: FileCheck, color: 'from-blue-500 to-indigo-700', badge: 'STAMP' },

    // 🩺 Medical & Clinical Practice
    { id: 'anatomy', title: 'Human Anatomy Atlas', description: '12 body systems, high-yield clinical pearls & anatomy quiz', category: 'Medical', screen: 'AnatomyAtlas', icon: Stethoscope, color: 'from-rose-600 to-red-700', badge: 'HD ATLAS' },
    { id: 'nursing_exam', title: 'Nursing Exam Kit', description: 'NCLEX-RN, DHA, HAAD, Saudi Prometric & MOH prep bank', category: 'Medical', screen: 'NursingExam', icon: HeartPulse, color: 'from-emerald-600 to-teal-800', badge: 'EXAM PREP' },
    { id: 'pharmacy_exam', title: 'Pharmacy Exam', description: 'Pakistan Category B Pharmacy Assistant & pharmacology test', category: 'Medical', screen: 'PharmacyExam', icon: Pill, color: 'from-purple-600 to-indigo-700', badge: 'POSOLOGY' },
    { id: 'hajj_prep', title: 'Hajj Medical Mission', description: 'Saudi pilgrimage health guidelines & emergency mass triage', category: 'Medical', screen: 'HajjMedicalPrep', icon: Award, color: 'from-teal-600 to-emerald-700', badge: 'NTS EXAM' },
    { id: 'iv_calc', title: 'IV Infusion Rate Calc', description: 'Calculate infusion drip rate (gtt/min) and pump flow (mL/hr)', category: 'Medical', screen: 'IvCalculator', icon: Droplet, color: 'from-cyan-600 to-blue-700', badge: 'CLINICAL' },
    { id: 'dose_calc', title: 'Drug Dosage Calculator', description: 'Pediatric body-weight posology (mg/kg) & syrup volume', category: 'Medical', screen: 'DosageCalculator', icon: Microscope, color: 'from-green-600 to-emerald-700', badge: 'DOSING' },
    { id: 'gfr_calc', title: 'GFR Renal Solver', description: 'Cockcroft-Gault creatinine clearance formula & CKD stages', category: 'Medical', screen: 'GfrCalculator', icon: Activity, color: 'from-amber-600 to-orange-700', badge: 'RENAL' },

    // 📖 Islamic Knowledge Hub
    { id: 'islamic_hub', title: 'Hikmah Islamic Hub', description: 'Spiritual sanctuary with Quran, Manzil, Hadith & calendar', category: 'Islamic', screen: 'IslamicHub', icon: Compass, color: 'from-emerald-600 to-green-700', badge: 'HIKMAH' },
    { id: 'quran', title: 'Quran Majeed Reader', description: 'Read holy Surahs with Arabic calligraphy & translation', category: 'Islamic', screen: 'QuranMajeed', icon: BookOpen, color: 'from-teal-600 to-emerald-800', badge: '114 SURAHS' },
    { id: 'manzil', title: 'Manzil HD Protection', description: 'Essential Quranic protection verses against harm and evil', category: 'Islamic', screen: 'ManzilBook', icon: Scroll, color: 'from-green-700 to-emerald-900', badge: 'MANZIL' },
    { id: 'hisnul_muslim', title: 'Hisnul Muslim Fortress', description: 'Authentic morning, evening, travel & healing supplications', category: 'Islamic', screen: 'HisnulMuslim', icon: BookMarked, color: 'from-emerald-700 to-teal-900', badge: 'ADHKAR' },

    // ⚙️ Utilities & Security
    { id: 'calc', title: 'Scientific Calculator', description: 'Scientific math formula solver with trigonometric functions', category: 'Utilities', screen: 'Calculator', icon: Calculator, color: 'from-pink-600 to-rose-700', badge: 'SCIENTIFIC' },
    { id: 'unit_conv', title: 'Unit Converter', description: 'Convert length, weight, data bytes, temperature & speeds', category: 'Utilities', screen: 'UnitConverter', icon: Shuffle, color: 'from-cyan-600 to-teal-700', badge: 'CONVERT' },
    { id: 'qr_gen', title: 'QR Code Studio', description: 'Create colored custom QR codes for URLs, WiFi & contacts', category: 'Utilities', screen: 'QrGenerator', icon: QrCode, color: 'from-indigo-600 to-blue-700', badge: 'VECTOR' },
    { id: 'barcode_gen', title: 'Barcode Generator', description: 'Generate Code-128 and retail EAN barcodes with instant download', category: 'Utilities', screen: 'BarcodeGenerator', icon: Barcode, color: 'from-blue-600 to-indigo-700', badge: 'CODE-128' },
    { id: 'passwords', title: 'Password Vault', description: 'Secure local encrypted credentials keeper & generator', category: 'Utilities', screen: 'PasswordManager', icon: KeyRound, color: 'from-emerald-600 to-teal-700', badge: 'ENCRYPTED' },
    { id: 'age_calc', title: 'Age Calculator', description: 'Exact age in years, months, days & next birthday countdown', category: 'Utilities', screen: 'AgeCalculator', icon: Clock, color: 'from-violet-600 to-purple-700', badge: 'AGE' },
    { id: 'steganography', title: 'Steganography Studio', description: 'Hide secret messages inside image pixels via LSB algorithm', category: 'Utilities', screen: 'Steganography', icon: Binary, color: 'from-slate-700 to-slate-900', badge: 'LSB CIPHER' },
    { id: 'teleprompter', title: 'Teleprompter Pro', description: 'Camera presentation prompter with mirror mode & speed control', category: 'Utilities', screen: 'Teleprompter', icon: Video, color: 'from-indigo-600 to-violet-700', badge: 'STUDIO' },

    // 🎓 Study & Health
    { id: 'notes', title: 'Clinical & Study Notes', description: 'Organize ward rounds, clinical checklists & study memos', category: 'Study', screen: 'Notes', icon: BookMarked, color: 'from-amber-600 to-yellow-600', badge: 'PINNED' },
    { id: 'study_timer', title: 'Pomodoro Focus Timer', description: 'Timed focus sessions & study intervals with audio alert', category: 'Study', screen: 'StudyTimer', icon: Timer, color: 'from-rose-600 to-orange-600', badge: '25/5 MIN' },
    { id: 'timetable', title: 'Weekly Duty & Timetable', description: 'Track clinic shifts, lectures & weekly scheduled routines', category: 'Study', screen: 'Timetable', icon: Calendar, color: 'from-blue-600 to-cyan-600', badge: 'AGENDA' },
    { id: 'bmi_calc', title: 'BMI & Water Tracker', description: 'Body mass index, healthy weight range & daily hydration', category: 'Study', screen: 'BmiCalculator', icon: Activity, color: 'from-emerald-600 to-green-700', badge: 'WELLNESS' },
    { id: 'gpa_calc', title: 'GPA & CGPA Calculator', description: 'Calculate semester grade points & academic honors', category: 'Study', screen: 'GpaCalculator', icon: GraduationCap, color: 'from-purple-600 to-indigo-700', badge: '4.0 SCALE' }
  ];

  const filteredTools = tools.filter((tool) => {
    const matchesCategory = selectedCategory === 'All' || tool.category === selectedCategory;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === '' ||
      tool.title.toLowerCase().includes(query) ||
      tool.description.toLowerCase().includes(query) ||
      tool.category.toLowerCase().includes(query) ||
      (tool.badge && tool.badge.toLowerCase().includes(query));
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'Finance', 'Documents', 'Medical', 'Islamic', 'Utilities', 'Study'];

  return (
    <div className="space-y-6 pb-12">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-800 via-teal-800 to-slate-900 text-white shadow-xl p-6 sm:p-8">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none overflow-hidden">
          <img
            src="/assets/img_brand_logo.jpg"
            alt="Hero pattern"
            className="w-full h-full object-cover scale-125"
            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
          />
        </div>

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-medium mb-3 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Govt Category-D Hospital Pacha Kalay Buner</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Welcome to Hikmah Omni Suite
          </h2>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            All-in-one professional productivity ecosystem integrating Islamic knowledge, hospital clinical tools, financial ledgers, document publishing & utility security suites.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={() => onNavigate('IslamicHub')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs sm:text-sm font-semibold transition-all shadow-md active:scale-95"
            >
              <Compass className="w-4 h-4" />
              <span>Islamic Hub</span>
            </button>
            <button
              onClick={() => onNavigate('HospitalClerkAdmin')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium backdrop-blur-xs transition-all active:scale-95"
            >
              <Building2 className="w-4 h-4" />
              <span>Hospital MS Kit</span>
            </button>
            <button
              onClick={() => onNavigate('AnatomyAtlas')}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs sm:text-sm font-medium backdrop-blur-xs transition-all active:scale-95"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Anatomy Atlas</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div
          onClick={() => onNavigate('IncomeTracker')}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:border-emerald-500 dark:hover:border-emerald-500 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Income</span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-2">
            Rs. {totalIncome.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-1">
            {income.length} credit entries
          </div>
        </div>

        <div
          onClick={() => onNavigate('ExpenseTracker')}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:border-rose-500 dark:hover:border-rose-500 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Outflow</span>
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-2">
            Rs. {totalExpense.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-600 dark:text-rose-400 font-medium mt-1">
            {expenses.length} expense logs
          </div>
        </div>

        <div
          onClick={() => onNavigate('UtilityBills')}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Pending Bills</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-2">
            {unpaidBillsCount} Unpaid
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium mt-1">
            WAPDA, Gas & PTCL
          </div>
        </div>

        <div
          onClick={() => onNavigate('SavingsGoals')}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:border-teal-500 dark:hover:border-teal-500 transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Net Surplus</span>
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <div className={`text-lg sm:text-xl font-bold mt-2 ${netSavings >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600 dark:text-rose-400'}`}>
            Rs. {netSavings.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
            Active balance reserve
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
            }`}
          >
            {cat} {cat === 'All' ? `(${tools.length})` : ''}
          </button>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <span>Productivity & Clinical Modules</span>
            <span className="text-xs text-slate-500 font-normal">
              Showing {filteredTools.length} {filteredTools.length === 1 ? 'tool' : 'tools'}
            </span>
          </h3>
        </div>

        {filteredTools.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8">
            <Search className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h4 className="font-semibold text-slate-800 dark:text-slate-200">No tools found</h4>
            <p className="text-slate-500 text-sm mt-1">Try another search keyword or clear filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {filteredTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <div
                  key={tool.id}
                  onClick={() => onNavigate(tool.screen)}
                  className="group relative bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-600 transition-all cursor-pointer flex flex-col justify-between overflow-hidden"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className={`p-2.5 rounded-xl text-white bg-linear-to-br ${tool.color} shadow-xs group-hover:scale-105 transition-transform`}>
                        <IconComponent className="w-5 h-5" />
                      </div>
                      {tool.badge && (
                        <span className="text-[10px] uppercase font-mono font-bold tracking-wider px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {tool.badge}
                        </span>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {tool.title}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {tool.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
                    <span className="font-medium text-slate-500 dark:text-slate-400">{tool.category}</span>
                    <span className="group-hover:translate-x-1 transition-transform font-medium text-emerald-600 dark:text-emerald-400">Open &rarr;</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
