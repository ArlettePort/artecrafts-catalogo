import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  ShoppingBag,
  Heart,
  Search,
  Filter,
  CheckCircle,
  HelpCircle,
  Clock,
  MapPin,
  Phone,
  Instagram,
  RefreshCw,
  ShieldCheck,
  ArrowLeft,
  LayoutDashboard,
  Boxes,
  Layers,
  Settings as SettingsIcon,
} from 'lucide-react';
import {
  Product,
  CartItem,
  FilterState,
  Category,
  OrderCustomerInfo,
  AdminSection,
  AdminUser,
  StoreSettings,
  Order,
} from './types';
import { BrandLogo } from './components/BrandLogo';
import { Header } from './components/Header';
import { BottomNav, NavTab } from './components/BottomNav';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { OrderSuccessModal } from './components/OrderSuccessModal';
import { SearchFilterBar } from './components/SearchFilterBar';
import { FilterModal } from './components/FilterModal';
import { FavoritesView } from './components/FavoritesView';
import { CategoryList } from './components/CategoryList';
import { HeroBanner } from './components/HeroBanner';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminLayout } from './components/admin/AdminLayout';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminProductsList } from './components/admin/AdminProductsList';
import { AdminProductForm } from './components/admin/AdminProductForm';
import { AdminCategories } from './components/admin/AdminCategories';
import { AdminOrders } from './components/admin/AdminOrders';
import { AdminInventory } from './components/admin/AdminInventory';
import { AdminSettings } from './components/admin/AdminSettings';
import { AdminDeleteConfirmModal } from './components/admin/AdminDeleteConfirmModal';
import { AdminProductPreviewModal } from './components/admin/AdminProductPreviewModal';

// Services
import { CatalogStore } from './services/catalogStore';
import { AuthService } from './services/authService';

const DEFAULT_FILTERS: FilterState = {
  searchQuery: '',
  category: 'todos',
  minPrice: 0,
  maxPrice: 60,
  onlyInStock: false,
  onlyFeatured: false,
  onlyNew: false,
  sortBy: 'featured',
};

export default function App() {
  // Application Mode: 'catalog' (customer view), 'admin' (panel), or 'admin-login'
  const [appMode, setAppMode] = useState<'catalog' | 'admin' | 'admin-login'>('catalog');
  const [adminSection, setAdminSection] = useState<AdminSection>('dashboard');
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => AuthService.getCurrentUser());

  // Products, Categories, and Orders synchronized with central CatalogStore
  const [products, setProducts] = useState<Product[]>(() => CatalogStore.getProducts());
  const [categories, setCategories] = useState<Category[]>(() => CatalogStore.getCategories());
  const [orders, setOrders] = useState<Order[]>(() => CatalogStore.getOrders());
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => CatalogStore.getSettings());

  // Admin form/modal states
  const [isCreatingProduct, setIsCreatingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [previewingProduct, setPreviewingProduct] = useState<Product | null>(null);

  // Cart & Favorites with localStorage
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('artecrafts_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('artecrafts_favs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Client Navigation & UI States
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [orderSuccessData, setOrderSuccessData] = useState<{
    orderNumber: string;
    customer: OrderCustomerInfo;
    items: CartItem[];
    total: number;
  } | null>(null);

  // Toast notification for user actions
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters State for public catalog
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  // Subscribe to CatalogStore updates so any change in Admin immediately reflects in Catalog
  useEffect(() => {
    const unsubProducts = CatalogStore.subscribeProducts((updated) => {
      setProducts(updated);
    });
    const unsubCategories = CatalogStore.subscribeCategories((updated) => {
      setCategories(updated);
    });
    const unsubOrders = CatalogStore.subscribeOrders((updated) => {
      setOrders(updated);
    });
    const unsubSettings = CatalogStore.subscribeSettings((updated) => {
      setStoreSettings(updated);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubOrders();
      unsubSettings();
    };
  }, []);

  // Load data from API on app start
  useEffect(() => {
    const loadFromAPI = async () => {
      try {
        await CatalogStore.loadProductsFromAPI();
        await CatalogStore.loadCategoriesFromAPI();
        await CatalogStore.loadOrdersFromAPI();
      } catch (error) {
        console.error('Failed to load data from API:', error);
      }
    };
    loadFromAPI();
  }, []);

  // Save Cart to local storage
  useEffect(() => {
    try {
      localStorage.setItem('artecrafts_cart', JSON.stringify(cart));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }, [cart]);

  // Save Favorites to local storage
  useEffect(() => {
    try {
      localStorage.setItem('artecrafts_favs', JSON.stringify(favorites));
    } catch (e) {
      console.warn('Could not save favorites to localStorage', e);
    }
  }, [favorites]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2800);
  };

  // Toggle favorite
  const handleToggleFavorite = (product: Product) => {
    const exists = favorites.some((f) => f.id === product.id);
    if (exists) {
      setFavorites((prev) => prev.filter((f) => f.id !== product.id));
      showToast(`Eliminado de favoritos: ${product.name}`);
    } else {
      setFavorites((prev) => [...prev, product]);
      showToast(`🌸 Guardado en favoritos: ${product.name}`);
    }
  };

  // Add to cart
  const handleAddToCart = (
    product: Product,
    quantity = 1,
    selectedVariant?: string
  ) => {
    if (product.manageStock !== false && product.stock <= 0) {
      showToast(`⚠️ "${product.name}" está agotado por el momento.`);
      return;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedVariant === selectedVariant
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const maxLimit = product.manageStock !== false ? product.stock : 99;
        const newQty = Math.min(maxLimit, updated[existingIndex].quantity + quantity);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        return [...prev, { product, quantity, selectedVariant }];
      }
    });

    showToast(`🛍️ Agregado al carrito: ${product.name}`);
  };

  const handleUpdateCartQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity: newQty } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Client view products (Only active/published products)
  const publicProducts = useMemo(() => {
    return products.filter((p) => p.status === 'published' || !p.status);
  }, [products]);

  // Featured and New products for Customer Catalog
  const featuredProducts = useMemo(
    () => publicProducts.filter((p) => p.isFeatured),
    [publicProducts]
  );
  const newProducts = useMemo(
    () => publicProducts.filter((p) => p.isNew),
    [publicProducts]
  );

  // Filtered products for customer catalog search & category navigation
  const customerFilteredProducts = useMemo(() => {
    return publicProducts
      .filter((product) => {
        if (filters.searchQuery.trim()) {
          const query = filters.searchQuery.toLowerCase();
          const matchName = product.name.toLowerCase().includes(query);
          const matchDesc = product.description.toLowerCase().includes(query);
          const matchCategory = product.category.toLowerCase().includes(query);
          const matchMaterials = product.materials?.some((m) =>
            m.toLowerCase().includes(query)
          );
          if (!matchName && !matchDesc && !matchCategory && !matchMaterials) {
            return false;
          }
        }

        if (filters.category !== 'todos' && product.category !== filters.category) {
          return false;
        }

        if (filters.minPrice > 0 && product.price < filters.minPrice) return false;
        if (filters.maxPrice < 60 && product.price > filters.maxPrice) return false;

        if (filters.onlyInStock && product.manageStock !== false && product.stock <= 0) {
          return false;
        }
        if (filters.onlyFeatured && !product.isFeatured) return false;
        if (filters.onlyNew && !product.isNew) return false;

        return true;
      })
      .sort((a, b) => {
        if (filters.sortBy === 'price-asc') return a.price - b.price;
        if (filters.sortBy === 'price-desc') return b.price - a.price;
        if (filters.sortBy === 'rating') return b.rating - a.rating;
        if (filters.sortBy === 'newest') {
          return (
            (b.createdAt ? new Date(b.createdAt).getTime() : 0) -
            (a.createdAt ? new Date(a.createdAt).getTime() : 0)
          );
        }
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
      });
  }, [publicProducts, filters]);

  // Navigation handlers
  const handleSelectCategory = (categoryId: string) => {
    setFilters((prev) => ({ ...prev, category: categoryId }));
    setCurrentTab('categories');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const handleTabChange = (tab: NavTab) => {
    setCurrentTab(tab);
    if (tab === 'home') {
      setFilters(DEFAULT_FILTERS);
    } else if (tab === 'search') {
      window.scrollTo({ top: 120, behavior: 'smooth' });
    }
  };

  // Switch to Admin Panel with authentication guard
  const handleOpenAdminPanel = () => {
    if (AuthService.isAuthenticated()) {
      setAdminUser(AuthService.getCurrentUser());
      setAppMode('admin');
    } else {
      setAppMode('admin-login');
    }
  };

  // Admin Logout
  const handleAdminLogout = () => {
    AuthService.logout();
    setAdminUser(null);
    setAppMode('catalog');
    showToast('Sesión de administrador cerrada.');
  };

  // Admin CRUD Actions
  const handleSaveProduct = async (
    productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewsCount'>,
    productId?: string
  ) => {
    try {
      if (productId) {
        await CatalogStore.updateProduct(productId, productData);
        showToast(`✨ Producto "${productData.name}" actualizado con éxito.`);
      } else {
        await CatalogStore.addProduct(productData);
        showToast(`🎉 Nueva creación "${productData.name}" añadida al catálogo.`);
      }
      setIsCreatingProduct(false);
      setEditingProduct(null);
      setAdminSection('products');
    } catch (error) {
      showToast(`❌ Error: ${error instanceof Error ? error.message : 'No se pudo guardar el producto'}`);
    }
  };

  const handleConfirmDeleteProduct = async (id: string) => {
    try {
      await CatalogStore.deleteProduct(id);
      setDeletingProduct(null);
      showToast('Producto eliminado del catálogo.');
    } catch (error) {
      showToast(`❌ Error: ${error instanceof Error ? error.message : 'No se pudo eliminar el producto'}`);
    }
  };

  const handleToggleProductStatus = async (productId: string) => {
    try {
      const p = CatalogStore.getProductById(productId);
      if (!p) return;
      const nextStatus = p.status === 'published' ? 'hidden' : 'published';
      await CatalogStore.toggleStatus(productId);
      showToast(
        nextStatus === 'published'
          ? `🟢 "${p.name}" ahora está visible en la tienda.`
          : `🟡 "${p.name}" ahora está oculto del público.`
      );
    } catch (error) {
      showToast(`❌ Error: ${error instanceof Error ? error.message : 'No se pudo cambiar el estado'}`);
    }
  };

  const handleToggleProductFeatured = async (productId: string) => {
    try {
      const p = CatalogStore.getProductById(productId);
      if (!p) return;
      await CatalogStore.toggleFeatured(productId);
      showToast(
        p.isFeatured
          ? 'Quitado de la sección de destacados.'
          : '⭐ Marcado como producto destacado en portada.'
      );
    } catch (error) {
      showToast(`❌ Error: ${error instanceof Error ? error.message : 'No se pudo actualizar'}`);
    }
  };

  const handleToggleProductNew = async (productId: string) => {
    try {
      const p = CatalogStore.getProductById(productId);
      if (!p) return;
      await CatalogStore.toggleNew(productId);
      showToast(
        p.isNew
          ? 'Insignia "Nuevo" removida.'
          : '✨ Marcado con la insignia "Nuevo".'
      );
    } catch (error) {
      showToast(`❌ Error: ${error instanceof Error ? error.message : 'No se pudo actualizar'}`);
    }
  };

  const handleQuickUpdateStock = async (productId: string, newStock: number) => {
    try {
      await CatalogStore.updateStock(productId, newStock);
      showToast(`Stock actualizado a ${newStock} unidades.`);
    } catch (error) {
      showToast(`❌ Error: ${error instanceof Error ? error.message : 'No se pudo actualizar el stock'}`);
    }
  };

  const handleSaveCategory = async (catData: any, catId?: string) => {
    try {
      if (catId) {
        await CatalogStore.updateCategory(catId, catData);
        showToast(`Categoría "${catData.name}" actualizada.`);
      } else {
        await CatalogStore.addCategory(catData);
        showToast(`Nueva categoría "${catData.name}" creada.`);
      }
    } catch (error) {
      showToast(`❌ Error: ${error instanceof Error ? error.message : 'No se pudo guardar la categoría'}`);
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    try {
      await CatalogStore.deleteCategory(catId);
      showToast('Categoría eliminada.');
    } catch (error) {
      showToast(`❌ Error: ${error instanceof Error ? error.message : 'No se pudo eliminar la categoría'}`);
    }
  };

  const handleToggleCategoryStatus = async (catId: string) => {
    try {
      await CatalogStore.toggleCategoryStatus(catId);
      showToast('Estado de categoría actualizado.');
    } catch (error) {
      showToast(`❌ Error: ${error instanceof Error ? error.message : 'No se pudo actualizar el estado'}`);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: any) => {
    try {
      await CatalogStore.updateOrderStatus(orderId, status);
      showToast(`Pedido actualizado a: ${status}`);
    } catch (error) {
      showToast(`❌ Error: ${error instanceof Error ? error.message : 'No se pudo actualizar el pedido'}`);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    try {
      await CatalogStore.deleteOrder(orderId);
      showToast('Pedido eliminado.');
    } catch (error) {
      showToast(`❌ Error: ${error instanceof Error ? error.message : 'No se pudo eliminar el pedido'}`);
    }
  };

  const handleUpdateInventoryStock = async (id: string, newStock: number, manageStock?: boolean) => {
    try {
      await CatalogStore.updateStock(id, newStock, manageStock);
      showToast('Inventario actualizado.');
    } catch (error) {
      showToast(`❌ Error: ${error instanceof Error ? error.message : 'No se pudo actualizar el inventario'}`);
    }
  };

  // -------------------------------------------------------------
  // RENDER: ADMIN LOGIN SCREEN
  // -------------------------------------------------------------
  if (appMode === 'admin-login') {
    return (
      <div className="relative">
        <AdminLogin
          onLoginSuccess={(user) => {
            setAdminUser(user);
            setAppMode('admin');
            showToast(`Bienvenida al panel, ${user.name}`);
          }}
          onBackToCatalog={() => setAppMode('catalog')}
        />
        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <Sparkles size={16} className="text-rose-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: ADMIN PANEL (Protected)
  // -------------------------------------------------------------
  if (appMode === 'admin') {
    // Double-check security
    if (!AuthService.isAuthenticated() || !adminUser) {
      return (
        <AdminLogin
          onLoginSuccess={(user) => {
            setAdminUser(user);
            setAppMode('admin');
          }}
          onBackToCatalog={() => setAppMode('catalog')}
        />
      );
    }

    return (
      <AdminLayout
        currentSection={adminSection}
        onSelectSection={(sec) => {
          setIsCreatingProduct(false);
          setEditingProduct(null);
          setAdminSection(sec);
        }}
        currentUser={adminUser}
        onLogout={handleAdminLogout}
        onGoToPublicCatalog={() => setAppMode('catalog')}
        productsCount={products.length}
        categoriesCount={categories.length}
      >
        {/* Sub-view switcher inside AdminLayout */}
        {adminSection === 'dashboard' && (
          <AdminDashboard
            products={products}
            categories={categories}
            onAddNewProduct={() => {
              setEditingProduct(null);
              setIsCreatingProduct(true);
              setAdminSection('products');
            }}
            onGoToProducts={() => setAdminSection('products')}
            onGoToCategories={() => setAdminSection('categories')}
            onGoToInventory={() => setAdminSection('inventory')}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setIsCreatingProduct(false);
              setAdminSection('products');
            }}
            onPreviewProduct={(p) => setPreviewingProduct(p)}
            onGoToPublicCatalog={() => setAppMode('catalog')}
          />
        )}

        {adminSection === 'products' && (
          <>
            {isCreatingProduct || editingProduct ? (
              <AdminProductForm
                initialProduct={editingProduct}
                categories={categories}
                onSave={handleSaveProduct}
                onCancel={() => {
                  setIsCreatingProduct(false);
                  setEditingProduct(null);
                }}
              />
            ) : (
              <AdminProductsList
                products={products}
                categories={categories}
                onAddNewProduct={() => {
                  setEditingProduct(null);
                  setIsCreatingProduct(true);
                }}
                onEditProduct={(p) => setEditingProduct(p)}
                onDeleteProduct={(p) => setDeletingProduct(p)}
                onPreviewProduct={(p) => setPreviewingProduct(p)}
                onToggleStatus={handleToggleProductStatus}
                onToggleFeatured={handleToggleProductFeatured}
                onToggleNew={handleToggleProductNew}
                onQuickUpdateStock={handleQuickUpdateStock}
              />
            )}
          </>
        )}

        {adminSection === 'categories' && (
          <AdminCategories
            categories={categories}
            onSaveCategory={handleSaveCategory}
            onDeleteCategory={handleDeleteCategory}
            onToggleCategoryStatus={handleToggleCategoryStatus}
          />
        )}

        {adminSection === 'orders' && (
          <AdminOrders
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
          />
        )}

        {adminSection === 'inventory' && (
          <AdminInventory
            products={products}
            onUpdateStock={handleUpdateInventoryStock}
            onEditProduct={(p) => {
              setEditingProduct(p);
              setAdminSection('products');
            }}
          />
        )}

        {adminSection === 'settings' && (
          <AdminSettings
            settings={storeSettings}
            currentUser={adminUser}
            onSaveSettings={(updated) => {
              CatalogStore.updateSettings(updated);
              showToast('Configuración de la tienda guardada.');
            }}
            onResetDatabase={() => {
              CatalogStore.resetToInitial();
              showToast('Base de datos restablecida a los datos iniciales.');
            }}
            allProductsCount={products.length}
          />
        )}

        {/* Delete Confirmation Modal */}
        <AdminDeleteConfirmModal
          isOpen={!!deletingProduct}
          product={deletingProduct}
          onClose={() => setDeletingProduct(null)}
          onConfirmDelete={handleConfirmDeleteProduct}
        />

        {/* Customer View Live Preview Modal */}
        <AdminProductPreviewModal
          isOpen={!!previewingProduct}
          product={previewingProduct}
          onClose={() => setPreviewingProduct(null)}
        />

        {/* Toast */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 bg-stone-900/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
            <Sparkles size={16} className="text-rose-400" />
            <span>{toastMessage}</span>
          </div>
        )}
      </AdminLayout>
    );
  }

  // -------------------------------------------------------------
  // RENDER: CUSTOMER PUBLIC CATALOG (Client View)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#FFFDFE] text-stone-800 flex flex-col font-sans selection:bg-rose-100 selection:text-rose-800">
      {/* Floating admin banner if authenticated */}
      {AuthService.isAuthenticated() && (
        <div className="bg-stone-900 text-white px-4 py-2 flex items-center justify-between text-xs sticky top-0 z-50 border-b border-stone-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold">Modo Administrador Activo</span>
            <span className="hidden sm:inline text-stone-400">
              — Estás viendo la tienda como cliente
            </span>
          </div>
          <button
            type="button"
            onClick={() => setAppMode('admin')}
            id="floating-return-admin-btn"
            className="px-3 py-1 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
          >
            <ShieldCheck size={14} />
            <span>Volver al Panel Admin</span>
          </button>
        </div>
      )}

      {/* Main Client Header */}
      <Header
        onOpenSearch={() => handleTabChange('search')}
        onOpenFavorites={() => setCurrentTab('favorites')}
        onOpenCart={() => setIsCartOpen(true)}
        onNavigateHome={() => handleTabChange('home')}
        onSelectCategory={handleSelectCategory}
        onOpenAdmin={handleOpenAdminPanel}
        isAdminAuthenticated={AuthService.isAuthenticated()}
        favoritesCount={favorites.length}
        cartCount={totalCartCount}
        categories={categories}
      />

      {/* Main Customer Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* VIEW: FAVORITES */}
        {currentTab === 'favorites' ? (
          <FavoritesView
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            onSelectProduct={(prod) => setSelectedProduct(prod)}
            onAddToCart={(prod) => handleAddToCart(prod, 1)}
            onBackToHome={() => setCurrentTab('home')}
          />
        ) : (
          <>
            {/* Hero Banner only on Home */}
            {currentTab === 'home' && (
              <HeroBanner
                onExploreClick={() => {
                  window.scrollTo({ top: 400, behavior: 'smooth' });
                }}
                onSelectCategory={handleSelectCategory}
                featuredCount={featuredProducts.length}
              />
            )}

            {/* Categories Carousel */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                    Líneas de Creación
                  </h2>
                  <p className="text-xs text-stone-500">
                    Explora nuestras piezas artesanales hechas a mano
                  </p>
                </div>
                {filters.category !== 'todos' && (
                  <button
                    onClick={() => handleSelectCategory('todos')}
                    className="text-xs font-semibold text-rose-600 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw size={12} />
                    Ver todas
                  </button>
                )}
              </div>

              <CategoryList
                categories={categories.filter((c) => c.status !== 'inactive')}
                selectedCategory={filters.category}
                onSelectCategory={handleSelectCategory}
              />
            </section>

            {/* Search & Filter Controls Bar */}
            <div id="search-section" className="sticky top-16 z-20 pt-2 pb-1 bg-[#FFFDFE]/95 backdrop-blur-sm">
              <SearchFilterBar
                filters={filters}
                onSearchChange={(q) => setFilters((prev) => ({ ...prev, searchQuery: q }))}
                onSortChange={(s) => setFilters((prev) => ({ ...prev, sortBy: s }))}
                onOpenFilterModal={() => setIsFilterModalOpen(true)}
                onClearFilters={() => setFilters(DEFAULT_FILTERS)}
                totalCount={customerFilteredProducts.length}
              />
            </div>

            {/* PRODUCT GRID SECTION */}
            <section className="space-y-6">
              {/* If on Home and no filters active, show Featured and New highlight carousels */}
              {currentTab === 'home' &&
                filters.category === 'todos' &&
                !filters.searchQuery && (
                  <>
                    {/* Featured Section */}
                    {featuredProducts.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                            <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                              Creaciones Destacadas
                            </h3>
                          </div>
                          <span className="text-xs text-stone-400">Favoritas del taller</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                          {featuredProducts.slice(0, 4).map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              isFavorite={favorites.some((f) => f.id === product.id)}
                              onToggleFavorite={handleToggleFavorite}
                              onSelectProduct={(p) => setSelectedProduct(p)}
                              onQuickAddToCart={(p) => handleAddToCart(p, 1)}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* New arrivals highlight */}
                    {newProducts.length > 0 && (
                      <div className="space-y-3 pt-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-pink-400" />
                            <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                              Novedades Recién Elaboradas
                            </h3>
                          </div>
                          <span className="text-xs text-rose-500 font-medium">Nuevas piezas</span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                          {newProducts.slice(0, 4).map((product) => (
                            <ProductCard
                              key={product.id}
                              product={product}
                              isFavorite={favorites.some((f) => f.id === product.id)}
                              onToggleFavorite={handleToggleFavorite}
                              onSelectProduct={(p) => setSelectedProduct(p)}
                              onQuickAddToCart={(p) => handleAddToCart(p, 1)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

              {/* Main Catalog Grid Header */}
              <div className="pt-4 border-t border-rose-100/60 flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                    {filters.category !== 'todos'
                      ? categories.find((c) => c.id === filters.category)?.name || 'Catálogo'
                      : filters.searchQuery
                      ? `Resultados para "${filters.searchQuery}"`
                      : 'Todas las Creaciones'}
                  </h3>
                  <p className="text-xs text-stone-400">
                    {customerFilteredProducts.length}{' '}
                    {customerFilteredProducts.length === 1
                      ? 'pieza disponible'
                      : 'piezas artesanales'}
                  </p>
                </div>
              </div>

              {/* Grid or Empty state */}
              {customerFilteredProducts.length === 0 ? (
                <div className="bg-white rounded-3xl border border-rose-100 p-8 sm:p-12 text-center max-w-md mx-auto space-y-3 shadow-sm">
                  <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-400 mx-auto flex items-center justify-center">
                    <Search size={24} />
                  </div>
                  <h4 className="font-serif text-lg font-bold text-stone-800">
                    No encontramos piezas con estos filtros
                  </h4>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Prueba cambiando el término de búsqueda o restableciendo los filtros de precio y categoría.
                  </p>
                  <button
                    type="button"
                    onClick={() => setFilters(DEFAULT_FILTERS)}
                    className="px-4 py-2 bg-rose-500 text-white rounded-xl text-xs font-semibold hover:bg-rose-600 transition-colors shadow-xs"
                  >
                    Ver Todo el Catálogo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5">
                  {customerFilteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      isFavorite={favorites.some((f) => f.id === product.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onSelectProduct={(p) => setSelectedProduct(p)}
                      onQuickAddToCart={(p) => handleAddToCart(p, 1)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Brand Values / Footer */}
      <footer className="mt-12 bg-white border-t border-rose-100 pt-10 pb-16 md:pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          {/* Brand highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100/60 space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Sparkles size={20} />
              </div>
              <h4 className="font-serif text-base font-bold text-stone-900">
                100% Artesanal
              </h4>
              <p className="text-xs text-stone-500">
                Elaborado pieza por pieza con materiales nobles y esmero.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100/60 space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Heart size={20} />
              </div>
              <h4 className="font-serif text-base font-bold text-stone-900">
                Detalles que Enamoran
              </h4>
              <p className="text-xs text-stone-500">
                Empaque seguro y delicado listo para regalar o consentirte.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-rose-50/40 border border-rose-100/60 space-y-1.5">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                <Phone size={20} />
              </div>
              <h4 className="font-serif text-base font-bold text-stone-900">
                Atención Cercana
              </h4>
              <p className="text-xs text-stone-500">
                Pedidos personalizados y soporte continuo vía WhatsApp.
              </p>
            </div>
          </div>

          {/* Bottom Brand Bar */}
          <div className="pt-6 border-t border-rose-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <BrandLogo size="sm" showText={true} />
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={handleOpenAdminPanel}
                className="text-stone-400 hover:text-rose-600 text-xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ShieldCheck size={13} />
                <span>Acceso Administrativo</span>
              </button>
              <p>© 2026 ArteCrafts. Diseñado con delicadeza.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Bottom Navigation for Mobile */}
      <BottomNav
        currentTab={currentTab}
        onTabChange={handleTabChange}
        favoritesCount={favorites.length}
        cartCount={totalCartCount}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        isFavorite={
          selectedProduct
            ? favorites.some((f) => f.id === selectedProduct.id)
            : false
        }
        onToggleFavorite={handleToggleFavorite}
        onAddToCart={handleAddToCart}
        allProducts={publicProducts}
        onSelectRelatedProduct={(rel) => setSelectedProduct(rel)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        onContinueShopping={() => setIsCartOpen(false)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cart}
        onOrderSuccess={(orderData) => {
          setIsCheckoutOpen(false);
          setCart([]);
          setOrderSuccessData(orderData);
        }}
      />

      {/* Order Success Modal */}
      <OrderSuccessModal
        isOpen={!!orderSuccessData}
        onClose={() => setOrderSuccessData(null)}
        orderData={orderSuccessData}
      />

      {/* Advanced Filter Sheet */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        onResetFilters={() => setFilters(DEFAULT_FILTERS)}
        categories={categories}
      />

      {/* Floating User Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-6 right-6 z-50 bg-stone-900/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl border border-stone-800 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <Sparkles size={16} className="text-rose-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
