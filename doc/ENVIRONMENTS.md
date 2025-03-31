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
- Las redirecciones de autenticación apuntan a `localhost`
- Se muestran logs y mensajes de depuración adicionales

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

En este modo:
- Se usa la configuración de `.env.production`
- Las redirecciones de autenticación apuntan al dominio de producción
- Se reducen los logs y mensajes de depuración

## Variables de Entorno Importantes

Las siguientes variables son críticas para el funcionamiento correcto de la autenticación:

| Variable | Descripción | Ejemplo Desarrollo | Ejemplo Producción |
|----------|-------------|-------------------|-------------------|
| `VITE_SITE_URL` | URL base para autenticación | `http://localhost:4001` | `https://hosthelperai.com` |
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | `https://tu-proyecto.supabase.co` | `https://tu-proyecto.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Clave anónima de Supabase | `tu-clave-anonima` | `tu-clave-anonima` |
| `VITE_ENVIRONMENT` | Entorno actual | `development` | `production` |

## Configuración de Supabase

Para que la autenticación funcione correctamente, debes configurar en el dashboard de Supabase:

1. **URL Configuration** en la sección **Authentication**:
   - **Site URL**: URL de producción (`https://hosthelperai.com`)
   - **Redirect URLs**:
     - URL de desarrollo (`http://localhost:4001/auth/callback`)
     - URL de producción (`https://hosthelperai.com/auth/callback`)

2. **Email Templates** en la sección **Authentication**:
   - Asegúrate de que utilices la variable `{{ .ConfirmationURL }}` en tus plantillas

## Anulaciones Locales

Si necesitas usar una configuración específica para tu entorno local (sin afectar al repositorio), puedes crear un archivo `.env.local` que anulará cualquier configuración en los otros archivos `.env.*`.

## Solución de Problemas

Si los enlaces de confirmación de correo no funcionan:

1. Verifica que `VITE_SITE_URL` tiene el valor correcto para el entorno en que estás
2. Comprueba que el Site URL en el dashboard de Supabase está configurado correctamente
3. Verifica que las Redirect URLs en Supabase incluyen la ruta `/auth/callback`
4. Asegúrate de que las plantillas de correo electrónico usan `{{ .ConfirmationURL }}`
5. Utiliza el log del navegador para ver información de depuración 