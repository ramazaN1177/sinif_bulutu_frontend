import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  Clock,
  ArrowUp,
  ArrowDown,
  Sparkles,
  Check,
} from 'lucide-react';
import type { ActivityItem } from '../types/game';

interface TimelineGameProps {
  title?: string;
  items: ActivityItem[]; // Each item question is event/step name, answer is the correct order (1, 2, 3...) or date/year
  onFinish?: (score: number) => void;
  isEmbed?: boolean;
}

interface TimelineItem {
  id: string;
  question: string;
  correctIndex: number;
}

export const TimelineGame: React.FC<TimelineGameProps> = ({
  title: _title = 'Zaman Çizelgesi & Sıralama',
  items,
  onFinish,
  isEmbed = false,
}) => {
  const [orderedItems, setOrderedItems] = useState<TimelineItem[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const playSound = (type: 'move' | 'correct' | 'wrong' | 'win') => {
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

      if (type === 'move') {
        osc.frequency.setValueAtTime(360, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'correct') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(900, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
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

  useEffect(() => {
    const handleSilence = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
        audioCtxRef.current.suspend().catch(() => {});
      }
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
    // Initial jumble
    const parsed: TimelineItem[] = items.slice(0, 6).map((it, idx) => ({
      id: it.id,
      question: it.question || it.image || '',
      correctIndex: idx,
    }));

    // Shuffle
    const shuffled = [...parsed].sort(() => Math.random() - 0.5);
    setOrderedItems(shuffled);
    setChecked(false);
  }, [items]);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    playSound('move');
    setChecked(false);
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= orderedItems.length) return;

    const next = [...orderedItems];
    const temp = next[index];
    next[index] = next[targetIdx];
    next[targetIdx] = temp;
    setOrderedItems(next);
  };

  const checkOrder = () => {
    let allCorrect = true;
    let correctCount = 0;

    orderedItems.forEach((item, idx) => {
      if (item.correctIndex === idx) {
        correctCount++;
      } else {
        allCorrect = false;
      }
    });

    if (allCorrect) {
      playSound('correct');
      const finalScore = correctCount * 100;
      setScore(finalScore);
      setChecked(true);
      setTimeout(() => {
        setIsFinished(true);
        playSound('win');
        confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
        if (onFinish) onFinish(finalScore);
      }, 700);
    } else {
      playSound('wrong');
      setChecked(true);
      setScore(correctCount * 50);
    }
  };

  const resetGame = () => {
    const parsed: TimelineItem[] = items.slice(0, 6).map((it, idx) => ({
      id: it.id,
      question: it.question || it.image || '',
      correctIndex: idx,
    }));
    setOrderedItems([...parsed].sort(() => Math.random() - 0.5));
    setChecked(false);
    setScore(0);
    setIsFinished(false);
  };

  return (
    <div
      className={`relative w-full max-w-2xl mx-auto flex flex-col items-center select-none ${
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

          <span className="text-xs font-bold text-amber-700 flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-lg">
            <Clock size={14} className="text-amber-600" /> Doğru Sıralamaya Diz
          </span>
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

      {/* Timeline Instructions */}
      <div className="w-full mb-4 p-4 rounded-2xl bg-white border-2 border-orange-500 shadow-md text-center">
        <span className="text-[11px] font-black uppercase tracking-wider text-orange-600 block mb-0.5">
          Kronolojik Adımlar / Olaylar
        </span>
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-display">
          Olayları baştan sona doğru okları kullanarak sıraya dizin
        </h3>
      </div>

      {/* Timeline Steps Stack */}
      <div className="w-full flex flex-col gap-2.5 mb-6">
        {orderedItems.map((item, index) => {
          const isCorrect = checked && item.correctIndex === index;
          const isWrong = checked && item.correctIndex !== index;

          return (
            <div
              key={item.id}
              className={`p-3.5 sm:p-4 rounded-2xl border-2 flex items-center justify-between gap-3 shadow-md transition-all duration-200 ${
                isCorrect
                  ? 'bg-emerald-50 border-emerald-500 text-emerald-950'
                  : isWrong
                  ? 'bg-rose-50 border-rose-400 text-rose-950 shake-anim'
                  : 'bg-white border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    isCorrect
                      ? 'bg-emerald-600 text-white'
                      : isWrong
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-800 text-white'
                  }`}
                >
                  {index + 1}
                </div>
                <span className="font-extrabold text-sm sm:text-base text-slate-900">
                  {item.question}
                </span>
              </div>

              {/* Move Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => moveItem(index, 'up')}
                  disabled={index === 0}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700 transition-all cursor-pointer"
                  title="Yukarı Taşı"
                >
                  <ArrowUp size={16} />
                </button>
                <button
                  onClick={() => moveItem(index, 'down')}
                  disabled={index === orderedItems.length - 1}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-30 disabled:pointer-events-none text-slate-700 transition-all cursor-pointer"
                  title="Aşağı Taşı"
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Check Order Button */}
      <button
        onClick={checkOrder}
        className="w-full py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 active:scale-95 text-white font-black text-base shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer border-2 border-orange-400/40"
      >
        <Check size={20} className="stroke-[3]" />
        <span>Sıralamayı Kontrol Et</span>
      </button>

      {/* Finished Modal */}
      {isFinished && (
        <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in text-slate-800 border border-slate-200">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 border border-amber-200 text-amber-500 flex items-center justify-center mb-4 shadow-sm">
            <Sparkles size={36} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 font-display">
            Tebrikler, Kusursuz Sıralama!
          </h2>
          <p className="text-slate-600 text-sm mb-6 max-w-md">
            Olayları kronolojik sıraya hatasız dizip <strong className="text-amber-600 font-bold">{score} puan</strong> kazandınız!
          </p>

          <button
            onClick={resetGame}
            className="py-3 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Tekrar Sırala</span>
          </button>
        </div>
      )}
    </div>
  );
};
