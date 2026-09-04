import React, { useState } from 'react';
import badgeImg from '../../assets/icertix-badge.png';

interface IcertixSealProps {
  size?: number; // width & height in px
  className?: string;
  showGlow?: boolean;
}

export const IcertixSeal: React.FC<IcertixSealProps> = ({
  size = 80,
  className = '',
  showGlow = false
}) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div 
        className={`inline-flex items-center justify-center rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 text-[#0A2540] font-bold text-xs shadow-md border-2 border-amber-500 ${className}`}
        style={{ width: size, height: size }}
      >
        <span>VERIFIED</span>
      </div>
    );
  }

  return (
    <div 
      className={`inline-block select-none relative shrink-0 ${className} ${showGlow ? 'drop-shadow-[0_4px_16px_rgba(217,119,6,0.4)]' : 'drop-shadow-md'}`}
      style={{ width: size, height: size }}
    >
      <img
        src={badgeImg}
        alt="iCertiX Verified Badge"
        className="w-full h-full object-contain pointer-events-none"
        onError={() => setImgError(true)}
      />
    </div>
  );
};
