# Configuración VectorStoreSupabase - Mapeo de Property ID y Property Name

**PROBLEMA:** Los documentos se insertan en la tabla `documents` pero con `property_id` y `property_name` como `null`.

**CAUSA:** El nodo VectorStoreSupabase no tiene configurados los metadatos para mapear estos campos.

## 🎯 Solución: Configurar Metadatos en VectorStoreSupabase

### Paso 1: Configurar el Webhook para recibir `/webhook/file`

En n8n, el webhook debe estar configurado así:
```json
{
  "parameters": {
    "httpMethod": "POST",
    "path": "file",  // ← DEBE SER "file" no "pdf"
    "options": {}
  },
  "type": "n8n-nodes-base.webhook"
}
```

### Paso 2: Configurar Metadatos en VectorStoreSupabase

**CRÍTICO:** En el nodo VectorStoreSupabase, configurar la sección **"Metadata"**:

| Campo | Valor | Descripción |
|-------|--------|-------------|
| `property_id` | `{{ $json.property_id }}` | UUID de la propiedad (OBLIGATORIO) |
| `property_name` | `{{ $json.property_name }}` | Nombre de la propiedad |

### Configuración JSON Completa del Nodo

```json
{
  "parameters": {
    "mode": "insert",
    "tableName": {
      "__rl": true,
      "value": "documents",
      "mode": "list",
      "cachedResultName": "documents"
    },
    "options": {
      "metadata": {
        "property_id": "={{ $json.property_id }}",
        "property_name": "={{ $json.property_name }}"
      }
    }
  },
  "type": "@n8n/n8n-nodes-langchain.vectorStoreSupabase",
  "credentials": {
    "supabaseApi": {
      "id": "hu4XcV4KqaVPyxU7",
      "name": "SupaBase Image"
    }
  }
}
```

### Paso 3: Verificar Datos que Llegan del Frontend

El frontend envía estos campos en FormData:
```
property_id: [UUID de la propiedad]
property_name: [Nombre de la propiedad]  
user_id: [UUID del usuario]
document_name: [Nombre del documento]
document_type: [Tipo del documento]
file: [Archivo binario]
```

### Paso 4: Configuración Visual en n8n

1. **Abre el nodo VectorStoreSupabase**
2. **Busca la sección "Metadata" o "Additional Options"**
3. **Añade estos campos exactamente:**
   ```
   Nombre del campo: property_id
   Valor: {{ $json.property_id }}
   
   Nombre del campo: property_name
   Valor: {{ $json.property_name }}
   ```

### Paso 5: Verificación en Base de Datos

Después de la configuración, ejecuta esta consulta:

```sql
SELECT 
  id,
  property_id,
  property_name,
  content,
  created_at
FROM documents 
WHERE property_id IS NOT NULL
ORDER BY created_at DESC 
LIMIT 5;
```

**Resultado esperado:**
- ✅ `property_id` con valores UUID válidos
- ✅ `property_name` con nombres de propiedades
- ✅ `content` con el contenido del documento

## 🚨 Troubleshooting

### Problema: property_id sigue siendo null

**Causa:** El campo no está configurado en metadatos.
**Solución:** Verificar que `property_id: {{ $json.property_id }}` esté en la sección Metadata.

### Problema: Error "field does not exist"

**Causa:** El campo se está mapeando incorrectamente.
**Solución:** Usar exactamente `property_id` y `property_name` (snake_case).

### Problema: No llegan datos al webhook

**Causa:** URL incorrecta.
**Solución:** 
- Frontend: `https://hosthelperai.app.n8n.cloud/webhook/file`
- n8n webhook path: `"file"`

## 🧪 Script de Verificación

Para verificar que los datos llegan correctamente, ejecuta en la consola del navegador:

```javascript
// Verificar que se envían los datos correctos
console.log('Verificando envío al webhook...');
// El webhook debe mostrar en logs:
// - property_id: [UUID válido]
// - property_name: [nombre válido]
```

## ✅ Resultado Final

Con esta configuración:
- Los documentos se insertarán con `property_id` y `property_name` correctos
- El trigger `sync_document_property_name_trigger` funcionará correctamente
- La búsqueda por propiedad será posible
- Los índices funcionarán eficientemente

---

**🎯 ACCIÓN REQUERIDA:** Configurar los metadatos en el nodo VectorStoreSupabase en n8n AHORA. 