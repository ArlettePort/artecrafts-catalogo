# Guía de Integración Frontend con API

## Descripción General

Tu sistema ahora tiene una API completa con MongoDB. Los datos se pueden guardar y recuperar desde la nube.

## Pasos para Integrar

### 1. Usar el servicio de API en tus componentes

El archivo `src/services/api.ts` contiene todas las funciones necesarias.

**Ejemplo 1: Obtener productos**

```typescript
import { api } from './services/api';

// En tu componente
const [products, setProducts] = useState([]);

useEffect(() => {
  api.getProducts({ category: 'all' })
    .then(setProducts)
    .catch(console.error);
}, []);
```

**Ejemplo 2: Crear producto (Admin)**

```typescript
const handleCreateProduct = async (productData: Product) => {
  try {
    const newProduct = await api.createProduct(productData);
    setProducts([...products, newProduct]);
  } catch (error) {
    console.error('Error creating product:', error);
  }
};
```

**Ejemplo 3: Actualizar producto**

```typescript
const handleUpdateProduct = async (id: string, updatedData: Product) => {
  try {
    const updated = await api.updateProduct(id, updatedData);
    setProducts(products.map(p => p.id === id ? updated : p));
  } catch (error) {
    console.error('Error updating product:', error);
  }
};
```

### 2. Autenticación Admin

**Login:**

```typescript
const handleLogin = async (email: string, password: string) => {
  try {
    const { token, user } = await api.login(email, password);
    // token se guarda automáticamente en localStorage
    setCurrentUser(user);
    // Redirige al dashboard
  } catch (error) {
    console.error('Login failed:', error);
  }
};
```

**Registro:**

```typescript
const handleRegister = async (name: string, email: string, password: string) => {
  try {
    const { token, user } = await api.register(name, email, password);
    setCurrentUser(user);
  } catch (error) {
    console.error('Registration failed:', error);
  }
};
```

**Logout:**

```typescript
const handleLogout = () => {
  api.logout();
  setCurrentUser(null);
};
```

### 3. Gestionar Categorías

**Obtener todas:**

```typescript
const loadCategories = async () => {
  try {
    const categories = await api.getCategories();
    setCategories(categories);
  } catch (error) {
    console.error('Error loading categories:', error);
  }
};
```

**Crear nueva:**

```typescript
const addCategory = async (categoryData: Category) => {
  try {
    const newCategory = await api.createCategory(categoryData);
    setCategories([...categories, newCategory]);
  } catch (error) {
    console.error('Error adding category:', error);
  }
};
```

### 4. Gestionar Pedidos

**Obtener todos (solo admin):**

```typescript
const loadOrders = async () => {
  try {
    const orders = await api.getOrders();
    setOrders(orders);
  } catch (error) {
    console.error('Error loading orders:', error);
  }
};
```

**Crear nuevo pedido (cliente):**

```typescript
const submitOrder = async (orderData: Order) => {
  try {
    const newOrder = await api.createOrder(orderData);
    console.log('Order created:', newOrder.orderNumber);
    return newOrder;
  } catch (error) {
    console.error('Error creating order:', error);
  }
};
```

**Actualizar estado (admin):**

```typescript
const updateOrderStatus = async (orderId: string, newStatus: string) => {
  try {
    const updated = await api.updateOrder(orderId, { status: newStatus });
    setOrders(orders.map(o => o.id === orderId ? updated : o));
  } catch (error) {
    console.error('Error updating order:', error);
  }
};
```

## Cambios en componentes clave

### AdminDashboard.tsx

```typescript
import { api } from '../services/api';

export function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const products = await api.getProducts();
        const orders = await api.getOrders();
        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };
    loadStats();
  }, []);

  return (
    // Tu JSX aquí
  );
}
```

### AdminProductsList.tsx

```typescript
import { api } from '../services/api';

export function AdminProductsList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deleteProduct(id);
      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    // Tu JSX aquí
  );
}
```

## Variables de entorno en frontend

En `vite.config.ts`, asegúrate de que se pasen las variables:

```typescript
export default defineConfig({
  plugins: [react()],
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
  },
});
```

## Testing local

1. Configura `.env.local` con tu MongoDB URI
2. Ejecuta: `npm run dev:api` en una terminal
3. Ejecuta: `npm run dev` en otra terminal
4. Abre http://localhost:5173
5. Prueba crear/actualizar/eliminar productos

## Próximos pasos

1. **Validar datos**: Agrega validaciones antes de enviar
2. **Manejo de errores**: Muestra mensajes de error amigables
3. **Caching**: Implementa React Query o SWR para mejor caching
4. **Autorización**: Verifica tokens en cada componente admin
5. **Imágenes**: Configura subida de imágenes a un CDN (Cloudinary, AWS S3)

## Solución de problemas

**Error: "Failed to fetch"**
- Verifica que la API está corriendo: `npm run dev:api`
- Revisa que VITE_API_URL sea correcto

**Error: "Unauthorized"**
- El token ha expirado, haz login nuevamente
- Verifica que el token se guardó en localStorage

**Error: "MongoDB connection"**
- Verifica que MONGODB_URI es correcto en `.env.local`
- Revisa que tu IP está en MongoDB Atlas whitelist
