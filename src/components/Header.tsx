import React from 'react';
import { Search, Heart, ShoppingBag, Sparkles, ShieldCheck } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { Category } from '../types';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenFavorites: () => void;
  onOpenCart: () => void;
  onNavigateHome: () => void;
  onSelectCategory: (categoryId: string) => void;
  onOpenAdmin: () => void;
  isAdminAuthenticated?: boolean;
  favoritesCount: number;
  cartCount: number;
  categories?: Category[];
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenFavorites,
  onOpenCart,
  onNavigateHome,
  onSelectCategory,
  onOpenAdmin,
  isAdminAuthenticated = false,
  favoritesCount,
  cartCount,
  categories = [],
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-rose-100 transition-all">
      {/* Top micro-announcement bar */}
      <div className="bg-gradient-to-r from-rose-50 via-pink-50 to-rose-100/70 border-b border-rose-100/60 py-1.5 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="hidden sm:block w-24" />
          <p className="text-[11px] sm:text-xs text-rose-800/90 font-medium tracking-wide flex items-center justify-center gap-1.5 mx-auto">
            <Sparkles size={12} className="text-rose-500 animate-pulse" />
            <span>Piezas artesanales 100% hechas a mano con amor y dedicación</span>
            <span className="hidden sm:inline text-rose-400">•</span>
            <span className="hidden sm:inline font-semibold text-rose-700">Envío gratis desde $45</span>
          </p>
          <button
            type="button"
            onClick={onOpenAdmin}
            id="top-bar-admin-link"
            className="text-[10px] font-bold text-rose-700 hover:text-rose-900 bg-white/80 hover:bg-white px-2.5 py-0.5 rounded-full border border-rose-200/80 transition-all flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
            title="Panel de Administración"
          >
            <ShieldCheck size={12} className={isAdminAuthenticated ? 'text-emerald-600' : 'text-rose-600'} />
            <span>{isAdminAuthenticated ? 'Panel Admin' : 'Acceso Admin'}</span>
          </button>
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <button
          onClick={onNavigateHome}
          id="header-brand-logo-btn"
          className="focus:outline-none transition-transform active:scale-95 text-left flex items-center"
        >
          <BrandLogo size="md" variant="horizontal" />
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-stone-600">
          <button
            onClick={onNavigateHome}
            className="hover:text-rose-600 transition-colors py-1"
          >
            Inicio
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onSelectCategory(category.id)}
              className="hover:text-rose-600 transition-colors py-1"
            >
              {category.name}
            </button>
          ))}
        </nav>

        {/* Action icons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick search button */}
          <button
            id="header-search-btn"
            onClick={onOpenSearch}
            className="p-2 sm:px-3.5 sm:py-2 text-stone-600 hover:text-rose-600 hover:bg-rose-50/80 rounded-full transition-all flex items-center gap-2 border border-transparent hover:border-rose-200"
            title="Buscar productos"
          >
            <Search size={19} className="stroke-[2.2px]" />
            <span className="hidden sm:inline text-xs text-stone-500 font-normal">
              Buscar artesanías...
            </span>
          </button>

          {/* Favorites shortcut */}
          <button
            id="header-favorites-btn"
            onClick={onOpenFavorites}
            className="relative p-2 text-stone-600 hover:text-rose-600 hover:bg-rose-50/80 rounded-full transition-all"
            title="Ver favoritos"
          >
            <Heart size={20} className="stroke-[2px]" />
            {favoritesCount > 0 && (
              <span className="absolute top-0 right-0 min-w-[17px] h-[17px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Cart shortcut */}
          <button
            id="header-cart-btn"
            onClick={onOpenCart}
            className="relative p-2.5 bg-rose-50 hover:bg-rose-100/80 text-rose-700 border border-rose-200/80 rounded-full transition-all shadow-xs flex items-center gap-1.5"
            title="Ver carrito de compras"
          >
            <ShoppingBag size={19} className="stroke-[2.2px]" />
            {cartCount > 0 && (
              <span className="min-w-[18px] h-[18px] px-1 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
