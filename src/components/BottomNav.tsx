import React from 'react';
import { Home, Grid, Search, Heart, ShoppingBag } from 'lucide-react';

export type NavTab = 'home' | 'categories' | 'search' | 'favorites' | 'cart';

interface BottomNavProps {
  currentTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  favoritesCount: number;
  cartCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  favoritesCount,
  cartCount,
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Inicio', icon: Home },
    { id: 'categories' as NavTab, label: 'Categorías', icon: Grid },
    { id: 'search' as NavTab, label: 'Buscar', icon: Search },
    {
      id: 'favorites' as NavTab,
      label: 'Favoritos',
      icon: Heart,
      badge: favoritesCount > 0 ? favoritesCount : null,
    },
    {
      id: 'cart' as NavTab,
      label: 'Carrito',
      icon: ShoppingBag,
      badge: cartCount > 0 ? cartCount : null,
    },
  ];

  return (
    <nav
      id="mobile-bottom-nav"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-rose-100 shadow-[0_-4px_20px_rgba(244,114,182,0.08)] pb-safe transition-all"
    >
      <div className="flex items-center justify-around h-16 px-2 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 py-1 transition-all duration-200 focus:outline-none ${
                isActive ? 'text-rose-600 scale-105' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {/* Subtle top indicator bar */}
              {isActive && (
                <span className="absolute -top-2 w-8 h-1 bg-rose-400 rounded-full animate-fade-in" />
              )}

              <div className="relative">
                <Icon
                  size={20}
                  className={`transition-transform duration-200 ${
                    isActive ? 'stroke-[2.3px]' : 'stroke-[1.8px]'
                  }`}
                />
                {tab.badge !== null && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[11px] mt-1 font-medium tracking-tight ${
                  isActive ? 'text-rose-600 font-semibold' : 'text-stone-500'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
