# Sistema de Sincronización Automática iCal - CONFIGURADO

**Fecha de configuración**: 16 de octubre, 2025  
**Estado**: ✅ ACTIVO Y FUNCIONANDO

---

## 🎉 **Sincronización Automática Activa**

El sistema de sincronización iCal ahora funciona **completamente automático** y **nunca más se quedará desactualizado**.

### ⏰ **Frecuencia de Sincronización**

```
📅 Cada HORA (en punto)
   - 00:00, 01:00, 02:00, ..., 23:00
   - 24 veces al día
   - 168 veces a la semana
```

### ✅ **Ventajas**

- 🔄 **Automático**: No requiere intervención manual
- ⏰ **Frecuente**: Actualiza cada hora
- 🛡️ **Confiable**: Si falla una ejecución, la siguiente lo arreglará
- 📊 **Trazable**: Guarda logs de cada sincronización

---

## 📊 **Estado Actual del Sistema**

### **Configuración iCal**
```sql
SELECT * FROM ical_configs;

-- Resultado:
ical_name:    Booking.com - Casa María Flora
sync_status:  active ✅
last_sync_at: 2025-10-16 13:31:38 (hace pocos minutos)
is_active:    true
```

### **Reservas Sincronizadas**
```sql
-- Resumen
Total reservas:      6
Actuales/futuras:    1 (6-13 nov 2025)
Pasadas:             5
```

### **CRON Job Activo**
```
Job ID:     1
Schedule:   0 * * * * (cada hora en punto)
Command:    SELECT auto_sync_ical_bookings();
Status:     ACTIVE ✅
```

---

## 🔧 **Componentes del Sistema**

### 1. **Extensión pg_cron**
```sql
CREATE EXTENSION pg_cron;
```
- Permite programar tareas automáticas en PostgreSQL
- Se ejecuta directamente en la base de datos
- No requiere servicios externos

### 2. **Función de Sincronización**
```sql
CREATE FUNCTION auto_sync_ical_bookings()
```

**Qué hace:**
1. Descarga el iCal de Booking.com usando `http_get()`
2. Parsea todos los eventos (BEGIN:VEVENT...END:VEVENT)
3. Extrae UID, SUMMARY, DTSTART, DTEND de cada evento
4. Inserta o actualiza cada reserva en `synced_bookings`
5. Actualiza el estado de `ical_configs`

**Características:**
- ✅ Maneja múltiples eventos en un solo iCal
- ✅ Evita duplicados usando `ON CONFLICT (booking_uid)`
- ✅ Actualiza reservas existentes si cambian fechas
- ✅ Registra errores sin detener el proceso
- ✅ Usa transacciones para integridad de datos

### 3. **CRON Job**
```sql
SELECT cron.schedule(
  'sync-ical-hourly',
  '0 * * * *',
  'SELECT auto_sync_ical_bookings();'
);
```

---

## 📝 **Monitoreo y Mantenimiento**

### **Ver Estado del CRON Job**
```sql
-- Ver configuración del job
SELECT * FROM cron.job;

-- Ver historial de ejecuciones
SELECT 
  jobid,
  status,
  return_message,
  start_time,
  end_time,
  end_time - start_time as duration
FROM cron.job_run_details
ORDER BY start_time DESC
LIMIT 10;
```

### **Ver Última Sincronización**
```sql
SELECT 
  ical_name,
  sync_status,
  last_sync_at,
  EXTRACT(EPOCH FROM (now() - last_sync_at))/60 as minutes_since_last_sync,
  error_message
FROM ical_configs;
```

### **Probar Sincronización Manual**
```sql
-- Ejecutar manualmente (sin esperar a la hora en punto)
SELECT auto_sync_ical_bookings();
```

---

## 🛠️ **Gestión del Sistema**

### **Pausar Sincronización Automática**
```sql
-- Desactivar el CRON job temporalmente
UPDATE cron.job 
SET active = false 
WHERE jobid = 1;
```

### **Reactivar Sincronización**
```sql
UPDATE cron.job 
SET active = true 
WHERE jobid = 1;
```

### **Cambiar Frecuencia**

```sql
-- Cambiar a cada 30 minutos
UPDATE cron.job 
SET schedule = '*/30 * * * *' 
WHERE jobid = 1;

-- Cambiar a cada 2 horas
UPDATE cron.job 
SET schedule = '0 */2 * * *' 
WHERE jobid = 1;

-- Cambiar a solo una vez al día (a las 02:00)
UPDATE cron.job 
SET schedule = '0 2 * * *' 
WHERE jobid = 1;
```

### **Eliminar CRON Job**
```sql
-- Solo si necesitas eliminarlo completamente
SELECT cron.unschedule(1);
```

---

## 🔍 **Troubleshooting**

### **Problema: El CRON no se ejecuta**

**Verificar:**
```sql
-- 1. Ver si el job está activo
SELECT * FROM cron.job WHERE jobid = 1;

-- 2. Ver logs de ejecución
SELECT * FROM cron.job_run_details 
WHERE jobid = 1 
ORDER BY start_time DESC 
LIMIT 5;

-- 3. Ver si pg_cron está instalado
SELECT * FROM pg_extension WHERE extname = 'pg_cron';
```

**Solución:**
```sql
-- Reactivar si está desactivado
UPDATE cron.job SET active = true WHERE jobid = 1;
```

### **Problema: Errores en sincronización**

**Verificar:**
```sql
SELECT 
  sync_status,
  error_message,
  last_sync_at
FROM ical_configs;
```

**Solución:**
```sql
-- Resetear estado y forzar nueva sincronización
UPDATE ical_configs 
SET sync_status = 'pending',
    error_message = NULL;

-- Ejecutar manualmente para ver el error
SELECT auto_sync_ical_bookings();
```

### **Problema: Reserva no aparece en UI**

**Verificar:**
```sql
-- 1. Verificar que está en la BD
SELECT * FROM synced_bookings 
WHERE check_out_date >= CURRENT_DATE
ORDER BY check_in_date;

-- 2. Verificar RLS policies
-- Las políticas deben permitir SELECT para usuarios autenticados
```

---

## 📈 **Estadísticas y Métricas**

### **Crear Vista de Estadísticas**
```sql
CREATE OR REPLACE VIEW ical_sync_stats AS
SELECT 
  ic.ical_name,
  ic.sync_status,
  ic.last_sync_at,
  EXTRACT(EPOCH FROM (now() - ic.last_sync_at))/3600 as hours_since_sync,
  COUNT(sb.id) as total_bookings,
  COUNT(sb.id) FILTER (WHERE sb.check_out_date >= CURRENT_DATE) as active_bookings,
  COUNT(sb.id) FILTER (WHERE sb.check_out_date < CURRENT_DATE) as past_bookings
FROM ical_configs ic
LEFT JOIN synced_bookings sb ON sb.ical_config_id = ic.id
GROUP BY ic.id, ic.ical_name, ic.sync_status, ic.last_sync_at;

-- Usar la vista
SELECT * FROM ical_sync_stats;
```

---

## 🚀 **Próximas Mejoras Sugeridas**

### **1. Notificaciones por Email**
Enviar email cuando:
- Hay un error en la sincronización
- Se detecta una nueva reserva
- El sistema lleva más de 2 horas sin sincronizar

### **2. Dashboard de Monitoreo**
Crear página en el frontend que muestre:
- Estado actual de sincronización
- Última ejecución
- Gráfico de reservas por mes
- Alertas y errores

### **3. Múltiples Propiedades**
Ampliar el sistema para:
- Sincronizar múltiples propiedades simultáneamente
- Diferentes iCals por propiedad (Booking, Airbnb, etc.)
- Detección de conflictos entre plataformas

### **4. Sincronización Bidireccional**
- Bloquear fechas en Booking.com desde la app
- Actualizar reservas cuando cambian en Booking.com

---

## 📞 **Comandos Rápidos**

```sql
-- Ver estado actual
SELECT * FROM ical_sync_stats;

-- Sincronizar manualmente AHORA
SELECT auto_sync_ical_bookings();

-- Ver reservas actuales
SELECT * FROM synced_bookings 
WHERE check_out_date >= CURRENT_DATE;

-- Ver historial de CRON
SELECT * FROM cron.job_run_details 
WHERE jobid = 1 
ORDER BY start_time DESC 
LIMIT 5;
```

---

## ✅ **Checklist de Verificación**

- [x] pg_cron instalado
- [x] Función `auto_sync_ical_bookings()` creada
- [x] CRON job programado (cada hora)
- [x] Primera sincronización ejecutada exitosamente
- [x] Reserva de noviembre visible en UI
- [x] Documentación completa
- [ ] Configurar alertas por email
- [ ] Crear dashboard de monitoreo
- [ ] Agregar más propiedades

---

**Configurado por**: Supabase MCP  
**Fecha**: 16 de octubre, 2025  
**Próxima sincronización automática**: Cada hora en punto (00:00, 01:00, 02:00, ...)

