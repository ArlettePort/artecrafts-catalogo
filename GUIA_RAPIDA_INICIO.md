# 🚀 Guía Rápida de Inicio

## Requisitos Previos

✅ MongoDB Atlas configurado (ver `CHECKLIST.md` si necesitas ayuda)
✅ `.env.local` con `MONGODB_URI` correctamente configurada

## Pasos para Ejecutar

### Terminal 1: Inicia el Servidor de API
```bash
npm run dev:api
```

Deberías ver algo como:
```
✓ Ready on http://localhost:3000
```

### Terminal 2: Inicia el Frontend
```bash
npm run dev
```

Deberías ver algo como:
```
✓ ready in 500ms
VITE v6.2.3  ready on:
  ➜  Local:   http://localhost:5173/
```

### Abre el Navegador
Ve a: http://localhost:5173

## Usando el Admin Panel

1. **Haz clic en "Admin"** (esquina inferior derecha)
2. **Inicia sesión** (si no tienes cuenta, puedes crear una)
3. **Crea un producto**:
   - Nombre: "Mi Primer Producto"
   - Categoría: Elige una
   - Precio: 10
   - Descripción: "Prueba"
   - Imagen: Pega una URL
4. **Haz clic en "Crear Producto"**

## ✅ Verificar que se Guardó en MongoDB

### Opción 1: Consola del Navegador
1. Abre F12 (Developer Tools)
2. Ve a la pestaña "Console"
3. Si **no ves errores rojos**, ¡está funcionando!

### Opción 2: MongoDB Atlas
1. Ve a https://cloud.mongodb.com
2. Selecciona tu cluster
3. Haz clic en **"Browse Collections"**
4. Abre `artecrafts` → `products`
5. Deberías ver tu producto 🎉

## Solucionar Problemas

### Problema: "Error de conexión a MongoDB"

**Causas posibles:**
- ❌ `.env.local` no tiene `MONGODB_URI`
- ❌ `MONGODB_URI` está incorrecto
- ❌ La red de MongoDB no está permitida (IP Whitelist)
- ❌ Las credenciales están mal

**Solución:**
1. Ve a https://cloud.mongodb.com
2. Copia la URI de conexión (Drivers → Node.js)
3. Pégala en `.env.local`
4. Reinicia: `npm run dev:api`

### Problema: Los datos no aparecen en MongoDB

**Causas posibles:**
- ❌ No iniciaste `npm run dev:api`
- ❌ El servidor de API está en error
- ❌ La conexión a MongoDB falló silenciosamente

**Solución:**
1. Verifica la consola de `npm run dev:api` - ¿hay errores?
2. Abre F12 en el navegador - ¿hay errores?
3. Comprueba que MongoDB Atlas esté activo

### Problema: El sitio no carga

**Causas posibles:**
- ❌ No iniciaste `npm run dev`
- ❌ El puerto 5173 está en uso
- ❌ Hay un error de TypeScript

**Solución:**
1. Mata los procesos de Node: `lsof -ti:5173 | xargs kill -9`
2. Reinicia: `npm run dev`

## Comandos Útiles

```bash
# Limpiar cache
npm run clean

# Verificar tipos de TypeScript
npm run lint

# Verificar dependencias
npm list

# Reinstalar dependencias
rm -rf node_modules && npm install
```

## ¿Todo funciona? 🎉

Si llegaste aquí sin errores:
✅ Frontend funcionando
✅ API conectada
✅ MongoDB sincronizado
✅ ¡Sistema listo para usar!

## Próximos Pasos

- [ ] Personaliza los datos de la tienda (Admin → Configuración)
- [ ] Agrega más productos
- [ ] Prueba crear un pedido desde el cliente
- [ ] Verifica que los pedidos aparecen en Admin → Pedidos
- [ ] ¡Comparte tu tienda! 🚀
