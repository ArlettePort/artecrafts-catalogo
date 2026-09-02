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

  public createProduct(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewsCount'>): Product {
    const products = this.getProducts();
    const now = new Date().toISOString();
    const newId = `prod-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    const mainImage = data.mainImage || (data.images && data.images[0]) || '';
    const images = data.images && data.images.length > 0 ? data.images : [mainImage];

    const newProduct: Product = {
      ...data,
      id: newId,
      mainImage,
      images,
      rating: 5.0,
      reviewsCount: 1,
      manageStock: data.manageStock !== undefined ? data.manageStock : true,
      isAvailable: data.manageStock === false ? true : Number(data.stock) > 0,
      status: data.status || 'published',
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newProduct, ...products];
    this.saveProductsToStorage(updated);
    this.productsCache = updated;

    // Try to sync with API
    if (this.apiAvailable) {
      api.createProduct(newProduct).catch((error) => {
        console.error('Failed to sync product to API:', error);
        this.apiAvailable = false;
      });
    }

    this.updateCategoryCounts();
    this.notify();
    return newProduct;
  }

  public updateProduct(id: string, updates: Partial<Product>): Product | null {
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

    products[index] = updatedProduct;
    this.saveProductsToStorage(products);
    this.productsCache = products;

    // Try to sync with API
    if (this.apiAvailable) {
      api.updateProduct(id, updatedProduct).catch((error) => {
        console.error('Failed to sync product update to API:', error);
        this.apiAvailable = false;
      });
    }

    this.updateCategoryCounts();
    this.notify();
    return updatedProduct;
  }

  public deleteProduct(id: string): boolean {
    const products = this.getProducts();
    const filtered = products.filter((p) => p.id !== id);
    if (filtered.length === products.length) return false;

    this.saveProductsToStorage(filtered);
    this.productsCache = filtered;

    // Try to sync with API
    if (this.apiAvailable) {
      api.deleteProduct(id).catch((error) => {
        console.error('Failed to sync product deletion to API:', error);
        this.apiAvailable = false;
      });
    }

    this.updateCategoryCounts();
    this.notify();
    return true;
  }

  public toggleProductStatus(id: string): Product | null {
    const product = this.getProductById(id);
    if (!product) return null;
    const newStatus = product.status === 'published' ? 'hidden' : 'published';
    return this.updateProduct(id, { status: newStatus });
  }

  public toggleProductFeatured(id: string): Product | null {
    const product = this.getProductById(id);
    if (!product) return null;
    return this.updateProduct(id, { isFeatured: !product.isFeatured });
  }

  public toggleProductNew(id: string): Product | null {
    const product = this.getProductById(id);
    if (!product) return null;
    return this.updateProduct(id, { isNew: !product.isNew });
  }

  public updateStock(id: string, stock: number, manageStock?: boolean): Product | null {
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

  public createCategory(data: Omit<Category, 'id' | 'itemCount'> & { id?: string }): Category {
    const categories = this.getCategories();
    const id = data.id || data.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const newCategory: Category = {
      ...data,
      id,
      itemCount: 0,
      status: data.status || 'active',
    };
    const updated = [...categories, newCategory];
    this.saveCategoriesToStorage(updated);
    this.categoriesCache = updated;

    // Try to sync with API
    if (this.apiAvailable) {
      api.createCategory(newCategory).catch((error) => {
        console.error('Failed to sync category to API:', error);
        this.apiAvailable = false;
      });
    }

    this.updateCategoryCounts();
    this.notify();
    return newCategory;
  }

  public updateCategory(id: string, updates: Partial<Category>): Category | null {
    const categories = this.getCategories();
    const index = categories.findIndex((c) => c.id === id);
    if (index === -1) return null;

    categories[index] = { ...categories[index], ...updates };
    this.saveCategoriesToStorage(categories);
    this.categoriesCache = categories;

    // Try to sync with API
    if (this.apiAvailable) {
      api.updateCategory(id, categories[index]).catch((error) => {
        console.error('Failed to sync category update to API:', error);
        this.apiAvailable = false;
      });
    }

    this.notify();
    return categories[index];
  }

  public deleteCategory(id: string): boolean {
    const categories = this.getCategories();
    if (id === 'todos') return false; // Protected
    const filtered = categories.filter((c) => c.id !== id);
    if (filtered.length === categories.length) return false;

    this.saveCategoriesToStorage(filtered);
    this.categoriesCache = filtered;

    // Try to sync with API
    if (this.apiAvailable) {
      api.deleteCategory(id).catch((error) => {
        console.error('Failed to sync category deletion to API:', error);
        this.apiAvailable = false;
      });
    }

    this.notify();
    return true;
  }

  public toggleCategoryStatus(id: string): Category | null {
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

  public createOrder(data: {
    orderNumber: string;
    customer: OrderCustomerInfo;
    items: CartItem[];
    total: number;
    notes?: string;
  }): Order {
    const orders = this.getOrders();
    const now = new Date().toISOString();
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

    const updated = [newOrder, ...orders];
    this.saveOrdersToStorage(updated);
    this.ordersCache = updated;

    // Try to sync with API
    if (this.apiAvailable) {
      api.createOrder(newOrder).catch((error) => {
        console.error('Failed to sync order to API:', error);
        this.apiAvailable = false;
      });
    }

    this.notify();
    return newOrder;
  }

  public updateOrderStatus(orderId: string, status: Order['status']): Order | null {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === orderId);
    if (index === -1) return null;

    const now = new Date().toISOString();
    orders[index] = {
      ...orders[index],
      status,
      updatedAt: now,
    };

    this.saveOrdersToStorage(orders);
    this.ordersCache = orders;

    // Try to sync with API
    if (this.apiAvailable) {
      api.updateOrder(orderId, orders[index]).catch((error) => {
        console.error('Failed to sync order update to API:', error);
        this.apiAvailable = false;
      });
    }

    this.notify();
    return orders[index];
  }

  public deleteOrder(orderId: string): boolean {
    const orders = this.getOrders();
    const filtered = orders.filter((o) => o.id !== orderId);
    if (filtered.length === orders.length) return false;

    this.saveOrdersToStorage(filtered);
    this.ordersCache = filtered;

    // Try to sync with API
    if (this.apiAvailable) {
      api.deleteProduct(orderId).catch((error) => {
        console.error('Failed to sync order deletion to API:', error);
        this.apiAvailable = false;
      });
    }

    this.notify();
    return true;
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
