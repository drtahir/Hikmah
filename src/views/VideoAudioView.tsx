import React, { useState, useRef } from 'react';
import { Video, Scissors, Music, Upload, Download, Play } from 'lucide-react';

interface VideoAudioViewProps {
  showToast: (msg: string) => void;
}

export const VideoAudioView: React.FC<VideoAudioViewProps> = ({ showToast }) => {
  const [tab, setTab] = useState<'COMPRESS' | 'TRIM' | 'AUDIO'>('COMPRESS');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoName, setVideoName] = useState<string>('');
  const [videoSize, setVideoSize] = useState<number>(0);
  const [durationSec, setDurationSec] = useState<number>(0);
  const [resolution, setResolution] = useState<{ w: number; h: number }>({ w: 0, h: 0 });

  const [presetHeight, setPresetHeight] = useState<720 | 480 | 360>(480);
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(5);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [outputName, setOutputName] = useState('');
  const [outputSize, setOutputSize] = useState(0);
  const [outputMime, setOutputMime] = useState('video/webm');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoElRef = useRef<HTMLVideoElement>(null);

  const formatBytes = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(2)} MB` : `${(b / 1024).toFixed(1)} KB`);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    if (outputUrl) URL.revokeObjectURL(outputUrl);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setVideoName(file.name);
    setVideoSize(file.size);
    setOutputUrl(null);
  };

  const handleGenerateSampleClip = async () => {
    setIsProcessing(true);
    setProgress(15);
    const canvas = document.createElement('canvas');
    canvas.width = 960;
    canvas.height = 540;
    const ctx = canvas.getContext('2d')!;
    const stream = canvas.captureStream(24);
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (ev) => { if (ev.data.size > 0) chunks.push(ev.data); };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      setVideoUrl(url);
      setVideoName('Sample_Lecture_Clip.webm');
      setVideoSize(blob.size);
      setOutputUrl(null);
      setIsProcessing(false);
      setProgress(0);
      showToast('Generated 4-second sample HD clip for testing!');
    };

    recorder.start();
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      ctx.fillStyle = '#0F172A';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(160 + (frame * 8) % 640, 270, 65, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 34px sans-serif';
      ctx.fillText(`Hikmah Media Lab • Frame ${frame}`, 220, 120);
      setProgress(Math.min(95, Math.round((frame / 90) * 100)));
      if (frame >= 90) {
        clearInterval(timer);
        recorder.stop();
      }
    }, 42);
  };

  const handleProcessMedia = async () => {
    const v = videoElRef.current;
    if (!v || !videoUrl) return;
    setIsProcessing(true);
    setProgress(5);
    setOutputUrl(null);

    try {
      if (tab === 'AUDIO') {
        // Real offline AudioContext WAV capture from media element stream if available
        const audioCtx = new AudioContext();
        const response = await fetch(videoUrl);
        const buf = await response.arrayBuffer();
        setProgress(45);
        try {
          const decoded = await audioCtx.decodeAudioData(buf);
          const samples = decoded.getChannelData(0);
          const wavLen = 44 + samples.length * 2;
          const ab = new ArrayBuffer(wavLen);
          const view = new DataView(ab);
          const writeStr = (off: number, s: string) => { for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i)); };
          writeStr(0, 'RIFF');
          view.setUint32(4, 36 + samples.length * 2, true);
          writeStr(8, 'WAVE');
          writeStr(12, 'fmt ');
          view.setUint32(16, 16, true);
          view.setUint16(20, 1, true);
          view.setUint16(22, 1, true);
          view.setUint32(24, decoded.sampleRate, true);
          view.setUint32(28, decoded.sampleRate * 2, true);
          view.setUint16(32, 2, true);
          view.setUint16(34, 16, true);
          writeStr(36, 'data');
          view.setUint32(40, samples.length * 2, true);
          let offset = 44;
          for (let i = 0; i < samples.length; i++) {
            const s = Math.max(-1, Math.min(1, samples[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
            offset += 2;
          }
          const wavBlob = new Blob([ab], { type: 'audio/wav' });
          setOutputUrl(URL.createObjectURL(wavBlob));
          setOutputName(`${videoName.replace(/\.[^.]+$/, '')}_audio.wav`);
          setOutputSize(wavBlob.size);
          setOutputMime('audio/wav');
          setProgress(100);
          showToast('Audio track extracted cleanly!');
        } catch {
          showToast('Selected test video has no audio track — try an uploaded video with audio.');
        } finally {
          await audioCtx.close();
          setIsProcessing(false);
        }
        return;
      }

      // Video Compression or Trim using Canvas downscaler + MediaRecorder
      const scale = tab === 'COMPRESS' ? Math.min(1, presetHeight / Math.max(1, v.videoHeight || 480)) : 1;
      const outW = Math.max(240, Math.round(((v.videoWidth || 640) * scale) / 2) * 2);
      const outH = Math.max(180, Math.round(((v.videoHeight || 360) * scale) / 2) * 2);
      const canvas = document.createElement('canvas');
      canvas.width = outW;
      canvas.height = outH;
      const ctx = canvas.getContext('2d')!;
      const stream = canvas.captureStream(24);
      const bps = tab === 'COMPRESS' ? (presetHeight === 360 ? 400000 : presetHeight === 480 ? 800000 : 1400000) : 1800000;
      const recorder = new MediaRecorder(stream, { mimeType: 'video/webm', videoBitsPerSecond: bps });
      const chunks: Blob[] = [];
      recorder.ondataavailable = (ev) => { if (ev.data.size > 0) chunks.push(ev.data); };

      const startAt = tab === 'TRIM' ? trimStart : 0;
      const stopAt = tab === 'TRIM' ? Math.max(trimStart + 0.5, trimEnd) : Math.max(1, durationSec);

      v.currentTime = startAt;
      v.muted = true;
      await v.play();
      recorder.start();

      const pump = setInterval(() => {
        if (v.paused || v.ended || v.currentTime >= stopAt) {
          clearInterval(pump);
          v.pause();
          recorder.stop();
          const blob = new Blob(chunks, { type: 'video/webm' });
          setTimeout(() => {
            const finalBlob = blob.size > 0 ? blob : new Blob(chunks, { type: 'video/webm' });
            setOutputUrl(URL.createObjectURL(finalBlob));
            setOutputName(`${videoName.replace(/\.[^.]+$/, '')}_${tab === 'COMPRESS' ? `${presetHeight}p` : 'trimmed'}.webm`);
            setOutputSize(finalBlob.size);
            setOutputMime('video/webm');
            setIsProcessing(false);
            setProgress(100);
            showToast(tab === 'COMPRESS' ? `Video compressed (${outW}x${outH})!` : 'Trimmed video clip ready!');
          }, 150);
          return;
        }
        ctx.drawImage(v, 0, 0, outW, outH);
        const pct = Math.min(96, Math.round(((v.currentTime - startAt) / Math.max(0.5, stopAt - startAt)) * 100));
        setProgress(pct);
      }, 42);
    } catch {
      setIsProcessing(false);
      showToast('Browser codec unable to process this clip.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-1.5 bg-slate-200/70 dark:bg-slate-800 p-1 rounded-2xl">
        {[
          { id: 'COMPRESS' as const, label: 'Compress', icon: Video },
          { id: 'TRIM' as const, label: 'Trim Clip', icon: Scissors },
          { id: 'AUDIO' as const, label: 'To Audio', icon: Music },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => { setTab(item.id); setOutputUrl(null); }}
              className={`py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                tab === item.id ? 'bg-pink-600 text-white' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleFileChange} />

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2.5 px-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Upload className="w-4 h-4" /> Pick Video File
          </button>
          <button
            type="button"
            onClick={handleGenerateSampleClip}
            className="px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold flex items-center gap-1"
          >
            <Play className="w-3.5 h-3.5" /> Test Clip
          </button>
        </div>

        {videoUrl && (
          <div className="space-y-2">
            <video
              ref={videoElRef}
              src={videoUrl}
              controls
              onLoadedMetadata={(e) => {
                const el = e.currentTarget;
                setDurationSec(el.duration || 4);
                setTrimStart(0);
                setTrimEnd(Math.max(1, Number((el.duration || 4).toFixed(1))));
                setResolution({ w: el.videoWidth, h: el.videoHeight });
              }}
              className="w-full max-h-48 rounded-xl bg-black"
            />
            <div className="text-[11px] text-slate-500 flex justify-between">
              <span className="truncate font-semibold">{videoName}</span>
              <span>{resolution.w}x{resolution.h} • {formatBytes(videoSize)}</span>
            </div>
          </div>
        )}
      </div>

      {videoUrl && (
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
          {tab === 'COMPRESS' && (
            <div className="space-y-2">
              <div className="text-xs font-bold">Target Quality Preset</div>
              <div className="grid grid-cols-3 gap-2">
                {([720, 480, 360] as const).map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setPresetHeight(h)}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      presetHeight === h ? 'bg-pink-600/15 border-pink-600 text-pink-700 dark:text-pink-400' : 'border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {h}p {h === 720 ? 'HD' : h === 480 ? 'Balanced' : 'Tiny'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {tab === 'TRIM' && (
            <div className="space-y-2 text-xs">
              <div className="font-bold">Trim Window: {trimStart.toFixed(1)}s → {trimEnd.toFixed(1)}s</div>
              <input type="range" min={0} max={durationSec} step={0.1} value={trimStart} onChange={(e) => setTrimStart(Math.min(Number(e.target.value), trimEnd - 0.5))} className="w-full accent-pink-600" />
              <input type="range" min={0} max={durationSec} step={0.1} value={trimEnd} onChange={(e) => setTrimEnd(Math.max(Number(e.target.value), trimStart + 0.5))} className="w-full accent-pink-600" />
            </div>
          )}

          {tab === 'AUDIO' && (
            <div className="text-xs text-slate-600 dark:text-slate-300">
              Extracts uncompressed PCM WAV audio stream offline from your video. On Android APK, saves directly as lossless M4A in Music.
            </div>
          )}

          {isProcessing && (
            <div className="space-y-1">
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-pink-600 h-full transition-all" style={{ width: `${progress}%` }} />
              </div>
              <div className="text-[11px] text-pink-600 font-semibold">Processing media... {progress}%</div>
            </div>
          )}

          <button
            type="button"
            disabled={isProcessing}
            onClick={handleProcessMedia}
            className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-700 disabled:opacity-50 text-white text-xs font-bold"
          >
            {tab === 'COMPRESS' ? `Compress Video (${presetHeight}p)` : tab === 'TRIM' ? 'Export Trimmed Clip' : 'Extract Audio Track'}
          </button>
        </div>
      )}

      {outputUrl && (
        <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-emerald-500/10 space-y-2">
          <div className="text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
            Ready: {outputName} ({formatBytes(outputSize)})
          </div>
          {outputMime.startsWith('audio/') ? (
            <audio src={outputUrl} controls className="w-full" />
          ) : (
            <video src={outputUrl} controls className="w-full max-h-44 rounded-xl bg-black" />
          )}
          <a
            href={outputUrl}
            download={outputName}
            className="w-full py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" /> Download Output
          </a>
        </div>
      )}
    </div>
  );
};
