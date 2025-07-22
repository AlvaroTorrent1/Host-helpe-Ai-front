# Fix 401 Unauthorized Error en Webhook

## Problema Identificado
La Edge Function `proxy-n8n-webhook` está configurada con `verify_jwt=true` por defecto, lo que hace que Supabase rechace las peticiones antes de ejecutar el código.

## Solución Inmediata

### Paso 1: Login en Supabase CLI
```bash
npx supabase login
```
Esto abrirá tu navegador para autenticarte.

### Paso 2: Ejecutar el Script de Despliegue
```bash
deploy-proxy-webhook.bat
```

Este script desplegará la función con `--no-verify-jwt`, lo que permite peticiones sin autenticación JWT.

### Paso 3: Verificar que Funciona
```bash
node test-proxy-webhook.js
```

Si ves "✅ SUCCESS: Function accepts requests without JWT!", el problema está resuelto.

## Verificación en la Aplicación

1. Abre la aplicación
2. Crea una nueva propiedad con imágenes
3. Verifica en la consola del navegador que no hay errores 401
4. Las imágenes deberían procesarse correctamente

## Por Qué Funciona

- **verify_jwt=false**: Permite que la función acepte peticiones sin JWT de Supabase
- **Seguridad**: La función sigue siendo segura porque n8n tiene su propia autenticación
- **CORS**: Los headers CORS ya están configurados correctamente en la función

## Configuración Permanente

El archivo `supabase/config.toml` ya está configurado para mantener esta configuración:

```toml
[functions.proxy-n8n-webhook]
verify_jwt = false
```

Esto asegura que futuras implementaciones mantengan la configuración correcta. 