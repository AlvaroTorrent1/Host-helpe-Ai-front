# 📸 Envío Directo de Imágenes al Webhook n8n

## 🎯 Objetivo
Enviar imágenes directamente como archivos binarios al webhook de n8n, sin almacenarlas primero en Supabase.

## 🔄 Flujo Implementado

### 1. **Frontend → Webhook Directo**
```
Usuario sube imágenes → FormData con archivos binarios → n8n webhook
```

### 2. **Estructura de Datos Enviados**
El webhook recibe un `multipart/form-data` con:

```
FormData {
  // Metadatos de la propiedad
  property_id: string
  property_name: string
  total_images: string
  
  // Archivos binarios (para cada imagen)
  image_0: File (binary)
  image_0_size: string
  image_0_type: string
  
  image_1: File (binary)
  image_1_size: string
  image_1_type: string
  
  // ... más imágenes
}
```

## 🛠️ Implementación

### Servicio: `directImageWebhookService.ts`
- **Método principal**: `sendImagesToWebhook()`
- **URL del webhook**: `https://hosthelperai.app.n8n.cloud/webhook/images`
- **Formato**: `multipart/form-data`
- **Reintentos**: 3 intentos con backoff exponencial
- **Timeout**: 2 minutos

### Integración en PropertyManagement
```typescript
await directImageWebhookService.sendImagesToWebhook(
  propertyId,
  propertyName,
  imageFiles, // Array de File objects
  callbacks
);
```

## 🧪 Pruebas

### 1. **Prueba desde Node.js**
```bash
node scripts/test-direct-webhook.js
```

### 2. **Prueba con imagen real**
```bash
node scripts/test-direct-webhook.js /path/to/image.jpg
```

### 3. **Verificar en n8n**
1. Ir al workflow en n8n
2. Verificar que el webhook esté activo
3. Revisar los logs de ejecución

## 📋 Configuración del Webhook en n8n

### Nodo Webhook
1. **Método HTTP**: POST
2. **Path**: `/webhook/images`
3. **Response Mode**: "When last node finishes"
4. **Response Data**: "First item's JSON"

### Procesamiento de Archivos
```javascript
// En n8n, acceder a los archivos binarios:
const formData = items[0].json;
const binaryData = items[0].binary;

// Metadatos
const propertyId = formData.property_id;
const propertyName = formData.property_name;
const totalImages = parseInt(formData.total_images);

// Procesar cada imagen
for (let i = 0; i < totalImages; i++) {
  const imageData = binaryData[`image_${i}`];
  const imageSize = formData[`image_${i}_size`];
  const imageType = formData[`image_${i}_type`];
  
  // Procesar con IA, guardar, etc.
}
```

## ⚠️ Consideraciones

### CORS
- El webhook debe permitir peticiones desde el origen de la aplicación
- En desarrollo: `http://localhost:4001`
- En producción: Tu dominio

### Tamaño de Archivos
- Verificar límites del servidor n8n
- Considerar comprimir imágenes grandes antes de enviar

### Seguridad
- Considerar agregar autenticación al webhook
- Validar tipos de archivo permitidos
- Limitar tamaño máximo de archivos

## 🔍 Troubleshooting

### Error: CORS
```
Access to fetch at 'webhook-url' from origin 'http://localhost:4001' has been blocked by CORS policy
```
**Solución**: Configurar CORS en n8n o usar un proxy

### Error: 413 Payload Too Large
**Solución**: Reducir tamaño de imágenes o enviar en lotes

### Error: Timeout
**Solución**: Aumentar timeout o procesar menos imágenes por lote

## 📊 Ventajas del Enfoque Directo

1. **Simplicidad**: No hay pasos intermedios
2. **Velocidad**: Las imágenes llegan directamente a n8n
3. **Flexibilidad**: n8n puede procesar y almacenar donde prefiera
4. **Menos dependencias**: No requiere Supabase Storage 