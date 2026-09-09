import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  MessageCircle,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, OrderCustomerInfo } from '../types';
import { catalogStore } from '../services/catalogStore';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onOrderSuccess: (orderData: {
    orderNumber: string;
    customer: OrderCustomerInfo;
    items: CartItem[];
    total: number;
  }) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items,
  onOrderSuccess,
}) => {
  if (!isOpen) return null;

  const [customer, setCustomer] = useState<OrderCustomerInfo>({
    name: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    notes: '',
    paymentMethod: 'whatsapp',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );
  const shipping = subtotal >= 45.0 ? 0 : 4.5;
  const total = subtotal + shipping;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer.name.trim() || !customer.phone.trim()) return;

    setIsSubmitting(true);

    const orderNumber = `AC-${Math.floor(100000 + Math.random() * 900000)}`;

    // Confetti effect
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#F472B6', '#FBCFE8', '#D4AF37', '#00E1D9'],
    });

    setTimeout(() => {
      setIsSubmitting(false);

      // Save order to storage
      catalogStore.createOrder({
        orderNumber,
        customer,
        items,
        total,
        notes: customer.notes,
      });

      // If user selected WhatsApp, prepare friendly WhatsApp message
      if (customer.paymentMethod === 'whatsapp') {
        const productListText = items
          .map(
            (i) =>
              `• ${i.quantity}x ${i.product.name}${
                i.selectedVariant ? ` (${i.selectedVariant})` : ''
              } - $${(i.product.price * i.quantity).toFixed(2)}`
          )
          .join('\n');

        const message = encodeURIComponent(
          `¡Hola ArteCrafts! 🌸\n` +
            `Deseo confirmar mi pedido #${orderNumber}:\n\n` +
            `👤 Cliente: ${customer.name}\n` +
            `📱 Teléfono: ${customer.phone}\n` +
            `📍 Dirección: ${customer.address}, ${customer.city}\n\n` +
            `🛍️ Productos:\n${productListText}\n\n` +
            `💵 Total: $${total.toFixed(2)}\n` +
            `${customer.notes ? `📝 Notas: ${customer.notes}\n` : ''}` +
            `\n¿Me indican los detalles para coordinar el pago y envío? Muchas gracias.`
        );

        // Open WhatsApp link in new window/tab safely
        window.open(`https://wa.me/?text=${message}`, '_blank');
      }

      onOrderSuccess({
        orderNumber,
        customer,
        items,
        total,
      });
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fade-in">
      {/* Backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Modal Box */}
      <div
        id="checkout-modal-card"
        className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden z-10 border border-rose-100 flex flex-col max-h-[94vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100 flex items-center justify-between bg-gradient-to-r from-rose-50/50 via-white to-pink-50/30">
          <div>
            <h3 className="font-serif text-xl font-bold text-stone-900 flex items-center gap-1.5">
              <span>Finalizar Pedido</span>
              <Sparkles size={16} className="text-rose-500" />
            </h3>
            <p className="text-xs text-stone-500">
              Completa tus datos para preparar tus piezas con dedicación
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Customer information */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">
              1. Datos de Entrega
            </h4>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Nombre Completo *
              </label>
              <input
                type="text"
                required
                value={customer.name}
                onChange={(e) =>
                  setCustomer({ ...customer, name: e.target.value })
                }
                placeholder="Ej. Sofía Hernández"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-rose-200 bg-rose-50/20 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all text-stone-800"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Teléfono / WhatsApp *
                </label>
                <input
                  type="tel"
                  required
                  value={customer.phone}
                  onChange={(e) =>
                    setCustomer({ ...customer, phone: e.target.value })
                  }
                  placeholder="+52 / +54 / +57..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-rose-200 bg-rose-50/20 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all text-stone-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  value={customer.email}
                  onChange={(e) =>
                    setCustomer({ ...customer, email: e.target.value })
                  }
                  placeholder="sofia@ejemplo.com"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-rose-200 bg-rose-50/20 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all text-stone-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Dirección o Referencia
                </label>
                <input
                  type="text"
                  value={customer.address}
                  onChange={(e) =>
                    setCustomer({ ...customer, address: e.target.value })
                  }
                  placeholder="Calle, número, colonia"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-rose-200 bg-rose-50/20 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all text-stone-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={customer.city}
                  onChange={(e) =>
                    setCustomer({ ...customer, city: e.target.value })
                  }
                  placeholder="Tu ciudad"
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-rose-200 bg-rose-50/20 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all text-stone-800"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Dedicatoria o Notas Especiales
              </label>
              <textarea
                rows={2}
                value={customer.notes}
                onChange={(e) =>
                  setCustomer({ ...customer, notes: e.target.value })
                }
                placeholder="¿Deseas empaque para regalo o tarjeta personalizada? Escríbenos aquí."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-rose-200 bg-rose-50/20 focus:outline-none focus:ring-2 focus:ring-rose-300 focus:bg-white transition-all text-stone-800"
              />
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-2 pt-2 border-t border-rose-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700">
              2. Método de Pedido & Pago
            </h4>

            <div className="grid grid-cols-1 gap-2">
              <label
                className={`flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${
                  customer.paymentMethod === 'whatsapp'
                    ? 'border-emerald-400 bg-emerald-50/60 shadow-xs'
                    : 'border-stone-200 hover:border-rose-200 bg-white'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={customer.paymentMethod === 'whatsapp'}
                  onChange={() =>
                    setCustomer({ ...customer, paymentMethod: 'whatsapp' })
                  }
                  className="accent-emerald-600"
                />
                <div className="flex items-center gap-2.5 flex-1">
                  <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0">
                    <MessageCircle size={17} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                      Confirmar por WhatsApp
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                        Recomendado
                      </span>
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Te respondemos de inmediato para afinar detalles y acordar tu entrega.
                    </p>
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Order Summary box */}
          <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 text-xs space-y-1.5">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} piezas):</span>
              <span className="font-semibold text-stone-800">
                ${subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Envío:</span>
              <span className="font-semibold text-stone-800">
                {shipping === 0 ? 'Gratis' : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="pt-2 border-t border-rose-200/70 flex justify-between text-sm font-bold text-stone-900">
              <span>Total a pagar:</span>
              <span className="text-rose-600 text-base">${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm rounded-2xl shadow-md shadow-rose-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-98"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Preparando tu pedido...</span>
            ) : (
              <>
                <CheckCircle size={18} />
                <span>Confirmar y Enviar Pedido</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
