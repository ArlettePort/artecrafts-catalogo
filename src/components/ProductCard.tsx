import React from 'react';
import { Heart, Plus, Eye, Star } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onQuickAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
  onSelectProduct,
  onQuickAddToCart,
}) => {
  const isOutOfStock = product.manageStock !== false && product.stock <= 0;
  const displayImage = product.mainImage || (product.images && product.images[0]) || '';

  return (
    <article
      id={`product-card-${product.id}`}
      className="group relative bg-white rounded-2xl border border-rose-100/70 shadow-[0_2px_12px_rgba(244,114,182,0.06)] hover:shadow-[0_8px_24px_rgba(244,114,182,0.12)] hover:border-rose-200 transition-all duration-300 flex flex-col overflow-hidden"
    >
      {/* Image container */}
      <div
        className="relative w-full aspect-square bg-[#FDF7F8] overflow-hidden cursor-pointer"
        onClick={() => onSelectProduct(product)}
      >
        <img
          src={displayImage}
          alt={product.name}
          loading="lazy"
          className={`w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105 ${
            isOutOfStock ? 'grayscale-40 opacity-70' : ''
          }`}
        />

        {/* Gradient overlay on hover for desktop */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start pointer-events-none z-10">
          {isOutOfStock ? (
            <span className="px-2 py-0.5 bg-stone-800/85 backdrop-blur-xs text-white text-[10px] font-semibold tracking-wider uppercase rounded-full">
              Agotado
            </span>
          ) : (
            <>
              {product.isNew && (
                <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-semibold tracking-wider uppercase rounded-full shadow-xs">
                  Nuevo
                </span>
              )}
              {product.isFeatured && !product.isNew && (
                <span className="px-2 py-0.5 bg-amber-500 text-white text-[10px] font-semibold tracking-wider uppercase rounded-full shadow-xs">
                  Destacado
                </span>
              )}
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="px-2 py-0.5 bg-pink-100 text-pink-800 text-[10px] font-bold rounded-full border border-pink-200">
                  Oferta
                </span>
              )}
            </>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          type="button"
          id={`fav-btn-${product.id}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-transform active:scale-90 z-10 backdrop-blur-xs shadow-xs ${
            isFavorite
              ? 'bg-rose-500 text-white shadow-rose-200'
              : 'bg-white/85 text-stone-500 hover:text-rose-500 hover:bg-white'
          }`}
          title={isFavorite ? 'Quitar de favoritos' : 'Guardar en favoritos'}
        >
          <Heart
            size={15}
            className={`${isFavorite ? 'fill-current stroke-rose-500' : 'stroke-[2px]'}`}
          />
        </button>

        {/* Quick View Button for Desktop */}
        <div className="hidden sm:flex absolute inset-x-3 bottom-3 items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-2 group-hover:translate-y-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelectProduct(product);
            }}
            className="w-full py-1.5 px-3 bg-white/95 hover:bg-white text-stone-800 text-xs font-semibold rounded-xl shadow-md border border-rose-100 flex items-center justify-center gap-1.5 backdrop-blur-xs"
          >
            <Eye size={14} className="text-rose-600" />
            <span>Ver detalles</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 sm:p-3.5 flex flex-col flex-1 justify-between bg-white">
        <div className="cursor-pointer" onClick={() => onSelectProduct(product)}>
          {/* Category & Rating */}
          <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
            <span className="capitalize font-medium text-rose-600/80">
              {product.category}
            </span>
            <div className="flex items-center gap-0.5 text-amber-500">
              <Star size={11} className="fill-amber-400 stroke-amber-400" />
              <span className="text-stone-600 font-semibold text-[10px]">
                {product.rating.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Product Name */}
          <h3
            className="font-serif text-sm sm:text-base font-semibold text-stone-800 line-clamp-2 leading-snug group-hover:text-rose-700 transition-colors"
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Short description - only show if not the product ID */}
          {product.shortDescription && product.shortDescription !== product.id && (
            <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5 font-normal">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* Price & Action Row */}
        <div className="mt-3 pt-2.5 border-t border-rose-50 flex items-center justify-between gap-1">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="font-semibold text-base sm:text-lg text-stone-900">
                ${product.price.toFixed(2)}
              </span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-[11px] text-stone-400 line-through">
                  ${product.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
            {product.stock > 0 && product.stock <= 3 && (
              <span className="text-[10px] text-amber-600 font-medium leading-none">
                ¡Solo quedan {product.stock}!
              </span>
            )}
          </div>

          {/* Quick Add Button */}
          <button
            type="button"
            id={`quick-add-btn-${product.id}`}
            disabled={isOutOfStock}
            onClick={() => onQuickAddToCart(product)}
            className={`w-9 h-9 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
              isOutOfStock
                ? 'bg-stone-100 text-stone-300 cursor-not-allowed'
                : 'bg-rose-50 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-200 hover:border-rose-500 active:scale-95 shadow-xs'
            }`}
            title={isOutOfStock ? 'Producto agotado' : 'Añadir al carrito'}
          >
            <Plus size={16} className="stroke-[2.5px]" />
          </button>
        </div>
      </div>
    </article>
  );
};
