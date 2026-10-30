import { useState, useEffect } from 'react';
import { Smartphone, School } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { HeroSlider } from './components/HeroSlider';
import { PlatformInfoSection } from './components/PlatformInfoSection';
import { TemplateGrid, SAMPLE_ACTIVITIES } from './components/TemplateGrid';
import { MobileAppShowcase } from './components/MobileAppShowcase';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { GameModal } from './components/GameModal';
import { TeacherDashboard } from './components/TeacherDashboard';
import { ActivityStudio } from './components/ActivityStudio';
import { authService, type User as AuthUser } from './services/authService';
import { dashboardService } from './services/dashboardService';
import type { Activity, TemplateType } from './types/game';

// Synchronously parse URL params before first render to eliminate any flash of the landing page
const getInitialUrlParams = () => {
  if (typeof window === 'undefined') {
    return {
      isEmbed: false,
      initialView: 'landing' as const,
      template: null as TemplateType | null,
      play: null as string | null,
      game: null as TemplateType | null,
      token: null as string | null,
    };
  }

  const params = new URLSearchParams(window.location.search);
  const embedParam = params.get('embed') === 'true';
  const viewParam = params.get('view') as 'landing' | 'dashboard' | 'studio' | null;
  const gameParam = params.get('game') as TemplateType | null;
  const playParam = params.get('play');
  const templateParam = params.get('template') as TemplateType | null;
  const tokenParam = params.get('token');

  if (embedParam) {
    document.body.classList.add('is-embed');
  }

  if (tokenParam) {
    localStorage.setItem('sinif_bulutu_token', tokenParam);
  }

  let initialView: 'landing' | 'dashboard' | 'studio' = 'landing';
  if (viewParam && ['landing', 'dashboard', 'studio'].includes(viewParam)) {
    initialView = viewParam;
  } else if (embedParam && !playParam && !gameParam) {
    // If embedded without a game play request, immediately default to studio
    initialView = 'studio';
  } else {
    const stored = authService.getStoredUser();
    initialView = stored?.role === 'teacher' ? 'dashboard' : 'landing';
  }

  return {
    isEmbed: embedParam,
    initialView,
    template: templateParam,
    play: playParam,
    game: gameParam,
    token: tokenParam,
  };
};

const initialUrlState = getInitialUrlParams();

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getStoredUser());
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'studio'>(initialUrlState.initialView);
  const [isEmbed] = useState(initialUrlState.isEmbed);
  const [studioActivity, setStudioActivity] = useState<Activity | null>(() => {
    if (initialUrlState.template) {
      const sample = SAMPLE_ACTIVITIES.find((a) => a.templateType === initialUrlState.template);
      if (sample) {
        return {
          ...sample,
          id: `act_${Date.now()}`,
          title: `${sample.title} (Yeni)`,
        };
      }
    }
    return null;
  });
  const [activeActivity, setActiveActivity] = useState<Activity | null>(() => {
    if (initialUrlState.play) {
      return SAMPLE_ACTIVITIES.find((a) => a.id === initialUrlState.play) || null;
    }
    if (initialUrlState.game) {
      return SAMPLE_ACTIVITIES.find((a) => a.templateType === initialUrlState.game) || null;
    }
    return null;
  });
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Auth state listener
  useEffect(() => {
    const handleAuthChange = () => {
      const user = authService.getStoredUser();
      const prevUser = currentUser;
      setCurrentUser(user);

      if (user && !prevUser && !isEmbed) {
        // Just logged in on web -> transition to dashboard
        setCurrentView('dashboard');
      } else if (!user && prevUser && !isEmbed) {
        // Logged out on web -> transition to landing
        setCurrentView('landing');
      }
    };

    window.addEventListener('auth_state_changed', handleAuthChange);
    return () => window.removeEventListener('auth_state_changed', handleAuthChange);
  }, [currentUser, isEmbed]);

  // Sync token authentication with backend in background if token was provided in URL
  useEffect(() => {
    if (initialUrlState.token) {
      authService.getMe().then((user) => {
        if (user) setCurrentUser(user);
      });
    }

    // Global listener: Pause/mute all Web Audio when page is hidden or mobile app sends pause
    const handleVisibility = () => {
      if (document.hidden) {
        window.dispatchEvent(new CustomEvent('app_pause_audio'));
      }
    };
    const handleMsg = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data?.type === 'PAUSE_ALL_AUDIO' || data?.type === 'APP_PAUSE_AUDIO') {
          window.dispatchEvent(new CustomEvent('app_pause_audio'));
        }
      } catch {}
    };

    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('message', handleMsg);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('message', handleMsg);
    };
  }, []);

  const handleCreateWithTemplate = (type: TemplateType) => {
    const sample = SAMPLE_ACTIVITIES.find((a) => a.templateType === type);
    if (sample) {
      setStudioActivity({
        ...sample,
        id: `act_${Date.now()}`,
        title: `${sample.title} (Yeni)`,
      });
    } else {
      setStudioActivity(null);
    }
    setCurrentView('studio');
  };

  const openAuth = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  // If in pure embed mode for standalone game play
  if (isEmbed && activeActivity && currentView !== 'studio') {
    return (
      <GameModal
        activity={activeActivity}
        onClose={() => {
          if ((window as any)?.ReactNativeWebView) {
            (window as any).ReactNativeWebView.postMessage(
              JSON.stringify({ type: 'CLOSE_GAME' })
            );
          }
        }}
        isEmbed={true}
      />
    );
  }

  // Fullscreen Activity Studio (Split Screen: Form on Left, Live Playable Preview on Right)
  if (currentView === 'studio') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col">
        <ActivityStudio
          initialActivity={studioActivity}
          isTestingFullscreen={!!activeActivity}
          onBack={() => {
            if (isEmbed && (window as any)?.ReactNativeWebView) {
              (window as any).ReactNativeWebView.postMessage(
                JSON.stringify({ type: 'CLOSE_STUDIO' })
              );
            } else {
              setCurrentView('dashboard');
            }
          }}
          onSave={async (activity) => {
            try {
              await dashboardService.saveActivity(activity);
            } catch (err) {
              console.warn('Activity save note:', err);
            }
            if (isEmbed && (window as any)?.ReactNativeWebView) {
              (window as any).ReactNativeWebView.postMessage(
                JSON.stringify({ type: 'ACTIVITY_SAVED', activity })
              );
            } else {
              setCurrentView('dashboard');
            }
          }}
          onPlayFullscreen={(activity) => setActiveActivity(activity)}
        />

        {/* Interactive Activity Player Modal (Tam Ekran Mobil Oyun Modu) */}
        {activeActivity && (
          <GameModal
            activity={activeActivity}
            onClose={() => setActiveActivity(null)}
            isEmbed={isEmbed}
            initialStarted={false}
            isMobileGameMode={true}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. Navbar with sticky solid light styling and View switching (Hidden when game is playing) */}
      {!activeActivity && (
        <Navbar
          currentView={currentView}
          onNavigateView={(view) => setCurrentView(view)}
          onDownloadClick={() => {
            if (currentView !== 'landing') {
              setCurrentView('landing');
              setTimeout(() => {
                document.getElementById('mobile-app')?.scrollIntoView({ behavior: 'smooth' });
              }, 100);
            } else {
              document.getElementById('mobile-app')?.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          onLoginClick={() => openAuth('login')}
          onRegisterClick={() => openAuth('register')}
        />
      )}

      <main className="flex-1">
        {/* VIEW 1: DASHBOARD (Teacher Management Portal) */}
        {currentView === 'dashboard' ? (
          <div className="pt-20 sm:pt-24 pb-8 min-h-[calc(100vh-140px)]">
            {currentUser?.role === 'teacher' ? (
              <TeacherDashboard
                onOpenStudio={(activity) => {
                  setStudioActivity(activity || null);
                  setCurrentView('studio');
                }}
                onPlayActivity={(activity) => setActiveActivity(activity)}
              />
            ) : currentUser?.role === 'student' ? (
              /* Student Notice Screen: Web is exclusively for teachers */
              <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Smartphone size={32} />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-3">
                  <span>Öğrenci Portalı Mobil Uygulamadadır</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 font-display">
                  Sınıf Bulutu Web Sürümü Öğretmenlere Özeldir
                </h2>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed max-w-md mx-auto">
                  Merhaba <strong className="text-slate-800">{currentUser.firstName}</strong>! Web sitemiz sadece öğretmenlerin sınıf yönetimi ve etkinlik üretimi içindir. Ödevlerinizi teslim etmek ve oyunları oynamak için lütfen <strong>Sınıf Bulutu Mobil Uygulamasını</strong> kullanın.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setCurrentView('landing');
                      setTimeout(() => {
                        document.getElementById('mobile-app')?.scrollIntoView({ behavior: 'smooth' });
                      }, 100);
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Smartphone size={16} />
                    <span>Mobil Uygulamayı İndir</span>
                  </button>
                  <button
                    onClick={() => {
                      authService.logout();
                      openAuth('login');
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-full font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <School size={16} className="text-blue-600" />
                    <span>Öğretmen Hesabıyla Giriş Yap</span>
                  </button>
                </div>
              </div>
            ) : (
              // If not logged in yet but clicked panel
              <div className="max-w-xl mx-auto px-4 py-20 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <School size={30} />
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-bold mb-3">
                  <span>Öğretmen Yönetim Portalı</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-2 font-display">
                  Öğretmen Paneline Giriş Yapın
                </h2>
                <p className="text-sm text-slate-600 mb-6 leading-relaxed max-w-md mx-auto">
                  Sınıflarınızı oluşturmak, öğrencilerinize ödevler vermek ve akıllı tahta oyunları hazırlamak için öğretmen hesabınızla giriş yapın.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => openAuth('login')}
                    className="px-6 py-2.5 rounded-full font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Öğretmen Girişi
                  </button>
                  <button
                    onClick={() => openAuth('register')}
                    className="px-6 py-2.5 rounded-full font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer"
                  >
                    Yeni Hesap Oluştur
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* VIEW 2: LANDING PAGE (Web Vitrini & Tanıtım) */
          <>
            {/* 2. Full-Screen Hero Slider */}
            <section id="hero" className="w-full">
              <HeroSlider />
            </section>

            {/* 3. Platform Information & Value Proposition Section */}
            <div id="ozellikler">
              <PlatformInfoSection />
            </div>

            {/* 4. Interactive Template Catalog Showcase & Quick Play */}
            <div id="templates">
              <TemplateGrid
                onPlayActivity={(activity) => setActiveActivity(activity)}
                onCreateWithTemplate={handleCreateWithTemplate}
              />
            </div>

            {/* 5. Mobile App Download & Features Showcase */}
            <div id="mobile-app">
              <MobileAppShowcase />
            </div>

            {/* 6. Frequently Asked Questions (SSS) */}
            <div id="sss">
              <FaqSection />
            </div>
          </>
        )}
      </main>

      {/* 7. Footer (Hidden when game is playing) */}
      {!activeActivity && <Footer />}

      {/* Interactive Activity Player Modal (Clean Light Theme & Fullscreen) */}
      {activeActivity && (
        <GameModal
          activity={activeActivity}
          onClose={() => setActiveActivity(null)}
          isEmbed={isEmbed}
        />
      )}

      {/* Auth Modal (Login / Register) */}
      {authModalOpen && (
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authModalMode}
          onClose={() => setAuthModalOpen(false)}
        />
      )}
    </div>
  );
}
