# 🏠 Flujo de Creación de Propiedades

## 📋 Resumen del Flujo

### 1. **Información Básica** → Tabla `properties` ✅
- Nombre, dirección, descripción
- Se guarda directamente en Supabase

### 2. **Imágenes** → Webhook `https://hosthelperai.app.n8n.cloud/webhook/images` ✅
- Se envían como archivos binarios (FormData)
- NO se guardan en Supabase Storage primero
- El webhook procesa y devuelve resultados

### 3. **Documentos** → Webhook `https://hosthelperai.app.n8n.cloud/webhook/file` ✅
- PDFs, DOCs, etc.
- Se envían para procesamiento con IA
- Se extraen y vectorizan para búsqueda

### 4. **Links Google Business** → Tabla `shareable_links` ✅
- Se guardan como enlaces compartibles
- Tipo: 'profile'

## 🔄 Flujo Técnico Detallado

### Paso 1: Crear Propiedad Base
```javascript
// PropertyManagementPage.tsx
const { data: newProperty } = await supabase
  .from("properties")
  .insert(propertyData)
  .select()
  .single();
```

### Paso 2: Enviar Imágenes al Webhook
```javascript
// directImageWebhookService.ts
await directImageWebhookService.sendImagesToWebhook(
  propertyId,
  propertyName,
  imageFiles, // Array de File objects
  callbacks
);

// Formato enviado:
FormData {
  property_id: string
  property_name: string
  total_images: string
  image_0: File (binary)
  image_0_size: string
  image_0_type: string
  // ... más imágenes
}
```

### Paso 3: Enviar Documentos al Webhook
```javascript
// webhookDocumentService.ts
await webhookDocumentService.sendDocumentToWebhook(
  propertyId,
  propertyName,
  documentFile,
  metadata
);

// Formato enviado:
FormData {
  property_id: string
  property_name: string
  document: File (binary)
  metadata: JSON string
}
```

### Paso 4: Guardar Links de Google Business
```javascript
// shareableLinkService.ts
await shareableLinkService.createGoogleBusinessLinks(
  propertyId,
  googleBusinessUrls
);
```

## ⚙️ Configuración de Webhooks en n8n

### Webhook de Imágenes
- **URL**: `/webhook/images`
- **Método**: POST
- **Content-Type**: multipart/form-data
- **Procesa**: Archivos binarios de imagen
- **Respuesta esperada**: JSON con resultados del procesamiento

### Webhook de Documentos
- **URL**: `/webhook/file`
- **Método**: POST
- **Content-Type**: multipart/form-data
- **Procesa**: Archivos de documentos (PDF, DOC, etc.)
- **Respuesta esperada**: JSON con texto extraído y vectorizado

## 🚨 Puntos Importantes

1. **NO usar mediaService**: Está deshabilitado porque intenta insertar campos obsoletos (category/subcategory)

2. **Imágenes van DIRECTO al webhook**: No se suben a Supabase Storage primero

3. **Documentos se procesan con IA**: El webhook extrae texto y lo vectoriza

4. **PropertyManagementPage es el componente principal**: No PropertyManagement

## 🔍 Troubleshooting

### Error: Las imágenes se guardan en Supabase
- Verificar que `mediaService.uploadMediaFiles` esté comentado
- Asegurarse de usar `directImageWebhookService`

### Error: CORS
- El webhook debe permitir peticiones desde el origen
- Considerar usar Edge Function como proxy

### Error: Timeout
- Aumentar timeout en directImageWebhookService
- Procesar menos imágenes por lote

## 📊 Estado Actual

- ✅ Información básica → BD
- ✅ Imágenes → Webhook n8n
- ✅ Documentos → Webhook n8n  
- ✅ Links → BD
- ❌ mediaService (deshabilitado por campos obsoletos) 