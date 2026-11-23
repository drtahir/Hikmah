import React, { useState, useEffect, useMemo } from 'react';
import {
  Compass, Clock, Fingerprint, MapPin, BookOpen, RotateCcw,
  Sun, Moon, Sunrise, Sunset, Sparkles, Navigation
} from 'lucide-react';
import { ScreenType } from '../types';

interface IslamicDailyViewProps {
  onNavigate: (screen: ScreenType) => void;
  showToast: (msg: string) => void;
}

type CalcMethodKey = 'KARACHI' | 'MWL' | 'ISNA' | 'UMM_AL_QURA' | 'EGYPT';
type AsrSchool = 'HANAFI' | 'SHAFI';

const CALC_METHODS: Record<CalcMethodKey, { name: string; fajrAngle: number; ishaAngle: number; ishaMins?: number }> = {
  KARACHI: { name: 'Karachi (Hanafi / PK)', fajrAngle: 18.0, ishaAngle: 18.0 },
  MWL: { name: 'Muslim World League', fajrAngle: 18.0, ishaAngle: 17.0 },
  ISNA: { name: 'ISNA (North America)', fajrAngle: 15.0, ishaAngle: 15.0 },
  UMM_AL_QURA: { name: 'Umm al-Qura (Makkah)', fajrAngle: 18.5, ishaAngle: 0, ishaMins: 90 },
  EGYPT: { name: 'Egyptian Authority', fajrAngle: 19.5, ishaAngle: 17.5 },
};

const PRESET_CITIES = [
  { name: 'Buner (Pacha Kalay), PK', lat: 34.4922, lng: 72.4789, tz: 5.0 },
  { name: 'Peshawar, PK', lat: 34.0151, lng: 71.5249, tz: 5.0 },
  { name: 'Swat (Mingora), PK', lat: 34.7717, lng: 72.3602, tz: 5.0 },
  { name: 'Mardan, PK', lat: 34.1986, lng: 72.0404, tz: 5.0 },
  { name: 'Islamabad / RWP, PK', lat: 33.6844, lng: 73.0479, tz: 5.0 },
  { name: 'Lahore, PK', lat: 31.5204, lng: 74.3587, tz: 5.0 },
  { name: 'Karachi, PK', lat: 24.8607, lng: 67.0011, tz: 5.0 },
  { name: 'Makkah, SA', lat: 21.4225, lng: 39.8262, tz: 3.0 },
  { name: 'Madinah, SA', lat: 24.4672, lng: 39.6112, tz: 3.0 },
  { name: 'London, UK', lat: 51.5072, lng: -0.1276, tz: 0.0 },
];

const ZIKR_PRESETS = [
  { arabic: 'سُبْحَانَ اللّٰهِ', latin: 'SubhanAllah', meaning: 'Glory be to Allah' },
  { arabic: 'اَلْحَمْدُ لِلّٰهِ', latin: 'Alhamdulillah', meaning: 'Praise be to Allah' },
  { arabic: 'اَللّٰهُ أَكْبَرُ', latin: 'Allahu Akbar', meaning: 'Allah is the Greatest' },
  { arabic: 'أَسْتَغْفِرُ اللّٰهَ', latin: 'Astaghfirullah', meaning: 'I seek forgiveness from Allah' },
  { arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ', latin: 'La ilaha illAllah', meaning: 'There is no deity except Allah' },
  { arabic: 'اَللّٰهُمَّ صَلِّ عَلٰى مُحَمَّدٍ', latin: 'Durood Shareef', meaning: 'Peace & blessings upon Prophet Muhammad (PBUH)' },
];

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;
const deg2rad = (d: number) => (d * Math.PI) / 180;
const rad2deg = (r: number) => (r * 180) / Math.PI;
const fixAngle = (a: number) => ((a % 360) + 360) % 360;
const fixHour = (h: number) => ((h % 24) + 24) % 24;

function calculateQiblaBearing(lat: number, lng: number): number {
  const phi1 = deg2rad(lat);
  const phi2 = deg2rad(KAABA_LAT);
  const dLambda = deg2rad(KAABA_LNG - lng);
  const y = Math.sin(dLambda) * Math.cos(phi2);
  const x = Math.cos(phi1) * Math.sin(phi2) - Math.sin(phi1) * Math.cos(phi2) * Math.cos(dLambda);
  return fixAngle(rad2deg(Math.atan2(y, x)));
}

function calculateKaabaDistanceKm(lat: number, lng: number): number {
  const r = 6371;
  const dLat = deg2rad(KAABA_LAT - lat);
  const dLng = deg2rad(KAABA_LNG - lng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(deg2rad(lat)) * Math.cos(deg2rad(KAABA_LAT)) * Math.sin(dLng / 2) ** 2;
  return 2 * r * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function computePrayerSchedule(
  date: Date,
  lat: number,
  lng: number,
  tz: number,
  method: CalcMethodKey,
  asrSchool: AsrSchool
) {
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  const day = date.getDate();
  if (m <= 2) { y -= 1; m += 12; }
  const a = Math.floor(y / 100);
  const b = 2 - a + Math.floor(a / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524.5 - lng / (15 * 24);

  const d = jd - 2451545.0;
  const g = fixAngle(357.529 + 0.98560028 * d);
  const q = fixAngle(280.459 + 0.98564736 * d);
  const l = fixAngle(q + 1.915 * Math.sin(deg2rad(g)) + 0.020 * Math.sin(deg2rad(2 * g)));
  const e = 23.439 - 0.00000036 * d;
  const ra = rad2deg(Math.atan2(Math.cos(deg2rad(e)) * Math.sin(deg2rad(l)), Math.cos(deg2rad(l)))) / 15.0;
  const decl = rad2deg(Math.asin(Math.sin(deg2rad(e)) * Math.sin(deg2rad(l))));
  const eqTime = q / 15.0 - fixHour(ra);

  const dhuhrNoon = fixHour(12 + tz - lng / 15.0 - eqTime);
  const altOffset = (altDeg: number) => {
    const num = Math.sin(deg2rad(altDeg)) - Math.sin(deg2rad(lat)) * Math.sin(deg2rad(decl));
    const den = Math.cos(deg2rad(lat)) * Math.cos(deg2rad(decl));
    return rad2deg(Math.acos(Math.max(-1, Math.min(1, num / den)))) / 15.0;
  };

  const spec = CALC_METHODS[method];
  const sunRiseOff = altOffset(-0.833);
  const sunrise = fixHour(dhuhrNoon - sunRiseOff);
  const maghrib = fixHour(dhuhrNoon + sunRiseOff);
  const fajr = fixHour(dhuhrNoon - altOffset(-spec.fajrAngle));
  const shadowFactor = asrSchool === 'HANAFI' ? 2 : 1;
  const asrAlt = rad2deg(Math.atan(1.0 / (shadowFactor + Math.tan(deg2rad(Math.abs(lat - decl))))));
  const asr = fixHour(dhuhrNoon + altOffset(asrAlt));
  const isha = spec.ishaMins ? fixHour(maghrib + spec.ishaMins / 60.0) : fixHour(dhuhrNoon + altOffset(-spec.ishaAngle));
  const dhuhr = fixHour(dhuhrNoon + 2 / 60);
  const sehriEnds = fixHour(fajr - 5 / 60);
  const nightDur = fajr + 24 - maghrib;
  const tahajjud = fixHour(maghrib + (nightDur * 2) / 3);

  return { fajr, sunrise, dhuhr, asr, maghrib, isha, sehriEnds, tahajjud };
}

function formatHour(decHour: number): string {
  const totalMin = Math.round(fixHour(decHour) * 60) % (24 * 60);
  const h24 = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 === 0 ? 12 : h24 > 12 ? h24 - 12 : h24;
  return `${String(h12).padStart(2, '0')}:${String(m).padStart(2, '0')} ${ampm}`;
}

export const IslamicDailyView: React.FC<IslamicDailyViewProps> = ({ onNavigate, showToast }) => {
  const [tab, setTab] = useState<'QIBLA' | 'SALAH' | 'TASBIH'>('QIBLA');
  const [cityIdx, setCityIdx] = useState<number>(() => Number(localStorage.getItem('sk_city_idx') || 0));
  const [customCoords, setCustomCoords] = useState<{ lat: number; lng: number; tz: number; label: string } | null>(null);
  const [method, setMethod] = useState<CalcMethodKey>('KARACHI');
  const [asrSchool, setAsrSchool] = useState<AsrSchool>('HANAFI');

  // Compass state
  const [heading, setHeading] = useState<number>(0);
  const [sensorActive, setSensorActive] = useState(false);

  // Tasbih state
  const [zikrIdx, setZikrIdx] = useState<number>(() => Number(localStorage.getItem('sk_zikr_idx') || 0));
  const [tasbihCount, setTasbihCount] = useState<number>(() => Number(localStorage.getItem('sk_tasbih_count') || 0));
  const [tasbihTarget, setTasbihTarget] = useState<number>(() => Number(localStorage.getItem('sk_tasbih_target') || 33));
  const [tasbihRounds, setTasbihRounds] = useState<number>(() => Number(localStorage.getItem('sk_tasbih_rounds') || 0));

  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      const webkitHeading = (e as DeviceOrientationEvent & { webkitCompassHeading?: number }).webkitCompassHeading;
      if (typeof webkitHeading === 'number') {
        setHeading(webkitHeading);
        setSensorActive(true);
      } else if (typeof e.alpha === 'number') {
        setHeading((360 - e.alpha) % 360);
        setSensorActive(true);
      }
    };
    window.addEventListener('deviceorientation', handler, true);
    return () => window.removeEventListener('deviceorientation', handler, true);
  }, []);

  const activeLoc = customCoords || {
    lat: PRESET_CITIES[cityIdx]?.lat ?? 34.4922,
    lng: PRESET_CITIES[cityIdx]?.lng ?? 72.4789,
    tz: PRESET_CITIES[cityIdx]?.tz ?? 5.0,
    label: PRESET_CITIES[cityIdx]?.name ?? 'Buner, PK',
  };

  const qiblaBearing = useMemo(() => calculateQiblaBearing(activeLoc.lat, activeLoc.lng), [activeLoc.lat, activeLoc.lng]);
  const distanceKm = useMemo(() => calculateKaabaDistanceKm(activeLoc.lat, activeLoc.lng), [activeLoc.lat, activeLoc.lng]);
  const schedule = useMemo(
    () => computePrayerSchedule(new Date(), activeLoc.lat, activeLoc.lng, activeLoc.tz, method, asrSchool),
    [activeLoc.lat, activeLoc.lng, activeLoc.tz, method, asrSchool]
  );

  const nextPrayerInfo = useMemo(() => {
    const now = new Date();
    const cur = now.getHours() + now.getMinutes() / 60 + now.getSeconds() / 3600;
    const list = [
      { name: 'Fajr', time: schedule.fajr },
      { name: 'Sunrise', time: schedule.sunrise },
      { name: 'Dhuhr', time: schedule.dhuhr },
      { name: 'Asr', time: schedule.asr },
      { name: 'Maghrib', time: schedule.maghrib },
      { name: 'Isha', time: schedule.isha },
    ];
    const next = list.find((s) => s.time > cur);
    const name = next ? next.name : 'Fajr (Tomorrow)';
    const diff = next ? next.time - cur : schedule.fajr + 24 - cur;
    const totalM = Math.max(0, Math.round(diff * 60));
    const h = Math.floor(totalM / 60);
    const m = totalM % 60;
    return { name, rem: h > 0 ? `${h}h ${m}m remaining` : `${m}m remaining` };
  }, [schedule]);

  const relativeQibla = qiblaBearing - heading;
  const alignedDiff = Math.abs(((relativeQibla + 540) % 360) - 180);
  const isAligned = alignedDiff <= 6;

  const handleUseGps = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation not supported in this browser; using city preset.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const tz = -new Date().getTimezoneOffset() / 60;
        setCustomCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          tz,
          label: `GPS (${pos.coords.latitude.toFixed(3)}°, ${pos.coords.longitude.toFixed(3)}°)`,
        });
        showToast('GPS location updated for Qibla & Prayer Times!');
      },
      () => showToast('GPS permission denied — select a city preset below.')
    );
  };

  const handleTasbihTap = () => {
    try {
      if (navigator.vibrate) navigator.vibrate(25);
    } catch { /* ignore */ }
    const nextVal = tasbihCount + 1;
    if (nextVal >= tasbihTarget) {
      setTasbihCount(0);
      const nextRounds = tasbihRounds + 1;
      setTasbihRounds(nextRounds);
      localStorage.setItem('sk_tasbih_count', '0');
      localStorage.setItem('sk_tasbih_rounds', String(nextRounds));
      try { if (navigator.vibrate) navigator.vibrate([40, 40, 80]); } catch { /* ignore */ }
    } else {
      setTasbihCount(nextVal);
      localStorage.setItem('sk_tasbih_count', String(nextVal));
    }
  };

  return (
    <div className="space-y-4">
      {/* Location Card */}
      <div className="rounded-2xl bg-emerald-900 text-white p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] font-bold tracking-wider uppercase text-amber-300">Active Location</div>
            <div className="font-bold text-sm">{activeLoc.label}</div>
          </div>
          <button
            type="button"
            onClick={handleUseGps}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold transition"
          >
            <MapPin className="w-3.5 h-3.5" /> GPS
          </button>
        </div>

        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {PRESET_CITIES.map((city, idx) => (
            <button
              key={city.name}
              type="button"
              onClick={() => {
                setCustomCoords(null);
                setCityIdx(idx);
                localStorage.setItem('sk_city_idx', String(idx));
              }}
              className={`shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                !customCoords && cityIdx === idx
                  ? 'bg-amber-400 text-emerald-950 font-bold'
                  : 'bg-white/10 text-emerald-100 hover:bg-white/20'
              }`}
            >
              {city.name.replace(', PK', '')}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="grid grid-cols-4 gap-1.5 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-2xl">
        {[
          { id: 'QIBLA' as const, label: 'Qibla', icon: Compass },
          { id: 'SALAH' as const, label: 'Salah Times', icon: Clock },
          { id: 'TASBIH' as const, label: 'Tasbih', icon: Fingerprint },
        ].map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                active
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-white/60 dark:hover:bg-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => onNavigate('IslamicHub')}
          className="py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 text-emerald-800 dark:text-emerald-300 hover:bg-white/60 dark:hover:bg-slate-700 transition"
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Library</span>
        </button>
      </div>

      {/* QIBLA TAB */}
      {tab === 'QIBLA' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col items-center space-y-4">
          <div
            className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
              isAligned
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border-emerald-500'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
            }`}
          >
            {isAligned ? 'Aligned Towards Holy Kaaba!' : `Turn phone ${Math.round(alignedDiff)}° toward Kaaba needle`}
          </div>

          {/* Compass Dial */}
          <div className="relative w-60 h-60 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full border-4 border-emerald-900/20 dark:border-emerald-500/30 transition-transform duration-150 flex items-center justify-center"
              style={{ transform: `rotate(${-heading}deg)` }}
            >
              <span className="absolute top-2 font-black text-xs text-rose-600">N</span>
              <span className="absolute right-2.5 font-bold text-xs text-slate-400">E</span>
              <span className="absolute bottom-2 font-bold text-xs text-slate-400">S</span>
              <span className="absolute left-2.5 font-bold text-xs text-slate-400">W</span>
            </div>

            {/* Qibla Pointer */}
            <div
              className="w-44 h-44 flex items-center justify-center transition-transform duration-150"
              style={{ transform: `rotate(${relativeQibla}deg)` }}
            >
              <div className="flex flex-col items-center">
                <Navigation className={`w-12 h-12 ${isAligned ? 'text-emerald-600' : 'text-amber-500'} fill-current`} />
                <div className="mt-1 px-2 py-0.5 rounded bg-slate-900 text-amber-300 text-[9px] font-bold">
                  KAABA
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 w-full">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-semibold">Qibla Bearing</div>
              <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                {qiblaBearing.toFixed(1)}° True N
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 text-center">
              <div className="text-[10px] text-slate-500 font-semibold">Distance to Makkah</div>
              <div className="text-lg font-extrabold text-emerald-700 dark:text-emerald-400">
                {Math.round(distanceKm).toLocaleString()} km
              </div>
            </div>
          </div>

          {!sensorActive && (
            <div className="w-full space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Desktop / Test Compass Heading Simulator</span>
                <span className="font-bold">{Math.round(heading)}°</span>
              </div>
              <input
                type="range"
                min={0}
                max={359}
                value={heading}
                onChange={(e) => setHeading(Number(e.target.value))}
                className="w-full accent-emerald-700"
              />
            </div>
          )}
        </div>
      )}

      {/* SALAH TIMES TAB */}
      {tab === 'SALAH' && (
        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-500/40 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-400">Next Prayer</div>
              <div className="text-xl font-extrabold text-emerald-900 dark:text-white">{nextPrayerInfo.name}</div>
              <div className="text-xs text-slate-600 dark:text-slate-300">{nextPrayerInfo.rem}</div>
            </div>
            <div className="text-right text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              {new Date().toLocaleDateString(undefined, { weekday: 'short', day: '2-digit', month: 'short' })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as CalcMethodKey)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              {Object.entries(CALC_METHODS).map(([k, v]) => (
                <option key={k} value={k}>{v.name}</option>
              ))}
            </select>
            <select
              value={asrSchool}
              onChange={(e) => setAsrSchool(e.target.value as AsrSchool)}
              className="px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              <option value="HANAFI">Asr: Hanafi (2x Shadow)</option>
              <option value="SHAFI">Asr: Shafi&apos;i (1x Shadow)</option>
            </select>
          </div>

          <div className="space-y-2">
            {[
              { label: 'Sehri Ends (Suhoor)', time: schedule.sehriEnds, icon: Moon },
              { label: 'Fajr (Dawn)', time: schedule.fajr, icon: Sunrise },
              { label: 'Sunrise (Ishraq)', time: schedule.sunrise, icon: Sun },
              { label: 'Dhuhr (Noon)', time: schedule.dhuhr, icon: Sun },
              { label: `Asr (${asrSchool === 'HANAFI' ? 'Hanafi' : 'Shafi'})`, time: schedule.asr, icon: Sun },
              { label: 'Maghrib (Iftar)', time: schedule.maghrib, icon: Sunset },
              { label: 'Isha (Night)', time: schedule.isha, icon: Moon },
              { label: 'Tahajjud (Last 3rd Night)', time: schedule.tahajjud, icon: Sparkles },
            ].map((row) => {
              const Icon = row.icon;
              const isNext = row.label.startsWith(nextPrayerInfo.name.split(' ')[0]);
              return (
                <div
                  key={row.label}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
                    isNext
                      ? 'bg-emerald-900/10 dark:bg-emerald-900/40 border-emerald-600'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                    <span className="text-xs font-bold">{row.label}</span>
                  </div>
                  <span className="text-sm font-extrabold text-emerald-800 dark:text-emerald-300">
                    {formatHour(row.time)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TASBIH TAB */}
      {tab === 'TASBIH' && (
        <div className="space-y-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {ZIKR_PRESETS.map((z, i) => (
              <button
                key={z.latin}
                type="button"
                onClick={() => {
                  setZikrIdx(i);
                  localStorage.setItem('sk_zikr_idx', String(i));
                }}
                className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  zikrIdx === i
                    ? 'bg-emerald-700 text-white'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {z.latin}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            {[33, 99, 100, 1000].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setTasbihTarget(t);
                  localStorage.setItem('sk_tasbih_target', String(t));
                }}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold border ${
                  tasbihTarget === t
                    ? 'bg-amber-400/20 border-amber-500 text-amber-700 dark:text-amber-300'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                }`}
              >
                Target {t}
              </button>
            ))}
          </div>

          <div
            onClick={handleTasbihTap}
            className="rounded-3xl bg-emerald-900 text-white p-7 flex flex-col items-center justify-center gap-4 cursor-pointer select-none active:scale-[0.99] transition shadow-lg"
          >
            <div className="text-2xl font-bold text-amber-300 text-center" dir="rtl">
              {ZIKR_PRESETS[zikrIdx]?.arabic}
            </div>
            <div className="text-xs text-emerald-100 text-center">
              {ZIKR_PRESETS[zikrIdx]?.latin} — {ZIKR_PRESETS[zikrIdx]?.meaning}
            </div>

            <div className="w-40 h-40 rounded-full border-4 border-amber-400 bg-white/10 flex flex-col items-center justify-center">
              <span className="text-5xl font-black">{tasbihCount}</span>
              <span className="text-xs font-bold text-amber-300 mt-1">/ {tasbihTarget}</span>
            </div>

            <div className="text-[11px] text-emerald-200">
              Tap anywhere to count • Completed Rounds: <strong>{tasbihRounds}</strong>
            </div>

            <div className="flex gap-3 pt-1" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                onClick={() => {
                  setTasbihCount(0);
                  localStorage.setItem('sk_tasbih_count', '0');
                }}
                className="px-3.5 py-1.5 rounded-xl border border-white/30 text-xs font-bold hover:bg-white/10 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset Count
              </button>
              <button
                type="button"
                onClick={() => {
                  setTasbihCount(0);
                  setTasbihRounds(0);
                  localStorage.setItem('sk_tasbih_count', '0');
                  localStorage.setItem('sk_tasbih_rounds', '0');
                }}
                className="px-3.5 py-1.5 rounded-xl border border-amber-400/50 text-amber-300 text-xs font-bold hover:bg-amber-400/10"
              >
                Reset All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
