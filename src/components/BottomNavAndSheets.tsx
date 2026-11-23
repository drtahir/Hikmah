import React, { useState } from 'react';
import {
  Home, Wallet, Folder, Wrench, BookOpen, Shield, Search, X, Grid,
  TrendingDown, TrendingUp, Receipt, Calculator, BarChart3,
  FileText, Image as ImageIcon, BadgeCheck, Stethoscope,
  Timer, Calendar, HeartPulse, StickyNote, RefreshCw, QrCode, Lock,
  ShieldCheck, KeyRound, FolderLock, FileSearch, Settings, Info, Compass
} from 'lucide-react';
import { CategorySheetType, ScreenType } from '../types';
import { ALL_SUITE_MODULES, getModulesForSheet } from '../data/navigationCatalog';
import { ModuleIcon } from './ModuleIcon';

interface BottomNavBarProps {
  currentScreen: ScreenType;
  activeSheet: CategorySheetType | null;
  onSelectHome: () => void;
  onOpenSheet: (sheet: CategorySheetType) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  currentScreen,
  activeSheet,
  onSelectHome,
  onOpenSheet,
}) => {
  // Show primary Home footer menu on Home (Dashboard) screen only
  if (currentScreen !== 'Dashboard') {
    return null;
  }

  const navItems: {
    id: 'HOME' | CategorySheetType;
    label: string;
    icon: React.ElementType;
  }[] = [
    { id: 'HOME', label: 'Home', icon: Home },
    { id: 'FINANCE', label: 'Finance', icon: Wallet },
    { id: 'DOCS', label: 'Docs', icon: Folder },
    { id: 'TOOLS', label: 'Tools', icon: Wrench },
    { id: 'STUDY', label: 'Study', icon: BookOpen },
    { id: 'SECURITY', label: 'Security', icon: Shield },
  ];

  return (
    <nav
      aria-label="Primary Suite Navigation"
      className="sticky bottom-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 no-print"
    >
      <div className="grid grid-cols-6 h-16 px-1">
        {navItems.map((item) => {
          const IconComp = item.icon;
          const isSelected =
            item.id === 'HOME'
              ? currentScreen === 'Dashboard' && activeSheet === null
              : activeSheet === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => (item.id === 'HOME' ? onSelectHome() : onOpenSheet(item.id))}
              className="flex flex-col items-center justify-center gap-1 min-h-11 rounded-xl transition-colors"
            >
              <div
                className={`px-3 py-1 rounded-full transition-colors ${
                  isSelected
                    ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <IconComp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span
                className={`text-[10.5px] leading-none font-semibold ${
                  isSelected
                    ? 'text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

interface CategoryModuleSheetProps {
  sheetType: CategorySheetType;
  onDismiss: () => void;
  onSelectModule: (screen: ScreenType) => void;
}

export const CategoryModuleSheet: React.FC<CategoryModuleSheetProps> = ({
  sheetType,
  onDismiss,
  onSelectModule,
}) => {
  const [query, setQuery] = useState('');
  const { title, headerColor, modules } = getModulesForSheet(sheetType);

  const filtered = modules.filter(
    (m) =>
      query.trim() === '' ||
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.description.toLowerCase().includes(query.toLowerCase()) ||
      m.badge.toLowerCase().includes(query.toLowerCase())
  );

  const SheetHeaderIcon =
    sheetType === 'FINANCE'
      ? Wallet
      : sheetType === 'DOCS'
      ? Folder
      : sheetType === 'TOOLS'
      ? Wrench
      : sheetType === 'STUDY'
      ? BookOpen
      : Shield;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[82vh] flex flex-col overflow-hidden"
      >
        {/* Drag Handle */}
        <div className="pt-2.5 pb-1 flex justify-center sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
        </div>

        {/* Sheet Header */}
        <div className="px-5 pt-3 pb-3 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${headerColor}22`, color: headerColor }}
              >
                <SheetHeaderIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">{title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {modules.length} modules available • Tap to open
                </p>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Close sheet"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${title}...`}
              className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* 2-Column Modules Grid matching MainActivity.kt */}
        <div className="p-4 overflow-y-auto grid grid-cols-2 gap-2.5">
          {filtered.map((mod) => (
            <button
              key={mod.id}
              onClick={() => onSelectModule(mod.screen)}
              className="text-left p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 hover:border-emerald-500 transition flex flex-col justify-between gap-2 min-h-24"
            >
              <div className="flex items-center justify-between gap-1">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${mod.colorHex}20`, color: mod.colorHex }}
                >
                  <ModuleIcon id={mod.id} className="w-4 h-4" />
                </div>
                <span
                  className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md truncate"
                  style={{ backgroundColor: `${mod.colorHex}1A`, color: mod.colorHex }}
                >
                  {mod.badge}
                </span>
              </div>
              <div>
                <div className="font-bold text-slate-900 dark:text-white text-xs leading-tight truncate">
                  {mod.title}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-snug">
                  {mod.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface AllServicesDrawerModalProps {
  onDismiss: () => void;
  onSelectModule: (screen: ScreenType) => void;
}

export const AllServicesDrawerModal: React.FC<AllServicesDrawerModalProps> = ({
  onDismiss,
  onSelectModule,
}) => {
  const [query, setQuery] = useState('');
  const filtered = ALL_SUITE_MODULES.filter(
    (m) =>
      query.trim() === '' ||
      m.title.toLowerCase().includes(query.toLowerCase()) ||
      m.category.toLowerCase().includes(query.toLowerCase()) ||
      m.badge.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden"
      >
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Grid className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base">All Hikmah Suite Services</h3>
              <p className="text-xs text-slate-500">{ALL_SUITE_MODULES.length} tools across Finance, Docs, Utilities, Study, Medical & Security</p>
            </div>
          </div>
          <button onClick={onDismiss} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter any tool across all 6 suites..."
            className="w-full px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm text-slate-900 dark:text-white outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="p-4 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {filtered.map((mod) => (
            <button
              key={mod.id}
              onClick={() => {
                onSelectModule(mod.screen);
                onDismiss();
              }}
              className="text-left p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 transition flex items-center gap-2.5"
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${mod.colorHex}20`, color: mod.colorHex }}
              >
                <ModuleIcon id={mod.id} className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{mod.title}</div>
                <div className="text-[10px] text-slate-500 truncate">{mod.category}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

interface DedicatedScreenFooterProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
}

type FooterNavItem = {
  screen: ScreenType;
  label: string;
  icon: React.ElementType;
  match?: ScreenType[];
};

export const DedicatedScreenFooter: React.FC<DedicatedScreenFooterProps> = ({
  currentScreen,
  onNavigate,
}) => {
  // Dashboard uses BottomNavBar; InvoiceGenerator renders its own 6-tab OmniPOS footer
  if (currentScreen === 'Dashboard' || currentScreen === 'InvoiceGenerator') {
    return null;
  }

  let items: FooterNavItem[] = [];
  let ariaLabel = 'Screen Navigation';

  if (
    [
      'ExpenseTracker', 'IncomeTracker', 'UtilityBills', 'ZakatCalculator',
      'BcCommittee', 'LoanTracker', 'SavingsGoals', 'FinanceReportAndBackup',
    ].includes(currentScreen)
  ) {
    ariaLabel = 'Finance Suite Footer Navigation';
    items = [
      { screen: 'ExpenseTracker', label: 'Expenses', icon: TrendingDown },
      { screen: 'IncomeTracker', label: 'Income', icon: TrendingUp },
      { screen: 'UtilityBills', label: 'Bills', icon: Receipt },
      { screen: 'ZakatCalculator', label: 'Zakat', icon: Calculator },
      { screen: 'FinanceReportAndBackup', label: 'Ledger', icon: BarChart3 },
    ];
  } else if (
    [
      'PdfTools', 'PdfToWord', 'PdfSignRedact', 'ImageToPdf', 'ImageToXls', 'ImageToWord', 'CvBuilder',
      'DocumentScanner', 'IdCardScanner', 'PassportScanner', 'PassportPhotoStudio',
      'AssignmentOcrStudio', 'HospitalClerkAdmin', 'DutyRotaCreator', 'SignaturePad',
    ].includes(currentScreen)
  ) {
    ariaLabel = 'Documents Suite Footer Navigation';
    items = [
      { screen: 'PdfTools', label: 'PDF Suite', icon: FileText },
      { screen: 'PdfToWord', label: 'PDF→Word', icon: FileText },
      { screen: 'PdfSignRedact', label: 'Sign/Redact', icon: BadgeCheck },
      { screen: 'CvBuilder', label: 'CV Maker', icon: BadgeCheck },
      { screen: 'HospitalClerkAdmin', label: 'Clerk Kit', icon: Stethoscope },
    ];
  } else if (['IslamicHub', 'IslamicDaily', 'QuranMajeed', 'ManzilBook', 'HisnulMuslim'].includes(currentScreen)) {
    ariaLabel = 'Islamic Library Footer Navigation';
    items = [
      { screen: 'IslamicDaily', label: 'Qibla', icon: Compass },
      { screen: 'IslamicHub', label: 'Library', icon: BookOpen },
      { screen: 'QuranMajeed', label: "Qur'an", icon: BookOpen },
      { screen: 'ManzilBook', label: 'Manzil', icon: FileText },
      { screen: 'HisnulMuslim', label: 'Hisnul', icon: ShieldCheck },
    ];
  } else if (
    [
      'SecurityHub', 'PinVault', 'AppLock', 'CalculatorVault', 'PhotoVault',
      'PrivateNotes', 'SecureDelete', 'PermissionAuditor', 'WifiScanner',
      'UssdCheck', 'ThermalPrinterManager', 'BiometricManagerScreen',
      'IntruderGuard', 'FileEncryptor', 'HiddenLocker', 'Steganography', 'Steganalysis',
    ].includes(currentScreen)
  ) {
    ariaLabel = 'Security Shield Footer Navigation';
    items = [
      { screen: 'SecurityHub', label: 'Shield', icon: Shield },
      { screen: 'AppLock', label: 'App Lock', icon: Lock },
      { screen: 'PinVault', label: 'PIN Vault', icon: KeyRound },
      { screen: 'PhotoVault', label: 'Media', icon: FolderLock },
      { screen: 'PermissionAuditor', label: 'Audit', icon: FileSearch },
    ];
  } else if (
    [
      'Notes', 'StudyTimer', 'Timetable', 'BmiCalculator', 'GpaCalculator',
      'IvCalculator', 'DosageCalculator', 'GfrCalculator', 'ClinicalScores', 'AnatomyAtlas',
      'PharmacyExam', 'NursingExam', 'HajjMedicalPrep', 'MoavineenHujjajPrep',
    ].includes(currentScreen)
  ) {
    ariaLabel = 'Study & Clinical Footer Navigation';
    items = [
      { screen: 'Notes', label: 'Notes', icon: StickyNote },
      { screen: 'StudyTimer', label: 'Timer', icon: Timer },
      { screen: 'ClinicalScores', label: 'ER Scores', icon: HeartPulse },
      { screen: 'DosageCalculator', label: 'Dosage', icon: Stethoscope },
      { screen: 'AnatomyAtlas', label: 'Anatomy', icon: HeartPulse },
    ];
  } else if (currentScreen === 'Settings' || currentScreen === 'About') {
    ariaLabel = 'Settings & Info Footer Navigation';
    items = [
      { screen: 'Settings', label: 'Settings', icon: Settings },
      { screen: 'About', label: 'About Suite', icon: Info },
      { screen: 'Dashboard', label: 'Home', icon: Home },
    ];
  } else {
    ariaLabel = 'Utilities Footer Navigation';
    items = [
      { screen: 'Calculator', label: 'Calc', icon: Calculator },
      { screen: 'UnitConverter', label: 'Convert', icon: RefreshCw },
      { screen: 'QrGenerator', label: 'QR Studio', icon: QrCode },
      { screen: 'ImageTools', label: 'Img Tools', icon: ImageIcon },
      { screen: 'PasswordManager', label: 'Vault', icon: Lock },
    ];
  }

  return (
    <nav
      aria-label={ariaLabel}
      style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      className="sticky bottom-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 grid h-16 px-1 no-print"
    >
      {items.map((item) => {
        const IconComp = item.icon;
        const active =
          currentScreen === item.screen || (item.match ? item.match.includes(currentScreen) : false);
        return (
          <button
            key={`${item.screen}-${item.label}`}
            type="button"
            onClick={() => onNavigate(item.screen)}
            className={`flex flex-col items-center justify-center gap-0.5 transition-colors ${
              active
                ? 'text-emerald-700 dark:text-emerald-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <div
              className={`px-3 py-1 rounded-full transition-colors ${
                active ? 'bg-emerald-100 dark:bg-emerald-900/50' : ''
              }`}
            >
              <IconComp className="w-4 h-4" />
            </div>
            <span className="text-[10px] leading-none truncate max-w-full px-1">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
