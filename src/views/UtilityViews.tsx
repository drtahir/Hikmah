import React, { useState, useEffect, useRef } from 'react';
import {
  Calculator, QrCode, Barcode, Shield, Key, Eye, EyeOff, Copy,
  Check, Play, Pause, RotateCcw, Lock, Unlock, Image as ImageIcon,
  Clock, ArrowRightLeft, Sparkles, AlertCircle
} from 'lucide-react';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';
import { StorageService } from '../services/storage';
import { PasswordEntry } from '../types';

interface UtilityViewsProps {
  onBack: () => void;
  showToast: (msg: string) => void;
}

// 1. Scientific Calculator
export const ScientificCalculatorView: React.FC<UtilityViewsProps> = ({ onBack, showToast }) => {
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState('0');

  const handlePress = (val: string) => {
    if (val === 'C') {
      setExpr('');
      setResult('0');
    } else if (val === '=') {
      try {
        // Safe evaluation of mathematical expressions
        const sanitized = expr
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/sqrt\(/g, 'Math.sqrt(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/\^/g, '**');
        // evaluate safely
        const evalResult = Function(`"use strict"; return (${sanitized})`)();
        setResult(String(Number(evalResult.toFixed(8))));
      } catch {
        setResult('Error');
      }
    } else if (val === 'DEL') {
      setExpr(expr.slice(0, -1));
    } else {
      setExpr(expr + val);
    }
  };

  const buttons = [
    ['sin(', 'cos(', 'tan(', 'DEL', 'C'],
    ['sqrt(', '(', ')', '^', '÷'],
    ['7', '8', '9', '×', 'log('],
    ['4', '5', '6', '-', 'π'],
    ['1', '2', '3', '+', 'e'],
    ['0', '.', '=', '%', '00']
  ];

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
            <Calculator className="w-6 h-6 text-emerald-600" />
            Scientific Calculator
          </h2>
          <p className="text-xs text-slate-500">Trigonometry, logarithms, powers, and clinical calculations</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
        {/* Display */}
        <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 text-right">
          <div className="text-slate-400 text-sm font-mono h-6 overflow-x-auto">{expr || '0'}</div>
          <div className="text-3xl sm:text-4xl font-black font-mono text-slate-800 dark:text-emerald-400 truncate mt-1">
            {result}
          </div>
        </div>

        {/* Keypad */}
        <div className="space-y-2">
          {buttons.map((row, rIdx) => (
            <div key={rIdx} className="grid grid-cols-5 gap-2">
              {row.map((btn) => {
                const isOp = ['÷', '×', '-', '+', '='].includes(btn);
                const isSpecial = ['DEL', 'C'].includes(btn);
                return (
                  <button
                    key={btn}
                    onClick={() => handlePress(btn)}
                    className={`py-3.5 rounded-xl font-bold text-sm sm:text-base transition active:scale-95 flex items-center justify-center ${
                      btn === '='
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                        : isOp
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                        : isSpecial
                        ? 'bg-red-50 dark:bg-red-950/40 text-red-600 border border-red-200 dark:border-red-900'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    {btn}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// 2. QR Code Generator & Studio
export const QrCodeStudioView: React.FC<UtilityViewsProps> = ({ onBack, showToast }) => {
  const [text, setText] = useState('https://studentkit.edu.pk/cat-d-buner');
  const [dataUrl, setDataUrl] = useState('');
  const [size, setSize] = useState(300);

  useEffect(() => {
    if (text) {
      QRCode.toDataURL(text, { width: size, margin: 2, color: { dark: '#047857', light: '#ffffff' } })
        .then(url => setDataUrl(url))
        .catch(err => console.error(err));
    }
  }, [text, size]);

  const downloadQr = () => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `qrcode-${Date.now()}.png`;
    a.click();
    showToast('QR Code downloaded successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <QrCode className="w-6 h-6 text-emerald-600" />
          HD QR Code Generator
        </h2>
        <p className="text-xs text-slate-500">Generate high-contrast QR codes for hospital URLs, patient records, Wi-Fi, or plain text</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Enter URL, Patient MR#, or Message</label>
          <textarea
            rows={3}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            placeholder="Type or paste text..."
          />
        </div>

        <div className="flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
          {dataUrl ? (
            <img src={dataUrl} alt="QR Code" className="w-56 h-56 rounded-xl shadow-md border-4 border-white dark:border-slate-700" />
          ) : (
            <div className="w-56 h-56 flex items-center justify-center text-slate-400">Loading QR...</div>
          )}
          <button
            onClick={downloadQr}
            className="mt-5 flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            Download High-Res PNG
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Barcode Generator (Code 128 / Medical Inventory)
export const BarcodeGeneratorView: React.FC<UtilityViewsProps> = ({ onBack, showToast }) => {
  const [code, setCode] = useState('MED-BNR-9842');
  const [format, setFormat] = useState('CODE128');
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && code) {
      try {
        JsBarcode(svgRef.current, code, {
          format: format as any,
          lineColor: '#0f172a',
          width: 2,
          height: 80,
          displayValue: true,
          font: 'monospace',
          fontSize: 16
        });
      } catch (err) {
        console.error(err);
      }
    }
  }, [code, format]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Barcode className="w-6 h-6 text-emerald-600" />
          Pharmacy & Asset Barcode Studio
        </h2>
        <p className="text-xs text-slate-500">Industry-standard Code-128 & EAN barcodes for pharmacy stock, blood bags, and lab samples</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div>
          <label className="text-xs font-bold text-slate-600 dark:text-slate-300 block mb-1">Barcode Value / Asset Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full px-3 py-2 text-sm rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>

        <div className="flex flex-col items-center justify-center p-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-700">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
            <svg ref={svgRef}></svg>
          </div>
          <button
            onClick={() => window.print()}
            className="mt-6 flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            Print Barcode Label
          </button>
        </div>
      </div>
    </div>
  );
};

// 4. Pomodoro Focus Timer
export const PomodoroTimerView: React.FC<UtilityViewsProps> = ({ onBack, showToast }) => {
  const [seconds, setSeconds] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'study' | 'short_break' | 'long_break'>('study');

  useEffect(() => {
    let interval: any = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => {
        setSeconds((prev) => prev - 1);
      }, 1000);
    } else if (seconds === 0 && isActive) {
      setIsActive(false);
      showToast('Pomodoro session completed! Take a well-deserved break.');
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const selectMode = (m: 'study' | 'short_break' | 'long_break') => {
    setIsActive(false);
    setMode(m);
    if (m === 'study') setSeconds(25 * 60);
    if (m === 'short_break') setSeconds(5 * 60);
    if (m === 'long_break') setSeconds(15 * 60);
  };

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center justify-center gap-2">
          <Clock className="w-6 h-6 text-emerald-600" />
          Medical Study Pomodoro
        </h2>
        <p className="text-xs text-slate-500 mt-1">Boost focus during anatomy, pharmacology, and exam revision</p>
      </div>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
        <div className="flex justify-center gap-2">
          <button
            onClick={() => selectMode('study')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${mode === 'study' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
          >
            Study (25m)
          </button>
          <button
            onClick={() => selectMode('short_break')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${mode === 'short_break' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
          >
            Short Break (5m)
          </button>
          <button
            onClick={() => selectMode('long_break')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${mode === 'long_break' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}`}
          >
            Long Break (15m)
          </button>
        </div>

        <div className="text-6xl font-black font-mono text-emerald-700 dark:text-emerald-400 tracking-wider">
          {String(minutes).padStart(2, '0')}:{String(remainingSeconds).padStart(2, '0')}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => setIsActive(!isActive)}
            className="flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg transition active:scale-95"
          >
            {isActive ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            {isActive ? 'Pause' : 'Start Focus'}
          </button>
          <button
            onClick={() => {
              setIsActive(false);
              selectMode(mode);
            }}
            className="p-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl transition"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

// 5. Password Vault & Generator
export const PasswordVaultView: React.FC<UtilityViewsProps> = ({ onBack, showToast }) => {
  const [passwords, setPasswords] = useState<PasswordEntry[]>(StorageService.getPasswords());
  const [title, setTitle] = useState('');
  const [username, setUsername] = useState('');
  const [secret, setSecret] = useState('');
  const [showValues, setShowValues] = useState<Record<string, boolean>>({});

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=';
    let res = '';
    for (let i = 0; i < 16; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setSecret(res);
  };

  const addPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !secret) return;
    const newEntry: PasswordEntry = {
      id: Date.now().toString(),
      title,
      username,
      password: secret,
      category: 'Hospital Systems',
      updatedAt: new Date().toISOString()
    };
    StorageService.savePassword(newEntry);
    setPasswords(StorageService.getPasswords());
    setTitle('');
    setUsername('');
    setSecret('');
    showToast('Secure credentials saved to local encrypted vault!');
  };

  const removePassword = (id: string) => {
    StorageService.deletePassword(id);
    setPasswords(StorageService.getPasswords());
    showToast('Password entry removed.');
  };

  const copyToClipboard = (val: string) => {
    navigator.clipboard.writeText(val);
    showToast('Password copied to clipboard!');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h2 className="text-xl font-black text-slate-800 dark:text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-emerald-600" />
          Encrypted Credential Vault
        </h2>
        <p className="text-xs text-slate-500">Offline private vault for hospital portals, PMDC accounts, and clinical databases</p>
      </div>

      {/* Add form */}
      <form onSubmit={addPassword} className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 dark:text-white text-sm">Add New Credential</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Service / Portal Name"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            required
          />
          <input
            type="text"
            placeholder="Username / Doctor Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Secret Password"
            value={secret}
            onChange={(e) => setSecret(e.target.value)}
            className="flex-1 px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            required
          />
          <button
            type="button"
            onClick={generatePassword}
            className="px-3 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-emerald-600 rounded-xl flex items-center gap-1"
          >
            <Sparkles className="w-3.5 h-3.5" /> Generate
          </button>
        </div>
        <button
          type="submit"
          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md transition"
        >
          Save to Secure Vault
        </button>
      </form>

      {/* List */}
      <div className="space-y-3">
        {passwords.map((item) => (
          <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <h4 className="font-bold text-slate-800 dark:text-white text-sm">{item.title}</h4>
              <p className="text-xs text-slate-500">{item.username || 'No username specified'}</p>
              <p className="text-xs font-mono mt-1 text-emerald-700 dark:text-emerald-400">
                {showValues[item.id] ? item.password : '••••••••••••••••'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowValues(prev => ({ ...prev, [item.id]: !prev[item.id] }))}
                className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white"
              >
                {showValues[item.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={() => copyToClipboard(item.password)}
                className="p-2 text-emerald-600 hover:text-emerald-700"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => removePassword(item.id)}
                className="p-2 text-red-500 hover:text-red-700 text-xs font-bold"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
