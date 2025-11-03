# ⚠️ Problema: Formato de Firma para Lynx Check-in

## 🔍 Situación Actual

Según la captura del proveedor, **estamos enviando el SVG completo como texto**:

```
signature_url: "<svg width=\"600\" height=\"200\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M 148.8 125.4 L 151.3 122.4 L 156..."
```

## 📊 Análisis

### Lo que Hacemos Ahora:

```typescript
// supabase/functions/test-lynx-submission/index.ts (línea 111)
const signatureUrl = travelers[0].signature_data; // SVG completo desde BD
```

### Lo que Lynx Espera (según documentación):

Según el swagger de Lynx Check-in API:
- **Campo**: `signature` (string)
- **Formato esperado**: URL pública apuntando a archivo SVG
- **Ejemplo**: `https://storage.supabase.co/signatures/firma-abc123.svg`

## ❓ Pregunta Crítica

**¿Lynx acepta el SVG inline o requiere una URL?**

Opciones:
1. ✅ **Lynx acepta SVG inline** → No hay problema, seguir así
2. ❌ **Lynx requiere URL** → Necesitamos subir a Storage

## 📝 Recomendaciones

### Opción A: Si Lynx Acepta SVG Inline (actual)

**Ventajas:**
- ✅ Más simple
- ✅ No requiere Storage
- ✅ Ya funciona

**Desventajas:**
- ❌ Payload muy grande
- ❌ No sigue la especificación del swagger
- ❌ Posibles problemas futuros

### Opción B: Subir a Supabase Storage (recomendado)

**Ventajas:**
- ✅ Sigue la especificación
- ✅ Payload más pequeño
- ✅ URLs permanentes
- ✅ Mejor para auditoría

**Desventajas:**
- ⚠️ Requiere configurar Storage
- ⚠️ Más complejo

## 🛠️ Implementación de Opción B

### 1. Crear Bucket en Supabase

```sql
-- En Supabase Dashboard → Storage
-- Crear bucket: 'traveler-signatures'
-- Configurar como público
```

### 2. Modificar test-lynx-submission/index.ts

```typescript
// 6. Subir firma a Supabase Storage
const signatureSvg = travelers[0].signature_data;
const fileName = `${request.id}-${Date.now()}.svg`;
const filePath = `signatures/${fileName}`;

// Upload to Storage
const { data: uploadData, error: uploadError } = await supabase.storage
  .from('traveler-signatures')
  .upload(filePath, signatureSvg, {
    contentType: 'image/svg+xml',
    upsert: false
  });

if (uploadError) {
  throw new Error(`Error uploading signature: ${uploadError.message}`);
}

// Get public URL
const { data: publicUrlData } = supabase.storage
  .from('traveler-signatures')
  .getPublicUrl(filePath);

const signatureUrl = publicUrlData.publicUrl;
```

### 3. Actualizar traveler_form_requests

Agregar columna para guardar la URL:
```sql
ALTER TABLE traveler_form_requests
ADD COLUMN signature_url TEXT;

COMMENT ON COLUMN traveler_form_requests.signature_url IS 
'URL pública de la firma subida a Storage. Se usa para enviar a Lynx Check-in API.';
```

## 🎯 Acción Inmediata Requerida

**PREGUNTA AL PROVEEDOR (LYNX):**

"Hola, vemos que estamos enviando el SVG completo en el campo `signature`. 

¿Lynx acepta el SVG inline como string o requiere una URL pública apuntando a un archivo SVG?

Si requiere URL, ¿hay alguna validación o el envío fallará?"

**Respuestas posibles:**

1. **"Aceptamos ambos formatos"** → Seguir como está
2. **"Solo URL"** → Implementar Storage
3. **"Solo SVG inline"** → Documentar que es correcto

## 📋 Checklist

- [ ] Confirmar con Lynx qué formato aceptan
- [ ] Si requieren URL, implementar subida a Storage
- [ ] Si aceptan ambos, documentar que SVG inline es válido
- [ ] Actualizar comentarios en el código según respuesta
- [ ] Probar envío real a Lynx

---

**Fecha**: 2025-11-03  
**Estado**: ⏳ Esperando confirmación del proveedor  
**Prioridad**: Media (funciona pero puede no cumplir especificación)

