import React from 'react';
import {
  Sparkles,
  Zap,
  Monitor,
  Smartphone,
  BarChart3,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  Users,
  ShieldCheck,
} from 'lucide-react';

export const PlatformInfoSection: React.FC = () => {
  return (
    <section id="platform-info" className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-20 border-b border-slate-200/80">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 mb-3 shadow-xs">
          <Sparkles size={14} className="text-blue-600" />
          <span>Kolay & Eğlenceli Eğitim</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight font-display mb-4">
          Neden Sınıf Bulutu?
        </h2>
        <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
          Geleneksel ders anlatımını geride bırakın. Akıllı tahta, bilgisayar ve cep telefonunu bir araya getiren, her öğretmenin kolayca kullanabileceği modern sınıf ortamı.
        </p>
      </div>

      {/* 4 Core Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {/* Pillar 1 */}
        <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-blue-300 transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Zap size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">1 Dakikada Hazır</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Zor ayarlarla vakit kaybetmeyin. Sadece soru ve cevaplarınızı yazın; oyununuz tüm kurallarıyla saniyeler içinde hazır olsun.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-blue-600">
            <Clock size={14} />
            <span>Öğretmene Zaman Kazandırır</span>
          </div>
        </div>

        {/* Pillar 2 */}
        <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-sky-300 transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-sky-600 group-hover:text-white transition-all">
              <Monitor size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Akıllı Tahtada Tam Ekran</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Sınıfınızdaki akıllı tahtada tek tıkla tam ekran açılır. Dokunmatik ekranla öğrenciler tahtaya kalkıp keyifle yarışır.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-sky-600">
            <ShieldCheck size={14} />
            <span>Tüm Akıllı Tahtalarla Uyumlu</span>
          </div>
        </div>

        {/* Pillar 3 */}
        <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-indigo-300 transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all">
              <Smartphone size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Telefonda Akıcı Oyun</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Öğrenciler zorluk yaşamadan kendi telefon veya tabletlerinden oyunları tamamlar, ev ödevlerini sıkılmadan çözer.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-indigo-600">
            <Award size={14} />
            <span>Donma Yok, Kolay Arayüz</span>
          </div>
        </div>

        {/* Pillar 4 */}
        <div className="p-7 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-xl hover:border-emerald-300 transition-all duration-300 flex flex-col justify-between group">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <BarChart3 size={22} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Canlı Not & Başarı Takibi</h3>
            <p className="text-sm text-slate-600 leading-relaxed mb-4">
              Hangi öğrencinin hangi konuda zorlandığını, sınıfın genel başarı durumunu ve sıralamayı net grafiklerle anında görün.
            </p>
          </div>
          <div className="pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold text-emerald-600">
            <Users size={14} />
            <span>Otomatik Sınıf Karnesi</span>
          </div>
        </div>
      </div>

      {/* Comparison: Geleneksel vs Sınıf Bulutu */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-blue-50/80 via-white to-sky-50/60 border border-blue-200/70 shadow-sm mb-16">
        <div className="max-w-2xl mx-auto text-center mb-10">
          <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 bg-white border border-blue-200 px-3 py-1 rounded-full inline-block mb-2">
            Farkı Yaşayın
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-display">
            Eski Yöntemler vs. Sınıf Bulutu
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Traditional Way */}
          <div className="p-6 rounded-2xl bg-white/70 border border-rose-200/80">
            <div className="flex items-center gap-2 mb-4 text-rose-600 font-bold text-sm uppercase tracking-wider">
              <XCircle size={18} />
              <span>Eski Alışılmış Yöntem</span>
            </div>
            <ul className="space-y-3 text-sm text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span>Kağıt fotokopiler basma, dağıtma ve toplama zahmeti</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span>Öğrencilerin ilgisini çekmeyen tekdüze test kağıtları</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span>Ödevleri tek tek elle kontrol edip not verme yorgunluğu</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-rose-500 font-bold shrink-0">✕</span>
                <span>Akıllı tahtanın sınıfta sadece slayt okumak için kalması</span>
              </li>
            </ul>
          </div>

          {/* Sinif Bulutu Way */}
          <div className="p-6 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20">
            <div className="flex items-center gap-2 mb-4 text-blue-100 font-bold text-sm uppercase tracking-wider">
              <CheckCircle2 size={18} className="text-emerald-300" />
              <span>Sınıf Bulutu ile Canlı Sınıf</span>
            </div>
            <ul className="space-y-3 text-sm text-blue-50">
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-300 font-bold shrink-0">✓</span>
                <span>1 dakikada hazır çarkıfelek, quiz, köstebek vurmaca veya uçak oyunu</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-300 font-bold shrink-0">✓</span>
                <span>Oyunlaştırma, eğlenceli sesler ve puanlarla tüm sınıfın derse katılımı</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-300 font-bold shrink-0">✓</span>
                <span>Kim yaptı, kim kaç aldı anında görünen otomatik notlama</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-emerald-300 font-bold shrink-0">✓</span>
                <span>Akıllı tahtada canlı sınıf yarışması, telefonda tek tıkla ödev çözümü</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Numerical Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 rounded-3xl bg-white border border-slate-200 shadow-sm text-center">
        <div>
          <span className="text-3xl sm:text-4xl font-black text-blue-600 block mb-1 font-display">16+</span>
          <span className="text-xs sm:text-sm font-semibold text-slate-600">Oyun Çeşidi</span>
        </div>
        <div>
          <span className="text-3xl sm:text-4xl font-black text-slate-900 block mb-1 font-display">60 Sn</span>
          <span className="text-xs sm:text-sm font-semibold text-slate-600">Etkinlik Hazırlama Süresi</span>
        </div>
        <div>
          <span className="text-3xl sm:text-4xl font-black text-emerald-600 block mb-1 font-display">%98</span>
          <span className="text-xs sm:text-sm font-semibold text-slate-600">Öğrenci Katılımı</span>
        </div>
        <div>
          <span className="text-3xl sm:text-4xl font-black text-indigo-600 block mb-1 font-display">0 ₺</span>
          <span className="text-xs sm:text-sm font-semibold text-slate-600">Tamamen Ücretsiz</span>
        </div>
      </div>
    </section>
  );
};
