import { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCw, Trash2, Volume2, VolumeX, Sparkles } from 'lucide-react';
import type { ActivityItem } from '../types/game';

interface WheelGameProps {
  title?: string;
  items: ActivityItem[];
  onFinish?: (score: number) => void;
  isEmbed?: boolean;
}

const COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#10B981', '#06B6D4',
  '#3B82F6', '#6366F1', '#8B5CF6', '#EC4899', '#14B8A6',
];

export const WheelGame: React.FC<WheelGameProps> = ({
  title = 'Rastgele Çarkıfelek',
  items: initialItems,
  onFinish,
  isEmbed = false,
}) => {
  const [items, setItems] = useState<ActivityItem[]>(initialItems);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ActivityItem | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rotationRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Clean up AudioContext on unmount
  useEffect(() => {
    return () => {
      try {
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          audioCtxRef.current.close().catch(() => {});
        }
      } catch {}
    };
  }, []);

  // Listen for backgrounding / tab hidden
  useEffect(() => {
    const handlePause = () => {
      try {
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
          audioCtxRef.current.suspend().catch(() => {});
        }
      } catch {}
    };
    const handleVisibility = () => {
      if (document.hidden) handlePause();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('app_pause_audio', handlePause);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('app_pause_audio', handlePause);
    };
  }, []);

  const getAudioCtx = () => {
    try {
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current?.state === 'suspended') {
        audioCtxRef.current.resume().catch(() => {});
      }
      return audioCtxRef.current;
    } catch {
      return null;
    }
  };

  // Play sound synthesized with Web Audio API (cross-platform, zero asset load failure)
  const playTickSound = () => {
    if (!soundEnabled || document.hidden) return;
    try {
      const audioCtx = getAudioCtx();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600, audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, audioCtx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.05);
    } catch {}
  };

  const playWinSound = () => {
    if (!soundEnabled || document.hidden) return;
    try {
      const audioCtx = getAudioCtx();
      if (!audioCtx) return;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2, audioCtx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + idx * 0.1 + 0.3);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(audioCtx.currentTime + idx * 0.1);
        osc.stop(audioCtx.currentTime + idx * 0.1 + 0.3);
      });
    } catch {}
  };

  // Draw the wheel
  const drawWheel = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = width / 2 - 20;

    ctx.clearRect(0, 0, width, height);

    if (items.length === 0) {
      ctx.fillStyle = '#64748B';
      ctx.font = 'bold 20px "Plus Jakarta Sans"';
      ctx.textAlign = 'center';
      ctx.fillText('Tüm seçenekler tamamlandı!', centerX, centerY);
      return;
    }

    const arc = (2 * Math.PI) / items.length;

    // Draw slices
    for (let i = 0; i < items.length; i++) {
      const angle = rotationRef.current + i * arc;
      ctx.beginPath();
      ctx.fillStyle = COLORS[i % COLORS.length];
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, angle, angle + arc);
      ctx.lineTo(centerX, centerY);
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#0A1128';
      ctx.stroke();

      // Text inside slice
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 15px "Plus Jakarta Sans", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 4;

      const text = items[i].question || items[i].answer;
      const truncated = text.length > 18 ? text.substring(0, 16) + '...' : text;
      ctx.fillText(truncated, radius - 25, 6);
      ctx.restore();
    }

    // Outer Glow Ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#3B82F6';
    ctx.stroke();

    // Center circle
    ctx.beginPath();
    ctx.arc(centerX, centerY, 38, 0, 2 * Math.PI);
    ctx.fillStyle = '#0A1128';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

    // Center text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '800 13px "Outfit", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('ÇEVİR', centerX, centerY + 5);
  };

  useEffect(() => {
    drawWheel();
  }, [items]);

  const spin = () => {
    if (isSpinning || items.length === 0) return;
    setIsSpinning(true);
    setSelectedItem(null);

    const spinAngle = Math.PI * 2 * (5 + Math.random() * 4);
    const duration = 4000;
    const startTime = performance.now();
    const startRotation = rotationRef.current;

    let lastTickAngle = 0;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentRotation = startRotation + spinAngle * easeOut;

      rotationRef.current = currentRotation;
      drawWheel();

      // Tick sound every slice crossed
      const sliceSize = (2 * Math.PI) / items.length;
      if (Math.abs(currentRotation - lastTickAngle) > sliceSize) {
        playTickSound();
        lastTickAngle = currentRotation;
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        // Determine selected slice (pointer is at the top: angle 3*PI/2)
        const normalized = (rotationRef.current % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        const arc = (2 * Math.PI) / items.length;
        // Pointer is at 1.5 * PI (270 degrees / Top)
        const pointerAngle = (3 * Math.PI) / 2;
        let index = Math.floor(((pointerAngle - normalized + 2 * Math.PI) % (2 * Math.PI)) / arc);
        index = (index + items.length) % items.length;

        const picked = items[index];
        setSelectedItem(picked);
        playWinSound();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });

        // Notify parent / React Native WebView if embedded
        if (window && (window as any).ReactNativeWebView) {
          (window as any).ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'WHEEL_SELECTED', payload: picked })
          );
        }
        if (onFinish) onFinish(10);
      }
    };

    requestAnimationFrame(animate);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    setSelectedItem(null);
  };

  return (
    <div className={`flex flex-col items-center justify-center w-full ${isEmbed ? 'p-2' : 'p-6'}`}>
      {/* Title Bar */}
      {!isEmbed && (
        <div className="flex items-center justify-between w-full max-w-lg mb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
          </div>
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
            title={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      )}

      {/* Wheel Wrapper with Pointer */}
      <div className="relative flex items-center justify-center my-2 max-w-full">
        {/* Top Pointer Indicator */}
        <div className="absolute -top-2.5 sm:-top-3.5 z-20 w-0 h-0 border-l-[10px] sm:border-l-[14px] border-l-transparent border-r-[10px] sm:border-r-[14px] border-r-transparent border-t-[20px] sm:border-t-[28px] border-t-amber-500 drop-shadow-[0_4px_8px_rgba(0,0,0,0.25)]" />

        <canvas
          ref={canvasRef}
          width={600}
          height={600}
          onClick={spin}
          className={`w-[min(300px,82vw)] h-[min(300px,82vw)] sm:w-[380px] sm:h-[380px] max-w-full cursor-pointer transition-transform duration-200 ${
            isSpinning ? 'cursor-not-allowed scale-[0.99]' : 'hover:scale-[1.01]'
          }`}
        />
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-3 w-full">
        <button
          onClick={spin}
          disabled={isSpinning || items.length === 0}
          className={`px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl font-black text-sm sm:text-base flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
            isSpinning || items.length === 0
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/25 active:scale-95'
          }`}
        >
          <RotateCw className={`w-4 h-4 sm:w-5 sm:h-5 ${isSpinning ? 'animate-spin' : ''}`} />
          {isSpinning ? 'Çevriliyor...' : 'ÇARKINI ÇEVİR!'}
        </button>

        {items.length < initialItems.length && (
          <button
            onClick={() => {
              setItems(initialItems);
              setSelectedItem(null);
            }}
            className="px-4 py-3.5 rounded-2xl font-bold text-sm bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs cursor-pointer"
          >
            Sıfırla
          </button>
        )}
      </div>

      {/* Selected Item Modal / Overlay */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-md p-6 rounded-3xl bg-white border border-slate-200 shadow-2xl text-center transform scale-100 transition-all text-slate-800">
            <div className="inline-flex p-3 mb-3 rounded-full bg-amber-50 text-amber-500 border border-amber-200 shadow-xs">
              <Sparkles className="w-8 h-8 animate-bounce" />
            </div>
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-600">
              Çarkın Seçimi
            </h3>
            <p className="my-4 text-2xl font-black text-slate-900 px-2 leading-snug">
              {selectedItem.question || selectedItem.answer}
            </p>
            {selectedItem.answer && selectedItem.question !== selectedItem.answer && (
              <p className="mb-6 text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
                {selectedItem.answer}
              </p>
            )}

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => removeItem(selectedItem.id)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer"
              >
                <Trash2 size={16} />
                Listeden Kaldır
              </button>
              <button
                onClick={() => setSelectedItem(null)}
                className="px-6 py-2.5 rounded-xl text-sm font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 transition-all cursor-pointer active:scale-95"
              >
                Devam Et
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
