import { useState, useEffect } from 'react';
import type { GameTheme } from '../data/gameThemes';

export const useGameBackground = (theme: GameTheme, isLandscape: boolean) => {
  const [bgLoaded, setBgLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const targetBgUrl = isLandscape ? theme.bgLandscape : theme.bgPortrait;

  useEffect(() => {
    let isMounted = true;
    setBgLoaded(false);
    setHasError(false);

    const img = new Image();
    img.src = targetBgUrl;

    img.onload = () => {
      if (isMounted) {
        setBgLoaded(true);
      }
    };

    img.onerror = () => {
      if (isMounted) {
        // Fallback: if landscape failed, try portrait fallback or fallback gradient
        if (isLandscape && targetBgUrl !== theme.bgPortrait) {
          const fallbackImg = new Image();
          fallbackImg.src = theme.bgPortrait;
          fallbackImg.onload = () => {
            if (isMounted) setBgLoaded(true);
          };
          fallbackImg.onerror = () => {
            if (isMounted) setHasError(true);
          };
        } else {
          setHasError(true);
        }
      }
    };

    return () => {
      isMounted = false;
    };
  }, [targetBgUrl, theme.bgPortrait, isLandscape]);

  return {
    bgLoaded: bgLoaded && !hasError,
    hasError,
    bgUrl: targetBgUrl,
    fallbackGradient: theme.gradientFallback,
  };
};
