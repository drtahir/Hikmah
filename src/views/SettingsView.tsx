import React, { useState } from 'react';
import {
  User, Building2, Moon, Sun, Shield, Info, Heart,
  Smartphone, Database, RefreshCw, CheckCircle, Save
} from 'lucide-react';
import { StorageService } from '../services/storage';
import { UserProfile } from '../types';

interface SettingsViewProps {
  onBack: () => void;
  showToast: (msg: string) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onBack,
  showToast,
  darkMode,
  toggleDarkMode
}) => {
  const [profile, setProfile] = useState<UserProfile>(StorageService.getUserProfile());
  const [hijriOffset, setHijriOffset] = useState<number>(StorageService.getHijriOffset());

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveUserProfile(profile);
    StorageService.saveHijriOffset(hijriOffset);
    showToast('Settings & Profile updated successfully!');
  };

  const handleResetData = () => {
    if (window.confirm('Reset all sample data to defaults? Your customized records will be reloaded.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <User className="w-6 h-6 text-emerald-600" />
          User Profile & System Preferences
        </h2>
        <p className="text-xs text-slate-500">Configure clinical credentials, Moon-sighting Hijri adjustments, and display preferences</p>
      </div>

      <form onSubmit={handleProfileSave} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 className="font-bold text-slate-800 dark:text-white text-sm">Professional Profile</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Doctor / Practitioner Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Hospital / Medical College</label>
            <input
              type="text"
              value={profile.institution}
              onChange={(e) => setProfile({ ...profile, institution: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Clinical Department / Ward</label>
            <input
              type="text"
              value={profile.department}
              onChange={(e) => setProfile({ ...profile, department: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">PMDC / License Registration #</label>
            <input
              type="text"
              value={profile.registrationNumber}
              onChange={(e) => setProfile({ ...profile, registrationNumber: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Contact Phone</label>
            <input
              type="text"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-500 block mb-1">Email Address</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 className="font-bold text-slate-800 dark:text-white text-sm mb-3">Islamic Calendar Moon-Sighting Offset</h3>
          <p className="text-xs text-slate-500 mb-2">Adjust Hijri calendar by ±1 or ±2 days according to Central Ruet-e-Hilal Committee Pakistan</p>
          <div className="flex gap-2">
            {[-2, -1, 0, 1, 2].map((off) => (
              <button
                key={off}
                type="button"
                onClick={() => setHijriOffset(off)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                  hijriOffset === off
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {off > 0 ? `+${off} day` : off < 0 ? `${off} day` : '0 (Sync)'}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Save Profile & Settings
        </button>
      </form>

      {/* About Box */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
          <Info className="w-4 h-4 text-emerald-600" /> About Hikmah Omni Suite (StudentKit Buner)
        </h3>
        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          <strong>StudentKit Buner</strong> (Application ID: <code className="text-emerald-600 font-mono">com.studentkit.buner</code>) is an all-in-one offline clinical, medical education, Islamic, and hospital administration workstation engineered by <strong>Dr. Muhammad Tahir</strong> for medical students, nurses, doctors, and healthcare professionals in Category-D Hospital Pacha Kalay, District Buner, Khyber Pakhtunkhwa.
        </p>

        <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <span>Engineered with passion for Buner & Khyber Pakhtunkhwa Healthcare.</span>
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
        </div>

        <div className="pt-2 flex justify-between items-center text-xs text-slate-400">
          <span>Version 2.4.0 (Build 2025.1)</span>
          <button
            type="button"
            onClick={handleResetData}
            className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Local Data
          </button>
        </div>
      </div>
    </div>
  );
};
