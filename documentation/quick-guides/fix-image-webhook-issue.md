# 🔧 Solución: Webhook de Imágenes no Funciona

## 📋 Problema Identificado
Las imágenes no llegan al webhook de n8n debido a **problemas de CORS** cuando se hace la petición directamente desde el navegador.

## ✅ Solución Implementada

### 1. **Edge Function como Proxy**
Se creó una Edge Function en Supabase que actúa como intermediario:
- **Archivo**: `supabase/functions/process-images-webhook/index.ts`
- **Función**: Recibe las peticiones del frontend y las reenvía a n8n
- **Beneficio**: Evita problemas de CORS y añade seguridad

### 2. **Actualización del Servicio**
Se modificó `imageWebhookService.ts` para usar la Edge Function:
```typescript
// Antes:
private webhookUrl = 'https://hosthelperai.app.n8n.cloud/webhook/images';

// Ahora:
private webhookUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-images-webhook`;
```

## 🚀 Pasos para Activar la Solución

### 1. **Desplegar la Edge Function**
```bash
# En la terminal, desde la raíz del proyecto
supabase functions deploy process-images-webhook
```

### 2. **Verificar el Despliegue**
```bash
# Ejecutar el script de debug
node scripts/test-image-webhook-debug.js
```

### 3. **Probar en el Frontend**
1. Crear una nueva propiedad con imágenes
2. Verificar en la consola del navegador (F12) que no hay errores CORS
3. Verificar que las imágenes se procesan correctamente

## 🔍 Debugging

### Verificar Logs de la Edge Function
1. Ir a [Supabase Dashboard](https://app.supabase.com)
2. Navegar a Functions → process-images-webhook
3. Ver la pestaña "Logs"

### Verificar Estado de Procesamiento
```sql
-- Ver propiedades pendientes
SELECT id, name, status, created_at 
FROM properties 
WHERE status = 'pending_media_processing'
ORDER BY created_at DESC;

-- Ver estado de imágenes
SELECT id, title, n8n_processing_status, ai_description, description_source
FROM media_files
WHERE property_id = '[PROPERTY_ID]'
AND file_type = 'image';
```

## 🛠️ Configuración de n8n

Asegúrate de que el webhook en n8n:
1. Está activo y escuchando en: `https://hosthelperai.app.n8n.cloud/webhook/images`
2. Acepta el formato de datos enviado (ver estructura en `imageWebhookService.ts`)
3. Responde con el formato esperado:
```json
{
  "success": true,
  "batch_id": "string",
  "processed_images": [...],
  "total_processed": 0,
  "total_failed": 0,
  "processing_time_ms": 0
}
```

## 📝 Notas Adicionales

- La Edge Function maneja reintentos automáticamente
- El timeout está configurado a 90 segundos
- Los logs se guardan automáticamente en Supabase
- Si el problema persiste, verificar la configuración CORS en n8n 