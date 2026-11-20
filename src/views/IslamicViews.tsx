import React, { useState } from 'react';
import { surahsList, sampleSurahsAyahs, manzilVerses, hisnulMuslimDuas, getHijriDate } from '../data/islamicData';
import {
  BookOpen,
  Scroll,
  BookMarked,
  Compass,
  Sparkles,
  Copy,
  Check
} from 'lucide-react';

// 1. ISLAMIC HUB HOME
export const IslamicHubView: React.FC<{
  onSelectModule: (module: 'quran' | 'manzil' | 'hisnul') => void;
  hijriOffset: number;
}> = ({ onSelectModule, hijriOffset }) => {
  const hijri = getHijriDate(hijriOffset);

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white shadow-xl p-6 sm:p-8">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-medium mb-3">
            <Compass className="w-3.5 h-3.5 text-emerald-400" />
            <span>Islamic Spiritual Library</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Hikmah Islamic Knowledge Hub
          </h2>
          <p className="text-emerald-100/90 text-sm sm:text-base leading-relaxed">
            Nourish your soul with the Holy Quran Majeed, authentic Manzil protection verses, Fortress of the Muslim (Hisnul Muslim), and the Islamic Hijri calendar.
          </p>

          <div className="mt-4 inline-block px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xs text-xs font-semibold text-emerald-200 border border-white/10">
            Current Islamic Date: <span className="text-white font-bold">{hijri.formatted}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onSelectModule('quran')}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-500 cursor-pointer transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="p-3 w-fit rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Quran Majeed Reader</h3>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              Read 114 Surahs with Uthmani typography, transliteration, and English translations.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span>Read Surahs</span>
            <span>&rarr;</span>
          </div>
        </div>

        <div
          onClick={() => onSelectModule('manzil')}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-teal-500 cursor-pointer transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="p-3 w-fit rounded-2xl bg-teal-100 dark:bg-teal-950 text-teal-600 dark:text-teal-400 mb-4 group-hover:scale-105 transition-transform">
              <Scroll className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Manzil HD Book</h3>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              Curated selection of 33 Quranic verses for spiritual protection against illness and evil eye.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs font-semibold text-teal-600 dark:text-teal-400">
            <span>Open Manzil</span>
            <span>&rarr;</span>
          </div>
        </div>

        <div
          onClick={() => onSelectModule('hisnul')}
          className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs hover:border-emerald-500 cursor-pointer transition-all group flex flex-col justify-between"
        >
          <div>
            <div className="p-3 w-fit rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
              <BookMarked className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-lg">Hisnul Muslim</h3>
            <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
              Daily authentic Duas and Adhkar from the Sunnah for morning, evening, sickness, and travel.
            </p>
          </div>
          <div className="mt-6 flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400">
            <span>Explore Adhkar</span>
            <span>&rarr;</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. QURAN MAJEED READER
export const QuranMajeedView: React.FC = () => {
  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(1);
  const [copiedAyah, setCopiedAyah] = useState<number | null>(null);

  const surah = surahsList.find((s) => s.number === selectedSurahNum) || surahsList[0];
  const ayahs = sampleSurahsAyahs[selectedSurahNum] || sampleSurahsAyahs[1];

  const handleCopy = (text: string, num: number) => {
    navigator.clipboard.writeText(text);
    setCopiedAyah(num);
    setTimeout(() => setCopiedAyah(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase font-mono text-emerald-600 font-bold tracking-wider">The Noble Quran</span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {surah.englishName} ({surah.arabicName})
          </h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {surah.englishNameTranslation} • {surah.revelationType} • {surah.numberOfAyahs} Verses
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <label className="block text-xs font-medium text-slate-500 mb-1">Select Surah</label>
          <select
            value={selectedSurahNum}
            onChange={(e) => setSelectedSurahNum(parseInt(e.target.value))}
            className="w-full sm:w-64 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
          >
            {surahsList.map((s) => (
              <option key={s.number} value={s.number}>
                {s.number}. {s.englishName} ({s.arabicName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {selectedSurahNum !== 9 && (
        <div className="text-center py-6 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-100 dark:border-emerald-900/40">
          <p className="text-2xl sm:text-3xl font-serif text-emerald-900 dark:text-emerald-200 leading-relaxed tracking-wide">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <span className="text-xs text-emerald-700/80 dark:text-emerald-400 mt-1 block">
            In the name of Allah, the Entirely Merciful, the Especially Merciful.
          </span>
        </div>
      )}

      <div className="space-y-4">
        {ayahs.map((ayah) => (
          <div
            key={ayah.numberInSurah}
            className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-100 dark:border-slate-700">
              <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold font-mono">
                {ayah.numberInSurah}
              </span>
              <button
                onClick={() => handleCopy(`${ayah.arabic}\n\n${ayah.translation}`, ayah.numberInSurah)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-50"
              >
                {copiedAyah === ayah.numberInSurah ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            <p className="text-right text-2xl sm:text-3xl font-serif leading-loose text-slate-900 dark:text-slate-50 py-1" dir="rtl">
              {ayah.arabic}
            </p>

            <p className="text-xs text-slate-400 dark:text-slate-500 italic">
              {ayah.transliteration}
            </p>

            <p className="text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed">
              {ayah.translation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// 3. MANZIL HD BOOK
export const ManzilBookView: React.FC = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <span className="text-xs uppercase font-mono text-teal-600 font-bold tracking-wider">Ruqyah & Protection</span>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Manzil Protection Verses</h2>
      </div>

      <div className="space-y-5">
        {manzilVerses.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4"
          >
            <div className="flex items-center justify-between border-b pb-3 border-slate-100 dark:border-slate-700">
              <span className="font-bold text-slate-800 dark:text-slate-100 text-sm sm:text-base">
                {item.title}
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 font-medium">
                {item.source}
              </span>
            </div>

            <p className="text-right text-xl sm:text-2xl font-serif leading-loose text-slate-900 dark:text-white py-2" dir="rtl">
              {item.arabic}
            </p>

            <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/40 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <span className="font-bold text-teal-800 dark:text-teal-300 block mb-1">Translation:</span>
              {item.translation}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. HISNUL MUSLIM
export const HisnulMuslimView: React.FC = () => {
  const [selectedCat, setSelectedCat] = useState<string>('All');

  const categories = ['All', 'Morning & Evening', 'Protection', 'Night & Sleep', 'Illness & Healing'];

  const filtered = hisnulMuslimDuas.filter((d) =>
    selectedCat === 'All' ? true : d.category === selectedCat
  );

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs">
        <span className="text-xs uppercase font-mono text-emerald-600 font-bold tracking-wider">Sunnah Adhkar</span>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Hisnul Muslim (Fortress of the Muslim)</h2>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCat(c)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCat === c
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((item, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-100 dark:border-slate-700">
              <h4 className="font-bold text-slate-900 dark:text-white text-base">{item.title}</h4>
              <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                {item.category}
              </span>
            </div>

            <p className="text-right text-xl sm:text-2xl font-serif leading-loose text-slate-900 dark:text-white py-1" dir="rtl">
              {item.arabic}
            </p>

            <p className="text-xs text-slate-400 italic">
              {item.transliteration}
            </p>

            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              {item.translation}
            </p>

            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{item.benefit}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
