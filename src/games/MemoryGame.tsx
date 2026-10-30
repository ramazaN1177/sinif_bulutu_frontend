import { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Timer, Trophy, RotateCcw, Volume2, VolumeX, Sparkles } from 'lucide-react';
import type { ActivityItem } from '../types/game';
import { useGameHudOptional } from '../components/game/GameHudContext';

interface MemoryCard {
  uid: string;
  itemId: string;
  content: string;
  image?: string;
  isQuestion: boolean;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameProps {
  title?: string;
  items: ActivityItem[];
  onFinish?: (score: number) => void;
  isEmbed?: boolean;
}

export const MemoryGame: React.FC<MemoryGameProps> = ({
  title: _title = 'Hafıza Kartları & Eşleştirme',
  items,
  onFinish,
  isEmbed: _isEmbed = false,
}) => {
  const hud = useGameHudOptional();
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isWon, setIsWon] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Matched count
  const matchedPairs = cards.filter((c) => c.isMatched).length / 2;
  const totalPairs = Math.min(items.length, 8);
  const calculatedScore = Math.max(10, 100 - moves * 2 - Math.floor(seconds / 2));

  // Sync with GameHud
  useEffect(() => {
    hud?.setScore(calculatedScore);
    hud?.setTimeLeft(seconds);
    hud?.setTotalTime(999);
    hud?.setTotalQuestions(totalPairs);
    hud?.setQuestionIndex(matchedPairs);
    hud?.setQuestionText('Eşleşen kartları bul!');
  }, [hud, calculatedScore, seconds, totalPairs, matchedPairs]);

  // Initialize deck with questions and answers as separate matchable cards
  const initGame = () => {
    const deck: MemoryCard[] = [];
    const sampleItems = items.slice(0, 8); // Max 8 pairs = 16 cards for best UX

    sampleItems.forEach((item) => {
      deck.push({
        uid: `${item.id}_q`,
        itemId: item.id,
        content: item.question || '',
        image: item.image,
        isQuestion: true,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        uid: `${item.id}_a`,
        itemId: item.id,
        content: item.answer,
        image: item.answerImage,
        isQuestion: false,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    setCards(deck);
    setFlippedIndices([]);
    setMoves(0);
    setSeconds(0);
    setIsPlaying(true);
    setIsWon(false);
  };

  useEffect(() => {
    initGame();
  }, [items]);

  // Timer
  useEffect(() => {
    let interval: any = null;
    if (isPlaying && !isWon) {
      interval = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, isWon]);

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

  const playSound = (type: 'flip' | 'match' | 'wrong' | 'win') => {
    if (!soundEnabled || document.hidden) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'flip') {
        osc.frequency.setValueAtTime(400, ctx.currentTime);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      } else if (type === 'match') {
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(783.99, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'wrong') {
        osc.frequency.setValueAtTime(220, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
        osc.start();
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'win') {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }
    } catch {}
  };

  const handleCardClick = (index: number) => {
    if (!isPlaying || isWon) return;
    if (flippedIndices.length === 2) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    playSound('flip');

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [firstIdx, secondIdx] = newFlipped;
      const firstCard = newCards[firstIdx];
      const secondCard = newCards[secondIdx];

      // Check if match
      if (firstCard.itemId === secondCard.itemId && firstCard.isQuestion !== secondCard.isQuestion) {
        playSound('match');
        setTimeout(() => {
          newCards[firstIdx].isMatched = true;
          newCards[secondIdx].isMatched = true;
          setCards(newCards);
          setFlippedIndices([]);

          // Check if all matched
          if (newCards.every((c) => c.isMatched)) {
            setIsWon(true);
            setIsPlaying(false);
            playSound('win');
            const score = Math.max(10, 100 - moves * 2 - Math.floor(seconds / 2));
            const stars = moves <= totalPairs * 2 ? 3 : moves <= totalPairs * 3 ? 2 : 1;
            hud?.finishGame(stars, totalPairs);
            if (onFinish) onFinish(score);
            if (window && (window as any).ReactNativeWebView) {
              (window as any).ReactNativeWebView.postMessage(
                JSON.stringify({ type: 'GAME_COMPLETED', score, timeSeconds: seconds, moves })
              );
            }
          }
        }, 400);
      } else {
        playSound('wrong');
        setTimeout(() => {
          newCards[firstIdx].isFlipped = false;
          newCards[secondIdx].isFlipped = false;
          setCards(newCards);
          setFlippedIndices([]);
        }, 900);
      }
    }
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 sm:p-4 select-none overflow-y-auto">
      {/* Fallback Top Stats Bar when NOT inside GameShell */}
      {!hud?.isInsideShell && (
        <div className="flex items-center justify-between w-full max-w-2xl mb-3 p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm text-slate-800">
          <div className="flex items-center gap-3">
            <Trophy className="w-5 h-5 text-amber-500" />
            <span className="text-sm font-semibold text-slate-600">
              Hamle: <strong className="text-slate-900 text-base">{moves}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Timer className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-semibold text-slate-600">
              Süre: <strong className="text-slate-900 text-base font-mono">{formatTime(seconds)}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
            </button>
            <button
              onClick={initGame}
              className="p-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 flex items-center gap-1 text-xs font-bold"
            >
              <RotateCcw size={14} />
              Yeniden
            </button>
          </div>
        </div>
      )}

      {/* Cards Grid Container */}
      <div className="flex-1 w-full max-w-2xl flex items-center justify-center py-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5 w-full">
        {cards.map((card, idx) => {
          const isRevealed = card.isFlipped || card.isMatched;
          return (
            <div
              key={card.uid}
              onClick={() => handleCardClick(idx)}
              className="relative aspect-[4/3] cursor-pointer select-none perspective-1000"
            >
              <div
                className={`w-full h-full duration-500 rounded-xl sm:rounded-2xl p-2 sm:p-3 flex items-center justify-center text-center transform-style-preserve-3d transition-transform ${
                  isRevealed ? 'rotate-y-180' : ''
                }`}
              >
                {/* Back of Card (Hidden Face) */}
                <div
                  className={`absolute inset-0 rounded-2xl flex flex-col items-center justify-center backface-hidden border-2 transition-all shadow-md ${
                    card.isMatched
                      ? 'bg-emerald-100 border-emerald-400 text-emerald-800'
                      : 'bg-gradient-to-br from-blue-500 to-indigo-600 border-white text-white hover:scale-[1.02]'
                  }`}
                >
                  <Sparkles className="w-6 h-6 text-white/80 mb-1" />
                  <span className="text-xs font-black text-white/90 uppercase tracking-wider">
                    Sınıf Bulutu
                  </span>
                </div>

                {/* Front of Card (Revealed Content) */}
                <div
                  className={`absolute inset-0 rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center text-center rotate-y-180 backface-hidden border shadow-lg ${
                    card.isMatched
                      ? 'bg-emerald-600 border-emerald-400 text-white'
                      : card.isQuestion
                      ? 'bg-blue-600 border-blue-400 text-white'
                      : 'bg-amber-500 border-amber-300 text-white'
                  }`}
                >
                  <span className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider opacity-85 mb-0.5">
                    {card.isQuestion ? 'Soru / Terim' : 'Cevap / Anlam'}
                  </span>
                  {card.image && (
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-white/95 p-1 mb-1 shadow-sm shrink-0">
                      <img
                        src={card.image}
                        alt={card.content || 'Görsel'}
                        className="w-full h-full object-contain pointer-events-none"
                      />
                    </div>
                  )}
                  {card.content && (
                    <p className="text-xs sm:text-sm font-black leading-snug line-clamp-2">
                      {card.content}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      </div>

      {/* Victory Celebration Modal */}
      {isWon && !hud?.isInsideShell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md p-8 rounded-3xl bg-white border border-slate-200 text-center shadow-2xl text-slate-800">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-500 shadow-sm">
              <Trophy className="w-10 h-10 animate-bounce" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2 font-display">Tebrikler! Kazandınız!</h2>
            <p className="text-sm text-slate-600 mb-6">Tüm kartları başarıyla eşleştirdiniz.</p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block mb-0.5">Toplam Hamle</span>
                <span className="text-xl font-black text-slate-900">{moves}</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs text-slate-500 block mb-0.5">Geçen Süre</span>
                <span className="text-xl font-black text-blue-600 font-mono">{formatTime(seconds)}</span>
              </div>
            </div>

            <button
              onClick={initGame}
              className="w-full py-3.5 rounded-xl font-bold text-base bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
            >
              <RotateCcw size={18} />
              Tekrar Oyna
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
