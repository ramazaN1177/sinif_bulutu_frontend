import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, CheckCircle2, XCircle, RotateCcw, Volume2, VolumeX, Flame } from 'lucide-react';
import type { ActivityItem } from '../types/game';

interface QuizGameProps {
  title?: string;
  items: ActivityItem[];
  onFinish?: (score: number) => void;
  isEmbed?: boolean;
}

const OPTION_COLORS = [
  'bg-blue-600 hover:bg-blue-500 border-blue-400',
  'bg-emerald-600 hover:bg-emerald-500 border-emerald-400',
  'bg-amber-600 hover:bg-amber-500 border-amber-400',
  'bg-purple-600 hover:bg-purple-500 border-purple-400',
];

export const QuizGame: React.FC<QuizGameProps> = ({
  title: _title = 'Süreli Hızlı Quiz',
  items,
  onFinish,
  isEmbed = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(25);
  const [isGameOver, setIsGameOver] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentItem = items[currentIndex];

  // Derive 4 options: real answer + 3 distractors from other items or default
  const getOptions = () => {
    if (currentItem?.options && currentItem.options.length >= 2) {
      return currentItem.options;
    }
    const otherAnswers = items
      .filter((i) => i.id !== currentItem?.id)
      .map((i) => i.answer);
    const shuffledOthers = [...otherAnswers].sort(() => 0.5 - Math.random()).slice(0, 3);
    const combined = [currentItem?.answer, ...shuffledOthers].sort(() => 0.5 - Math.random());
    return combined;
  };

  const [options, setOptions] = useState<string[]>([]);

  useEffect(() => {
    if (currentItem) {
      setOptions(getOptions());
      setTimeLeft(25);
      setSelectedOption(null);
      setIsAnswered(false);
    }
  }, [currentIndex, items]);

  // Countdown timer
  useEffect(() => {
    if (isGameOver || isAnswered) return;
    if (timeLeft <= 0) {
      handleAnswer(''); // time out
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, isAnswered, isGameOver]);

  const playSound = (isCorrect: boolean) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (isCorrect) {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        gain.gain.setValueAtTime(0.2, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      }
    } catch {}
  };

  const handleAnswer = (option: string) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(option);

    const isCorrect = option === currentItem?.answer;
    playSound(isCorrect);

    if (isCorrect) {
      const points = 100 + timeLeft * 10 + streak * 20;
      setScore((s) => s + points);
      setStreak((st) => st + 1);
      confetti({ particleCount: 35, spread: 40, origin: { y: 0.7 } });
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      if (currentIndex + 1 < items.length) {
        setCurrentIndex((i) => i + 1);
      } else {
        setIsGameOver(true);
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.5 } });
        if (onFinish) onFinish(score);
        if (window && (window as any).ReactNativeWebView) {
          (window as any).ReactNativeWebView.postMessage(
            JSON.stringify({ type: 'QUIZ_FINISHED', score, totalQuestions: items.length })
          );
        }
      }
    }, 1400);
  };

  const restart = () => {
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setIsGameOver(false);
  };

  return (
    <div className={`flex flex-col items-center w-full max-w-3xl mx-auto ${isEmbed ? 'p-2' : 'p-6'}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between w-full mb-4 p-4 rounded-2xl bg-white border border-slate-200 shadow-sm text-slate-800">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="text-sm font-semibold text-slate-600">
            Puan: <strong className="text-slate-900 text-base">{score}</strong>
          </span>
          {streak > 1 && (
            <span className="ml-2 px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-50 text-orange-600 border border-orange-200 flex items-center gap-1">
              <Flame size={14} /> {streak}x Seri!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-slate-500">
            Soru <span className="text-slate-900 font-extrabold">{currentIndex + 1}</span> / {items.length}
          </span>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 cursor-pointer"
        >
          {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
        </button>
      </div>

      {/* Timer Bar */}
      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-6">
        <div
          className={`h-full transition-all duration-1000 ease-linear ${
            timeLeft > 10 ? 'bg-blue-600' : timeLeft > 5 ? 'bg-amber-500' : 'bg-rose-500 animate-pulse'
          }`}
          style={{ width: `${(timeLeft / 25) * 100}%` }}
        />
      </div>

      {!isGameOver && currentItem ? (
        <div className="w-full">
          {/* Question Card */}
          <div className="p-8 mb-6 rounded-3xl bg-white border-2 border-blue-100 shadow-xl text-center">
            <span className="inline-block px-3 py-1 mb-3 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 rounded-full border border-blue-200">
              Soru {currentIndex + 1}
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 leading-relaxed">
              {currentItem.question}
            </h3>
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {options.map((opt, idx) => {
              const isSelected = selectedOption === opt;
              const isCorrectAnswer = opt === currentItem.answer;

              let btnStyle = OPTION_COLORS[idx % OPTION_COLORS.length];
              if (isAnswered) {
                if (isCorrectAnswer) {
                  btnStyle = 'bg-emerald-600 border-emerald-400 ring-4 ring-emerald-500/30 text-white';
                } else if (isSelected) {
                  btnStyle = 'bg-rose-600 border-rose-400 text-white animate-shake';
                } else {
                  btnStyle = 'bg-slate-100 border-slate-200 opacity-50 text-slate-400';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleAnswer(opt)}
                  disabled={isAnswered}
                  className={`p-5 rounded-2xl text-left font-bold text-base sm:text-lg border transition-all flex items-center justify-between shadow-md cursor-pointer ${btnStyle}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center text-sm font-black text-white">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{opt}</span>
                  </div>
                  {isAnswered && isCorrectAnswer && (
                    <CheckCircle2 className="w-6 h-6 text-white shrink-0 ml-2" />
                  )}
                  {isAnswered && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-6 h-6 text-white shrink-0 ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Game Over Result */
        <div className="w-full p-8 rounded-3xl bg-white border-2 border-slate-200 text-center shadow-2xl animate-fade-in text-slate-800">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-sm">
            <Trophy className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-2 font-display">Quiz Tamamlandı!</h2>
          <p className="text-slate-600 mb-6">Harika bir performans sergilediniz.</p>

          <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 mb-6 inline-block w-full max-w-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
              Kazanılan Toplam Puan
            </span>
            <span className="text-4xl font-black text-blue-600 font-display">{score}</span>
          </div>

          <button
            onClick={restart}
            className="w-full max-w-sm mx-auto py-3.5 rounded-xl font-bold text-base bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
          >
            <RotateCcw size={18} />
            Tekrar Başlat
          </button>
        </div>
      )}
    </div>
  );
};
