import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, Pause, ArrowRight } from 'lucide-react';
import { HERO_SLIDES, type HeroSlide } from '../data/heroSlides';
import { useAutoplay } from '../hooks/useAutoplay';
import { useSwipe } from '../hooks/useSwipe';
import { AppStoreBadge, GooglePlayBadge } from './common/StoreBadges';

export const HeroSlider: React.FC = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPausedManual, setIsPausedManual] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const activeSlide: HeroSlide = HERO_SLIDES[currentIdx];

  const handleNext = useCallback(() => {
    setCurrentIdx((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const handlePrev = useCallback(() => {
    setCurrentIdx((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  const goToSlide = (idx: number) => {
    setCurrentIdx(idx);
    resetProgress();
  };

  // Autoplay hook
  const {
    progress,
    isPaused,
    prefersReducedMotion,
    setIsHovered,
    setIsFocused,
    setIsTouching,
    resetProgress,
  } = useAutoplay({
    duration: 6000,
    totalSlides: HERO_SLIDES.length,
    onNext: handleNext,
    isPausedManual,
  });

  // Swipe navigation for mobile & touch
  const { onTouchStart, onTouchMove, onTouchEnd, isSwiping } = useSwipe({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrev,
    threshold: 40,
  });

  useEffect(() => {
    setIsTouching(isSwiping);
  }, [isSwiping, setIsTouching]);

  // Keyboard navigation (ArrowLeft & ArrowRight)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
        resetProgress();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
        resetProgress();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, resetProgress]);

  // Handle image load error to fall back to indigo-to-blue gradient
  const handleImageError = (id: number) => {
    setImageErrors((prev) => ({ ...prev, [id]: true }));
  };

  // Preload next slide image
  useEffect(() => {
    const nextIdx = (currentIdx + 1) % HERO_SLIDES.length;
    const nextSlide = HERO_SLIDES[nextIdx];
    if (nextSlide && typeof window !== 'undefined') {
      const img = new Image();
      img.src = nextSlide.desktopImage;
    }
  }, [currentIdx]);

  return (
    <section
      ref={containerRef}
      role="region"
      aria-roledescription="carousel"
      aria-label="Sınıf Bulutu Tanıtım Slaytları"
      aria-live={isPaused ? 'polite' : 'off'}
      className="relative w-full h-[100svh] min-h-[600px] overflow-hidden select-none bg-[#070A13] text-white flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Background Slides with Crossfade and Ken Burns effect */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1.0] }}
            className="absolute inset-0 w-full h-full"
            style={{
              background: activeSlide.fallbackGradient,
            }}
          >
            {/* If image hasn't errored, render picture tag with responsive mobile/desktop sources */}
            {!imageErrors[activeSlide.id] && (
              <motion.div
                className="w-full h-full"
                initial={prefersReducedMotion ? false : { scale: 1 }}
                animate={prefersReducedMotion ? false : { scale: 1.06 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { duration: 6, ease: 'linear' }
                }
              >
                <picture className="w-full h-full block">
                  <source media="(max-width: 768px)" srcSet={activeSlide.mobileImage} />
                  <img
                    src={activeSlide.desktopImage}
                    alt=""
                    fetchPriority={activeSlide.id === 1 ? 'high' : 'auto'}
                    loading={activeSlide.id === 1 ? 'eager' : 'lazy'}
                    onError={() => handleImageError(activeSlide.id)}
                    className="w-full h-full object-cover object-center pointer-events-none"
                  />
                </picture>
              </motion.div>
            )}

            {/* Gradient Overlays: Dark-to-transparent on left (desktop) and top (mobile) for WCAG AA readability */}
            {/* Desktop Left-to-Right Gradient */}
            <div className="hidden md:block absolute inset-0 bg-gradient-to-r from-[#070A13]/95 via-[#070A13]/75 via-45% to-transparent pointer-events-none" />
            {/* Mobile Top-to-Bottom Gradient */}
            <div className="md:hidden absolute inset-0 bg-gradient-to-b from-[#070A13]/95 via-[#070A13]/85 via-50% to-[#070A13]/40 pointer-events-none" />
            {/* Ambient subtle glow for visual depth */}
            <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Content Layer */}
      <div
        role="group"
        aria-label={`${currentIdx + 1} / ${HERO_SLIDES.length}`}
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col justify-center pt-24 sm:pt-28 md:pt-0"
      >
        <div className="max-w-[560px] w-full text-left">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSlide.id}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: prefersReducedMotion ? 0 : 0.08,
                  },
                },
                exit: {
                  opacity: 0,
                  transition: { duration: 0.2 },
                },
              }}
              className="flex flex-col items-start gap-4 sm:gap-5"
            >
              {/* 1. Badge (Small Glass Pill) */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 14 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
                  exit: { opacity: 0, y: -6 },
                }}
              >
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold bg-white/10 border border-white/20 backdrop-blur-md text-cyan-300 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                  <span>{activeSlide.badge}</span>
                </div>
              </motion.div>

              {/* 2. Main Title: clamp(2.25rem, 5vw, 4.5rem) */}
              <motion.h1
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
                  exit: { opacity: 0, y: -10 },
                }}
                className="text-white font-extrabold tracking-tight font-display text-balance leading-[1.1]"
                style={{
                  fontSize: 'clamp(2.25rem, 5vw, 4.25rem)',
                }}
              >
                {activeSlide.title}
              </motion.h1>

              {/* 3. Description Paragraph */}
              <motion.p
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
                  exit: { opacity: 0, y: -8 },
                }}
                className="text-slate-200/90 text-base sm:text-lg sm:leading-relaxed font-normal max-w-xl text-balance"
              >
                {activeSlide.text}
              </motion.p>

              {/* 4. Action Buttons (Primary / Secondary or App Store / Google Play) */}
              <motion.div
                variants={{
                  hidden: { opacity: 0, y: 16 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.45 } },
                  exit: { opacity: 0, y: -8 },
                }}
                className="w-full sm:w-auto pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
              >
                {activeSlide.appStoreButtons ? (
                  /* Slide 7: Official App Store & Google Play Badges */
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full">
                    <AppStoreBadge />
                    <GooglePlayBadge />
                  </div>
                ) : (
                  /* Standard Slides 1-6 Primary & Secondary CTAs */
                  <>
                    {activeSlide.primaryCta && (
                      <a
                        href={activeSlide.primaryCta.href}
                        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-base font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-[0_0_24px_rgba(37,99,235,0.45)] hover:shadow-[0_0_32px_rgba(6,182,212,0.65)] transition-all duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 group"
                      >
                        <span>{activeSlide.primaryCta.text}</span>
                        <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                      </a>
                    )}

                    {activeSlide.secondaryCta && (
                      <a
                        href={activeSlide.secondaryCta.href}
                        className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full text-base font-bold text-white bg-white/10 hover:bg-white/20 border border-white/25 backdrop-blur-md shadow-md transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
                      >
                        <span>{activeSlide.secondaryCta.text}</span>
                      </a>
                    )}
                  </>
                )}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Area: Progress Dots (Left), Counter & Navigation Controls (Right) */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8 flex items-center justify-between">
        {/* Bottom Left: Progress Indicators / Clickable Dots */}
        <div
          role="tablist"
          aria-label="Slayt Seçimi"
          className="flex items-center gap-2 sm:gap-2.5 p-1.5 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/10"
        >
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === currentIdx;
            return (
              <button
                key={slide.id}
                role="tab"
                aria-selected={isActive}
                aria-label={`Slayt ${idx + 1}'e git: ${slide.badge}`}
                onClick={() => goToSlide(idx)}
                className={`relative h-2 sm:h-2.5 rounded-full transition-all duration-300 overflow-hidden cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 ${isActive ? 'w-10 sm:w-14 bg-white/20' : 'w-2 sm:w-2.5 bg-white/30 hover:bg-white/60'
                  }`}
              >
                {/* Active progress bar filling over 6 seconds */}
                {isActive && (
                  <span
                    className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-[width] duration-75"
                    style={{
                      width: prefersReducedMotion ? '100%' : `${progress * 100}%`,
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Right: Slide Counter, Pause/Play, Prev/Next Arrows */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Slide Counter (e.g. 01 / 07) */}
          <div className="px-3 py-1.5 rounded-full bg-slate-950/40 backdrop-blur-md border border-white/10 text-xs sm:text-sm font-mono tracking-widest text-slate-300">
            <strong className="text-white font-bold">0{currentIdx + 1}</strong>
            <span className="text-slate-500 mx-1">/</span>
            <span>0{HERO_SLIDES.length}</span>
          </div>

          {/* Visible Pause / Play Toggle Button */}
          <button
            onClick={() => setIsPausedManual(!isPausedManual)}
            aria-label={isPausedManual ? 'Oynat' : 'Duraklat'}
            title={isPausedManual ? 'Oynat' : 'Duraklat'}
            className="p-2 sm:p-2.5 rounded-full bg-slate-950/40 hover:bg-white/15 text-white border border-white/10 backdrop-blur-md transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer"
          >
            {isPausedManual ? <Play size={16} aria-hidden="true" /> : <Pause size={16} aria-hidden="true" />}
          </button>

          {/* Prev Arrow Button */}
          <button
            onClick={() => {
              handlePrev();
              resetProgress();
            }}
            aria-label="Önceki slayt"
            title="Önceki slayt"
            className="p-2 sm:p-2.5 rounded-full bg-slate-950/40 hover:bg-white/15 text-white border border-white/10 backdrop-blur-md transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>

          {/* Next Arrow Button */}
          <button
            onClick={() => {
              handleNext();
              resetProgress();
            }}
            aria-label="Sonraki slayt"
            title="Sonraki slayt"
            className="p-2 sm:p-2.5 rounded-full bg-slate-950/40 hover:bg-white/15 text-white border border-white/10 backdrop-blur-md transition-all active:scale-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 cursor-pointer"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
    </section>
  );
};
