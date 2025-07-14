# Implementación del Nuevo Workflow de Propiedades

## Fecha: 2025-01-22

## Resumen Ejecutivo

Se ha implementado exitosamente el nuevo flujo de trabajo para la gestión de propiedades, separando correctamente el procesamiento de documentos e imágenes según los requisitos especificados.

## Flujo de Datos Implementado

### 1. **Información Básica** → `properties` ✅
- Nombre, dirección, descripción
- Se guarda directamente en la tabla `properties`

### 2. **Imágenes** → `media_files` ✅
- Se suben al storage de Supabase
- Se guardan en `media_files` con `file_type='image'`
- Se vectorizan para uso posterior

### 3. **Documentos** → Webhook → `documents` 🔄
- Se envían al webhook: `https://hosthelperai.app.n8n.cloud/webhook/file`
- El webhook procesa y guarda en tabla `documents`
- NO se guardan en `media_files`

### 4. **Google Business Links** → `shareable_links` 🔄
- Se guardan directamente en tabla `shareable_links`
- `link_type='profile'` para identificarlos
- Disponibles para uso en mensajería

## Cambios Implementados

### Nuevos Servicios

#### `webhookDocumentService.ts`
```typescript
// Envía documentos al webhook de n8n
sendDocumentToWebhook(
  propertyId: string,
  propertyName: string,
  file: File,
  metadata: DocumentMetadata
): Promise<WebhookResponse>
```

**Características:**
- Conversión a base64
- Sistema de reintentos (3 intentos)
- Callbacks para estado de procesamiento
- Health check del webhook

#### `shareableLinkService.ts`
```typescript
// Gestiona enlaces compartibles
createShareableLink(
  propertyId: string,
  linkData: ShareableLinkData
): Promise<ShareableLink>

createGoogleBusinessLinks(
  propertyId: string,
  urls: string[]
): Promise<ShareableLink[]>
```

**Características:**
- CRUD completo para enlaces
- Validación de URLs
- Contador de clicks
- Soporte para múltiples plataformas

### Componentes Modificados

#### `PropertyDocumentsForm.tsx`
- **Antes**: Usaba `documentService` → guardaba en `media_files`
- **Ahora**: Usa `webhookDocumentService` → envía al webhook
- **Mejoras**:
  - Indicador de estado de procesamiento
  - Validación de propertyId (no permite "temp")
  - Mensajes de error mejorados
  - UI feedback durante procesamiento

#### `PropertyForm.tsx`
- **Modal 3**: Documentos ahora son temporales hasta el envío
- **Modal 4**: Rediseñado para múltiples URLs de Google Business
- **Datos adicionales**: `_temporaryDocuments` y `_googleBusinessUrls`

#### `PropertyManagementPage.tsx`
- **Procesamiento separado**:
  1. Crear/actualizar propiedad básica
  2. Subir imágenes → `media_files`
  3. Enviar documentos → webhook
  4. Guardar Google Business → `shareable_links`
- **Indicadores de progreso** para cada etapa

### Tipos Actualizados

#### `types/property.ts`
```typescript
// Removido de Property interface:
// documents?: PropertyDocument[];

// Nuevos tipos añadidos:
export type LinkType = 'image' | 'gallery' | 'document' | 'profile';
export type PlatformType = 'whatsapp' | 'telegram' | 'email' | 'general';
export interface ShareableLink { ... }
```

## Manejo de Errores

### Webhook de Documentos
1. **Reintentos automáticos**: 3 intentos con delay incremental
2. **Errores 4xx**: No reintentar (error del cliente)
3. **Errores 5xx**: Reintentar automáticamente
4. **Timeout**: Manejo graceful con mensaje al usuario

### Enlaces Compartibles
1. **Validación de URL**: Debe ser http:// o https://
2. **Verificación de propiedad**: Confirma que existe antes de crear link
3. **Creación en lote**: Maneja errores individuales sin fallar todo

## Consideraciones de UX

### Estados de Procesamiento
- `uploading`: Subiendo documento...
- `processing`: Procesando con IA...
- `completed`: ¡Documento procesado!
- `failed`: Error al procesar
- `retry`: Reintentando...

### Feedback Visual
- Indicadores de progreso con porcentaje
- Iconos animados según estado
- Colores semánticos (azul, verde, rojo, amarillo)
- Mensajes descriptivos en cada etapa

## Testing y Verificación

### Queries SQL de Verificación
```sql
-- Documentos NO deben estar en media_files
SELECT COUNT(*) FROM media_files WHERE file_type = 'document';
-- Resultado esperado: 0

-- Documentos procesados por webhook
SELECT * FROM documents WHERE property_id = 'xxx';

-- Enlaces de Google Business
SELECT * FROM shareable_links WHERE link_type = 'profile';
```

### Script de Verificación
- Ubicación: `scripts/test-new-workflow.js`
- Verifica el flujo completo
- Incluye queries SQL de verificación

## Compatibilidad

### Campo Legacy
- `google_business_profile_url` en `properties` se mantiene
- Se sincroniza con el primer URL de `shareable_links`
- Permite migración gradual

### Webhook n8n Legacy
- El procesamiento con IA del webhook n8n principal se mantiene
- Documentos ahora van a su webhook específico
- Separación clara de responsabilidades

## Próximos Pasos

1. **Monitoreo**:
   - Verificar logs del webhook de documentos
   - Confirmar procesamiento en tabla `documents`
   - Revisar creación de `shareable_links`

2. **Optimizaciones**:
   - Implementar cola de procesamiento para documentos
   - Cache de health checks del webhook
   - Bulk upload de documentos

3. **Migraciones**:
   - Migrar documentos existentes de `media_files` a `documents`
   - Migrar URLs legacy a `shareable_links`

## Conclusión

La implementación separa correctamente los flujos de datos según lo especificado:
- ✅ Imágenes → `media_files` (vectorizadas)
- ✅ Documentos → Webhook → `documents` (procesados)
- ✅ Google Business → `shareable_links` (compartibles)

El sistema es robusto, con manejo de errores apropiado y excelente feedback al usuario durante todo el proceso. 