import React, { useState } from 'react';
import {
  Smartphone,
  CheckCircle,
  School,
  GraduationCap,
  Sparkles,
  QrCode,
  Bell,
  Zap,
  BarChart,
} from 'lucide-react';
import { AppStoreBadge, GooglePlayBadge } from './common/StoreBadges';

export const MobileAppShowcase: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'teacher' | 'student'>('teacher');

  const isTeacher = activeTab === 'teacher';

  return (
    <section id="mobile-app" className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-20 border-b border-slate-200/80">
      {/* Title */}
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 mb-3 shadow-xs">
          <Smartphone size={14} className="text-blue-600" />
          <span>Telefon ve Tablet Deneyimi</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4 font-display">
          Cebinizdeki Akıllı Sınıf: <br />
          <span className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Sınıf Bulutu Mobil Uygulaması
          </span>
        </h2>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Öğretmenler sınıflarını ve oyun etkinliklerini telefonlarından yönetir; öğrenciler ödevlerine tek tıkla ulaşıp oyunları telefonlarından keyifle çözer.
        </p>

        {/* Segmented Switcher for Teacher vs Student Mobile View */}
        <div className="inline-flex items-center p-1.5 rounded-2xl bg-slate-100 border border-slate-200 mt-6 shadow-xs">
          <button
            onClick={() => setActiveTab('teacher')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              isTeacher
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <School size={16} />
            <span>Öğretmen Modu</span>
          </button>

          <button
            onClick={() => setActiveTab('student')}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              !isTeacher
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap size={16} />
            <span>Öğrenci Modu</span>
          </button>
        </div>
      </div>

      {/* Feature Split Cards + Image Mockup */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        {/* Left Side (7 cols): Feature Bullet Points */}
        <div className="lg:col-span-7 space-y-4">
          {isTeacher ? (
            <>
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                  <School className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Sınıf Yönetimi & Kolay Öğrenci Daveti
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Saniyeler içinde yeni sınıfınızı açın, kısa bir sınıf kodu veya kamerayla okutulan QR kod ile tüm öğrencilerinizi anında sınıfa dahil edin.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0">
                  <Zap className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Ders İçi Oyunları Telefonda Başlatın
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Çarkıfelek, quiz veya hafıza kartlarını telefonunuzdan akıllı tahtaya yansıtın veya öğrencilerin telefonlarına ödev olarak yollayın.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0">
                  <BarChart className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Canlı Ödev Takibi & Otomatik Notlama
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Hangi öğrencinin hangi oyunu kaç puanla ve ne kadar sürede tamamladığını canlı analiz tablolarından izleyin.
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center shrink-0">
                  <QrCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Tek Tıkla Sınıfa Katılma
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Öğretmeninizin paylaştığı katılım kodunu girin veya telefonunuzun kamerasıyla QR kodu okutup dersinize saniyeler içinde bağlanın.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Oyunları Donmadan ve Kolayca Oynayın
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Ekstra program açmaya gerek olmadan, çarkıfelek ve quiz gibi ders etkinliklerini doğrudan uygulamanın içinden akıcı şekilde oynayın.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:border-blue-300 transition-all flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0">
                  <Bell className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">
                    Ödev Bildirimleri & Rozet Kazanımı
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Yeni bir ders oyunu veya ödev verildiğinde telefona bildirim gelir; soruları çözdükçe başarı rozetleri ve seviye puanları toplanır.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Compatibility Pill (Friendly & Clear) */}
          <div className="pt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1.5">
              <CheckCircle size={14} className="text-blue-600" />
              <span>Tüm Telefon ve Tabletlerle Uyumlu</span>
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1.5">
              <CheckCircle size={14} className="text-blue-600" />
              <span>Tek Tıkla Doğrudan Başla</span>
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center gap-1.5">
              <CheckCircle size={14} className="text-blue-600" />
              <span>Canlı Sınıf Senkronizasyonu</span>
            </span>
          </div>

          {/* Official App Store & Google Play Badges */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <AppStoreBadge />
            <GooglePlayBadge />
          </div>
        </div>

        {/* Right Side (5 cols): 3D Mobile Visual Showcase */}
        <div className="lg:col-span-5 flex justify-center">
          <div className="relative w-full max-w-sm">
            {/* Ambient Shadow glow */}
            <div className="absolute inset-4 bg-gradient-to-tr from-blue-400/25 to-sky-300/25 rounded-3xl blur-2xl -z-10" />

            <div className="rounded-3xl p-3 bg-white/90 backdrop-blur-md border border-white shadow-xl shadow-blue-500/10">
              <div className="rounded-2xl overflow-hidden aspect-[4/3] bg-blue-50">
                <img
                  src="/assets/mobile_classroom_preview.jpg"
                  alt="Sınıf Bulutu Mobil Uygulama Arayüzü"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* Status Info Footer */}
              <div className="mt-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <span className="text-xs font-extrabold text-slate-900 block">
                    {isTeacher ? 'Öğretmen Yönetim Ekranı' : 'Öğrenci Ödev Portalı'}
                  </span>
                  <span className="text-[11px] text-slate-500">iOS ve Android Uyumlu</span>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-700">
                  Canlı Bağlantı
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
