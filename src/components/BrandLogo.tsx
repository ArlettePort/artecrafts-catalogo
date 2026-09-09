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
    sm: { icon: 40, title: 'text-lg', subtitle: 'text-[9px]' },
    md: { icon: 56, title: 'text-xl', subtitle: 'text-[10px]' },
    lg: { icon: 80, title: 'text-2xl', subtitle: 'text-xs' },
    xl: { icon: 120, title: 'text-3xl', subtitle: 'text-sm' },
  };

  const currentSize = dimensionMap[size];

  const Emblem = (
    <div
      className="relative flex items-center justify-center select-none shrink-0 rounded-full overflow-hidden"
      style={{ width: currentSize.icon, height: currentSize.icon }}
    >
      <img
        src="/assets/arte-crafts-logo.png"
        alt="Arte Crafts Logo"
        className="w-full h-full object-cover drop-shadow-[0_2px_6px_rgba(244,114,182,0.18)]"
      />
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
