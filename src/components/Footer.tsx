import React from 'react';
import {
  Smartphone,
  Monitor,
  ShieldCheck,
  Heart,
  RotateCw,
  Layers,
  Zap,
  CaseSensitive,
  Package,
} from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-slate-200 pt-16 pb-12 px-4 sm:px-8 text-slate-600">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
        {/* Brand Col */}
        <div className="md:col-span-1">
          <div className="flex items-center gap-3 mb-3">
            <img src="/sinif_bulutu_logo.png" alt="Sınıf Bulutu" className="w-8 h-8 object-contain" />
            <span className="text-lg font-black text-slate-900 font-display">Sınıf Bulutu</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed mb-4">
            Eğitimde dijital dönüşüm: Etkileşimli eğitim oyunları, ders şablonları ve mobil sınıf yönetim platformu.
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span>KVKK & MEB Uyumlu</span>
          </div>
        </div>

        {/* Links Col 1 */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-4">
            Oyun Şablonları
          </h4>
          <ul className="space-y-2.5 text-xs font-medium">
            <li>
              <a href="#explore" className="hover:text-blue-600 flex items-center gap-2">
                <RotateCw size={13} className="text-rose-500" />
                <span>Rastgele Çarkıfelek</span>
              </a>
            </li>
            <li>
              <a href="#explore" className="hover:text-blue-600 flex items-center gap-2">
                <Layers size={13} className="text-emerald-500" />
                <span>Hafıza & Eşleştirme Kartları</span>
              </a>
            </li>
            <li>
              <a href="#explore" className="hover:text-blue-600 flex items-center gap-2">
                <Zap size={13} className="text-blue-500" />
                <span>Süreli Hızlı Quiz</span>
              </a>
            </li>
            <li>
              <a href="#explore" className="hover:text-blue-600 flex items-center gap-2">
                <CaseSensitive size={13} className="text-purple-500" />
                <span>Anagram / Kelime Düzenleme</span>
              </a>
            </li>
            <li>
              <a href="#explore" className="hover:text-blue-600 flex items-center gap-2">
                <Package size={13} className="text-amber-500" />
                <span>Kutu Açma Oyunu</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Links Col 2 */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-4">
            Platform & Destek
          </h4>
          <ul className="space-y-2 text-xs font-medium">
            <li><a href="#mobile-app" className="hover:text-blue-600 flex items-center gap-1.5"><Smartphone size={14} /> Mobil Uygulama (iOS / Android)</a></li>
            <li><a href="#features" className="hover:text-blue-600 flex items-center gap-1.5"><Monitor size={14} /> Akıllı Tahta Desteği</a></li>
            <li><a href="#how-it-works" className="hover:text-blue-600">Nasıl Etkinlik Oluşturulur?</a></li>
            <li><a href="#features" className="hover:text-blue-600">Öğretmen & Öğrenci Girişi</a></li>
          </ul>
        </div>

        {/* Links Col 3 */}
        <div>
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 mb-4">
            Yasal & İletişim
          </h4>
          <ul className="space-y-2 text-xs font-medium">
            <li><a href="#" className="hover:text-blue-600">Gizlilik Politikası</a></li>
            <li><a href="#" className="hover:text-blue-600">Kullanım Koşulları</a></li>
            <li><a href="#" className="hover:text-blue-600">KVKK Aydınlatma Metni</a></li>
            <li><a href="mailto:destek@sinifbulutu.com" className="hover:text-blue-600">destek@sinifbulutu.com</a></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <p>© 2026 Sınıf Bulutu. Tüm hakları saklıdır.</p>
        <p className="flex items-center gap-1">
          Öğretmenler ve öğrenciler için <Heart size={12} className="text-rose-500 fill-rose-500" /> ile geliştirildi.
        </p>
      </div>
    </footer>
  );
};
