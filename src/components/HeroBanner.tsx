import React from 'react';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';
import { BrandLogo } from './BrandLogo';

interface HeroBannerProps {
  onExploreClick: () => void;
  onFeaturedClick: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onExploreClick,
  onFeaturedClick,
}) => {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-rose-100/70 via-pink-50/50 to-[#FFF9F9] border border-rose-100/90 shadow-sm p-5 sm:p-8">
      {/* Decorative background botanicals and blurs */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-rose-200/40 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-pink-200/30 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="max-w-xl text-center md:text-left space-y-3">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-rose-200/80 shadow-2xs text-rose-700 text-xs font-semibold backdrop-blur-xs">
            <Sparkles size={13} className="text-rose-500" />
            <span>Colección Artesanal Primavera 2026</span>
          </div>

          {/* Heading */}
          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold text-stone-900 leading-tight">
            Cada pieza cuenta una historia hecha a mano
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-md mx-auto md:mx-0">
            En <strong>ArteCrafts</strong> creamos velas botánicas, cerámicas
            artesanales, joyas florales y papelería fina con detalles delicados y
            tonos pastel pensados para inspirarte.
          </p>

          {/* Action buttons */}
          <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
            <button
              type="button"
              onClick={onExploreClick}
              className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-md shadow-rose-200/60 transition-all flex items-center gap-2 active:scale-95"
            >
              <span>Ver Catálogo</span>
              <ArrowRight size={15} />
            </button>
            <button
              type="button"
              onClick={onFeaturedClick}
              className="px-5 py-2.5 bg-white/90 hover:bg-white text-stone-700 hover:text-rose-600 text-xs sm:text-sm font-semibold rounded-2xl border border-rose-200/80 transition-all shadow-xs"
            >
              Destacados
            </button>
          </div>
        </div>

        {/* Brand Emblem Spotlight on the right */}
        <div className="shrink-0 flex flex-col items-center justify-center p-4 bg-white/60 backdrop-blur-xs rounded-3xl border border-rose-100 shadow-xs">
          <BrandLogo size="lg" variant="full" showText={true} />
          <div className="mt-3 flex items-center gap-3 text-[11px] text-stone-500 font-medium">
            <span className="flex items-center gap-1">
              <Heart size={12} className="text-rose-400 fill-rose-300" />
              100% Hecho a Mano
            </span>
            <span>•</span>
            <span>Piezas Únicas</span>
          </div>
        </div>
      </div>
    </div>
  );
};
