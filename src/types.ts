export interface ProductVariant {
  id: string;
  name: string; // e.g. "Rosa Pastel", "Vainilla Francesa", "Dorado"
  inStock: boolean;
}

export type ProductStatus = 'published' | 'hidden' | 'draft';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  images: string[];
  mainImage?: string; // imagenPrincipal
  description: string;
  shortDescription?: string;
  materials?: string[];
  dimensions?: string;
  stock: number;
  manageStock?: boolean; // true = numeric stock, false = hecho bajo pedido / sin límite
  isAvailable?: boolean; // disponible
  isNew?: boolean;
  isFeatured?: boolean;
  status?: ProductStatus; // 'published' | 'hidden' | 'draft'
  rating: number;
  reviewsCount: number;
  createdAt?: string; // ISO string
  updatedAt?: string; // ISO string
  variants?: {
    type: string; // e.g. "Aroma", "Color", "Tamaño"
    options: ProductVariant[];
  };
}

export interface Category {
  id: string;
  name: string;
  iconName: string;
  image: string;
  itemCount?: number;
  tagline: string;
  description?: string;
  status?: 'active' | 'inactive';
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

export type SortOption =
  | 'recent'
  | 'oldest'
  | 'price-asc'
  | 'price-desc'
  | 'featured'
  | 'name-asc';

export interface FilterState {
  searchQuery: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  onlyInStock: boolean;
  onlyFeatured: boolean;
  onlyNew: boolean;
  sortBy: SortOption;
}

export interface OrderCustomerInfo {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes?: string;
  paymentMethod: 'whatsapp' | 'transferencia' | 'contra-entrega' | 'tarjeta';
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'editor';
  avatar?: string;
}

export type AdminSection = 'dashboard' | 'products' | 'categories' | 'orders' | 'inventory' | 'settings';

export interface Order {
  id: string;
  orderNumber: string;
  customer: OrderCustomerInfo;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface StoreSettings {
  storeName: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  freeShippingThreshold: number;
  shippingCost: number;
  currency: string;
  currencySymbol: string;
}
