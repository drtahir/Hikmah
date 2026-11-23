import React, { useState, useEffect } from 'react';
import {
  ScreenType, CategorySheetType, ThemePreference,
  Expense, Income, Bill, BcCommittee, Loan, SavingsGoal, UserProfile
} from './types';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { BottomNavBar, DedicatedScreenFooter, CategoryModuleSheet, AllServicesDrawerModal } from './components/BottomNavAndSheets';
import { DashboardView } from './views/DashboardView';

import {
  ExpenseTrackerView,
  IncomeTrackerView,
  UtilityBillsView,
  ZakatCalculatorView,
  BcCommitteeView,
  LoanTrackerView,
  SavingsGoalsView,
  FinanceReportView,
} from './views/FinanceViews';

import {
  AnatomyAtlasView,
  ExamSimulator,
  IvCalculatorView,
  DosageCalculatorView,
  GfrCalculatorView,
} from './views/MedicalViews';

import { nursingQuestions } from './data/nursingQuestionBank';
import { pharmacyQuestions } from './data/pharmacyQuestionBank';
import { hajjQuestions } from './data/hajjQuestionBank';

import {
  IslamicHubView,
  QuranMajeedView,
  ManzilBookView,
  HisnulMuslimView,
} from './views/IslamicViews';

import {
  CvResumeBuilderView,
  DutyRotaCreatorView,
  HospitalClericalAdminView,
  InvoiceGeneratorView,
} from './views/DocumentViews';

import {
  ScientificCalculatorView,
  QrCodeStudioView,
  BarcodeGeneratorView,
  PomodoroTimerView,
  PasswordVaultView,
} from './views/UtilityViews';

import {
  ClinicalNotesView,
  WeeklyTimetableView,
  BmiHydrationView,
  GpaCalculatorView,
} from './views/StudyViews';

import { PdfSuiteView } from './views/PdfSuiteView';
import { SecuritySuiteView } from './views/SecuritySuiteView';
import { ExtendedToolsView } from './views/ExtendedToolsViews';
import { SettingsView } from './views/SettingsView';
import { IslamicDailyView } from './views/IslamicDailyView';
import { ClinicalScoresView } from './views/ClinicalScoresView';
import { VideoAudioView } from './views/VideoAudioView';
import { PdfSignRedactView } from './views/PdfSignRedactView';

const SECURITY_SCREENS: ScreenType[] = [
  'SecurityHub', 'PinVault', 'AppLock', 'CalculatorVault', 'PhotoVault',
  'PrivateNotes', 'SecureDelete', 'PermissionAuditor', 'WifiScanner',
  'UssdCheck', 'ThermalPrinterManager', 'BiometricManagerScreen',
];

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('Dashboard');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['Dashboard']);
  const [activeSheet, setActiveSheet] = useState<CategorySheetType | null>(null);
  const [showAllServices, setShowAllServices] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewportMode, setViewportMode] = useState<'mobile' | 'wide'>('mobile');

  // Profile and Finance States
  const [profile, setProfile] = useState<UserProfile>(StorageService.getProfile());
  const [expenses, setExpenses] = useState<Expense[]>(StorageService.getExpenses());
  const [income, setIncome] = useState<Income[]>(StorageService.getIncome());
  const [bills, setBills] = useState<Bill[]>(StorageService.getBills());
  const [committees, setCommittees] = useState<BcCommittee[]>(StorageService.getCommittees());
  const [loans, setLoans] = useState<Loan[]>(StorageService.getLoans());
  const [savings, setSavings] = useState<SavingsGoal[]>(StorageService.getSavings());

  // 3-state Theme Preference (light / dark / system) matching DashboardScreen.kt
  const [themePreference, setThemePreference] = useState<ThemePreference>(() => {
    const saved = localStorage.getItem('studentkit_theme');
    if (saved === 'light' || saved === 'dark' || saved === 'system') return saved;
    return 'system';
  });

  const isEffectiveDark =
    themePreference === 'dark' ||
    (themePreference === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  useEffect(() => {
    localStorage.setItem('studentkit_theme', themePreference);
    if (isEffectiveDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [themePreference, isEffectiveDark]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  const navigateTo = (screen: ScreenType) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setActiveSheet(null);
    setScreenHistory((prev) => (prev[prev.length - 1] === screen ? prev : [...prev, screen]));
    setCurrentScreen(screen);
  };

  const navigateBack = () => {
    if (screenHistory.length > 1) {
      const nextHistory = [...screenHistory];
      nextHistory.pop();
      const prevScreen = nextHistory[nextHistory.length - 1];
      setScreenHistory(nextHistory);
      setCurrentScreen(prevScreen);
    } else {
      setCurrentScreen('Dashboard');
    }
  };

  const handleUpdateHijriOffset = (offset: number) => {
    StorageService.saveHijriOffset(offset);
    setProfile(StorageService.getProfile());
    showToast(`Hijri date offset set to ${offset >= 0 ? `+${offset}` : offset} day(s)`);
  };

  const handleSaveExpenses = (list: Expense[]) => { setExpenses(list); StorageService.saveExpenses(list); };
  const handleSaveIncome = (list: Income[]) => { setIncome(list); StorageService.saveIncome(list); };
  const handleSaveBills = (list: Bill[]) => { setBills(list); StorageService.saveBills(list); };
  const handleSaveCommittees = (list: BcCommittee[]) => { setCommittees(list); StorageService.saveCommittees(list); };
  const handleSaveLoans = (list: Loan[]) => { setLoans(list); StorageService.saveLoans(list); };
  const handleSaveSavings = (list: SavingsGoal[]) => { setSavings(list); StorageService.saveSavings(list); };

  const commonDocProps = { onBack: navigateBack, showToast };

  const renderScreen = () => {
    if (SECURITY_SCREENS.includes(currentScreen)) {
      return (
        <SecuritySuiteView
          activeScreen={currentScreen}
          onNavigate={navigateTo}
          showToast={showToast}
        />
      );
    }

    switch (currentScreen) {
      case 'Dashboard':
        return (
          <DashboardView
            onNavigate={navigateTo}
            profile={profile}
            onUpdateHijriOffset={handleUpdateHijriOffset}
            expenses={expenses}
            income={income}
            bills={bills}
            loans={loans}
            savings={savings}
            viewportMode={viewportMode}
          />
        );

      // Finance
      case 'ExpenseTracker': return <ExpenseTrackerView expenses={expenses} onSaveExpenses={handleSaveExpenses} />;
      case 'IncomeTracker': return <IncomeTrackerView income={income} onSaveIncome={handleSaveIncome} />;
      case 'UtilityBills': return <UtilityBillsView bills={bills} onSaveBills={handleSaveBills} />;
      case 'ZakatCalculator': return <ZakatCalculatorView />;
      case 'BcCommittee': return <BcCommitteeView committees={committees} onSaveCommittees={handleSaveCommittees} />;
      case 'LoanTracker': return <LoanTrackerView loans={loans} onSaveLoans={handleSaveLoans} />;
      case 'SavingsGoals': return <SavingsGoalsView goals={savings} onSaveGoals={handleSaveSavings} />;
      case 'FinanceReportAndBackup':
        return <FinanceReportView expenses={expenses} income={income} bills={bills} loans={loans} savings={savings} />;

      // PDF Suite (14-in-1 with PDF to Word (.docx) and Compress PDF)
      case 'PdfTools':
        return <PdfSuiteView {...commonDocProps} />;
      case 'PdfToWord':
        return <PdfSuiteView {...commonDocProps} initialToolId="PDF_TO_WORD" />;
      case 'PdfSignRedact':
        return <PdfSignRedactView showToast={showToast} />;

      // Medical & Clinical
      case 'AnatomyAtlas': return <AnatomyAtlasView />;
      case 'NursingExam':
        return <ExamSimulator title="KPK Nursing Board & NCLEX-RN Simulation" badge="500+ Questions" questions={nursingQuestions} themeColor="emerald" />;
      case 'PharmacyExam':
        return <ExamSimulator title="Pharmacy Council Category-B Clinical Exam" badge="Category B" questions={pharmacyQuestions} themeColor="teal" />;
      case 'HajjMedicalPrep':
        return <ExamSimulator title="Hajj Medical Mission & Moavineen Triage" badge="Pakistan Medical Mission" questions={hajjQuestions} themeColor="emerald" />;
      case 'MoavineenHujjajPrep':
        return <ExamSimulator title="Moavineen-e-Hujjaj NTS Preparation" badge="NTS Exam" questions={hajjQuestions} themeColor="emerald" />;
      case 'IvCalculator': return <IvCalculatorView />;
      case 'DosageCalculator': return <DosageCalculatorView />;
      case 'GfrCalculator': return <GfrCalculatorView />;
      case 'ClinicalScores': return <ClinicalScoresView />;

      // Islamic Hub
      case 'IslamicHub':
        return (
          <IslamicHubView
            onSelectModule={(m) => {
              if (m === 'quran') navigateTo('QuranMajeed');
              else if (m === 'manzil') navigateTo('ManzilBook');
              else if (m === 'hisnul') navigateTo('HisnulMuslim');
              else if (m === 'daily') navigateTo('IslamicDaily');
            }}
            hijriOffset={profile.hijriOffset}
          />
        );
      case 'IslamicDaily': return <IslamicDailyView onNavigate={navigateTo} showToast={showToast} />;
      case 'QuranMajeed': return <QuranMajeedView />;
      case 'ManzilBook': return <ManzilBookView />;
      case 'HisnulMuslim': return <HisnulMuslimView />;

      // Documents & Hospital Admin
      case 'CvBuilder': return <CvResumeBuilderView {...commonDocProps} />;
      case 'DutyRotaCreator': return <DutyRotaCreatorView {...commonDocProps} />;
      case 'HospitalClerkAdmin': return <HospitalClericalAdminView {...commonDocProps} />;
      case 'InvoiceGenerator': return <InvoiceGeneratorView {...commonDocProps} onHome={() => navigateTo('Dashboard')} />;

      // Utilities
      case 'Calculator': return <ScientificCalculatorView {...commonDocProps} />;
      case 'QrGenerator': return <QrCodeStudioView {...commonDocProps} />;
      case 'BarcodeGenerator': return <BarcodeGeneratorView {...commonDocProps} />;
      case 'StudyTimer': return <PomodoroTimerView {...commonDocProps} />;
      case 'PasswordManager': return <PasswordVaultView {...commonDocProps} />;
      case 'VideoAudioStudio': return <VideoAudioView showToast={showToast} />;

      // Academic & Study
      case 'Notes': return <ClinicalNotesView {...commonDocProps} />;
      case 'Timetable': return <WeeklyTimetableView {...commonDocProps} />;
      case 'BmiCalculator': return <BmiHydrationView {...commonDocProps} />;
      case 'GpaCalculator': return <GpaCalculatorView {...commonDocProps} />;

      // Extended Document / Image / Utility Tools
      case 'ImageTools':
      case 'ImageToPdf':
      case 'ImageToXls':
      case 'ImageToWord':
      case 'DocumentScanner':
      case 'IdCardScanner':
      case 'PassportScanner':
      case 'PassportPhotoStudio':
      case 'AssignmentOcrStudio':
      case 'SignaturePad':
      case 'UnitConverter':
      case 'AgeCalculator':
      case 'QrScanner':
      case 'IntruderGuard':
      case 'WatermarkStudio':
      case 'BackgroundEraser':
      case 'FileEncryptor':
      case 'HiddenLocker':
      case 'Steganography':
      case 'Steganalysis':
      case 'ImageEnhancer':
      case 'Teleprompter':
        return <ExtendedToolsView screen={currentScreen} {...commonDocProps} />;

      // Settings & About
      case 'Settings':
      case 'About':
        return (
          <SettingsView
            {...commonDocProps}
            darkMode={isEffectiveDark}
            toggleDarkMode={() => setThemePreference(isEffectiveDark ? 'light' : 'dark')}
          />
        );

      default:
        return (
          <DashboardView
            onNavigate={navigateTo}
            profile={profile}
            onUpdateHijriOffset={handleUpdateHijriOffset}
            expenses={expenses}
            income={income}
            bills={bills}
            loans={loans}
            savings={savings}
            viewportMode={viewportMode}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex justify-center transition-colors duration-200 selection:bg-emerald-500 selection:text-white md:py-4">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 max-w-sm bg-slate-900 dark:bg-emerald-950 text-white dark:text-emerald-200 px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* App Shell: Android Phone Frame (430px) by default on desktop with toggle to Full Width */}
      <div
        className={`w-full min-h-screen md:min-h-[calc(100vh-2rem)] bg-slate-50 dark:bg-slate-950 flex flex-col transition-all duration-200 ${
          viewportMode === 'mobile'
            ? 'max-w-[430px] md:rounded-[28px] md:border md:border-slate-300 dark:md:border-slate-800 md:shadow-2xl md:overflow-x-clip'
            : 'max-w-7xl md:rounded-3xl md:border md:border-slate-300 dark:md:border-slate-800 md:shadow-xl'
        }`}
      >
        {currentScreen !== 'InvoiceGenerator' && (
          <Header
            currentScreen={currentScreen}
            onNavigate={navigateTo}
            onBack={navigateBack}
            canGoBack={currentScreen !== 'Dashboard'}
            themePreference={themePreference}
            onChangeTheme={setThemePreference}
            onOpenAllServices={() => setShowAllServices(true)}
            viewportMode={viewportMode}
            onToggleViewportMode={() => setViewportMode((m) => (m === 'mobile' ? 'wide' : 'mobile'))}
          />
        )}

        <main className={currentScreen === 'InvoiceGenerator' ? 'flex-1 flex flex-col overflow-hidden' : 'flex-1 px-3.5 sm:px-5 py-4 overflow-y-auto'}>
          {renderScreen()}
        </main>

        <BottomNavBar
          currentScreen={currentScreen}
          activeSheet={activeSheet}
          onSelectHome={() => {
            setActiveSheet(null);
            navigateTo('Dashboard');
          }}
          onOpenSheet={(sheet) => setActiveSheet(sheet)}
        />
        <DedicatedScreenFooter
          currentScreen={currentScreen}
          onNavigate={navigateTo}
        />
      </div>

      {/* Category Module Bottom Sheet (MainActivity.kt CategoryModuleSheet) */}
      {activeSheet && (
        <CategoryModuleSheet
          sheetType={activeSheet}
          onDismiss={() => setActiveSheet(null)}
          onSelectModule={(screen) => {
            setActiveSheet(null);
            navigateTo(screen);
          }}
        />
      )}

      {/* All Services Quick Drawer (DashboardScreen.kt AllServicesDrawerDialog) */}
      {showAllServices && (
        <AllServicesDrawerModal
          onDismiss={() => setShowAllServices(false)}
          onSelectModule={(screen) => {
            setShowAllServices(false);
            navigateTo(screen);
          }}
        />
      )}
    </div>
  );
};
