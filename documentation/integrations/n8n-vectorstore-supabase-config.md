# Configuración del Nodo VectorStoreSupabase en n8n

**PROBLEMA SOLUCIONADO:** Error "null value in column property_id of relation documents violates not-null constraint"

## 🎯 Causa del Problema

El nodo **VectorStoreSupabase** no está configurado correctamente para incluir el `property_id` en los metadatos del documento. Aunque el webhook recibe correctamente el `property_id`, si no se configura en la sección de **Metadata** del nodo, se inserta como `null`.

## ✅ Solución: Configuración Correcta del Nodo

### 1. **Configuración Básica del Nodo VectorStoreSupabase**

```json
{
  "name": "Supabase Vector Store",
  "type": "@n8n/n8n-nodes-langchain.vectorStoreSupabase",
  "parameters": {
    "operation": "insert",
    "supabaseCredentials": {
      "host": "{{ $vars.SUPABASE_URL }}",
      "key": "{{ $vars.SUPABASE_ANON_KEY }}"
    },
    "tableName": "documents",
    "queryName": "match_documents"
  }
}
```

### 2. **CRÍTICO: Configuración de Metadatos**

En la sección **"Metadata"** del nodo VectorStoreSupabase, debes configurar:

| Campo | Valor | Descripción |
|-------|--------|-------------|
| **property_id** | `{{ $json.property_id }}` | ID de la propiedad (OBLIGATORIO) |
| **property_name** | `{{ $json.property_name }}` | Nombre de la propiedad |
| **document_type** | `{{ $json.document_type }}` | Tipo de documento |
| **document_name** | `{{ $json.document_name }}` | Nombre del documento |

### 3. **Configuración JSON Completa**

```json
{
  "name": "Store Document Vector",
  "type": "@n8n/n8n-nodes-langchain.vectorStoreSupabase",
  "parameters": {
    "operation": "insert",
    "supabaseCredentials": {
      "host": "https://kgrzaavlubmfagwxxnjl.supabase.co",
      "key": "{{ $vars.SUPABASE_ANON_KEY }}"
    },
    "tableName": "documents",
    "queryName": "match_documents",
    "metadata": {
      "property_id": "{{ $json.property_id }}",
      "property_name": "{{ $json.property_name }}",
      "document_type": "{{ $json.document_type }}",
      "document_name": "{{ $json.document_name }}",
      "user_id": "{{ $json.user_id }}",
      "timestamp": "{{ $json.timestamp }}"
    }
  }
}
```

## 🔧 Pasos para Corregir el Workflow

### Paso 1: Abrir el Workflow en n8n
1. Ve a https://hosthelperai.app.n8n.cloud
2. Abre el workflow que contiene el nodo VectorStoreSupabase

### Paso 2: Configurar el Nodo VectorStoreSupabase
1. Selecciona el nodo **VectorStoreSupabase**
2. Ve a la sección **"Metadata"** (o **"Additional Metadata"**)
3. Añade los siguientes campos:

```
Campo: property_id
Valor: {{ $json.property_id }}

Campo: property_name  
Valor: {{ $json.property_name }}

Campo: document_type
Valor: {{ $json.document_type }}

Campo: document_name
Valor: {{ $json.document_name }}
```

### Paso 3: Verificar el Flujo de Datos
1. Asegúrate de que el nodo anterior (webhook o código) pase los datos correctamente
2. Usa el botón **"Test step"** para verificar que `$json.property_id` no esté vacío

### Paso 4: Guardar y Probar
1. Guarda el workflow
2. Prueba enviando un documento desde la aplicación
3. Verifica que se inserte correctamente en la tabla `documents`

## 🧪 Verificación en Base de Datos

Después de la corrección, ejecuta esta consulta para verificar:

```sql
SELECT 
  id,
  property_id,
  property_name,
  content,
  created_at
FROM documents 
ORDER BY created_at DESC 
LIMIT 5;
```

Deberías ver:
- ✅ `property_id` con valores UUID válidos (no null)
- ✅ `property_name` con nombres de propiedades
- ✅ `content` con el contenido del documento

## 🚨 Errores Comunes

### Error 1: Metadatos no configurados
```
❌ Error: null value in column "property_id"
✅ Solución: Configurar metadata con property_id
```

### Error 2: Valor incorrecto en metadata
```
❌ Error: $json.property_id es undefined
✅ Solución: Verificar que el nodo anterior pase property_id
```

### Error 3: Formato incorrecto
```
❌ Error: property_id debe ser UUID
✅ Solución: Verificar que property_id sea un UUID válido
```

## 📋 Checklist de Verificación

- [ ] Nodo VectorStoreSupabase tiene configurada la sección **Metadata**
- [ ] Campo `property_id` configurado como `{{ $json.property_id }}`
- [ ] El webhook recibe `property_id` correctamente (verificar logs)
- [ ] El nodo anterior pasa `property_id` al VectorStoreSupabase
- [ ] La tabla `documents` tiene la columna `property_id` como NOT NULL
- [ ] Los datos se insertan sin errores

## 💡 Notas Adicionales

1. **El `property_id` es obligatorio** - la tabla `documents` lo requiere
2. **Usar snake_case** - los campos deben usar `property_id` no `propertyId`
3. **Verificar el flujo completo** - desde webhook hasta inserción en BD
4. **Los metadatos son clave** - sin ellos, los campos se insertan como null

---

**✅ Con esta configuración, el error de property_id null debería resolverse completamente.** 