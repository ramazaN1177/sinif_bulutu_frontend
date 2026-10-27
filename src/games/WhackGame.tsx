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
  Hammer,
} from 'lucide-react';
import type { ActivityItem } from '../types/game';

interface WhackGameProps {
  title?: string;
  items: ActivityItem[];
  onFinish?: (score: number) => void;
  isEmbed?: boolean;
}

interface MoleSlot {
  id: number;
  isActive: boolean;
  text: string;
  isCorrect: boolean;
  isHit: boolean;
  isWrongHit: boolean;
}

export const WhackGame: React.FC<WhackGameProps> = ({
  title: _title = 'Köstebek Vurmaca',
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
  const [hammerPos, setHammerPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  const [slots, setSlots] = useState<MoleSlot[]>([
    { id: 0, isActive: false, text: '', isCorrect: false, isHit: false, isWrongHit: false },
    { id: 1, isActive: false, text: '', isCorrect: false, isHit: false, isWrongHit: false },
    { id: 2, isActive: false, text: '', isCorrect: false, isHit: false, isWrongHit: false },
    { id: 3, isActive: false, text: '', isCorrect: false, isHit: false, isWrongHit: false },
    { id: 4, isActive: false, text: '', isCorrect: false, isHit: false, isWrongHit: false },
    { id: 5, isActive: false, text: '', isCorrect: false, isHit: false, isWrongHit: false },
  ]);

  const currentItem = items[currentIdx] || items[0];
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Audio cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
          audioCtxRef.current.close().catch(() => {});
        }
      } catch {}
    };
  }, []);

  // Listen for mobile backgrounding or tab hidden
  useEffect(() => {
    const handlePause = () => {
      setIsPlaying(false);
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

  const playSound = (type: 'pop' | 'hit' | 'wrong' | 'win') => {
    if (!soundEnabled || document.hidden) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'pop') {
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'hit') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.setValueAtTime(880, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'wrong') {
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.2);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'win') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const noteOsc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          noteOsc.connect(noteGain);
          noteGain.connect(ctx.destination);
          noteOsc.frequency.value = freq;
          const start = now + i * 0.1;
          noteGain.gain.setValueAtTime(0.2, start);
          noteGain.gain.exponentialRampToValueAtTime(0.01, start + 0.25);
          noteOsc.start(start);
          noteOsc.stop(start + 0.25);
        });
      }
    } catch {
      // Audio fallback silent
    }
  };

  // Generate options for current question
  const getOptionsForQuestion = () => {
    const correct = currentItem.answer;
    let wrongs: string[] = [];

    if (currentItem.options && currentItem.options.length > 1) {
      wrongs = currentItem.options.filter((o) => o !== correct);
    } else {
      wrongs = items
        .filter((it) => it.id !== currentItem.id)
        .map((it) => it.answer)
        .slice(0, 3);
      if (wrongs.length === 0) {
        wrongs = ['Seçenek A', 'Seçenek B', 'Seçenek C'];
      }
    }

    // Pick 2-3 wrong options
    const pickedWrongs = wrongs.sort(() => Math.random() - 0.5).slice(0, 3);
    const all = [correct, ...pickedWrongs].sort(() => Math.random() - 0.5);
    return { correct, all };
  };

  // Spawn moles into random slots
  const spawnMoles = () => {
    if (!isPlaying || isFinished || document.hidden) return;
    const { correct, all } = getOptionsForQuestion();

    // Pick random slots for each option
    const shuffledSlotIndices = [0, 1, 2, 3, 4, 5].sort(() => Math.random() - 0.5);

    setSlots((prev) =>
      prev.map((slot) => {
        const optionIndex = shuffledSlotIndices.indexOf(slot.id);
        if (optionIndex < all.length) {
          const text = all[optionIndex];
          return {
            ...slot,
            isActive: true,
            text,
            isCorrect: text === correct,
            isHit: false,
            isWrongHit: false,
          };
        }
        return {
          ...slot,
          isActive: false,
          text: '',
          isCorrect: false,
          isHit: false,
          isWrongHit: false,
        };
      })
    );

    playSound('pop');
  };

  // Timer countdown
  useEffect(() => {
    if (!isPlaying || isFinished) return;
    const interval = setInterval(() => {
      if (document.hidden) return;
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

  // Spawn loop
  useEffect(() => {
    if (!isPlaying || isFinished) return;
    spawnMoles();
    const interval = setInterval(() => {
      if (!document.hidden) {
        spawnMoles();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [currentIdx, isPlaying, isFinished]);

  const finishGame = () => {
    setIsPlaying(false);
    setIsFinished(true);
    playSound('win');
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    if (onFinish) onFinish(score);
    if ((window as any)?.ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'GAME_COMPLETED', score, streak })
      );
    }
  };

  const handleWhack = (e: React.MouseEvent, slot: MoleSlot) => {
    if (!slot.isActive || slot.isHit || isFinished) return;

    // Trigger visual hammer strike at mouse click location
    const rect = e.currentTarget.getBoundingClientRect();
    setHammerPos({ x: rect.left + rect.width / 2, y: rect.top + 10, visible: true });
    setTimeout(() => {
      setHammerPos((prev) => ({ ...prev, visible: false }));
    }, 350);

    if (slot.isCorrect) {
      // Correct!
      playSound('hit');
      const bonus = 100 + streak * 15;
      setScore((prev) => prev + bonus);
      setStreak((prev) => prev + 1);

      setSlots((prev) =>
        prev.map((s) => (s.id === slot.id ? { ...s, isHit: true } : s))
      );

      // Advance question
      setTimeout(() => {
        if (currentIdx + 1 < items.length) {
          setCurrentIdx((prev) => prev + 1);
        } else {
          // Loop or finish
          finishGame();
        }
      }, 700);
    } else {
      // Wrong mole hit
      playSound('wrong');
      setStreak(0);
      setSlots((prev) =>
        prev.map((s) => (s.id === slot.id ? { ...s, isWrongHit: true } : s))
      );
      setTimeout(() => {
        setSlots((prev) =>
          prev.map((s) => (s.id === slot.id ? { ...s, isWrongHit: false } : s))
        );
      }, 500);
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
      {/* Top HUD Bar */}
      <div className="w-full mb-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-slate-800">
        {/* Score & Streak */}
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

        {/* Timer */}
        <div className="flex items-center gap-2">
          <Timer className="w-5 h-5 text-blue-600" />
          <span className="font-mono text-base font-extrabold text-slate-900">
            {timeLeft}s
          </span>
        </div>

        {/* Audio & Restart */}
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

      {/* Question Pin Board */}
      <div className="w-full mb-3 p-4 rounded-2xl bg-white border-2 border-emerald-500 shadow-md text-center">
        <span className="text-[11px] font-black uppercase tracking-wider text-emerald-600 block mb-1">
          Soru {currentIdx + 1} / {items.length} • Doğru Cevabı Taşıyan Köstebeğe Vur!
        </span>
        <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 font-display">
          {currentItem.question}
        </h3>
      </div>

      {/* Meadow Playfield (Whack-a-Mole Ground) */}
      <div
        className="relative w-full aspect-[4/3] sm:aspect-[16/9] min-h-[300px] sm:min-h-[420px] rounded-2xl sm:rounded-3xl overflow-hidden border-2 sm:border-4 border-emerald-700/60 shadow-2xl flex flex-col justify-end p-2 sm:p-6"
        style={{
          backgroundImage: 'url(/assets/whack_bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center bottom',
        }}
      >
        {/* Soft Ambient Overlay */}
        <div className="absolute inset-0 bg-emerald-950/10 pointer-events-none" />

        {/* 6 Holes Grid in 2 Rows (3 per row) with Isometric Depth */}
        <div className="relative z-10 grid grid-cols-3 gap-y-2.5 sm:gap-y-6 gap-x-2 sm:gap-x-6 w-full max-w-3xl mx-auto">
          {slots.map((slot) => {
            return (
              <div
                key={slot.id}
                onClick={(e) => handleWhack(e, slot)}
                className="relative flex flex-col items-center justify-end h-24 sm:h-38 cursor-pointer group select-none"
              >
                {/* Hole Graphic on Ground (Transparent PNG) */}
                <div
                  className="absolute bottom-0 w-20 sm:w-36 h-10 sm:h-18 bg-contain bg-no-repeat bg-center z-10 pointer-events-none drop-shadow-md"
                  style={{
                    backgroundImage: 'url(/assets/whack_hole.png)',
                  }}
                />

                {/* Mole Character Popping Out */}
                <div
                  className={`relative z-20 flex flex-col items-center transition-all duration-300 transform ${
                    slot.isActive
                      ? slot.isHit
                        ? 'translate-y-8 sm:translate-y-12 scale-90 opacity-40'
                        : slot.isWrongHit
                        ? 'translate-y-1 rotate-6 scale-95'
                        : 'translate-y-0 scale-100 group-hover:scale-105'
                      : 'translate-y-20 sm:translate-y-28 scale-75 opacity-0 pointer-events-none'
                  }`}
                >
                  {/* Answer Badge on Top of Mole's Helmet */}
                  <div
                    className={`px-2 sm:px-3 py-0.5 sm:py-1.5 rounded-lg sm:rounded-xl font-black text-[10px] sm:text-xs shadow-xl border-2 transition-all duration-200 -mb-1.5 sm:-mb-2 z-30 flex items-center gap-1 ${
                      slot.isHit
                        ? 'bg-emerald-500 border-white text-white scale-110 shadow-emerald-500/50'
                        : slot.isWrongHit
                        ? 'bg-rose-600 border-white text-white shake-anim'
                        : 'bg-amber-400 hover:bg-amber-300 border-amber-600 text-slate-950 hover:scale-105'
                    }`}
                  >
                    <span className="line-clamp-1">{slot.text}</span>
                    {slot.isHit && <CheckCircle2 size={12} className="text-white shrink-0" />}
                  </div>

                  {/* Mole Graphic Asset (Transparent PNG) */}
                  <div
                    className="w-16 sm:w-26 h-16 sm:h-26 bg-contain bg-no-repeat bg-center drop-shadow-lg"
                    style={{
                      backgroundImage: 'url(/assets/mole_char.png)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Striking Hammer Effect */}
        {hammerPos.visible && (
          <div
            className="fixed pointer-events-none z-50 anim-hammer drop-shadow-2xl"
            style={{
              left: `${hammerPos.x}px`,
              top: `${hammerPos.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 border-2 border-white shadow-2xl rotate-12 flex items-center justify-center">
              <Hammer size={32} className="stroke-[2.5]" />
            </div>
          </div>
        )}
      </div>

      {/* Finished Game Overlay */}
      {isFinished && (
        <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in text-slate-800 border border-slate-200">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mb-4 shadow-sm">
            <Sparkles size={36} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 font-display">
            Tebrikler, Oyun Tamamlandı!
          </h2>
          <p className="text-slate-600 text-sm mb-6 max-w-md">
            Köstebekleri yakalayarak <strong className="text-blue-600 font-bold">{score} puan</strong> topladınız!
          </p>

          <button
            onClick={resetGame}
            className="py-3 px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Tekrar Oyna</span>
          </button>
        </div>
      )}
    </div>
  );
};
