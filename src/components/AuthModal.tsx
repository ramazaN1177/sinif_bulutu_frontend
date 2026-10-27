import { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  School,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  UserCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { authService } from '../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  // Web application is strictly for teachers; students use the mobile app
  const role: 'teacher' = 'teacher';
  const [showTestAccounts, setShowTestAccounts] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const isTeacher = true;

  // REAL GOOGLE LOGIN via @react-oauth/google (opens official Google Account Picker popup)
  const triggerGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setErrorMessage(null);
      setMessage('Google profiliniz doğrulanıyor...');

      try {
        // 1. Fetch user info from Google OAuth API
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        if (!userInfoRes.ok) {
          throw new Error('Google profil bilgileri alınamadı.');
        }

        const googleUser = await userInfoRes.json();

        // 2. Send verified Google profile to backend /auth/google as teacher
        const user = await authService.googleAuth({
          email: googleUser.email,
          firstName: googleUser.given_name || googleUser.name || 'Öğretmen',
          lastName: googleUser.family_name || '',
          avatarUrl: googleUser.picture,
          googleId: googleUser.sub,
          role,
        });

        setMessage(`Hoş geldiniz ${user.firstName}! Öğretmen portalına giriş yapıldı.`);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 700);
      } catch (err: any) {
        setErrorMessage(err.message || 'Google ile giriş başarısız oldu.');
      } finally {
        setLoading(false);
      }
    },
    onError: (error) => {
      console.warn('Google Login Error:', error);
      setErrorMessage(
        'Google oturum açma penceresi açılamadı veya kapatıldı. (Google Cloud Console Credentials > Authorized JavaScript origins bölümünde http://localhost:5173 ve http://localhost adreslerinin ekli olduğundan emin olunuz).'
      );
    },
  });

  // Teacher preset accounts for instant testing
  const quickAccounts = [
    {
      name: 'Ahmet Yılmaz',
      email: 'ahmet.ogretmen@gmail.com',
      avatarColor: 'bg-blue-600',
    },
    {
      name: 'Zeynep Demir',
      email: 'zeynep.hoca@gmail.com',
      avatarColor: 'bg-purple-600',
    },
  ];

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      if (mode === 'login') {
        const user = await authService.login(email, password);
        setMessage(`Hoş geldiniz ${user.firstName}! Giriş başarılı.`);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 800);
      } else {
        const user = await authService.register({
          email,
          password,
          firstName,
          lastName,
          role: 'teacher',
        });
        setMessage(`Öğretmen hesabınız oluşturuldu ${user.firstName}! Giriş yapıldı.`);
        setTimeout(() => {
          if (onSuccess) onSuccess();
          onClose();
        }, 800);
      }
    } catch (err: any) {
      const msg = typeof err?.message === 'string' ? err.message : String(err || 'İşlem gerçekleştirilemedi. Lütfen bilgilerinizi kontrol edin.');
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAccountLogin = async (acc: { name: string; email: string }) => {
    setLoading(true);
    setErrorMessage(null);
    setMessage(null);

    const parts = acc.name.split(' ');
    const fName = parts[0] || 'Öğretmen';
    const lName = parts.slice(1).join(' ') || '';

    try {
      const user = await authService.googleAuth({
        email: acc.email,
        firstName: fName,
        lastName: lName,
        role: 'teacher',
      });

      setMessage(`Hoş geldiniz ${user.firstName}! Giriş başarılı.`);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
      }, 700);
    } catch (err: any) {
      setErrorMessage(err.message || 'Giriş yapılamadı.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl bg-white border border-slate-200 shadow-2xl text-slate-800 max-h-[95vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        {/* Logo & Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <img
            src="/sinif_bulutu_logo.png"
            alt="Sınıf Bulutu"
            className="w-14 h-14 object-contain mb-3 drop-shadow-sm"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-black mb-2 shadow-xs">
            <School size={14} className="text-blue-600" />
            <span>Öğretmen Portalı</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 font-display">
            {mode === 'login' ? 'Öğretmen Girişi' : 'Öğretmen Hesabı Oluştur'}
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            Sınıflarınızı yönetin, ödevler tanımlayın ve akıllı tahtaya uygun interaktif oyunlar üretin.
          </p>
        </div>

        {/* Success Alert */}
        {message && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2">
            <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        {/* REAL GOOGLE SIGN-IN BUTTON (PRIMARY GOOGLE ACTION) */}
        <div className="mb-5">
          <button
            type="button"
            disabled={loading}
            onClick={() => triggerGoogleLogin()}
            className="w-full py-3 px-4 rounded-2xl font-extrabold text-sm bg-white hover:bg-slate-50 text-slate-800 border-2 border-slate-200 hover:border-slate-300 shadow-sm flex items-center justify-center gap-3 transition-all active:scale-98 cursor-pointer group"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" className="shrink-0 group-hover:scale-105 transition-transform">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span>Google ile Giriş Yap</span>
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-slate-200" />
          <span className="px-3 text-xs font-semibold text-slate-400">veya e-posta ile</span>
          <div className="flex-1 h-px bg-slate-200" />
        </div>

        {/* STANDARD EMAIL & PASSWORD FORM */}
        <form onSubmit={handleStandardSubmit} className="space-y-3.5">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Ad</label>
                <input
                  type="text"
                  placeholder="Adınız"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Soyad</label>
                <input
                  type="text"
                  placeholder="Soyadınız"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-hidden"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">E-posta Adresi</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                placeholder={isTeacher ? 'ogretmen@okul.com' : 'ogrenci@okul.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-hidden"
                required
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-600">Şifre</label>
              {mode === 'register' && (
                <span className="text-[10px] text-slate-400 font-medium">En az 8 karakter</span>
              )}
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-3 text-slate-400" />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-blue-500 focus:bg-white focus:outline-hidden"
                required
                minLength={mode === 'register' ? 8 : 1}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
              isTeacher
                ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/25'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
            }`}
          >
            <span>
              {loading
                ? 'İşleniyor...'
                : mode === 'login'
                ? isTeacher
                  ? 'Öğretmen Olarak Giriş Yap'
                  : 'Öğrenci Olarak Giriş Yap'
                : 'Kayıt Ol'}
            </span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Test Accounts Accordion (Matching Mobile One-Tap Verification) */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowTestAccounts(!showTestAccounts)}
            className="w-full flex items-center justify-between text-left text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-1 cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <UserCheck size={14} className="text-blue-500" />
              <span>Hızlı Test Hesapları (Tek Tıkla Giriş)</span>
            </span>
            {showTestAccounts ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          {showTestAccounts && (
            <div className="mt-2.5 flex flex-col gap-2 animate-fade-in">
              {quickAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  disabled={loading}
                  onClick={() => handleQuickAccountLogin(acc)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-between text-left transition-all active:scale-98 cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-full ${acc.avatarColor} text-white font-black text-xs flex items-center justify-center`}
                    >
                      {acc.name.charAt(0)}
                    </div>
                    <div>
                      <strong className="text-xs font-bold text-slate-800 block group-hover:text-blue-600 transition-colors">
                        {acc.name}
                      </strong>
                      <span className="text-[10px] text-slate-500 block">{acc.email}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 group-hover:border-blue-300">
                    Giriş Yap
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer Toggle (Kayıt Ol / Giriş Yap) */}
        <div className="mt-4 text-center text-xs text-slate-500">
          {mode === 'login' ? (
            <p>
              Hesabınız yok mu?{' '}
              <button
                type="button"
                onClick={() => setMode('register')}
                className="font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Kayıt Olun
              </button>
            </p>
          ) : (
            <p>
              Zaten hesabınız var mı?{' '}
              <button
                type="button"
                onClick={() => setMode('login')}
                className="font-bold text-blue-600 hover:underline cursor-pointer"
              >
                Giriş Yapın
              </button>
            </p>
          )}
        </div>

        {/* Student Mobile App Redirection Notice */}
        <div className="mt-5 p-3 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-start gap-2.5 text-left">
          <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
            <GraduationCap size={16} />
          </div>
          <div className="text-[11px] leading-relaxed text-amber-900 flex-1">
            <strong className="block font-bold text-amber-950 mb-0.5">
              Öğrenci misiniz?
            </strong>
            <span>
              Sınıf Bulutu web platformu yalnızca öğretmenlerimiz içindir. Öğrencilerimiz ödevlerine katılmak ve etkinlikleri oynamak için{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  const el = document.getElementById('mobile-app');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                className="font-bold text-blue-600 underline hover:text-blue-800 cursor-pointer"
              >
                mobil uygulamamızı
              </button>
              {' '}kullanmalıdır.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
