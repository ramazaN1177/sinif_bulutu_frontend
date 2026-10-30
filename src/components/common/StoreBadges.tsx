import React from 'react';

interface StoreBadgeProps {
  className?: string;
  href?: string;
}

/**
 * Custom container with authentic official Apple logo asset
 */
export const AppStoreBadge: React.FC<StoreBadgeProps> = ({
  className = '',
  href = '#',
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="App Store'dan İndir"
      className={`inline-flex items-center gap-3.5 px-5 py-2.5 sm:py-3 rounded-2xl bg-slate-900/90 hover:bg-black text-white border border-white/20 hover:border-white/50 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 group cursor-pointer ${className}`}
    >
      {/* Real Official Apple Logo Asset */}
      <div className="w-6 h-6 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        <img
          src="/assets/apple_logo_official.svg"
          alt="Apple"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      {/* Our Custom Container Typography */}
      <div className="text-left leading-tight flex flex-col justify-center">
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
          İndir
        </span>
        <span className="text-sm sm:text-base font-extrabold text-white font-display tracking-tight block">
          App Store
        </span>
      </div>
    </a>
  );
};

/**
 * Custom container with authentic official Google Play 4-Color logo asset
 */
export const GooglePlayBadge: React.FC<StoreBadgeProps> = ({
  className = '',
  href = '#',
}) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Google Play'den İndir"
      className={`inline-flex items-center gap-3.5 px-5 py-2.5 sm:py-3 rounded-2xl bg-slate-900/90 hover:bg-black text-white border border-white/20 hover:border-white/50 backdrop-blur-md shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 group cursor-pointer ${className}`}
    >
      {/* Real Official Google Play 4-Color Logo Asset */}
      <div className="w-6 h-6 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
        <img
          src="/assets/google_play_icon_official.svg"
          alt="Google Play"
          className="w-full h-full object-contain"
          loading="lazy"
        />
      </div>

      {/* Our Custom Container Typography */}
      <div className="text-left leading-tight flex flex-col justify-center">
        <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
          İndir
        </span>
        <span className="text-sm sm:text-base font-extrabold text-white font-display tracking-tight block">
          Google Play
        </span>
      </div>
    </a>
  );
};
