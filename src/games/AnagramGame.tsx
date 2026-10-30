import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RotateCcw, Check, ArrowRight, Trophy, Sparkles } from 'lucide-react';
import type { ActivityItem } from '../types/game';
import { useGameHudOptional } from '../components/game/GameHudContext';

interface AnagramGameProps {
  title?: string;
  items: ActivityItem[];
  onFinish?: (score: number) => void;
  isEmbed?: boolean;
}

export const AnagramGame: React.FC<AnagramGameProps> = ({
  title: _title = 'Anagram / Kelime Düzenleme',
  items,
  onFinish,
  isEmbed: _isEmbed = false,
}) => {
  const hud = useGameHudOptional();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userLetters, setUserLetters] = useState<string[]>([]);
  const [bankLetters, setBankLetters] = useState<{ id: number; char: string; used: boolean }[]>([]);
  const [isSolved, setIsSolved] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  const currentItem = items[currentIndex];
  const targetWord = (currentItem?.answer || '').toUpperCase().trim();

  // Sync with GameHud
  useEffect(() => {
    hud?.setScore(score);
    hud?.setTotalQuestions(items.length);
    hud?.setQuestionIndex(currentIndex);
    hud?.setQuestionText(currentItem?.question || 'Harfleri düzenle!');
  }, [hud, score, items.length, currentIndex, currentItem]);

  const initQuestion = () => {
    if (!currentItem) return;
    const chars = targetWord.split('').filter((c) => c !== ' ');
    // Shuffle letters
    const shuffled = chars
      .map((char, index) => ({ id: index, char, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map((item, idx) => ({ id: idx, char: item.char, used: false }));

    setBankLetters(shuffled);
    setUserLetters([]);
    setIsSolved(false);
  };

  useEffect(() => {
    initQuestion();
  }, [currentIndex, items]);

  const handleBankClick = (bankIndex: number) => {
    const item = bankLetters[bankIndex];
    if (item.used) return;

    const newBank = [...bankLetters];
    newBank[bankIndex].used = true;
    setBankLetters(newBank);

    const newUser = [...userLetters, item.char];
    setUserLetters(newUser);

    // Check if word completed
    if (newUser.join('') === targetWord.replace(/\s+/g, '')) {
      setIsSolved(true);
      setScore((s) => s + 50);
      confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
    }
  };

  const handleUserClick = (userIndex: number) => {
    if (isSolved) return;
    const removedChar = userLetters[userIndex];
    const newUser = userLetters.filter((_, idx) => idx !== userIndex);
    setUserLetters(newUser);

    // Free first matching used bank letter
    const newBank = [...bankLetters];
    const bankItem = newBank.find((b) => b.char === removedChar && b.used);
    if (bankItem) {
      bankItem.used = false;
      setBankLetters(newBank);
    }
  };

  const nextWord = () => {
    if (currentIndex + 1 < items.length) {
      setCurrentIndex((i) => i + 1);
    } else {
      setIsFinished(true);
      confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
      const stars = score >= items.length * 40 ? 3 : score >= items.length * 20 ? 2 : 1;
      hud?.finishGame(stars, items.length);
      if (onFinish) onFinish(score);
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 select-none overflow-y-auto">
      {/* Fallback Header when NOT inside GameShell */}
      {!hud?.isInsideShell && (
        <div className="flex items-center justify-between w-full max-w-2xl mb-3 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-sm">
          <span className="text-sm font-bold text-slate-500">
            Kelime <strong className="text-slate-900 text-base">{currentIndex + 1}</strong> / {items.length}
          </span>
          <span className="text-sm font-bold text-slate-500 flex items-center gap-1.5">
            <Trophy size={16} className="text-amber-500" />
            Puan: <strong className="text-slate-900 text-base">{score}</strong>
          </span>
        </div>
      )}

      {!isFinished && currentItem ? (
        <div className="w-full max-w-2xl flex-1 flex flex-col items-center justify-center py-2">
          {/* Hint / Question */}
          <div className="p-4 sm:p-6 mb-4 rounded-3xl bg-white/95 backdrop-blur-md border-2 border-purple-200 text-center w-full shadow-md">
            <span className="text-xs font-black uppercase tracking-wider text-purple-700 block mb-1">
              İpucu / Tanım
            </span>
            <p className="text-base sm:text-xl font-black text-slate-800">{currentItem.question}</p>
          </div>

          {/* User's Answer Slots */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-5 sm:mb-8 min-h-[56px] sm:min-h-[70px]">
            {targetWord
              .replace(/\s+/g, '')
              .split('')
              .map((_, idx) => {
                const char = userLetters[idx];
                return (
                  <button
                    key={idx}
                    onClick={() => char && handleUserClick(idx)}
                    disabled={!char || isSolved}
                    className={`w-10 h-12 sm:w-14 sm:h-16 rounded-xl font-black text-lg sm:text-2xl flex items-center justify-center border-2 transition-all ${
                      char
                        ? isSolved
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                          : 'bg-blue-600 border-blue-500 text-white shadow-md active:scale-95'
                        : 'bg-slate-100 border-dashed border-slate-300 text-slate-400'
                    }`}
                  >
                    {char || ''}
                  </button>
                );
              })}
          </div>

          {/* Scrambled Letter Bank */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mb-5 sm:mb-8">
            {bankLetters.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => handleBankClick(idx)}
                disabled={item.used || isSolved}
                className={`w-10 h-12 sm:w-14 sm:h-16 rounded-xl font-black text-lg sm:text-2xl flex items-center justify-center border transition-all ${
                  item.used
                    ? 'opacity-25 bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed scale-90'
                    : 'bg-gradient-to-br from-indigo-500 to-purple-600 border-purple-400/50 hover:border-purple-300 text-white shadow-md active:scale-95 hover:-translate-y-1'
                }`}
              >
                {item.char}
              </button>
            ))}
          </div>

          {/* Action Row */}
          {isSolved && (
            <button
              onClick={nextWord}
              className="px-8 py-3.5 rounded-xl font-bold text-base bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 flex items-center gap-2 animate-bounce"
            >
              <Check size={20} />
              Doğru! Sonraki Kelime
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      ) : (
        /* Finished */
        <div className="w-full p-8 rounded-3xl bg-white border-2 border-slate-200 text-center shadow-2xl animate-fade-in">
          <Sparkles className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className="text-3xl font-black text-slate-900 mb-2">Harika İş!</h2>
          <p className="text-slate-600 mb-6 font-medium">Tüm anagramları başarıyla tamamladınız.</p>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 inline-block">
            <span className="text-xs text-slate-500 font-bold block">Kazanılan Puan</span>
            <span className="text-3xl font-black text-amber-500">{score}</span>
          </div>
          <button
            onClick={() => {
              setCurrentIndex(0);
              setScore(0);
              setIsFinished(false);
            }}
            className="w-full max-w-xs mx-auto py-3.5 rounded-xl font-bold bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-md"
          >
            <RotateCcw size={18} />
            Tekrar Oyna
          </button>
        </div>
      )}
    </div>
  );
};
