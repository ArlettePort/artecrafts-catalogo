# Configuración de Base de Datos MongoDB

Tu sistema de catálogo ahora tiene integración completa con MongoDB y funciones serverless de Vercel.

## 1. Crear una cuenta MongoDB Atlas (Gratuito)

1. Ve a https://www.mongodb.com/cloud/atlas
2. Crea una cuenta gratuita
3. Crea un nuevo proyecto
4. Crea un cluster (elige el plan gratuito M0)
5. Espera a que se despliegue (5-10 minutos)

## 2. Obtener la conexión URI

1. En MongoDB Atlas, ve a "Databases" → selecciona tu cluster
2. Haz clic en "Connect" → "Drivers" → "Node.js"
3. Copia la cadena de conexión
4. Reemplaza `<username>` y `<password>` con tus credenciales
5. Reemplaza `<database>` con un nombre (ej: `artecrafts`)

## 3. Configurar variables de entorno

### Para desarrollo local:

Abre `.env.local` y configura:

```
MONGODB_URI=mongodb+srv://tu-usuario:tu-contraseña@cluster.mongodb.net/artecrafts?retryWrites=true&w=majority
JWT_SECRET=tu-clave-secreta-super-segura-aqui
VITE_API_URL=http://localhost:3000
```

### Para producción en Vercel:

1. Ve a https://vercel.com
2. Conecta tu repositorio de GitHub
3. En "Settings" → "Environment Variables", agrega:
   - `MONGODB_URI`: tu URI de MongoDB
   - `JWT_SECRET`: una clave secreta aleatoria

## 4. Ejecutar en desarrollo

```bash
# Terminal 1: Vercel serverless dev
npm run dev:api

# Terminal 2: Vite frontend
npm run dev
```

La API estará en `http://localhost:3000/api/`
El frontend estará en `http://localhost:5173`

## 5. Desplegar a Vercel

```bash
# Instala Vercel CLI
npm i -g vercel

# Autentica
vercel login

# Despliega
vercel --prod
```

## Estructura de la API

- `GET /api/products` - Obtener todos los productos
- `POST /api/products` - Crear producto (requiere autenticación)
- `PUT /api/products?id=<id>` - Actualizar producto
- `DELETE /api/products?id=<id>` - Eliminar producto

- `GET /api/categories` - Obtener categorías
- `POST /api/categories` - Crear categoría
- `PUT /api/categories?id=<id>` - Actualizar categoría
- `DELETE /api/categories?id=<id>` - Eliminar categoría

- `GET /api/orders` - Obtener pedidos (admin)
- `POST /api/orders` - Crear pedido
- `PUT /api/orders?id=<id>` - Actualizar estado del pedido

- `POST /api/auth` - Autenticación
  - Body: `{ action: "login", email, password }`
  - Body: `{ action: "register", name, email, password }`

## Próximos pasos

1. **Conectar el frontend**: Actualiza tus componentes para usar estas APIs
2. **Agregar autenticación real**: Implementa JWT en el admin panel
3. **Validación de datos**: Agrega validación con Zod o similar
4. **Tests**: Crea tests para las APIs

## Solución de problemas

### Error "MONGODB_URI not defined"
- Revisa `.env.local` y asegúrate de que MONGODB_URI esté configurado

### Error de conexión a MongoDB
- Verifica que tu IP esté en la lista blanca de MongoDB Atlas
- Ve a Security → Network Access → Add IP Address

### Error 500 en la API
- Revisa los logs de Vercel: `vercel logs`
- Verifica que MongoDB esté corriendo
