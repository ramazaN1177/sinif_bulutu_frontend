import React from 'react';
import type { TemplateType } from '../types/game';

interface TemplateCardPreviewProps {
  templateType: TemplateType;
  isHovered: boolean;
  className?: string;
  showBadge?: boolean;
}

export const TemplateCardPreview: React.FC<TemplateCardPreviewProps> = ({
  templateType,
  isHovered,
  className,
}) => {
  const [hasError, setHasError] = React.useState(false);
  const imageSrc = `/games/${templateType}/preview.jpg?v=3`;

  return (
    <div
      className={`relative w-full ${
        className || 'h-44 sm:h-48'
      } rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 flex items-center justify-center select-none group/img`}
    >
      {/* 3D Template Artwork */}
      {!hasError ? (
        <img
          src={imageSrc}
          alt={templateType}
          className={`w-full h-full object-cover transition-transform duration-500 ${
            isHovered ? 'scale-105' : 'scale-100'
          }`}
          loading="lazy"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-600 via-indigo-700 to-slate-900 flex flex-col items-center justify-center p-4 text-center">
          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white mb-2 shadow-inner">
            <span className="text-xl font-black capitalize">{templateType.slice(0, 2)}</span>
          </div>
          <span className="text-xs font-bold text-white/90 capitalize">{templateType}</span>
        </div>
      )}
    </div>
  );
};
