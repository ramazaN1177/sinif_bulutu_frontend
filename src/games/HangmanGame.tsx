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
  isEmbed = false,
}) => {
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
            if (onFinish) onFinish(score + 150);
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
    <div
      className={`relative w-full max-w-4xl mx-auto flex flex-col items-center select-none ${
        isEmbed ? 'p-1' : 'p-4'
      }`}
    >
      {/* Top HUD */}
      <div className="w-full mb-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-between text-slate-800">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-xs font-extrabold text-slate-600">
              Skor: <strong className="text-slate-900 text-base">{score}</strong>
            </span>
          </div>

          {/* Hearts / Remaining Attempts */}
          <div className="flex items-center gap-1">
            {Array.from({ length: maxWrong }).map((_, i) => (
              <Heart
                key={i}
                size={16}
                className={`transition-colors ${
                  i < maxWrong - wrongGuesses
                    ? 'text-rose-500 fill-rose-500'
                    : 'text-slate-300'
                }`}
              />
            ))}
          </div>
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

      {/* Question / Clue Card */}
      <div className="w-full mb-4 p-4 rounded-2xl bg-white border-2 border-rose-300 shadow-md text-center">
        <div className="flex items-center justify-center gap-1.5 text-[11px] font-black uppercase tracking-wider text-rose-600 mb-1">
          <Lightbulb size={14} />
          <span>Kelime {currentIdx + 1} / {items.length} • İpucu</span>
        </div>
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-display">
          {currentItem.question}
        </h3>
      </div>

      {/* Main Play Area with Scaffold & Secret Word */}
      <div className="w-full p-6 sm:p-8 rounded-3xl bg-white border-2 border-slate-200 shadow-xl flex flex-col items-center">
        {/* Rescue Scaffold Graphic */}
        <div className="mb-6 flex items-center justify-center">
          <svg width="180" height="140" viewBox="0 0 180 140" className="stroke-slate-700">
            {/* Base Stand */}
            <line x1="20" y1="130" x2="160" y2="130" strokeWidth="4" strokeLinecap="round" />
            {/* Pole */}
            <line x1="50" y1="130" x2="50" y2="20" strokeWidth="4" strokeLinecap="round" />
            {/* Beam */}
            <line x1="50" y1="20" x2="130" y2="20" strokeWidth="4" strokeLinecap="round" />
            {/* Strut */}
            <line x1="50" y1="50" x2="80" y2="20" strokeWidth="3" strokeLinecap="round" />
            {/* Rope */}
            <line x1="130" y1="20" x2="130" y2="40" strokeWidth="3" strokeLinecap="round" />

            {/* Character Stages based on wrongGuesses */}
            {wrongGuesses >= 1 && (
              <circle cx="130" cy="52" r="12" stroke="#FDA4AF" strokeWidth="3" fill="#881337" />
            )}
            {wrongGuesses >= 2 && (
              <line x1="130" y1="64" x2="130" y2="95" stroke="#FDA4AF" strokeWidth="3" />
            )}
            {wrongGuesses >= 3 && (
              <line x1="130" y1="74" x2="110" y2="86" stroke="#FDA4AF" strokeWidth="3" />
            )}
            {wrongGuesses >= 4 && (
              <line x1="130" y1="74" x2="150" y2="86" stroke="#FDA4AF" strokeWidth="3" />
            )}
            {wrongGuesses >= 5 && (
              <line x1="130" y1="95" x2="112" y2="115" stroke="#FDA4AF" strokeWidth="3" />
            )}
            {wrongGuesses >= 6 && (
              <line x1="130" y1="95" x2="148" y2="115" stroke="#FDA4AF" strokeWidth="3" />
            )}
          </svg>
        </div>

        {/* Word Blank Slots */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3 mb-6 sm:mb-8 max-w-full">
          {targetWord.split('').map((char, idx) => {
            if (char === ' ') {
              return <div key={idx} className="w-2 sm:w-4" />;
            }
            const isRevealed = guessedLetters.includes(char) || wrongGuesses >= maxWrong;
            return (
              <div
                key={idx}
                className={`w-7 sm:w-11 h-10 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center text-base sm:text-2xl font-black transition-all ${
                  isRevealed
                    ? 'bg-rose-600 text-white border-2 border-rose-300 shadow-lg shadow-rose-500/20'
                    : 'bg-slate-800 text-transparent border-2 border-slate-700'
                }`}
              >
                {isRevealed ? char : ''}
              </div>
            );
          })}
        </div>

        {/* Turkish Virtual Keyboard */}
        <div className="flex flex-col items-center gap-1.5 sm:gap-2 w-full max-w-xl">
          {TURKISH_KEYBOARD.map((row, rowIdx) => (
            <div key={rowIdx} className="flex items-center justify-center gap-1 sm:gap-2 w-full">
              {row.map((letter) => {
                const isGuessed = guessedLetters.includes(letter);
                const isCorrect = isGuessed && targetWord.includes(letter);
                const isWrong = isGuessed && !targetWord.includes(letter);

                return (
                  <button
                    key={letter}
                    disabled={isGuessed || isFinished || wrongGuesses >= maxWrong}
                    onClick={() => handleGuess(letter)}
                    className={`w-[min(30px,8vw)] sm:w-10 h-9 sm:h-12 rounded-lg sm:rounded-xl font-extrabold text-[11px] sm:text-sm transition-all duration-150 flex items-center justify-center active:scale-95 ${
                      isCorrect
                        ? 'bg-emerald-600 text-white opacity-80 cursor-default'
                        : isWrong
                        ? 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed line-through'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500 shadow-sm'
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
