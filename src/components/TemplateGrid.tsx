import React, { useState } from 'react';
import {
  RotateCw,
  Layers,
  Zap,
  CaseSensitive,
  Package,
  CheckCircle2,
  FolderTree,
  Search,
  Heart,
  Hammer,
  Plane,
  Sparkles,
  Clock,
  FileText,
  BookOpen,
  Monitor,
  Smartphone,
  PlusCircle,
  Play,
} from 'lucide-react';
import type { Activity, TemplateType } from '../types/game';
import { TemplateCardPreview } from './TemplateCardPreview';

// Kept for playable sample previews
export const SAMPLE_ACTIVITIES: Activity[] = [
  {
    id: 'act_1',
    title: 'Güneş Sistemi & Gezegenler',
    description: 'Gezegenlerin özelliklerini ve sıralamasını eğlenceli bir yarışma ile öğrenin.',
    templateType: 'quiz',
    subject: 'Fen Bilimleri',
    gradeLevel: '5. Sınıf',
    playCount: 1420,
    items: [
      { id: '1', question: 'Güneş sistemindeki en büyük gezegen hangisidir?', answer: 'Jüpiter', options: ['Mars', 'Jüpiter', 'Satürn', 'Venüs'] },
      { id: '2', question: 'Kızıl Gezegen olarak bilinen gezegen hangisidir?', answer: 'Mars', options: ['Mars', 'Merkür', 'Dünya', 'Neptün'] },
      { id: '3', question: 'Güneş’e en yakın gezegen hangisidir?', answer: 'Merkür', options: ['Merkür', 'Venüs', 'Dünya', 'Mars'] },
      { id: '4', question: 'Belirgin halkalarıyla tanınan dev gezegen hangisidir?', answer: 'Satürn', options: ['Uranüs', 'Satürn', 'Jüpiter', 'Neptün'] },
    ],
  },
  {
    id: 'act_2',
    title: 'Eş Anlamlı Sözcükler Çarkı',
    description: 'Çarkı çevirin, gelen sözcüğün eş anlamlısını sınıfla birlikte bulun.',
    templateType: 'wheel',
    subject: 'Türkçe',
    gradeLevel: '3-4. Sınıf',
    playCount: 2890,
    items: [
      { id: '1', question: 'Al', answer: 'Kırmızı' },
      { id: '2', question: 'Ak', answer: 'Beyaz' },
      { id: '3', question: 'Konuk', answer: 'Misafir' },
      { id: '4', question: 'Yurt', answer: 'Vatan' },
      { id: '5', question: 'Lider', answer: 'Önder' },
      { id: '6', question: 'Hediye', answer: 'Armağan' },
      { id: '7', question: 'Mektep', answer: 'Okul' },
      { id: '8', question: 'Öğrenci', answer: 'Talebe' },
    ],
  },
  {
    id: 'act_3',
    title: 'Ülkeler & Başkentler Eşleştirme',
    description: 'Hafızanızı zorlayarak ülke ve başkent eşleşmelerini bulun.',
    templateType: 'memory',
    subject: 'Sosyal Bilgiler',
    gradeLevel: '6. Sınıf',
    playCount: 3100,
    items: [
      { id: '1', question: 'Türkiye', answer: 'Ankara' },
      { id: '2', question: 'Fransa', answer: 'Paris' },
      { id: '3', question: 'Almanya', answer: 'Berlin' },
      { id: '4', question: 'Japonya', answer: 'Tokyo' },
      { id: '5', question: 'İtalya', answer: 'Roma' },
      { id: '6', question: 'Azerbaycan', answer: 'Bakü' },
    ],
  },
  {
    id: 'act_4',
    title: 'Fen Terimleri Anagram',
    description: 'Karışık harfleri doğru sıraya dizerek fen kavramlarını bulun.',
    templateType: 'anagram',
    subject: 'Fen Bilimleri',
    gradeLevel: '5. Sınıf',
    playCount: 1850,
    items: [
      { id: '1', question: 'Hücrenin enerji santrali', answer: 'MİTOKONDRİ' },
      { id: '2', question: 'Bitkilerde fotosentez organı', answer: 'KLOROPLAST' },
      { id: '3', question: 'Kalıtım maddesi', answer: 'KROMOZOM' },
      { id: '4', question: 'Canlıların en küçük yapı birimi', answer: 'HÜCRE' },
    ],
  },
  {
    id: 'act_5',
    title: 'Çarpım Tablosu Kutu Açma',
    description: 'Gizemli kutuları açın, arkasındaki çarpma işlemlerini hızlıca yanıtlayın.',
    templateType: 'box',
    subject: 'Matematik',
    gradeLevel: '3. Sınıf',
    playCount: 4210,
    items: [
      { id: '1', question: '6 x 7 = ?', answer: '42' },
      { id: '2', question: '8 x 9 = ?', answer: '72' },
      { id: '3', question: '7 x 8 = ?', answer: '56' },
      { id: '4', question: '9 x 9 = ?', answer: '81' },
      { id: '5', question: '7 x 6 = ?', answer: '42' },
      { id: '6', question: '8 x 4 = ?', answer: '32' },
      { id: '7', question: '9 x 7 = ?', answer: '63' },
      { id: '8', question: '6 x 8 = ?', answer: '48' },
    ],
  },
  {
    id: 'act_whack',
    title: 'Çarpım Tablosu Köstebek Vurmaca',
    description: 'Doğru sonucu taşıyan köstebeklere hızla vurarak puanları toplayın.',
    templateType: 'whack',
    subject: 'Matematik',
    gradeLevel: '3-4. Sınıf',
    playCount: 5200,
    items: [
      { id: '1', question: '7 x 8 = ?', answer: '56', options: ['56', '54', '48', '64'] },
      { id: '2', question: '6 x 9 = ?', answer: '54', options: ['54', '45', '63', '56'] },
      { id: '3', question: '8 x 8 = ?', answer: '64', options: ['64', '56', '72', '62'] },
      { id: '4', question: '9 x 9 = ?', answer: '81', options: ['81', '72', '89', '90'] },
      { id: '5', question: '7 x 7 = ?', answer: '49', options: ['49', '42', '56', '47'] },
    ],
  },
  {
    id: 'act_airplane',
    title: 'Fen Bilgisi Uçakla Doğru Bulut',
    description: 'Uçağınızı yönlendirerek doğru cevabı taşıyan bulutun içinden geçin.',
    templateType: 'airplane',
    subject: 'Fen Bilimleri',
    gradeLevel: '5. Sınıf',
    playCount: 3890,
    items: [
      { id: '1', question: 'Hangisi asal sayıdır?', answer: '13', options: ['13', '9', '15'] },
      { id: '2', question: 'Güneş sisteminin en büyük gezegeni hangisidir?', answer: 'Jüpiter', options: ['Jüpiter', 'Mars', 'Venüs'] },
      { id: '3', question: 'Hangisi yenilenebilir enerji kaynağıdır?', answer: 'Güneş', options: ['Güneş', 'Kömür', 'Petrol'] },
      { id: '4', question: 'Suyun donma noktası kaç derecedir?', answer: '0°C', options: ['0°C', '100°C', '-10°C'] },
    ],
  },
  {
    id: 'act_hangman',
    title: 'Gizli Kelime Kurtarma (Astronomi)',
    description: 'Harfleri tahmin ederek uzay ve astronomi kavramlarını kurtarın.',
    templateType: 'hangman',
    subject: 'Fen Bilimleri',
    gradeLevel: '6. Sınıf',
    playCount: 4610,
    items: [
      { id: '1', question: 'Güneş etrafında dolanan gök cisimleri', answer: 'GEZEGEN' },
      { id: '2', question: 'Dünya’nın tek doğal uydusu', answer: 'AY' },
      { id: '3', question: 'Kızıl gezegen olarak bilinen komşu gezegen', answer: 'MARS' },
      { id: '4', question: 'Işık saçan dev gaz küresi gök cisimleri', answer: 'YILDIZ' },
    ],
  },
  {
    id: 'act_truefalse',
    title: 'Doğru mu Yanlış mı? (Fen & Genel Kültür)',
    description: 'Ekrana gelen ifadelere hızlıca Doğru ya da Yanlış kararı verin.',
    templateType: 'truefalse',
    subject: 'Genel Kültür',
    gradeLevel: 'Tüm Seviyeler',
    playCount: 3950,
    items: [
      { id: '1', question: 'Dünya, Güneş etrafındaki dönüşünü 365 gün 6 saatte tamamlar.', answer: 'Doğru' },
      { id: '2', question: 'Işık hızı sesteş hızdan daha yavaştır.', answer: 'Yanlış' },
      { id: '3', question: 'Bitkiler gündüzleri fotosentez yaparak oksijen üretir.', answer: 'Doğru' },
      { id: '4', question: 'Ay bir ışık kaynağıdır.', answer: 'Yanlış' },
      { id: '5', question: 'Su 100°C deniz seviyesinde kaynar.', answer: 'Doğru' },
    ],
  },
  {
    id: 'act_balloon',
    title: 'Balon Patlatma (Matematik & Üslü Sayılar)',
    description: 'Doğru sonucu taşıyan balona dokunarak hızla patlatın.',
    templateType: 'balloon',
    subject: 'Matematik',
    gradeLevel: '5. Sınıf',
    playCount: 4890,
    items: [
      { id: '1', question: '3² (Üçün karesi) kaçtır?', answer: '9', options: ['9', '6', '12', '8'] },
      { id: '2', question: '4² (Dördün karesi) kaçtır?', answer: '16', options: ['16', '8', '24', '12'] },
      { id: '3', question: '2³ (İkinin küpü) kaçtır?', answer: '8', options: ['8', '6', '16', '10'] },
      { id: '4', question: '5² (Beşin karesi) kaçtır?', answer: '25', options: ['25', '10', '20', '30'] },
    ],
  },
  {
    id: 'act_cardsort',
    title: 'Bilgi Kartı Destesi (İngilizce Kelimeler)',
    description: 'Kartları çevirerek İngilizce kelimeleri ve Türkçe anlamlarını pekiştirin.',
    templateType: 'cardsort',
    subject: 'İngilizce',
    gradeLevel: '4-5. Sınıf',
    playCount: 5120,
    items: [
      { id: '1', question: 'Apple', answer: 'Elma', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&auto=format&fit=crop&q=80' },
      { id: '2', question: 'Book', answer: 'Kitap', image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=400&auto=format&fit=crop&q=80' },
      { id: '3', question: 'School', answer: 'Okul' },
      { id: '4', question: 'Teacher', answer: 'Öğretmen' },
      { id: '5', question: 'Friend', answer: 'Arkadaş' },
    ],
  },
  {
    id: 'act_categorize',
    title: 'Maddenin Halleri (Kutulara Düşürme)',
    description: 'Verilen maddeleri Katı, Sıvı ve Gaz kutularına fizik kurallarıyla yerçekimiyle düşürün.',
    templateType: 'categorize',
    subject: 'Fen Bilimleri',
    gradeLevel: '4. Sınıf',
    playCount: 4320,
    categories: ['Katı', 'Sıvı', 'Gaz'],
    boxImages: {
      'Katı': 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&auto=format&fit=crop&q=80',
      'Sıvı': 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80',
      'Gaz': 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&auto=format&fit=crop&q=80',
    },
    items: [
      { id: '1', question: 'Buz', answer: 'Katı', image: 'https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?w=400&auto=format&fit=crop&q=80' },
      { id: '2', question: 'Su', answer: 'Sıvı', image: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=400&auto=format&fit=crop&q=80' },
      { id: '3', question: 'Su Buharı', answer: 'Gaz' },
      { id: '4', question: 'Demir Çivi', answer: 'Katı' },
      { id: '5', question: 'Zeytinyağı', answer: 'Sıvı' },
      { id: '6', question: 'Helyum', answer: 'Gaz', image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400&auto=format&fit=crop&q=80' },
    ],
  },
  {
    id: 'act_wordsearch',
    title: 'Kelime Avı (Vücudumuzun Organları)',
    description: 'Harf tablosunda gizlenmiş organ isimlerini bulun.',
    templateType: 'wordsearch',
    subject: 'Fen Bilimleri',
    gradeLevel: '4. Sınıf',
    playCount: 3820,
    items: [
      { id: '1', question: 'Kan pompalayan organ', answer: 'KALP' },
      { id: '2', question: 'Solunum organımız', answer: 'AKCİĞER' },
      { id: '3', question: 'Sindirimin başladığı yer', answer: 'AĞIZ' },
      { id: '4', question: 'Düşünme ve yönetim merkezi', answer: 'BEYİN' },
    ],
  },
  {
    id: 'act_timeline',
    title: 'Kurtuluş Savaşı Kronolojisi (Zaman Çizelgesi)',
    description: 'Olayları kronolojik gerçekleşme sırasına göre baştan sona dizin.',
    templateType: 'timeline',
    subject: 'Sosyal Bilgiler',
    gradeLevel: '5. Sınıf',
    playCount: 4720,
    items: [
      { id: '1', question: 'Atatürk’ün Samsun’a Çıkışı (19 Mayıs 1919)', answer: '1' },
      { id: '2', question: 'Amasya Genelgesi (22 Haziran 1919)', answer: '2' },
      { id: '3', question: 'Erzurum Kongresi (23 Temmuz 1919)', answer: '3' },
      { id: '4', question: 'Sivas Kongresi (4 Eylül 1919)', answer: '4' },
      { id: '5', question: 'TBMM’nin Açılışı (23 Nisan 1920)', answer: '5' },
      { id: '6', question: 'Cumhuriyetin İlanı (29 Ekim 1923)', answer: '6' },
    ],
  },
  {
    id: 'act_dragword',
    title: 'Cümle İçi Boşluk Doldurma (Türkçe Dilbilgisi)',
    description: 'Cümledeki boşluğa uygun olan sözcük kartını seçin.',
    templateType: 'dragword',
    subject: 'Türkçe',
    gradeLevel: '4. Sınıf',
    playCount: 4410,
    items: [
      { id: '1', question: 'Türkiye’nin başkenti ___ şehridir.', answer: 'Ankara', options: ['Ankara', 'İstanbul', 'İzmir', 'Bursa'] },
      { id: '2', question: 'Güneş ___ doğar ve batıdan batar.', answer: 'doğudan', options: ['doğudan', 'kuzeyden', 'güneyden'] },
      { id: '3', question: 'Sonbaharda ağaçların yaprakları ___.', answer: 'sararır', options: ['sararır', 'yeşerir', 'çiçek açar'] },
      { id: '4', question: 'Cumhuriyetimiz ___ yılında ilan edilmiştir.', answer: '1923', options: ['1923', '1920', '1919', '1938'] },
    ],
  },
];

export interface TemplateDefinition {
  type: TemplateType;
  name: string;
  category:
    | 'Şans & Seçim'
    | 'Bilgi Yarışması'
    | 'Eşleştirme & Bellek'
    | 'Kelime & Mantık'
    | 'Hızlı Karar'
    | 'Sıralama & Mantık';
  description: string;
  tags: string[];
  icon: React.ComponentType<{ size?: number; className?: string }>;
  accentColor: string;
  badgeBg: string;
}

export const EDUCATIONAL_TEMPLATES: TemplateDefinition[] = [
  // 1. Çarkıfelek
  {
    type: 'wheel',
    name: 'Çarkıfelek (Dönen Çark)',
    category: 'Şans & Seçim',
    description: 'Sınıf içi soru, terim veya rastgele öğrenci seçimi için dönen çark. Akıllı tahtada dersi anında hareketlendirir.',
    tags: ['Akıllı Tahta', 'Şans & Seçim', 'Sözlü Yoklama'],
    icon: RotateCw,
    accentColor: 'text-rose-600',
    badgeBg: 'bg-rose-50 border-rose-200 text-rose-700',
  },
  // 2. Hafıza Kartları
  {
    type: 'memory',
    name: 'Hafıza Kartları (3D Eşleştirme)',
    category: 'Eşleştirme & Bellek',
    description: 'Terim ve tanımları eşleştirmek için 3D çevrilebilen kapalı kartlar. Görsel ve kavramsal hafızayı güçlendirir.',
    tags: ['3D Çevirme', 'Kavram Eşleme', 'Görsel Bellek'],
    icon: Layers,
    accentColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
  // 3. Süreli Hızlı Quiz
  {
    type: 'quiz',
    name: 'Süreli Hızlı Quiz',
    category: 'Bilgi Yarışması',
    description: 'Geri sayım sayacına ve 4 seçeneğe sahip çoktan seçmeli yarışma. Hızlı düşünme ve anlık pekiştirme sağlar.',
    tags: ['Zaman Yarışı', 'Çoktan Seçmeli', 'Skor Tablosu'],
    icon: Zap,
    accentColor: 'text-blue-600',
    badgeBg: 'bg-blue-50 border-blue-200 text-blue-700',
  },
  // 4. Gizemli Kutular
  {
    type: 'box',
    name: 'Gizemli Kutular (Kutu Açma)',
    category: 'Şans & Seçim',
    description: '1’den 20’ye numaralandırılmış kutular. Öğrenci bir kutu seçer; içinden soru, görev veya sürpriz ödül çıkar.',
    tags: ['Numaralı Kutular', 'Sürpriz Görev', 'Sınıf Heyecanı'],
    icon: Package,
    accentColor: 'text-amber-600',
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-700',
  },
  // 5. Anagram
  {
    type: 'anagram',
    name: 'Anagram (Harf Sıralama)',
    category: 'Kelime & Mantık',
    description: 'Karışık verilen harf bloklarını sıraya dizerek ders kavramını tamamlama. Sözcük dağarcığını ve yazımı pekiştirir.',
    tags: ['Kelime & İmla', 'Harf Sıralama', 'Dil Becerisi'],
    icon: CaseSensitive,
    accentColor: 'text-purple-600',
    badgeBg: 'bg-purple-50 border-purple-200 text-purple-700',
  },
  // 6. Doğru mu Yanlış mı?
  {
    type: 'truefalse',
    name: 'Doğru mu Yanlış mı?',
    category: 'Hızlı Karar',
    description: 'Ekrana gelen ifadelere hızlıca Doğru veya Yanlış kararı verme şablonu. Seri soru çözümü ve tekrar için mükemmeldir.',
    tags: ['Hızlı Tepki', 'Seri Karar', 'Puan Serisi'],
    icon: CheckCircle2,
    accentColor: 'text-teal-600',
    badgeBg: 'bg-teal-50 border-teal-200 text-teal-700',
  },
  // 7. Kutulara Düşürme & Gruplandırma
  {
    type: 'categorize',
    name: 'Kutulara Düşürme & Gruplandırma',
    category: 'Eşleştirme & Bellek',
    description: 'Yukarıdaki topu alıp yerçekimi ve fizik kurallarıyla doğru kutuya bırakma ve sınıflandırma oyunu.',
    tags: ['Fizik Motoru', 'Kutuya Düşür', 'Sınıflandırma'],
    icon: FolderTree,
    accentColor: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 border-indigo-200 text-indigo-700',
  },
  // 8. Kelime Avı (Kare Bulmaca)
  {
    type: 'wordsearch',
    name: 'Kelime Avı (Kare Bulmaca)',
    category: 'Kelime & Mantık',
    description: 'Harf matrisinde yatay, dikey ve çapraz gizlenmiş ders kavramlarını bulup işaretleme oyunu.',
    tags: ['Kare Bulmaca', 'Gizli Terim', 'Fosforlu Çizgi'],
    icon: Search,
    accentColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
  // 10. Gizli Kelime (Adam Asmaca)
  {
    type: 'hangman',
    name: 'Gizli Kelime (Kelime Kurtarma)',
    category: 'Kelime & Mantık',
    description: 'Harf harf tahmin ederek ders kavramını ortaya çıkarma şablonu. Can hakkı ve ipuçlarıyla heyecan yaratır.',
    tags: ['Harf Tahmini', 'Kelime Kurtarma', 'Can Barı'],
    icon: Heart,
    accentColor: 'text-rose-600',
    badgeBg: 'bg-rose-50 border-rose-200 text-rose-700',
  },
  // 11. Köstebek Vurmaca / Hedef Bulma
  {
    type: 'whack',
    name: 'Köstebek Vurmaca (Hedef)',
    category: 'Hızlı Karar',
    description: 'Ekranda beliren deliklerden doğru cevabı taşıyan hedefe hızlıca dokunup puan toplama yarışması.',
    tags: ['Refleks', 'Hedef Vurma', 'Hızlı Tepki'],
    icon: Hammer,
    accentColor: 'text-amber-600',
    badgeBg: 'bg-amber-50 border-amber-200 text-amber-700',
  },
  // 12. Uçakla Doğru Bulut
  {
    type: 'airplane',
    name: 'Uçakla Doğru Bulut',
    category: 'Bilgi Yarışması',
    description: 'Uçağı yönlendirerek doğru cevabı taşıyan bulutun içinden geçme ve engellerden kaçma oyunu.',
    tags: ['Uçuş Oyunu', 'Bulutlar', 'Akıcı Macera'],
    icon: Plane,
    accentColor: 'text-sky-600',
    badgeBg: 'bg-sky-50 border-sky-200 text-sky-700',
  },
  // 13. Balon Patlatma
  {
    type: 'balloon',
    name: 'Balon Patlatma',
    category: 'Hızlı Karar',
    description: 'Yukarı doğru süzülen renkli balonlardan doğru cevabı taşıyana dokunarak patlatma oyunu.',
    tags: ['Balonlar', 'Görsel Hız', 'Dokunmatik Tahta'],
    icon: Sparkles,
    accentColor: 'text-fuchsia-600',
    badgeBg: 'bg-fuchsia-50 border-fuchsia-200 text-fuchsia-700',
  },
  // 14. Kronolojik Sıralama
  {
    type: 'timeline',
    name: 'Zaman Çizelgesi & Sıralama',
    category: 'Sıralama & Mantık',
    description: 'Tarihsel olayları, fen adımlarını veya büyüklükleri soldan sağa doğru kronolojik sıraya dizme.',
    tags: ['Zaman Çizelgesi', 'Kronoloji', 'Süreç Adımları'],
    icon: Clock,
    accentColor: 'text-orange-600',
    badgeBg: 'bg-orange-50 border-orange-200 text-orange-700',
  },
  // 15. Boşluk Doldurma
  {
    type: 'dragword',
    name: 'Cümle İçi Boşluk Doldurma',
    category: 'Kelime & Mantık',
    description: 'Metin içerisindeki eksik bırakılmış yerlere doğru kelime kartlarını sürükleyip yerleştirme.',
    tags: ['Cümle Tamamlama', 'Bağlam Kavrama', 'Sürükle-Bırak'],
    icon: FileText,
    accentColor: 'text-violet-600',
    badgeBg: 'bg-violet-50 border-violet-200 text-violet-700',
  },
  // 16. Kart Destesi (Flashcard)
  {
    type: 'cardsort',
    name: 'Bilgi Kartı Destesi (Flashcard)',
    category: 'Şans & Seçim',
    description: 'Ön yüzünde soru, arka yüzünde cevap bulunan kartları sırayla çevirerek hızlı tekrar yapma şablonu.',
    tags: ['Flashcard', 'Özet Tekrar', 'Akıcı Kartlar'],
    icon: BookOpen,
    accentColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  },
];

interface TemplateGridProps {
  onPlayActivity: (activity: Activity) => void;
  onCreateWithTemplate: (templateType: TemplateType) => void;
}

export const TemplateGrid: React.FC<TemplateGridProps> = ({
  onPlayActivity,
  onCreateWithTemplate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [hoveredType, setHoveredType] = useState<TemplateType | null>(null);

  const categories = [
    'Tümü',
    'Şans & Seçim',
    'Bilgi Yarışması',
    'Eşleştirme & Bellek',
    'Kelime & Mantık',
    'Hızlı Karar',
    'Sıralama & Mantık',
  ];

  const filtered = EDUCATIONAL_TEMPLATES.filter((t) => {
    const matchesCategory = selectedCategory === 'Tümü' || t.category === selectedCategory;
    const matchesSearch = searchQuery.trim() === '' ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleQuickPreview = (type: TemplateType) => {
    const sample = SAMPLE_ACTIVITIES.find((a) => a.templateType === type) || SAMPLE_ACTIVITIES[0];
    onPlayActivity(sample);
  };

  return (
    <section id="templates" className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-20 bg-slate-50/70 border-b border-slate-200/80">
      {/* Anchor for both #templates and #explore */}
      <span id="explore" className="relative -top-24 block" />

      {/* Section Header */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 mb-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-blue-700 bg-blue-50 border border-blue-200 mb-3 shadow-xs">
            <Sparkles size={14} className="text-amber-500" />
            <span>16+ Zengin Eğitim Şablonu</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight font-display">
            Eğitim Oyunu Şablon Kataloğu
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2 leading-relaxed">
            Dersinize uygun şablonu seçin; kendi sorularınızı ekleyin. Kartların üzerine gelerek <strong>canlı oyun mekaniği önizlemesini</strong> izleyebilir, tek tıkla test edebilirsiniz.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="w-full md:w-72 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Şablon veya konu ara..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600"
            >
              Temizle
            </button>
          )}
        </div>
      </div>

      {/* Filter Pills with Counts (Horizontally scrollable on mobile with touch swiping) */}
      <div className="flex items-center gap-2 mb-8 sm:mb-10 overflow-x-auto pb-2 sm:pb-0 scrollbar-none sm:flex-wrap">
        {categories.map((cat) => {
          const count = cat === 'Tümü'
            ? EDUCATIONAL_TEMPLATES.length
            : EDUCATIONAL_TEMPLATES.filter((t) => t.category === cat).length;

          return (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                  : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-xs'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedCategory === cat ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid of 16 Template Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filtered.map((tmpl) => {
          const isHovered = hoveredType === tmpl.type;
          const IconComp = tmpl.icon;

          return (
            <div
              key={tmpl.type}
              onMouseEnter={() => setHoveredType(tmpl.type)}
              onMouseLeave={() => setHoveredType(null)}
              className={`bg-white rounded-3xl p-4 flex flex-col justify-between border transition-all duration-300 group ${
                isHovered
                  ? 'border-blue-400 shadow-xl shadow-blue-500/10 -translate-y-1.5'
                  : 'border-slate-200 shadow-sm hover:border-slate-300'
              }`}
            >
              {/* Card Top: Animated Preview Box */}
              <div>
                <div
                  onClick={() => handleQuickPreview(tmpl.type)}
                  className="cursor-pointer relative group/preview"
                  title="Şablonu İncele"
                >
                  <TemplateCardPreview templateType={tmpl.type} isHovered={isHovered} />
                </div>

                {/* Category & Tags */}
                <div className="flex items-center justify-between mt-4 mb-2.5">
                  <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold border ${tmpl.badgeBg}`}>
                    {tmpl.category}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold">
                    <span title="Akıllı Tahta Uyumlu">
                      <Monitor size={13} className="text-blue-500" />
                    </span>
                    <span title="Mobil Uyumlu">
                      <Smartphone size={13} className="text-emerald-500" />
                    </span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-base font-extrabold text-slate-900 mb-1.5 flex items-center gap-2 group-hover:text-blue-600 transition-colors">
                  <IconComp size={18} className={tmpl.accentColor} />
                  <span>{tmpl.name}</span>
                </h3>

                {/* Description */}
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                  {tmpl.description}
                </p>

                {/* Tag Pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {tmpl.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Bottom: Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleQuickPreview(tmpl.type)}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Play size={12} className="fill-white" />
                  <span>Önizle</span>
                </button>
                <button
                  onClick={() => onCreateWithTemplate(tmpl.type)}
                  title="Kendi Sorularınla Bu Şablondan Etkinlik Üret"
                  className="py-2.5 px-3 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center gap-1.5 transition-colors active:scale-95 cursor-pointer"
                >
                  <PlusCircle size={14} className="text-blue-600" />
                  <span>Üret</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
