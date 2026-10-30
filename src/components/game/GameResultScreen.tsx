import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Star, RotateCcw, LogOut, Trophy, CheckCircle, Clock } from 'lucide-react';
import type { GameTheme } from '../../data/gameThemes';
import { nativeBridge } from '../../services/nativeBridge';

interface GameResultScreenProps {
  theme: GameTheme;
  score: number;
  stars: number;
  correct: number;
  total: number;
  durationSec?: number;
  activityId?: string;
  onRestart: () => void;
  onExit: () => void;
}

export const GameResultScreen: React.FC<GameResultScreenProps> = ({
  theme,
  score,
  stars,
  correct,
  total,
  durationSec = 60,
  activityId,
  onRestart,
  onExit,
}) => {
  useEffect(() => {
    // Confetti celebration
    try {
      confetti({
        particleCount: stars === 3 ? 120 : 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: [theme.accent, '#FFD700', '#4FD1A5', '#5B9CFF', '#FF7AA8'],
      });
    } catch {}

    // Send result to React Native bridge
    nativeBridge.sendGameFinished({
      activityId,
      templateType: theme.id,
      score,
      stars,
      correct,
      total,
      durationSec,
    });
  }, [activityId, theme.id, theme.accent, score, stars, correct, total, durationSec]);

  const praiseMessage =
    stars === 3
      ? 'Muhteşem Başarı!'
      : stars === 2
      ? 'Harika Bir Çaba!'
      : 'Güzel Deneme, Devam Et!';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-8 border-4 border-white shadow-2xl animate-scale-in text-center">
        {/* Animated Stars Ribbon */}
        <div className="flex items-center justify-center gap-2 mb-4">
          {[1, 2, 3].map((starNum) => {
            const isEarned = starNum <= stars;
            return (
              <div
                key={starNum}
                className={`transform transition-all duration-500 ${
                  starNum === 2 ? '-translate-y-2 scale-110' : ''
                }`}
                style={{
                  animation: isEarned ? `bounce 0.6s ease-out ${starNum * 0.15}s` : 'none',
                }}
              >
                <div
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border-2 shadow-lg ${
                    isEarned
                      ? 'bg-gradient-to-tr from-amber-400 to-amber-200 border-amber-300 text-white'
                      : 'bg-slate-100 border-slate-200 text-slate-300'
                  }`}
                >
                  <Star
                    size={32}
                    className={`stroke-[2.5] ${
                      isEarned ? 'fill-white text-white drop-shadow' : 'text-slate-300'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Congratulatory Text */}
        <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 mb-1">
          {praiseMessage}
        </h2>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-6">
          Etkinliği başarıyla tamamladın!
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          {/* Score */}
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200/80 flex flex-col items-center">
            <Trophy size={18} className="text-amber-500 mb-1" />
            <span className="text-[11px] font-bold text-amber-800">Skor</span>
            <span className="text-lg sm:text-xl font-black font-display text-slate-900">
              {score}
            </span>
          </div>

          {/* Correct Count */}
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex flex-col items-center">
            <CheckCircle size={18} className="text-emerald-500 mb-1" />
            <span className="text-[11px] font-bold text-emerald-800">Doğru</span>
            <span className="text-lg sm:text-xl font-black font-display text-slate-900">
              {correct} / {total}
            </span>
          </div>

          {/* Duration */}
          <div className="p-3 rounded-2xl bg-sky-50 border border-sky-200/80 flex flex-col items-center">
            <Clock size={18} className="text-sky-500 mb-1" />
            <span className="text-[11px] font-bold text-sky-800">Süre</span>
            <span className="text-lg sm:text-xl font-black font-display text-slate-900">
              {durationSec}s
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary: Tekrar Oyna */}
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-4 rounded-2xl font-black font-display text-lg text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            style={{
              backgroundColor: theme.accent,
              boxShadow: `0 10px 25px -5px ${theme.accent}60`,
            }}
          >
            <RotateCcw size={20} className="stroke-[2.5]" />
            <span>Tekrar Oyna</span>
          </button>

          {/* Secondary: Çıkış */}
          <button
            type="button"
            onClick={onExit}
            className="w-full py-3.5 rounded-2xl font-bold text-sm sm:text-base text-slate-700 bg-slate-100 hover:bg-slate-200 border-2 border-slate-200/80 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut size={18} className="text-slate-600" />
            <span>Oyunu Bitir</span>
          </button>
        </div>
      </div>
    </div>
  );
};
