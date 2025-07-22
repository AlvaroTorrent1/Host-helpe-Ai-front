# 🚀 Guía Rápida: Desplegar proxy-n8n-webhook

## ❌ Problema Actual
Las imágenes no llegan al webhook de n8n porque la función `proxy-n8n-webhook` **NO está desplegada** en Supabase.

## ✅ Solución: Desplegar la Función

### Opción 1: Usando Supabase CLI (Recomendado)

```bash
# 1. Instalar Supabase CLI si no lo tienes
npm install -g supabase

# 2. Login en Supabase
supabase login

# 3. Vincular tu proyecto
supabase link --project-ref blxngmtmknkdmikaflen

# 4. Desplegar la función
supabase functions deploy proxy-n8n-webhook
```

### Opción 2: Usando el Dashboard de Supabase

1. Ve a https://app.supabase.com/project/blxngmtmknkdmikaflen/functions
2. Click en "New Function"
3. Nombre: `proxy-n8n-webhook`
4. Copia el contenido de `supabase/functions/proxy-n8n-webhook/index.ts`
5. Click en "Deploy"

## 📋 Verificación

Después de desplegar, prueba que funcione:

```bash
curl -X OPTIONS https://blxngmtmknkdmikaflen.supabase.co/functions/v1/proxy-n8n-webhook
```

Deberías recibir una respuesta 204 (No Content) con headers CORS.

## 🔍 ¿Por qué es necesario?

1. **CORS**: Los navegadores bloquean llamadas directas a n8n desde el frontend
2. **Proxy**: La función actúa como intermediario entre el frontend y n8n
3. **Seguridad**: Maneja la autenticación y validación de datos

## 📊 Flujo Completo

```
Frontend → proxy-n8n-webhook → n8n webhook → Procesamiento AI
```

## ⚠️ Importante

- La función ya está actualizada con headers CORS 2025
- Incluye retry logic y timeout handling
- Logging detallado para debugging

## 🆘 Si hay problemas

1. Verifica logs en Supabase Dashboard → Functions → Logs
2. Asegúrate que el webhook n8n esté activo
3. Revisa que la URL del webhook sea correcta: `https://hosthelperai.app.n8n.cloud/webhook/images` 