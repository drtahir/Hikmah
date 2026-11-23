import React, { useState } from 'react';
import { ScreenType, Expense, Income, Bill, Loan, SavingsGoal, UserProfile, TimetableEntry } from '../types';
import { getHijriDate } from '../data/islamicData';
import { ALL_SUITE_MODULES } from '../data/navigationCatalog';
import { ModuleIcon } from '../components/ModuleIcon';
import { StorageService } from '../services/storage';
import {
  Sun, Sunrise, Sunset, Moon, Briefcase, Edit3, Calendar, Star,
  TrendingDown, TrendingUp, Flag, BookOpen, QrCode, FileText, Store,
  ChevronRight, Search, X, Clock, Receipt, CheckCircle2
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (screen: ScreenType) => void;
  profile: UserProfile;
  onUpdateHijriOffset: (offset: number) => void;
  expenses: Expense[];
  income: Income[];
  bills: Bill[];
  loans: Loan[];
  savings: SavingsGoal[];
  viewportMode: 'mobile' | 'wide';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  profile,
  onUpdateHijriOffset,
  expenses,
  income,
  bills,
  savings,
  viewportMode,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showHijriDialog, setShowHijriDialog] = useState(false);

  const now = new Date();
  const hour = now.getHours();

  const timeMeta =
    hour < 12
      ? { tag: 'GOOD MORNING', Icon: Sunrise, tint: 'text-amber-300', grad: 'from-[#065F46] via-[#047857] to-[#0F766E]' }
      : hour < 17
      ? { tag: 'GOOD AFTERNOON', Icon: Sun, tint: 'text-yellow-300', grad: 'from-[#0F5132] via-[#0D9488] to-[#0369A1]' }
      : hour < 20
      ? { tag: 'GOOD EVENING', Icon: Sunset, tint: 'text-orange-300', grad: 'from-[#1E3A8A] via-[#312E81] to-[#0F766E]' }
      : { tag: 'PEACEFUL NIGHT', Icon: Moon, tint: 'text-amber-200', grad: 'from-[#0F172A] via-[#1E293B] to-[#064E3B]' };

  const TimeIcon = timeMeta.Icon;
  const formattedGregorian = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  const hijri = getHijriDate(profile.hijriOffset);

  // Quick Stats matching DashboardScreen.kt
  const todayIso = now.toISOString().slice(0, 10);
  const todayExpense = expenses
    .filter((e) => e.date === todayIso)
    .reduce((sum, e) => sum + e.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const totalIncome = income.reduce((sum, i) => sum + i.amount, 0);
  const netBalance = totalIncome - totalExpense;
  const activeGoalsCount = savings.length;

  // Smart Utilities Portal tools (All, Finance, Documents, Utilities, Study, Medical)
  const portalTools = ALL_SUITE_MODULES.filter((m) => m.category !== 'Security');
  const categories = [
    { key: 'All', label: 'All' },
    { key: 'Finance', label: 'Finance' },
    { key: 'Documents', label: 'Docs' },
    { key: 'Utilities', label: 'Tools' },
    { key: 'Study', label: 'Study' },
    { key: 'Medical', label: 'Medical' },
  ];

  const filteredTools = portalTools.filter((tool) => {
    const matchesCat = selectedCategory === 'All' || tool.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      q === '' ||
      tool.title.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.badge.toLowerCase().includes(q);
    return matchesCat && matchesQuery;
  });

  // Timetable & Upcoming Bills
  const timetable: TimetableEntry[] = StorageService.getTimetable();
  const jsDay = now.getDay(); // 0=Sun,1=Mon...
  const adjustedDayNum = jsDay === 0 ? 7 : jsDay;
  const todaysClasses = timetable.filter((t) => (t.dayOfWeek || 1) === adjustedDayNum);
  const upcomingBills = bills.filter((b) => !b.isPaid).slice(0, 3);

  const gridColsClass =
    viewportMode === 'mobile'
      ? 'grid-cols-2'
      : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';

  return (
    <div className="space-y-5 pb-6">
      {/* 1. Glassmorphic Welcome Card (DashboardScreen.kt lines 1205-1446) */}
      <section
        className={`relative overflow-hidden rounded-3xl bg-linear-to-br ${timeMeta.grad} text-white p-4 border border-white/20 shadow-lg`}
      >
        <div className="space-y-3 relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 rounded-2xl overflow-hidden border-2 border-white/40 shadow-md shrink-0 bg-emerald-950">
                <img
                  src="/assets/img_brand_logo.jpg"
                  alt="Hikmah Brand Emblem"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider uppercase text-white/95 mb-0.5">
                  <TimeIcon className={`w-3.5 h-3.5 ${timeMeta.tint}`} />
                  <span>{timeMeta.tag}</span>
                </div>
                <h2 className="text-lg font-extrabold leading-tight truncate">
                  {profile.name?.trim() || 'Welcome'}
                </h2>
                {profile.occupation && (
                  <div className="flex items-center gap-1 text-xs text-white/85 mt-0.5 truncate">
                    <Briefcase className="w-3 h-3 shrink-0" />
                    <span className="truncate">{profile.occupation}</span>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => onNavigate('Settings')}
              className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 transition shrink-0"
              title="Edit Profile & Settings"
            >
              <Edit3 className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Unified Gregorian + Hijri Date Strip */}
          <div className="rounded-xl bg-white/15 border border-white/20 px-3 py-2 space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] font-medium text-white">
              <Calendar className="w-3.5 h-3.5 text-white/85 shrink-0" />
              <span className="truncate">{formattedGregorian}</span>
            </div>
            <div className="h-px bg-white/15" />
            <button
              onClick={() => setShowHijriDialog(true)}
              className="w-full flex items-center justify-between gap-2 text-left hover:opacity-90 transition"
            >
              <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-200 truncate">
                <Star className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="truncate">{hijri.formatted}</span>
              </span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/15 text-white shrink-0">
                Adjust
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Hijri Adjustment Modal */}
      {showHijriDialog && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowHijriDialog(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 dark:text-white text-base">Hijri Calendar Moon Offset</h3>
              <button onClick={() => setShowHijriDialog(false)} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Current Hijri Date: <strong className="text-emerald-600 dark:text-emerald-400">{hijri.formatted}</strong>
            </p>
            <div className="grid grid-cols-5 gap-1.5">
              {[-2, -1, 0, 1, 2].map((off) => (
                <button
                  key={off}
                  onClick={() => {
                    onUpdateHijriOffset(off);
                    setShowHijriDialog(false);
                  }}
                  className={`py-2.5 rounded-xl text-xs font-bold transition ${
                    profile.hijriOffset === off
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  {off > 0 ? `+${off}d` : off < 0 ? `${off}d` : 'Sync'}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Quick Stats Row (DashboardScreen.kt lines 1456-1486) */}
      <section className="grid grid-cols-3 gap-2.5">
        <button
          onClick={() => onNavigate('ExpenseTracker')}
          className="text-left bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-400 transition"
        >
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span className="truncate">Today's Cost</span>
            <TrendingDown className="w-3.5 h-3.5 text-rose-500 shrink-0" />
          </div>
          <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-1.5 tabular-nums truncate">
            Rs. {todayExpense.toLocaleString()}
          </div>
        </button>

        <button
          onClick={() => onNavigate('FinanceReportAndBackup')}
          className="text-left bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 transition"
        >
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span className="truncate">Month Savings</span>
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          </div>
          <div className={`text-sm sm:text-base font-extrabold mt-1.5 tabular-nums truncate ${netBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'}`}>
            Rs. {netBalance.toLocaleString()}
          </div>
        </button>

        <button
          onClick={() => onNavigate('SavingsGoals')}
          className="text-left bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 transition"
        >
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span className="truncate">Active Goals</span>
            <Flag className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          </div>
          <div className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mt-1.5 tabular-nums">
            {activeGoalsCount}
          </div>
        </button>
      </section>

      {/* 3. Stacked Hero CTA Banners (DashboardScreen.kt lines 1488-1506) */}
      <section className={viewportMode === 'mobile' ? 'space-y-3' : 'grid grid-cols-1 md:grid-cols-2 gap-3'}>
        {/* Islamic Library Hero */}
        <button
          onClick={() => onNavigate('IslamicHub')}
          className="w-full text-left relative overflow-hidden rounded-2xl bg-linear-to-r from-[#0F5132] via-[#198754] to-[#0F5132] text-white p-3.5 border border-[#D4AF37]/80 shadow-md hover:brightness-105 transition group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center shrink-0">
                <BookOpen className="w-5 h-5 text-[#D4AF37]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm truncate">Islamic Library & Books</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#D4AF37] text-[#0F5132] text-[9px] font-extrabold shrink-0">MANZIL HD</span>
                </div>
                <p className="text-[11px] text-white/85 truncate mt-0.5">Complete Protection Verses & Ruqyah</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#D4AF37] shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* Smart QR & Barcode Studio Hero */}
        <button
          onClick={() => onNavigate('QrGenerator')}
          className="w-full text-left relative overflow-hidden rounded-2xl bg-linear-to-r from-[#0D1B4C] via-[#1E2F79] to-[#0D1B4C] text-white p-3.5 border border-[#82B1FF]/80 shadow-md hover:brightness-105 transition group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[#82B1FF]/20 border border-[#82B1FF] flex items-center justify-center shrink-0">
                <QrCode className="w-5 h-5 text-[#82B1FF]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm truncate">Smart QR & Barcode Studio</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#448AFF] text-white text-[9px] font-extrabold shrink-0">HD VECTOR</span>
                </div>
                <p className="text-[11px] text-white/85 truncate mt-0.5">Custom Colors, WiFi Instant Connect & vCards</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#82B1FF] shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* 14-in-1 Master PDF Suite Hero (Highlighting PDF to Word & Compress PDF) */}
        <button
          onClick={() => onNavigate('PdfTools')}
          className="w-full text-left relative overflow-hidden rounded-2xl bg-linear-to-r from-[#5A0B0B] via-[#9E1B1B] to-[#5A0B0B] text-white p-3.5 border border-[#FF6B6B]/85 shadow-md hover:brightness-105 transition group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[#FF5252]/20 border border-[#FF5252] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5 text-[#FF8A8A]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm truncate">14-in-1 Master PDF Suite</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#FF5252] text-white text-[9px] font-extrabold shrink-0">100% OFFLINE</span>
                </div>
                <p className="text-[11px] text-white/85 truncate mt-0.5">PDF to Word (.docx), Compress, Merge, Split, Watermark & Encrypt</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#FF8A8A] shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* OmniPOS Enterprise Suite Hero */}
        <button
          onClick={() => onNavigate('InvoiceGenerator')}
          className="w-full text-left relative overflow-hidden rounded-2xl bg-linear-to-r from-[#1A237E] via-[#311B92] to-[#4A148C] text-white p-3.5 border border-[#FF9800]/85 shadow-md hover:brightness-105 transition group"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-full bg-[#FF9800]/20 border border-[#FF9800] flex items-center justify-center shrink-0">
                <Store className="w-5 h-5 text-[#FFB74D]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm truncate">OmniPOS Enterprise Suite</span>
                  <span className="px-1.5 py-0.5 rounded bg-[#FF9800] text-slate-950 text-[9px] font-extrabold shrink-0">PRO INVOICE</span>
                </div>
                <p className="text-[11px] text-white/85 truncate mt-0.5">Create Branded Tax Invoices, Quotes & Thermal Receipts</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[#FFB74D] shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>
      </section>

      {/* 4. Smart Utilities Portal (DashboardScreen.kt lines 1509-1656) */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Smart Utilities Portal
          </h3>
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 tabular-nums">
            {filteredTools.length} modules
          </span>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-emerald-600 dark:text-emerald-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tools (e.g., Compress PDF, Zakat, CV, Security)..."
            className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-emerald-500 outline-hidden"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
          {categories.map((cat) => {
            const selected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3.5 py-2 rounded-xl text-xs whitespace-nowrap transition shrink-0 ${
                  selected
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* 2-Column HDDesignToolButton Grid */}
        {filteredTools.length === 0 ? (
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 text-center space-y-1">
            <p className="font-bold text-slate-800 dark:text-white text-sm">No matching utilities found</p>
            <p className="text-xs text-slate-500">Try typing PDF, Zakat, Kameti, Timer, or clear your filter.</p>
          </div>
        ) : (
          <div className={`grid ${gridColsClass} gap-2.5`}>
            {filteredTools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onNavigate(tool.screen)}
                className="text-left bg-white dark:bg-slate-900 rounded-2xl p-3 border shadow-xs hover:shadow-md transition flex flex-col justify-between gap-2 group"
                style={{ borderColor: `${tool.colorHex}33` }}
              >
                <div>
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                      style={{ backgroundColor: `${tool.colorHex}1F`, color: tool.colorHex }}
                    >
                      <ModuleIcon id={tool.id} className="w-4 h-4" />
                    </div>
                    <span
                      className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md truncate"
                      style={{ backgroundColor: `${tool.colorHex}1F`, color: tool.colorHex }}
                    >
                      {tool.badge}
                    </span>
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white text-[13px] leading-snug truncate">
                    {tool.title}
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                    {tool.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 5. Today's Classes Snippet (DashboardScreen.kt lines 1673-1755) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Today's Classes & Rounds</h3>
          <button onClick={() => onNavigate('Timetable')} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            View Timetable
          </button>
        </div>
        {todaysClasses.length === 0 ? (
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 text-xs text-slate-500">
            No scheduled classes or rounds for today. Tap View Timetable to manage sessions.
          </div>
        ) : (
          <div className="flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
            {todaysClasses.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate('Timetable')}
                className="min-w-52 text-left p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shrink-0 hover:border-emerald-500 transition"
              >
                <div className="font-bold text-sm text-slate-900 dark:text-white truncate">{item.subject}</div>
                <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{item.startTime} - {item.endTime}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mt-1.5">
                  <span className="truncate">{item.teacher || 'Staff'}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300">Room: {item.room || 'N/A'}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 6. Upcoming Bills Snippet (DashboardScreen.kt lines 1758+) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Upcoming Utility Bills</h3>
          <button onClick={() => onNavigate('UtilityBills')} className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            Manage Bills
          </button>
        </div>
        {upcomingBills.length === 0 ? (
          <div className="rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 p-3.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> All utility bills are marked paid.
          </div>
        ) : (
          <div className="space-y-2">
            {upcomingBills.map((b) => (
              <button
                key={b.id}
                onClick={() => onNavigate('UtilityBills')}
                className="w-full text-left flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-400 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Receipt className="w-4 h-4 text-blue-600 shrink-0" />
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">{b.name}</div>
                    <div className="text-[11px] text-slate-500">Due {b.dueDate}</div>
                  </div>
                </div>
                <span className="font-bold text-xs text-rose-600 dark:text-rose-400 tabular-nums shrink-0">
                  Rs. {b.amount.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
