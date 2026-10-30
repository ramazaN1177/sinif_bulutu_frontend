import React from 'react';
import { Sparkles } from 'lucide-react';
import type { GameTheme } from '../../data/gameThemes';

interface GameLoadingScreenProps {
  theme: GameTheme;
}

export const GameLoadingScreen: React.FC<GameLoadingScreenProps> = ({ theme }) => {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 select-none bg-white/90 backdrop-blur-md animate-fade-in"
      style={{
        background: `radial-gradient(circle at center, ${theme.accentSoft} 0%, #FFFFFF 100%)`,
      }}
    >
      <div className="relative mb-6">
        <div
          className="w-24 h-24 rounded-3xl flex items-center justify-center text-4xl shadow-xl animate-bounce"
          style={{ backgroundColor: theme.accentSoft }}
        >
          {theme.mascotEmoji}
        </div>
        <div
          className="absolute -top-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-md animate-spin"
          style={{ backgroundColor: theme.accent }}
        >
          <Sparkles size={16} />
        </div>
      </div>

      <h3 className="text-xl sm:text-2xl font-black font-display text-slate-800 mb-2">
        {theme.title} Yükleniyor...
      </h3>
      <p className="text-xs sm:text-sm font-bold text-slate-500 max-w-xs text-center">
        Eğlenceli sorular hazırlanıyor, hemen başlıyoruz!
      </p>
    </div>
  );
};
