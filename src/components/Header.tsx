import React, { useState, useRef, useEffect } from 'react';
import { ScreenType, ThemePreference } from '../types';
import { getScreenMeta } from '../data/navigationCatalog';
import {
  ArrowLeft, Moon, Sun, Monitor, Settings as SettingsIcon, BookOpen,
  Home, MoreVertical, LayoutGrid, Timer, Info, Check, Smartphone, Maximize2
} from 'lucide-react';

interface HeaderProps {
  currentScreen: ScreenType;
  onNavigate: (screen: ScreenType) => void;
  onBack: () => void;
  canGoBack: boolean;
  themePreference: ThemePreference;
  onChangeTheme: (pref: ThemePreference) => void;
  onOpenAllServices: () => void;
  viewportMode: 'mobile' | 'wide';
  onToggleViewportMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentScreen,
  onNavigate,
  onBack,
  canGoBack,
  themePreference,
  onChangeTheme,
  onOpenAllServices,
  viewportMode,
  onToggleViewportMode,
}) => {
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const closeMenus = (e: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(e.target as Node)) setShowThemeMenu(false);
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) setShowMoreMenu(false);
    };
    document.addEventListener('mousedown', closeMenus);
    return () => document.removeEventListener('mousedown', closeMenus);
  }, []);

  const meta = getScreenMeta(currentScreen);
  const isDashboard = currentScreen === 'Dashboard';

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 no-print">
      <div className="px-3 sm:px-4 h-14 flex items-center justify-between gap-2">
        {/* Left: Brand Wordmark on Dashboard OR Back + Title on sub-screens */}
        {isDashboard ? (
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-xl sm:text-2xl font-black tracking-tight bg-linear-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent">
                Hikmah
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[11px] font-medium">
                Omni Suite
              </span>
            </div>
            <div className="text-[10.5px] text-slate-500 dark:text-slate-400 truncate">
              Comprehensive Professional Platform
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-2 min-w-0">
            {canGoBack && (
              <button
                onClick={onBack}
                className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-11 min-w-11 flex items-center justify-center"
                title="Back"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h1 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base truncate">
              {meta.title}
            </h1>
          </div>
        )}

        {/* Right TopAppBar Actions matching DashboardScreen.kt */}
        <div className="flex items-center gap-0.5 shrink-0">
          {!isDashboard && (
            <button
              onClick={() => onNavigate('Dashboard')}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-11 min-w-11 flex items-center justify-center"
              title="Home Dashboard"
            >
              <Home className="w-5 h-5" />
            </button>
          )}

          {/* Mobile Frame / Wide Layout Toggle */}
          <button
            onClick={onToggleViewportMode}
            className="hidden md:flex p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-11 items-center gap-1 text-xs font-semibold"
            title={viewportMode === 'mobile' ? 'Expand to Wide View' : 'Switch to Phone Frame View'}
          >
            {viewportMode === 'mobile' ? <Maximize2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* View All Services Drawer */}
          <button
            onClick={onOpenAllServices}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-11 min-w-11 flex items-center justify-center"
            title="View All Services"
          >
            <LayoutGrid className="w-5 h-5" />
          </button>

          {/* Islamic Library Shortcut */}
          <button
            onClick={() => onNavigate('IslamicHub')}
            className="p-2 rounded-xl text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition min-h-11 min-w-11 flex items-center justify-center"
            title="Islamic Library"
          >
            <BookOpen className="w-5 h-5" />
          </button>

          {/* 3-State Theme Menu (Light / Dark / System Default) */}
          <div className="relative" ref={themeMenuRef}>
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 rounded-xl text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-11 min-w-11 flex items-center justify-center"
              title="Change Theme"
            >
              {themePreference === 'dark' ? (
                <Moon className="w-5 h-5 text-amber-300" />
              ) : themePreference === 'light' ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Monitor className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              )}
            </button>
            {showThemeMenu && (
              <div className="absolute right-0 mt-1.5 w-48 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 z-50">
                {(
                  [
                    { key: 'light', label: 'Light Mode', icon: Sun },
                    { key: 'dark', label: 'Dark Mode', icon: Moon },
                    { key: 'system', label: 'System Default', icon: Monitor },
                  ] as const
                ).map((opt) => {
                  const OptIcon = opt.icon;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => {
                        onChangeTheme(opt.key);
                        setShowThemeMenu(false);
                      }}
                      className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-between"
                    >
                      <span className="flex items-center gap-2.5">
                        <OptIcon className="w-4 h-4" />
                        {opt.label}
                      </span>
                      {themePreference === opt.key && <Check className="w-4 h-4 text-emerald-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* More Options Menu */}
          <div className="relative" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition min-h-11 min-w-11 flex items-center justify-center"
              title="More Options"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMoreMenu && (
              <div className="absolute right-0 mt-1.5 w-52 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1.5 z-50">
                <button
                  onClick={() => { setShowMoreMenu(false); onNavigate('Settings'); }}
                  className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5"
                >
                  <SettingsIcon className="w-4 h-4 text-emerald-600" />
                  Settings & Profile
                </button>
                <button
                  onClick={() => { setShowMoreMenu(false); onNavigate('StudyTimer'); }}
                  className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5"
                >
                  <Timer className="w-4 h-4 text-orange-500" />
                  Focus Study Timer
                </button>
                <button
                  onClick={() => { setShowMoreMenu(false); onNavigate('About'); }}
                  className="w-full px-3.5 py-2.5 text-left text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2.5"
                >
                  <Info className="w-4 h-4 text-slate-500" />
                  About Hikmah Omni Suite
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    </header>
  );
};
