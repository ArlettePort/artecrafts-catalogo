import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
  variant?: 'full' | 'icon-only' | 'horizontal';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  showText = true,
  className = '',
  variant = 'horizontal',
}) => {
  const dimensionMap = {
    sm: { icon: 34, title: 'text-lg', subtitle: 'text-[9px]' },
    md: { icon: 44, title: 'text-xl', subtitle: 'text-[10px]' },
    lg: { icon: 68, title: 'text-2xl', subtitle: 'text-xs' },
    xl: { icon: 96, title: 'text-3xl', subtitle: 'text-sm' },
  };

  const currentSize = dimensionMap[size];

  // SVG representation replicating the exact user logo:
  // - Gold intertwined botanical laurel circle
  // - Pastel pink watercolor wash & specks
  // - Cyan/turquoise monogram "Ac"
  // - Clean banner with script "Arte Crafts"
  const Emblem = (
    <div
      className="relative flex items-center justify-center select-none shrink-0"
      style={{ width: currentSize.icon, height: currentSize.icon }}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-[0_2px_6px_rgba(244,114,182,0.18)]"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Watercolor pink gradient filter */}
          <radialGradient id="pinkSplash" cx="50%" cy="48%" r="46%">
            <stop offset="0%" stopColor="#FDE2EC" stopOpacity="0.95" />
            <stop offset="65%" stopColor="#F9A8D4" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#FDF2F8" stopOpacity="0" />
          </radialGradient>
          
          <linearGradient id="goldRing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D4AF37" />
            <stop offset="40%" stopColor="#ECC968" />
            <stop offset="70%" stopColor="#C89726" />
            <stop offset="100%" stopColor="#E2B755" />
          </linearGradient>

          <linearGradient id="cyanAc" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00E1D9" />
            <stop offset="100%" stopColor="#08BDB5" />
          </linearGradient>
        </defs>

        {/* Soft pink watercolor splash background */}
        <path
          d="M 100 22 C 145 20, 178 55, 174 95 C 170 135, 155 175, 105 178 C 55 180, 22 145, 24 100 C 26 50, 55 24, 100 22 Z"
          fill="url(#pinkSplash)"
        />
        {/* Subtle watercolor splatter dots */}
        <circle cx="68" cy="62" r="4.5" fill="#84A98C" fillOpacity="0.4" />
        <circle cx="138" cy="50" r="3" fill="#D59AA8" fillOpacity="0.5" />
        <circle cx="86" cy="154" r="3.5" fill="#999999" fillOpacity="0.4" />
        <circle cx="152" cy="120" r="2.5" fill="#F472B6" fillOpacity="0.6" />

        {/* Intertwined Gold rings with botanical twigs */}
        <circle cx="100" cy="100" r="88" stroke="url(#goldRing)" strokeWidth="1.6" />
        <circle cx="100" cy="100" r="84" stroke="url(#goldRing)" strokeWidth="1" strokeDasharray="300" strokeDashoffset="12" />
        <circle cx="100" cy="100" r="91" stroke="url(#goldRing)" strokeWidth="0.8" opacity="0.85" />

        {/* Delicate golden leaves and buds around the perimeter */}
        {/* Top sprigs */}
        <path d="M 60 22 Q 57 14 53 17 Q 56 22 60 22 Z" fill="#C89726" />
        <path d="M 100 12 Q 103 6 107 9 Q 104 13 100 12 Z" fill="#C89726" />
        <path d="M 142 22 Q 146 16 150 19 Q 145 24 142 22 Z" fill="#C89726" />
        {/* Bottom sprigs */}
        <path d="M 40 148 Q 34 153 38 156 Q 42 150 40 148 Z" fill="#C89726" />
        <path d="M 158 146 Q 164 152 161 155 Q 156 150 158 146 Z" fill="#C89726" />
        <path d="M 98 188 Q 102 195 106 191 Q 101 187 98 188 Z" fill="#C89726" />
        <circle cx="50" cy="160" r="1.8" fill="#C89726" />
        <circle cx="150" cy="156" r="1.8" fill="#C89726" />
        <circle cx="178" cy="90" r="1.8" fill="#C89726" />
        <circle cx="22" cy="105" r="1.8" fill="#C89726" />

        {/* Monogram A and C in bright elegant cyan serif */}
        <g id="monogram">
          {/* Letter A */}
          <path
            d="M 50 106 L 78 48 L 84 48 L 102 106 L 91 106 L 86 90 L 62 90 L 58 106 Z M 66 79 L 83 79 L 75 56 Z"
            fill="url(#cyanAc)"
          />
          {/* Letter C */}
          <path
            d="M 152 74 C 147 61, 134 52, 118 52 C 95 52, 82 72, 82 100 C 82 128, 97 148, 120 148 C 137 148, 149 137, 154 125 L 142 120 C 138 128, 131 134, 120 134 C 105 134, 96 119, 96 100 C 96 81, 106 66, 120 66 C 130 66, 138 72, 142 80 Z"
            fill="url(#cyanAc)"
          />
        </g>

        {/* White banner ribbon band across middle */}
        <rect x="34" y="94" width="132" height="22" fill="#FFFFFF" rx="2" />

        {/* Text 'Arte Crafts' in delicate script font */}
        <text
          x="100"
          y="110"
          textAnchor="middle"
          fill="#1C1917"
          style={{
            fontFamily: "'Great Vibes', 'Playfair Display', cursive, serif",
            fontSize: '20px',
            letterSpacing: '0.5px',
          }}
        >
          Arte Crafts
        </text>
      </svg>
    </div>
  );

  if (variant === 'icon-only') {
    return <div className={`inline-flex items-center ${className}`}>{Emblem}</div>;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {Emblem}
      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={`${currentSize.title} font-serif tracking-tight font-semibold text-stone-800 leading-tight flex items-center gap-1`}
          >
            Arte<span className="text-rose-600 font-normal">Crafts</span>
          </span>
          <span
            className={`${currentSize.subtitle} uppercase tracking-[0.2em] font-medium text-rose-500/90 leading-none`}
          >
            Diseño & Artesanía
          </span>
        </div>
      )}
    </div>
  );
};
