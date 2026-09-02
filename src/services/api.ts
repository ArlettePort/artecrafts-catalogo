const getApiUrl = () => {
  if (typeof window === 'undefined') return 'http://localhost:3000';
  const hostname = window.location.hostname;
  const isDev = hostname === 'localhost' || hostname === '127.0.0.1';
  return isDev ? 'http://localhost:3000' : window.location.origin;
};

const API_URL = getApiUrl();

export const api = {
  // Products
  async getProducts(filters?: { category?: string; featured?: boolean }) {
    try {
      const params = new URLSearchParams();
      if (filters?.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters?.featured) params.append('featured', 'true');

      const response = await fetch(`${API_URL}/api/products?${params}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('getProducts error:', error);
      throw error;
    }
  },

  async createProduct(product: any) {
    try {
      const response = await fetch(`${API_URL}/api/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('createProduct error:', error);
      throw error;
    }
  },

  async updateProduct(id: string, product: any) {
    try {
      const response = await fetch(`${API_URL}/api/products?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(product),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('updateProduct error:', error);
      throw error;
    }
  },

  async deleteProduct(id: string) {
    try {
      const response = await fetch(`${API_URL}/api/products?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('deleteProduct error:', error);
      throw error;
    }
  },

  // Categories
  async getCategories() {
    try {
      const response = await fetch(`${API_URL}/api/categories`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('getCategories error:', error);
      throw error;
    }
  },

  async createCategory(category: any) {
    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(category),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('createCategory error:', error);
      throw error;
    }
  },

  async updateCategory(id: string, category: any) {
    try {
      const response = await fetch(`${API_URL}/api/categories?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(category),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('updateCategory error:', error);
      throw error;
    }
  },

  async deleteCategory(id: string) {
    try {
      const response = await fetch(`${API_URL}/api/categories?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('deleteCategory error:', error);
      throw error;
    }
  },

  // Orders
  async getOrders() {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('getOrders error:', error);
      throw error;
    }
  },

  async createOrder(order: any) {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('createOrder error:', error);
      throw error;
    }
  },

  async updateOrder(id: string, order: any) {
    try {
      const response = await fetch(`${API_URL}/api/orders?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(order),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    } catch (error) {
      console.error('updateOrder error:', error);
      throw error;
    }
  },

  // Auth
  async login(email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });
      if (!response.ok) throw new Error('Login failed');
      const data = await response.json();
      if (data.token) localStorage.setItem('auth_token', data.token);
      return data;
    } catch (error) {
      console.error('login error:', error);
      throw error;
    }
  },

  async register(name: string, email: string, password: string) {
    try {
      const response = await fetch(`${API_URL}/api/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'register', name, email, password }),
      });
      if (!response.ok) throw new Error('Registration failed');
      const data = await response.json();
      if (data.token) localStorage.setItem('auth_token', data.token);
      return data;
    } catch (error) {
      console.error('register error:', error);
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('auth_token');
  },

  getToken() {
    return localStorage.getItem('auth_token') || '';
  },

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  },
};

function getToken() {
  return localStorage.getItem('auth_token') || '';
}
