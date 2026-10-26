import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Timer,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Flame,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import type { ActivityItem } from '../types/game';

interface BalloonGameProps {
  title?: string;
  items: ActivityItem[];
  onFinish?: (score: number) => void;
  isEmbed?: boolean;
}

interface BalloonOption {
  id: string;
  text: string;
  isCorrect: boolean;
  color: string;
  gradient: string;
  isPopped: boolean;
  xPercent: number; // horizontal placement
}

const BALLOON_PALETTES = [
  { color: 'rose', gradient: 'from-rose-400 to-rose-600 border-rose-300' },
  { color: 'sky', gradient: 'from-sky-400 to-blue-600 border-sky-300' },
  { color: 'amber', gradient: 'from-amber-400 to-orange-500 border-amber-300' },
  { color: 'emerald', gradient: 'from-emerald-400 to-emerald-600 border-emerald-300' },
  { color: 'purple', gradient: 'from-purple-400 to-indigo-600 border-purple-300' },
];

export const BalloonGame: React.FC<BalloonGameProps> = ({
  title: _title = 'Balon Patlatma',
  items,
  onFinish,
  isEmbed = false,
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [balloons, setBalloons] = useState<BalloonOption[]>([]);

  const currentItem = items[currentIdx] || items[0];
  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = (type: 'pop' | 'wrong' | 'win') => {
    if (!soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'pop') {
        osc.frequency.setValueAtTime(650, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc.start(now);
        osc.stop(now + 0.15);
      } else if (type === 'wrong') {
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(120, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'win') {
        [440, 554, 659, 880].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.2, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
          o.start(now + i * 0.1);
          o.stop(now + i * 0.1 + 0.3);
        });
      }
    } catch {
      // Audio fallback
    }
  };

  const spawnBalloons = () => {
    const correct = currentItem.answer;
    let wrongs: string[] = [];

    if (currentItem.options && currentItem.options.length > 1) {
      wrongs = currentItem.options.filter((o) => o !== correct);
    } else {
      wrongs = items
        .filter((it) => it.id !== currentItem.id)
        .map((it) => it.answer)
        .slice(0, 3);
      if (wrongs.length === 0) wrongs = ['Yanlış 1', 'Yanlış 2'];
    }

    const options = [correct, ...wrongs.sort(() => Math.random() - 0.5).slice(0, 3)].sort(
      () => Math.random() - 0.5
    );

    const xOffsets = [15, 38, 62, 85];
    const newBalloons: BalloonOption[] = options.map((text, idx) => {
      const palette = BALLOON_PALETTES[idx % BALLOON_PALETTES.length];
      return {
        id: `${Date.now()}_${idx}`,
        text,
        isCorrect: text === correct,
        color: palette.color,
        gradient: palette.gradient,
        isPopped: false,
        xPercent: xOffsets[idx] || 50,
      };
    });

    setBalloons(newBalloons);
  };

  useEffect(() => {
    if (!isPlaying || isFinished) return;
    spawnBalloons();
  }, [currentIdx, isPlaying, isFinished]);

  useEffect(() => {
    if (!isPlaying || isFinished) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          finishGame();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, isFinished]);

  const finishGame = () => {
    setIsPlaying(false);
    setIsFinished(true);
    playSound('win');
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    if (onFinish) onFinish(score);
    if ((window as any)?.ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'GAME_COMPLETED', score, streak })
      );
    }
  };

  const handlePop = (balloon: BalloonOption) => {
    if (balloon.isPopped || isFinished) return;

    if (balloon.isCorrect) {
      playSound('pop');
      confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
      const bonus = 100 + streak * 20;
      setScore((prev) => prev + bonus);
      setStreak((prev) => prev + 1);

      setBalloons((prev) =>
        prev.map((b) => (b.id === balloon.id ? { ...b, isPopped: true } : b))
      );

      setTimeout(() => {
        if (currentIdx + 1 < items.length) {
          setCurrentIdx((prev) => prev + 1);
        } else {
          finishGame();
        }
      }, 700);
    } else {
      playSound('wrong');
      setStreak(0);
      setBalloons((prev) =>
        prev.map((b) => (b.id === balloon.id ? { ...b, isPopped: true } : b))
      );
    }
  };

  const resetGame = () => {
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setIsPlaying(true);
    setIsFinished(false);
  };

  return (
    <div
      className={`relative w-full max-w-4xl mx-auto flex flex-col items-center select-none ${
        isEmbed ? 'p-1' : 'p-4'
      }`}
    >
      {/* HUD Bar */}
      <div className="w-full mb-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-extrabold text-slate-600">
              Skor: <strong className="text-slate-900 text-base">{score}</strong>
            </span>
          </div>

          {streak > 1 && (
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 text-xs font-black anim-pulse-glow">
              <Flame size={14} className="fill-orange-500 text-orange-500" />
              <span>{streak}x Seri!</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-blue-600" />
          <span className="font-mono text-base font-extrabold text-slate-900">{timeLeft}s</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer"
            title="Sesi Aç/Kapat"
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
          <button
            onClick={resetGame}
            className="p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 cursor-pointer"
            title="Yeniden Başlat"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Question Bar */}
      <div className="w-full mb-3 p-4 rounded-2xl bg-white border-2 border-fuchsia-400 shadow-md text-center">
        <span className="text-[11px] font-black uppercase tracking-wider text-fuchsia-600 block mb-1">
          Soru {currentIdx + 1} / {items.length} • Doğru Balona Dokunarak Patlat!
        </span>
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display">
          {currentItem.question}
        </h3>
      </div>

      {/* Balloon Playfield */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden border-4 border-fuchsia-300 shadow-xl p-4 sm:p-6 bg-gradient-to-b from-sky-100 via-sky-50 to-indigo-50 flex items-center justify-around">
        {/* Soft floating stars & particles background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-fuchsia-900/20 via-transparent to-transparent pointer-events-none" />

        {/* 4 Floating Balloons */}
        <div className="relative z-10 w-full h-full flex items-center justify-around px-2 sm:px-6">
          {balloons.map((balloon) => {
            if (balloon.isPopped) {
              return (
                <div
                  key={balloon.id}
                  className="w-24 sm:w-32 h-36 sm:h-44 flex items-center justify-center opacity-40 scale-75 transition-all duration-300 pointer-events-none"
                >
                  {balloon.isCorrect ? (
                    <div className="p-3 rounded-full bg-emerald-500 text-white animate-scale-in">
                      <CheckCircle2 size={32} />
                    </div>
                  ) : (
                    <div className="p-3 rounded-full bg-rose-500 text-white animate-scale-in">
                      <XCircle size={32} />
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div
                key={balloon.id}
                onClick={() => handlePop(balloon)}
                className="relative flex flex-col items-center cursor-pointer group hover:scale-110 active:scale-95 transition-all duration-300 select-none animate-float"
              >
                {/* Balloon Body */}
                <div
                  className={`w-24 sm:w-32 h-32 sm:h-40 rounded-[50%_50%_50%_50%/40%_40%_60%_60%] bg-gradient-to-tr ${balloon.gradient} border-2 shadow-xl shadow-fuchsia-950/50 flex items-center justify-center p-3 text-center relative overflow-hidden`}
                >
                  {/* Glossy Balloon Highlight */}
                  <div className="absolute top-3 left-4 w-6 h-10 rounded-full bg-white/40 rotate-[-25deg] filter blur-[0.5px] pointer-events-none" />

                  {/* Answer Text on Balloon */}
                  <span
                    className="relative z-10 font-black text-white text-xs sm:text-sm tracking-tight leading-tight select-none drop-shadow-md"
                    style={{ textShadow: '0 1px 3px rgba(0,0,0,0.6)' }}
                  >
                    {balloon.text}
                  </span>
                </div>

                {/* Balloon Knot and String */}
                <div className="w-3 h-2 bg-current rounded-sm -mt-0.5 opacity-80" />
                <div className="w-0.5 h-10 sm:h-14 bg-white/30 rounded-full -mt-0.5" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Finished Game Overlay */}
      {isFinished && (
        <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in text-slate-800 border border-slate-200">
          <div className="w-16 h-16 rounded-3xl bg-fuchsia-50 border border-fuchsia-200 text-fuchsia-600 flex items-center justify-center mb-4 shadow-sm">
            <Sparkles size={36} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 font-display">
            Tebrikler, Tüm Balonları Patlattınız!
          </h2>
          <p className="text-slate-600 text-sm mb-6 max-w-md">
            Doğru balonları patlatıp <strong className="text-fuchsia-600 font-bold">{score} puan</strong> kazandınız!
          </p>

          <button
            onClick={resetGame}
            className="py-3 px-8 rounded-2xl bg-fuchsia-600 hover:bg-fuchsia-700 text-white font-bold text-sm shadow-lg shadow-fuchsia-500/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Tekrar Oyna</span>
          </button>
        </div>
      )}
    </div>
  );
};
