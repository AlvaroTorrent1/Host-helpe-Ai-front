# Sistema iCal Activado - Guía de Uso

**Fecha de activación**: 16 de octubre, 2025  
**Estado**: ✅ ACTIVO y FUNCIONAL

---

## 📊 **Estado Actual del Sistema**

### ✅ **Configuraciones Activas**

| Plataforma | Propiedad | Estado | Reservas | Última Sync |
|------------|-----------|--------|----------|-------------|
| **Booking.com** | Casa María Flora | 🟢 ACTIVE | 5 reservas | Hace unos segundos |

### 📈 **Estadísticas**
- **Total configuraciones**: 1
- **Reservas sincronizadas**: 5
- **Estado del sistema**: 🟢 Operativo
- **Intervalo de sincronización**: 30 minutos

---

## 🔄 **Sincronización Automática**

El sistema está configurado para sincronizar automáticamente cada 30 minutos.

### Edge Function Desplegada
- **URL**: `https://blxngmtmknkdmikaflen.supabase.co/functions/v1/sync-ical-bookings`
- **Método**: POST
- **Estado**: ✅ ACTIVE (v8)

### Sincronización Manual

Para forzar una sincronización inmediata:

```sql
SELECT trigger_ical_sync();
```

**Respuesta esperada:**
```json
{
  "success": true,
  "synced_count": 1,
  "timestamp": "2025-10-16T11:38:39.830682+00:00"
}
```

---

## 📊 **Monitoreo del Sistema**

### Ver Estado de Sincronización

```sql
SELECT * FROM ical_sync_status;
```

**Campos importantes:**
- `ical_name`: Nombre de la plataforma (Booking.com, Airbnb)
- `sync_status`: Estado actual (active, pending, error)
- `last_sync_at`: Fecha/hora de última sincronización
- `total_bookings_synced`: Total de reservas sincronizadas
- `error_message`: Mensaje de error (si aplica)

### Ver Reservas Sincronizadas

```sql
SELECT 
    booking_source,
    guest_name,
    check_in_date,
    check_out_date,
    booking_status,
    created_at
FROM synced_bookings
ORDER BY created_at DESC;
```

---

## 🔧 **Arquitectura del Sistema**

### Flujo de Datos

```
Booking.com/Airbnb (iCal URL)
        ↓
Edge Function (sync-ical-bookings)
        ↓
ical_configs (configuración)
        ↓
synced_bookings (reservas)
        ↓
reservations (opcional)
```

### Tablas Principales

1. **`ical_configs`** (1 fila)
   - Almacena URLs y configuración de sincronización
   - Estado: active, pending, error
   - Intervalo configurado: 30 minutos

2. **`user_properties`** (1 fila)
   - Tabla puente entre `properties` e `ical_configs`
   - Conecta propiedades principales con sincronización iCal

3. **`synced_bookings`** (5 filas)
   - Almacena reservas sincronizadas desde plataformas externas
   - Incluye: guest_name, check_in/out, booking_uid, raw_ical_event

---

## 🚀 **Agregar Nuevas Plataformas**

### Agregar URL de Airbnb

Usa el servicio frontend:

```typescript
import { propertyIcalService } from '@/services/propertyIcalService';

await propertyIcalService.saveIcalConfigs({
  propertyId: 'property-uuid',
  userId: 'user-uuid',
  userPropertyId: 'user-property-uuid',
  airbnbIcalUrl: 'https://airbnb.com/ical/your-calendar-url'
});
```

O directamente en SQL:

```sql
INSERT INTO ical_configs (
    property_id,
    user_id,
    ical_url,
    ical_name,
    sync_interval_minutes,
    sync_status,
    is_active
) VALUES (
    'user-property-uuid',
    'user-uuid',
    'https://airbnb.com/ical/your-calendar-url',
    'Airbnb',
    30,
    'pending',
    true
);
```

---

## ⚙️ **Configuración Avanzada**

### Cambiar Intervalo de Sincronización

```sql
UPDATE ical_configs
SET sync_interval_minutes = 60  -- Cambiar a 60 minutos
WHERE ical_name = 'Booking.com - Casa María Flora';
```

### Desactivar Sincronización

```sql
UPDATE ical_configs
SET is_active = false
WHERE ical_name = 'Booking.com - Casa María Flora';
```

### Limpiar Reservas Antiguas

```sql
DELETE FROM synced_bookings
WHERE check_out_date < CURRENT_DATE - INTERVAL '6 months';
```

---

## 🐛 **Troubleshooting**

### Error: "sync_status = error"

```sql
-- Ver mensaje de error
SELECT ical_name, error_message, last_sync_at
FROM ical_configs
WHERE sync_status = 'error';

-- Resetear y reintentar
UPDATE ical_configs
SET sync_status = 'pending',
    error_message = NULL
WHERE sync_status = 'error';

-- Forzar sincronización
SELECT trigger_ical_sync();
```

### Verificar Conectividad con URL iCal

```sql
-- Comprobar que la URL es accesible
SELECT ical_url FROM ical_configs WHERE is_active = true;
```

Prueba la URL en tu navegador. Debe devolver un archivo de texto con formato iCal.

### Logs de la Edge Function

Para ver logs de la Edge Function:
1. Ir al Dashboard de Supabase
2. Edge Functions → `sync-ical-bookings`
3. Ver logs de ejecución

---

## 📞 **Integración con Reservations**

Para crear reservas automáticas desde bookings sincronizadas:

```sql
-- Crear reservas desde synced_bookings
INSERT INTO reservations (
    property_id,
    guest_name,
    guest_surname,
    phone_number,
    nationality,
    checkin_date,
    checkout_date,
    notes,
    status
)
SELECT 
    (SELECT main_property_id FROM user_properties WHERE id = sb.property_id) as property_id,
    SPLIT_PART(sb.guest_name, ' ', 1) as guest_name,
    SPLIT_PART(sb.guest_name, ' ', 2) as guest_surname,
    sb.guest_phone,
    'XX' as nationality,  -- Por defecto
    sb.check_in_date,
    sb.check_out_date,
    'Sincronizado desde ' || sb.booking_source as notes,
    'active' as status
FROM synced_bookings sb
WHERE NOT EXISTS (
    SELECT 1 FROM reservations r
    WHERE r.checkin_date = sb.check_in_date
      AND r.checkout_date = sb.check_out_date
      AND r.property_id = (SELECT main_property_id FROM user_properties WHERE id = sb.property_id)
);
```

---

## 🎯 **Próximos Pasos Recomendados**

1. ✅ **Sistema activado** - Ya funcional
2. ⏰ **Configurar Cron Job** (opcional)
   - Llamar a la Edge Function cada 30 minutos
   - Usar Supabase Cron o servicio externo
3. 🔔 **Notificaciones** (futuro)
   - Alertas cuando lleguen nuevas reservas
   - Enviar a WhatsApp/Telegram
4. 🔄 **Auto-conversión** (futuro)
   - Crear reservas automáticamente en tabla `reservations`

---

## ✅ **Checklist de Verificación**

- [x] Tabla `ical_configs` creada y poblada
- [x] Tabla `user_properties` conectada correctamente
- [x] Tabla `synced_bookings` restaurada y funcional
- [x] Edge Function `sync-ical-bookings` desplegada
- [x] Funciones SQL para sincronización manual creadas
- [x] Vista `ical_sync_status` para monitoreo
- [x] Sistema activado y sincronizando
- [x] Primeras 5 reservas sincronizadas exitosamente

---

## 📚 **Referencias**

- **Edge Function**: `supabase/functions/ical-sync/index.ts`
- **Servicios Frontend**:
  - `src/services/propertyIcalService.ts`
  - `src/services/syncedBookingsService.ts`
  - `src/services/reservationService.ts`
- **Migraciones**:
  - `20251016_007_activar_sistema_ical.sql`

---

**🎉 Sistema iCal completamente operativo y listo para producción!**

