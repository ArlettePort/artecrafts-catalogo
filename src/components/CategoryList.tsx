import React from 'react';
import {
  Sparkles,
  Flame,
  Coffee,
  Gem,
  BookOpen,
  Scissors,
  LucideIcon,
} from 'lucide-react';
import { Category } from '../types';

interface CategoryListProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  variant?: 'chips' | 'cards';
}

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles,
  Flame,
  Coffee,
  Gem,
  BookOpen,
  Scissors,
};

export const CategoryList: React.FC<CategoryListProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  variant = 'chips',
}) => {
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.iconName] || Sparkles;
          const isSelected = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`group relative text-left overflow-hidden rounded-2xl p-4 border transition-all duration-300 ${
                isSelected
                  ? 'border-rose-400 bg-rose-50/70 shadow-sm'
                  : 'border-rose-100/80 bg-white hover:border-rose-200 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'bg-rose-50 text-rose-600 group-hover:bg-rose-100'
                  }`}
                >
                  <Icon size={20} />
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                  {cat.itemCount} piezas
                </span>
              </div>
              <h4 className="font-serif font-bold text-base text-stone-800 group-hover:text-rose-700">
                {cat.name}
              </h4>
              <p className="text-xs text-stone-500 line-clamp-1 mt-0.5">
                {cat.tagline}
              </p>
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto no-scrollbar py-1">
      <div className="flex items-center gap-2.5 px-4 sm:px-0 min-w-max">
        {categories.map((cat) => {
          const Icon = ICON_MAP[cat.iconName] || Sparkles;
          const isSelected = selectedCategoryId === cat.id;

          return (
            <button
              key={cat.id}
              id={`cat-chip-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none shrink-0 border ${
                isSelected
                  ? 'bg-rose-500 text-white border-rose-500 shadow-sm shadow-rose-200'
                  : 'bg-white text-stone-700 border-rose-100 hover:border-rose-200 hover:bg-rose-50/50'
              }`}
            >
              <Icon
                size={15}
                className={isSelected ? 'text-white' : 'text-rose-500'}
              />
              <span>{cat.name}</span>
              {cat.id !== 'todos' && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${
                    isSelected
                      ? 'bg-white/25 text-white'
                      : 'bg-rose-50 text-rose-600'
                  }`}
                >
                  {cat.itemCount}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
