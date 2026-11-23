import React, { useState } from 'react';
import { Activity, Brain, AlertTriangle, Baby } from 'lucide-react';

type Severity = 'NORMAL' | 'MODERATE' | 'HIGH' | 'CRITICAL';

function evaluateAbg(ph: number, paco2: number, hco3: number, na: number, cl: number, albumin: number) {
  const rawAg = na - (cl + hco3);
  const correctedAg = rawAg + 2.5 * (4.0 - albumin);
  let primary = 'Normal Acid-Base Balance';
  let compensation = 'Within normal reference limits.';
  let severity: Severity = 'NORMAL';

  if (ph >= 7.35 && ph <= 7.45 && paco2 >= 35 && paco2 <= 45 && hco3 >= 22 && hco3 <= 26) {
    primary = 'Normal Acid-Base Balance';
  } else if (ph < 7.35 || (ph <= 7.40 && (paco2 > 45 || hco3 < 22))) {
    if (paco2 > 45 && hco3 < 22) {
      primary = 'Mixed Respiratory & Metabolic Acidosis';
      compensation = 'Both elevated PaCO2 and low HCO3- drive acidemia.';
      severity = 'CRITICAL';
    } else if (paco2 > 45) {
      primary = 'Primary Respiratory Acidosis';
      const acute = 24 + ((paco2 - 40) / 10) * 1.0;
      const chronic = 24 + ((paco2 - 40) / 10) * 3.5;
      compensation = `Expected HCO3-: Acute ~${acute.toFixed(1)}, Chronic ~${chronic.toFixed(1)} mEq/L (Actual ${hco3.toFixed(1)})`;
      severity = ph < 7.20 ? 'CRITICAL' : 'HIGH';
    } else {
      primary = 'Primary Metabolic Acidosis';
      const wLow = 1.5 * hco3 + 6;
      const wHigh = 1.5 * hco3 + 10;
      if (paco2 < wLow) compensation = `Winter's Expected PaCO2: ${wLow.toFixed(1)}–${wHigh.toFixed(1)} mmHg. Actual lower -> concomitant Respiratory Alkalosis.`;
      else if (paco2 > wHigh) compensation = `Winter's Expected PaCO2: ${wLow.toFixed(1)}–${wHigh.toFixed(1)} mmHg. Actual higher -> concomitant Respiratory Acidosis.`;
      else compensation = `Appropriate respiratory compensation (Winter's range ${wLow.toFixed(1)}–${wHigh.toFixed(1)} mmHg).`;
      severity = ph < 7.20 || hco3 < 12 ? 'CRITICAL' : 'HIGH';
    }
  } else {
    if (paco2 < 35 && hco3 > 26) {
      primary = 'Mixed Respiratory & Metabolic Alkalosis';
      compensation = 'Both low PaCO2 and high HCO3- elevate pH.';
      severity = 'HIGH';
    } else if (paco2 < 35) {
      primary = 'Primary Respiratory Alkalosis';
      const acute = 24 - ((40 - paco2) / 10) * 2.0;
      const chronic = 24 - ((40 - paco2) / 10) * 5.0;
      compensation = `Expected HCO3-: Acute ~${acute.toFixed(1)}, Chronic ~${chronic.toFixed(1)} mEq/L (Actual ${hco3.toFixed(1)})`;
      severity = ph > 7.55 ? 'HIGH' : 'MODERATE';
    } else {
      primary = 'Primary Metabolic Alkalosis';
      const expPaco2 = 0.7 * (hco3 - 24) + 40;
      compensation = `Expected compensatory PaCO2 ~${expPaco2.toFixed(1)} mmHg (Actual ${paco2.toFixed(1)} mmHg).`;
      severity = ph > 7.55 ? 'HIGH' : 'MODERATE';
    }
  }

  const agNote =
    correctedAg > 16
      ? 'High Anion Gap Metabolic Acidosis (HAGMA — MUDPILES: DKA, Uremia, Lactic acidosis, Salicylates, Toxic alcohols).'
      : correctedAg > 12
      ? 'Borderline / Mildly Elevated Anion Gap.'
      : 'Normal Anion Gap (8–12 mEq/L). Consider Hyperchloremic / NAGMA if acidemic.';

  const excessAg = correctedAg - 12;
  const hco3Drop = 24 - hco3;
  let deltaNote = 'Delta ratio applies when Anion Gap > 14 mEq/L.';
  if (correctedAg > 14 && Math.abs(hco3Drop) > 0.5) {
    const ratio = excessAg / hco3Drop;
    if (ratio < 0.8) deltaNote = `Delta Ratio ${ratio.toFixed(2)} (<0.8): Combined HAGMA + Normal-AG Metabolic Acidosis`;
    else if (ratio > 2.0) deltaNote = `Delta Ratio ${ratio.toFixed(2)} (>2.0): Concurrent Metabolic Alkalosis or chronic hypercapnia`;
    else deltaNote = `Delta Ratio ${ratio.toFixed(2)} (0.8–2.0): Pure High-Anion Gap Metabolic Acidosis`;
  }

  return { primary, compensation, rawAg, correctedAg, agNote, deltaNote, severity };
}

function severityClasses(sev: Severity) {
  switch (sev) {
    case 'CRITICAL': return 'border-rose-600 bg-rose-500/10 text-rose-700 dark:text-rose-400';
    case 'HIGH': return 'border-orange-500 bg-orange-500/10 text-orange-700 dark:text-orange-400';
    case 'MODERATE': return 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400';
    default: return 'border-emerald-600 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400';
  }
}

export const ClinicalScoresView: React.FC = () => {
  const [tab, setTab] = useState<'ABG' | 'GCS' | 'NEWS2' | 'APGAR'>('ABG');

  // ABG state
  const [ph, setPh] = useState('7.24');
  const [paco2, setPaco2] = useState('26');
  const [hco3, setHco3] = useState('11');
  const [na, setNa] = useState('140');
  const [cl, setCl] = useState('102');
  const [alb, setAlb] = useState('4.0');

  // GCS state
  const [eye, setEye] = useState(4);
  const [verbal, setVerbal] = useState(5);
  const [motor, setMotor] = useState(6);

  // NEWS2 state
  const [rr, setRr] = useState('22');
  const [spo2, setSpo2] = useState('94');
  const [suppO2, setSuppO2] = useState(false);
  const [sbp, setSbp] = useState('96');
  const [hr, setHr] = useState('114');
  const [temp, setTemp] = useState('38.4');
  const [isAlert, setIsAlert] = useState(true);

  // APGAR + Peds
  const [apgar, setApgar] = useState([2, 2, 2, 2, 2]);
  const [childAge, setChildAge] = useState('4');

  const abgRes = evaluateAbg(
    parseFloat(ph) || 7.4,
    parseFloat(paco2) || 40,
    parseFloat(hco3) || 24,
    parseFloat(na) || 140,
    parseFloat(cl) || 104,
    parseFloat(alb) || 4.0
  );

  const gcsTotal = eye + verbal + motor;
  const gcsSev: Severity = gcsTotal <= 8 ? 'CRITICAL' : gcsTotal <= 12 ? 'HIGH' : gcsTotal <= 14 ? 'MODERATE' : 'NORMAL';

  // NEWS2 & qSOFA
  const rrN = parseInt(rr) || 16;
  const spo2N = parseInt(spo2) || 98;
  const sbpN = parseInt(sbp) || 120;
  const hrN = parseInt(hr) || 80;
  const tempN = parseFloat(temp) || 37.0;

  const pts = [
    rrN <= 8 || rrN >= 25 ? 3 : rrN >= 21 ? 2 : rrN <= 11 ? 1 : 0,
    spo2N <= 91 ? 3 : spo2N <= 93 ? 2 : spo2N <= 95 ? 1 : 0,
    sbpN <= 90 || sbpN >= 220 ? 3 : sbpN <= 100 ? 2 : sbpN <= 110 ? 1 : 0,
    hrN <= 40 || hrN >= 131 ? 3 : hrN >= 111 ? 2 : hrN <= 50 || hrN >= 91 ? 1 : 0,
    tempN <= 35.0 ? 3 : tempN >= 39.1 ? 2 : tempN <= 36.0 || tempN >= 38.1 ? 1 : 0,
    isAlert ? 0 : 3,
  ];
  const news2Score = pts.reduce((a, b) => a + b, 0) + (suppO2 ? 2 : 0);
  const hasRedParam = pts.some((p) => p === 3);
  const qsofa = (rrN >= 22 ? 1 : 0) + (sbpN <= 100 ? 1 : 0) + (!isAlert ? 1 : 0);
  const newsSev: Severity = news2Score >= 7 ? 'CRITICAL' : news2Score >= 5 ? 'HIGH' : hasRedParam ? 'MODERATE' : 'NORMAL';

  const apgarTotal = apgar.reduce((a, b) => a + b, 0);
  const ageY = parseFloat(childAge) || 4;
  const estWt = ageY < 1 ? Math.max(3.5, ageY * 12 * 0.5 + 4) : ageY <= 5 ? 2 * (ageY + 4) : 3 * ageY + 7;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-1.5 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-2xl">
        {[
          { id: 'ABG' as const, label: 'ABG/AG', icon: Activity },
          { id: 'GCS' as const, label: 'GCS', icon: Brain },
          { id: 'NEWS2' as const, label: 'NEWS2', icon: AlertTriangle },
          { id: 'APGAR' as const, label: 'APGAR', icon: Baby },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`py-2 px-1 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition ${
                tab === item.id ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {tab === 'ABG' && (
        <div className="space-y-3">
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {[
              { label: 'DKA HAGMA', ph: '7.24', paco2: '26', hco3: '11', na: '140', cl: '102', alb: '4.0' },
              { label: 'COPD Resp Acid', ph: '7.31', paco2: '64', hco3: '31', na: '139', cl: '99', alb: '4.0' },
              { label: 'Met Alkalosis', ph: '7.51', paco2: '47', hco3: '36', na: '136', cl: '90', alb: '4.0' },
            ].map((p) => (
              <button
                key={p.label}
                type="button"
                onClick={() => { setPh(p.ph); setPaco2(p.paco2); setHco3(p.hco3); setNa(p.na); setCl(p.cl); setAlb(p.alb); }}
                className="shrink-0 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-rose-500"
              >
                {p.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { lbl: 'pH (7.35-7.45)', val: ph, set: setPh },
              { lbl: 'PaCO2 (35-45)', val: paco2, set: setPaco2 },
              { lbl: 'HCO3- (22-26)', val: hco3, set: setHco3 },
              { lbl: 'Na+ (mEq/L)', val: na, set: setNa },
              { lbl: 'Cl- (mEq/L)', val: cl, set: setCl },
              { lbl: 'Albumin (g/dL)', val: alb, set: setAlb },
            ].map((f) => (
              <label key={f.lbl} className="block bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 block mb-1">{f.lbl}</span>
                <input
                  type="number"
                  step="0.01"
                  value={f.val}
                  onChange={(e) => f.set(e.target.value)}
                  className="w-full text-sm font-bold bg-transparent outline-hidden"
                />
              </label>
            ))}
          </div>

          <div className={`p-4 rounded-2xl border-2 space-y-2 ${severityClasses(abgRes.severity)}`}>
            <div className="text-base font-extrabold">{abgRes.primary}</div>
            <div className="text-xs text-slate-800 dark:text-slate-200">{abgRes.compensation}</div>
            <div className="pt-2 border-t border-current/20 flex justify-between text-xs font-bold text-slate-900 dark:text-white">
              <span>Raw AG: {abgRes.rawAg.toFixed(1)} mEq/L</span>
              <span>Albumin-Corrected AG: {abgRes.correctedAg.toFixed(1)} mEq/L</span>
            </div>
            <div className="text-xs text-slate-700 dark:text-slate-300">{abgRes.agNote}</div>
            <div className="text-[11px] text-slate-500">{abgRes.deltaNote}</div>
          </div>
        </div>
      )}

      {tab === 'GCS' && (
        <div className="space-y-3">
          {[
            { title: 'Eye Opening (E)', val: eye, set: setEye, opts: [[4, '4 Spontaneous'], [3, '3 To Sound'], [2, '2 To Pressure'], [1, '1 None']] as [number, string][] },
            { title: 'Verbal Response (V)', val: verbal, set: setVerbal, opts: [[5, '5 Oriented'], [4, '4 Confused'], [3, '3 Words'], [2, '2 Sounds'], [1, '1 None']] as [number, string][] },
            { title: 'Motor Response (M)', val: motor, set: setMotor, opts: [[6, '6 Obeys'], [5, '5 Localizes'], [4, '4 Withdraws'], [3, '3 Flexion'], [2, '2 Extension'], [1, '1 None']] as [number, string][] },
          ].map((sec) => (
            <div key={sec.title} className="bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="text-xs font-bold">{sec.title}</div>
              <div className="flex flex-wrap gap-1.5">
                {sec.opts.map(([v, l]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => sec.set(v)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                      sec.val === v ? 'bg-rose-600 text-white border-rose-600' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className={`p-4 rounded-2xl border-2 space-y-1 ${severityClasses(gcsSev)}`}>
            <div className="text-xl font-black">GCS {gcsTotal}/15 (E{eye} V{verbal} M{motor})</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {gcsTotal <= 8 ? 'Severe Brain Injury / Coma (Protect Airway <=8)' : gcsTotal <= 12 ? 'Moderate Neuro Impairment' : gcsTotal <= 14 ? 'Mild Impairment / Confusion' : 'Fully Alert & Oriented'}
            </div>
          </div>
        </div>
      )}

      {tab === 'NEWS2' && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-2">
            {[
              { lbl: 'RR (/min)', val: rr, set: setRr },
              { lbl: 'SpO2 (%)', val: spo2, set: setSpo2 },
              { lbl: 'Sys BP', val: sbp, set: setSbp },
              { lbl: 'Heart Rate', val: hr, set: setHr },
              { lbl: 'Temp (°C)', val: temp, set: setTemp },
            ].map((f) => (
              <label key={f.lbl} className="block bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-bold text-slate-500 block mb-1">{f.lbl}</span>
                <input type="number" step="0.1" value={f.val} onChange={(e) => f.set(e.target.value)} className="w-full text-sm font-bold bg-transparent outline-hidden" />
              </label>
            ))}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setSuppO2(!suppO2)} className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border ${suppO2 ? 'bg-amber-500/20 border-amber-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
              Supp O2: {suppO2 ? 'YES (+2)' : 'No'}
            </button>
            <button type="button" onClick={() => setIsAlert(!isAlert)} className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold border ${!isAlert ? 'bg-rose-500/20 border-rose-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}>
              AVPU: {isAlert ? 'Alert (0)' : 'V/P/U (+3)'}
            </button>
          </div>

          <div className={`p-4 rounded-2xl border-2 space-y-2 ${severityClasses(newsSev)}`}>
            <div className="text-xl font-black">NEWS2 Score: {news2Score}</div>
            <div className="text-xs font-bold text-slate-900 dark:text-white">
              {news2Score >= 7 ? 'HIGH CLINICAL RISK (>=7) — Immediate Critical Care Review' : news2Score >= 5 ? 'MEDIUM RISK (5–6) — Urgent Medical Review <30m' : hasRedParam ? 'LOW-MEDIUM (Single Red Parameter = 3)' : 'LOW CLINICAL RISK'}
            </div>
            <div className="pt-2 border-t border-current/20 text-xs font-bold">
              qSOFA Sepsis Screen: {qsofa}/3 — {qsofa >= 2 ? 'HIGH SEPSIS RISK (Sepsis-6 Bundle)' : 'Low qSOFA Risk'}
            </div>
          </div>
        </div>
      )}

      {tab === 'APGAR' && (
        <div className="space-y-3">
          {[
            { name: 'Appearance', opts: ['0 Blue/Pale', '1 Acrocyanosis', '2 Pink'] },
            { name: 'Pulse', opts: ['0 Absent', '1 <100', '2 >=100 bpm'] },
            { name: 'Grimace', opts: ['0 None', '1 Grimace', '2 Cry'] },
            { name: 'Activity', opts: ['0 Limp', '1 Flexion', '2 Active'] },
            { name: 'Respiration', opts: ['0 Absent', '1 Slow/Weak', '2 Strong Cry'] },
          ].map((row, rIdx) => (
            <div key={row.name} className="flex items-center justify-between gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold">{row.name}</span>
              <div className="flex gap-1">
                {row.opts.map((lbl, val) => (
                  <button
                    key={lbl}
                    type="button"
                    onClick={() => setApgar((prev) => prev.map((x, idx) => (idx === rIdx ? val : x)))}
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold ${
                      apgar[rIdx] === val ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800'
                    }`}
                  >
                    {lbl}
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className={`p-3.5 rounded-2xl border-2 ${severityClasses(apgarTotal <= 3 ? 'CRITICAL' : apgarTotal <= 6 ? 'MODERATE' : 'NORMAL')}`}>
            <div className="font-black text-base">APGAR Score: {apgarTotal} / 10</div>
            <div className="text-xs text-slate-800 dark:text-slate-200">
              {apgarTotal >= 7 ? 'Reassuring newborn status' : apgarTotal >= 4 ? 'Moderately depressed — stimulate & CPAP/PPV' : 'Severely depressed — Immediate NRP resuscitation'}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold">APLS Pediatric Estimator — Age (yrs):</span>
              <input type="number" step="0.5" value={childAge} onChange={(e) => setChildAge(e.target.value)} className="w-20 px-2 py-1 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-bold text-right bg-transparent" />
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-xs pt-1">
              <div>Weight: <strong>{estWt.toFixed(1)} kg</strong></div>
              <div>ETT: <strong>{(ageY / 4 + 3.5).toFixed(1)} mm</strong> cuffed</div>
              <div>Fluid Bolus: <strong>{Math.round(estWt * 20)} mL</strong></div>
              <div>Epi (1:10k): <strong>{(estWt * 0.1).toFixed(1)} mL</strong></div>
              <div>Defib (4J/kg): <strong>{Math.max(10, Math.round(estWt * 4))} J</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
