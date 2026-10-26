import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Etkileşimli ders oyunlarını cep telefonunda nasıl oynatabilirim?',
    answer:
      'Mobil uygulamamızda veya web sitemizde herhangi bir oyuna dokunduğunuz anda oyun tam ekran açılır. Öğrenciler hiçbir donma veya takılma olmadan oyunu tamamlar; puanları ve başarı dereceleri otomatik olarak öğretmenin sınıf ekranına yansır.',
  },
  {
    question: 'Öğrencilerin sisteme girmesi için uygulama indirmesi şart mı?',
    answer:
      'Hayır! Öğretmen oyunun bağlantısını veya ekrandaki QR kodunu paylaştığında öğrenciler telefonlarının kamerasından okutarak ya da tarayıcıdan doğrudan katılabilir. Ancak mobil uygulamayı kullanan öğrenciler ödev bildirimlerini çok daha kolay takip eder.',
  },
  {
    question: 'Sınıftaki akıllı tahtada nasıl kullanılır?',
    answer:
      'Sınıf Bulutu web sitesini akıllı tahtada açıp herhangi bir oyunu başlattığınızda "Tam Ekran" butonuna basmanız yeterlidir. Dokunmatik ekranla öğrenciler tahtaya gelerek çarkıfeleği parmaklarıyla çevirebilir, köstebeklere vurabilir veya kartları eşleştirebilir.',
  },
  {
    question: 'Kendi özel sorularımı ve ders konularımı nasıl ekleyebilirim?',
    answer:
      'Sağ üstteki "Etkinlik Üret" butonuna tıklayıp istediğiniz şablonu (Çarkıfelek, Test Quiz, Hafıza Kartları, Köstebek Vurmaca vb.) seçin. Kendi soru ve cevaplarınızı yazıp "Oluştur" dediğinizde 1 dakika içinde oyununuz sınıfa hazır hale gelir.',
  },
  {
    question: 'Öğretmen ve öğrenci girişleri nasıl ayrılır?',
    answer:
      'Giriş ekranında Öğretmen ve Öğrenci butonları ayrılmıştır. Öğretmenler sınıf kurma, oyun hazırlama ve ödev atama imkanına sahipken; öğrenciler sınıfa katılıp ödevlerini eğlenceli oyunlar şeklinde tamamlarlar.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="w-full max-w-4xl mx-auto px-4 sm:px-8 py-20">
      <div className="text-center mb-12">
        <span className="text-xs font-extrabold uppercase tracking-wider text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full inline-block mb-2">
          Merak Edilenler
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
          Sıkça Sorulan Sorular
        </h2>
        <p className="text-sm text-slate-600 mt-1">
          Sınıf Bulutu kullanımı hakkında en çok merak edilen konular.
        </p>
      </div>

      <div className="space-y-3.5">
        {FAQS.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs transition-all"
            >
              <button
                onClick={() => toggleFaq(idx)}
                className="w-full p-5 text-left font-bold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-3 text-sm sm:text-base">
                  <HelpCircle size={18} className="text-blue-500 shrink-0" />
                  <span>{faq.question}</span>
                </span>
                <ChevronDown
                  size={18}
                  className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                    isOpen ? 'rotate-180 text-blue-600' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-1 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
