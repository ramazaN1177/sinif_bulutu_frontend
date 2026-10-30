import { useState, useEffect } from 'react';
import type { OrientationMode } from '../services/nativeBridge';

export const useOrientation = (targetOrientation: OrientationMode = 'auto') => {
  const [isLandscape, setIsLandscape] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth > window.innerHeight;
  });

  useEffect(() => {
    const checkOrientation = () => {
      const landscape = window.innerWidth > window.innerHeight;
      setIsLandscape(landscape);
    };

    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const currentMode: 'portrait' | 'landscape' = isLandscape ? 'landscape' : 'portrait';

  // Check if there is a mismatch requiring rotation
  const isMismatch =
    targetOrientation === 'landscape' && !isLandscape
      ? true
      : targetOrientation === 'portrait' && isLandscape
      ? true
      : false;

  return {
    isLandscape,
    currentMode,
    isMismatch,
  };
};
