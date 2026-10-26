import React from 'react';
import {
  Sparkles,
  Play,
  PlusCircle,
  Gamepad2,
  Smartphone,
  Monitor,
  QrCode,
  CheckCircle2,
  RotateCw,
  Layers,
  Zap,
  Hammer,
  Plane,
  Package,
  ArrowRight,
  ShieldCheck,
  Users,
  Trophy,
} from 'lucide-react';
import type { TemplateType } from '../types/game';

interface HeroProps {
  onQuickPlay: (type: TemplateType) => void;
  onCreateClick: () => void;
  onExploreClick: () => void;
  onMobileClick: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onQuickPlay,
  onCreateClick,
  onExploreClick,
  onMobileClick,
}) => {
  return (
    <section
      id="hero"
      className="relative w-full min-h-[calc(100vh-72px)] flex flex-col justify-between pt-8 sm:pt-12 pb-10 px-4 sm:px-8 soft-grid-bg border-b border-slate-200/80 overflow-hidden"
    >
      {/* Soft Ambient Radial Lights (Sky Blue & White Tones) */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-100/70 via-sky-50/50 to-transparent rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 -right-20 w-[450px] h-[450px] bg-blue-100/40 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-1/2 -left-20 w-[400px] h-[400px] bg-indigo-50/60 rounded-full blur-[110px] pointer-events-none" />

      {/* Main Content Area: Centered Vertically */}
      <div className="max-w-7xl mx-auto w-full my-auto relative z-10 py-4">
        {/* Top Announcement Tag */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/95 border border-blue-200 shadow-xs backdrop-blur-md text-xs sm:text-sm font-semibold text-slate-700 hover:border-blue-300 transition-all">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
            </span>
            <span className="text-blue-700 font-bold">2026 Yeni Sürüm</span>
            <span className="text-slate-300">|</span>
            <span className="flex items-center gap-1.5 text-slate-600">
              <Sparkles size={14} className="text-amber-500" />
              16+ Eğlenceli Ders Oyunu & Mobil Sınıf
            </span>
            <ArrowRight size={13} className="text-blue-500 ml-0.5" />
          </div>
        </div>

        {/* Hero Main Grid: Text on Left, 3D Mockup Showcase on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (7 cols): Headlines & Actions */}
          <div className="lg:col-span-7 text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-[58px] font-black text-slate-900 tracking-tight leading-[1.12] mb-6 font-display">
              Sınıfınızı Eğlenceli <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Dijital Oyunlarla Canlandırın
              </span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mb-8 leading-relaxed font-normal mx-auto lg:mx-0">
              Öğretmenler için <strong>1 dakikada</strong> çarkıfelek, bilgi yarışması, köstebek vurmaca ve eşleştirme oyunları hazırlama platformu. Akıllı tahtada tam ekran, cep telefonunda <strong>kolay ve akıcı</strong> mobil deneyimle tüm sınıf derse katılsın.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3.5 mb-10">
              <button
                onClick={onExploreClick}
                className="py-4 px-8 rounded-2xl font-bold text-sm sm:text-base text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 flex items-center gap-2.5 transition-all active:scale-95 group cursor-pointer"
              >
                <Play size={18} className="fill-white group-hover:scale-110 transition-transform" />
                <span>Oyunları Dene & Oyna</span>
              </button>

              <button
                onClick={onCreateClick}
                className="py-4 px-7 rounded-2xl font-bold text-sm sm:text-base text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
              >
                <PlusCircle size={18} className="text-blue-600" />
                <span>Etkinlik Oluştur (+)</span>
              </button>

              <button
                onClick={onMobileClick}
                className="py-4 px-6 rounded-2xl font-bold text-sm text-blue-700 bg-blue-50 hover:bg-blue-100/70 border border-blue-200 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Smartphone size={17} className="text-blue-600" />
                <span>Mobil Uygulama</span>
              </button>
            </div>

            {/* Trust & Key Features Badges (Natural, Friendly Language) */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5 pt-6 border-t border-slate-200/80 max-w-xl mx-auto lg:mx-0">
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <CheckCircle2 size={17} className="text-blue-600 shrink-0" />
                <span>Tüm Derslere & MEB'e Uygun</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <Monitor size={17} className="text-indigo-600 shrink-0" />
                <span>Akıllı Tahtada Tam Ekran</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <QrCode size={17} className="text-emerald-600 shrink-0" />
                <span>QR Kodla Anında Başla</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <ShieldCheck size={17} className="text-sky-600 shrink-0" />
                <span>Tamamen Ücretsiz</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <Users size={17} className="text-amber-600 shrink-0" />
                <span>Canlı Sınıf Sıralaması</span>
              </div>
              <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-700">
                <Sparkles size={17} className="text-purple-600 shrink-0" />
                <span>16 Farklı Oyun Türü</span>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): 3D Visual + Floating Badges */}
          <div className="lg:col-span-5 relative flex justify-center">
            {/* Ambient Back Glow */}
            <div className="absolute inset-4 bg-gradient-to-tr from-blue-300/30 via-sky-200/30 to-indigo-200/20 rounded-3xl blur-2xl -z-10" />

            {/* Container for the 3D Hero Visual */}
            <div className="relative w-full max-w-lg rounded-3xl p-3 bg-white/90 backdrop-blur-md border border-white shadow-xl shadow-blue-500/10">
              <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-gradient-to-b from-sky-50 to-blue-50 group">
                <img
                  src="/assets/hero_edu_showcase.jpg?v=2"
                  alt="Sınıf Bulutu 3D Eğitim Platformu"
                  className="w-full h-full object-cover transform group-hover:scale-[1.02] transition-transform duration-500"
                  loading="eager"
                />

                {/* Subtle Inner Glass Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 via-transparent to-transparent pointer-events-none" />

                {/* Floating Bottom Card over Image */}
                <div className="absolute bottom-3 left-3 right-3 p-3.5 rounded-xl bg-white/95 backdrop-blur-md border border-white/80 shadow-md flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
                      <Gamepad2 size={18} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">Etkileşimli Ders Oyunları</span>
                      <span className="text-[11px] text-slate-500">16 Hazır Oyun Türü</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onQuickPlay('wheel')}
                    className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1 active:scale-95 transition-all cursor-pointer"
                  >
                    <Play size={12} className="fill-white" />
                    <span>Dene</span>
                  </button>
                </div>
              </div>

              {/* Floating Badge 1 (Top Right) */}
              <div className="hidden sm:flex absolute -top-4 -right-4 p-3 rounded-2xl bg-white border border-blue-100 shadow-lg shadow-blue-900/5 items-center gap-2.5 anim-float">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                  <Zap size={16} />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block leading-tight">Hızlı & Donma Yok</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Anında Açılır</span>
                </div>
              </div>

              {/* Floating Badge 2 (Bottom Left) */}
              <div className="hidden sm:flex absolute -bottom-4 -left-4 p-3 rounded-2xl bg-white border border-blue-100 shadow-lg shadow-blue-900/5 items-center gap-2.5 anim-float-delayed">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs">
                  <Trophy size={16} />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block leading-tight">Canlı Skor Takibi</span>
                  <span className="text-[10px] text-slate-500">28 Öğrenci Bağlı</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Interactive Quick Play Bar */}
      <div className="max-w-7xl mx-auto w-full relative z-10 pt-4">
        <div className="p-4 rounded-3xl bg-white border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-700 shrink-0">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
            <Gamepad2 size={16} className="text-blue-600" />
            <span>Popüler Oyunları Canlı Dene:</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 w-full md:w-auto">
            <button
              onClick={() => onQuickPlay('wheel')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-50/80 hover:bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <RotateCw size={13} className="text-blue-600" />
              <span>Çarkıfelek</span>
            </button>

            <button
              onClick={() => onQuickPlay('whack')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <Hammer size={13} className="text-amber-600" />
              <span>Köstebek Vurmaca</span>
            </button>

            <button
              onClick={() => onQuickPlay('airplane')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <Plane size={13} className="text-sky-600" />
              <span>Uçakla Bulut</span>
            </button>

            <button
              onClick={() => onQuickPlay('quiz')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <Zap size={13} className="text-indigo-600" />
              <span>Hızlı Quiz</span>
            </button>

            <button
              onClick={() => onQuickPlay('memory')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <Layers size={13} className="text-emerald-600" />
              <span>Hafıza Kartları</span>
            </button>

            <button
              onClick={() => onQuickPlay('box')}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1.5 transition-all active:scale-95 shadow-xs cursor-pointer"
            >
              <Package size={13} className="text-purple-600" />
              <span>Kutu Açma</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
