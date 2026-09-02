import React from 'react';
import { Heart, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface FavoritesViewProps {
  favorites: Product[];
  onRemoveFavorite: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onExplore: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favorites,
  onRemoveFavorite,
  onSelectProduct,
  onAddToCart,
  onExplore,
}) => {
  if (favorites.length === 0) {
    return (
      <div className="py-16 px-4 text-center max-w-sm mx-auto space-y-4">
        <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 mx-auto flex items-center justify-center text-rose-400">
          <Heart size={36} className="stroke-[1.5px]" />
        </div>
        <div>
          <h3 className="font-serif text-2xl font-bold text-stone-900">
            Tus Favoritos están vacíos
          </h3>
          <p className="text-xs text-stone-500 mt-1 leading-relaxed">
            Guarda aquí las piezas que te enamoren para encontrarlas fácilmente en cualquier momento.
          </p>
        </div>
        <button
          type="button"
          onClick={onExplore}
          className="mt-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-full shadow-sm transition-all"
        >
          Explorar Catálogo
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900">
          Tus Piezas Favoritas ({favorites.length})
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        {favorites.map((product) => (
          <div
            key={product.id}
            className="bg-white rounded-2xl border border-rose-100 p-3.5 flex gap-3 shadow-xs hover:border-rose-200 transition-all items-center"
          >
            <div
              className="w-20 h-20 rounded-xl overflow-hidden bg-rose-50/40 shrink-0 cursor-pointer"
              onClick={() => onSelectProduct(product)}
            >
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-semibold uppercase text-rose-500">
                {product.category}
              </span>
              <h4
                onClick={() => onSelectProduct(product)}
                className="font-serif text-sm font-semibold text-stone-900 truncate hover:text-rose-600 cursor-pointer"
              >
                {product.name}
              </h4>
              <p className="text-xs font-bold text-stone-900 mt-0.5">
                ${product.price.toFixed(2)}
              </p>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={() => onAddToCart(product)}
                  className="px-3 py-1 bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white rounded-lg text-xs font-semibold border border-rose-200 transition-all flex items-center gap-1 disabled:opacity-40"
                >
                  <ShoppingBag size={12} />
                  <span>{product.stock <= 0 ? 'Agotado' : 'Al Carrito'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => onRemoveFavorite(product)}
                  className="p-1 text-stone-400 hover:text-rose-600 transition-colors"
                  title="Eliminar de favoritos"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
