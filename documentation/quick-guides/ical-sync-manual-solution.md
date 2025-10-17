# Solución Manual para Sincronización iCal

**Fecha**: 16 de octubre, 2025  
**Estado**: ✅ RESUELTO usando Supabase MCP

---

## 🎯 **Problema Resuelto**

Las reservas futuras del iCal de Booking.com no se estaban mostrando en la aplicación porque:

1. El Edge Function requiere autenticación JWT
2. No hay CRON job configurado para sincronización automática
3. La última sincronización fue en agosto 2025

## ✅ **Solución Implementada**

Usamos **Supabase MCP** para insertar manualmente las reservas directamente en la base de datos mediante SQL.

### **Resultado**
- ✅ Reserva de noviembre 2025 agregada correctamente
- ✅ Total: 1 reserva futura, 5 reservas pasadas
- ✅ La reserva aparece en la pestaña "ACTUALES" de la UI

---

## 🔧 **Cómo Sincronizar Manualmente**

### **Paso 1: Verificar contenido del iCal**

```bash
node scripts/verify-ical-content.cjs
```

Este script te mostrará todas las reservas en el iCal de Booking.com.

### **Paso 2: Ejecutar consulta SQL en Supabase**

```sql
-- Insertar nueva reserva
INSERT INTO synced_bookings (
  id,
  property_id,
  user_id,
  ical_config_id,
  booking_uid,
  booking_source,
  check_in_date,
  check_out_date,
  booking_status,
  guest_name,
  raw_ical_event,
  created_at,
  updated_at
)
SELECT
  gen_random_uuid(),
  ic.property_id,
  ic.user_id,
  ic.id,
  'UID_DEL_EVENTO',           -- Reemplazar con UID del iCal
  'booking.com',
  'YYYY-MM-DD'::date,         -- Fecha de check-in
  'YYYY-MM-DD'::date,         -- Fecha de check-out
  'blocked',
  NULL,
  jsonb_build_object(
    'uid', 'UID_DEL_EVENTO',
    'summary', 'CLOSED - Not available',
    'start', 'YYYY-MM-DD',
    'end', 'YYYY-MM-DD',
    'processed_at', now()
  ),
  now(),
  now()
FROM ical_configs ic
WHERE ic.ical_name = 'Booking.com - Casa María Flora'
AND NOT EXISTS (
  SELECT 1 FROM synced_bookings sb
  WHERE sb.booking_uid = 'UID_DEL_EVENTO'
);
```

### **Paso 3: Actualizar estado de sincronización**

```sql
UPDATE ical_configs
SET last_sync_at = now(),
    sync_status = 'active',
    error_message = NULL
WHERE ical_name = 'Booking.com - Casa María Flora';
```

### **Paso 4: Verificar en la UI**

1. Ve a la página de Reservas: `/reservations`
2. Selecciona la pestaña **"ACTUALES"**
3. Deberías ver la nueva reserva

---

## 🤖 **Script Automatizado**

Usa el script SQL para sincronizar:

```bash
# Desde Supabase SQL Editor, ejecutar:
scripts/sync-ical-manual-mcp.sql
```

---

## 📊 **Verificar Estado Actual**

```sql
-- Ver resumen de reservas
SELECT 
  'TOTAL RESERVAS' as categoria,
  COUNT(*) as cantidad
FROM synced_bookings

UNION ALL

SELECT 
  'ACTUALES/FUTURAS' as categoria,
  COUNT(*) as cantidad
FROM synced_bookings
WHERE check_out_date >= CURRENT_DATE

UNION ALL

SELECT 
  'PASADAS' as categoria,
  COUNT(*) as cantidad
FROM synced_bookings
WHERE check_out_date < CURRENT_DATE;
```

Resultado esperado:
```
TOTAL RESERVAS:      6
ACTUALES/FUTURAS:    1
PASADAS:             5
```

---

## 🔮 **Soluciones Permanentes (Futuro)**

Para automatizar completamente la sincronización, considera:

### **Opción 1: Redesplegar Edge Function sin JWT**
```bash
# Usando Supabase CLI
supabase functions deploy sync-ical-bookings --no-verify-jwt
```

### **Opción 2: Configurar CRON Job**
```sql
-- Crear job de sincronización cada 30 minutos
SELECT cron.schedule(
  'sync-ical-bookings',
  '*/30 * * * *',
  $$ 
  -- Llamar a Edge Function o ejecutar sync directamente
  $$
);
```

### **Opción 3: Workflow de N8N**
Crear un workflow en N8N que:
1. Se ejecute cada 30 minutos
2. Descargue el iCal de Booking.com
3. Parsee los eventos
4. Inserte/actualice en `synced_bookings`

---

## 📝 **Notas Importantes**

### **Limitaciones Actuales**
- ⚠️ La sincronización es **manual**
- ⚠️ Debes ejecutar el script cada vez que haya nuevas reservas
- ⚠️ El Edge Function requiere JWT (no se puede llamar sin autenticación)

### **Datos de la Reserva Actual**
```
UID: 3fc1357333f5e058b3416924cc625a68@booking.com
Summary: CLOSED - Not available
Check-in: 2025-11-06
Check-out: 2025-11-13
Status: blocked
```

---

## 🔗 **Enlaces Relacionados**

- [Script de verificación iCal](../../scripts/verify-ical-content.cjs)
- [Script de sincronización SQL](../../scripts/sync-ical-manual-mcp.sql)
- [Troubleshooting completo](./reservations-ical-sync-troubleshooting.md)
- [Sistema iCal Activado](../integrations/ical-system-activated.md)

---

**Última actualización**: 16 de octubre, 2025  
**Solución implementada por**: Supabase MCP + SQL directo

