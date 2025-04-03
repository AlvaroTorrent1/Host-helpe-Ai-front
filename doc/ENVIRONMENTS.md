# Configuración de Entornos en Host Helper AI

Este documento explica cómo están configurados los entornos de desarrollo y producción en el proyecto Host Helper AI.

## Archivos de Entorno

El proyecto usa los siguientes archivos de entorno:

- `.env.development` - Configuración para entorno de desarrollo local
- `.env.production` - Configuración para entorno de producción
- `.env.local` - Anulaciones locales (git-ignored, no se versionará)

## Desarrollo vs Producción

### Entorno de Desarrollo

Para trabajar en el entorno de desarrollo:

```bash
# Iniciar el servidor de desarrollo con configuración de desarrollo
npm run dev
```

En este modo:
- Se usa la configuración de `.env.development`
- Las redirecciones de autenticación apuntan a `localhost:4000`
- Se muestran logs y mensajes de depuración adicionales
- El modo debug está activado (`VITE_DEBUG_MODE=true`)

### Entorno de Producción

Para probar la configuración de producción localmente:

```bash
# Iniciar el servidor con configuración de producción
npm run dev:prod
```

Para construir la aplicación para producción:

```bash
# Construir con configuración de producción
npm run build
```

Para previsualizar la build de producción:

```bash
# Previsualizar la build de producción
npm run preview:prod
```

En este modo:
- Se usa la configuración de `.env.production`
- Las redirecciones de autenticación apuntan al dominio de producción
- Se reducen los logs y mensajes de depuración
- El modo debug está desactivado

## Variables de Entorno Importantes

Las siguientes variables son críticas para el funcionamiento correcto de la aplicación:

| Variable | Descripción | Ejemplo Desarrollo | Ejemplo Producción |
|----------|-------------|-------------------|-------------------|
| `VITE_SITE_URL` | URL base para autenticación | `http://localhost:4000` | `https://hosthelperai.com` |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | `https://blxngmtmknkdmikaflen.supabase.co` | `https://blxngmtmknkdmikaflen.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase | `eyJhbGciOiJI...` | `eyJhbGciOiJI...` |
| `VITE_ENVIRONMENT` | Entorno actual | `development` | `production` |
| `VITE_APP_NAME` | Nombre de la aplicación | `Host Helper AI (DEV)` | `Host Helper AI` |
| `VITE_DEBUG_MODE` | Activar modo depuración | `true` | `false` |

## Configuración de Puerto

El servidor de desarrollo corre en el puerto 4000, configurado en `vite.config.ts`:

```typescript
// vite.config.ts
server: {
  port: 4000,
  open: true,        // Opens the browser automatically
},
```

**IMPORTANTE**: Este puerto debe coincidir con el valor de `VITE_SITE_URL` en los archivos de entorno para que funcione correctamente la autenticación.

## Configuración de Supabase

Para que la autenticación funcione correctamente, debes configurar en el dashboard de Supabase:

1. **URL Configuration** en la sección **Authentication**:
   - **Site URL**: URL de producción (`https://hosthelperai.com`)
   - **Redirect URLs**:
     - URL de desarrollo (`http://localhost:4000/auth/callback`)
     - URL de producción (`https://hosthelperai.com/auth/callback`)

2. **Email Templates** en la sección **Authentication**:
   - Asegúrate de que utilices la variable `{{ .ConfirmationURL }}` en tus plantillas

## Configuración de Alias de Path

Los siguientes alias están disponibles para importaciones:

```typescript
// vite.config.ts
resolve: {
  alias: {
    '@features': path.resolve(__dirname, './src/features'),
    '@shared': path.resolve(__dirname, './src/shared'),
    '@services': path.resolve(__dirname, './src/services'),
    '@translations': path.resolve(__dirname, './src/translations'),
    '@types': path.resolve(__dirname, './src/types'),
    '@assets': path.resolve(__dirname, './src/assets'),
    '@': path.resolve(__dirname, './src')
  }
}
```

Esto permite importaciones limpias como:

```typescript
import { Button } from '@shared/components/Button';
```

## Anulaciones Locales

Si necesitas usar una configuración específica para tu entorno local (sin afectar al repositorio), puedes crear un archivo `.env.local` que anulará cualquier configuración en los otros archivos `.env.*`.

## Comandos Útiles

```bash
# Iniciar el servidor de desarrollo
npm run dev

# Iniciar el servidor en modo producción
npm run dev:prod

# Construir para producción
npm run build

# Construir para desarrollo (para depuración)
npm run build:dev

# Previsualizar la build
npm run preview

# Previsualizar la build de producción
npm run preview:prod

# Desplegar (build + preview)
npm run deploy
```

## Solución de Problemas

Si los enlaces de confirmación de correo no funcionan:

1. Verifica que `VITE_SITE_URL` tiene el valor correcto para el entorno en que estás
2. Comprueba que el Site URL en el dashboard de Supabase está configurado correctamente
3. Verifica que las Redirect URLs en Supabase incluyen la ruta `/auth/callback`
4. Asegúrate de que las plantillas de correo electrónico usan `{{ .ConfirmationURL }}`
5. Utiliza el log del navegador para ver información de depuración

Si no puedes acceder al servidor de desarrollo:

1. Verifica que el puerto 4000 no esté en uso por otra aplicación
2. Comprueba que no hay errores en la terminal donde ejecutas `npm run dev`
3. Verifica tus configuraciones de firewall o antivirus que podrían estar bloqueando el acceso 