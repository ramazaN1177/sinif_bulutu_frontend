import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
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
import { StudentDashboard } from './components/StudentDashboard';
import { ActivityStudio } from './components/ActivityStudio';
import { authService, type User as AuthUser } from './services/authService';
import { dashboardService } from './services/dashboardService';
import type { Activity, TemplateType } from './types/game';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getStoredUser());
  const [currentView, setCurrentView] = useState<'landing' | 'dashboard' | 'studio'>(() => {
    // If already logged in, launch directly to dashboard; else landing
    return authService.getStoredUser() ? 'dashboard' : 'landing';
  });
  const [studioActivity, setStudioActivity] = useState<Activity | null>(null);
  const [activeActivity, setActiveActivity] = useState<Activity | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [isEmbed, setIsEmbed] = useState(false);

  // Auth state listener
  useEffect(() => {
    const handleAuthChange = () => {
      const user = authService.getStoredUser();
      const prevUser = currentUser;
      setCurrentUser(user);

      if (user && !prevUser) {
        // Just logged in -> automatically transition to dashboard!
        setCurrentView('dashboard');
      } else if (!user && prevUser) {
        // Logged out -> transition to landing
        setCurrentView('landing');
      }
    };

    window.addEventListener('auth_state_changed', handleAuthChange);
    return () => window.removeEventListener('auth_state_changed', handleAuthChange);
  }, [currentUser]);

  // Check URL parameters for WebView embed or direct game play
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const embedParam = params.get('embed') === 'true';
    const gameParam = params.get('game') as TemplateType | null;
    const playParam = params.get('play');
    const viewParam = params.get('view') as 'landing' | 'dashboard' | 'studio' | null;

    if (embedParam) {
      setIsEmbed(true);
      document.body.classList.add('is-embed');
    }

    if (viewParam && ['landing', 'dashboard', 'studio'].includes(viewParam)) {
      setCurrentView(viewParam);
    }

    if (playParam) {
      const found = SAMPLE_ACTIVITIES.find((a) => a.id === playParam);
      if (found) {
        setActiveActivity(found);
      }
    } else if (gameParam) {
      const found = SAMPLE_ACTIVITIES.find((a) => a.templateType === gameParam);
      if (found) {
        setActiveActivity(found);
      }
    }
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

  // If in pure embed mode (React Native WebView inside mobile app)
  if (isEmbed && activeActivity) {
    return (
      <GameModal
        activity={activeActivity}
        onClose={() => {}}
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
          onBack={() => setCurrentView('dashboard')}
          onSave={async (activity) => {
            await dashboardService.saveActivity(activity);
            setCurrentView('dashboard');
          }}
          onPlayFullscreen={(activity) => setActiveActivity(activity)}
        />

        {/* Interactive Activity Player Modal */}
        {activeActivity && (
          <GameModal
            activity={activeActivity}
            onClose={() => setActiveActivity(null)}
            isEmbed={false}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* 1. Navbar with sticky solid light styling and View switching */}
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

      <main className="flex-1">
        {/* VIEW 1: DASHBOARD (Teacher or Student Panel) */}
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
              <StudentDashboard
                onPlayActivity={(activity) => setActiveActivity(activity)}
              />
            ) : (
              // If not logged in yet but clicked panel
              <div className="max-w-xl mx-auto px-4 py-20 text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
                  <Lock size={28} />
                </div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
                  Yönetim Paneline Giriş Yapın
                </h2>
                <p className="text-sm text-slate-600 mb-6">
                  Sınıflarınızı yönetmek, ödev vermek veya ödevlerinizi teslim etmek için lütfen öğretmen veya öğrenci hesabınızla oturum açın.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => openAuth('login')}
                    className="px-6 py-2.5 rounded-full font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 cursor-pointer"
                  >
                    Giriş Yap
                  </button>
                  <button
                    onClick={() => openAuth('register')}
                    className="px-6 py-2.5 rounded-full font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                  >
                    Kayıt Ol
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

      {/* 7. Footer */}
      <Footer />

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
