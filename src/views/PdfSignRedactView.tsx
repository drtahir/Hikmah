import React, { useState, useRef, useEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { jsPDF } from 'jspdf';
import { PenTool, Upload, FileText, Eraser, Download, ChevronLeft, ChevronRight, Undo2 } from 'lucide-react';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PdfSignRedactViewProps {
  showToast: (msg: string) => void;
}

type Annotation =
  | { kind: 'REDACT'; page: number; xNorm: number; yNorm: number; wNorm: number; hNorm: number }
  | { kind: 'TEXT'; page: number; xNorm: number; yNorm: number; text: string }
  | { kind: 'SIGNATURE'; page: number; xNorm: number; yNorm: number; strokes: { x: number; y: number }[][] };

export const PdfSignRedactView: React.FC<PdfSignRedactViewProps> = ({ showToast }) => {
  const [mode, setMode] = useState<'SIGN_REDACT' | 'WORD_TO_PDF'>('SIGN_REDACT');

  // Sign/Redact state
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pdfName, setPdfName] = useState('');
  const [pageCount, setPageCount] = useState(0);
  const [pageIdx, setPageIdx] = useState(0);
  const [pageDataUrl, setPageDataUrl] = useState<string | null>(null);
  const [tool, setTool] = useState<'SIGNATURE' | 'TEXT' | 'REDACT'>('SIGNATURE');
  const [stampText, setStampText] = useState('Dr. Tahir Khan');
  const [sigStrokes, setSigStrokes] = useState<{ x: number; y: number }[][]>([]);
  const [showSigModal, setShowSigModal] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Word/Text -> PDF state
  const [docTitle, setDocTitle] = useState('Official Medical & Student Report');
  const [docBody, setDocBody] = useState(
    '# Summary Header\n\nWrite, paste, or import any .docx or .txt file below to export a crisp paginated A4 PDF.\n\n## Key Points\n- 100% offline processing\n- Clean typography & automatic line wrapping'
  );

  const sigCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const activeStrokeRef = useRef<{ x: number; y: number }[]>([]);
  const stageRef = useRef<HTMLDivElement>(null);

  const renderPagePreview = async (bytes: ArrayBuffer, idx: number) => {
    const doc = await pdfjsLib.getDocument({ data: bytes.slice(0) }).promise;
    setPageCount(doc.numPages);
    const page = await doc.getPage(idx + 1);
    const vp = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    canvas.width = vp.width;
    canvas.height = vp.height;
    const ctx = canvas.getContext('2d')!;
    await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;
    setPageDataUrl(canvas.toDataURL('image/png'));
  };

  useEffect(() => {
    if (pdfBytes) {
      renderPagePreview(pdfBytes, pageIdx).catch(() => showToast('Failed to render PDF page.'));
    }
  }, [pdfBytes, pageIdx]);

  const handleLoadPdfFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const buf = await f.arrayBuffer();
    setPdfBytes(buf);
    setPdfName(f.name);
    setPageIdx(0);
    setAnnotations([]);
  };

  const handleGenerateSamplePdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    doc.setFontSize(18);
    doc.text('OFFICIAL CONSENT & CLEARANCE FORM', 50, 70);
    doc.setFontSize(12);
    doc.text('Applicant Name: ___________________________', 50, 130);
    doc.text('CNIC / Confidential ID: 15101-9876543-1 (Redact before sharing)', 50, 165);
    doc.text('Department: Emergency & Critical Care Unit, Buner', 50, 200);
    doc.text('Authorized Signature:', 50, 320);
    doc.line(180, 325, 390, 325);
    const arr = doc.output('arraybuffer');
    setPdfBytes(arr);
    setPdfName('Sample_Consent_Form.pdf');
    setPageIdx(0);
    setAnnotations([]);
    showToast('Loaded sample PDF! Tap page to sign, stamp, or redact.');
  };

  const handleStageTap = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const xNorm = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width));
    const yNorm = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height));

    if (tool === 'SIGNATURE') {
      if (sigStrokes.length === 0) {
        setShowSigModal(true);
        return;
      }
      setAnnotations((prev) => [...prev, { kind: 'SIGNATURE', page: pageIdx, xNorm, yNorm, strokes: sigStrokes }]);
    } else if (tool === 'TEXT') {
      setAnnotations((prev) => [...prev, { kind: 'TEXT', page: pageIdx, xNorm, yNorm, text: stampText || 'APPROVED' }]);
    } else {
      setAnnotations((prev) => [...prev, { kind: 'REDACT', page: pageIdx, xNorm, yNorm, wNorm: 0.28, hNorm: 0.055 }]);
    }
  };

  const handleExportFlattenedPdf = async () => {
    if (!pdfBytes) return;
    setIsExporting(true);
    try {
      const srcDoc = await pdfjsLib.getDocument({ data: pdfBytes.slice(0) }).promise;
      let outPdf: jsPDF | null = null;
      for (let i = 0; i < srcDoc.numPages; i++) {
        const page = await srcDoc.getPage(i + 1);
        const vp = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement('canvas');
        canvas.width = vp.width;
        canvas.height = vp.height;
        const ctx = canvas.getContext('2d')!;
        await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;

        annotations.filter((a) => a.page === i).forEach((ann) => {
          if (ann.kind === 'REDACT') {
            ctx.fillStyle = '#000000';
            const rw = ann.wNorm * canvas.width;
            const rh = ann.hNorm * canvas.height;
            ctx.fillRect(ann.xNorm * canvas.width - rw / 2, ann.yNorm * canvas.height - rh / 2, rw, rh);
          } else if (ann.kind === 'TEXT') {
            ctx.fillStyle = '#1E3A8A';
            ctx.font = `bold ${Math.round(canvas.width * 0.025)}px sans-serif`;
            ctx.fillText(ann.text, ann.xNorm * canvas.width, ann.yNorm * canvas.height);
          } else if (ann.kind === 'SIGNATURE') {
            const bw = canvas.width * 0.28;
            const bh = canvas.height * 0.11;
            const left = ann.xNorm * canvas.width - bw / 2;
            const top = ann.yNorm * canvas.height - bh / 2;
            ctx.strokeStyle = '#0F172A';
            ctx.lineWidth = Math.max(3, canvas.width * 0.004);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            ann.strokes.forEach((st) => {
              if (st.length < 2) return;
              ctx.beginPath();
              ctx.moveTo(left + st[0].x * bw, top + st[0].y * bh);
              for (let k = 1; k < st.length; k++) ctx.lineTo(left + st[k].x * bw, top + st[k].y * bh);
              ctx.stroke();
            });
          }
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.92);
        if (!outPdf) {
          outPdf = new jsPDF({ orientation: vp.width > vp.height ? 'l' : 'p', unit: 'pt', format: [vp.width * 0.5, vp.height * 0.5] });
        } else {
          outPdf.addPage([vp.width * 0.5, vp.height * 0.5], vp.width > vp.height ? 'l' : 'p');
        }
        outPdf.addImage(imgData, 'JPEG', 0, 0, vp.width * 0.5, vp.height * 0.5);
      }

      if (outPdf) {
        outPdf.save(`${pdfName.replace(/\.pdf$/i, '')}_signed_redacted.pdf`);
        showToast('Saved flattened PDF with permanent blackout redactions!');
      }
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportDocOrText = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocTitle(file.name.replace(/\.[^.]+$/, ''));
    if (file.name.toLowerCase().endsWith('.txt') || file.name.toLowerCase().endsWith('.md')) {
      setDocBody(await file.text());
      showToast(`Imported text from ${file.name}`);
      return;
    }
    // Extract plain text from .docx ZIP local entries if uncompressed or deflate-raw
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      const textDecoder = new TextDecoder();
      let idx = 0;
      let extractedXml = '';
      while (idx + 30 < buf.length) {
        if (buf[idx] === 0x50 && buf[idx + 1] === 0x4b && buf[idx + 2] === 0x03 && buf[idx + 3] === 0x04) {
          const compMethod = buf[idx + 8] | (buf[idx + 9] << 8);
          const compSize = buf[idx + 18] | (buf[idx + 19] << 8) | (buf[idx + 20] << 16) | (buf[idx + 21] << 24);
          const nameLen = buf[idx + 26] | (buf[idx + 27] << 8);
          const extraLen = buf[idx + 28] | (buf[idx + 29] << 8);
          const name = textDecoder.decode(buf.slice(idx + 30, idx + 30 + nameLen));
          const dataStart = idx + 30 + nameLen + extraLen;
          if (name === 'word/document.xml' && compSize > 0) {
            const rawSlice = buf.slice(dataStart, dataStart + compSize);
            if (compMethod === 0) {
              extractedXml = textDecoder.decode(rawSlice);
            } else if (compMethod === 8 && 'DecompressionStream' in window) {
              const ds = new DecompressionStream('deflate-raw');
              const res = await new Response(new Blob([rawSlice]).stream().pipeThrough(ds)).text();
              extractedXml = res;
            }
            break;
          }
          idx = dataStart + Math.max(0, compSize);
        } else {
          idx++;
        }
      }
      if (extractedXml) {
        const xmlDoc = new DOMParser().parseFromString(extractedXml, 'application/xml');
        const paras = Array.from(xmlDoc.getElementsByTagName('w:p')).map((p) =>
          Array.from(p.getElementsByTagName('w:t')).map((t) => t.textContent || '').join('')
        ).filter((line) => line.trim().length > 0);
        setDocBody(paras.join('\n\n'));
        showToast(`Loaded Word content from ${file.name}`);
      } else {
        showToast('Could not parse .docx stream; try pasting text or saving as .txt.');
      }
    } catch {
      showToast('Unable to unpack .docx file cleanly.');
    }
  };

  const handleConvertTextToPdf = () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    const margin = 46;
    const maxW = 595 - margin * 2;
    let y = 58;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(17);
    doc.setTextColor(15, 81, 50);
    doc.text(docTitle || 'Document', margin, y);
    y += 14;
    doc.setDrawColor(203, 213, 225);
    doc.line(margin, y, 595 - margin, y);
    y += 22;

    docBody.split('\n').forEach((line) => {
      const trimmed = line.trimEnd();
      if (!trimmed) { y += 8; return; }
      const isHeading = trimmed.startsWith('#');
      const clean = trimmed.replace(/^#+\s*/, '');
      doc.setFont('helvetica', isHeading ? 'bold' : 'normal');
      doc.setFontSize(isHeading ? 13 : 11);
      doc.setTextColor(isHeading ? 15 : 30, isHeading ? 23 : 41, isHeading ? 42 : 59);
      const wrapped = doc.splitTextToSize(clean, maxW) as string[];
      wrapped.forEach((wl) => {
        if (y > 790) { doc.addPage(); y = 54; }
        doc.text(wl, margin, y);
        y += isHeading ? 18 : 15;
      });
    });
    doc.save(`${(docTitle || 'Document').replace(/[^a-zA-Z0-9._-]/g, '_')}.pdf`);
    showToast('Converted to crisp paginated A4 PDF!');
  };

  // Signature Modal Canvas Handlers
  const redrawSigCanvas = (strokes: { x: number; y: number }[][], current: { x: number; y: number }[]) => {
    const c = sigCanvasRef.current;
    if (!c) return;
    const ctx = c.getContext('2d')!;
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.strokeStyle = '#0F172A';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    [...strokes, current].forEach((st) => {
      if (st.length < 2) return;
      ctx.beginPath();
      ctx.moveTo(st[0].x * c.width, st[0].y * c.height);
      for (let i = 1; i < st.length; i++) ctx.lineTo(st[i].x * c.width, st[i].y * c.height);
      ctx.stroke();
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-1.5 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => setMode('SIGN_REDACT')}
          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
            mode === 'SIGN_REDACT' ? 'bg-blue-700 text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          <PenTool className="w-3.5 h-3.5" /> Sign &amp; Redact PDF
        </button>
        <button
          type="button"
          onClick={() => setMode('WORD_TO_PDF')}
          className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
            mode === 'WORD_TO_PDF' ? 'bg-blue-700 text-white' : 'text-slate-600 dark:text-slate-300'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Word / Text → PDF
        </button>
      </div>

      {mode === 'SIGN_REDACT' ? (
        <div className="space-y-3">
          {!pdfBytes ? (
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
              <PenTool className="w-10 h-10 text-blue-600 mx-auto" />
              <div className="text-sm font-bold">Interactive PDF Sign &amp; Permanent Redact</div>
              <p className="text-xs text-slate-500">Tap anywhere on rendered pages to stamp handwritten ink, text dates, or blackout bars.</p>
              <div className="flex gap-2 justify-center">
                <label className="px-4 py-2 rounded-xl bg-blue-700 text-white text-xs font-bold cursor-pointer inline-flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5" /> Upload PDF
                  <input type="file" accept="application/pdf" className="hidden" onChange={handleLoadPdfFile} />
                </label>
                <button type="button" onClick={handleGenerateSamplePdf} className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
                  Sample PDF
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800">
                <span className="text-xs font-bold truncate">{pdfName} ({pageIdx + 1}/{pageCount})</span>
                <div className="flex items-center gap-1">
                  <button type="button" disabled={pageIdx <= 0} onClick={() => setPageIdx((p) => p - 1)} className="p-1.5 rounded-lg disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                  <button type="button" disabled={pageIdx >= pageCount - 1} onClick={() => setPageIdx((p) => p + 1)} className="p-1.5 rounded-lg disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'SIGNATURE' as const, label: 'Signature' },
                  { id: 'TEXT' as const, label: 'Text Stamp' },
                  { id: 'REDACT' as const, label: 'Redact Blackout' },
                ].map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => { setTool(t.id); if (t.id === 'SIGNATURE' && sigStrokes.length === 0) setShowSigModal(true); }}
                    className={`py-2 rounded-xl text-[11px] font-bold border ${
                      tool === t.id ? 'bg-blue-700 text-white border-blue-700' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {tool === 'SIGNATURE' && (
                <button type="button" onClick={() => setShowSigModal(true)} className="w-full py-2 rounded-xl border border-blue-600/40 text-blue-700 dark:text-blue-400 text-xs font-bold">
                  {sigStrokes.length === 0 ? 'Draw Handwritten Signature Ink' : `Redraw Signature (${sigStrokes.length} strokes)`}
                </button>
              )}
              {tool === 'TEXT' && (
                <input
                  type="text"
                  value={stampText}
                  onChange={(e) => setStampText(e.target.value)}
                  placeholder="Enter stamp text or date"
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                />
              )}

              {pageDataUrl && (
                <div
                  ref={stageRef}
                  onClick={handleStageTap}
                  className="relative w-full rounded-xl overflow-hidden border border-slate-300 dark:border-slate-700 cursor-crosshair bg-white"
                >
                  <img src={pageDataUrl} alt="PDF Page" className="w-full h-auto block select-none" />
                  {annotations.filter((a) => a.page === pageIdx).map((ann, idx) => {
                    if (ann.kind === 'REDACT') {
                      return (
                        <div
                          key={idx}
                          style={{ left: `${(ann.xNorm - ann.wNorm / 2) * 100}%`, top: `${(ann.yNorm - ann.hNorm / 2) * 100}%`, width: `${ann.wNorm * 100}%`, height: `${ann.hNorm * 100}%` }}
                          className="absolute bg-black pointer-events-none"
                        />
                      );
                    }
                    if (ann.kind === 'TEXT') {
                      return (
                        <div key={idx} style={{ left: `${ann.xNorm * 100}%`, top: `${ann.yNorm * 100}%` }} className="absolute -translate-y-1/2 text-[11px] font-bold text-blue-900 pointer-events-none">
                          {ann.text}
                        </div>
                      );
                    }
                    return (
                      <svg
                        key={idx}
                        viewBox="0 0 100 40"
                        style={{ left: `${(ann.xNorm - 0.14) * 100}%`, top: `${(ann.yNorm - 0.055) * 100}%`, width: '28%', height: '11%' }}
                        className="absolute pointer-events-none overflow-visible"
                      >
                        {ann.strokes.map((st, sIdx) => (
                          <polyline key={sIdx} fill="none" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" points={st.map((p) => `${p.x * 100},${p.y * 40}`).join(' ')} />
                        ))}
                      </svg>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-2">
                <button type="button" disabled={annotations.length === 0} onClick={() => setAnnotations((a) => a.slice(0, -1))} className="flex-1 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 disabled:opacity-40 text-xs font-bold flex items-center justify-center gap-1">
                  <Undo2 className="w-3.5 h-3.5" /> Undo ({annotations.length})
                </button>
                <button type="button" disabled={isExporting || annotations.length === 0} onClick={handleExportFlattenedPdf} className="flex-1 py-2.5 rounded-xl bg-blue-700 disabled:opacity-40 text-white text-xs font-bold flex items-center justify-center gap-1">
                  <Download className="w-3.5 h-3.5" /> {isExporting ? 'Burning...' : 'Save Flattened PDF'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="w-full py-2 rounded-xl border border-blue-600/40 text-blue-700 dark:text-blue-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer">
            <Upload className="w-3.5 h-3.5" /> Import .docx / .txt File (Optional)
            <input type="file" accept=".docx,.txt,.md" className="hidden" onChange={handleImportDocOrText} />
          </label>
          <input type="text" value={docTitle} onChange={(e) => setDocTitle(e.target.value)} placeholder="PDF Document Title" className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold" />
          <textarea rows={7} value={docBody} onChange={(e) => setDocBody(e.target.value)} className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs leading-relaxed" />
          <button type="button" onClick={handleConvertTextToPdf} className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold flex items-center justify-center gap-1.5">
            <Download className="w-4 h-4" /> Convert Word / Text to A4 PDF
          </button>
        </div>
      )}

      {showSigModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setShowSigModal(false)}>
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
            <div className="text-sm font-bold">Draw Signature Ink</div>
            <canvas
              ref={sigCanvasRef}
              width={360}
              height={150}
              className="w-full h-36 bg-white border border-slate-300 rounded-xl touch-none"
              onPointerDown={(e) => {
                drawingRef.current = true;
                const r = e.currentTarget.getBoundingClientRect();
                activeStrokeRef.current = [{ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }];
              }}
              onPointerMove={(e) => {
                if (!drawingRef.current) return;
                const r = e.currentTarget.getBoundingClientRect();
                activeStrokeRef.current.push({ x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height });
                redrawSigCanvas(sigStrokes, activeStrokeRef.current);
              }}
              onPointerUp={() => {
                if (!drawingRef.current) return;
                drawingRef.current = false;
                if (activeStrokeRef.current.length >= 2) {
                  setSigStrokes((prev) => [...prev, activeStrokeRef.current]);
                }
                activeStrokeRef.current = [];
              }}
            />
            <div className="flex gap-2">
              <button type="button" onClick={() => { setSigStrokes([]); redrawSigCanvas([], []); }} className="flex-1 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold flex items-center justify-center gap-1">
                <Eraser className="w-3.5 h-3.5" /> Clear
              </button>
              <button type="button" disabled={sigStrokes.length === 0} onClick={() => setShowSigModal(false)} className="flex-1 py-2 rounded-xl bg-blue-700 disabled:opacity-40 text-white text-xs font-bold">
                Use Signature
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
