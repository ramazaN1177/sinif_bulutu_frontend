import React, { useState, useEffect, useRef } from 'react';
import {
  Menu,
  X,
  ArrowDownToLine,
  LogIn,
  LogOut,
  User as UserIcon,
  ChevronDown,
  LayoutDashboard,
  Gamepad2,
  Globe,
  Sparkles,
  Layers,
  Smartphone,
  HelpCircle,
  UserPlus,
} from 'lucide-react';
import { authService, type User as AuthUser } from '../services/authService';

interface NavbarProps {
  onDownloadClick?: () => void;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
  currentView?: 'landing' | 'dashboard' | 'studio';
  onNavigateView?: (view: 'landing' | 'dashboard' | 'studio') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onDownloadClick,
  onLoginClick,
  onRegisterClick,
  currentView = 'landing',
  onNavigateView,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => authService.getStoredUser());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Track window scroll to switch from dark Hero glassmorphism to clean light navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Listen to auth changes
  useEffect(() => {
    const handleAuthChange = () => {
      setCurrentUser(authService.getStoredUser());
    };

    window.addEventListener('auth_state_changed', handleAuthChange);
    return () => window.removeEventListener('auth_state_changed', handleAuthChange);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
        setUserDropdownOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navLinks = [
    { label: 'Özellikler', href: '#ozellikler', icon: Sparkles },
    { label: 'Şablonlar', href: '#templates', icon: Layers },
    { label: 'Mobil Uygulama', href: '#mobile-app', icon: Smartphone },
    { label: 'SSS', href: '#sss', icon: HelpCircle },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);

    if (currentView !== 'landing' && onNavigateView) {
      onNavigateView('landing');
      setTimeout(() => {
        const target = document.querySelector(href);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 120);
      return;
    }

    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleDownload = () => {
    setMobileMenuOpen(false);
    if (onDownloadClick) {
      onDownloadClick();
    } else {
      const target = document.querySelector('#mobile-app');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogout = () => {
    authService.logout();
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  // Determine if the Navbar is over the dark Hero section
  const isHeroDark = currentView === 'landing' && !isScrolled;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isHeroDark
          ? mobileMenuOpen
            ? 'bg-[#070A13]/95 backdrop-blur-2xl border-b border-white/10 shadow-xl py-3'
            : 'bg-transparent border-b border-transparent py-4 sm:py-6 shadow-none'
          : 'bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-xs py-3'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
        {/* Left: Brand Logo & Title */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (onNavigateView) {
                onNavigateView(currentUser ? 'dashboard' : 'landing');
              } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="flex items-center gap-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-2xl"
            aria-label="Sınıf Bulutu Ana Sayfa"
          >
            {/* Official Brand Logo Image */}
            <div className="relative flex items-center justify-center shrink-0">
              <img
                src="/sinif_bulutu_logo.png"
                alt="Sınıf Bulutu Logo"
                className={`w-10 h-10 sm:w-11 sm:h-11 object-contain transition-all duration-200 group-hover:scale-105 ${
                  isHeroDark
                    ? 'filter drop-shadow-[0_2px_12px_rgba(6,182,212,0.6)]'
                    : 'filter drop-shadow-[0_2px_8px_rgba(37,99,235,0.25)]'
                }`}
              />
            </div>

            <div className="flex flex-col">
              <span
                className={`text-xl sm:text-2xl font-black tracking-tight font-display transition-colors leading-tight ${
                  isHeroDark ? 'text-white' : 'text-slate-900'
                }`}
              >
                Sınıf Bulutu
              </span>
              <span
                className={`text-[11px] font-semibold hidden sm:block tracking-wide transition-colors ${
                  isHeroDark ? 'text-slate-300/80' : 'text-slate-500'
                }`}
              >
                {currentView === 'dashboard'
                  ? 'Öğretmen Yönetim Paneli'
                  : 'Dijital Eğitim & Etkinlik Platformu'}
              </span>
            </div>
          </a>
        </div>

        {/* Center: Desktop Navigation Links (Visible on lg and up) */}
        <nav
          className={`hidden lg:flex items-center gap-1 px-3 py-1.5 rounded-full transition-all duration-300 ${
            isHeroDark
              ? 'bg-white/10 border border-white/20 backdrop-blur-md shadow-inner text-white'
              : 'bg-slate-100/90 border border-slate-200/80 shadow-xs text-slate-800'
          }`}
          aria-label="Ana Gezinti"
        >
          {currentView === 'dashboard' ? (
            /* Dashboard View Tabs */
            <>
              <button
                onClick={() => onNavigateView && onNavigateView('dashboard')}
                className="px-4 py-1.5 text-xs font-black rounded-full bg-blue-600 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LayoutDashboard size={14} />
                <span>Yönetim Panelim</span>
              </button>

              {currentUser?.role === 'teacher' && onNavigateView && (
                <button
                  onClick={() => onNavigateView('studio')}
                  className="px-4 py-1.5 text-xs font-bold rounded-full text-slate-700 hover:text-blue-600 hover:bg-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Gamepad2 size={14} className="text-amber-500" />
                  <span>Şablon Stüdyosu</span>
                </button>
              )}

              {onNavigateView && (
                <button
                  onClick={() => onNavigateView('landing')}
                  className="px-4 py-1.5 text-xs font-bold rounded-full text-slate-700 hover:text-blue-600 hover:bg-white flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Globe size={14} className="text-slate-500" />
                  <span>Tanıtım Vitrini</span>
                </button>
              )}
            </>
          ) : (
            /* Landing View Links (Styling adapts dynamically to Hero theme) */
            <>
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={(e) => handleLinkClick(e, link.href)}
                  className={`px-3.5 py-1.5 text-xs font-bold rounded-full transition-all ${
                    isHeroDark
                      ? 'text-slate-200 hover:text-white hover:bg-white/15'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-white'
                  }`}
                >
                  {link.label}
                </a>
              ))}

              {/* Quick jump to dashboard if already logged in */}
              {currentUser && onNavigateView && (
                <button
                  onClick={() => onNavigateView('dashboard')}
                  className={`ml-1 px-3.5 py-1 text-xs font-black rounded-full transition-all cursor-pointer flex items-center gap-1.5 ${
                    isHeroDark
                      ? 'text-cyan-300 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-400/40 shadow-sm'
                      : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  <LayoutDashboard size={13} />
                  <span>Panelime Git</span>
                </button>
              )}
            </>
          )}
        </nav>

        {/* Right: Auth Profile / Actions & Mobile Hamburger */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* If Logged In: Teacher / Student Profile Badge & Dropdown */}
          {currentUser ? (
            <div className="relative hidden sm:block" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all cursor-pointer text-left ${
                  isHeroDark
                    ? 'border-white/20 bg-white/10 hover:bg-white/15 text-white backdrop-blur-md'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-900 shadow-xs'
                }`}
                aria-expanded={userDropdownOpen}
              >
                {/* Avatar Icon */}
                <div
                  className={`w-8 h-8 rounded-full text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs ${
                    currentUser.role === 'teacher' ? 'bg-blue-600' : 'bg-emerald-600'
                  }`}
                >
                  {currentUser.firstName ? currentUser.firstName.charAt(0).toUpperCase() : <UserIcon size={14} />}
                </div>

                {/* Name & Role */}
                <div className="flex flex-col leading-tight pr-1">
                  <span
                    className={`text-xs font-black tracking-tight ${
                      isHeroDark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {currentUser.firstName} {currentUser.lastName}
                  </span>
                  <span
                    className={`text-[10px] font-semibold ${
                      isHeroDark ? 'text-slate-300/80' : 'text-slate-500'
                    }`}
                  >
                    {currentUser.role === 'teacher' ? 'Öğretmen' : 'Öğrenci'}
                  </span>
                </div>

                <ChevronDown
                  size={14}
                  className={`transition-transform duration-200 ${
                    userDropdownOpen ? 'rotate-180 text-blue-500' : isHeroDark ? 'text-slate-300' : 'text-slate-400'
                  }`}
                />
              </button>

              {/* Floating Dropdown Card (Clean white for reliable readability) */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-slate-800">
                  <div className="px-3 py-2.5 border-b border-slate-100 mb-1 bg-slate-50/80 rounded-xl">
                    <strong className="text-xs font-black text-slate-900 block truncate">
                      {currentUser.firstName} {currentUser.lastName}
                    </strong>
                    <span className="text-[11px] text-slate-500 block truncate">
                      {currentUser.role === 'teacher' ? 'Öğretmen' : 'Öğrenci'} · {currentUser.email || 'Aktif Hesap'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigateView && onNavigateView('dashboard');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <LayoutDashboard size={15} className="text-blue-600" />
                      <span>Yönetim Panelim</span>
                    </button>

                    {currentUser.role === 'teacher' && (
                      <button
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onNavigateView && onNavigateView('studio');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer text-left"
                      >
                        <Gamepad2 size={15} className="text-amber-500" />
                        <span>Şablon & Oyun Stüdyosu</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onNavigateView && onNavigateView('landing');
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-left"
                    >
                      <Globe size={15} className="text-slate-500" />
                      <span>Web Tanıtım Vitrini</span>
                    </button>
                  </div>

                  <div className="my-1 border-t border-slate-100" />

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer text-left"
                  >
                    <LogOut size={15} className="text-rose-500" />
                    <span>Çıkış Yap</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* If Logged Out: Login & Register Buttons styled to match theme */
            <div className="hidden sm:flex items-center gap-2">
              {onLoginClick && (
                <button
                  onClick={onLoginClick}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isHeroDark
                      ? 'text-white hover:bg-white/15 border border-white/20'
                      : 'text-slate-700 hover:text-blue-600 hover:bg-slate-100'
                  }`}
                >
                  <LogIn size={14} />
                  <span>Giriş Yap</span>
                </button>
              )}
              {onRegisterClick && (
                <button
                  onClick={onRegisterClick}
                  className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                    isHeroDark
                      ? 'text-cyan-300 bg-white/10 hover:bg-white/20 border border-cyan-400/40'
                      : 'text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200'
                  }`}
                >
                  <UserPlus size={14} />
                  <span>Kayıt Ol</span>
                </button>
              )}
            </div>
          )}

          {/* Primary CTA: Download Mobile App */}
          <button
            onClick={handleDownload}
            className={`hidden sm:inline-flex items-center gap-1.5 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-black text-white bg-gradient-to-r from-[#2563EB] to-[#06B6D4] hover:from-[#1D4ED8] hover:to-[#0891B2] transition-all active:scale-95 cursor-pointer shrink-0 ${
              isHeroDark
                ? 'shadow-lg shadow-cyan-500/25 ring-1 ring-white/30'
                : 'shadow-md shadow-blue-500/20 hover:shadow-lg'
            }`}
          >
            <ArrowDownToLine size={15} />
            <span>Uygulamayı İndir</span>
          </button>

          {/* Mobile Hamburger Toggle Button (Clean lg:hidden) */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            className={`lg:hidden p-2.5 rounded-xl border transition-colors shadow-xs cursor-pointer ${
              isHeroDark
                ? 'border-white/20 bg-white/10 hover:bg-white/20 text-white'
                : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-800'
            }`}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Slide-Down Drawer */}
      <div
        className={`lg:hidden transition-all duration-300 ease-in-out overflow-hidden ${
          mobileMenuOpen ? 'max-h-[600px] opacity-100 border-t shadow-2xl' : 'max-h-0 opacity-0'
        } ${
          isHeroDark
            ? 'border-white/10 bg-[#0A0E1A]/95 text-white backdrop-blur-2xl'
            : 'border-slate-200 bg-white text-slate-900 backdrop-blur-2xl'
        }`}
      >
        <div className="px-5 pt-3 pb-6 flex flex-col gap-2">
          {/* User state in mobile menu */}
          {currentUser ? (
            <div
              className={`p-3.5 rounded-2xl flex items-center justify-between mb-2 border ${
                isHeroDark ? 'border-white/15 bg-white/5' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs ${
                    currentUser.role === 'teacher' ? 'bg-blue-600' : 'bg-emerald-600'
                  }`}
                >
                  {currentUser.firstName ? currentUser.firstName.charAt(0).toUpperCase() : <UserIcon size={14} />}
                </div>
                <div className="flex flex-col leading-tight">
                  <strong className="text-sm font-black block">
                    {currentUser.firstName} {currentUser.lastName}
                  </strong>
                  <span className={`text-xs font-semibold ${isHeroDark ? 'text-slate-300' : 'text-slate-500'}`}>
                    {currentUser.role === 'teacher' ? 'Öğretmen' : 'Öğrenci'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors"
                title="Çıkış Yap"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 mb-2">
              {onLoginClick && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLoginClick();
                  }}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    isHeroDark
                      ? 'text-white bg-white/10 hover:bg-white/20 border border-white/20'
                      : 'text-slate-800 bg-slate-100 hover:bg-slate-200'
                  }`}
                >
                  <LogIn size={15} />
                  <span>Giriş Yap</span>
                </button>
              )}
              {onRegisterClick && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onRegisterClick();
                  }}
                  className={`py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                    isHeroDark
                      ? 'text-cyan-300 bg-cyan-950/70 border border-cyan-400/40 hover:bg-cyan-900/80'
                      : 'text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100'
                  }`}
                >
                  <UserPlus size={15} />
                  <span>Kayıt Ol</span>
                </button>
              )}
            </div>
          )}

          {/* Quick Dashboard Links */}
          {currentUser && onNavigateView && (
            <div className={`flex flex-col gap-1 mb-2 pb-2 border-b ${isHeroDark ? 'border-white/10' : 'border-slate-100'}`}>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateView('dashboard');
                }}
                className={`py-2.5 px-4 rounded-xl text-left font-bold text-sm flex items-center gap-2.5 ${
                  currentView === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : isHeroDark
                    ? 'text-slate-200 hover:bg-white/10'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                <LayoutDashboard size={16} />
                <span>Yönetim Panelim</span>
              </button>

              {currentUser.role === 'teacher' && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateView('studio');
                  }}
                  className={`py-2.5 px-4 rounded-xl text-left font-bold text-sm flex items-center gap-2.5 ${
                    currentView === 'studio'
                      ? 'bg-blue-600 text-white'
                      : isHeroDark
                      ? 'text-slate-200 hover:bg-white/10'
                      : 'text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  <Gamepad2 size={16} className="text-amber-500" />
                  <span>Şablon & Oyun Stüdyosu</span>
                </button>
              )}

              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigateView('landing');
                }}
                className={`py-2.5 px-4 rounded-xl text-left font-bold text-sm flex items-center gap-2.5 ${
                  currentView === 'landing'
                    ? 'bg-blue-600 text-white'
                    : isHeroDark
                    ? 'text-slate-200 hover:bg-white/10'
                    : 'text-slate-800 hover:bg-slate-100'
                }`}
              >
                <Globe size={16} />
                <span>Tanıtım Vitrini</span>
              </button>
            </div>
          )}

          {/* Landing Section Links */}
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`py-2.5 px-4 rounded-xl text-sm font-bold transition-colors flex items-center gap-2.5 ${
                  isHeroDark
                    ? 'text-slate-200 hover:text-white hover:bg-white/10'
                    : 'text-slate-800 hover:text-blue-600 hover:bg-slate-100'
                }`}
              >
                <Icon size={16} className={isHeroDark ? 'text-slate-400' : 'text-slate-400'} />
                <span>{link.label}</span>
              </a>
            );
          })}

          <div className={`pt-3 border-t ${isHeroDark ? 'border-white/10' : 'border-slate-200'}`}>
            <button
              onClick={handleDownload}
              className="w-full py-3 px-5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-[#2563EB] to-[#06B6D4] hover:from-[#1D4ED8] hover:to-[#0891B2] shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowDownToLine size={17} />
              <span>Mobil Uygulamayı İndir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

