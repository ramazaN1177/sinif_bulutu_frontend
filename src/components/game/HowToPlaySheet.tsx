import React from 'react';
import { HelpCircle, Check, Lightbulb } from 'lucide-react';
import type { GameTheme } from '../../data/gameThemes';
import { GameThemeIcon } from './GameThemeIcon';

interface HowToPlaySheetProps {
  isOpen: boolean;
  onClose: () => void;
  theme: GameTheme;
}

export const HowToPlaySheet: React.FC<HowToPlaySheetProps> = ({
  isOpen,
  onClose,
  theme,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in select-none">
      <div
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl p-6 sm:p-8 border-t sm:border-2 border-white shadow-2xl animate-scale-in max-h-[85vh] overflow-y-auto"
        style={{
          boxShadow: '0 20px 50px -10px rgba(0,0,0,0.2)',
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md"
            style={{ backgroundColor: theme.accent }}
          >
            <GameThemeIcon templateType={theme.id} size={24} className="text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-slate-500">
              <HelpCircle size={14} style={{ color: theme.accent }} />
              <span>Nasıl Oynanır?</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900">
              {theme.title}
            </h3>
          </div>
        </div>

        {/* Steps List */}
        <div className="space-y-3 mb-6">
          {theme.howToPlay.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3.5 p-3.5 rounded-2xl border transition-all"
              style={{
                backgroundColor: theme.accentSoft,
                borderColor: `${theme.accent}30`,
              }}
            >
              <span
                className="w-7 h-7 rounded-xl text-white font-black text-sm flex items-center justify-center shrink-0 mt-0.5 shadow-sm"
                style={{ backgroundColor: theme.accent }}
              >
                {idx + 1}
              </span>
              <p className="text-sm sm:text-base font-bold text-slate-800 leading-snug">
                {step}
              </p>
            </div>
          ))}
        </div>

        {/* Helpful Tip */}
        {theme.tip && (
          <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 border border-amber-200/80 flex items-start gap-3 text-amber-900">
            <Lightbulb size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm font-semibold">
              <strong className="font-black">İpucu: </strong>
              {theme.tip}
            </p>
          </div>
        )}

        {/* Big Action Button */}
        <button
          type="button"
          onClick={onClose}
          className="w-full py-4 rounded-2xl font-black font-display text-lg text-white shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          style={{
            backgroundColor: theme.accent,
            boxShadow: `0 10px 25px -5px ${theme.accent}60`,
          }}
        >
          <Check size={20} className="stroke-[3]" />
          <span>Harika, Anladım!</span>
        </button>
      </div>
    </div>
  );
};
