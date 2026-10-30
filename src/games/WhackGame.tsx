import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  CheckCircle2,
  Hammer,
} from 'lucide-react';
import type { ActivityItem } from '../types/game';
import { useGameHudOptional } from '../components/game/GameHudContext';
import { triggerHaptic } from '../services/gameSettings';

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
  items,
  onFinish,
}) => {
  const hud = useGameHudOptional();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hammerPos, setHammerPos] = useState<{ x: number; y: number; visible: boolean }>({
    x: 0,
    y: 0,
    visible: false,
  });

  // 6 interactive mole holes (arranged in a 3x2 grid)
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

  // Sync state with GameHudContext
  useEffect(() => {
    if (!hud) return;
    hud.setScore(score);
    hud.setStreak(streak);
    hud.setTimeLeft(timeLeft);
    hud.setQuestionInfo(currentIdx, items.length, currentItem?.question, currentItem?.image);
  }, [hud, score, streak, timeLeft, currentIdx, items.length, currentItem]);

  // Sync sound from HUD
  useEffect(() => {
    if (hud) {
      setSoundEnabled(hud.soundEnabled);
    }
  }, [hud?.soundEnabled]);

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

  // Pause handling
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

    const pickedWrongs = wrongs.sort(() => Math.random() - 0.5).slice(0, 3);
    const all = [correct, ...pickedWrongs].sort(() => Math.random() - 0.5);
    return { correct, all };
  };

  // Spawn moles into random slots
  const spawnMoles = () => {
    if (!isPlaying || isFinished || document.hidden) return;
    const { correct, all } = getOptionsForQuestion();

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
    }, 3800);
    return () => clearInterval(interval);
  }, [currentIdx, isPlaying, isFinished]);

  const finishGame = () => {
    setIsPlaying(false);
    setIsFinished(true);
    playSound('win');
    confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    if (onFinish) onFinish(score);
    if (hud) {
      hud.finishGame(score, correctCount, items.length);
    }
  };

  const handleWhack = (e: React.MouseEvent | React.TouchEvent, slot: MoleSlot) => {
    if (!slot.isActive || slot.isHit || isFinished) return;

    // Trigger visual hammer strike at touch/click location
    const rect = e.currentTarget.getBoundingClientRect();
    setHammerPos({ x: rect.left + rect.width / 2, y: rect.top + 10, visible: true });
    setTimeout(() => {
      setHammerPos((prev) => ({ ...prev, visible: false }));
    }, 350);

    if (slot.isCorrect) {
      // Correct!
      triggerHaptic('success');
      playSound('hit');
      const bonus = 100 + streak * 20;
      setScore((prev) => prev + bonus);
      setStreak((prev) => prev + 1);
      setCorrectCount((prev) => prev + 1);

      setSlots((prev) =>
        prev.map((s) => (s.id === slot.id ? { ...s, isHit: true } : s))
      );

      // Advance question
      setTimeout(() => {
        if (currentIdx + 1 < items.length) {
          setCurrentIdx((prev) => prev + 1);
        } else {
          finishGame();
        }
      }, 650);
    } else {
      // Wrong mole hit
      triggerHaptic('error');
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

  return (
    <div className="relative w-full h-full flex-1 min-h-0 flex flex-col justify-between items-center select-none overflow-hidden p-2 sm:p-4">
      {/* Question Card at Top: Translucent, friendly, non-intrusive */}
      <div className="w-full max-w-xl mx-auto px-4 py-2.5 sm:py-3.5 rounded-2xl sm:rounded-3xl bg-white/90 backdrop-blur-md border-2 border-white shadow-md text-center mb-1 shrink-0 animate-scale-in">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-emerald-600 mb-0.5">
          <Sparkles size={13} className="text-amber-500" />
          <span>Doğru Köstebeğe Vur!</span>
        </div>
        <h3 className="text-base sm:text-2xl font-black font-display text-slate-900 leading-tight">
          {currentItem.question}
        </h3>
        {currentItem.image && (
          <div className="mt-2 max-w-[120px] max-h-[80px] mx-auto rounded-xl overflow-hidden border border-slate-200">
            <img src={currentItem.image} alt="Soru görseli" className="w-full h-full object-cover" />
          </div>
        )}
      </div>

      {/* Meadow Playfield (Whack-a-Mole Holes Grid Filling Remaining Screen) */}
      <div className="relative z-10 flex-1 min-h-0 w-full max-w-4xl mx-auto flex flex-col justify-center items-center py-2">
        {/* 6 Holes Grid: 3 columns x 2 rows, scaled dynamically */}
        <div className="grid grid-cols-3 gap-y-4 sm:gap-y-10 gap-x-3 sm:gap-x-8 w-full max-w-3xl mx-auto items-end my-auto">
          {slots.map((slot) => {
            return (
              <div
                key={slot.id}
                onClick={(e) => handleWhack(e, slot)}
                onTouchStart={(e) => handleWhack(e, slot)}
                className="relative flex flex-col items-center justify-end h-24 sm:h-36 md:h-44 cursor-pointer group select-none active:scale-95 transition-transform"
              >
                {/* Hole Graphic on Ground */}
                <div
                  className="absolute bottom-0 w-24 sm:w-36 md:w-44 h-12 sm:h-18 md:h-22 bg-contain bg-no-repeat bg-center z-10 pointer-events-none drop-shadow-md"
                  style={{
                    backgroundImage: 'url(/games/whack/hole.png)',
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
                    className={`px-2.5 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm shadow-xl border-2 transition-all duration-200 -mb-2 sm:-mb-3 z-30 flex items-center gap-1.5 max-w-[120px] sm:max-w-[180px] ${
                      slot.isHit
                        ? 'bg-emerald-500 border-white text-white scale-110 shadow-emerald-500/50'
                        : slot.isWrongHit
                        ? 'bg-rose-500 border-white text-white shake-anim'
                        : 'bg-amber-400 hover:bg-amber-300 border-white text-slate-950 hover:scale-105'
                    }`}
                  >
                    <span className="truncate">{slot.text}</span>
                    {slot.isHit && <CheckCircle2 size={14} className="text-white shrink-0" />}
                  </div>

                  {/* Mole Graphic Asset */}
                  <div
                    className="w-18 sm:w-28 md:w-32 h-18 sm:h-28 md:h-32 bg-contain bg-no-repeat bg-center drop-shadow-xl"
                    style={{
                      backgroundImage: 'url(/games/whack/mole.png)',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
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
          <div className="p-3 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-200 text-slate-950 border-2 border-white shadow-2xl rotate-12 flex items-center justify-center">
            <Hammer size={36} className="stroke-[2.5]" />
          </div>
        </div>
      )}
    </div>
  );
};
