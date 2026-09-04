# ⚙️ Configuración de MongoDB Atlas para Vercel

## Problema
MongoDB Atlas está bloqueando conexiones desde Vercel porque la IP no está en el whitelist.

## Solución: Permitir todas las IPs (Para Desarrollo)

### Paso 1: Ir al Dashboard de MongoDB Atlas
1. Ve a https://cloud.mongodb.com
2. Inicia sesión con tu cuenta
3. Selecciona tu proyecto/cluster

### Paso 2: Configurar Network Access
1. En el menú izquierdo, ve a **Security** → **Network Access**
2. Haz clic en el botón **ADD IP ADDRESS**
3. En el campo de IP, escribe: `0.0.0.0/0`
4. En la descripción, escribe: `Allow all (Vercel Development)`
5. Haz clic en **CONFIRM**

### Paso 3: Esperar a que se apliquen los cambios
- Los cambios pueden tomar 1-5 minutos en aplicarse
- Verás un estado indicando que se está actualizando

### Paso 4: Verificar la conexión
- Ve a https://artecrafts-catalog.vercel.app/api/test
- Deberías ver: `{"status":"OK","message":"API funcionando correctamente"...}`
- Ve a https://artecrafts-catalog.vercel.app/api/categories
- Deberías ver un array de categorías (vacío si no hay datos)

## ✅ Si funciona:
- Ahora puedes crear, leer, actualizar y eliminar:
  - **Categorías**: `/api/categories`
  - **Productos**: `/api/products`
  - **Órdenes**: `/api/orders`

## 📌 Notas de Seguridad
- `0.0.0.0/0` permite conexiones desde cualquier IP (NO recomendado para producción)
- Para producción, deberías agregar solo las IPs específicas de Vercel
- Para encontrar las IPs de Vercel, consulta: https://vercel.com/docs/edge-network/regions
