import { useRef, useState, useCallback } from 'react';

interface UseSwipeOptions {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  threshold?: number;
}

export function useSwipe({ onSwipeLeft, onSwipeRight, threshold = 45 }: UseSwipeOptions) {
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);

  const onTouchStart = useCallback((e: React.TouchEvent | React.MouseEvent) => {
    if ('touches' in e) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
    } else {
      // Mouse down
      touchStartX.current = e.clientX;
      touchStartY.current = e.clientY;
    }
    setIsSwiping(true);
  }, []);

  const onTouchMove = useCallback((_e: React.TouchEvent | React.MouseEvent) => {
    if (touchStartX.current === null) return;
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      if (touchStartX.current === null) {
        setIsSwiping(false);
        return;
      }

      let endX: number;
      let endY: number;

      if ('changedTouches' in e) {
        endX = e.changedTouches[0].clientX;
        endY = e.changedTouches[0].clientY;
      } else {
        endX = (e as React.MouseEvent).clientX;
        endY = (e as React.MouseEvent).clientY;
      }

      const diffX = touchStartX.current - endX;
      const diffY = (touchStartY.current ?? endY) - endY;

      // Only trigger if horizontal swipe is greater than vertical movement
      if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > threshold) {
        if (diffX > 0) {
          // Swiped left -> next slide
          onSwipeLeft();
        } else {
          // Swiped right -> prev slide
          onSwipeRight();
        }
      }

      touchStartX.current = null;
      touchStartY.current = null;
      setIsSwiping(false);
    },
    [onSwipeLeft, onSwipeRight, threshold]
  );

  return {
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    isSwiping,
  };
}
