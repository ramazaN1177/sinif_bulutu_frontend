import React, { useState, useEffect } from 'react';
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
}

interface TemplateGuide {
  title: string;
  badge: string;
  howToPlay: string[];
  tip: string;
  color: string;
  btnBg: string;
}

const TEMPLATE_GUIDES: Record<TemplateType, TemplateGuide> = {
  wheel: {
    title: 'Çarkıfelek (Dönen Çark)',
    badge: 'Şans & Seçim',
    howToPlay: [
      'Çarkın ortasındaki butona veya çarka dokunarak çevirin.',
      'İbrenin durduğu soruyu veya kavramı sınıfla birlikte cevaplayın.',
      'Cevaplanan dilimleri isterseniz çarktan eleyebilirsiniz.',
    ],
    tip: 'Akıllı tahtada öğrencileri sırayla tahtaya kaldırıp çevirterek dersi eğlenceli hale getirin.',
    color: 'from-rose-500 to-rose-700',
    btnBg: 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/40',
  },
  memory: {
    title: 'Hafıza Kartları (3D Eşleştirme)',
    badge: 'Eşleştirme & Bellek',
    howToPlay: [
      'Kapalı kartlara tıklayarak arkasındaki kavramları açın.',
      'Birbirinin eşi veya tanımı olan iki kartı art arda bularak eşleyin.',
      'En az hamlede ve en kısa sürede tüm kartları temizleyin.',
    ],
    tip: 'Kartların yerini aklınızda tutarak görsel hafızanızı test edin.',
    color: 'from-emerald-500 to-emerald-700',
    btnBg: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/40',
  },
  quiz: {
    title: 'Süreli Hızlı Quiz',
    badge: 'Bilgi Yarışması',
    howToPlay: [
      'Her soruda ekrana gelen 4 seçenek arasından doğru olanı seçin.',
      'Süre bitmeden hızlıca cevaplayarak ekstra seri puanı kazanın.',
      'Art arda doğru bildikçe puan çarpanınız katlanarak yükselir.',
    ],
    tip: 'Hızlı ve doğru yanıtlar sınıf sıralamasında rekor puan getirir!',
    color: 'from-blue-500 to-blue-700',
    btnBg: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/40',
  },
  anagram: {
    title: 'Anagram (Harf Sıralama)',
    badge: 'Kelime & Mantık',
    howToPlay: [
      'Karışık verilen harf bloklarını doğru sıraya dizin.',
      'Soruyu veya ipucunu okuyarak gizli ders kavramını bulun.',
      'Harflere tıklayarak veya sürükleyerek yerlerini değiştirin.',
    ],
    tip: 'Tahmin etmekte zorlanırsanız üstteki soru ipucunu tekrar okuyun.',
    color: 'from-purple-500 to-purple-700',
    btnBg: 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/40',
  },
  box: {
    title: 'Gizemli Kutu Açma',
    badge: 'Şans & Sürpriz',
    howToPlay: [
      'Numaralandırılmış kutulardan birine tıklayarak kapağını açın.',
      'Kutunun içinden çıkan soruyu veya sınıf görevini tamamlayın.',
      'Tüm kutuları sırayla açarak etkinliği bitirin.',
    ],
    tip: 'Sınıfta her öğrenciye bir kutu numarası seçtirerek sözlü değerlendirme yapabilirsiniz.',
    color: 'from-amber-500 to-amber-700',
    btnBg: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/40',
  },
  whack: {
    title: 'Köstebek Vurmaca',
    badge: 'Refleks & Dikkat',
    howToPlay: [
      'Yuvalardan fırlayan sevimli köstebekleri dikkatle takip edin.',
      'Yalnızca doğru cevabı taşıyan köstebeğe tıklayarak vurun.',
      'Yanlış köstebeklere dokunmaktan kaçının ve süreyi iyi kullanın.',
    ],
    tip: 'Hızlı refleksler ve dikkatli gözlem en yüksek puanı kazandırır.',
    color: 'from-orange-500 to-amber-700',
    btnBg: 'bg-orange-600 hover:bg-orange-500 shadow-orange-500/40',
  },
  airplane: {
    title: 'Gökyüzü Bulut Uçuşu',
    badge: 'Aksiyon & Karar',
    howToPlay: [
      'Uçağınızı yukarı/aşağı yönlendirerek gökyüzünde kontrol edin.',
      'Doğru cevabın yazılı olduğu bulutun tam içinden geçin.',
      'Yanlış bulutlara çarpmamaya özen gösterin.',
    ],
    tip: 'Uçağı dengede tutun ve yaklaşan bulutları erkenden okuyun.',
    color: 'from-sky-500 to-blue-700',
    btnBg: 'bg-sky-600 hover:bg-sky-500 shadow-sky-500/40',
  },
  hangman: {
    title: 'Gizli Kelime Kurtarma',
    badge: 'Kelime & Tahmin',
    howToPlay: [
      'Alttaki harf klavyesinden seçim yaparak gizli kelimeyi tahmin edin.',
      'Doğru harfler kelimedeki boşluklara yerleşir.',
      'Can haklarınız tükenmeden önce kelimeyi tamamlayın.',
    ],
    tip: 'Önce sesli harflerden başlayarak kelime yapısını hızlıca çözün.',
    color: 'from-rose-500 to-red-700',
    btnBg: 'bg-rose-600 hover:bg-rose-500 shadow-rose-500/40',
  },
  truefalse: {
    title: 'Doğru mu Yanlış mı?',
    badge: 'Hızlı Karar',
    howToPlay: [
      'Ekrana gelen önermeyi veya bilgiyi hızlıca okuyun.',
      'İfade doğruysa yeşil Doğru, yanlışsa kırmızı Yanlış butonuna basın.',
      'Seri yanıt vererek ekstra puan çarpanı kazanın.',
    ],
    tip: 'Şaşırtmacalı cümlelere ve olumsuzluk eklerine dikkat edin.',
    color: 'from-teal-500 to-emerald-700',
    btnBg: 'bg-teal-600 hover:bg-teal-500 shadow-teal-500/40',
  },
  balloon: {
    title: 'Balon Patlatma',
    badge: 'Görsel Dikkat',
    howToPlay: [
      'Havada süzülen renkli balonları takip edin.',
      'Doğru cevabı taşıyan balona tıklayarak veya dokunarak patlatın.',
      'Yanlış balonlara dokunmadan hızlıca ilerleyin.',
    ],
    tip: 'Balonlar yukarı doğru süzülürken acele etmeden doğruyu seçin.',
    color: 'from-pink-500 to-rose-600',
    btnBg: 'bg-pink-600 hover:bg-pink-500 shadow-pink-500/40',
  },
  cardsort: {
    title: 'Bilgi Kartları Destesi',
    badge: 'Kavram Tekrarı',
    howToPlay: [
      'Kartın ön yüzündeki terimi veya soruyu okuyun.',
      'Karta tıklayarak arkasını çevirin ve cevabı görün.',
      'Sonraki karta geçerek tüm desteyi tamamlayın.',
    ],
    tip: 'Sınav öncesi kavramları hızlıca tekrar etmek için harika bir yöntemdir.',
    color: 'from-indigo-500 to-violet-700',
    btnBg: 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-500/40',
  },
  categorize: {
    title: 'Kutulara Düşürme & Gruplandırma',
    badge: 'Fizik & Sınıflandırma',
    howToPlay: [
      'Ekranın üstündeki soru topunu farenizle veya parmağınızla tutun.',
      'Fizik kurallarıyla doğru alt kutunun üzerine getirip serbest bırakın.',
      'Veya kutuya doğrudan tıklayarak topun oraya düşmesini sağlayın.',
    ],
    tip: 'Top yerçekimiyle düşer ve kutu içinde seker; doğru kutuyu hedefleyin!',
    color: 'from-blue-600 to-indigo-800',
    btnBg: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/40',
  },
  wordsearch: {
    title: 'Kelime Avı (Kare Bulmaca)',
    badge: 'Bulmaca & Arama',
    howToPlay: [
      'Harf tablosunda sağda listelenen ders kelimelerini arayın.',
      'Yatay, dikey veya çapraz gizlenmiş kelimeleri işaretleyin.',
      'Tüm gizli kelimeleri bularak bulmacayı tamamlayın.',
    ],
    tip: 'Kelimelerin ilk harflerini tablodan tarayarak hızlıca bulun.',
    color: 'from-emerald-600 to-teal-800',
    btnBg: 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/40',
  },
  timeline: {
    title: 'Tarih & Zaman Çizelgesi',
    badge: 'Kronolojik Sıralama',
    howToPlay: [
      'Olay kartlarını gerçekleşme sırasına göre baştan sona dizin.',
      'Kartları zaman cetvelindeki doğru kutulara yerleştirin.',
      'Sıralamayı kontrol ederek doğruluğunu test edin.',
    ],
    tip: 'Olayların tarihlerini ve sebep-sonuç ilişkilerini düşünün.',
    color: 'from-amber-600 to-yellow-800',
    btnBg: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/40',
  },
  dragword: {
    title: 'Cümle İçi Boşluk Doldurma',
    badge: 'Dil & Cümle Tamamlama',
    howToPlay: [
      'Cümledeki boşluğa uygun olan kelime kartını seçin.',
      'Doğru kartı sürükleyip boşluğun üzerine bırakın.',
      'Cümlenin anlam bütünlüğünü kontrol edin.',
    ],
    tip: 'Cümlenin anlamına ve dilbilgisi kurallarına dikkat edin.',
    color: 'from-cyan-600 to-blue-800',
    btnBg: 'bg-cyan-600 hover:bg-cyan-500 shadow-cyan-500/40',
  },
};

export const GameModal: React.FC<GameModalProps> = ({
  activity,
  onClose,
  isEmbed = false,
}) => {
  if (!activity) return null;

  // Track whether the player clicked "BAŞLA"
  const [hasStarted, setHasStarted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Reset start state when a new activity is opened
  useEffect(() => {
    setHasStarted(false);
  }, [activity.id]);

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

  const renderGame = () => {
    switch (activity.templateType) {
      case 'wheel':
        return <WheelGame title={activity.title} items={activity.items} isEmbed={isEmbed} />;
      case 'memory':
        return <MemoryGame title={activity.title} items={activity.items} isEmbed={isEmbed} />;
      case 'quiz':
        return <QuizGame title={activity.title} items={activity.items} isEmbed={isEmbed} />;
      case 'anagram':
        return <AnagramGame title={activity.title} items={activity.items} isEmbed={isEmbed} />;
      case 'box':
        return <BoxGame title={activity.title} items={activity.items} isEmbed={isEmbed} />;
      case 'whack':
        return <WhackGame title={activity.title} items={activity.items} isEmbed={isEmbed} />;
      case 'airplane':
        return <AirplaneGame title={activity.title} items={activity.items} isEmbed={isEmbed} />;
      case 'hangman':
        return <HangmanGame title={activity.title} items={activity.items} isEmbed={isEmbed} />;
      case 'truefalse':
        return <TrueFalseGame title={activity.title} items={activity.items} isEmbed={isEmbed} />;
      case 'balloon':
        return <BalloonGame title={activity.title} items={activity.items} isEmbed={isEmbed} />;
      case 'cardsort':
        return <FlashcardGame title={activity.title} items={activity.items} isEmbed={isEmbed} />;
      case 'categorize':
        return (
          <CategorizeGame
            title={activity.title}
            items={activity.items}
            categories={activity.categories}
            boxColors={activity.boxColors}
            isEmbed={isEmbed}
          />
        );
      case 'wordsearch':
        return <WordSearchGame title={activity.title} items={activity.items} isEmbed={isEmbed} />;
      case 'timeline':
        return <TimelineGame title={activity.title} items={activity.items} isEmbed={isEmbed} />;
      case 'dragword':
        return <DragWordGame title={activity.title} items={activity.items} isEmbed={isEmbed} />;
      default:
        return <WheelGame title={activity.title} items={activity.items} isEmbed={isEmbed} />;
    }
  };

  // If in pure embed mode (React Native WebView), skip container header
  if (isEmbed) {
    if (!hasStarted) {
      return (
        <div className="w-full min-h-screen bg-[#0A1128] flex flex-col items-center justify-center p-4 select-none text-white text-center">
          <div className="w-24 h-24 rounded-3xl overflow-hidden mb-4 shadow-2xl border-2 border-white/20">
            <img
              src={`/assets/templates/${activity.templateType}.jpg?v=2`}
              alt={activity.title}
              className="w-full h-full object-cover"
            />
          </div>
          <h2 className="text-2xl font-black mb-2">{activity.title}</h2>
          <p className="text-slate-300 text-sm mb-6">{activity.subject} • {activity.items.length} Soru</p>
          <button
            onClick={() => setHasStarted(true)}
            className="py-4 px-10 rounded-2xl bg-blue-600 text-white font-black text-lg shadow-xl shadow-blue-500/30 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Play size={20} className="fill-white" />
            <span>Oyunu Başlat</span>
          </button>
        </div>
      );
    }
    return (
      <div className="w-full min-h-screen bg-[#0A1128] flex items-center justify-center p-2">
        {renderGame()}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 w-screen h-screen bg-[#F8FAFC] text-slate-800 flex flex-col select-none overflow-hidden animate-fade-in">
      {/* 1. Sleek Fullscreen Top Navigation Bar */}
      <header className="h-16 px-4 sm:px-6 bg-white/95 border-b border-slate-200/90 backdrop-blur-md shadow-xs flex items-center justify-between shrink-0 z-30">
        {/* Left: Prominent "Ana Menüye Dön" Button */}
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onClose}
            className="py-2 px-3.5 sm:px-4 rounded-xl bg-blue-50 hover:bg-blue-100/80 text-blue-700 font-bold text-xs sm:text-sm flex items-center gap-2 border border-blue-200/80 shadow-xs active:scale-95 transition-all cursor-pointer group"
            title="Oyundan Çık ve Ana Menüye Dön"
          >
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span>Ana Menüye Dön</span>
          </button>

          {/* Activity Title & Badge */}
          <div className="hidden sm:flex flex-col">
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2 font-display leading-tight truncate max-w-xs md:max-w-md">
              <span>{activity.title}</span>
            </h2>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <span className="text-blue-600 font-bold">{activity.subject}</span>
              <span>•</span>
              <span>{activity.items.length} Soru / Öğe</span>
            </div>
          </div>
        </div>

        {/* Right Actions: Restart, Share, Fullscreen, Close */}
        <div className="flex items-center gap-2">
          {hasStarted && (
            <button
              onClick={() => setHasStarted(false)}
              className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
              title="Giriş Ekranına ve Kurallara Dön"
            >
              <RotateCcw size={14} />
              <span className="hidden md:inline">Başa Dön</span>
            </button>
          )}

          <button
            onClick={copyShareLink}
            className="py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
            title="Öğrencilerle paylaşım bağlantısı kopyala"
          >
            {copied ? <Check size={14} className="text-emerald-600" /> : <Share2 size={14} />}
            <span className="hidden md:inline">{copied ? 'Kopyalandı!' : 'Paylaş'}</span>
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors cursor-pointer"
            title={isFullscreen ? 'Tam Ekrandan Çık' : 'Tam Ekran Modu (Akıllı Tahta)'}
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

      {/* 2. Main Stage Area: Fullscreen Start Screen OR Live Interactive Game */}
      <main className="flex-1 w-full overflow-y-auto overflow-x-hidden flex items-center justify-center relative bg-gradient-to-b from-[#F0F7FF] via-[#F8FAFC] to-[#EDF2F7] p-2 sm:p-6">
        {/* Subtle Background Ambience */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-blue-300/20 rounded-full blur-[120px] pointer-events-none" />

        {!hasStarted ? (
          /* ========================================================= */
          /* 🚀 GAME START SCREEN (BAŞLA EKRANI - AÇIK RENK)           */
          /* ========================================================= */
          <div className="relative z-10 w-full max-w-3xl flex flex-col items-center text-center p-6 sm:p-10 rounded-3xl bg-white/95 border border-slate-200/90 backdrop-blur-xl shadow-xl shadow-blue-500/5 animate-scale-in text-slate-800">
            {/* Top Category Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 mb-6 shadow-xs">
              <Sparkles size={13} className="text-amber-500" />
              <span>{guide.badge}</span>
            </div>

            {/* 3D AI Template Visual Preview */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-3xl overflow-hidden border-4 border-white shadow-xl shadow-blue-500/10 mb-6 group bg-slate-100">
              <img
                src={`/assets/templates/${activity.templateType}.jpg?v=2`}
                alt={activity.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Title & Subject */}
            <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight font-display mb-2">
              {activity.title}
            </h1>
            <p className="text-slate-600 text-sm sm:text-base max-w-xl mb-6 leading-relaxed">
              {activity.description || 'Hazırsanız oyunu başlatın ve sınıfla birlikte eğlenerek öğrenin.'}
            </p>

            {/* Key Game Stats Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs">
                <BookOpen size={14} className="text-blue-600" />
                <span>{activity.subject}</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs">
                <Layers size={14} className="text-emerald-600" />
                <span>{activity.items.length} Öğe / Soru</span>
              </div>
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 flex items-center gap-2 shadow-xs">
                <Gamepad2 size={14} className="text-amber-600" />
                <span>{guide.title}</span>
              </div>
            </div>

            {/* How to Play Card */}
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

              {/* Teacher Tip */}
              <div className="mt-3.5 pt-3 border-t border-slate-200 flex items-start gap-2 text-[11px] text-amber-900 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/80 font-medium">
                <Lightbulb size={14} className="text-amber-600 shrink-0 mt-0.5" />
                <span><strong>İpucu:</strong> {guide.tip}</span>
              </div>
            </div>

            {/* 🎯 Primary Action Button: "BAŞLA" (Oyunu Başlat) */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full justify-center">
              <button
                onClick={() => setHasStarted(true)}
                className="w-full sm:w-auto py-4 px-12 rounded-2xl font-black text-lg sm:text-xl text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer group"
              >
                <Play size={22} className="fill-white group-hover:scale-110 transition-transform" />
                <span>Oyunu Başlat (Başla)</span>
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
          /* ========================================================= */
          /* 🎮 ACTIVE FULLSCREEN GAME STAGE                           */
          /* ========================================================= */
          <div className="w-full h-full flex items-center justify-center animate-fade-in">
            {renderGame()}
          </div>
        )}
      </main>
    </div>
  );
};
