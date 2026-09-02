import React, { useState } from 'react';
import { Eye, X, Smartphone, Monitor, Sparkles, Heart, ShoppingBag, CheckCircle } from 'lucide-react';
import { Product } from '../../types';
import { ProductCard } from '../ProductCard';

interface AdminProductPreviewModalProps {
  isOpen: boolean;
  product: Product | null;
  onClose: () => void;
}

export const AdminProductPreviewModal: React.FC<AdminProductPreviewModalProps> = ({
  isOpen,
  product,
  onClose,
}) => {
  const [previewMode, setPreviewMode] = useState<'card' | 'detail'>('detail');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!isOpen || !product) return null;

  const images = product.images && product.images.length > 0
    ? product.images
    : [product.mainImage || 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80'];

  const currentImage = images[selectedImageIndex] || images[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-900/60 backdrop-blur-xs overflow-y-auto animate-fade-in">
      <div
        className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-rose-100 flex flex-col max-h-[92vh] overflow-hidden my-auto"
        role="dialog"
      >
        {/* Top bar */}
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-4 border-b border-rose-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-100 text-rose-700">
              <Eye size={16} />
            </span>
            <div>
              <h3 className="font-serif text-base font-bold text-stone-900">
                Vista Previa para Clientes
              </h3>
              <p className="text-[11px] text-stone-500">
                Así aparecerá este producto en la tienda ArteCrafts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode switch */}
            <div className="flex bg-white/80 border border-rose-200/80 rounded-xl p-0.5">
              <button
                type="button"
                onClick={() => setPreviewMode('card')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  previewMode === 'card'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Tarjeta
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode('detail')}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  previewMode === 'detail'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Detalle
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-white rounded-xl transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-7 bg-[#FAF6F6]">
          {previewMode === 'card' ? (
            <div className="max-w-xs mx-auto py-6">
              <p className="text-center text-xs text-stone-500 mb-3 font-medium">
                Vista en la cuadrícula del catálogo:
              </p>
              <ProductCard
                product={product}
                isFavorite={false}
                onToggleFavorite={() => {}}
                onSelectProduct={() => {}}
                onQuickAddToCart={() => {}}
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-rose-100/90 shadow-sm p-5 sm:p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Image Gallery */}
                <div className="space-y-3">
                  <div className="aspect-square rounded-2xl overflow-hidden bg-rose-50/50 border border-rose-100">
                    <img
                      src={currentImage}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {images.map((img, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedImageIndex(idx)}
                          className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                            selectedImageIndex === idx
                              ? 'border-rose-500 shadow-xs scale-105'
                              : 'border-rose-100 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
                        {product.category}
                      </span>
                      {product.isNew && (
                        <span className="text-[10px] font-bold bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
                          Nuevo
                        </span>
                      )}
                      {product.isFeatured && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Destacado
                        </span>
                      )}
                    </div>
                    <h2 className="font-serif text-2xl font-bold text-stone-900 leading-tight">
                      {product.name}
                    </h2>
                  </div>

                  {/* Price */}
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-2xl font-bold text-rose-600 font-serif">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.originalPrice && product.originalPrice > product.price && (
                      <span className="text-sm text-stone-400 line-through">
                        ${product.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>

                  {/* Stock status indicator */}
                  <div className="py-1">
                    {product.manageStock === false ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle size={13} />
                        Personalizado bajo pedido
                      </span>
                    ) : product.stock > 0 ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                        <CheckCircle size={13} />
                        Disponible ({product.stock} unidades en taller)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-stone-100 text-stone-600 border border-stone-300">
                        Agotado
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <div className="border-t border-rose-100 pt-3 text-xs sm:text-sm text-stone-600 leading-relaxed space-y-2">
                    <p>{product.description || 'Sin descripción detallada disponible.'}</p>
                    {product.materials && product.materials.length > 0 && (
                      <p className="text-xs text-stone-500 pt-1">
                        <strong>Materiales:</strong> {product.materials.join(', ')}
                      </p>
                    )}
                    {product.dimensions && (
                      <p className="text-xs text-stone-500">
                        <strong>Dimensiones:</strong> {product.dimensions}
                      </p>
                    )}
                  </div>

                  {/* Mock Add to cart button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={product.stock <= 0 && product.manageStock !== false}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm ${
                        product.stock <= 0 && product.manageStock !== false
                          ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                          : 'bg-rose-500 text-white shadow-rose-500/20'
                      }`}
                    >
                      <ShoppingBag size={15} />
                      <span>
                        {product.stock <= 0 && product.manageStock !== false
                          ? 'Producto Agotado'
                          : 'Agregar al Carrito'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white p-4 border-t border-rose-100 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors cursor-pointer"
          >
            Cerrar Vista Previa
          </button>
        </div>
      </div>
    </div>
  );
};
