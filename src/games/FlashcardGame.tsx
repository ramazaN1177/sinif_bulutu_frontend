import React, { useState, useRef, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Trophy,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  RotateCw,
} from 'lucide-react';
import type { ActivityItem } from '../types/game';
import { useGameHudOptional } from '../components/game/GameHudContext';

interface FlashcardGameProps {
  title?: string;
  items: ActivityItem[];
  onFinish?: (score: number) => void;
  isEmbed?: boolean;
}

export const FlashcardGame: React.FC<FlashcardGameProps> = ({
  title: _title = 'Bilgi Kartı Destesi (Flashcard)',
  items,
  onFinish,
  isEmbed: _isEmbed = false,
}) => {
  const hud = useGameHudOptional();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);
  const [_reviewCount, setReviewCount] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const currentItem = items[currentIdx] || items[0];
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Sync with GameHud
  useEffect(() => {
    hud?.setScore(knownCount * 20);
    hud?.setTotalQuestions(items.length);
    hud?.setQuestionIndex(currentIdx);
    hud?.setQuestionText(currentItem?.question || 'Kartı çevir ve öğren!');
  }, [hud, knownCount, items.length, currentIdx, currentItem]);

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

  const playSound = (type: 'flip' | 'known' | 'review' | 'win') => {
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

      if (type === 'flip') {
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.1);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'known') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
      } else if (type === 'review') {
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.linearRampToValueAtTime(160, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
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

  const handleFlip = () => {
    playSound('flip');
    setIsFlipped(!isFlipped);
  };

  const handleNext = (learned: boolean) => {
    if (learned) {
      playSound('known');
      setKnownCount((prev) => prev + 1);
    } else {
      playSound('review');
      setReviewCount((prev) => prev + 1);
    }

    setIsFlipped(false);
    if (currentIdx + 1 < items.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      finishGame(knownCount + (learned ? 1 : 0));
    }
  };

  const finishGame = (finalKnown: number) => {
    setIsFinished(true);
    playSound('win');
    confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    const finalScore = finalKnown * 100;
    const stars = finalKnown >= items.length * 0.8 ? 3 : finalKnown >= items.length * 0.5 ? 2 : 1;
    hud?.finishGame(stars, finalKnown);
    if (onFinish) onFinish(finalScore);
    if ((window as any)?.ReactNativeWebView) {
      (window as any).ReactNativeWebView.postMessage(
        JSON.stringify({ type: 'GAME_COMPLETED', score: finalScore, known: finalKnown })
      );
    }
  };

  const resetGame = () => {
    setCurrentIdx(0);
    setIsFlipped(false);
    setKnownCount(0);
    setReviewCount(0);
    setIsFinished(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between select-none p-2 sm:p-4 overflow-y-auto">
      {/* Fallback HUD Bar when NOT inside GameShell */}
      {!hud?.isInsideShell && (
        <div className="w-full max-w-lg mb-2 p-2.5 sm:p-3 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200 shadow-sm flex items-center justify-between text-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span className="text-xs font-extrabold text-slate-600">
                Kart: <strong className="text-slate-900 text-base">{currentIdx + 1} / {items.length}</strong>
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
              {knownCount} Biliyorum
            </span>
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
      <div className="w-full max-w-lg flex-1 flex flex-col items-center justify-center py-2">
        {/* 3D Flip Card Container */}
        <div
          onClick={handleFlip}
          className="w-full flex-1 min-h-[220px] max-h-[420px] cursor-pointer group perspective-1000 mb-4 select-none"
          style={{ perspective: 1000, WebkitPerspective: 1000 }}
        >
        <div
          className="relative w-full h-full duration-500 shadow-2xl rounded-3xl transform-style-preserve-3d"
          style={{
            transformStyle: 'preserve-3d',
            WebkitTransformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            transition: 'transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* FRONT OF CARD (Question / Term) */}
          <div
            className="absolute inset-0 backface-hidden rounded-3xl p-4 sm:p-8 bg-gradient-to-br from-white via-slate-50 to-slate-100 border-2 border-slate-200 flex flex-col justify-between items-center text-center shadow-lg group-hover:border-blue-400 transition-colors"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(0deg)',
            }}
          >
            <div className="w-full flex items-center justify-between text-xs font-extrabold text-slate-400 uppercase tracking-widest">
              <span>Ön Yüz • Soru</span>
              <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                <RotateCw size={12} /> Çevirmek için dokun
              </span>
            </div>

            <div className="my-auto px-4 flex flex-col items-center justify-center gap-3 max-h-[70%]">
              {currentItem.image && (
                <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-white border border-slate-200/80 p-2 shadow-sm shrink-0">
                  <img
                    src={currentItem.image}
                    alt={currentItem.question || 'Kart Görseli'}
                    className="w-full h-full object-contain pointer-events-none"
                  />
                </div>
              )}
              {currentItem.question && (
                <h3 className="text-xl sm:text-3xl font-black text-slate-900 font-display leading-relaxed line-clamp-3">
                  {currentItem.question}
                </h3>
              )}
            </div>

            <span className="text-xs font-bold text-slate-400">
              Cevabı görmek için karta tıklayın
            </span>
          </div>

          {/* BACK OF CARD (Answer / Definition) */}
          <div
            className="absolute inset-0 backface-hidden rounded-3xl p-4 sm:p-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white flex flex-col justify-between items-center text-center shadow-xl border-2 border-purple-300"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="w-full flex items-center justify-between text-xs font-extrabold text-purple-100 uppercase tracking-widest">
              <span>Arka Yüz • Yanıt</span>
              <span className="bg-white/20 px-2.5 py-1 rounded-full font-black">Doğru Cevap</span>
            </div>

            <div className="my-auto px-4 flex flex-col items-center justify-center gap-3 max-h-[70%]">
              {currentItem.answerImage && (
                <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-white/20 border border-white/30 p-2 shadow-sm shrink-0">
                  <img
                    src={currentItem.answerImage}
                    alt={currentItem.answer || 'Cevap Görseli'}
                    className="w-full h-full object-contain pointer-events-none"
                  />
                </div>
              )}
              {currentItem.answer && (
                <h3 className="text-xl sm:text-3xl font-black text-white font-display leading-relaxed line-clamp-3">
                  {currentItem.answer}
                </h3>
              )}
            </div>

            <span className="text-xs font-bold text-purple-100">
              Aşağıdaki butonlarla değerlendirin
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Tekrar Et vs Biliyorum */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full">
        <button
          onClick={() => handleNext(false)}
          className="py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl bg-amber-50 hover:bg-amber-100 active:scale-95 text-amber-800 border-2 border-amber-300 font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <RotateCw size={18} />
          <span>Tekrar Et</span>
        </button>

        <button
          onClick={() => handleNext(true)}
          className="py-3.5 sm:py-4 px-4 sm:px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white border-2 border-emerald-400 font-black text-sm sm:text-base flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-500/25"
        >
          <CheckCircle2 size={18} />
          <span>Biliyorum!</span>
        </button>
      </div>
      </div>

      {/* Finished Modal */}
      {isFinished && !hud?.isInsideShell && (
        <div className="absolute inset-0 z-40 bg-white/95 backdrop-blur-md rounded-3xl flex flex-col items-center justify-center p-6 text-center animate-fade-in text-slate-800 border border-slate-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-4 shadow-sm">
            <Sparkles size={36} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 font-display">
            Tebrikler, Desteyi Tamamladınız!
          </h2>
          <p className="text-slate-600 text-sm mb-6 max-w-md">
            Toplam <strong className="text-emerald-600 font-bold">{knownCount} kartı</strong> tam olarak öğrendiniz!
          </p>

          <button
            onClick={resetGame}
            className="py-3 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg flex items-center gap-2 active:scale-95 transition-all cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Desteyi Yeniden Çalış</span>
          </button>
        </div>
      )}
    </div>
  );
};
