# ✅ Checklist de Configuración

Sigue estos pasos en orden para activar MongoDB en tu sistema.

## Paso 1: Crear cuenta MongoDB (5 min)

- [ ] Ve a https://www.mongodb.com/cloud/atlas
- [ ] Crea una cuenta nueva (puedes usar Google/GitHub)
- [ ] Completa el email de verificación
- [ ] Selecciona "M0 (Free)" como plan

## Paso 2: Crear un cluster (10 min)

- [ ] En el dashboard, haz clic en "Build a Database"
- [ ] Elige "M0 Free" (gratuito)
- [ ] Selecciona región: "AWS - us-east-1" (o más cercana)
- [ ] Haz clic en "Create Deployment"
- [ ] Espera a que diga "Deploying" (verde)

## Paso 3: Crear usuario de base de datos

- [ ] En el panel izquierdo, ve a "Database Access"
- [ ] Haz clic en "Add New Database User"
- [ ] Username: `artecrafts` (o lo que prefieras)
- [ ] Password: generador aleatorio (copia en lugar seguro)
- [ ] Role: "Atlas admin"
- [ ] Haz clic en "Add User"

## Paso 4: Configurar IP Whitelist

- [ ] Ve a "Security" → "Network Access"
- [ ] Haz clic en "Add IP Address"
- [ ] Agrega `0.0.0.0/0` (acceso de cualquier IP - para desarrollo)
- [ ] O agrega solo tu IP si prefieres más seguridad
- [ ] Haz clic en "Confirm"

## Paso 5: Obtener conexión URI

- [ ] Ve a "Databases" → Selecciona tu cluster
- [ ] Haz clic en "Connect"
- [ ] Elige "Drivers" → "Node.js"
- [ ] Copia la cadena de conexión
- [ ] Se verá así: `mongodb+srv://usuario:contraseña@cluster.mongodb.net/?retryWrites=true&w=majority`

## Paso 6: Configurar archivo .env.local

- [ ] Abre el archivo `.env.local` en tu proyecto
- [ ] Reemplaza `MONGODB_URI=...` con tu URI de conexión
- [ ] Reemplaza `<username>` y `<password>` con tus credenciales
- [ ] Reemplaza `<database>` con `artecrafts`

**Ejemplo final:**
```
MONGODB_URI=mongodb+srv://artecrafts:miContraseña123@cluster0.abc123.mongodb.net/artecrafts?retryWrites=true&w=majority
JWT_SECRET=tu-clave-super-segura-aqui
VITE_API_URL=http://localhost:3000
```

## Paso 7: Probar en desarrollo

- [ ] Abre una terminal en la carpeta del proyecto
- [ ] Ejecuta: `npm run dev:api`
- [ ] Abre otra terminal
- [ ] Ejecuta: `npm run dev`
- [ ] Abre http://localhost:5173

## Paso 8: Crear tu primer producto

- [ ] Haz clic en "Admin" (esquina inferior)
- [ ] Haz clic en "Productos"
- [ ] Haz clic en "Nuevo Producto"
- [ ] Rellena los datos:
  - Nombre: "Mi Primer Producto"
  - Categoría: Elige una
  - Precio: 10
  - Descripción: "Descripción de prueba"
  - Imagen: Pega una URL de imagen
- [ ] Haz clic en "Crear Producto"

## Paso 9: Verificar que se guardó en MongoDB

- [ ] Ve a https://cloud.mongodb.com
- [ ] Selecciona tu cluster
- [ ] Haz clic en "Browse Collections"
- [ ] Abre la colección "artecrafts" → "products"
- [ ] ¡Deberías ver tu producto creado!

## Paso 10: Desplegar a Vercel (opcional)

- [ ] Sube tu código a GitHub (si no está)
- [ ] Ve a https://vercel.com
- [ ] Haz clic en "Add New Project"
- [ ] Importa tu repositorio
- [ ] En "Environment Variables", agrega:
  - `MONGODB_URI`: tu URI
  - `JWT_SECRET`: tu clave secreta
- [ ] Haz clic en "Deploy"
- [ ] ¡Espera a que termine!

---

## ✨ ¡Listo!

Una vez completados estos pasos:

✅ Tu base de datos MongoDB está activa
✅ El frontend sincroniza automáticamente
✅ Los datos se guardan en la nube
✅ Puedes acceder desde cualquier dispositivo
✅ Está listo para publicar

## 🆘 Necesitas ayuda?

Si algo no funciona:

1. **Error de conexión MongoDB**: Revisa el .env.local (copia/pega correcto)
2. **Error 404 en API**: Asegúrate que `npm run dev:api` está corriendo
3. **Datos no se guardan**: Abre F12 (consola) y busca errores rojo

¡Contacta si necesitas ayuda!
