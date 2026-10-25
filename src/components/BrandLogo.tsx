import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-7 h-7 rounded-lg',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-16 h-16 rounded-3xl',
  };

  const iconSizeMap = {
    sm: 18,
    md: 22,
    lg: 30,
    xl: 38,
  };

  const px = iconSizeMap[size];

  return (
    <div
      className={`inline-flex items-center justify-center bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-400 text-white shadow-md shadow-indigo-500/25 relative overflow-hidden transition-transform duration-200 hover:scale-105 ${sizeMap[size]} ${className}`}
    >
      {/* Ambient background highlight */}
      <div className="absolute inset-0 bg-radial from-white/20 via-transparent to-black/10 pointer-events-none" />

      {/* Bespoke Vector Mark: Stylized Intelligent 'S' Nexus */}
      <svg
        width={px}
        height={px}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="relative z-10 drop-shadow-sm"
      >
        <defs>
          <linearGradient id="smartNexusGradA" x1="6" y1="8" x2="42" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="50%" stopColor="#E0F2FE" />
            <stop offset="100%" stopColor="#BAE6FD" />
          </linearGradient>
          <linearGradient id="smartNexusGradB" x1="42" y1="12" x2="8" y2="38" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="100%" stopColor="#FFFFFF" />
          </linearGradient>
          <filter id="coreGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="glow" />
            <feComposite in="SourceGraphic" in2="glow" operator="over" />
          </filter>
        </defs>

        {/* Outer orbital arc - Top Right to Center */}
        <path
          d="M 28 8 C 36 8 40 14 40 21 C 40 29 32 32 24 32 C 16 32 10 34 10 40"
          stroke="url(#smartNexusGradA)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Counter orbital arc - Bottom Left to Center, completing the fluid 'S' nexus */}
        <path
          d="M 20 40 C 12 40 8 34 8 27 C 8 19 16 16 24 16 C 32 16 38 14 38 8"
          stroke="url(#smartNexusGradB)"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Intelligence Core Sparkle */}
        <circle cx="24" cy="24" r="3.5" fill="#FFFFFF" filter="url(#coreGlow)" />
        
        {/* Orbital nodes */}
        <circle cx="38" cy="10" r="2" fill="#FFFFFF" />
        <circle cx="10" cy="38" r="2" fill="#E0F2FE" />
      </svg>
    </div>
  );
};
