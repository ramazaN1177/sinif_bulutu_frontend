import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Maximize2,
  Minimize2,
  Share2,
  Check,
  Play,
  ArrowLeft,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Lightbulb,
  Gamepad2,
  Layers,
  BookOpen,
  Zap,
} from 'lucide-react';
import type { Activity, TemplateType } from '../types/game';
import { WheelGame } from '../games/WheelGame';
import { MemoryGame } from '../games/MemoryGame';
import { QuizGame } from '../games/QuizGame';
import { AnagramGame } from '../games/AnagramGame';
import { BoxGame } from '../games/BoxGame';
import { WhackGame } from '../games/WhackGame';
import { AirplaneGame } from '../games/AirplaneGame';
import { HangmanGame } from '../games/HangmanGame';
import { TrueFalseGame } from '../games/TrueFalseGame';
import { BalloonGame } from '../games/BalloonGame';
import { FlashcardGame } from '../games/FlashcardGame';
import { CategorizeGame } from '../games/CategorizeGame';
import { WordSearchGame } from '../games/WordSearchGame';
import { TimelineGame } from '../games/TimelineGame';
import { DragWordGame } from '../games/DragWordGame';

interface GameModalProps {
  activity: Activity | null;
  onClose: () => void;
  isEmbed?: boolean;
  initialStarted?: boolean;
  isMobileGameMode?: boolean;
}

interface TemplateGuide {
  title: string;
  badge: string;
  howToPlay: string[];
  tip: string;
  gradient: string;
  accentColor: string;
  iconEmoji: string;
}

const TEMPLATE_GUIDES: Record<TemplateType, TemplateGuide> = {
  wheel: {
    title: 'Çarkıfelek',
    badge: 'Şans & Seçim',
    howToPlay: [
      'Çarka dokunarak çevirin.',
      'İbrenin durduğu soruyu cevaplayın.',
      'Doğru cevaplarla yüksek puan kazanın.',
    ],
    tip: 'Çarkı kuvvetlice çevirerek sürprizi artırın!',
    gradient: 'from-rose-600 via-pink-600 to-fuchsia-700',
    accentColor: '#E11D48',
    iconEmoji: '🎡',
  },
  memory: {
    title: 'Hafıza Kartları',
    badge: 'Eşleştirme',
    howToPlay: [
      'Kapalı kartlara tıklayarak içlerini açın.',
      'Eşleşen iki kartı art arda bulun.',
      'En az hamlede tamamlamaya çalışın.',
    ],
    tip: 'Kartların yerini aklınızda tutun!',
    gradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    accentColor: '#059669',
    iconEmoji: '🃏',
  },
  quiz: {
    title: 'Hızlı Quiz',
    badge: 'Bilgi Yarışması',
    howToPlay: [
      '4 seçenek arasından doğru olanı seçin.',
      'Süre bitmeden hızlıca cevaplayın.',
      'Seri doğrularla puan çarpanı kazanın.',
    ],
    tip: 'Hız ve doğruluk bir arada rekor getirir!',
    gradient: 'from-blue-600 via-indigo-600 to-violet-700',
    accentColor: '#2563EB',
    iconEmoji: '⚡',
  },
  anagram: {
    title: 'Anagram',
    badge: 'Kelime & Mantık',
    howToPlay: [
      'Karışık harfleri doğru sıraya dizin.',
      'İpucunu okuyarak kelimeyi bulun.',
      'Harflere dokunarak yerlerini değiştirin.',
    ],
    tip: 'İpucunu dikkatli okuyun, çözüm orada gizli!',
    gradient: 'from-purple-600 via-violet-600 to-indigo-700',
    accentColor: '#7C3AED',
    iconEmoji: '🔤',
  },
  box: {
    title: 'Gizemli Kutu',
    badge: 'Sürpriz',
    howToPlay: [
      'Bir kutu seçerek kapağını açın.',
      'İçinden çıkan soruyu cevaplayın.',
      'Tüm kutuları açarak bitirin.',
    ],
    tip: 'Hangi kutuda ne sürpriz var? Keşfedin!',
    gradient: 'from-amber-600 via-orange-600 to-red-700',
    accentColor: '#D97706',
    iconEmoji: '📦',
  },
  whack: {
    title: 'Köstebek Vurmaca',
    badge: 'Refleks',
    howToPlay: [
      'Yuvalardan çıkan köstebekleri takip edin.',
      'Doğru cevaplı köstebeğe tıklayın.',
      'Yanlışlara dokunmayın!',
    ],
    tip: 'Hızlı reflekslerinizi kullanın!',
    gradient: 'from-orange-600 via-amber-600 to-yellow-700',
    accentColor: '#EA580C',
    iconEmoji: '🔨',
  },
  airplane: {
    title: 'Bulut Uçuşu',
    badge: 'Aksiyon',
    howToPlay: [
      'Uçağınızı yukarı-aşağı yönlendirin.',
      'Doğru cevaplı buluttan geçin.',
      'Yanlış bulutlara çarpmayın.',
    ],
    tip: 'Bulutları erkenden okuyarak hazırlanın!',
    gradient: 'from-sky-600 via-blue-600 to-indigo-700',
    accentColor: '#0284C7',
    iconEmoji: '✈️',
  },
  hangman: {
    title: 'Kelime Kurtarma',
    badge: 'Tahmin',
    howToPlay: [
      'Klavyeden harf seçerek tahmin edin.',
      'Doğru harfler yerleşir.',
      'Canınız bitmeden kelimeyi tamamlayın.',
    ],
    tip: 'Sesli harflerle başlayın!',
    gradient: 'from-rose-600 via-red-600 to-orange-700',
    accentColor: '#DC2626',
    iconEmoji: '🎯',
  },
  truefalse: {
    title: 'Doğru / Yanlış',
    badge: 'Hızlı Karar',
    howToPlay: [
      'Önermeyi hızlıca okuyun.',
      'Doğru veya Yanlış butonuna basın.',
      'Seri doğrularla puan çarpanı kazanın.',
    ],
    tip: 'Olumsuzluk eklerine dikkat edin!',
    gradient: 'from-teal-600 via-emerald-600 to-green-700',
    accentColor: '#0D9488',
    iconEmoji: '✅',
  },
  balloon: {
    title: 'Balon Patlatma',
    badge: 'Görsel Dikkat',
    howToPlay: [
      'Havada yüzen balonları takip edin.',
      'Doğru cevaplı balonu patlatın.',
      'Yanlış balonlara dokunmayın.',
    ],
    tip: 'Acele etmeden doğruyu seçin!',
    gradient: 'from-pink-600 via-rose-600 to-red-700',
    accentColor: '#DB2777',
    iconEmoji: '🎈',
  },
  cardsort: {
    title: 'Bilgi Kartları',
    badge: 'Kavram Tekrarı',
    howToPlay: [
      'Ön yüzdeki soruyu okuyun.',
      'Karta tıklayarak cevabı görün.',
      'Tüm desteyi tamamlayın.',
    ],
    tip: 'Sınav öncesi harika bir tekrar aracı!',
    gradient: 'from-indigo-600 via-violet-600 to-purple-700',
    accentColor: '#4F46E5',
    iconEmoji: '📚',
  },
  categorize: {
    title: 'Gruplandırma',
    badge: 'Sınıflandırma',
    howToPlay: [
      'Topu tutup doğru sepete bırakın.',
      'Veya sepete doğrudan tıklayın.',
      'Top yerçekimiyle düşer!',
    ],
    tip: 'Doğru kutuyu hedefleyin!',
    gradient: 'from-blue-700 via-indigo-700 to-violet-800',
    accentColor: '#1D4ED8',
    iconEmoji: '🏀',
  },
  wordsearch: {
    title: 'Kelime Avı',
    badge: 'Bulmaca',
    howToPlay: [
      'Harf tablosunda kelimeleri arayın.',
      'Yatay, dikey veya çapraz gizlenmiş!',
      'Tüm kelimeleri bularak bitirin.',
    ],
    tip: 'İlk harfleri tarayarak hızlanın!',
    gradient: 'from-emerald-700 via-teal-700 to-cyan-800',
    accentColor: '#047857',
    iconEmoji: '🔍',
  },
  timeline: {
    title: 'Zaman Çizelgesi',
    badge: 'Sıralama',
    howToPlay: [
      'Olayları kronolojik sıraya dizin.',
      'Okları kullanarak sıralayın.',
      'Doğruluğunu kontrol edin.',
    ],
    tip: 'Sebep-sonuç ilişkilerini düşünün!',
    gradient: 'from-amber-700 via-yellow-700 to-orange-800',
    accentColor: '#B45309',
    iconEmoji: '📅',
  },
  dragword: {
    title: 'Boşluk Doldurma',
    badge: 'Cümle Tamamlama',
    howToPlay: [
      'Boşluğa uygun kelimeyi seçin.',
      'Doğru kartı boşluğa yerleştirin.',
      'Cümlenin anlam bütünlüğünü sağlayın.',
    ],
    tip: 'Dilbilgisi kurallarına dikkat edin!',
    gradient: 'from-cyan-700 via-blue-700 to-indigo-800',
    accentColor: '#0E7490',
    iconEmoji: '✏️',
  },
};

/* ── Floating particles for the splash screen ── */
const SplashParticles = React.memo(({ color }: { color: string }) => {
  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        size: 2 + Math.random() * 4,
        delay: `${Math.random() * 4}s`,
        duration: `${3 + Math.random() * 4}s`,
        opacity: 0.15 + Math.random() * 0.35,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full animate-float-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            backgroundColor: color,
            opacity: p.opacity,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </div>
  );
});

export const GameModal: React.FC<GameModalProps> = ({
  activity,
  onClose,
  isEmbed = false,
  initialStarted = false,
  isMobileGameMode = false,
}) => {
  if (!activity) return null;

  const [hasStarted, setHasStarted] = useState(initialStarted);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [restartKey, setRestartKey] = useState(0);
  const [showHud, setShowHud] = useState(true);

  // Reset start state when a new activity is opened
  useEffect(() => {
    setHasStarted(initialStarted);
  }, [activity.id, initialStarted]);

  // Silence all sounds when GameModal is unmounted or closed
  useEffect(() => {
    return () => {
      try {
        window.dispatchEvent(new CustomEvent('app_pause_audio'));
      } catch {}
    };
  }, []);

  // Handle ESC key to return to main menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Auto-hide HUD after 4 seconds of game play, show on tap
  useEffect(() => {
    if (!hasStarted || (!isMobileGameMode && !isEmbed)) return;
    const timer = setTimeout(() => setShowHud(false), 4000);
    return () => clearTimeout(timer);
  }, [hasStarted, restartKey, showHud, isMobileGameMode, isEmbed]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const copyShareLink = () => {
    const shareUrl = `${window.location.origin}?play=${activity.id}&game=${activity.templateType}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const guide = TEMPLATE_GUIDES[activity.templateType] || TEMPLATE_GUIDES.quiz;

  const embedMode = isEmbed || isMobileGameMode;

  const renderGame = () => {
    switch (activity.templateType) {
      case 'wheel':
        return <WheelGame title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'memory':
        return <MemoryGame title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'quiz':
        return <QuizGame title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'anagram':
        return <AnagramGame title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'box':
        return <BoxGame title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'whack':
        return <WhackGame title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'airplane':
        return <AirplaneGame title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'hangman':
        return <HangmanGame title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'truefalse':
        return <TrueFalseGame title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'balloon':
        return <BalloonGame title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'cardsort':
        return <FlashcardGame title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'categorize':
        return (
          <CategorizeGame
            title={activity.title}
            items={activity.items}
            categories={activity.categories}
            boxColors={activity.boxColors}
            boxImages={activity.boxImages}
            isEmbed={embedMode}
          />
        );
      case 'wordsearch':
        return <WordSearchGame title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'timeline':
        return <TimelineGame title={activity.title} items={activity.items} isEmbed={embedMode} />;
      case 'dragword':
        return <DragWordGame title={activity.title} items={activity.items} isEmbed={embedMode} />;
      default:
        return <WheelGame title={activity.title} items={activity.items} isEmbed={embedMode} />;
    }
  };

  /* ================================================================= */
  /* 🚀 IMMERSIVE GAME SPLASH SCREEN — used for embed + mobile game     */
  /* ================================================================= */
  const renderSplashScreen = () => (
    <div className={`fixed inset-0 z-50 w-screen h-screen flex flex-col items-center justify-between select-none overflow-y-auto overflow-x-hidden bg-gradient-to-br ${guide.gradient} p-4 sm:p-6`}>
      {/* Animated ambient layers */}
      <div className="absolute inset-0 bg-black/35 z-0" />
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-white/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-0" />

      {/* Floating particles */}
      <SplashParticles color="rgba(255,255,255,0.7)" />

      {/* Top Bar on Splash Screen */}
      <div className="relative z-20 w-full max-w-md flex items-center justify-between pt-2 px-1">
        <button
          onClick={onClose}
          className="py-2 px-3.5 rounded-2xl bg-black/40 hover:bg-black/60 text-white/90 font-bold text-xs flex items-center gap-2 border border-white/20 backdrop-blur-md active:scale-95 transition-all cursor-pointer shadow-lg"
        >
          <ArrowLeft size={14} />
          <span>{isMobileGameMode ? 'Stüdyoya Dön' : 'Çıkış'}</span>
        </button>

        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider text-white bg-white/20 border border-white/25 backdrop-blur-md shadow-md">
          <Zap size={12} className="text-amber-300" />
          <span>{guide.badge}</span>
        </div>
      </div>

      {/* Center Content */}
      <div className="relative z-10 my-auto flex flex-col items-center text-center px-4 max-w-md w-full animate-scale-in py-4">
        {/* Glowing 3D Emblem */}
        <div className="relative mb-5 group">
          <div
            className="absolute inset-0 scale-125 rounded-3xl blur-2xl opacity-60 animate-pulse"
            style={{ backgroundColor: guide.accentColor }}
          />
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 border-white/40 shadow-2xl bg-black/30 backdrop-blur-sm">
            <img
              src={`/assets/templates/${activity.templateType}.jpg?v=2`}
              alt={activity.title}
              className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-white/20 pointer-events-none" />
          </div>
          {/* Floating Emoji Badge */}
          <div className="absolute -bottom-2 -right-2 w-11 h-11 rounded-2xl bg-white/25 backdrop-blur-md border border-white/40 flex items-center justify-center text-2xl shadow-2xl anim-float">
            {guide.iconEmoji}
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 drop-shadow-md">
          {activity.title}
        </h1>

        {/* Description */}
        <p className="text-white/80 text-xs sm:text-sm mb-4 max-w-xs leading-relaxed font-medium">
          {activity.description || 'Hazırsanız oyuna başlayın ve puanları toplayın!'}
        </p>

        {/* Meta Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-5">
          <div className="px-3 py-1 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm text-[11px] font-extrabold text-white flex items-center gap-1.5 shadow-sm">
            <Layers size={13} className="text-white/70" />
            <span>{activity.items.length} Soru</span>
          </div>
          <div className="px-3 py-1 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm text-[11px] font-extrabold text-white flex items-center gap-1.5 shadow-sm">
            <Gamepad2 size={13} className="text-white/70" />
            <span>{guide.title}</span>
          </div>
          {activity.subject && (
            <div className="px-3 py-1 rounded-xl bg-white/15 border border-white/20 backdrop-blur-sm text-[11px] font-extrabold text-white flex items-center gap-1.5 shadow-sm">
              <BookOpen size={13} className="text-white/70" />
              <span>{activity.subject}</span>
            </div>
          )}
        </div>

        {/* How to Play Card */}
        <div className="w-full p-3.5 sm:p-4 rounded-2xl bg-white/15 border border-white/20 backdrop-blur-md text-left mb-6 shadow-xl">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-white/70 mb-2.5">
            <HelpCircle size={13} />
            <span>Nasıl Oynanır?</span>
          </div>
          <div className="space-y-2">
            {guide.howToPlay.map((step, idx) => (
              <div key={idx} className="flex items-start gap-2.5 text-[11px] sm:text-xs text-white/90 leading-snug">
                <span className="w-4 h-4 rounded-md bg-white/25 border border-white/30 text-white font-black text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 🚀 PRIMARY CTA BUTTON: BAŞLA */}
        <button
          onClick={() => setHasStarted(true)}
          className="group w-full max-w-xs py-4 sm:py-4.5 px-8 rounded-2xl font-black text-lg sm:text-xl text-white bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 border-2 border-white/40 shadow-2xl shadow-emerald-500/40 active:scale-95 transition-all cursor-pointer relative overflow-hidden flex items-center justify-center gap-3 animate-pulse"
        >
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12" />
          <Play size={22} className="fill-white relative z-10 group-hover:scale-110 transition-transform" />
          <span className="relative z-10 tracking-wider">OYUNA BAŞLA</span>
        </button>
      </div>

      {/* Footer hint */}
      <div className="relative z-10 text-[10px] text-white/50 text-center pb-2">
        Sınıf Bulutu Oyun Motoru • Tam Ekran Modu
      </div>
    </div>
  );

  /* ================================================================= */
  /* 🎮 FULLSCREEN GAME VIEW — Edge-to-Edge native mobile game layout  */
  /* ================================================================= */
  const renderFullscreenGame = () => (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-slate-900 text-slate-100 flex flex-col select-none overflow-hidden animate-fade-in">
      {/* Floating Modern Mobile HUD */}
      <header className="h-12 px-3 sm:px-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md flex items-center justify-between shrink-0 z-40">
        {/* Left: Exit */}
        <button
          type="button"
          onClick={onClose}
          className="py-1.5 px-2.5 sm:px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 border border-slate-700 shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span className="hidden sm:inline">{isMobileGameMode ? 'Stüdyoya Dön' : 'Çıkış'}</span>
          <span className="sm:hidden">Çıkış</span>
        </button>

        {/* Center: Title & live badge */}
        <div className="flex items-center gap-1.5 max-w-[50%] truncate px-2.5 py-1 rounded-full bg-slate-800/80 border border-slate-700/80">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="text-xs font-black text-slate-200 truncate">{activity.title}</span>
        </div>

        {/* Right: Restart & Back to splash */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={() => setHasStarted(false)}
            className="py-1 px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
            title="Başlangıç Menüsüne Dön"
          >
            Menü
          </button>
          <button
            type="button"
            onClick={() => setRestartKey((k) => k + 1)}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer active:scale-95"
            title="Yeniden Başlat"
          >
            <RotateCcw size={14} />
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white border border-rose-500 shadow-sm transition-colors cursor-pointer active:scale-95"
            title="Kapat"
          >
            <X size={14} />
          </button>
        </div>
      </header>

      {/* 🎮 Game Viewport: Truly Fullscreen Edge-to-Edge */}
      <main
        key={restartKey}
        className="flex-1 w-full h-[calc(100%-48px)] overflow-y-auto overflow-x-hidden mobile-game-viewport bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950"
      >
        <div className="w-full min-h-full flex flex-col items-center justify-start sm:justify-center p-0 sm:p-4 mobile-game-stage">
          <div className="w-full max-w-full sm:max-w-4xl flex flex-col items-center justify-center">
            {renderGame()}
          </div>
        </div>
      </main>
    </div>
  );

  /* ================================================================= */
  /* 📱 EMBED MODE (React Native WebView) — Students                    */
  /* ================================================================= */
  if (isEmbed) {
    if (!hasStarted) {
      return renderSplashScreen();
    }
    return renderFullscreenGame();
  }

  /* ================================================================= */
  /* 🎮 MOBILE GAME MODE — Teacher testing from ActivityStudio          */
  /* ================================================================= */
  if (isMobileGameMode) {
    if (!hasStarted) {
      return renderSplashScreen();
    }
    return renderFullscreenGame();
  }

  /* ================================================================= */
  /* 🖥️ DESKTOP WEB MODE — Full-page game with nav bar                 */
  /* ================================================================= */
  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#F8FAFC] text-slate-800 flex flex-col select-none overflow-hidden animate-fade-in">
      {/* 1. Top Navigation Bar */}
      <header className="h-14 sm:h-16 px-4 sm:px-6 bg-white/95 border-b border-slate-200/90 backdrop-blur-md shadow-xs flex items-center justify-between shrink-0 z-30">
        {/* Left: Back */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="py-2 px-3 sm:px-4 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-blue-700 font-bold text-xs sm:text-sm flex items-center gap-2 border border-blue-200/80 shadow-xs active:scale-95 transition-all cursor-pointer group"
            title="Ana Menüye Dön"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Ana Menüye Dön</span>
          </button>

          {/* Activity Title */}
          <div className="hidden sm:flex flex-col">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2 leading-tight truncate max-w-xs md:max-w-md">
              <span>{activity.title}</span>
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span className="text-blue-600 font-bold">{activity.subject}</span>
              <span>•</span>
              <span>{activity.items.length} Soru</span>
            </div>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {hasStarted && (
            <button
              onClick={() => setHasStarted(false)}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
              title="Başlangıç Ekranına Dön"
            >
              <RotateCcw size={14} />
              <span className="hidden md:inline">Başa Dön</span>
            </button>
          )}

          <button
            onClick={copyShareLink}
            className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
            title="Paylaşım bağlantısı kopyala"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
            <span className="hidden md:inline">{copied ? 'Kopyalandı!' : 'Paylaş'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran'}
          >
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
            title="Kapat"
          >
            <X size={18} />
          </button>
        </div>
      </header>

      {/* 2. Main Stage */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden flex items-center justify-center relative bg-gradient-to-b from-[#F0F7FF] via-[#F8FAFC] to-[#EDF2F7] p-2 sm:p-6">
        {/* Background ambience */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-300/20 rounded-full blur-[120px] pointer-events-none" />

        {!hasStarted ? (
          /* Start screen */
          <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center p-6 sm:p-10 rounded-3xl bg-white/95 border border-slate-200/90 backdrop-blur-xl shadow-xl shadow-blue-500/5 animate-scale-in text-slate-800">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 mb-6 shadow-xs">
              <Sparkles size={13} className="text-amber-500" />
              <span>{guide.badge}</span>
            </div>

            {/* Template Image */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-4 border-white shadow-xl shadow-blue-500/10 mb-6 group bg-slate-100">
              <img
                src={`/assets/templates/${activity.templateType}.jpg?v=2`}
                alt={activity.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight mb-2">
              {activity.title}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mb-6 leading-relaxed">
              {activity.description || 'Hazırsanız oyunu başlatın ve eğlenerek öğrenin.'}
            </p>

            {/* Stats */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs">
                <BookOpen size={14} className="text-blue-600" />
                <span>{activity.subject}</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs">
                <Layers size={14} className="text-emerald-600" />
                <span>{activity.items.length} Soru</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs">
                <Gamepad2 size={14} className="text-amber-600" />
                <span>{guide.title}</span>
              </div>
            </div>

            {/* How to Play */}
            <div className="w-full p-4 sm:p-5 rounded-2xl bg-slate-50/90 border border-slate-200 text-left mb-8 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
                <HelpCircle size={15} className="text-blue-600" />
                <span>Nasıl Oynanır?</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {guide.howToPlay.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-blue-100 border border-blue-200 text-blue-700 font-black text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3.5 pt-3 border-t border-slate-200 flex items-start gap-2 text-[11px] text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 font-medium">
                <Lightbulb size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <span><strong>İpucu:</strong> {guide.tip}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full justify-center">
              <button
                onClick={() => setHasStarted(true)}
                className="w-full sm:w-auto py-4 px-12 rounded-2xl font-black text-lg sm:text-xl text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer group"
              >
                <Play size={22} className="fill-white group-hover:scale-110 transition-transform" />
                <span>Oyunu Başlat</span>
              </button>
              <button
                onClick={onClose}
                className="w-full sm:w-auto py-4 px-6 rounded-2xl font-bold text-sm text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition-all cursor-pointer"
              >
                Ana Menüye Dön
              </button>
            </div>
          </div>
        ) : (
          /* Active Game */
          <div className="w-full h-full flex items-center justify-center animate-fade-in">
            {renderGame()}
          </div>
        )}
      </main>
    </div>
  );
};
