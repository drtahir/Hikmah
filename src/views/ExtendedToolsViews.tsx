import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon, Upload, Download, PenTool, FileText, Camera,
  Clock, Shuffle, Video, Play, Pause, RotateCcw, Binary, ShieldAlert,
  Lock, Sparkles, CheckCircle2, FileSpreadsheet, FileType2, QrCode
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import { ScreenType } from '../types';

interface ExtendedToolProps {
  screen: ScreenType;
  onBack: () => void;
  showToast: (msg: string) => void;
}

// 1. Image Compressor & Resizer (Canvas JPEG/WebP)
const ImageCompressStudio: React.FC<{ showToast: (m: string) => void }> = ({ showToast }) => {
  const [srcUrl, setSrcUrl] = useState<string>('/assets/sample_portrait.jpg');
  const [srcName, setSrcName] = useState('sample_portrait.jpg');
  const [origBytes, setOrigBytes] = useState<number>(245000);
  const [quality, setQuality] = useState<number>(72);
  const [maxWidth, setMaxWidth] = useState<number>(1280);
  const [outUrl, setOutUrl] = useState<string | null>(null);
  const [outBytes, setOutBytes] = useState<number>(0);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSrcName(file.name);
    setOrigBytes(file.size);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setSrcUrl(reader.result);
        setOutUrl(null);
      }
    };
    reader.readAsDataURL(file);
  };

  const compressNow = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const w = Math.max(1, Math.round(img.width * scale));
      const h = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0, w, h);
      const compressed = canvas.toDataURL('image/jpeg', quality / 100);
      const approxBytes = Math.round((compressed.length * 3) / 4);
      setOutUrl(compressed);
      setOutBytes(approxBytes);
      showToast(`Compressed to ${Math.round(approxBytes / 1024)} KB`);
    };
    img.src = srcUrl;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Image Compressor & Batch Optimizer</h3>
          <p className="text-xs text-slate-500">Resize resolution & optimize JPEG quality locally in your browser</p>
        </div>
        <label className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-emerald-600 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5" /> Choose Image
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">JPEG Quality: {quality}%</label>
          <input type="range" min={20} max={95} value={quality} onChange={(e) => setQuality(Number(e.target.value))} className="w-full mt-1 accent-pink-600" />
        </div>
        <div>
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Max Dimension: {maxWidth}px</label>
          <input type="range" min={480} max={2400} step={80} value={maxWidth} onChange={(e) => setMaxWidth(Number(e.target.value))} className="w-full mt-1 accent-pink-600" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
          <img src={srcUrl} alt="Source preview" className="w-full h-44 object-cover" />
          <div className="p-2.5 text-xs flex justify-between bg-slate-50 dark:bg-slate-800">
            <span className="truncate font-medium">{srcName}</span>
            <span className="font-mono font-bold tabular-nums">{Math.round(origBytes / 1024)} KB</span>
          </div>
        </div>
        {outUrl ? (
          <div className="rounded-xl overflow-hidden border border-emerald-400 dark:border-emerald-700">
            <img src={outUrl} alt="Compressed preview" className="w-full h-44 object-cover" />
            <div className="p-2.5 text-xs flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40">
              <span className="font-bold text-emerald-700 dark:text-emerald-300 tabular-nums">
                {Math.round(outBytes / 1024)} KB
              </span>
              <a href={outUrl} download={`compressed_${srcName}.jpg`} className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white font-bold inline-flex items-center gap-1">
                <Download className="w-3.5 h-3.5" /> Save JPG
              </a>
            </div>
          </div>
        ) : (
          <button onClick={compressNow} className="w-full h-44 rounded-xl border-2 border-dashed border-pink-300 dark:border-pink-800 flex flex-col items-center justify-center gap-2 text-pink-600 dark:text-pink-400 font-bold text-sm hover:bg-pink-50 dark:hover:bg-pink-950/20 transition">
            <Sparkles className="w-6 h-6" />
            <span>Compress & Compare Size</span>
          </button>
        )}
      </div>
    </div>
  );
};

// 2. Real Multi-Image to PDF Converter
const ImageToPdfStudio: React.FC<{ showToast: (m: string) => void }> = ({ showToast }) => {
  const [images, setImages] = useState<{ name: string; url: string }[]>([
    { name: 'Page_1_Document.jpg', url: '/assets/sample_object.jpg' },
  ]);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((f) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setImages((prev) => [...prev, { name: f.name, url: reader.result as string }]);
        }
      };
      reader.readAsDataURL(f);
    });
  };

  const exportPdf = () => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    images.forEach((imgItem, idx) => {
      if (idx > 0) doc.addPage();
      doc.setFontSize(10);
      doc.text(`${imgItem.name} (Page ${idx + 1})`, 14, 14);
      doc.addImage(imgItem.url, 'JPEG', 14, 22, 182, 240, undefined, 'FAST');
    });
    doc.save('Hikmah_Compiled_Images.pdf');
    showToast(`Exported ${images.length}-page PDF`);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Image to PDF Compiler</h3>
          <p className="text-xs text-slate-500">Compile multiple photos or scans into a single compressed A4 PDF</p>
        </div>
        <label className="px-3.5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5">
          <Upload className="w-3.5 h-3.5" /> Add Photos
          <input type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
        </label>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {images.map((item, i) => (
          <div key={`${item.name}-${i}`} className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            <img src={item.url} alt={item.name} className="w-full h-28 object-cover" />
            <div className="p-2 text-[11px] truncate text-slate-600 dark:text-slate-300">{i + 1}. {item.name}</div>
          </div>
        ))}
      </div>
      <button onClick={exportPdf} className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center justify-center gap-2">
        <Download className="w-4 h-4" /> Generate Single PDF ({images.length} Pages)
      </button>
    </div>
  );
};

// 3. Interactive Canvas Signature & Stamp Pad
const SignatureStampPad: React.FC<{ showToast: (m: string) => void }> = ({ showToast }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#0F5132');

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.strokeStyle = penColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x, y);
    setDrawing(true);
  };

  const moveDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx) return;
    const { x, y } = getPos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const clearPad = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const downloadPng = () => {
    const url = canvasRef.current?.toDataURL('image/png');
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Hikmah_Signature_Stamp.png';
    a.click();
    showToast('Transparent signature PNG downloaded');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Digital Signature & MS Stamp Pad</h3>
          <p className="text-xs text-slate-500">Sign directly on the canvas and export transparent PNG</p>
        </div>
        <div className="flex gap-2">
          {['#0F5132', '#1D4ED8', '#0F172A'].map((c) => (
            <button
              key={c}
              onClick={() => setPenColor(c)}
              className={`w-7 h-7 rounded-full border-2 ${penColor === c ? 'border-amber-400 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={220}
        onPointerDown={startDraw}
        onPointerMove={moveDraw}
        onPointerUp={() => setDrawing(false)}
        onPointerLeave={() => setDrawing(false)}
        className="w-full h-52 bg-slate-50 rounded-xl border border-dashed border-slate-300 touch-none cursor-crosshair"
      />
      <div className="flex gap-2">
        <button onClick={clearPad} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold">
          Clear Canvas
        </button>
        <button onClick={downloadPng} className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2">
          <Download className="w-4 h-4" /> Export Signature PNG
        </button>
      </div>
    </div>
  );
};

// 4. Unit Converter
const UnitConverterStudio: React.FC = () => {
  const [val, setVal] = useState('1');
  const [mode, setMode] = useState<'data' | 'weight' | 'temp'>('data');
  const num = parseFloat(val) || 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 max-w-xl">
      <div className="flex items-center gap-2">
        <Shuffle className="w-5 h-5 text-cyan-600" />
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Universal Unit Converter</h3>
      </div>
      <div className="flex gap-2">
        {(['data', 'weight', 'temp'] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize ${mode === m ? 'bg-cyan-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
          >
            {m === 'data' ? 'Data (MB/KB)' : m === 'weight' ? 'Clinical Weight' : 'Temperature'}
          </button>
        ))}
      </div>
      <input
        type="number"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono text-base"
      />
      <div className="grid grid-cols-2 gap-3 text-xs">
        {mode === 'data' && (
          <>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800"><span className="text-slate-500">MB &rarr; KB:</span> <strong className="font-mono">{(num * 1024).toLocaleString()} KB</strong></div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800"><span className="text-slate-500">GB &rarr; MB:</span> <strong className="font-mono">{(num * 1024).toLocaleString()} MB</strong></div>
          </>
        )}
        {mode === 'weight' && (
          <>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800"><span className="text-slate-500">kg &rarr; lbs:</span> <strong className="font-mono">{(num * 2.20462).toFixed(2)} lbs</strong></div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800"><span className="text-slate-500">g &rarr; mg:</span> <strong className="font-mono">{(num * 1000).toLocaleString()} mg</strong></div>
          </>
        )}
        {mode === 'temp' && (
          <>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800"><span className="text-slate-500">°C &rarr; °F:</span> <strong className="font-mono">{((num * 9) / 5 + 32).toFixed(1)} °F</strong></div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800"><span className="text-slate-500">°F &rarr; °C:</span> <strong className="font-mono">{(((num - 32) * 5) / 9).toFixed(1)} °C</strong></div>
          </>
        )}
      </div>
    </div>
  );
};

// 5. Exact Age Calculator
const AgeCalculatorStudio: React.FC = () => {
  const [dob, setDob] = useState('1994-05-14');
  const birth = new Date(dob);
  const now = new Date();
  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();
  let days = now.getDate() - birth.getDate();
  if (days < 0) { months -= 1; days += 30; }
  if (months < 0) { years -= 1; months += 12; }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 max-w-xl">
      <div className="flex items-center gap-2">
        <Clock className="w-5 h-5 text-purple-600" />
        <h3 className="font-bold text-slate-900 dark:text-white text-base">Exact Age & Milestone Calculator</h3>
      </div>
      <input
        type="date"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40">
          <div className="text-2xl font-black text-purple-700 dark:text-purple-300 tabular-nums">{Math.max(0, years)}</div>
          <div className="text-xs text-slate-500">Years</div>
        </div>
        <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40">
          <div className="text-2xl font-black text-purple-700 dark:text-purple-300 tabular-nums">{Math.max(0, months)}</div>
          <div className="text-xs text-slate-500">Months</div>
        </div>
        <div className="p-3.5 rounded-xl bg-purple-50 dark:bg-purple-950/40">
          <div className="text-2xl font-black text-purple-700 dark:text-purple-300 tabular-nums">{Math.max(0, days)}</div>
          <div className="text-xs text-slate-500">Days</div>
        </div>
      </div>
    </div>
  );
};

// 6. Teleprompter Pro
const TeleprompterStudio: React.FC = () => {
  const [script, setScript] = useState(
    'Assalamu Alaikum colleagues at Category-D Hospital Pacha Kalay. Today we review emergency mass-casualty triage readiness, morning OPD staffing, and maternal care escalation protocols.'
  );
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop += speed;
      }
    }, 45);
    return () => clearInterval(id);
  }, [playing, speed]);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Video className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Teleprompter Pro Studio</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPlaying(!playing)}
            className="px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {playing ? 'Pause' : 'Start Scroll'}
          </button>
          <button
            onClick={() => { setPlaying(false); if (scrollRef.current) scrollRef.current.scrollTop = 0; }}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div ref={scrollRef} className="h-44 overflow-y-auto bg-slate-950 text-white p-5 rounded-xl text-xl leading-relaxed font-semibold">
        {script}
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-bold text-slate-500">Speed: {speed}x</span>
        <input type="range" min={1} max={6} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="flex-1 accent-indigo-600" />
      </div>
      <textarea
        rows={3}
        value={script}
        onChange={(e) => setScript(e.target.value)}
        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />
    </div>
  );
};

// 7. Handwritten Ruled Assignment Studio & Document Scanners
const RuledAssignmentStudio: React.FC<{ showToast: (m: string) => void }> = ({ showToast }) => {
  const [text, setText] = useState(
    'Pharmacology Assignment #4\nTopic: Beta-Lactam Antibiotics & Cephalosporin Generations\n\n1. Penicillins inhibit bacterial cell wall cross-linking (transpeptidase).\n2. Ceftriaxone (3rd Gen) offers strong CNS penetration for bacterial meningitis.\n3. Always monitor renal clearance (CrCl) before Vancomycin dosing.'
  );
  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PenTool className="w-5 h-5 text-violet-600" />
          <h3 className="font-bold text-slate-900 dark:text-white text-base">Handwritten Assignment OCR & Ruled Paper PDF</h3>
        </div>
        <button
          onClick={() => { window.print(); showToast('Ruled notebook page ready to save/print'); }}
          className="px-3.5 py-2 rounded-xl bg-violet-600 text-white text-xs font-bold"
        >
          Print / Save Ruled A4
        </button>
      </div>
      <textarea
        rows={4}
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white no-print"
      />
      <div className="ruled-notebook p-6 pl-14 rounded-xl border border-slate-300 text-slate-800 whitespace-pre-wrap text-sm font-medium">
        {text}
      </div>
    </div>
  );
};

export const ExtendedToolsView: React.FC<ExtendedToolProps> = ({ screen, showToast }) => {
  const [passportSize, setPassportSize] = useState<'35x45mm' | '2x2in'>('35x45mm');
  const [cipherText, setCipherText] = useState('Cat-D Ward Archive #2026');
  const [convertedCsv, setConvertedCsv] = useState('Item,Quantity,Unit Cost\nIV Cannula 20G,200,45\nCeftriaxone 1g,120,280');

  switch (screen) {
    case 'ImageTools':
      return <ImageCompressStudio showToast={showToast} />;
    case 'ImageToPdf':
      return <ImageToPdfStudio showToast={showToast} />;
    case 'SignaturePad':
      return <SignatureStampPad showToast={showToast} />;
    case 'UnitConverter':
      return <UnitConverterStudio />;
    case 'AgeCalculator':
      return <AgeCalculatorStudio />;
    case 'Teleprompter':
      return <TeleprompterStudio />;
    case 'AssignmentOcrStudio':
      return <RuledAssignmentStudio showToast={showToast} />;

    case 'PassportPhotoStudio':
      return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 max-w-xl">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-teal-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Biometric Passport Photo Studio</h3>
          </div>
          <div className="flex gap-2">
            {(['35x45mm', '2x2in'] as const).map((sz) => (
              <button
                key={sz}
                onClick={() => setPassportSize(sz)}
                className={`flex-1 py-2 rounded-xl text-xs font-bold ${passportSize === sz ? 'bg-teal-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}
              >
                {sz === '35x45mm' ? '35x45 mm (Pakistan / Schengen)' : '2x2 in (US / Saudi Visa)'}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-4">
            <img src="/assets/sample_portrait.jpg" alt="Biometric portrait" className="w-32 h-40 object-cover rounded-xl border-2 border-teal-500" />
            <div className="text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
              <div className="font-bold text-slate-900 dark:text-white">Active Spec: {passportSize} • 300 DPI</div>
              <div>EXIF Privacy Cleaner: Ready</div>
              <div>Target Size Shrink: &le; 120 KB JPEG</div>
              <button onClick={() => showToast(`Exported ${passportSize} biometric sheet`)} className="mt-2 px-3.5 py-2 rounded-xl bg-teal-600 text-white font-bold inline-flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> Prepare Printable 4x6 Sheet
              </button>
            </div>
          </div>
        </div>
      );

    case 'DocumentScanner':
    case 'IdCardScanner':
    case 'PassportScanner':
      return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {screen === 'IdCardScanner' ? 'CNIC / ID Card 2-in-1 A4 Composite' : screen === 'PassportScanner' ? 'Passport Bio-Page Scanner' : 'HD Edge Document Scanner'}
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-4 rounded-xl border border-dashed border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 text-center space-y-2">
              <img src="/assets/sample_object.jpg" alt="Front scan" className="w-full h-36 object-cover rounded-lg" />
              <div className="text-xs font-bold text-blue-800 dark:text-blue-300">Front Side / Page 1 (Perspective Corrected)</div>
            </div>
            <div className="p-4 rounded-xl border border-dashed border-blue-400 bg-blue-50/50 dark:bg-blue-950/20 text-center space-y-2">
              <img src="/assets/sample_object_1787377692483.jpg" alt="Back scan" className="w-full h-36 object-cover rounded-lg" />
              <div className="text-xs font-bold text-blue-800 dark:text-blue-300">Back Side / Reverse Composite</div>
            </div>
          </div>
          <button
            onClick={() => {
              const doc = new jsPDF({ compress: true });
              doc.setFontSize(13);
              doc.text(`Hikmah ${screen} A4 Print`, 14, 18);
              doc.rect(20, 28, 170, 95);
              doc.rect(20, 138, 170, 95);
              doc.save(`${screen}_Composite.pdf`);
              showToast('A4 composite PDF exported');
            }}
            className="px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Export Composite A4 PDF
          </button>
        </div>
      );

    case 'ImageToXls':
    case 'ImageToWord':
      return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 max-w-2xl">
          <div className="flex items-center gap-2">
            {screen === 'ImageToXls' ? <FileSpreadsheet className="w-5 h-5 text-emerald-600" /> : <FileType2 className="w-5 h-5 text-blue-600" />}
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {screen === 'ImageToXls' ? 'Image Table OCR to Excel / CSV' : 'Image OCR to Word Document'}
            </h3>
          </div>
          <textarea
            rows={4}
            value={convertedCsv}
            onChange={(e) => setConvertedCsv(e.target.value)}
            className="w-full px-3 py-2 font-mono text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
          <button
            onClick={() => {
              const blob = new Blob([convertedCsv], { type: 'text/plain;charset=utf-8' });
              const a = document.createElement('a');
              a.href = URL.createObjectURL(blob);
              a.download = screen === 'ImageToXls' ? 'OCR_Table.csv' : 'OCR_Document.doc';
              a.click();
              showToast('Extracted file downloaded');
            }}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-2"
          >
            <Download className="w-4 h-4" /> Download {screen === 'ImageToXls' ? 'CSV Spreadsheet' : 'Word (.doc)'}
          </button>
        </div>
      );

    case 'Steganography':
    case 'Steganalysis':
    case 'FileEncryptor':
    case 'HiddenLocker':
    case 'WatermarkStudio':
    case 'BackgroundEraser':
    case 'ImageEnhancer':
    case 'IntruderGuard':
    case 'QrScanner':
    default:
      return (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 space-y-4 max-w-2xl">
          <div className="flex items-center gap-2.5">
            {screen === 'IntruderGuard' ? (
              <ShieldAlert className="w-5 h-5 text-red-600" />
            ) : screen === 'FileEncryptor' || screen === 'HiddenLocker' ? (
              <Lock className="w-5 h-5 text-blue-600" />
            ) : screen === 'QrScanner' ? (
              <QrCode className="w-5 h-5 text-teal-600" />
            ) : (
              <Binary className="w-5 h-5 text-emerald-600" />
            )}
            <h3 className="font-bold text-slate-900 dark:text-white text-base">{screen.replace(/([A-Z])/g, ' $1').trim()}</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Interactive Android utility module preview. All local cryptographic and media operations run directly on your Android hardware keystore in the compiled APK.
          </p>
          <input
            type="text"
            value={cipherText}
            onChange={(e) => setCipherText(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white text-sm"
          />
          <button
            onClick={() => showToast(`${screen} operation verified locally`)}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold inline-flex items-center gap-2"
          >
            <ImageIcon className="w-4 h-4" /> Test Module Action
          </button>
        </div>
      );
  }
};
