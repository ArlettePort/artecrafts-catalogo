import React, { useState, useMemo } from 'react';
import {
  Boxes,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Plus,
  Minus,
  Sparkles,
  RefreshCw,
  Edit,
  Save,
} from 'lucide-react';
import { Product } from '../../types';

interface AdminInventoryProps {
  products: Product[];
  onUpdateStock: (productId: string, newStock: number, manageStock?: boolean) => void;
  onEditProduct: (product: Product) => void;
}

export const AdminInventory: React.FC<AdminInventoryProps> = ({
  products,
  onUpdateStock,
  onEditProduct,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'critical' | 'out' | 'custom'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.id.toLowerCase().includes(q)) {
          return false;
        }
      }

      if (filterType === 'critical') {
        return p.manageStock !== false && p.stock > 0 && p.stock <= 2;
      }
      if (filterType === 'out') {
        return p.manageStock !== false && p.stock <= 0;
      }
      if (filterType === 'custom') {
        return p.manageStock === false;
      }
      return true;
    });
  }, [products, filterType, searchQuery]);

  const handleAdjustStock = (product: Product, delta: number) => {
    const current = product.stock || 0;
    const next = Math.max(0, current + delta);
    onUpdateStock(product.id, next, product.manageStock !== false);
  };

  const handleToggleCustomOrder = (product: Product) => {
    const currentlyCustom = product.manageStock === false;
    onUpdateStock(product.id, currentlyCustom ? 5 : 0, currentlyCustom);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Control Rápido de Inventario & Stock
          </h2>
          <p className="text-xs text-stone-500">
            Ajusta cantidades disponibles con un clic. Cuando el stock llegue a 0, la tienda mostrará "Agotado" automáticamente.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-100/90 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
              <Search size={15} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar producto..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
          </div>

          {/* Quick Filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filterType === 'all'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('critical')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 ${
                filterType === 'critical'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
              }`}
            >
              <AlertTriangle size={13} />
              Bajo Stock (≤ 2)
            </button>
            <button
              type="button"
              onClick={() => setFilterType('out')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all flex items-center gap-1 ${
                filterType === 'out'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'bg-red-50 text-red-700 hover:bg-red-100'
              }`}
            >
              <XCircle size={13} />
              Agotados
            </button>
            <button
              type="button"
              onClick={() => setFilterType('custom')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                filterType === 'custom'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
              }`}
            >
              Bajo Pedido
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-3xl border border-rose-100/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-rose-50/50 border-b border-rose-100 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                <th className="py-3.5 px-4">Producto</th>
                <th className="py-3.5 px-3">Modalidad</th>
                <th className="py-3.5 px-3 text-center">Existencias Actuales</th>
                <th className="py-3.5 px-3">Estado Público</th>
                <th className="py-3.5 px-4 text-right">Ajuste Rápido (+ / -)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-50">
              {filtered.map((product) => {
                const isCustom = product.manageStock === false;
                const isOut = !isCustom && product.stock <= 0;
                const isLow = !isCustom && product.stock > 0 && product.stock <= 2;
                const displayImg = product.mainImage || (product.images && product.images[0]) || '';

                return (
                  <tr key={product.id} className="hover:bg-rose-50/30 transition-colors">
                    {/* Product Name */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={displayImg}
                          alt=""
                          className="w-11 h-11 rounded-xl object-cover border border-stone-200 shrink-0"
                        />
                        <div>
                          <p className="font-serif text-sm font-bold text-stone-900">
                            {product.name}
                          </p>
                          <p className="text-[10px] text-stone-400 capitalize">
                            Categoría: {product.category} • Precio: ${product.price.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Mode (Stock vs Custom) */}
                    <td className="py-3 px-3">
                      <button
                        type="button"
                        onClick={() => handleToggleCustomOrder(product)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                          isCustom
                            ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                            : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                        }`}
                        title="Clic para cambiar entre Stock controlado y Hecho bajo pedido"
                      >
                        {isCustom ? 'Bajo Pedido (Sin stock)' : 'Stock Controlado'}
                      </button>
                    </td>

                    {/* Stock Quantity */}
                    <td className="py-3 px-3 text-center">
                      {isCustom ? (
                        <span className="text-stone-400 font-medium italic">
                          Ilimitado
                        </span>
                      ) : (
                        <span
                          className={`font-mono text-base font-bold ${
                            isOut
                              ? 'text-red-600'
                              : isLow
                              ? 'text-amber-600'
                              : 'text-stone-800'
                          }`}
                        >
                          {product.stock} un.
                        </span>
                      )}
                    </td>

                    {/* Public Status */}
                    <td className="py-3 px-3">
                      {isCustom ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                          Bajo pedido
                        </span>
                      ) : isOut ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 flex items-center gap-1 w-max">
                          <XCircle size={11} />
                          Agotado en tienda
                        </span>
                      ) : isLow ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1 w-max">
                          <AlertTriangle size={11} />
                          Últimas {product.stock} un.
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-max">
                          <CheckCircle size={11} />
                          Disponible
                        </span>
                      )}
                    </td>

                    {/* Quick Adjustment Controls */}
                    <td className="py-3 px-4 text-right">
                      {isCustom ? (
                        <span className="text-[11px] text-stone-400">
                          Elaboración continua
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleAdjustStock(product, -1)}
                            disabled={product.stock <= 0}
                            className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold transition-colors disabled:opacity-30 cursor-pointer"
                            title="Restar 1 unidad"
                          >
                            <Minus size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAdjustStock(product, 1)}
                            className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center font-bold transition-colors cursor-pointer"
                            title="Sumar 1 unidad"
                          >
                            <Plus size={13} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleAdjustStock(product, 5)}
                            className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-bold transition-colors cursor-pointer ml-1"
                            title="Sumar 5 unidades"
                          >
                            +5
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
