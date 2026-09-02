import React from 'react';
import { X, RotateCcw, Check, Sparkles } from 'lucide-react';
import { Category, FilterState, SortOption } from '../types';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (newFilters: FilterState) => void;
  onResetFilters: () => void;
  categories: Category[];
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  onResetFilters,
  categories,
}) => {
  if (!isOpen) return null;

  const [localFilters, setLocalFilters] = React.useState<FilterState>(filters);

  // Sync when opening
  React.useEffect(() => {
    setLocalFilters(filters);
  }, [filters, isOpen]);

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Sheet Container */}
      <div
        id="filter-modal-sheet"
        className="relative bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 border border-rose-100 flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-rose-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Filtrar & Ordenar
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-rose-50"
            >
              <RotateCcw size={13} />
              <span>Restablecer</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto p-5 space-y-5 divide-y divide-rose-50">
          {/* Categories */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              Categoría
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    setLocalFilters({ ...localFilters, category: cat.id })
                  }
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    localFilters.category === cat.id
                      ? 'bg-rose-500 text-white border-rose-500 font-semibold shadow-xs'
                      : 'bg-white text-stone-600 border-stone-200 hover:border-rose-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="pt-4 space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              Ordenar Por
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'featured', label: 'Más destacados' },
                { id: 'recent', label: 'Más recientes' },
                { id: 'price-asc', label: 'Precio: Menor a Mayor' },
                { id: 'price-desc', label: 'Precio: Mayor a Menor' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    setLocalFilters({
                      ...localFilters,
                      sortBy: opt.id as SortOption,
                    })
                  }
                  className={`text-xs p-2.5 rounded-xl border text-left transition-all ${
                    localFilters.sortBy === opt.id
                      ? 'border-rose-400 bg-rose-50/70 text-rose-700 font-semibold'
                      : 'border-stone-200 text-stone-600 hover:border-rose-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="pt-4 space-y-3">
            <div className="flex justify-between items-center">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
                Rango de Precio
              </label>
              <span className="text-xs font-bold text-rose-600">
                Hasta ${localFilters.maxPrice}
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="60"
              step="2"
              value={localFilters.maxPrice}
              onChange={(e) =>
                setLocalFilters({
                  ...localFilters,
                  maxPrice: Number(e.target.value),
                })
              }
              className="w-full accent-rose-500 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-stone-400">
              <span>$10 min</span>
              <span>$60 max</span>
            </div>
          </div>

          {/* Toggles: Availability, Featured, New */}
          <div className="pt-4 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              Filtros Especiales
            </label>

            {/* In stock only */}
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 hover:border-rose-200 cursor-pointer">
              <span className="text-xs font-medium text-stone-700">
                Solo productos en stock
              </span>
              <input
                type="checkbox"
                checked={localFilters.onlyInStock}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    onlyInStock: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-rose-500 rounded"
              />
            </label>

            {/* Featured only */}
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 hover:border-rose-200 cursor-pointer">
              <span className="text-xs font-medium text-stone-700">
                Solo productos destacados
              </span>
              <input
                type="checkbox"
                checked={localFilters.onlyFeatured}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    onlyFeatured: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-rose-500 rounded"
              />
            </label>

            {/* New arrivals only */}
            <label className="flex items-center justify-between p-2.5 rounded-xl border border-stone-200 hover:border-rose-200 cursor-pointer">
              <span className="text-xs font-medium text-stone-700">
                Solo novedades recientes
              </span>
              <input
                type="checkbox"
                checked={localFilters.onlyNew}
                onChange={(e) =>
                  setLocalFilters({
                    ...localFilters,
                    onlyNew: e.target.checked,
                  })
                }
                className="w-4 h-4 accent-rose-500 rounded"
              />
            </label>
          </div>
        </div>

        {/* Footer Apply */}
        <div className="p-4 border-t border-rose-100 bg-white">
          <button
            type="button"
            onClick={handleApply}
            className="w-full py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm rounded-2xl shadow-sm transition-all"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};
