import React from 'react';
import { CheckCircle2, Sparkles, ShoppingBag, Copy, Check } from 'lucide-react';
import { CartItem, OrderCustomerInfo } from '../types';

interface OrderSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderData: {
    orderNumber: string;
    customer: OrderCustomerInfo;
    items: CartItem[];
    total: number;
  } | null;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  isOpen,
  onClose,
  orderData,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !orderData) return null;

  const handleCopyOrderNumber = () => {
    navigator.clipboard.writeText(orderData.orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden z-10 border border-rose-100 p-6 text-center space-y-5">
        {/* Animated Celebration Icon */}
        <div className="mx-auto w-16 h-16 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 shadow-inner">
          <CheckCircle2 size={36} className="text-emerald-500 animate-bounce" />
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-rose-500 flex items-center justify-center gap-1">
            <Sparkles size={13} />
            ¡Gracias por apoyar lo hecho a mano!
          </span>
          <h2 className="font-serif text-2xl font-bold text-stone-900 mt-1">
            ¡Pedido Recibido con Éxito!
          </h2>
          <p className="text-xs text-stone-600 mt-1">
            Hemos registrado tu pedido. En breve nos pondremos en contacto contigo
            para enviarte tus piezas con empaque especial.
          </p>
        </div>

        {/* Order code pill */}
        <div className="inline-flex items-center gap-2 bg-rose-50 px-4 py-2 rounded-2xl border border-rose-200">
          <span className="text-xs text-stone-500">Número de pedido:</span>
          <strong className="text-sm font-mono text-rose-700 font-bold">
            {orderData.orderNumber}
          </strong>
          <button
            onClick={handleCopyOrderNumber}
            className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
            title="Copiar número"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
          </button>
        </div>

        {/* Customer & Item details preview */}
        <div className="bg-stone-50/70 rounded-2xl p-4 text-left text-xs space-y-2 border border-stone-100">
          <div className="flex justify-between text-stone-600">
            <span>Destinatario:</span>
            <span className="font-semibold text-stone-800">
              {orderData.customer.name}
            </span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Contacto:</span>
            <span className="font-semibold text-stone-800">
              {orderData.customer.phone}
            </span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Método:</span>
            <span className="font-semibold text-stone-800 capitalize">
              {orderData.customer.paymentMethod}
            </span>
          </div>
          <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-stone-900 text-sm">
            <span>Total Confirmado:</span>
            <span className="text-rose-600">${orderData.total.toFixed(2)}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 px-4 bg-rose-500 hover:bg-rose-600 text-white font-semibold text-sm rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <ShoppingBag size={17} />
          <span>Seguir Explorando el Catálogo</span>
        </button>
      </div>
    </div>
  );
};
