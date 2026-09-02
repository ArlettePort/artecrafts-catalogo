# Guía de Despliegue a Vercel

## Requisitos previos

- Cuenta en GitHub (para alojar tu código)
- Cuenta en Vercel (gratuita)
- Cuenta en MongoDB Atlas (gratuita)
- Credenciales de MongoDB configuradas

## Paso 1: Preparar tu repositorio

```bash
# Si no tienes git inicializado
git init
git add .
git commit -m "Initial commit with MongoDB integration"

# Crear repo en GitHub (ir a github.com/new)
git remote add origin https://github.com/tu-usuario/tu-repo.git
git branch -M main
git push -u origin main
```

## Paso 2: Conectar con Vercel

1. Ve a https://vercel.com
2. Haz clic en "Add New" → "Project"
3. Importa tu repositorio desde GitHub
4. Vercel detectará automáticamente que es un proyecto Vite + Node.js

## Paso 3: Configurar variables de entorno

En la pantalla de configuración del proyecto:

1. Abre "Environment Variables"
2. Agrega las siguientes variables:

```
MONGODB_URI: mongodb+srv://usuario:contraseña@cluster.mongodb.net/artecrafts?retryWrites=true&w=majority
JWT_SECRET: genera-una-cadena-aleatoria-aqui
```

## Paso 4: Desplegar

```bash
# Vercel desplegará automáticamente cuando hagas push a main
git add .
git commit -m "Deploy to Vercel"
git push origin main
```

O despliega manualmente:

```bash
npm install -g vercel
vercel --prod
```

## Paso 5: Verificar despliegue

1. Ve a https://vercel.com/dashboard
2. Verifica que el proyecto se desplegó correctamente
3. Verifica los logs: `vercel logs`
4. Prueba la API: `https://tu-dominio.vercel.app/api/products`

## URLs después del despliegue

- Frontend: `https://tu-dominio.vercel.app`
- API: `https://tu-dominio.vercel.app/api/`

## Actualizar la variable VITE_API_URL

Después de obtener tu URL de Vercel, actualiza en Vercel dashboard:

```
VITE_API_URL: https://tu-dominio.vercel.app
```

## Despliegues posteriores

Cada vez que hagas push a `main`:

```bash
git add .
git commit -m "Your change"
git push origin main
```

Vercel desplegará automáticamente.

## Troubleshooting

### Error: "MONGODB_URI not found"
- Verifica que la variable esté en Vercel environment variables
- Redeploy después de agregar variables: `vercel --prod`

### Error: "Connection refused"
- Tu IP está filtrada en MongoDB. Ve a MongoDB Atlas → Security → Network Access
- Agrega `0.0.0.0/0` para permitir todas las conexiones (desarrollo)
- Para producción, usa un IP específica

### API no responde
- Verifica los logs: `vercel logs`
- Asegúrate de que MONGODB_URI es correcta
- Espera 5 minutos después de cambiar variables (tiempo de cache)

### Función serverless timeout
- Las funciones de Vercel tienen timeout de 60s (plan gratuito)
- Optimiza tus queries de MongoDB si es muy lento

## Dominio personalizado

1. Compra un dominio en Vercel o un registrador (GoDaddy, Namecheap, etc.)
2. En Vercel dashboard → Settings → Domains
3. Agrega tu dominio
4. Sigue las instrucciones para apuntar el DNS

## Próximos pasos

- Configura un webhook de GitHub para automático despliegues
- Agrega uptime monitoring (Better Stack, Updown.io)
- Configura backups automáticos de MongoDB
- Agrega un CDN para imágenes (Cloudinary, AWS CloudFront)

## Comandos útiles

```bash
# Ver logs en vivo
vercel logs --follow

# Información del proyecto
vercel inspect

# Variables de entorno
vercel env pull

# Desplegar específica rama
vercel --target=staging
```
