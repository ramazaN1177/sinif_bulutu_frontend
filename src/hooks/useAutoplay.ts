import { useState, useEffect, useRef, useCallback } from 'react';

interface UseAutoplayOptions {
  duration?: number; // duration in ms (default 6000ms)
  totalSlides: number;
  onNext: () => void;
  isPausedManual?: boolean;
}

export function useAutoplay({
  duration = 6000,
  totalSlides,
  onNext,
  isPausedManual = false,
}: UseAutoplayOptions) {
  const [progress, setProgress] = useState(0); // 0 to 1
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check prefers-reduced-motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const isPaused = isPausedManual || isHovered || isFocused || isTouching || prefersReducedMotion;

  const onNextRef = useRef(onNext);
  useEffect(() => {
    onNextRef.current = onNext;
  }, [onNext]);

  const lastTimeRef = useRef<number | null>(null);
  const progressRef = useRef(0);

  // Reset progress when slide changes or when manually requested
  const resetProgress = useCallback(() => {
    setProgress(0);
    progressRef.current = 0;
    lastTimeRef.current = null;
  }, []);

  useEffect(() => {
    if (isPaused) {
      lastTimeRef.current = null;
      return;
    }

    let animationFrameId: number;

    const tick = (currentTime: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = currentTime;
      }

      const delta = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      const increment = delta / duration;
      progressRef.current += increment;

      if (progressRef.current >= 1) {
        progressRef.current = 0;
        setProgress(0);
        lastTimeRef.current = currentTime;
        onNextRef.current();
      } else {
        setProgress(progressRef.current);
      }

      animationFrameId = requestAnimationFrame(tick);
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPaused, duration, totalSlides]);

  return {
    progress,
    isPaused,
    prefersReducedMotion,
    setIsHovered,
    setIsFocused,
    setIsTouching,
    resetProgress,
  };
}
