import React, { useState } from 'react';
import { Play, ArrowLeft, Volume2, VolumeX, Settings, HelpCircle, BookOpen, Layers, Clock, Zap } from 'lucide-react';
import type { Activity } from '../../types/game';
import type { GameTheme } from '../../data/gameThemes';
import { useGameBackground } from '../../hooks/useGameBackground';
import { HowToPlaySheet } from './HowToPlaySheet';
import { SettingsSheet } from './SettingsSheet';
import { GameThemeIcon } from './GameThemeIcon';
import { triggerHaptic } from '../../services/gameSettings';

interface GameStartScreenProps {
  activity: Activity;
  theme: GameTheme;
  isLandscape: boolean;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onStart: () => void;
  onBack: () => void;
}

export const GameStartScreen: React.FC<GameStartScreenProps> = ({
  activity,
  theme,
  isLandscape,
  soundEnabled,
  onToggleSound,
  onStart,
  onBack,
}) => {
  const [howToPlayOpen, setHowToPlayOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { bgLoaded, bgUrl, fallbackGradient } = useGameBackground(theme, isLandscape);

  const handleStartGame = () => {
    triggerHaptic('success');
    onStart();
  };

  return (
    <div
      className={`fixed inset-0 z-40 w-screen h-[100dvh] flex flex-col justify-between select-none overflow-hidden ${
        bgLoaded ? '' : `bg-gradient-to-br ${fallbackGradient}`
      }`}
      style={{
        paddingTop: 'max(env(safe-area-inset-top), 12px)',
        paddingBottom: 'max(env(safe-area-inset-bottom), 16px)',
        paddingLeft: 'max(env(safe-area-inset-left), 16px)',
        paddingRight: 'max(env(safe-area-inset-right), 16px)',
      }}
    >
      {/* 1. Fullscreen Illustrated Background */}
      {bgLoaded && (
        <div
          className="absolute inset-0 bg-cover bg-center z-0 animate-fade-in"
          style={{ backgroundImage: `url(${bgUrl})` }}
        />
      )}

      {/* Light Scrim Overlay for Contrast & Readability (No dark overlays!) */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-white/15 to-white/45 backdrop-blur-[0.5px] z-0 pointer-events-none" />

      {/* Subtle Floating Sparkles (6 light floating stars) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {[
          { id: 1, top: '15%', left: '10%', size: 10, delay: '0s' },
          { id: 2, top: '25%', left: '85%', size: 14, delay: '1s' },
          { id: 3, top: '65%', left: '8%', size: 8, delay: '2s' },
          { id: 4, top: '75%', left: '90%', size: 12, delay: '0.5s' },
          { id: 5, top: '40%', left: '92%', size: 10, delay: '1.5s' },
          { id: 6, top: '50%', left: '6%', size: 16, delay: '2.5s' },
        ].map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white/80 shadow-sm animate-pulse"
            style={{
              top: star.top,
              left: star.left,
              width: star.size,
              height: star.size,
              animationDelay: star.delay,
              filter: 'drop-shadow(0 2px 4px rgba(255,255,255,0.8))',
            }}
          />
        ))}
      </div>

      {/* 2. Top Navigation Bar (Back, Type Pill, Sound, Settings) */}
      <header className="relative z-10 w-full flex items-center justify-between gap-2 max-w-4xl mx-auto">
        {/* Left: Back Button */}
        <button
          type="button"
          onClick={onBack}
          aria-label="Geri Dön"
          className="w-12 h-12 rounded-2xl bg-white/85 hover:bg-white text-slate-700 border-2 border-white shadow-md backdrop-blur-md flex items-center justify-center active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft size={20} className="stroke-[2.5]" />
        </button>

        {/* Center: Badge Pill */}
        <div
          className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-md border-2 border-white"
          style={{ backgroundColor: theme.accent }}
        >
          <Zap size={14} className="fill-white" />
          <span>{theme.badge}</span>
        </div>

        {/* Right: Sound & Settings Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
            className="w-12 h-12 rounded-2xl bg-white/85 hover:bg-white text-slate-700 border-2 border-white shadow-md backdrop-blur-md flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          >
            {soundEnabled ? (
              <Volume2 size={20} style={{ color: theme.accent }} />
            ) : (
              <VolumeX size={20} className="text-slate-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            aria-label="Ayarlar"
            className="w-12 h-12 rounded-2xl bg-white/85 hover:bg-white text-slate-700 border-2 border-white shadow-md backdrop-blur-md flex items-center justify-center active:scale-95 transition-all cursor-pointer"
          >
            <Settings size={20} className="stroke-[2.5] text-slate-600" />
          </button>
        </div>
      </header>

      {/* 3. Center Hero: Title & Action (Responsive for Portrait & Landscape) */}
      <main
        className={`relative z-10 w-full max-w-lg mx-auto flex flex-col items-center text-center my-auto px-4 ${
          isLandscape ? 'py-2' : 'py-4'
        }`}
      >
        {/* Floating Mascot Avatar */}
        <div className="relative mb-3 group">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl border-4 border-white shadow-2xl flex items-center justify-center transform group-hover:scale-105 transition-transform"
            style={{
              backgroundColor: theme.accentSoft,
              boxShadow: `0 15px 35px -5px ${theme.accent}50`,
            }}
          >
            <GameThemeIcon templateType={theme.id} size={42} style={{ color: theme.accent }} />
          </div>
        </div>

        {/* Game Title: High-contrast child typography */}
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight mb-2 text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)] max-w-md"
          style={{
            WebkitTextStroke: `2px ${theme.titleOutline}`,
            paintOrder: 'stroke fill',
            textShadow: `0 4px 12px ${theme.titleOutline}80`,
          }}
        >
          {activity.title}
        </h1>

        {/* Subtitle / Description */}
        <p className="text-xs sm:text-sm font-bold text-slate-700 max-w-sm mb-5 leading-relaxed bg-white/70 px-4 py-1.5 rounded-full border border-white/80 shadow-2xs">
          {activity.description || 'Hazırsan eğlenceli maceraya başla!'}
        </p>

        {/* MASSIVE PULSING "BAŞLA" BUTTON (Min 72px) */}
        <button
          type="button"
          onClick={handleStartGame}
          aria-label="Oyuna Başla"
          className="group relative w-full max-w-[340px] h-[72px] sm:h-[80px] rounded-full text-white font-black font-display text-2xl sm:text-3xl tracking-wide flex items-center justify-center gap-3.5 border-4 border-white shadow-2xl active:scale-95 transition-all cursor-pointer overflow-hidden anim-pulse-glow"
          style={{
            background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.titleOutline} 100%)`,
            boxShadow: `0 16px 36px -6px ${theme.accent}80, 0 0 0 4px rgba(255,255,255,0.9)`,
          }}
        >
          {/* Top Gloss Shimmer */}
          <div className="absolute top-0 inset-x-4 h-1/2 bg-gradient-to-b from-white/40 to-transparent rounded-t-full pointer-events-none" />

          {/* Shimmer sweep */}
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 pointer-events-none" />

          <div className="w-12 h-12 rounded-full bg-white/25 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <Play size={26} className="fill-white text-white ml-0.5" />
          </div>
          <span className="drop-shadow-md">BAŞLA</span>
        </button>

        {/* 2 Secondary Pill Buttons (Nasıl Oynanır? & Ayarlar) */}
        <div className="flex items-center justify-center gap-2.5 mt-4 w-full max-w-xs">
          <button
            type="button"
            onClick={() => setHowToPlayOpen(true)}
            className="flex-1 py-2.5 px-3 rounded-2xl bg-white/90 hover:bg-white text-slate-700 border-2 border-white shadow-sm font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <HelpCircle size={16} style={{ color: theme.accent }} />
            <span>Nasıl Oynanır?</span>
          </button>

          <button
            type="button"
            onClick={() => setSettingsOpen(true)}
            className="py-2.5 px-3 rounded-2xl bg-white/90 hover:bg-white text-slate-700 border-2 border-white shadow-sm font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Settings size={16} className="text-slate-600" />
            <span>Ayarlar</span>
          </button>
        </div>
      </main>

      {/* 4. Bottom Info Chips */}
      <footer className="relative z-10 w-full flex items-center justify-center gap-2 max-w-md mx-auto">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-white/90 text-xs font-black text-slate-700 shadow-2xs">
          <Layers size={13} style={{ color: theme.accent }} />
          <span>{activity.items.length} Soru</span>
        </div>

        {activity.subject && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-white/90 text-xs font-black text-slate-700 shadow-2xs">
            <BookOpen size={13} style={{ color: theme.accent }} />
            <span>{activity.subject}</span>
          </div>
        )}

        {activity.timeLimitSeconds && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/80 border border-white/90 text-xs font-black text-slate-700 shadow-2xs">
            <Clock size={13} style={{ color: theme.accent }} />
            <span>{activity.timeLimitSeconds}s</span>
          </div>
        )}
      </footer>

      {/* Sheets */}
      <HowToPlaySheet
        isOpen={howToPlayOpen}
        onClose={() => setHowToPlayOpen(false)}
        theme={theme}
      />
      <SettingsSheet
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        accentColor={theme.accent}
      />
    </div>
  );
};
