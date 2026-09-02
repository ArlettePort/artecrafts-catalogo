import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Star,
  Sparkles,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Boxes,
  ArrowUpDown,
  RefreshCw,
  EyeOff,
  SlidersHorizontal,
} from 'lucide-react';
import { Product, Category, SortOption, ProductStatus } from '../../types';

interface AdminProductsListProps {
  products: Product[];
  categories: Category[];
  onAddNewProduct: () => void;
  onEditProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  onPreviewProduct: (product: Product) => void;
  onToggleStatus: (productId: string) => void;
  onToggleFeatured: (productId: string) => void;
  onToggleNew: (productId: string) => void;
  onQuickUpdateStock: (productId: string, newStock: number) => void;
}

export const AdminProductsList: React.FC<AdminProductsListProps> = ({
  products,
  categories,
  onAddNewProduct,
  onEditProduct,
  onDeleteProduct,
  onPreviewProduct,
  onToggleStatus,
  onToggleFeatured,
  onToggleNew,
  onQuickUpdateStock,
}) => {
  // Filters & search state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'in-stock' | 'out-of-stock' | 'custom'>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'published' | 'hidden'>('all');
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('recent');

  // Quick stock inline editing
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [tempStockValue, setTempStockValue] = useState<string>('');

  // Category lookup map
  const categoryMap = useMemo(() => {
    const map = new Map<string, string>();
    categories.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [categories]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesDesc = product.description.toLowerCase().includes(q);
        const matchesId = product.id.toLowerCase().includes(q);
        const catName = (categoryMap.get(product.category) || '').toLowerCase();
        const matchesCat = catName.includes(q);
        if (!matchesName && !matchesDesc && !matchesId && !matchesCat) return false;
      }

      // Category
      if (selectedCategory !== 'todos' && product.category !== selectedCategory) {
        return false;
      }

      // Availability
      if (selectedAvailability === 'in-stock') {
        if (product.manageStock !== false && product.stock <= 0) return false;
      } else if (selectedAvailability === 'out-of-stock') {
        if (product.manageStock === false || product.stock > 0) return false;
      } else if (selectedAvailability === 'custom') {
        if (product.manageStock !== false) return false;
      }

      // Status
      if (selectedStatus === 'published' && product.status !== 'published') return false;
      if (selectedStatus === 'hidden' && product.status !== 'hidden') return false;

      // Featured
      if (onlyFeatured && !product.isFeatured) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
      if (sortBy === 'oldest') {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      }
      // 'recent'
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedAvailability,
    selectedStatus,
    onlyFeatured,
    sortBy,
    categoryMap,
  ]);

  const activeFiltersCount =
    (selectedCategory !== 'todos' ? 1 : 0) +
    (selectedAvailability !== 'all' ? 1 : 0) +
    (selectedStatus !== 'all' ? 1 : 0) +
    (onlyFeatured ? 1 : 0) +
    (searchQuery.trim() ? 1 : 0);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('todos');
    setSelectedAvailability('all');
    setSelectedStatus('all');
    setOnlyFeatured(false);
    setSortBy('recent');
  };

  const handleSaveQuickStock = (productId: string) => {
    const val = parseInt(tempStockValue, 10);
    if (!isNaN(val) && val >= 0) {
      onQuickUpdateStock(productId, val);
    }
    setEditingStockId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header with title & Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-rose-100 pb-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-stone-900">
            Catálogo de Productos
          </h2>
          <p className="text-xs text-stone-500">
            Administra precios, existencias, fotos y estados visibles en la tienda ArteCrafts
          </p>
        </div>

        <button
          type="button"
          onClick={onAddNewProduct}
          id="admin-add-product-main-btn"
          className="px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-rose-500/20 hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Agregar Nuevo Producto</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-rose-100/90 shadow-2xs space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search box */}
          <div className="lg:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Search size={16} />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre, descripción o ID..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600"
              >
                <XCircle size={14} />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 text-stone-700"
            >
              <option value="todos">Todas las categorías</option>
              {categories
                .filter((c) => c.id !== 'todos')
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Availability filter */}
          <div>
            <select
              value={selectedAvailability}
              onChange={(e) =>
                setSelectedAvailability(e.target.value as 'all' | 'in-stock' | 'out-of-stock' | 'custom')
              }
              className="w-full px-3 py-2 text-xs bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 text-stone-700"
            >
              <option value="all">Todas las existencias</option>
              <option value="in-stock">En Stock (&gt; 0)</option>
              <option value="out-of-stock">Agotados (0)</option>
              <option value="custom">Bajo Pedido</option>
            </select>
          </div>

          {/* Sort dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full px-3 py-2 text-xs bg-stone-50/70 border border-stone-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-400 text-stone-700"
            >
              <option value="recent">Más recientes primero</option>
              <option value="oldest">Más antiguos</option>
              <option value="price-asc">Precio: Menor a mayor</option>
              <option value="price-desc">Precio: Mayor a menor</option>
              <option value="name-asc">Nombre: A - Z</option>
            </select>
          </div>
        </div>

        {/* Secondary quick pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-rose-50 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            {/* Status filter pills */}
            <span className="text-[11px] text-stone-400 font-semibold uppercase mr-1">
              Estado:
            </span>
            <button
              type="button"
              onClick={() => setSelectedStatus('all')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedStatus === 'all'
                  ? 'bg-stone-800 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Todos ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('published')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedStatus === 'published'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              🟢 Publicados ({products.filter((p) => p.status === 'published' || !p.status).length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedStatus('hidden')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedStatus === 'hidden'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              }`}
            >
              🟡 Ocultos ({products.filter((p) => p.status === 'hidden').length})
            </button>

            {/* Featured toggle */}
            <button
              type="button"
              onClick={() => setOnlyFeatured(!onlyFeatured)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1 ${
                onlyFeatured
                  ? 'bg-amber-500 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              <Star size={12} className={onlyFeatured ? 'fill-white' : ''} />
              <span>Solo Destacados</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-500">
              Mostrando <strong>{filteredProducts.length}</strong> de {products.length} productos
            </span>

            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-medium"
              >
                <RefreshCw size={11} />
                Limpiar filtros
              </button>
            )}
          </div>
        </div>
      </div>

      {/* PRODUCTS LIST / TABLE */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-rose-100 p-12 text-center max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-400 mx-auto flex items-center justify-center">
            <Search size={24} />
          </div>
          <h3 className="font-serif text-lg font-bold text-stone-800">
            No se encontraron productos
          </h3>
          <p className="text-xs text-stone-500">
            No hay piezas que coincidan con los filtros seleccionados. Intenta restablecer los filtros o agrega un nuevo producto.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-semibold hover:bg-rose-600 transition-colors"
          >
            Restablecer Filtros
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-rose-100/90 shadow-2xs overflow-hidden">
          {/* Responsive table for desktop / tablet */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-rose-50/50 border-b border-rose-100 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  <th className="py-3.5 px-4">Producto</th>
                  <th className="py-3.5 px-3">Categoría</th>
                  <th className="py-3.5 px-3">Precio</th>
                  <th className="py-3.5 px-3">Stock / Disponibilidad</th>
                  <th className="py-3.5 px-3">Estado</th>
                  <th className="py-3.5 px-3">Fecha</th>
                  <th className="py-3.5 px-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-rose-50 text-xs text-stone-700">
                {filteredProducts.map((product) => {
                  const displayImg =
                    product.mainImage ||
                    (product.images && product.images[0]) ||
                    '';
                  const isPublished = product.status === 'published' || !product.status;
                  const isOutOfStock = product.manageStock !== false && product.stock <= 0;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-rose-50/30 transition-colors group"
                    >
                      {/* Product Name & Image */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-rose-50 border border-stone-200 shrink-0 relative">
                            {displayImg ? (
                              <img
                                src={displayImg}
                                alt={product.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-[10px] text-stone-400">
                                Sin foto
                              </div>
                            )}

                            {/* Corner badge */}
                            {product.isFeatured && (
                              <span className="absolute top-0.5 right-0.5 w-3.5 h-3.5 bg-amber-400 text-white rounded-full flex items-center justify-center text-[8px] shadow-2xs">
                                ⭐
                              </span>
                            )}
                          </div>

                          <div className="max-w-[220px]">
                            <p className="font-serif text-sm font-bold text-stone-900 group-hover:text-rose-600 transition-colors truncate">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-stone-400 truncate mt-0.5">
                              ID: {product.id}
                            </p>
                            {product.isNew && (
                              <span className="inline-block text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded-md mt-0.5">
                                Novedad
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-stone-100 text-stone-700">
                          {categoryMap.get(product.category) || product.category}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3 px-3">
                        <div>
                          <span className="font-bold text-rose-600 font-mono text-sm">
                            ${product.price.toFixed(2)}
                          </span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="block text-[10px] text-stone-400 line-through">
                              ${product.originalPrice.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Stock / Availability */}
                      <td className="py-3 px-3">
                        {editingStockId === product.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              min="0"
                              value={tempStockValue}
                              onChange={(e) => setTempStockValue(e.target.value)}
                              className="w-16 px-2 py-1 text-xs border border-rose-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-rose-500"
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveQuickStock(product.id);
                                if (e.key === 'Escape') setEditingStockId(null);
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => handleSaveQuickStock(product.id)}
                              className="px-2 py-1 bg-rose-500 text-white rounded-lg text-[10px] font-bold"
                            >
                              OK
                            </button>
                          </div>
                        ) : (
                          <div
                            onClick={() => {
                              if (product.manageStock !== false) {
                                setEditingStockId(product.id);
                                setTempStockValue(String(product.stock));
                              }
                            }}
                            className="cursor-pointer group/stock inline-flex items-center gap-1.5"
                            title={product.manageStock !== false ? 'Clic para editar stock' : ''}
                          >
                            {product.manageStock === false ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                Bajo pedido
                              </span>
                            ) : isOutOfStock ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-600 border border-red-200 flex items-center gap-1">
                                <XCircle size={11} />
                                Agotado (0)
                              </span>
                            ) : (
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                                  product.stock <= 2
                                    ? 'bg-amber-50 text-amber-700 border-amber-200'
                                    : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                }`}
                              >
                                <CheckCircle size={11} />
                                {product.stock} un.
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(product.id)}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1 ${
                            isPublished
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                          }`}
                          title="Clic para cambiar entre Publicado y Oculto"
                        >
                          {isPublished ? (
                            <>
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Publicado
                            </>
                          ) : (
                            <>
                              <EyeOff size={11} />
                              Oculto
                            </>
                          )}
                        </button>
                      </td>

                      {/* Creation Date */}
                      <td className="py-3 px-3 text-[11px] text-stone-500 whitespace-nowrap">
                        {product.createdAt
                          ? new Date(product.createdAt).toLocaleDateString('es-ES', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>

                      {/* Actions: Edit, View, Delete, Featured */}
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Toggle Featured */}
                          <button
                            type="button"
                            onClick={() => onToggleFeatured(product.id)}
                            className={`p-1.5 rounded-lg transition-colors ${
                              product.isFeatured
                                ? 'text-amber-500 hover:bg-amber-50'
                                : 'text-stone-300 hover:text-amber-500 hover:bg-stone-50'
                            }`}
                            title={product.isFeatured ? 'Quitar de destacados' : 'Marcar como destacado'}
                          >
                            <Star
                              size={16}
                              className={product.isFeatured ? 'fill-amber-400' : ''}
                            />
                          </button>

                          {/* Preview */}
                          <button
                            type="button"
                            onClick={() => onPreviewProduct(product)}
                            className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Vista previa cliente"
                          >
                            <Eye size={16} />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => onEditProduct(product)}
                            id={`admin-edit-prod-${product.id}`}
                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors font-medium"
                            title="Editar producto"
                          >
                            <Edit size={16} />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => onDeleteProduct(product)}
                            id={`admin-delete-prod-${product.id}`}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar producto"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
