import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  X,
  Eye,
  Trash2,
  ChevronDown,
  Mail,
  Phone,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { Order } from '../../types';
import { catalogStore } from '../../services/catalogStore';

interface AdminOrdersProps {
  orders: Order[];
  onUpdateOrderStatus: (orderId: string, status: Order['status']) => void;
  onDeleteOrder: (orderId: string) => void;
}

const STATUS_CONFIG = {
  pending: { label: 'Pendiente', color: 'bg-amber-50 text-amber-700', icon: Clock },
  confirmed: { label: 'Confirmado', color: 'bg-blue-50 text-blue-700', icon: CheckCircle2 },
  shipped: { label: 'Enviado', color: 'bg-purple-50 text-purple-700', icon: Truck },
  delivered: { label: 'Entregado', color: 'bg-emerald-50 text-emerald-700', icon: CheckCircle2 },
  cancelled: { label: 'Cancelado', color: 'bg-red-50 text-red-700', icon: X },
};

export const AdminOrders: React.FC<AdminOrdersProps> = ({
  orders,
  onUpdateOrderStatus,
  onDeleteOrder,
}) => {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusConfig = (status: Order['status']) => {
    return STATUS_CONFIG[status];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-rose-100 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Package size={24} />
            Gestión de Pedidos
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Visualiza y gestiona todos los pedidos realizados en tu tienda
          </p>
        </div>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-12 bg-stone-50 rounded-xl border border-stone-200">
          <Package size={40} className="mx-auto text-stone-300 mb-3" />
          <p className="text-stone-600 font-semibold">No hay pedidos aún</p>
          <p className="text-xs text-stone-500 mt-1">
            Los pedidos aparecerán aquí cuando los clientes realicen compras
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const isExpanded = expandedOrderId === order.id;
            const statusConfig = getStatusConfig(order.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all"
              >
                {/* Order Header */}
                <button
                  onClick={() =>
                    setExpandedOrderId(isExpanded ? null : order.id)
                  }
                  className="w-full px-4 py-3 sm:px-6 sm:py-4 flex items-center justify-between hover:bg-stone-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-mono font-bold text-stone-900">
                        {order.orderNumber}
                      </h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1 ${statusConfig.color}`}
                      >
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </span>
                      <span className="text-xs text-stone-500">
                        {formatDate(order.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-stone-700 mt-1">
                      {order.customer.name} • {order.items.length} artículos
                    </p>
                  </div>

                  <div className="flex items-center gap-3 ml-3">
                    <div className="text-right hidden sm:block">
                      <p className="font-bold text-stone-900">
                        ${order.total.toFixed(2)}
                      </p>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`text-stone-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {/* Order Details (Expanded) */}
                {isExpanded && (
                  <div className="border-t border-stone-100 bg-stone-50 px-4 py-4 sm:px-6 space-y-4">
                    {/* Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-bold uppercase text-stone-600 mb-1">
                          Datos del Cliente
                        </p>
                        <div className="space-y-1.5">
                          <div className="flex items-start gap-2">
                            <span className="text-stone-500 mt-0.5 flex-shrink-0">
                              👤
                            </span>
                            <div>
                              <p className="font-semibold text-stone-900">
                                {order.customer.name}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2">
                            <Phone size={14} className="text-stone-500 mt-0.5 flex-shrink-0" />
                            <p className="text-stone-700">{order.customer.phone}</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <Mail size={14} className="text-stone-500 mt-0.5 flex-shrink-0" />
                            <p className="text-stone-700">{order.customer.email}</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-bold uppercase text-stone-600 mb-1">
                          Dirección de Entrega
                        </p>
                        <div className="flex items-start gap-2">
                          <MapPin size={14} className="text-stone-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-semibold text-stone-900">
                              {order.customer.city}
                            </p>
                            <p className="text-stone-700 text-xs">
                              {order.customer.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Items List */}
                    <div>
                      <p className="text-xs font-bold uppercase text-stone-600 mb-2">
                        Productos ({order.items.length})
                      </p>
                      <div className="space-y-1.5 bg-white rounded-lg p-3">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm border-b border-stone-100 pb-2 last:border-0"
                          >
                            <div>
                              <p className="font-semibold text-stone-900">
                                {item.product.name}
                              </p>
                              {item.selectedVariant && (
                                <p className="text-xs text-stone-500">
                                  {item.selectedVariant}
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-stone-900">
                                {item.quantity}x ${item.product.price.toFixed(2)}
                              </p>
                              <p className="text-xs text-stone-500">
                                ${(item.quantity * item.product.price).toFixed(2)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Payment Method & Notes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs font-bold uppercase text-stone-600 mb-1">
                          Método de Pago
                        </p>
                        <p className="text-stone-700 capitalize font-semibold">
                          {order.customer.paymentMethod === 'whatsapp' && 'WhatsApp'}
                          {order.customer.paymentMethod === 'transferencia' && 'Transferencia Bancaria'}
                          {order.customer.paymentMethod === 'contra-entrega' && 'Contra Entrega'}
                          {order.customer.paymentMethod === 'tarjeta' && 'Tarjeta de Crédito'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-stone-600 mb-1">
                          Total
                        </p>
                        <p className="text-lg font-bold text-rose-600 flex items-center gap-1">
                          <DollarSign size={16} />
                          {order.total.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    {order.notes && (
                      <div>
                        <p className="text-xs font-bold uppercase text-stone-600 mb-1">
                          Notas
                        </p>
                        <p className="text-sm text-stone-700 bg-white rounded p-2 border border-stone-200">
                          {order.notes}
                        </p>
                      </div>
                    )}

                    {/* Status & Actions */}
                    <div className="bg-white rounded-lg p-3 space-y-2 border border-stone-200">
                      <p className="text-xs font-bold uppercase text-stone-600">
                        Cambiar Estado
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {(
                          ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'] as const
                        ).map((status) => (
                          <button
                            key={status}
                            onClick={() => onUpdateOrderStatus(order.id, status)}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                              order.status === status
                                ? 'bg-rose-500 text-white shadow-sm'
                                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                            }`}
                          >
                            {STATUS_CONFIG[status].label}
                          </button>
                        ))}
                      </div>

                      <button
                        onClick={() => onDeleteOrder(order.id)}
                        className="w-full mt-3 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
                      >
                        <Trash2 size={14} />
                        Eliminar Pedido
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
