import React, { useState, useEffect } from 'react';
import { ScreenType, Expense, Income, Bill, BcCommittee, Loan, SavingsGoal, UserProfile } from './types';
import { StorageService } from './services/storage';
import { Header } from './components/Header';
import { DashboardView } from './views/DashboardView';

import {
  ExpenseTrackerView,
  IncomeTrackerView,
  UtilityBillsView,
  ZakatCalculatorView,
  BcCommitteeView,
  LoanTrackerView,
  SavingsGoalsView,
  FinanceReportView
} from './views/FinanceViews';

import {
  AnatomyAtlasView,
  ExamSimulator,
  IvCalculatorView,
  DosageCalculatorView,
  GfrCalculatorView
} from './views/MedicalViews';

import { nursingQuestions } from './data/nursingQuestionBank';
import { pharmacyQuestions } from './data/pharmacyQuestionBank';
import { hajjQuestions } from './data/hajjQuestionBank';

import {
  IslamicHubView,
  QuranMajeedView,
  ManzilBookView,
  HisnulMuslimView
} from './views/IslamicViews';

import {
  CvResumeBuilderView,
  DutyRotaCreatorView,
  HospitalClericalAdminView,
  InvoiceGeneratorView
} from './views/DocumentViews';

import {
  ScientificCalculatorView,
  QrCodeStudioView,
  BarcodeGeneratorView,
  PomodoroTimerView,
  PasswordVaultView
} from './views/UtilityViews';

import {
  ClinicalNotesView,
  WeeklyTimetableView,
  BmiHydrationView,
  GpaCalculatorView
} from './views/StudyViews';

import { SettingsView } from './views/SettingsView';

export const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('Dashboard');
  const [screenHistory, setScreenHistory] = useState<ScreenType[]>(['Dashboard']);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Profile and Finance States
  const [profile] = useState<UserProfile>(StorageService.getProfile());
  const [expenses, setExpenses] = useState<Expense[]>(StorageService.getExpenses());
  const [income, setIncome] = useState<Income[]>(StorageService.getIncome());
  const [bills, setBills] = useState<Bill[]>(StorageService.getBills());
  const [committees, setCommittees] = useState<BcCommittee[]>(StorageService.getCommittees());
  const [loans, setLoans] = useState<Loan[]>(StorageService.getLoans());
  const [savings, setSavings] = useState<SavingsGoal[]>(StorageService.getSavings());

  // Dark mode
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('studentkit_theme') === 'dark' ||
      window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('studentkit_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('studentkit_theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  const navigateTo = (screen: ScreenType) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setScreenHistory((prev) => [...prev, screen]);
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

  // Finance update handlers
  const handleSaveExpenses = (list: Expense[]) => {
    setExpenses(list);
    StorageService.saveExpenses(list);
  };

  const handleSaveIncome = (list: Income[]) => {
    setIncome(list);
    StorageService.saveIncome(list);
  };

  const handleSaveBills = (list: Bill[]) => {
    setBills(list);
    StorageService.saveBills(list);
  };

  const handleSaveCommittees = (list: BcCommittee[]) => {
    setCommittees(list);
    StorageService.saveCommittees(list);
  };

  const handleSaveLoans = (list: Loan[]) => {
    setLoans(list);
    StorageService.saveLoans(list);
  };

  const handleSaveSavings = (list: SavingsGoal[]) => {
    setSavings(list);
    StorageService.saveSavings(list);
  };

  const commonDocProps = { onBack: navigateBack, showToast };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'Dashboard':
        return (
          <DashboardView
            onNavigate={navigateTo}
            expenses={expenses}
            income={income}
            bills={bills}
            loans={loans}
            searchQuery={searchQuery}
          />
        );

      // Finance Screens
      case 'ExpenseTracker':
        return <ExpenseTrackerView expenses={expenses} onSaveExpenses={handleSaveExpenses} />;
      case 'IncomeTracker':
        return <IncomeTrackerView income={income} onSaveIncome={handleSaveIncome} />;
      case 'UtilityBills':
        return <UtilityBillsView bills={bills} onSaveBills={handleSaveBills} />;
      case 'ZakatCalculator':
        return <ZakatCalculatorView />;
      case 'BcCommittee':
        return <BcCommitteeView committees={committees} onSaveCommittees={handleSaveCommittees} />;
      case 'LoanTracker':
        return <LoanTrackerView loans={loans} onSaveLoans={handleSaveLoans} />;
      case 'SavingsGoals':
        return <SavingsGoalsView goals={savings} onSaveGoals={handleSaveSavings} />;
      case 'FinanceReportAndBackup':
        return (
          <FinanceReportView
            expenses={expenses}
            income={income}
            bills={bills}
            loans={loans}
            savings={savings}
          />
        );

      // Medical & Clinical
      case 'AnatomyAtlas':
        return <AnatomyAtlasView />;
      case 'NursingExam':
        return (
          <ExamSimulator
            title="KPK Nursing Board & NCLEX-RN Simulation"
            badge="500+ Questions"
            questions={nursingQuestions}
            themeColor="emerald"
          />
        );
      case 'PharmacyExam':
        return (
          <ExamSimulator
            title="Pharmacy Council Category-B Clinical Exam"
            badge="Category B"
            questions={pharmacyQuestions}
            themeColor="teal"
          />
        );
      case 'HajjMedicalPrep':
        return (
          <ExamSimulator
            title="Hajj Medical Mission & Moavineen Triage"
            badge="Pakistan Medical Mission"
            questions={hajjQuestions}
            themeColor="emerald"
          />
        );
      case 'IvCalculator':
        return <IvCalculatorView />;
      case 'DosageCalculator':
        return <DosageCalculatorView />;
      case 'GfrCalculator':
        return <GfrCalculatorView />;

      // Islamic Hub
      case 'IslamicHub':
        return (
          <IslamicHubView
            onSelectModule={(m) => {
              if (m === 'quran') navigateTo('QuranMajeed');
              else if (m === 'manzil') navigateTo('ManzilBook');
              else if (m === 'hisnul') navigateTo('HisnulMuslim');
            }}
            hijriOffset={profile.hijriOffset}
          />
        );
      case 'QuranMajeed':
        return <QuranMajeedView />;
      case 'ManzilBook':
        return <ManzilBookView />;
      case 'HisnulMuslim':
        return <HisnulMuslimView />;

      // Documents & Hospital Admin
      case 'CvBuilder':
        return <CvResumeBuilderView {...commonDocProps} />;
      case 'DutyRotaCreator':
        return <DutyRotaCreatorView {...commonDocProps} />;
      case 'HospitalClerkAdmin':
        return <HospitalClericalAdminView {...commonDocProps} />;
      case 'InvoiceGenerator':
        return <InvoiceGeneratorView {...commonDocProps} />;

      // Utilities
      case 'Calculator':
        return <ScientificCalculatorView {...commonDocProps} />;
      case 'QrGenerator':
        return <QrCodeStudioView {...commonDocProps} />;
      case 'BarcodeGenerator':
        return <BarcodeGeneratorView {...commonDocProps} />;
      case 'StudyTimer':
        return <PomodoroTimerView {...commonDocProps} />;
      case 'PasswordManager':
        return <PasswordVaultView {...commonDocProps} />;

      // Academic & Study
      case 'Notes':
        return <ClinicalNotesView {...commonDocProps} />;
      case 'Timetable':
        return <WeeklyTimetableView {...commonDocProps} />;
      case 'BmiCalculator':
        return <BmiHydrationView {...commonDocProps} />;
      case 'GpaCalculator':
        return <GpaCalculatorView {...commonDocProps} />;

      // Settings
      case 'Settings':
      case 'About':
        return (
          <SettingsView
            {...commonDocProps}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
          />
        );

      default:
        return (
          <DashboardView
            onNavigate={navigateTo}
            expenses={expenses}
            income={income}
            bills={bills}
            loans={loans}
            searchQuery={searchQuery}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200 selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 dark:bg-emerald-950 text-white dark:text-emerald-200 px-5 py-3 rounded-2xl shadow-2xl border border-emerald-500/30 flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400"></div>
          <p className="text-xs font-semibold">{toastMessage}</p>
        </div>
      )}

      {/* Main Top Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={navigateTo}
        onBack={navigateBack}
        canGoBack={currentScreen !== 'Dashboard'}
        profile={profile}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        toggleTheme={toggleDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {renderScreen()}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-6 text-center text-xs text-slate-400 print:hidden">
        <p className="font-semibold text-slate-600 dark:text-slate-400">
          Hikmah Omni Suite • StudentKit Buner (Cat-D Hospital Pacha Kalay)
        </p>
        <p className="text-[11px] text-slate-400 mt-1">
          Application ID: com.studentkit.buner • Developed by Dr. Muhammad Tahir
        </p>
      </footer>
    </div>
  );
};
