export interface HeroSlideCta {
  text: string;
  href: string;
  isAppStore?: boolean;
  isGooglePlay?: boolean;
}

export interface HeroSlide {
  id: number;
  badge: string;
  title: string;
  text: string;
  primaryCta?: HeroSlideCta;
  secondaryCta?: HeroSlideCta;
  appStoreButtons?: boolean;
  desktopImage: string;
  mobileImage: string;
  fallbackImage?: string;
  fallbackGradient: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    badge: 'Yeni Nesil Sınıf Yönetimi',
    title: 'Sınıfın artık cebinde',
    text: 'Ödev ver, teslim al, not ver. Hepsi tek bir bulutta.',
    primaryCta: {
      text: 'Ücretsiz Başla',
      href: '#basla',
    },
    secondaryCta: {
      text: 'Nasıl Çalışır?',
      href: '#nasil-calisir',
    },
    desktopImage: '/hero/slide-1.webp',
    mobileImage: '/hero/slide-1-mobile.webp',
    fallbackImage: '/assets/hero-slides/1.png',
    fallbackGradient: 'linear-gradient(135deg, #0B0F19 0%, #1E1B4B 45%, #1D4ED8 80%, #0284C7 100%)',
  },
  {
    id: 2,
    badge: 'Öğretmenler İçin',
    title: 'Ödevi saniyeler içinde ver',
    text: 'Sınıf kodunu paylaş, ödevi oluştur, öğrencilerin anında bildirim alsın.',
    primaryCta: {
      text: 'Öğretmen Olarak Başla',
      href: '#ogretmen-basla',
    },
    desktopImage: '/hero/slide-2.webp',
    mobileImage: '/hero/slide-2-mobile.webp',
    fallbackImage: '/assets/hero-slides/2.png',
    fallbackGradient: 'linear-gradient(135deg, #0B0F19 0%, #311042 45%, #1E3A8A 80%, #0369A1 100%)',
  },
  {
    id: 3,
    badge: 'Mobil Öğrenci Deneyimi',
    title: 'Öğrencileriniz Mobil Uygulamayla Katılsın',
    text: 'Siz web panelinden ödev ve oyunları hazırlayın; öğrenciler mobil uygulamadan eğlenceli oyunlarla ödev teslim etsin.',
    primaryCta: {
      text: 'Mobil Uygulamayı İncele',
      href: '#mobile-app',
    },
    desktopImage: '/hero/slide-3.webp',
    mobileImage: '/hero/slide-3-mobile.webp',
    fallbackImage: '/assets/hero-slides/3.png',
    fallbackGradient: 'linear-gradient(135deg, #0B0F19 0%, #142850 45%, #1E40AF 80%, #0284C7 100%)',
  },
  {
    id: 4,
    badge: 'Not ve Geri Bildirim',
    title: 'Notun ve yorumun anında cebinde',
    text: 'Puanını ve öğretmeninin geri bildirimini hemen gör, gelişimini takip et.',
    primaryCta: {
      text: 'Özellikleri Keşfet',
      href: '#ozellikler',
    },
    desktopImage: '/hero/slide-4.webp',
    mobileImage: '/hero/slide-4-mobile.webp',
    fallbackImage: '/assets/hero-slides/1.png',
    fallbackGradient: 'linear-gradient(135deg, #0B0F19 0%, #1E1B4B 40%, #2563EB 75%, #06B6D4 100%)',
  },
  {
    id: 5,
    badge: 'Akıllı Hatırlatma',
    title: 'Hiçbir teslim tarihini kaçırma',
    text: 'Bildirimler ve takvim sayesinde ödevlerin her zaman kontrol altında.',
    primaryCta: {
      text: 'Özellikleri Keşfet',
      href: '#ozellikler',
    },
    desktopImage: '/hero/slide-5.webp',
    mobileImage: '/hero/slide-5-mobile.webp',
    fallbackImage: '/assets/hero-slides/2.png',
    fallbackGradient: 'linear-gradient(135deg, #0B0F19 0%, #2E1065 40%, #1D4ED8 75%, #0EA5E9 100%)',
  },
  {
    id: 6,
    badge: 'Topluluk',
    title: 'Bir sınıf, tek bir bulut',
    text: 'Ödevler, duyurular ve yorumlar öğretmen ve öğrencileri aynı yerde buluşturur.',
    primaryCta: {
      text: 'Hemen Katıl',
      href: '#hemen-katil',
    },
    desktopImage: '/hero/slide-6.webp',
    mobileImage: '/hero/slide-6-mobile.webp',
    fallbackImage: '/assets/hero-slides/3.png',
    fallbackGradient: 'linear-gradient(135deg, #0B0F19 0%, #1E1B4B 45%, #1E3A8A 80%, #0284C7 100%)',
  },
  {
    id: 7,
    badge: 'Şimdi İndir',
    title: "Sınıf Bulutu'nu hemen indir",
    text: "iOS ve Android'de ücretsiz.",
    appStoreButtons: true,
    desktopImage: '/hero/slide-7.webp',
    mobileImage: '/hero/slide-7-mobile.webp',
    fallbackImage: '/assets/hero-slides/1.png',
    fallbackGradient: 'linear-gradient(135deg, #0B0F19 0%, #1E1B4B 40%, #3B82F6 75%, #06B6D4 100%)',
  },
];
