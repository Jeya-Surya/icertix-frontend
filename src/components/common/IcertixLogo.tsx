import React from 'react';

interface IcertixLogoProps {
  variant?: 'light' | 'dark' | 'color';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showSubtitle?: boolean;
  iconOnly?: boolean;
  className?: string;
}

export const IcertixLogo: React.FC<IcertixLogoProps> = ({
  variant = 'light',
  size = 'md',
  showSubtitle = false,
  iconOnly = false,
  className = ''
}) => {
  // Height mappings for logo image
  const heightMap = {
    xs: 'h-5 sm:h-6',
    sm: 'h-6 sm:h-7',
    md: 'h-8 sm:h-9',
    lg: 'h-10 sm:h-12',
    xl: 'h-14 sm:h-16',
    '2xl': 'h-18 sm:h-22'
  };

  const iconSizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
    '2xl': 'w-20 h-20'
  };

  if (iconOnly) {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 select-none bg-white p-1 rounded-xl shadow-sm ${className}`}>
        <img
          src="/icertix-logo.png"
          alt="iCertiX"
          className={`${iconSizeMap[size]} object-contain`}
        />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 shrink-0 select-none ${className}`}>
      {/* Crisp White Background Container for Pristine Contrast */}
      <div className="bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl shadow-xs border border-white/40 flex items-center shrink-0">
        <img
          src="/icertix-logo.png"
          alt="iCertiX Authentic Credentials"
          className={`${heightMap[size]} w-auto object-contain block`}
        />
      </div>

      {showSubtitle && (
        <span className="text-[10px] font-mono text-cyan-400 font-semibold tracking-wider uppercase hidden sm:inline-block border-l border-white/20 pl-2">
          Sovereign Proof
        </span>
      )}
    </div>
  );
};
