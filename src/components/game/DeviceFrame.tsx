import React from 'react';

interface DeviceFrameProps {
  children: React.ReactNode;
  isLandscape?: boolean;
}

export const DeviceFrame: React.FC<DeviceFrameProps> = ({ children, isLandscape = false }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/95 flex items-center justify-center p-0 md:p-6 select-none overflow-hidden">
      {/* Device Body on Desktop */}
      <div
        className={`relative w-full h-full md:rounded-[44px] md:border-[10px] md:border-slate-800 md:shadow-[0_25px_70px_rgba(0,0,0,0.6),0_0_0_1px_rgba(255,255,255,0.1)] overflow-hidden bg-white flex flex-col transition-all duration-300 ${
          isLandscape
            ? 'md:max-w-[880px] md:aspect-[16/9] md:max-h-[520px]'
            : 'md:max-w-[420px] md:aspect-[9/19.5] md:max-h-[860px]'
        }`}
      >


        {/* Inner Content */}
        <div className="relative w-full h-full overflow-hidden flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};
