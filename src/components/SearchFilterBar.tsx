import React from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  RotateCcw,
  ArrowDownUp,
} from 'lucide-react';
import { Category, FilterState, SortOption } from '../types';

interface SearchFilterBarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  categories: Category[];
  totalResults: number;
  onOpenAdvancedFilter: () => void;
  activeFilterCount: number;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  filters,
  onFilterChange,
  totalResults,
  onOpenAdvancedFilter,
  activeFilterCount,
}) => {
  return (
    <div className="space-y-3">
      {/* Mobile Search Bar */}
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            id="catalog-search-input"
            value={filters.searchQuery}
            onChange={(e) =>
              onFilterChange({ ...filters, searchQuery: e.target.value })
            }
            placeholder="Buscar velas, tazas, joyería, cuadernos..."
            className="w-full pl-10 pr-9 py-2.5 sm:py-3 bg-white border border-rose-200/80 rounded-2xl text-sm placeholder:text-stone-400 text-stone-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 transition-all"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ ...filters, searchQuery: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-700"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Trigger Button */}
        <button
          type="button"
          id="open-filter-modal-btn"
          onClick={onOpenAdvancedFilter}
          className={`relative px-3.5 py-2.5 sm:py-3 rounded-2xl border flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all shrink-0 ${
            activeFilterCount > 0
              ? 'bg-rose-500 text-white border-rose-500 shadow-xs shadow-rose-200'
              : 'bg-white text-stone-700 border-rose-200/80 hover:border-rose-300 hover:bg-rose-50/40'
          }`}
        >
          <SlidersHorizontal size={16} />
          <span className="hidden xs:inline">Filtros</span>
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-white text-rose-600 text-[11px] font-bold flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Quick Sort & Result Count Bar */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          Mostrando <strong className="text-stone-800 font-semibold">{totalResults}</strong>{' '}
          {totalResults === 1 ? 'producto' : 'productos'}
        </span>

        {/* Inline Sort dropdown */}
        <div className="flex items-center gap-1.5">
          <ArrowDownUp size={13} className="text-rose-500" />
          <select
            id="catalog-sort-select"
            value={filters.sortBy}
            onChange={(e) =>
              onFilterChange({ ...filters, sortBy: e.target.value as SortOption })
            }
            className="bg-transparent font-medium text-stone-700 focus:outline-none cursor-pointer hover:text-rose-600"
          >
            <option value="featured">Más destacados</option>
            <option value="recent">Más recientes</option>
            <option value="price-asc">Precio: menor a mayor</option>
            <option value="price-desc">Precio: mayor a menor</option>
          </select>
        </div>
      </div>
    </div>
  );
};
