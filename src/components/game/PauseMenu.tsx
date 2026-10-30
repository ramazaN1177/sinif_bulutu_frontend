import React from 'react';
import { Play, RotateCcw, Home, LogOut } from 'lucide-react';
import type { GameTheme } from '../../data/gameThemes';
import { GameThemeIcon } from './GameThemeIcon';

interface PauseMenuProps {
  isOpen: boolean;
  theme: GameTheme;
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  onExit: () => void;
}

export const PauseMenu: React.FC<PauseMenuProps> = ({
  isOpen,
  theme,
  onResume,
  onRestart,
  onHome,
  onExit,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm bg-white/95 rounded-3xl p-6 sm:p-8 border-4 border-white shadow-2xl animate-scale-in text-center">
        {/* Mascot / Icon Badge */}
        <div
          className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center shadow-md"
          style={{ backgroundColor: theme.accentSoft }}
        >
          <GameThemeIcon templateType={theme.id} size={30} style={{ color: theme.accent }} />
        </div>

        <h3 className="text-2xl font-black font-display text-slate-900 mb-1">
          Oyun Duraklatıldı
        </h3>
        <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-6">
          Kısa bir mola mı verdin?
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          {/* Primary: Devam Et */}
          <button
            type="button"
            onClick={onResume}
            className="w-full py-4 rounded-2xl font-black font-display text-lg text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer"
            style={{
              backgroundColor: theme.accent,
              boxShadow: `0 10px 25px -5px ${theme.accent}60`,
            }}
          >
            <Play size={20} className="fill-white" />
            <span>Devam Et</span>
          </button>

          {/* Secondary: Yeniden Başla */}
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3.5 rounded-2xl font-bold text-sm sm:text-base text-slate-700 bg-slate-100 hover:bg-slate-200 border-2 border-slate-200/80 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={18} className="text-slate-600" />
            <span>Yeniden Başla</span>
          </button>

          {/* Secondary: Başlangıç Ekranı */}
          <button
            type="button"
            onClick={onHome}
            className="w-full py-3.5 rounded-2xl font-bold text-sm sm:text-base text-slate-700 bg-slate-100 hover:bg-slate-200 border-2 border-slate-200/80 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Home size={18} className="text-slate-600" />
            <span>Başlangıç Menüsü</span>
          </button>

          {/* Exit */}
          <button
            type="button"
            onClick={onExit}
            className="w-full py-3 rounded-2xl font-bold text-sm text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <LogOut size={16} />
            <span>Oyundan Çık</span>
          </button>
        </div>
      </div>
    </div>
  );
};
