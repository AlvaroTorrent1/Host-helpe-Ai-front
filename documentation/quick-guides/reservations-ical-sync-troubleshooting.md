# Troubleshooting: iCal Sync - Reservas Faltantes

**Fecha**: 16 de octubre, 2025  
**Problema**: Reservas futuras del iCal no se están mostrando en la aplicación

---

## 🔍 **Diagnóstico Realizado**

### **Síntomas**
- ✅ Reservas **pasadas** se muestran correctamente en la pestaña "PASADAS"  
- ❌ Reservas **futuras** NO se muestran en la pestaña "ACTUALES"
- ✅ El iCal de Booking.com **SÍ contiene** una reserva futura (6-13 noviembre 2025)

### **Causa Raíz**
La sincronización iCal **no se ha ejecutado** desde **agosto 29, 2025**. Por eso:
- Las reservas antiguas (agosto-octubre) están en la BD y se muestran como "pasadas"
- La nueva reserva (noviembre) está en el iCal pero **NO está en la BD**

---

## 📊 **Estado Actual del Sistema**

### **Base de Datos** 
```sql
-- Reservas sincronizadas en la BD
SELECT check_in_date, check_out_date, booking_status
FROM synced_bookings
ORDER BY check_in_date DESC;

/*
Resultados:
- 8-13 oct 2025  → PASADA
- 27-29 sep 2025 → PASADA
- 24-25 sep 2025 → PASADA
- 10-17 sep 2025 → PASADA
- 27 ago - 5 sep 2025 → PASADA

NO HAY RESERVAS FUTURAS (>= 16 oct 2025)
*/
```

### **iCal de Booking.com**
```
Evento encontrado:
- 6-13 noviembre 2025 → FUTURA ✅
- Summary: "CLOSED - Not available"
- UID: 3fc1357333f5e058b3416924cc625a68@booking.com
```

### **Configuración iCal**
```sql
SELECT ical_name, sync_status, last_sync_at, is_active
FROM ical_configs;

/*
Resultados:
- Nombre: "Booking.com - Casa María Flora"
- Status: active
- Última sync: 2025-10-16 13:21:55  ← Actualizado hoy
- Activo: true
*/
```

---

## ⚠️ **Problema Identificado**

### **Edge Function: `sync-ical-bookings`**

El Edge Function **requiere autenticación JWT** (`verify_jwt: true`), lo que causa:

1. **401 Unauthorized** cuando se llama manualmente con `anon_key`
2. La función `trigger_ical_sync()` en PostgreSQL solo actualiza el estado, **no llama al Edge Function**
3. No hay un CRON job configurado para ejecutar la sincronización automáticamente

---

## ✅ **Soluciones**

### **Opción 1: Desactivar JWT Verification (RECOMENDADO)**

Actualizar el Edge Function para permitir llamadas sin autenticación:

```bash
# 1. Crear archivo de configuración
# supabase/functions/ical-sync/.supabase_config.json
{
  "verify_jwt": false
}

# 2. Redesplegar la función
supabase functions deploy ical-sync --no-verify-jwt
```

### **Opción 2: Configurar CRON Job**

Configurar un job automático que ejecute la sincronización cada 30 minutos:

```sql
-- Crear extensión pg_cron si no existe
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Configurar job de sincronización
SELECT cron.schedule(
  'sync-ical-bookings',  -- nombre del job
  '*/30 * * * *',        -- cada 30 minutos
  $$
  SELECT net.http_post(
    url := 'https://blxngmtmknkdmikaflen.supabase.co/functions/v1/sync-ical-bookings',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb,
    body := '{}'::jsonb
  );
  $$
);
```

### **Opción 3: Sincronización Manual (TEMPORAL)**

Mientras se configura la solución permanente, sincronizar manualmente:

```bash
# Ejecutar script de sincronización
node scripts/trigger-manual-ical-sync.cjs
```

O ejecutar directamente via HTTP:

```bash
curl -X POST https://blxngmtmknkdmikaflen.supabase.co/functions/v1/sync-ical-bookings \\
  -H "Authorization: Bearer SERVICE_ROLE_KEY" \\
  -H "apikey: ANON_KEY"
```

---

## 🛠️ **Scripts de Diagnóstico Creados**

### **1. `verify-ical-content.cjs`**
Verifica el contenido actual del iCal desde Booking.com

```bash
node scripts/verify-ical-content.cjs
```

Resultado:
- ✅ Muestra todas las reservas en el iCal
- ✅ Identifica si son pasadas o futuras
- ✅ Muestra UIDs para tracking

### **2. `test-reservations-workflow.cjs`**
Diagnóstico completo del flujo de reservas

```bash
node scripts/test-reservations-workflow.cjs
```

Verifica:
- Tabla `properties`
- Tabla `user_properties`
- Tabla `ical_configs`
- Tabla `synced_bookings`
- Query con JOIN (simulando frontend)

### **3. `debug-reservations-missing.html`**
Herramienta visual HTML para diagnóstico

```bash
# Abrir en navegador
open scripts/debug-reservations-missing.html
```

Incluye:
- Interfaz visual
- Tests interactivos
- Análisis de RLS policies
- Verificación de fechas

### **4. `trigger-manual-ical-sync.cjs`**
Trigger manual de sincronización

```bash
node scripts/trigger-manual-ical-sync.cjs
```

---

## 📝 **Próximos Pasos**

### **Inmediatos** (para resolver ahora)

1. ✅ Configurar `verify_jwt: false` en Edge Function
2. ✅ Redesplegar Edge Function
3. ✅ Ejecutar sincronización manual
4. ✅ Verificar que la reserva de noviembre aparezca

### **A Mediano Plazo** (para prevenir futuras issues)

1. ⏰ Configurar CRON job para sincronización automática cada 30 min
2. 📧 Agregar notificaciones por email cuando falle una sincronización
3. 📊 Dashboard para monitorear estado de sincronizaciones
4. 🧪 Tests automáticos para verificar flujo completo

---

## 🔗 **Enlaces Útiles**

- [Documentación iCal System](../integrations/ical-system-activated.md)
- [Edge Function: ical-sync](../../supabase/functions/ical-sync/index.ts)
- [Migration: activar_sistema_ical](../../supabase/migrations/20251016_007_activar_sistema_ical.sql)

---

## 📞 **Comando para Sincronización Manual**

Mientras se arregla el Edge Function, puedes ejecutar:

```sql
-- En Supabase SQL Editor
SELECT trigger_ical_sync();

-- Respuesta esperada:
-- {
--   "success": true,
--   "synced_count": 1,
--   "timestamp": "2025-10-16T..."
-- }
```

**NOTA**: Este comando solo actualiza el estado en la BD, **no sincroniza datos del iCal**. Para sincronizar datos reales, necesitas llamar al Edge Function.

---

## ✅ **Verificación Post-Fix**

Después de aplicar la solución:

```sql
-- 1. Verificar que la nueva reserva se haya agregado
SELECT * FROM synced_bookings
WHERE check_out_date >= CURRENT_DATE
ORDER BY check_in_date;

-- Deberías ver:
-- - 6-13 noviembre 2025

-- 2. Verificar en la UI
-- Ve a: /reservations
-- Pestaña: ACTUALES
-- Deberías ver la reserva de noviembre
```

---

**Actualizado**: 16 de octubre, 2025  
**Por**: AI Assistant

