import React from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { CartItem } from '../types';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number, variant?: string) => void;
  onRemoveItem: (productId: string, variant?: string) => void;
  onProceedToCheckout: () => void;
  onContinueShopping: () => void;
}

const FREE_SHIPPING_THRESHOLD = 45.0;

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onContinueShopping,
}) => {
  if (!isOpen) return null;

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const amountForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 4.5;
  const total = subtotal + shippingCost;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/50 backdrop-blur-xs flex justify-end animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div
        id="cart-drawer-panel"
        className="relative w-full max-w-md bg-[#FFFDFD] h-full shadow-2xl flex flex-col z-10 border-l border-rose-100"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-rose-100/80 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-rose-50 flex items-center justify-center text-rose-600">
              <ShoppingBag size={18} />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Tu Carrito
              </h2>
              <p className="text-xs text-stone-500">
                {items.length} {items.length === 1 ? 'artesanía' : 'artesanías'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Free shipping banner / progress */}
        <div className="px-5 py-3 bg-gradient-to-r from-rose-50/70 via-pink-50/50 to-rose-50/70 border-b border-rose-100/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-stone-700 flex items-center gap-1">
              <Sparkles size={13} className="text-rose-500" />
              {amountForFreeShipping === 0 ? (
                <span className="text-emerald-700 font-semibold">
                  ¡Genial! Calificas para Envío Gratis
                </span>
              ) : (
                <span>
                  Agrega{' '}
                  <strong className="text-rose-600">
                    ${amountForFreeShipping.toFixed(2)}
                  </strong>{' '}
                  más para Envío Gratis
                </span>
              )}
            </span>
            <span className="text-[11px] font-bold text-rose-500">
              {Math.round(freeShippingProgress)}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-rose-100/70 rounded-full overflow-hidden">
            <div
              className="h-full bg-rose-500 transition-all duration-300 rounded-full"
              style={{ width: `${freeShippingProgress}%` }}
            />
          </div>
        </div>

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-rose-50">
          {items.length === 0 ? (
            /* Empty state */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-400">
                <ShoppingBag size={36} className="stroke-[1.5px]" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-800">
                  Tu carrito está vacío
                </h3>
                <p className="text-xs text-stone-500 max-w-xs mt-1 leading-relaxed">
                  Descubre piezas únicas hechas a mano y llena tu hogar de calidez y encanto.
                </p>
              </div>
              <button
                type="button"
                onClick={onContinueShopping}
                className="mt-2 px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold rounded-full shadow-sm transition-all"
              >
                Explorar Catálogo
              </button>
            </div>
          ) : (
            /* Items list */
            items.map((item) => (
              <div
                key={`${item.product.id}-${item.selectedVariant || 'none'}`}
                className="py-3.5 flex gap-3 items-center"
              >
                <div className="w-18 h-18 rounded-2xl overflow-hidden bg-rose-50/40 border border-rose-100 shrink-0">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="font-serif text-sm font-semibold text-stone-900 truncate">
                    {item.product.name}
                  </h4>
                  {item.selectedVariant && (
                    <p className="text-[11px] text-rose-500 font-medium truncate">
                      {item.selectedVariant}
                    </p>
                  )}
                  <p className="text-xs font-bold text-stone-800 mt-0.5">
                    ${item.product.price.toFixed(2)}
                  </p>

                  {/* Quantity Stepper & Remove */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center border border-rose-200/80 rounded-xl bg-white px-1">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateQuantity(
                            item.product.id,
                            item.quantity - 1,
                            item.selectedVariant
                          )
                        }
                        className="w-6 h-6 flex items-center justify-center text-stone-500 hover:text-rose-600 transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-bold text-stone-800 px-2 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        disabled={item.quantity >= item.product.stock}
                        onClick={() =>
                          onUpdateQuantity(
                            item.product.id,
                            item.quantity + 1,
                            item.selectedVariant
                          )
                        }
                        className="w-6 h-6 flex items-center justify-center text-stone-500 hover:text-rose-600 transition-colors disabled:opacity-30"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onRemoveItem(item.product.id, item.selectedVariant)
                      }
                      className="p-1.5 text-stone-400 hover:text-rose-600 transition-colors rounded-lg"
                      title="Eliminar del carrito"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Summary & Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-rose-100 bg-white space-y-3">
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-stone-800">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Envío estimado</span>
                <span className="font-semibold text-stone-800">
                  {shippingCost === 0 ? (
                    <span className="text-emerald-600 font-bold">¡Gratis!</span>
                  ) : (
                    `$${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              <div className="pt-2 border-t border-rose-100 flex justify-between text-base font-bold text-stone-900">
                <span>Total</span>
                <span className="text-rose-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              id="proceed-checkout-btn"
              onClick={onProceedToCheckout}
              className="w-full py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold rounded-2xl shadow-md shadow-rose-200/60 flex items-center justify-center gap-2 transition-all active:scale-98"
            >
              <span>Proceder al Pedido</span>
              <ArrowRight size={17} />
            </button>

            <button
              type="button"
              onClick={onContinueShopping}
              className="w-full py-2 text-center text-xs font-medium text-stone-500 hover:text-rose-600 transition-colors"
            >
              Continuar comprando
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-400 pt-1">
              <ShieldCheck size={12} className="text-rose-400" />
              <span>Compra 100% segura y garantizada por ArteCrafts</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
