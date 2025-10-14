# Configuración de Variables de Entorno para N8N Webhook

## Variables Requeridas

Para que el sistema de webhook funcione correctamente, necesitas configurar las siguientes variables de entorno:

### 1. Variables del Frontend (.env.local)

Crea un archivo `.env.local` en la raíz del proyecto con:

```env
# Token de autenticación del webhook
VITE_N8N_WEBHOOK_TOKEN=hosthelper-n8n-secure-token-2024

# Configuración de Supabase
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anonima

# Configuraciones de desarrollo (opcional)
VITE_ENABLE_WEBHOOK_PROCESSING=true
VITE_DEBUG_WEBHOOK=true
```

### 2. Variables de Supabase (Secrets)

En el dashboard de Supabase, ve a **Settings > Secrets** y configura:

```bash
N8N_WEBHOOK_TOKEN=hosthelper-n8n-secure-token-2024
```

O usando CLI:
```bash
npx supabase secrets set N8N_WEBHOOK_TOKEN=hosthelper-n8n-secure-token-2024
```

## Instrucciones de Configuración

### Paso 1: Crear archivo de entorno local

```bash
# En la raíz del proyecto
echo "VITE_N8N_WEBHOOK_TOKEN=hosthelper-n8n-secure-token-2024" > .env.local
echo "VITE_ENABLE_WEBHOOK_PROCESSING=true" >> .env.local
echo "VITE_DEBUG_WEBHOOK=true" >> .env.local
```

### Paso 2: Configurar Supabase Secrets

1. Ve al dashboard de Supabase
2. Selecciona tu proyecto
3. Ve a **Settings > Secrets**
4. Agrega: `N8N_WEBHOOK_TOKEN` = `hosthelper-n8n-secure-token-2024`

### Paso 3: Verificar configuración

```typescript
// En el navegador, verifica que las variables estén disponibles:
console.log('Webhook Token:', import.meta.env.VITE_N8N_WEBHOOK_TOKEN);
console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
```

## Seguridad en Producción

⚠️ **IMPORTANTE**: En producción, cambia el token por uno seguro:

```bash
# Generar token seguro
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Configurar en Supabase
npx supabase secrets set N8N_WEBHOOK_TOKEN=tu-token-super-seguro
```

## Verificación

Una vez configurado, el webhook estará disponible en:
```
https://tu-proyecto.supabase.co/functions/v1/n8n-webhook
```

Y el frontend podrá comunicarse con él usando el token configurado.