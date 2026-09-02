import React from 'react';
import {
  Package,
  CheckCircle,
  AlertTriangle,
  Layers,
  Star,
  PlusCircle,
  ArrowRight,
  TrendingUp,
  Boxes,
  Sparkles,
  ExternalLink,
  Edit,
  Eye,
} from 'lucide-react';
import { Product, Category } from '../../types';

interface AdminDashboardProps {
  products: Product[];
  categories: Category[];
  onAddNewProduct: () => void;
  onGoToProducts: () => void;
  onGoToCategories: () => void;
  onGoToInventory: () => void;
  onEditProduct: (product: Product) => void;
  onPreviewProduct: (product: Product) => void;
  onGoToPublicCatalog: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  products,
  categories,
  onAddNewProduct,
  onGoToProducts,
  onGoToCategories,
  onGoToInventory,
  onEditProduct,
  onPreviewProduct,
  onGoToPublicCatalog,
}) => {
  // Compute metrics
  const totalProducts = products.length;
  const availableProducts = products.filter(
    (p) => p.manageStock === false || p.stock > 0
  ).length;
  const outOfStockProducts = products.filter(
    (p) => p.manageStock !== false && p.stock <= 0
  ).length;
  const featuredProducts = products.filter((p) => p.isFeatured).length;
  const customOrderProducts = products.filter((p) => p.manageStock === false).length;
  const totalCategories = categories.filter((c) => c.id !== 'todos' && c.status !== 'inactive').length;

  // Recent products (sorted by createdAt desc, take 5)
  const recentProducts = [...products]
    .sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 5);

  // Low stock products warning (< 3)
  const criticalStockProducts = products.filter(
    (p) => p.manageStock !== false && p.stock > 0 && p.stock <= 2
  );

  return (
    <div className="space-y-7">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 p-6 sm:p-8 text-white shadow-lg shadow-rose-500/15">
        <div className="relative z-10 max-w-2xl space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-xs text-xs font-semibold tracking-wide text-rose-100">
            <Sparkles size={13} />
            ArteCrafts Control Central
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
            Resumen General de la Tienda
          </h2>
          <p className="text-xs sm:text-sm text-rose-100 leading-relaxed max-w-lg">
            Supervisa el inventario de tus creaciones hechas a mano, administra pedidos y actualiza precios en tiempo real.
          </p>
          <div className="pt-3 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={onAddNewProduct}
              id="dashboard-new-product-banner-btn"
              className="px-4 py-2 bg-white text-rose-700 hover:bg-rose-50 font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <PlusCircle size={15} />
              <span>Nuevo Producto</span>
            </button>
            <button
              type="button"
              onClick={onGoToPublicCatalog}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white font-semibold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-xs"
            >
              <ExternalLink size={14} />
              <span>Ver Catálogo en Vivo</span>
            </button>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Critical Stock Alert Banner if any */}
      {criticalStockProducts.length > 0 && (
        <div className="bg-amber-50/80 border border-amber-200 p-4 rounded-2xl flex items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                Alerta de Stock Bajo ({criticalStockProducts.length} producto{criticalStockProducts.length > 1 ? 's' : ''})
              </h4>
              <p className="text-[11px] text-amber-700">
                Hay piezas con 2 o menos unidades disponibles en el taller. Considera reponer stock para evitar que se agoten.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onGoToInventory}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold transition-colors shrink-0 shadow-2xs"
          >
            Revisar Inventario
          </button>
        </div>
      )}

      {/* KPI METRIC CARDS (Requirement 2) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Products */}
        <div
          onClick={onGoToProducts}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-100/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <Package size={18} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
              Catálogo
            </span>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
              {totalProducts}
            </p>
            <p className="text-xs text-stone-500 font-medium">Total Productos</p>
          </div>
        </div>

        {/* In Stock / Available */}
        <div
          onClick={onGoToInventory}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-100/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle size={18} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              Activos
            </span>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
              {availableProducts}
            </p>
            <p className="text-xs text-stone-500 font-medium">Disponibles</p>
          </div>
        </div>

        {/* Out of Stock */}
        <div
          onClick={onGoToInventory}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-100/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors">
              <Boxes size={18} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 bg-red-50 px-2 py-0.5 rounded-full">
              Alerta
            </span>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
              {outOfStockProducts}
            </p>
            <p className="text-xs text-stone-500 font-medium">Productos Agotados</p>
          </div>
        </div>

        {/* Categories */}
        <div
          onClick={onGoToCategories}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-100/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group space-y-2"
        >
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Layers size={18} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
              Líneas
            </span>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
              {totalCategories}
            </p>
            <p className="text-xs text-stone-500 font-medium">Categorías</p>
          </div>
        </div>

        {/* Featured */}
        <div
          onClick={onGoToProducts}
          className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-100/90 shadow-2xs hover:shadow-md transition-all cursor-pointer group space-y-2 col-span-2 sm:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <Star size={18} />
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              Portada
            </span>
          </div>
          <div>
            <p className="text-2xl sm:text-3xl font-bold text-stone-900 font-serif">
              {featuredProducts}
            </p>
            <p className="text-xs text-stone-500 font-medium">Destacados</p>
          </div>
        </div>
      </div>

      {/* SECTION: PRODUCTOS RECIENTES (Requirement 2) */}
      <div className="bg-white rounded-3xl border border-rose-100/90 shadow-2xs p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-rose-50 pb-3">
          <div>
            <h3 className="font-serif text-lg font-bold text-stone-900">
              Productos Recientes
            </h3>
            <p className="text-xs text-stone-500">
              Las últimas creaciones agregadas al catálogo de ArteCrafts
            </p>
          </div>

          <button
            type="button"
            onClick={onGoToProducts}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors"
          >
            <span>Ver todos los productos</span>
            <ArrowRight size={14} />
          </button>
        </div>

        {recentProducts.length === 0 ? (
          <div className="py-8 text-center text-xs text-stone-400">
            No hay productos registrados aún.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-rose-50">
                  <th className="py-2.5 px-3">Producto</th>
                  <th className="py-2.5 px-3">Categoría</th>
                  <th className="py-2.5 px-3">Precio</th>
                  <th className="py-2.5 px-3">Stock</th>
                  <th className="py-2.5 px-3">Estado</th>
                  <th className="py-2.5 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50">
                {recentProducts.map((product) => {
                  const displayImg =
                    product.mainImage ||
                    (product.images && product.images[0]) ||
                    '';
                  const isPublished = product.status === 'published' || !product.status;

                  return (
                    <tr key={product.id} className="hover:bg-rose-50/40 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={displayImg}
                            alt=""
                            className="w-10 h-10 rounded-xl object-cover border border-stone-200 shrink-0"
                          />
                          <div className="max-w-[200px]">
                            <p className="font-semibold text-stone-900 truncate">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-stone-400">
                              {product.createdAt
                                ? new Date(product.createdAt).toLocaleDateString('es-ES', {
                                    day: 'numeric',
                                    month: 'short',
                                  })
                                : ''}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3 capitalize text-stone-600">
                        {product.category}
                      </td>
                      <td className="py-3 px-3 font-bold text-rose-600 font-mono">
                        ${product.price.toFixed(2)}
                      </td>
                      <td className="py-3 px-3">
                        {product.manageStock === false ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700">
                            Bajo pedido
                          </span>
                        ) : product.stock <= 0 ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-50 text-red-600">
                            Agotado
                          </span>
                        ) : (
                          <span className="text-stone-700 font-medium">
                            {product.stock} un.
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {isPublished ? 'Publicado' : 'Oculto'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onPreviewProduct(product)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-rose-50"
                            title="Vista previa"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditProduct(product)}
                            className="p-1.5 text-rose-600 hover:text-rose-800 rounded-lg hover:bg-rose-50"
                            title="Editar"
                          >
                            <Edit size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick shortcuts / Categories breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Quick Inventory Summary */}
        <div className="bg-white rounded-3xl border border-rose-100/90 shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-rose-50 pb-2.5">
            <h4 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
              <Boxes size={18} className="text-rose-500" />
              <span>Estado del Inventario</span>
            </h4>
            <button
              type="button"
              onClick={onGoToInventory}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Gestionar
            </button>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-stone-50">
              <span className="text-stone-600">Disponibilidad total:</span>
              <span className="font-bold text-stone-800">
                {Math.round((availableProducts / (totalProducts || 1)) * 100)}% en existencia
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-stone-50">
              <span className="text-stone-600">Piezas hechas bajo pedido:</span>
              <span className="font-bold text-blue-600">{customOrderProducts} productos</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-stone-50">
              <span className="text-stone-600">Productos que requieren reposición:</span>
              <span className="font-bold text-red-600">{outOfStockProducts} agotados</span>
            </div>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white rounded-3xl border border-rose-100/90 shadow-2xs p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-rose-50 pb-2.5">
            <h4 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
              <Layers size={18} className="text-purple-500" />
              <span>Categorías Activas</span>
            </h4>
            <button
              type="button"
              onClick={onGoToCategories}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Ver todas
            </button>
          </div>

          <div className="space-y-2">
            {categories
              .filter((c) => c.id !== 'todos')
              .slice(0, 4)
              .map((cat) => {
                const count = products.filter((p) => p.category === cat.id).length;
                return (
                  <div
                    key={cat.id}
                    className="flex items-center justify-between text-xs p-2 rounded-xl hover:bg-rose-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={cat.image}
                        alt=""
                        className="w-7 h-7 rounded-lg object-cover"
                      />
                      <span className="font-semibold text-stone-800">{cat.name}</span>
                    </div>
                    <span className="font-bold text-stone-500 bg-stone-100 px-2 py-0.5 rounded-full text-[11px]">
                      {count} items
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};
