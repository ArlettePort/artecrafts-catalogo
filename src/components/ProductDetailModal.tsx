import React, { useState } from 'react';
import {
  X,
  Heart,
  ShoppingBag,
  Plus,
  Minus,
  Check,
  Sparkles,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
} from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number, selectedVariant?: string) => void;
  allProducts: Product[];
  onSelectRelatedProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  allProducts,
  onSelectRelatedProduct,
}) => {
  if (!isOpen || !product) return null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<string | undefined>(
    product.variants?.options.find((o) => o.inStock)?.name || product.variants?.options[0]?.name
  );
  const [addedToast, setAddedToast] = useState(false);

  const isOutOfStock = product.manageStock !== false && product.stock <= 0;

  // Related products from the same category
  const relatedProducts = allProducts
    .filter((p) => p.id !== product.id && p.category === product.category)
    .slice(0, 3);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(product, quantity, selectedVariant);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Card / Bottom Sheet on mobile */}
      <div
        id="product-detail-modal"
        className="relative bg-white w-full sm:max-w-2xl md:max-w-3xl rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col transition-all duration-300 border border-rose-100"
      >
        {/* Header bar with close & favorite */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-white/95 backdrop-blur-sm border-b border-rose-100/70">
          <div className="flex items-center gap-2">
            {product.category && product.category !== product.id && (
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-100">
                {product.category}
              </span>
            )}
            {product.isNew && (
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pink-100 text-pink-700">
                Nuevo
              </span>
            )}
            {product.isFeatured && !product.isNew && (
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                Destacado
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => onToggleFavorite(product)}
              className={`p-2 rounded-full transition-colors ${
                isFavorite
                  ? 'text-rose-600 bg-rose-50'
                  : 'text-stone-400 hover:text-rose-600 hover:bg-stone-50'
              }`}
              title={isFavorite ? 'En favoritos' : 'Guardar en favoritos'}
            >
              <Heart size={20} className={isFavorite ? 'fill-rose-500' : ''} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Main Grid: Gallery & Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Gallery */}
            <div className="space-y-3">
              {/* Primary Image */}
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-rose-50/40 border border-rose-100/60 shadow-xs">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover object-center transition-all duration-300"
                />
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-xs flex items-center justify-center">
                    <span className="bg-white text-stone-900 font-bold px-4 py-1.5 rounded-full text-sm shadow-md">
                      Agotado Temporalmente
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {product.images.length > 1 && (
                <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                        selectedImageIndex === idx
                          ? 'border-rose-500 ring-2 ring-rose-200'
                          : 'border-rose-100 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Miniatura ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="flex flex-col space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex items-center text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < Math.floor(product.rating)
                            ? 'fill-amber-400 stroke-amber-400'
                            : 'stroke-stone-300 text-stone-300'
                        }
                      />
                    ))}
                  </div>
                  <span className="text-xs text-stone-500 font-medium">
                    {product.rating} ({product.reviewsCount} reseñas)
                  </span>
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900 leading-tight">
                  {product.name}
                </h2>

                {/* Price Display */}
                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-2xl sm:text-3xl font-bold text-rose-600">
                    ${product.price.toFixed(2)}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-sm text-stone-400 line-through">
                      ${product.originalPrice.toFixed(2)}
                    </span>
                  )}
                  {product.originalPrice && (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Ahorras ${(product.originalPrice - product.price).toFixed(2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Stock status */}
              <div className="flex items-center gap-2 text-xs">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 text-stone-500 bg-stone-100 px-2.5 py-1 rounded-full font-medium">
                    <span className="w-2 h-2 rounded-full bg-stone-400" />
                    Sin existencias por el momento
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-medium border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    En inventario ({product.stock} unidades listas para envío)
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-sm text-stone-600 leading-relaxed">
                {product.description}
              </p>

              {/* Variants Selector */}
              {product.variants && (
                <div className="space-y-2 pt-2 border-t border-rose-50">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600">
                    {product.variants.type}:{' '}
                    <span className="text-rose-600 font-normal">
                      {selectedVariant || 'Elige una opción'}
                    </span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.options.map((opt) => (
                      <button
                        key={opt.id}
                        disabled={!opt.inStock}
                        onClick={() => setSelectedVariant(opt.name)}
                        className={`text-xs px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${
                          selectedVariant === opt.name
                            ? 'bg-rose-50 border-rose-400 text-rose-700 font-semibold ring-1 ring-rose-300'
                            : opt.inStock
                            ? 'bg-white border-stone-200 text-stone-700 hover:border-rose-200'
                            : 'bg-stone-50 border-stone-100 text-stone-300 cursor-not-allowed line-through'
                        }`}
                      >
                        {opt.name}
                        {selectedVariant === opt.name && (
                          <Check size={12} className="text-rose-600" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Materials & Details Accordion / Pills */}
              {product.materials && (
                <div className="pt-2 border-t border-rose-50">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-1.5">
                    Detalles Artesanales:
                  </h4>
                  <ul className="text-xs text-stone-600 space-y-1">
                    {product.materials.map((mat, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <Sparkles size={11} className="text-rose-400 shrink-0" />
                        <span>{mat}</span>
                      </li>
                    ))}
                    {product.dimensions && (
                      <li className="flex items-center gap-1.5">
                        <Sparkles size={11} className="text-rose-400 shrink-0" />
                        <span>Dimensiones: {product.dimensions}</span>
                      </li>
                    )}
                  </ul>
                </div>
              )}

              {/* Quantity Stepper & Add to Cart */}
              <div className="pt-3 border-t border-rose-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Stepper */}
                <div className="flex items-center justify-between border border-rose-200 rounded-2xl bg-white px-2 py-1 sm:w-32">
                  <button
                    type="button"
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="font-semibold text-stone-800 text-sm px-2">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={quantity >= product.stock || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-stone-500 hover:text-rose-600 hover:bg-rose-50 transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Primary Add Button */}
                <button
                  type="button"
                  id="modal-add-to-cart-btn"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 px-6 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-98 ${
                    isOutOfStock
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed shadow-none'
                      : addedToast
                      ? 'bg-emerald-600 text-white shadow-emerald-200'
                      : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200'
                  }`}
                >
                  {addedToast ? (
                    <>
                      <Check size={18} className="animate-bounce" />
                      <span>¡Agregado con éxito!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag size={18} />
                      <span>
                        {isOutOfStock
                          ? 'Agotado'
                          : `Agregar al Carrito • $${(product.price * quantity).toFixed(2)}`}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Guarantees */}
              <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px] text-stone-500">
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-rose-50/50">
                  <Truck size={15} className="text-rose-500" />
                  <span>Envío Seguro</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-rose-50/50">
                  <ShieldCheck size={15} className="text-rose-500" />
                  <span>Calidad Garantizada</span>
                </div>
                <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-rose-50/50">
                  <RotateCcw size={15} className="text-rose-500" />
                  <span>Empaque de Regalo</span>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="pt-6 border-t border-rose-100">
              <h3 className="font-serif text-lg font-bold text-stone-800 mb-3">
                También te podría encantar
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => {
                      onSelectRelatedProduct(rel);
                      setSelectedImageIndex(0);
                      setQuantity(1);
                      setSelectedVariant(rel.variants?.options[0]?.name);
                    }}
                    className="group cursor-pointer rounded-2xl border border-rose-100/70 p-2 hover:border-rose-300 hover:shadow-sm bg-white transition-all"
                  >
                    <div className="aspect-square w-full rounded-xl overflow-hidden bg-rose-50/40 mb-2">
                      <img
                        src={rel.images[0]}
                        alt={rel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <p className="font-serif text-xs font-semibold text-stone-800 line-clamp-1 group-hover:text-rose-600">
                      {rel.name}
                    </p>
                    <p className="text-xs font-bold text-rose-600 mt-0.5">
                      ${rel.price.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
