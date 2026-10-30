import React, { useState } from 'react';
import { Pause, Trophy, Clock, Flame, Volume2, VolumeX, Volume1 } from 'lucide-react';
import { useGameHud } from './GameHudContext';
import { speakText, stopSpeaking, isSpeechSupported } from '../../services/speech';
import type { GameTheme } from '../../data/gameThemes';

interface GameHudProps {
  theme: GameTheme;
  onPause: () => void;
}

export const GameHud: React.FC<GameHudProps> = ({ theme, onPause }) => {
  const {
    score,
    streak,
    timeLeft,
    soundEnabled,
    setSoundEnabled,
    questionIndex,
    totalQuestions,
    questionText,
  } = useGameHud();

  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleToggleSound = () => {
    setSoundEnabled((prev: boolean) => !prev);
  };

  const handleSpeak = () => {
    if (!questionText) return;
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(questionText, () => setIsSpeaking(false));
    }
  };

  return (
    <div className="w-full px-2 sm:px-4 pt-2 sm:pt-3 pb-1 z-30 pointer-events-none select-none">
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-3 bg-white/85 hover:bg-white/95 border-2 border-white/95 backdrop-blur-md shadow-sm rounded-2xl sm:rounded-3xl p-1.5 sm:p-2.5 transition-all">
        {/* Left: Pause Button */}
        <button
          type="button"
          onClick={onPause}
          aria-label="Oyunu Duraklat"
          className="pointer-events-auto w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-100 shadow-sm flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
          style={{ borderColor: theme.accentSoft }}
        >
          <Pause size={18} className="fill-slate-600 text-slate-600" />
        </button>

        {/* Center: Live Stats (Score, Streak, Timer, Question) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 overflow-x-auto no-scrollbar pointer-events-auto">
          {/* Score Pill */}
          <div
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border shadow-2xs"
            style={{
              backgroundColor: theme.accentSoft,
              borderColor: `${theme.accent}40`,
            }}
          >
            <Trophy size={16} style={{ color: theme.accent }} />
            <span className="text-xs sm:text-sm font-black font-display text-slate-800">
              {score}
            </span>
          </div>

          {/* Streak Flame Pill (If active) */}
          {streak > 1 && (
            <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 text-xs font-black anim-pulse-glow">
              <Flame size={14} className="fill-amber-500 text-amber-500" />
              <span>{streak}x</span>
            </div>
          )}

          {/* Question Index Pill */}
          {totalQuestions > 0 && (
            <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm font-black">
              <span>{questionIndex + 1}</span>
              <span className="text-slate-400">/</span>
              <span className="text-slate-500">{totalQuestions}</span>
            </div>
          )}

          {/* Timer Pill */}
          {timeLeft !== undefined && (
            <div
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl sm:rounded-2xl border text-xs sm:text-sm font-black font-mono transition-colors ${
                timeLeft <= 10
                  ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                  : 'bg-sky-50 border-sky-200 text-sky-700'
              }`}
            >
              <Clock size={14} />
              <span>{timeLeft}s</span>
            </div>
          )}
        </div>

        {/* Right: Sound & TTS Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 pointer-events-auto">
          {/* TTS Speech Button (if supported and question exists) */}
          {isSpeechSupported() && questionText && (
            <button
              type="button"
              onClick={handleSpeak}
              aria-label="Soruyu Sesli Oku"
              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl border-2 flex items-center justify-center active:scale-95 transition-all cursor-pointer ${
                isSpeaking
                  ? 'bg-amber-100 border-amber-300 text-amber-700 animate-pulse'
                  : 'bg-white hover:bg-slate-50 border-slate-100 text-slate-600'
              }`}
              title="Soruyu Sesli Dinle"
            >
              <Volume1 size={17} />
            </button>
          )}

          {/* Sound Mute/Unmute */}
          <button
            type="button"
            onClick={handleToggleSound}
            aria-label={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border-2 border-slate-100 shadow-sm flex items-center justify-center active:scale-95 transition-transform cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 size={18} style={{ color: theme.accent }} />
            ) : (
              <VolumeX size={18} className="text-slate-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
