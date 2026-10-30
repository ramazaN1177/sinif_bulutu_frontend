import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Heart,
  Lightbulb,
} from 'lucide-react';
import type { ActivityItem } from '../types/game';
import { useGameHudOptional } from '../components/game/GameHudContext';

interface HangmanGameProps {
  title?: string;
  items: ActivityItem[];
  onFinish?: (score: number) => void;
  isEmbed?: boolean;
}

const TURKISH_KEYBOARD = [
  ['E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P', 'Ğ', 'Ü'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ş', 'İ'],
  ['Z', 'C', 'V', 'B', 'N', 'M', 'Ö', 'Ç'],
];

export const HangmanGame: React.FC<HangmanGameProps> = ({
  title: _title = 'Gizli Kelime (Kelime Kurtarma)',
  items,
  onFinish,
  isEmbed: _isEmbed = false,
}) => {
  const hud = useGameHudOptional();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const maxWrong = 6;
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentItem = items[currentIdx] || items[0];
  const targetWord = (currentItem.answer || '').toLocaleUpperCase('tr-TR');
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sync with GameHud
  useEffect(() => {
    hud?.setScore(score);
    hud?.setTotalQuestions(items.length);
    hud?.setQuestionIndex(currentIdx);
    hud?.setQuestionText(currentItem?.question || 'Kelimeyi bul!');
  }, [hud, score, items.length, currentIdx, currentItem]);

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
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.12);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'wrong') {
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'win') {
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
          const o = ctx.createOscillator();
          const g = ctx.createGain();
          o.connect(g);
          g.connect(ctx.destination);
          o.frequency.value = freq;
          g.gain.setValueAtTime(0.2, now + i * 0.1);
          g.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.25);
          o.start(now + i * 0.1);
          o.stop(now + i * 0.1 + 0.25);
        });
      }
    } catch {
      // Fallback
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

  const handleGuess = (letter: string) => {
    const upper = letter.toLocaleUpperCase('tr-TR');
    if (guessedLetters.includes(upper) || isFinished || wrongGuesses >= maxWrong) return;

    const newGuessed = [...guessedLetters, upper];
    setGuessedLetters(newGuessed);

    if (targetWord.includes(upper)) {
      playSound('correct');
      // Check if word is complete
      const allFound = targetWord
        .split('')
        .every((char) => char === ' ' || newGuessed.includes(char));

      if (allFound) {
        playSound('win');
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        setScore((prev) => prev + 150 - wrongGuesses * 15);

        setTimeout(() => {
          if (currentIdx + 1 < items.length) {
            setCurrentIdx((prev) => prev + 1);
            setGuessedLetters([]);
            setWrongGuesses(0);
          } else {
            setIsFinished(true);
            const finalScore = score + 150;
            const stars = finalScore >= (items.length * 100) ? 3 : finalScore >= (items.length * 50) ? 2 : 1;
            hud?.finishGame(stars, items.length);
            if (onFinish) onFinish(finalScore);
          }
        }, 900);
      }
    } else {
      playSound('wrong');
      const nextWrong = wrongGuesses + 1;
      setWrongGuesses(nextWrong);
      if (nextWrong >= maxWrong) {
        // Revealed but lost word
        setTimeout(() => {
          if (currentIdx + 1 < items.length) {
            setCurrentIdx((prev) => prev + 1);
            setGuessedLetters([]);
            setWrongGuesses(0);
          } else {
            setIsFinished(true);
            const stars = score >= (items.length * 50) ? 2 : 1;
            hud?.finishGame(stars, Math.min(currentIdx + 1, items.length));
            if (onFinish) onFinish(score);
          }
        }, 1200);
      }
    }
  };

  // Keyboard event listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLocaleUpperCase('tr-TR');
      if (/^[A-ZÇĞİÖŞÜ]$/i.test(key)) {
        handleGuess(key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [guessedLetters, wrongGuesses, targetWord, isFinished]);

  const resetGame = () => {
    setCurrentIdx(0);
    setScore(0);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setIsFinished(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between select-none p-2 sm:p-4 overflow-y-auto">
      {/* Top HUD only when NOT inside GameShell */}
      {!hud?.isInsideShell && (
        <div className="w-full max-w-2xl mb-2 p-2.5 sm:p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm flex items-center justify-between text-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-extrabold text-slate-600">
                Skor: <strong className="text-slate-900 text-base">{score}</strong>
              </span>
            </div>
            <div className="flex items-center gap-1">
              {Array.from({ length: maxWrong }).map((_, i) => (
                <Heart
                  key={i}
                  size={14}
                  className={`transition-colors ${
                    i < maxWrong - wrongGuesses ? 'text-rose-500 fill-rose-500' : 'text-slate-300'
                  }`}
                />
              ))}
            </div>
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
      <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center py-1">
        {/* Question / Clue Card */}
        <div className="w-full mb-3 px-4 py-2 sm:py-3 rounded-2xl bg-white/95 backdrop-blur-md border-2 border-cyan-300 shadow-sm text-center">
          <div className="flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-cyan-700 mb-0.5">
            <Lightbulb size={13} />
            <span>Kelime {currentIdx + 1} / {items.length} • İpucu</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-slate-800 font-display">
            {currentItem.question}
          </h3>
        </div>

        {/* Rescue Island & Boat Scene */}
        <div className="w-full mb-3 p-3 sm:p-4 rounded-3xl bg-white/90 backdrop-blur-md border-2 border-cyan-200 shadow-md flex flex-col items-center">
          <svg width="280" height="85" viewBox="0 0 280 85" className="w-full max-w-[280px] overflow-visible">
            <defs>
              <linearGradient id="seaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>
            {/* Sea Waves */}
            <path
              d="M 0 60 Q 35 54, 70 60 T 140 60 T 210 60 T 280 60 L 280 85 L 0 85 Z"
              fill="url(#seaGrad)"
              opacity="0.85"
            />
            {/* Island on Right */}
            <path d="M 195 64 Q 235 44, 275 64 Z" fill="#fde047" stroke="#ca8a04" strokeWidth="2" />
            <path d="M 235 56 Q 233 36, 240 22" stroke="#854d0e" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="236" cy="20" r="9" fill="#22c55e" />
            <circle cx="244" cy="19" r="7" fill="#16a34a" />
            {/* Lighthouse */}
            <rect x="253" y="30" width="10" height="26" rx="2" fill="#ef4444" />
            <rect x="255" y="36" width="6" height="5" fill="#ffffff" />
            <rect x="255" y="45" width="6" height="5" fill="#ffffff" />
            <polygon points="258,22 251,30 265,30" fill="#fbbf24" />

            {/* Rescue Boat */}
            <g
              transform={`translate(${20 + (Math.min(wrongGuesses, maxWrong) / maxWrong) * 165}, 55)`}
              className="transition-transform duration-700 ease-out"
            >
              <path d="M -16 0 L 16 0 L 10 10 L -10 10 Z" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
              <polygon points="0,-16 12,-2 0,-2" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
              <line x1="0" y1="0" x2="0" y2="-18" stroke="#78350f" strokeWidth="2" />
              <polygon points="0,-18 -5,-15 0,-12" fill="#ec4899" />
              <circle cx="-3" cy="-3" r="4" fill="#fde047" stroke="#ca8a04" strokeWidth="1" />
            </g>
          </svg>

          <div className="flex items-center justify-between w-full px-2 mt-1">
            <span className="text-[11px] font-black text-cyan-800 flex items-center gap-1">
              <Heart size={13} className="text-rose-500 fill-rose-500" /> Kalan Kurtarma Canı:
            </span>
            <div className="flex items-center gap-1">
              {Array.from({ length: maxWrong }).map((_, i) => (
                <Heart
                  key={i}
                  size={15}
                  className={`transition-all duration-300 ${
                    i < maxWrong - wrongGuesses
                      ? 'text-rose-500 fill-rose-500 scale-100'
                      : 'text-slate-200 fill-slate-100 scale-75'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Word Blank Slots */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5 mb-3 max-w-full">
          {targetWord.split('').map((char, idx) => {
            if (char === ' ') {
              return <div key={idx} className="w-2 sm:w-4" />;
            }
            const isRevealed = guessedLetters.includes(char) || wrongGuesses >= maxWrong;
            return (
              <div
                key={idx}
                className={`w-8 sm:w-11 h-11 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-lg sm:text-2xl font-black transition-all ${
                  isRevealed
                    ? 'bg-cyan-500 text-white border-2 border-cyan-300 shadow-md shadow-cyan-500/20'
                    : 'bg-white/90 text-transparent border-2 border-dashed border-cyan-300 shadow-xs'
                }`}
              >
                {isRevealed ? char : ''}
              </div>
            );
          })}
        </div>

        {/* Turkish Virtual Keyboard */}
        <div className="flex flex-col items-center gap-1 sm:gap-1.5 w-full max-w-lg mt-1">
          {TURKISH_KEYBOARD.map((row, rowIdx) => (
            <div key={rowIdx} className="flex items-center justify-center gap-1 sm:gap-1.5 w-full">
              {row.map((letter) => {
                const isGuessed = guessedLetters.includes(letter);
                const isCorrect = isGuessed && targetWord.includes(letter);
                const isWrong = isGuessed && !targetWord.includes(letter);

                return (
                  <button
                    key={letter}
                    disabled={isGuessed || isFinished || wrongGuesses >= maxWrong}
                    onClick={() => handleGuess(letter)}
                    className={`w-[min(32px,8.5vw)] sm:w-10 h-10 sm:h-12 rounded-xl font-black text-xs sm:text-sm transition-all flex items-center justify-center active:scale-90 border-b-2 ${
                      isCorrect
                        ? 'bg-emerald-500 text-white border-emerald-600 opacity-90 cursor-default'
                        : isWrong
                        ? 'bg-rose-100 text-rose-300 border-rose-200 line-through cursor-not-allowed'
                        : 'bg-white hover:bg-cyan-50 text-slate-800 border-slate-200 hover:border-cyan-400 shadow-xs'
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Finished Game Overlay */}
      {isFinished && (
        <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in text-slate-800 border border-slate-200">
          <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mb-4 shadow-sm">
            <Sparkles size={36} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 font-display">
            Tebrikler, Oyun Tamamlandı!
          </h2>
          <p className="text-slate-600 text-sm mb-6 max-w-md">
            Gizli kelimeleri bularak <strong className="text-rose-600 font-bold">{score} puan</strong> kazandınız!
          </p>

          <button
            onClick={resetGame}
            className="py-3 px-8 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-500/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Tekrar Oyna</span>
          </button>
        </div>
      )}
    </div>
  );
};
