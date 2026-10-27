import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  Timer,
  RotateCcw,
  Volume2,
  VolumeX,
  Search,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import type { ActivityItem } from '../types/game';

interface WordSearchGameProps {
  title?: string;
  items: ActivityItem[];
  onFinish?: (score: number) => void;
  isEmbed?: boolean;
}

const GRID_SIZE = 9;
const TURKISH_LETTERS = 'ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ';

export const WordSearchGame: React.FC<WordSearchGameProps> = ({
  title: _title = 'Kelime Avı (Kare Bulmaca)',
  items,
  onFinish,
  isEmbed = false,
}) => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [selectedCells, setSelectedCells] = useState<{ r: number; c: number }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Targets from answers or questions (clean uppercase)
  const targetWords = items.map((it) =>
    it.answer.replace(/[^A-Za-zÇĞİÖŞÜçğıöşü]/g, '').toLocaleUpperCase('tr-TR')
  ).slice(0, 5);

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

  const playSound = (type: 'select' | 'found' | 'win') => {
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

      if (type === 'select') {
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.05);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.06);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'found') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(1040, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
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

  // Build grid placing words
  useEffect(() => {
    const newGrid: string[][] = Array.from({ length: GRID_SIZE }, () =>
      Array.from({ length: GRID_SIZE }, () => '')
    );

    // Place each target word
    targetWords.forEach((word, wordIdx) => {
      let placed = false;
      let attempts = 0;
      const isHorizontal = wordIdx % 2 === 0;

      while (!placed && attempts < 50) {
        attempts++;
        if (isHorizontal) {
          const r = Math.floor(Math.random() * GRID_SIZE);
          const maxC = GRID_SIZE - word.length;
          if (maxC >= 0) {
            const startC = Math.floor(Math.random() * (maxC + 1));
            let fits = true;
            for (let i = 0; i < word.length; i++) {
              if (newGrid[r][startC + i] !== '' && newGrid[r][startC + i] !== word[i]) {
                fits = false;
                break;
              }
            }
            if (fits) {
              for (let i = 0; i < word.length; i++) {
                newGrid[r][startC + i] = word[i];
              }
              placed = true;
            }
          }
        } else {
          const c = Math.floor(Math.random() * GRID_SIZE);
          const maxR = GRID_SIZE - word.length;
          if (maxR >= 0) {
            const startR = Math.floor(Math.random() * (maxR + 1));
            let fits = true;
            for (let i = 0; i < word.length; i++) {
              if (newGrid[startR + i][c] !== '' && newGrid[startR + i][c] !== word[i]) {
                fits = false;
                break;
              }
            }
            if (fits) {
              for (let i = 0; i < word.length; i++) {
                newGrid[startR + i][c] = word[i];
              }
              placed = true;
            }
          }
        }
      }
    });

    // Fill remaining with random letters
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (!newGrid[r][c]) {
          newGrid[r][c] = TURKISH_LETTERS[Math.floor(Math.random() * TURKISH_LETTERS.length)];
        }
      }
    }

    setGrid(newGrid);
    setFoundWords([]);
    setSelectedCells([]);
  }, [items]);

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
    if (onFinish) onFinish(score);
    if ((window as any)?.ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'GAME_COMPLETED', score, words: foundWords.length })
      );
    }
  };

  const handleCellClick = (r: number, c: number) => {
    playSound('select');
    const existingIndex = selectedCells.findIndex((cell) => cell.r === r && cell.c === c);
    let nextCells: { r: number; c: number }[];

    if (existingIndex >= 0) {
      nextCells = selectedCells.filter((_, idx) => idx !== existingIndex);
    } else {
      nextCells = [...selectedCells, { r, c }];
    }

    setSelectedCells(nextCells);

    // Form current word
    const currentWord = nextCells.map((cell) => grid[cell.r][cell.c]).join('');
    const matchedWord = targetWords.find(
      (w) => !foundWords.includes(w) && (w === currentWord || w === currentWord.split('').reverse().join(''))
    );

    if (matchedWord) {
      playSound('found');
      const bonus = 150;
      setScore((prev) => prev + bonus);
      setFoundWords((prev) => [...prev, matchedWord]);
      setSelectedCells([]);

      if (foundWords.length + 1 >= targetWords.length) {
        setTimeout(finishGame, 600);
      }
    }
  };

  const resetGame = () => {
    setSelectedCells([]);
    setFoundWords([]);
    setScore(0);
    setTimeLeft(90);
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

          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
            {foundWords.length} / {targetWords.length} Bulundu
          </span>
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

      {/* Word Checklist Bar */}
      <div className="w-full mb-4 p-4 rounded-2xl bg-white border-2 border-emerald-400 shadow-sm flex flex-wrap items-center justify-center gap-2">
        <span className="text-xs font-black uppercase tracking-wider text-emerald-700 mr-2 flex items-center gap-1">
          <Search size={14} /> Gizli Kelimeler:
        </span>
        {targetWords.map((word) => {
          const isFound = foundWords.includes(word);
          return (
            <span
              key={word}
              className={`px-3 py-1 rounded-xl font-black text-xs transition-all flex items-center gap-1 ${
                isFound
                  ? 'bg-emerald-500 text-white line-through opacity-70'
                  : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
              }`}
            >
              {word}
              {isFound && <CheckCircle2 size={12} className="stroke-[3]" />}
            </span>
          );
        })}
      </div>

      {/* Letter Grid Matrix */}
      <div className="p-2 sm:p-5 rounded-2xl sm:rounded-3xl bg-white border-2 sm:border-4 border-emerald-300 shadow-xl flex flex-col items-center max-w-full overflow-x-auto">
        <div className="grid grid-cols-9 gap-1 sm:gap-2">
          {grid.map((row, r) =>
            row.map((char, c) => {
              const isSelected = selectedCells.some((cell) => cell.r === r && cell.c === c);

              return (
                <button
                  key={`${r}_${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`w-7 h-7 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl font-black text-xs sm:text-base flex items-center justify-center cursor-pointer transition-all duration-150 select-none ${
                    isSelected
                      ? 'bg-gradient-to-tr from-amber-400 to-amber-300 text-slate-900 scale-105 shadow-md ring-2 ring-amber-400'
                      : 'bg-slate-50 text-slate-800 hover:bg-slate-100 border border-slate-200 active:scale-95'
                  }`}
                >
                  {char}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Finished Game Overlay */}
      {isFinished && (
        <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in text-slate-800 border border-slate-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
            <Sparkles size={36} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 font-display">
            Tebrikler, Kelime Avını Tamamladınız!
          </h2>
          <p className="text-slate-600 text-sm mb-6 max-w-md">
            Gizli kelimeleri bularak <strong className="text-emerald-600 font-bold">{score} puan</strong> kazandınız!
          </p>

          <button
            onClick={resetGame}
            className="py-3 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Tekrar Oyna</span>
          </button>
        </div>
      )}
    </div>
  );
};
