import React, { useState, useEffect } from 'react';
import { Smartphone, RotateCw, X } from 'lucide-react';
import type { OrientationMode } from '../../services/nativeBridge';

interface RotateHintProps {
  requiredOrientation: OrientationMode;
  onDismiss?: () => void;
}

export const RotateHint: React.FC<RotateHintProps> = ({ requiredOrientation, onDismiss }) => {
  const [dismissed, setDismissed] = useState(false);
  const isTargetLandscape = requiredOrientation === 'landscape';

  // If orientation changes, reset dismiss state
  useEffect(() => {
    setDismissed(false);
  }, [requiredOrientation]);

  if (dismissed) return null;

  const handleClose = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <aside
      aria-label="Cihaz Yönü Önerisi"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[92%] max-w-md p-3.5 sm:p-4 rounded-2xl bg-slate-900/85 hover:bg-slate-900/95 text-white backdrop-blur-md border border-white/20 shadow-2xl animate-fade-in flex items-center justify-between gap-3 pointer-events-auto select-none"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative shrink-0 w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
          <Smartphone
            size={22}
            className={`text-white transition-transform duration-500 ${
              isTargetLandscape ? 'rotate-90' : 'rotate-0'
            }`}
          />
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs">
            <RotateCw size={10} className="stroke-[3]" />
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-xs sm:text-sm font-black font-display text-amber-300 leading-tight">
            {isTargetLandscape ? 'İpucu: Yatay mod daha rahattır' : 'İpucu: Dikey mod önerilir'}
          </p>
          <p className="text-[11px] sm:text-xs text-white/80 font-medium leading-tight truncate">
            {isTargetLandscape
              ? 'Daha geniş alan için telefonunu yan çevirebilirsin.'
              : 'Daha rahat oynamak için telefonunu dik tutabilirsin.'}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleClose}
        aria-label="Öneriyi Kapat"
        className="shrink-0 p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
      >
        <X size={16} />
      </button>
    </aside>
  );
};

