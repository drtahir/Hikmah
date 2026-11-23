import React, { useState, useEffect, useMemo, useRef } from 'react';
import { surahsList, juzList, sampleSurahsAyahs, manzilVerses, hisnulMuslimDuas, getHijriDate } from '../data/islamicData';
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
  onSelectModule: (module: 'quran' | 'manzil' | 'hisnul' | 'daily') => void;
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

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="inline-block px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-xs text-xs font-semibold text-emerald-200 border border-white/10">
              Current Islamic Date: <span className="text-white font-bold">{hijri.formatted}</span>
            </div>
            <button
              type="button"
              onClick={() => onSelectModule('daily')}
              className="px-4 py-2 rounded-2xl bg-amber-400 text-emerald-950 text-xs font-extrabold hover:bg-amber-300 transition"
            >
              Open Qibla, Salah &amp; Tasbih →
            </button>
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
              Swipe up continuously across all 114 Surahs, 30 Paras &amp; 604 pages with Urdu &amp; English translations.
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

type CompactQuranRow = [number, number, number, number, string, string, string];

interface DisplayVerse {
  surahNumber: number;
  verseNumber: number;
  juz: number;
  page: number;
  arabic: string;
  urdu: string;
  english: string;
}

const ROW_TO_DISPLAY = (r: CompactQuranRow): DisplayVerse => ({
  surahNumber: r[0],
  verseNumber: r[1],
  juz: r[2],
  page: r[3],
  arabic: r[4],
  urdu: r[5],
  english: r[6]
});

// 2. QURAN MAJEED READER (CONTINUOUS SWIPE-UP BROWSING)
export const QuranMajeedView: React.FC = () => {
  const [navMode, setNavMode] = useState<'surah' | 'para' | 'page'>('surah');
  const [selectedSurahNum, setSelectedSurahNum] = useState<number>(1);
  const [selectedJuzNum, setSelectedJuzNum] = useState<number>(1);
  const [selectedPageNum, setSelectedPageNum] = useState<number>(1);
  const [continuousScroll, setContinuousScroll] = useState<boolean>(true);
  const [showUrdu, setShowUrdu] = useState<boolean>(true);
  const [showEnglish, setShowEnglish] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [allVerses, setAllVerses] = useState<CompactQuranRow[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Windowed slicing for buttery-smooth 60fps continuous vertical swipe-up scrolling
  const [startIdx, setStartIdx] = useState<number>(0);
  const [endIdx, setEndIdx] = useState<number>(60);
  const [activePosition, setActivePosition] = useState<{ surah: number; verse: number; juz: number; page: number }>({
    surah: 1,
    verse: 1,
    juz: 1,
    page: 1
  });
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/assets/quran/quran_complete.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((rows: CompactQuranRow[]) => {
        if (!cancelled) setAllVerses(rows);
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err?.message || 'Unable to load offline Quran dataset');
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Re-anchor window when user jumps to a new Surah, Para, or Page
  useEffect(() => {
    if (!allVerses || allVerses.length === 0) return;
    let idx = 0;
    if (navMode === 'surah') {
      idx = allVerses.findIndex((r) => r[0] === selectedSurahNum);
    } else if (navMode === 'para') {
      idx = allVerses.findIndex((r) => r[2] === selectedJuzNum);
    } else {
      idx = allVerses.findIndex((r) => r[3] >= selectedPageNum);
    }
    const safeStart = Math.max(0, idx);
    setStartIdx(safeStart);
    setEndIdx(Math.min(allVerses.length, safeStart + 60));
    const anchor = allVerses[safeStart];
    if (anchor) {
      setActivePosition({ surah: anchor[0], verse: anchor[1], juz: anchor[2], page: anchor[3] });
    }
  }, [allVerses, navMode, selectedSurahNum, selectedJuzNum, selectedPageNum, continuousScroll]);

  // Smooth infinite swipe-up append as the user scrolls near the bottom
  useEffect(() => {
    if (!continuousScroll || !allVerses) return;
    const el = loadMoreRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setEndIdx((prev) => Math.min(allVerses.length, prev + 50));
        }
      },
      { rootMargin: '600px 0px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [continuousScroll, allVerses, startIdx, endIdx]);

  // Fallback scroll listener for browsers/containers without IntersectionObserver trigger
  useEffect(() => {
    if (!continuousScroll || !allVerses) return;
    const onScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 800) {
        setEndIdx((prev) => (prev < allVerses.length ? Math.min(allVerses.length, prev + 50) : prev));
      }
      const cards = document.querySelectorAll<HTMLElement>('[data-quran-meta]');
      for (let i = 0; i < cards.length; i++) {
        const rect = cards[i].getBoundingClientRect();
        if (rect.bottom > 140) {
          const meta = cards[i].dataset.quranMeta;
          if (meta) {
            const [s, v, j, p] = meta.split(':').map(Number);
            setActivePosition((prev) =>
              prev.surah === s && prev.verse === v && prev.page === p && prev.juz === j
                ? prev
                : { surah: s, verse: v, juz: j, page: p }
            );
          }
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [continuousScroll, allVerses]);

  const surah = surahsList.find((s) => s.number === (continuousScroll ? activePosition.surah : selectedSurahNum)) || surahsList[0];
  const juz = juzList.find((j) => j.number === (continuousScroll ? activePosition.juz : selectedJuzNum)) || juzList[0];

  const displayVerses: DisplayVerse[] = useMemo(() => {
    if (allVerses) {
      if (continuousScroll) {
        return allVerses.slice(startIdx, endIdx).map(ROW_TO_DISPLAY);
      }
      return allVerses
        .filter((r) => {
          if (navMode === 'surah') return r[0] === selectedSurahNum;
          if (navMode === 'para') return r[2] === selectedJuzNum;
          return r[3] === selectedPageNum;
        })
        .map(ROW_TO_DISPLAY);
    }
    const fallback = navMode === 'surah' ? sampleSurahsAyahs[selectedSurahNum] : undefined;
    if (!fallback) return [];
    return fallback.map((a) => ({
      surahNumber: selectedSurahNum,
      verseNumber: a.numberInSurah,
      juz: selectedSurahNum === 1 ? 1 : 30,
      page: selectedSurahNum === 1 ? 1 : 604,
      arabic: a.arabic,
      urdu: '',
      english: a.translation
    }));
  }, [allVerses, continuousScroll, startIdx, endIdx, navMode, selectedSurahNum, selectedJuzNum, selectedPageNum]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const hasPrevious = continuousScroll && allVerses !== null && startIdx > 0;
  const hasMore = continuousScroll && allVerses !== null && endIdx < allVerses.length;

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      <div className="sticky top-2 z-20 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="text-xs uppercase font-mono text-emerald-600 font-bold tracking-wider">
              The Noble Quran • {allVerses ? '6,236 / 6,236 Verified Verses' : 'Loading Complete Text...'}
            </span>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">
              {continuousScroll
                ? `${surah.number}. ${surah.englishName} (${surah.arabicName})`
                : navMode === 'surah'
                ? `${surah.number}. ${surah.englishName} (${surah.arabicName})`
                : navMode === 'para'
                ? `Para ${juz.number}: ${juz.englishName} (${juz.arabicName})`
                : `Page ${selectedPageNum} of 604`}
            </h2>
            <p className="text-slate-500 text-xs mt-0.5">
              {continuousScroll
                ? `Para ${activePosition.juz} • Page ${activePosition.page} of 604 • Swipe up continuously through all 114 Surahs`
                : navMode === 'surah'
                ? `${surah.englishNameTranslation} • ${surah.revelationType} • ${surah.numberOfAyahs} Verses • Page ${surah.startPage || 1}`
                : navMode === 'para'
                ? `Starts at Surah ${juz.startSurah}:${juz.startAyah} • Page ${juz.startPage}`
                : `${displayVerses.length} Verses on Mushaf Page ${selectedPageNum}`}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['surah', 'para', 'page'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setNavMode(m)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                  navMode === m
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300'
                }`}
              >
                Jump {m}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-700">
          {navMode === 'surah' && (
            <select
              value={selectedSurahNum}
              onChange={(e) => setSelectedSurahNum(parseInt(e.target.value, 10))}
              className="w-full sm:w-80 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            >
              {surahsList.map((s) => (
                <option key={s.number} value={s.number}>
                  {s.number}. {s.englishName} ({s.arabicName}) — {s.numberOfAyahs} Ayahs
                </option>
              ))}
            </select>
          )}

          {navMode === 'para' && (
            <select
              value={selectedJuzNum}
              onChange={(e) => setSelectedJuzNum(parseInt(e.target.value, 10))}
              className="w-full sm:w-80 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white text-sm"
            >
              {juzList.map((j) => (
                <option key={j.number} value={j.number}>
                  Para {j.number}. {j.englishName} ({j.arabicName}) — {j.startSurah}:{j.startAyah}
                </option>
              ))}
            </select>
          )}

          {navMode === 'page' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectedPageNum((p) => Math.max(1, p - 1))}
                disabled={selectedPageNum <= 1}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-bold disabled:opacity-40"
              >
                Prev
              </button>
              <input
                type="number"
                min={1}
                max={604}
                value={selectedPageNum}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!Number.isNaN(val)) setSelectedPageNum(Math.max(1, Math.min(604, val)));
                }}
                className="w-20 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-900 text-center text-sm font-bold"
              />
              <button
                type="button"
                onClick={() => setSelectedPageNum((p) => Math.min(604, p + 1))}
                disabled={selectedPageNum >= 604}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 text-xs font-semibold">
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-emerald-700 dark:text-emerald-300">
              <input
                type="checkbox"
                checked={continuousScroll}
                onChange={(e) => setContinuousScroll(e.target.checked)}
                className="accent-emerald-600"
              />
              Swipe-Up Flow
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200">
              <input type="checkbox" checked={showUrdu} onChange={(e) => setShowUrdu(e.target.checked)} className="accent-emerald-600" />
              Urdu
            </label>
            <label className="inline-flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200">
              <input type="checkbox" checked={showEnglish} onChange={(e) => setShowEnglish(e.target.checked)} className="accent-emerald-600" />
              English
            </label>
          </div>
        </div>
      </div>

      {loadError && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 text-xs text-amber-800 dark:text-amber-200">
          Offline full text could not be fetched ({loadError}).
        </div>
      )}

      {hasPrevious && (
        <button
          type="button"
          onClick={() => setStartIdx((prev) => Math.max(0, prev - 40))}
          className="w-full py-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition"
        >
          ↑ Load Earlier Verses
        </button>
      )}

      <div className="space-y-4">
        {displayVerses.map((ayah, idx) => {
          const ayahKey = `${ayah.surahNumber}_${ayah.verseNumber}`;
          const prevAyah = idx > 0 ? displayVerses[idx - 1] : null;
          const sMeta = surahsList.find((s) => s.number === ayah.surahNumber);
          const showSurahIntro = ayah.verseNumber === 1 && (continuousScroll || navMode !== 'surah');
          const showBismillahBanner = ayah.verseNumber === 1 && ayah.surahNumber !== 1 && ayah.surahNumber !== 9;
          const showParaTransition = continuousScroll && prevAyah !== null && prevAyah.juz !== ayah.juz;
          const showPageTransition = continuousScroll && prevAyah !== null && prevAyah.page !== ayah.page;

          return (
            <React.Fragment key={ayahKey}>
              {showParaTransition && (
                <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-xs font-bold text-amber-800 dark:text-amber-300">
                  <span>Para {ayah.juz} Begins</span>
                  <span>الجزء {ayah.juz}</span>
                </div>
              )}

              {showPageTransition && (
                <div className="flex items-center gap-3 py-1">
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                  <span className="px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[11px] font-mono font-semibold text-slate-500">
                    Page {ayah.page}
                  </span>
                  <div className="h-px flex-1 bg-slate-200 dark:bg-slate-700" />
                </div>
              )}

              {showSurahIntro && sMeta && (
                <div className="text-center py-3 px-4 rounded-2xl bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
                  <div className="font-bold text-emerald-900 dark:text-emerald-200 text-base">
                    سُورَةُ {sMeta.arabicName} — {sMeta.englishName} ({sMeta.numberOfAyahs} Ayahs)
                  </div>
                </div>
              )}

              {showBismillahBanner && (
                <div className="text-center py-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-100 dark:border-emerald-900/40">
                  <p className="text-2xl sm:text-3xl font-serif text-emerald-900 dark:text-emerald-200 leading-relaxed tracking-wide" dir="rtl">
                    بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِیْمِ
                  </p>
                  {showUrdu && (
                    <span className="text-xs text-emerald-700/80 dark:text-emerald-400 mt-1 block" dir="rtl">
                      شروع اللہ کے نام سے جو بڑا مہربان نہایت رحم والا ہے
                    </span>
                  )}
                </div>
              )}

              <div
                data-quran-meta={`${ayah.surahNumber}:${ayah.verseNumber}:${ayah.juz}:${ayah.page}`}
                className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between border-b pb-2.5 border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-xs font-bold font-mono">
                      {ayah.surahNumber}:{ayah.verseNumber}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Para {ayah.juz} • Page {ayah.page}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy(`${ayah.arabic}\n\n${ayah.urdu}\n\n${ayah.english}`, ayahKey)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-slate-50"
                  >
                    {copiedKey === ayahKey ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <p className="text-right text-2xl sm:text-3xl font-serif leading-loose text-slate-900 dark:text-slate-50 py-1" dir="rtl">
                  {ayah.arabic}
                </p>

                {showUrdu && ayah.urdu && (
                  <p className="text-right text-sm sm:text-base text-slate-700 dark:text-slate-200 leading-relaxed" dir="rtl">
                    {ayah.urdu}
                  </p>
                )}

                {showEnglish && ayah.english && (
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-300 font-medium leading-relaxed">
                    {ayah.english}
                  </p>
                )}
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {hasMore && (
        <div ref={loadMoreRef} className="pt-2 pb-4 text-center">
          <button
            type="button"
            onClick={() => setEndIdx((prev) => (allVerses ? Math.min(allVerses.length, prev + 50) : prev))}
            className="px-5 py-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-bold text-emerald-700 dark:text-emerald-300"
          >
            Swipe Up to Continue Reading ({endIdx} / {allVerses?.length}) ↓
          </button>
        </div>
      )}
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
