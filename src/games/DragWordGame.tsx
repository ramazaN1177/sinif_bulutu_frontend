import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Timer,
  RotateCcw,
  Volume2,
  VolumeX,
  FileText,
  Sparkles,
  Flame,
} from 'lucide-react';
import type { ActivityItem } from '../types/game';

interface DragWordGameProps {
  title?: string;
  items: ActivityItem[];
  onFinish?: (score: number) => void;
  isEmbed?: boolean;
}

export const DragWordGame: React.FC<DragWordGameProps> = ({
  title: _title = 'Cümle İçi Boşluk Doldurma',
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
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);

  const currentItem = items[currentIdx] || items[0];
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Generate word bank options
  const [options, setOptions] = useState<string[]>([]);

  const playSound = (type: 'place' | 'correct' | 'wrong' | 'win') => {
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

      if (type === 'place') {
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'correct') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.18);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
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

  useEffect(() => {
    const handleSilence = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend().catch(() => {});
      }
      setIsPlaying(false);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        handleSilence();
      }
    };

    window.addEventListener('app_pause_audio', handleSilence);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('app_pause_audio', handleSilence);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close().catch(() => {});
        } catch {}
        audioCtxRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
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

    const shuffled = [correct, ...wrongs.sort(() => Math.random() - 0.5).slice(0, 3)].sort(
      () => Math.random() - 0.5
    );
    setOptions(shuffled);
    setSelectedWord(null);
    setFeedback(null);
  }, [currentIdx, items]);

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

  const handleSelectWord = (word: string) => {
    if (feedback !== null || isFinished) return;
    setSelectedWord(word);
    playSound('place');

    const isCorrect = word.trim().toLowerCase() === currentItem.answer.trim().toLowerCase();

    if (isCorrect) {
      playSound('correct');
      const bonus = 100 + streak * 20;
      setScore((prev) => prev + bonus);
      setStreak((prev) => prev + 1);
      setFeedback('correct');

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
      setFeedback('wrong');

      setTimeout(() => {
        setSelectedWord(null);
        setFeedback(null);
      }, 600);
    }
  };

  const resetGame = () => {
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setTimeLeft(60);
    setSelectedWord(null);
    setFeedback(null);
    setIsPlaying(true);
    setIsFinished(false);
  };

  // Format sentence displaying blank placeholder
  const rawQuestion = currentItem.question || '';
  const parts = rawQuestion.includes('___')
    ? rawQuestion.split('___')
    : [rawQuestion, ''];

  return (
    <div
      className={`relative w-full max-w-3xl mx-auto flex flex-col items-center select-none ${
        isEmbed ? 'p-1' : 'p-4'
      }`}
    >
      {/* HUD Bar */}
      <div className="w-full mb-4 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-slate-800">
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

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-5">
        <div
          className="bg-gradient-to-r from-violet-500 to-indigo-500 h-full transition-all duration-300 rounded-full"
          style={{ width: `${((currentIdx + 1) / items.length) * 100}%` }}
        />
      </div>

      {/* Sentence Container with Blank Hole */}
      <div
        className={`w-full min-h-[200px] p-8 rounded-3xl bg-white border-2 shadow-xl flex flex-col justify-center items-center text-center transition-all ${
          feedback === 'correct'
            ? 'border-emerald-500 bg-emerald-50/40'
            : feedback === 'wrong'
            ? 'border-rose-500 bg-rose-50/40 shake-anim'
            : 'border-violet-300 hover:border-violet-400'
        }`}
      >
        <span className="text-xs font-black uppercase tracking-wider text-violet-600 mb-4 flex items-center gap-1">
          <FileText size={14} /> Cümle {currentIdx + 1} / {items.length} • Boşluğa uygun kelimeyi seçin
        </span>

        <div className="text-xl sm:text-2xl font-black text-slate-900 leading-relaxed font-display flex flex-wrap items-center justify-center gap-2">
          <span>{parts[0]}</span>

          {/* Blank Slot */}
          <span
            className={`inline-flex items-center justify-center min-w-[130px] sm:min-w-[160px] h-12 px-4 rounded-2xl border-2 border-dashed font-black text-base sm:text-lg transition-all ${
              selectedWord
                ? feedback === 'correct'
                  ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg'
                  : feedback === 'wrong'
                  ? 'bg-rose-500 border-rose-600 text-white'
                  : 'bg-violet-600 border-violet-700 text-white'
                : 'bg-violet-50 border-violet-300 text-violet-400'
            }`}
          >
            {selectedWord || '______'}
          </span>

          <span>{parts[1] || ''}</span>
        </div>
      </div>

      {/* Word Bank Choices */}
      <div className="w-full mt-6">
        <span className="text-xs font-bold text-slate-500 block text-center mb-3">
          Aşağıdaki kelime kartlarından birine dokunun:
        </span>

        <div className="flex flex-wrap items-center justify-center gap-3">
          {options.map((word) => {
            const isChosen = selectedWord === word;

            return (
              <button
                key={word}
                onClick={() => handleSelectWord(word)}
                disabled={feedback !== null || isFinished}
                className={`py-3.5 px-6 rounded-2xl border-2 font-black text-base shadow-md transition-all active:scale-95 cursor-pointer ${
                  isChosen
                    ? 'bg-violet-600 border-violet-700 text-white scale-105'
                    : 'bg-white border-slate-200 text-slate-800 hover:border-violet-400 hover:bg-violet-50/50'
                }`}
              >
                {word}
              </button>
            );
          })}
        </div>
      </div>

      {/* Finished Modal */}
      {isFinished && (
        <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in text-slate-800 border border-slate-200">
          <div className="w-16 h-16 rounded-3xl bg-violet-50 border border-violet-200 text-violet-600 flex items-center justify-center mb-4 shadow-sm">
            <Sparkles size={36} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 font-display">
            Tebrikler, Tüm Cümleleri Tamamladınız!
          </h2>
          <p className="text-slate-600 text-sm mb-6 max-w-md">
            Doğru kelimeleri yerleştirip <strong className="text-violet-600 font-bold">{score} puan</strong> kazandınız!
          </p>

          <button
            onClick={resetGame}
            className="py-3 px-8 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-bold text-sm shadow-lg shadow-violet-500/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Tekrar Oyna</span>
          </button>
        </div>
      )}
    </div>
  );
};
