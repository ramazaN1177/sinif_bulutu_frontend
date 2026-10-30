import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Timer,
  RotateCcw,
  Volume2,
  VolumeX,
  CheckCircle2,
  XCircle,
  Flame,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import type { ActivityItem } from '../types/game';
import { useGameHudOptional } from '../components/game/GameHudContext';

interface TrueFalseGameProps {
  title?: string;
  items: ActivityItem[];
  onFinish?: (score: number) => void;
  isEmbed?: boolean;
}

export const TrueFalseGame: React.FC<TrueFalseGameProps> = ({
  title: _title = 'Doğru mu Yanlış mı?',
  items,
  onFinish,
  isEmbed: _isEmbed = false,
}) => {
  const hud = useGameHudOptional();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const currentItem = items[currentIdx] || items[0];
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sync with GameHud
  useEffect(() => {
    hud?.setScore(score);
    hud?.setStreak(streak);
    hud?.setTimeLeft(timeLeft);
    hud?.setTotalTime(45);
    hud?.setTotalQuestions(items.length);
    hud?.setQuestionIndex(currentIdx);
    hud?.setQuestionText(currentItem?.question || '');
  }, [hud, score, streak, timeLeft, items.length, currentIdx, currentItem]);

  // Pause sync
  useEffect(() => {
    if (hud?.isPaused) {
      setIsPlaying(false);
    } else if (!isFinished) {
      setIsPlaying(true);
    }
  }, [hud?.isPaused, isFinished]);

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

  const playSound = (type: 'correct' | 'wrong' | 'win') => {
    if (!soundEnabled || document.hidden) return;
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

      if (type === 'correct') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'wrong') {
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(110, now + 0.25);
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

  // Timer
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
    const stars = score >= (items.length * 80) ? 3 : score >= (items.length * 50) ? 2 : 1;
    hud?.finishGame(stars, Math.min(currentIdx + 1, items.length));
    if (onFinish) onFinish(score);
    if ((window as any)?.ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'GAME_COMPLETED', score, streak })
      );
    }
  };

  const handleChoice = (selectedBool: boolean) => {
    if (feedback !== null || isFinished) return;

    // Check answer: matches 'Doğru', 'True', 'D', 'Evet', '1'
    const ansLower = currentItem.answer.trim().toLowerCase();
    const isActuallyTrue = ['doğru', 'dogru', 'true', 'd', 'evet', '1'].includes(ansLower);
    const isCorrect = selectedBool === isActuallyTrue;

    if (isCorrect) {
      playSound('correct');
      const bonus = 100 + streak * 25;
      setScore((prev) => prev + bonus);
      setStreak((prev) => prev + 1);
      setFeedback('correct');
    } else {
      playSound('wrong');
      setStreak(0);
      setFeedback('wrong');
    }

    setTimeout(() => {
      setFeedback(null);
      if (currentIdx + 1 < items.length) {
        setCurrentIdx((prev) => prev + 1);
      } else {
        finishGame();
      }
    }, 700);
  };

  const resetGame = () => {
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(45);
    setFeedback(null);
    setIsPlaying(true);
    setIsFinished(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center select-none p-2 sm:p-4 overflow-y-auto">
      {/* Fallback HUD Bar when not inside GameShell */}
      {!hud?.isInsideShell && (
        <div className="w-full max-w-2xl mb-3 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm flex items-center justify-between text-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-extrabold text-slate-600">
                Skor: <strong className="text-slate-900 text-base">{score}</strong>
              </span>
            </div>
            {streak > 1 && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-200 text-xs font-black">
                <Flame size={14} className="fill-orange-500 text-orange-500" />
                <span>{streak}x</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-600" />
            <span className="font-mono text-base font-extrabold text-slate-900">{timeLeft}s</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              title="Ses"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={resetGame}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              title="Yeniden Başlat"
            >
              <RotateCcw size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full max-w-2xl flex-1 flex flex-col justify-center py-2">

      {/* Main Card with Question Statement */}
      <div
        className={`w-full min-h-[180px] sm:min-h-[280px] p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-white border-2 transition-all duration-300 flex flex-col items-center justify-center text-center shadow-xl relative overflow-hidden ${
          feedback === 'correct'
            ? 'border-emerald-500 bg-emerald-50/50 scale-[1.02]'
            : feedback === 'wrong'
            ? 'border-rose-500 bg-rose-50/50 shake-anim'
            : 'border-slate-200 hover:border-slate-300'
        }`}
      >
        <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-teal-600 mb-2 sm:mb-3 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200">
          İfade {currentIdx + 1} / {items.length}
        </span>

        {currentItem.image && (
          <div className="mb-3 max-h-36 sm:max-h-48 max-w-full overflow-hidden rounded-xl sm:rounded-2xl border border-slate-200 shadow-md">
            <img
              src={currentItem.image}
              alt={currentItem.question || 'İfade görseli'}
              className="max-h-36 sm:max-h-48 w-auto object-contain mx-auto"
            />
          </div>
        )}

        {currentItem.question && (
          <h2 className="text-base sm:text-2xl font-black text-slate-900 max-w-xl font-display leading-snug px-1">
            "{currentItem.question}"
          </h2>
        )}

        {/* Feedback Aura Icon */}
        {feedback === 'correct' && (
          <div className="absolute top-3 right-3 p-1.5 sm:p-2 rounded-xl bg-emerald-500 text-white shadow-lg animate-scale-in">
            <CheckCircle2 size={20} className="sm:w-6 sm:h-6" />
          </div>
        )}
        {feedback === 'wrong' && (
          <div className="absolute top-3 right-3 p-1.5 sm:p-2 rounded-xl bg-rose-500 text-white shadow-lg animate-scale-in">
            <XCircle size={20} className="sm:w-6 sm:h-6" />
          </div>
        )}
      </div>

      {/* Decision Buttons (Doğru vs Yanlış) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-6 w-full mt-4 sm:mt-6">
        {/* DOĞRU BUTTON */}
        <button
          onClick={() => handleChoice(true)}
          disabled={feedback !== null || isFinished}
          className="group relative py-3.5 sm:py-5 px-3 sm:px-6 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-95 text-white font-black text-base sm:text-xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 sm:gap-3 transition-all cursor-pointer border-2 border-emerald-400/40"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <Check size={20} className="stroke-[3]" />
          </div>
          <span>DOĞRU</span>
        </button>

        {/* YANLIŞ BUTTON */}
        <button
          onClick={() => handleChoice(false)}
          disabled={feedback !== null || isFinished}
          className="group relative py-3.5 sm:py-5 px-3 sm:px-6 rounded-2xl sm:rounded-3xl bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 active:scale-95 text-white font-black text-base sm:text-xl shadow-xl shadow-rose-500/25 flex items-center justify-center gap-2 sm:gap-3 transition-all cursor-pointer border-2 border-rose-400/40"
        >
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
            <X size={20} className="stroke-[3]" />
          </div>
          <span>YANLIŞ</span>
        </button>
      </div>
      </div>

      {/* Game Over Modal */}
      {isFinished && (
        <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in text-slate-800 border border-slate-200">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-200 text-teal-600 flex items-center justify-center mb-4 shadow-sm">
            <Sparkles size={36} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 font-display">
            Tebrikler, Tamamladınız!
          </h2>
          <p className="text-slate-600 text-sm mb-6 max-w-md">
            Doğru ve yanlış kararlarınızla <strong className="text-teal-600 font-bold">{score} puan</strong> topladınız!
          </p>

          <button
            onClick={resetGame}
            className="py-3 px-8 rounded-xl font-bold text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/25 flex items-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <RotateCcw size={16} />
            <span>Tekrar Oyna</span>
          </button>
        </div>
      )}
    </div>
  );
};
