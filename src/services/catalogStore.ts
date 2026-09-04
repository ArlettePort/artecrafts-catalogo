import { Product, Category, StoreSettings, Order, CartItem, OrderCustomerInfo } from '../types';
import { CATEGORIES as INITIAL_CATEGORIES, INITIAL_PRODUCTS } from '../data/products';
import { api } from './api';

const STORAGE_KEY_PRODUCTS = 'artecrafts_db_products_v2';
const STORAGE_KEY_CATEGORIES = 'artecrafts_db_categories_v2';
const STORAGE_KEY_SETTINGS = 'artecrafts_db_settings_v2';
const STORAGE_KEY_ORDERS = 'artecrafts_db_orders_v2';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'ArteCrafts',
  phone: '+52 55 1234 5678',
  whatsappNumber: '525512345678',
  email: 'contacto@artecrafts.com',
  address: 'Av. Artesanos 240, Coyoacán',
  freeShippingThreshold: 45,
  shippingCost: 4.5,
  currency: 'USD',
  currencySymbol: '$',
};

// Ensure all initial products have the standard schema fields
function normalizeInitialProducts(): Product[] {
  const now = new Date().toISOString();
  return INITIAL_PRODUCTS.map((p, idx) => ({
    ...p,
    mainImage: p.images[0] || '',
    manageStock: p.manageStock !== undefined ? p.manageStock : true,
    isAvailable: p.stock > 0,
    status: p.status || 'published',
    createdAt: p.createdAt || new Date(Date.now() - (15 - idx) * 86400000).toISOString(),
    updatedAt: p.updatedAt || now,
  }));
}

function normalizeInitialCategories(): Category[] {
  return INITIAL_CATEGORIES.map((c) => ({
    ...c,
    status: c.status || 'active',
  }));
}

type StoreListener = () => void;

class CatalogStoreManager {
  private listeners: Set<StoreListener> = new Set();
  private productsCache: Product[] | null = null;
  private categoriesCache: Category[] | null = null;
  private ordersCache: Order[] | null = null;
  private apiAvailable = true;

  public subscribe(listener: StoreListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((listener) => {
      try {
        listener();
      } catch (err) {
        console.error('Error notifying store listener', err);
      }
    });
  }

  // PRODUCTS
  public async loadProductsFromAPI() {
    if (!this.apiAvailable) return;
    try {
      const products = await api.getProducts();
      this.productsCache = products;
      this.saveProductsToStorage(products);
      this.notify();
    } catch (error) {
      console.error('Failed to load products from API', error);
      this.apiAvailable = false;
    }
  }

  public getProducts(): Product[] {
    if (this.productsCache) {
      return this.productsCache.map((p) => ({
        ...p,
        mainImage: p.mainImage || (p.images && p.images[0]) || '',
        status: p.status || 'published',
        manageStock: p.manageStock !== undefined ? p.manageStock : true,
        isAvailable: p.manageStock === false ? true : p.stock > 0,
      }));
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY_PRODUCTS);
      if (!raw) {
        const initial = normalizeInitialProducts();
        this.saveProductsToStorage(initial);
        this.productsCache = initial;
        return initial;
      }
      const parsed = JSON.parse(raw) as Product[];
      this.productsCache = parsed;
      return parsed.map((p) => ({
        ...p,
        mainImage: p.mainImage || (p.images && p.images[0]) || '',
        status: p.status || 'published',
        manageStock: p.manageStock !== undefined ? p.manageStock : true,
        isAvailable: p.manageStock === false ? true : p.stock > 0,
      }));
    } catch {
      const initial = normalizeInitialProducts();
      this.productsCache = initial;
      return initial;
    }
  }

  // Get only published products for public client catalog
  public getPublicProducts(): Product[] {
    return this.getProducts().filter(
      (p) => p.status === 'published' || !p.status
    );
  }

  public getProductById(id: string): Product | undefined {
    return this.getProducts().find((p) => p.id === id);
  }

  private saveProductsToStorage(products: Product[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products to localStorage', e);
    }
  }

  public async createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewsCount'>): Promise<Product> {
    const mainImage = data.mainImage || (data.images && data.images[0]) || '';
    const images = data.images && data.images.length > 0 ? data.images : [mainImage];

    const newProduct: Omit<Product, 'id'> = {
      ...data,
      mainImage,
      images,
      rating: 5.0,
      reviewsCount: 1,
      manageStock: data.manageStock !== undefined ? data.manageStock : true,
      isAvailable: data.manageStock === false ? true : Number(data.stock) > 0,
      status: data.status || 'published',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      // Try to save to API first (MongoDB)
      const savedProduct = await api.createProduct(newProduct);
      const products = this.getProducts();
      const updated = [savedProduct, ...products];
      this.saveProductsToStorage(updated);
      this.productsCache = updated;
      this.updateCategoryCounts();
      this.notify();
      return savedProduct;
    } catch (error) {
      console.error('Failed to save product to API, saving to localStorage:', error);
      // Fallback to localStorage
      const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const products = this.getProducts();
      const localProduct: Product = {
        ...newProduct,
        id: newId,
      };
      const updated = [localProduct, ...products];
      this.saveProductsToStorage(updated);
      this.productsCache = updated;
      this.updateCategoryCounts();
      this.notify();
      throw new Error('Producto guardado localmente, pero no se sincronizó con la base de datos. Verifica tu conexión a MongoDB.');
    }
  }

  public async updateProduct(id: string, updates: Partial<Product>): Promise<Product | null> {
    const products = this.getProducts();
    const index = products.findIndex((p) => p.id === id);
    if (index === -1) return null;

    const existing = products[index];
    const now = new Date().toISOString();

    const mergedImages = updates.images || existing.images || [];
    const mergedMainImage =
      updates.mainImage || (updates.images && updates.images[0]) || existing.mainImage || (mergedImages[0] || '');

    const manageStock =
      updates.manageStock !== undefined ? updates.manageStock : existing.manageStock !== undefined ? existing.manageStock : true;

    const newStock = updates.stock !== undefined ? Number(updates.stock) : existing.stock;
    const isAvailable = manageStock === false ? true : newStock > 0;

    const updatedProduct: Product = {
      ...existing,
      ...updates,
      id: existing.id,
      images: mergedImages.length > 0 ? mergedImages : [mergedMainImage],
      mainImage: mergedMainImage,
      manageStock,
      stock: newStock,
      isAvailable,
      updatedAt: now,
    };

    try {
      // Try to update in API first (MongoDB)
      await api.updateProduct(id, updatedProduct);
      products[index] = updatedProduct;
      this.saveProductsToStorage(products);
      this.productsCache = products;
      this.updateCategoryCounts();
      this.notify();
      return updatedProduct;
    } catch (error) {
      console.error('Failed to update product in API, updating localStorage:', error);
      // Fallback to localStorage
      products[index] = updatedProduct;
      this.saveProductsToStorage(products);
      this.productsCache = products;
      this.updateCategoryCounts();
      this.notify();
      throw new Error('Producto actualizado localmente, pero no se sincronizó con la base de datos. Verifica tu conexión a MongoDB.');
    }
  }

  public async deleteProduct(id: string): Promise<boolean> {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;

    try {
      // Try to delete from API first (MongoDB)
      await api.deleteProduct(id);
      this.saveProductsToStorage(filtered);
      this.productsCache = filtered;
      this.updateCategoryCounts();
      this.notify();
      return true;
    } catch (error) {
      console.error('Failed to delete product from API, updating localStorage:', error);
      // Fallback to localStorage
      this.saveProductsToStorage(filtered);
      this.productsCache = filtered;
      this.updateCategoryCounts();
      this.notify();
      throw new Error('Producto eliminado localmente, pero no se sincronizó con la base de datos. Verifica tu conexión a MongoDB.');
    }
  }

  public async toggleProductStatus(id: string): Promise<Product | null> {
    const product = this.getProductById(id);
    if (!product) return null;
    const newStatus = product.status === 'published' ? 'hidden' : 'published';
    return this.updateProduct(id, { status: newStatus });
  }

  public async toggleProductFeatured(id: string): Promise<Product | null> {
    const product = this.getProductById(id);
    if (!product) return null;
    return this.updateProduct(id, { isFeatured: !product.isFeatured });
  }

  public async toggleProductNew(id: string): Promise<Product | null> {
    const product = this.getProductById(id);
    if (!product) return null;
    return this.updateProduct(id, { isNew: !product.isNew });
  }

  public async updateStock(id: string, stock: number, manageStock?: boolean): Promise<Product | null> {
    return this.updateProduct(id, {
      stock,
      manageStock: manageStock !== undefined ? manageStock : true,
    });
  }

  // CATEGORIES
  public async loadCategoriesFromAPI() {
    if (!this.apiAvailable) return;
    try {
      const categories = await api.getCategories();
      this.categoriesCache = categories;
      this.saveCategoriesToStorage(categories);
      this.notify();
    } catch (error) {
      console.error('Failed to load categories from API', error);
      this.apiAvailable = false;
    }
  }

  public getCategories(): Category[] {
    if (this.categoriesCache) {
      return this.categoriesCache;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (!raw) {
        const initial = normalizeInitialCategories();
        this.saveCategoriesToStorage(initial);
        this.categoriesCache = initial;
        return initial;
      }
      const parsed = JSON.parse(raw) as Category[];
      this.categoriesCache = parsed;
      return parsed;
    } catch {
      const initial = normalizeInitialCategories();
      this.categoriesCache = initial;
      return initial;
    }
  }

  public getActiveCategories(): Category[] {
    return this.getCategories().filter((c) => c.status !== 'inactive');
  }

  private saveCategoriesToStorage(categories: Category[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Failed to save categories to localStorage', e);
    }
  }

  public async createCategory(data: Omit<Category, 'id' | 'itemCount'> & { id?: string }): Promise<Category> {
    const id = data.id || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const newCategory: Category = {
      ...data,
      id,
      itemCount: 0,
      status: data.status || 'active',
    };

    try {
      // Try to save to API first (MongoDB)
      const savedCategory = await api.createCategory(newCategory);
      const categories = this.getCategories();
      const updated = [...categories, savedCategory];
      this.saveCategoriesToStorage(updated);
      this.categoriesCache = updated;
      this.updateCategoryCounts();
      this.notify();
      return savedCategory;
    } catch (error) {
      console.error('Failed to save category to API, saving to localStorage:', error);
      // Fallback to localStorage
      const categories = this.getCategories();
      const updated = [...categories, newCategory];
      this.saveCategoriesToStorage(updated);
      this.categoriesCache = updated;
      this.updateCategoryCounts();
      this.notify();
      throw new Error('Categoría guardada localmente, pero no se sincronizó con la base de datos. Verifica tu conexión a MongoDB.');
    }
  }

  public async updateCategory(id: string, updates: Partial<Category>): Promise<Category | null> {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    const updatedCategory = { ...categories[index], ...updates };

    try {
      // Try to update in API first (MongoDB)
      await api.updateCategory(id, updatedCategory);
      categories[index] = updatedCategory;
      this.saveCategoriesToStorage(categories);
      this.categoriesCache = categories;
      this.notify();
      return updatedCategory;
    } catch (error) {
      console.error('Failed to update category in API, updating localStorage:', error);
      // Fallback to localStorage
      categories[index] = updatedCategory;
      this.saveCategoriesToStorage(categories);
      this.categoriesCache = categories;
      this.notify();
      throw new Error('Categoría actualizada localmente, pero no se sincronizó con la base de datos. Verifica tu conexión a MongoDB.');
    }
  }

  public async deleteCategory(id: string): Promise<boolean> {
    const categories = this.getCategories();
    if (id === 'todos') return false; // Protected
    const filtered = categories.filter((c) => c.id !== id);
    if (filtered.length === categories.length) return false;

    try {
      // Try to delete from API first (MongoDB)
      await api.deleteCategory(id);
      this.saveCategoriesToStorage(filtered);
      this.categoriesCache = filtered;
      this.notify();
      return true;
    } catch (error) {
      console.error('Failed to delete category from API, updating localStorage:', error);
      // Fallback to localStorage
      this.saveCategoriesToStorage(filtered);
      this.categoriesCache = filtered;
      this.notify();
      throw new Error('Categoría eliminada localmente, pero no se sincronizó con la base de datos. Verifica tu conexión a MongoDB.');
    }
  }

  public async toggleCategoryStatus(id: string): Promise<Category | null> {
    const cat = this.getCategories().find((c) => c.id === id);
    if (!cat) return null;
    return this.updateCategory(id, {
      status: cat.status === 'active' ? 'inactive' : 'active',
    });
  }

  private updateCategoryCounts() {
    const products = this.getProducts().filter((p) => p.status === 'published' || !p.status);
    const categories = this.getCategories();

    const counts: Record<string, number> = { todos: products.length };
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });

    const updated = categories.map((c) => ({
      ...c,
      itemCount: c.id === 'todos' ? products.length : counts[c.id] || 0,
    }));

    this.saveCategoriesToStorage(updated);
  }

  // SETTINGS
  public getSettings(): StoreSettings {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (!raw) return DEFAULT_STORE_SETTINGS;
      return { ...DEFAULT_STORE_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  }

  public saveSettings(settings: StoreSettings): void {
    try {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(settings));
      this.notify();
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  // ORDERS
  public async loadOrdersFromAPI() {
    if (!this.apiAvailable) return;
    try {
      const orders = await api.getOrders();
      this.ordersCache = orders;
      this.saveOrdersToStorage(orders);
      this.notify();
    } catch (error) {
      console.error('Failed to load orders from API', error);
      this.apiAvailable = false;
    }
  }

  public getOrders(): Order[] {
    if (this.ordersCache) {
      return this.ordersCache;
    }

    try {
      const raw = localStorage.getItem(STORAGE_KEY_ORDERS);
      if (!raw) {
        this.ordersCache = [];
        return [];
      }
      const parsed = JSON.parse(raw) as Order[];
      this.ordersCache = parsed;
      return parsed;
    } catch {
      this.ordersCache = [];
      return [];
    }
  }

  private saveOrdersToStorage(orders: Order[]): void {
    try {
      localStorage.setItem(STORAGE_KEY_ORDERS, JSON.stringify(orders));
    } catch (e) {
      console.error('Failed to save orders to localStorage', e);
    }
  }

  public async createOrder(data: {
    orderNumber: string;
    customer: OrderCustomerInfo;
    items: CartItem[];
    total: number;
    notes?: string;
  }): Promise<Order> {
    const now = new Date().toISOString();
    const newOrderData = {
      customer: data.customer,
      items: data.items,
      total: data.total,
      status: 'pending' as const,
      notes: data.notes,
    };

    try {
      // Try to save to API first (MongoDB)
      const savedOrder = await api.createOrder(newOrderData);
      const orders = this.getOrders();
      const updated = [savedOrder, ...orders];
      this.saveOrdersToStorage(updated);
      this.ordersCache = updated;
      this.notify();
      return savedOrder;
    } catch (error) {
      console.error('Failed to save order to API, saving to localStorage:', error);
      // Fallback to localStorage
      const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newOrder: Order = {
        id: orderId,
        orderNumber: data.orderNumber,
        customer: data.customer,
        items: data.items,
        total: data.total,
        status: 'pending',
        createdAt: now,
        updatedAt: now,
        notes: data.notes,
      };
      const orders = this.getOrders();
      const updated = [newOrder, ...orders];
      this.saveOrdersToStorage(updated);
      this.ordersCache = updated;
      this.notify();
      throw new Error('Pedido guardado localmente, pero no se sincronizó con la base de datos. Verifica tu conexión a MongoDB.');
    }
  }

  public async updateOrderStatus(orderId: string, status: Order['status']): Promise<Order | null> {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;

    const now = new Date().toISOString();
    const updatedOrder = {
      ...orders[index],
      status,
      updatedAt: now,
    };

    try {
      // Try to update in API first (MongoDB)
      await api.updateOrder(orderId, updatedOrder);
      orders[index] = updatedOrder;
      this.saveOrdersToStorage(orders);
      this.ordersCache = orders;
      this.notify();
      return updatedOrder;
    } catch (error) {
      console.error('Failed to update order in API, updating localStorage:', error);
      // Fallback to localStorage
      orders[index] = updatedOrder;
      this.saveOrdersToStorage(orders);
      this.ordersCache = orders;
      this.notify();
      throw new Error('Pedido actualizado localmente, pero no se sincronizó con la base de datos. Verifica tu conexión a MongoDB.');
    }
  }

  public async deleteOrder(orderId: string): Promise<boolean> {
    const orders = this.getOrders();
    const filtered = orders.filter((o) => o.id !== orderId);
    if (filtered.length === orders.length) return false;

    try {
      // Try to delete from API first (MongoDB)
      await api.deleteOrder(orderId);
      this.saveOrdersToStorage(filtered);
      this.ordersCache = filtered;
      this.notify();
      return true;
    } catch (error) {
      console.error('Failed to delete order from API, updating localStorage:', error);
      // Fallback to localStorage
      this.saveOrdersToStorage(filtered);
      this.ordersCache = filtered;
      this.notify();
      throw new Error('Pedido eliminado localmente, pero no se sincronizó con la base de datos. Verifica tu conexión a MongoDB.');
    }
  }

  public subscribeOrders(cb: (orders: Order[]) => void): () => void {
    const handler = () => cb(this.getOrders());
    return this.subscribe(handler);
  }

  // RESET TO DEFAULTS
  public resetToDefaults(): void {
    const initialProds = normalizeInitialProducts();
    const initialCats = normalizeInitialCategories();
    this.saveProductsToStorage(initialProds);
    this.saveCategoriesToStorage(initialCats);
    this.saveSettings(DEFAULT_STORE_SETTINGS);
    this.updateCategoryCounts();
    this.notify();
  }

  // Aliases for convenience
  public addProduct = this.createProduct.bind(this);
  public addCategory = this.createCategory.bind(this);
  public toggleStatus = this.toggleProductStatus.bind(this);
  public toggleFeatured = this.toggleProductFeatured.bind(this);
  public toggleNew = this.toggleProductNew.bind(this);
  public updateSettings = this.saveSettings.bind(this);
  public resetToInitial = this.resetToDefaults.bind(this);

  public subscribeProducts(cb: (products: Product[]) => void): () => void {
    const handler = () => cb(this.getProducts());
    return this.subscribe(handler);
  }

  public subscribeCategories(cb: (categories: Category[]) => void): () => void {
    const handler = () => cb(this.getCategories());
    return this.subscribe(handler);
  }

  public subscribeSettings(cb: (settings: StoreSettings) => void): () => void {
    const handler = () => cb(this.getSettings());
    return this.subscribe(handler);
  }
}

export const catalogStore = new CatalogStoreManager();
export const CatalogStore = catalogStore;
export default catalogStore;
