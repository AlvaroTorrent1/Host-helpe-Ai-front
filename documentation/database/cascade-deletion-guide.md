# Guía de Eliminación en Cascada - Sistema de Reservas

## 📋 Resumen

Esta guía documenta la configuración de eliminación en cascada para el sistema de reservas y partes de viajeros.

## ❌ Problema Identificado (29 de Octubre 2025)

**Antes de la corrección:**
- Al eliminar una reserva, los registros de `traveler_form_requests` NO se eliminaban
- Los registros de `traveler_form_data` tampoco se eliminaban
- Esto dejaba datos "huérfanos" en la base de datos

**Causa:**
La foreign key `traveler_form_requests.reservation_id` estaba configurada con `ON DELETE SET NULL` en lugar de `ON DELETE CASCADE`.

## ✅ Solución Implementada

**Migración aplicada:** `20251029_fix_reservation_cascade_delete.sql`

**Cambio realizado:**
```sql
-- ANTES: SET NULL
ALTER TABLE traveler_form_requests
ADD CONSTRAINT traveler_form_requests_reservation_id_fkey
FOREIGN KEY (reservation_id) REFERENCES reservations(id)
ON DELETE SET NULL;

-- DESPUÉS: CASCADE
ALTER TABLE traveler_form_requests
ADD CONSTRAINT traveler_form_requests_reservation_id_fkey
FOREIGN KEY (reservation_id) REFERENCES reservations(id)
ON DELETE CASCADE;
```

## 🔄 Flujo de Eliminación en Cascada Actual

### Eliminar una Reserva

```
DELETE FROM reservations WHERE id = X;
    ↓
    ├─ traveler_form_requests (CASCADE) ← Se eliminan automáticamente
    │   ↓
    │   └─ traveler_form_data (CASCADE) ← Se eliminan automáticamente
    │
    └─ [La reserva se elimina]
```

### Eliminar una Propiedad

```
DELETE FROM properties WHERE id = X;
    ↓
    ├─ reservations (CASCADE) ← Se eliminan automáticamente
    │   ↓
    │   └─ traveler_form_requests (CASCADE)
    │       ↓
    │       └─ traveler_form_data (CASCADE)
    │
    ├─ traveler_form_requests (CASCADE) ← Se eliminan directamente
    │   ↓
    │   └─ traveler_form_data (CASCADE)
    │
    ├─ media_files (CASCADE)
    ├─ documents (CASCADE)
    ├─ shareable_links (CASCADE)
    └─ incidents (CASCADE)
```

## 📊 Configuración Completa de Foreign Keys

### Tabla: `reservations`

| Columna | Referencia | DELETE Rule |
|---------|-----------|-------------|
| `property_id` | `properties.id` | **CASCADE** |

### Tabla: `traveler_form_requests`

| Columna | Referencia | DELETE Rule |
|---------|-----------|-------------|
| `user_id` | `auth.users.id` | *(default)* |
| `property_id` | `properties.id` | **CASCADE** |
| `reservation_id` | `reservations.id` | **CASCADE** ✅ |

### Tabla: `traveler_form_data`

| Columna | Referencia | DELETE Rule |
|---------|-----------|-------------|
| `form_request_id` | `traveler_form_requests.id` | **CASCADE** |

## 🧪 Prueba de Verificación

**Test realizado el 29 de Octubre 2025:**

```sql
-- 1. Crear reserva de prueba
INSERT INTO reservations (...) VALUES (...) RETURNING id; -- ID: 57

-- 2. Crear traveler_form_request asociado
INSERT INTO traveler_form_requests (reservation_id = 57, ...) 
RETURNING id; -- ID: 2a00f81b-e3be-4f98-a4e7-294173efdc4f

-- 3. Crear traveler_form_data asociado
INSERT INTO traveler_form_data (form_request_id = '2a00f...', ...) 
RETURNING id; -- ID: 31226bfc-0cfc-4467-935b-9fa4907c89b6

-- 4. Verificar existencia (3 registros)
SELECT ... FROM reservations WHERE id = 57;                    -- ✅ 1 registro
SELECT ... FROM traveler_form_requests WHERE reservation_id = 57; -- ✅ 1 registro
SELECT ... FROM traveler_form_data WHERE form_request_id = '2a00f...'; -- ✅ 1 registro

-- 5. Eliminar reserva
DELETE FROM reservations WHERE id = 57;

-- 6. Verificar eliminación cascada
SELECT ... FROM reservations WHERE id = 57;                    -- ✅ 0 registros
SELECT ... FROM traveler_form_requests WHERE id = '2a00f...';  -- ✅ 0 registros (CASCADE)
SELECT ... FROM traveler_form_data WHERE id = '31226b...';    -- ✅ 0 registros (CASCADE)
```

**Resultado:** ✅ **ÉXITO** - Todos los registros se eliminaron en cascada correctamente.

## 🎯 Recomendaciones

### Para Desarrolladores

1. **NO** necesitas lógica adicional en el código para eliminar registros relacionados
2. El simple `DELETE FROM reservations WHERE id = X` es suficiente
3. PostgreSQL maneja automáticamente la eliminación en cascada

### Para Testing

```typescript
// src/services/reservationService.ts
async deleteReservation(id: string): Promise<void> {
  const numericId = parseInt(id);
  
  // Este simple DELETE eliminará automáticamente:
  // - La reserva
  // - Todos los traveler_form_requests asociados
  // - Todos los traveler_form_data de esos requests
  const { error } = await supabase
    .from('reservations')
    .delete()
    .eq('id', numericId);

  if (error) throw error;
}
```

### Auditoría y Logging

Si necesitas mantener un historial de reservas eliminadas, considera:

1. **Soft Delete** (eliminación lógica):
   - Agregar columna `deleted_at` timestamp
   - Filtrar registros con `deleted_at IS NULL`
   - No eliminar físicamente los datos

2. **Tabla de Auditoría**:
   - Crear tabla `reservations_audit_log`
   - Usar un TRIGGER que copie datos antes de eliminar
   - Mantener histórico completo

## 📝 Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 29 Oct 2025 | Corregida eliminación en cascada de reservations → traveler_form_requests | Claude AI |
| 29 Oct 2025 | Documentación completa del sistema de cascada | Claude AI |

## 🔗 Referencias

- **Migración:** `supabase/migrations/20251029_fix_reservation_cascade_delete.sql`
- **Servicio:** `src/services/reservationService.ts`
- **Componente:** `src/features/reservations/ReservationList.tsx`

## ⚠️ Notas Importantes

1. Esta configuración es **permanente** - no necesita mantenimiento
2. Los datos se eliminan **físicamente** - no se pueden recuperar
3. Si necesitas conservar histórico, implementa **soft delete** antes de eliminar
4. Las políticas RLS se mantienen activas - los usuarios solo pueden eliminar sus propias reservas














