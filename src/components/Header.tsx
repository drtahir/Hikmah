import React from 'react';
import { ScreenType, UserProfile } from '../types';
import { getHijriDate } from '../data/islamicData';
import {
  ArrowLeft,
  Moon,
  Sun,
  Settings as SettingsIcon,
  Search,
  BookOpen,
  Home
} from 'lucide-react';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onBack: () => void;
  canGoBack: boolean;
  profile: UserProfile;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  toggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onBack,
  canGoBack,
  profile,
  searchQuery,
  onSearchChange,
  toggleTheme
}) => {
  const hijri = getHijriDate(profile.hijriOffset);

  const getScreenTitle = (screen: ScreenType): string => {
    switch (screen) {
      case 'Dashboard': return 'Hikmah Omni Suite';
      case 'ExpenseTracker': return 'Expense Tracker';
      case 'IncomeTracker': return 'Income Tracker';
      case 'UtilityBills': return 'Utility Bills Ledger';
      case 'ZakatCalculator': return 'Zakat Calculator';
      case 'BcCommittee': return 'BC Committees (Kameti)';
      case 'LoanTracker': return 'Loan & Debt Ledger';
      case 'SavingsGoals': return 'Savings Goals';
      case 'FinanceReportAndBackup': return 'Financial Reports & Backup';
      case 'CvBuilder': return 'CV Resume Builder A4';
      case 'InvoiceGenerator': return 'Professional Invoice Maker';
      case 'DutyRotaCreator': return 'Hospital Duty Rota Creator';
      case 'HospitalClerkAdmin': return 'Hospital Clerk & MS Kit';
      case 'IdCardScanner': return 'ID Card & Document Scanner';
      case 'AssignmentOcrStudio': return 'Handwritten Assignment OCR Studio';
      case 'SignaturePad': return 'Digital Signature & Stamp Pad';
      case 'Calculator': return 'Scientific Calculator';
      case 'UnitConverter': return 'Universal Unit Converter';
      case 'QrGenerator': return 'QR Code Studio';
      case 'BarcodeGenerator': return 'Barcode Generator';
      case 'PasswordManager': return 'Encrypted Password Vault';
      case 'AgeCalculator': return 'Age & Life Milestone Calculator';
      case 'Steganography': return 'Image Steganography Studio';
      case 'Teleprompter': return 'Teleprompter Pro';
      case 'Notes': return 'Clinical & Lecture Notes';
      case 'StudyTimer': return 'Pomodoro Focus Timer';
      case 'Timetable': return 'Weekly Lesson & Duty Timetable';
      case 'BmiCalculator': return 'BMI & Health Wellness';
      case 'GpaCalculator': return 'GPA & CGPA Calculator';
      case 'IvCalculator': return 'IV Infusion Rate Calculator';
      case 'DosageCalculator': return 'Pediatric & Adult Drug Dosage';
      case 'GfrCalculator': return 'GFR Renal Cockcroft-Gault';
      case 'AnatomyAtlas': return 'Human Anatomy Atlas & Quiz';
      case 'PharmacyExam': return 'Pharmacy Exam Preparation';
      case 'NursingExam': return 'Nursing Exam Kit (NCLEX/Prometric)';
      case 'HajjMedicalPrep': return 'Hajj Medical Mission Prep';
      case 'IslamicHub': return 'Hikmah Islamic Knowledge Hub';
      case 'ManzilBook': return 'Manzil HD Protection Book';
      case 'HisnulMuslim': return 'Hisnul Muslim (Fortress of the Muslim)';
      case 'QuranMajeed': return 'Quran Majeed Reader';
      case 'About': return 'About Hikmah Omni Suite';
      case 'Settings': return 'Preferences & Settings';
      default: return 'Hikmah Omni Suite';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs no-print transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          <div className="flex items-center gap-3 min-w-0">
            {canGoBack && currentScreen !== 'Dashboard' ? (
              <button
                onClick={onBack}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1 font-medium text-sm"
                title="Back to previous screen"
              >
                <ArrowLeft className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden sm:inline">Back</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigate('Dashboard')}
                className="flex items-center gap-2.5 text-left group"
              >
                <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/30 shadow-xs shrink-0 bg-emerald-50">
                  <img
                    src="/assets/img_brand_logo.jpg"
                    alt="Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
                <div className="hidden xs:block truncate">
                  <div className="font-bold text-slate-900 dark:text-white leading-tight flex items-center gap-1.5 text-base">
                    <span>Hikmah Omni Suite</span>
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-semibold">Buner</span>
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {profile.name} • {profile.city}
                  </div>
                </div>
              </button>
            )}

            {currentScreen !== 'Dashboard' && (
              <div className="truncate pl-1 border-l border-slate-200 dark:border-slate-700">
                <h1 className="font-semibold text-slate-800 dark:text-slate-100 text-sm sm:text-base truncate">
                  {getScreenTitle(currentScreen)}
                </h1>
              </div>
            )}
          </div>

          {currentScreen === 'Dashboard' && (
            <div className="flex-1 max-w-md hidden md:block mx-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search 40+ clinical, financial & productivity tools..."
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 dark:text-slate-100 placeholder-slate-400 transition-all outline-hidden"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 shrink-0">
            <div
              onClick={() => onNavigate('IslamicHub')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-medium cursor-pointer hover:bg-emerald-100 transition-colors"
              title="Islamic Hijri Date & Events"
            >
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{hijri.formatted}</span>
            </div>

            {currentScreen !== 'Dashboard' && (
              <button
                onClick={() => onNavigate('Dashboard')}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Go to Home Dashboard"
              >
                <Home className="w-5 h-5" />
              </button>
            )}

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Dark / Light Theme"
            >
              {profile.darkTheme ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
            </button>

            <button
              onClick={() => onNavigate('Settings')}
              className={`p-2 rounded-xl transition-colors ${currentScreen === 'Settings' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
              title="App Settings & Profile"
            >
              <SettingsIcon className="w-5 h-5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
