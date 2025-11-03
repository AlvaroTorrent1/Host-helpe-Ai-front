# 📧 Sistema de Alertas y Notificaciones iCal

## ✅ Lo que se ha implementado

### 1. **Corrección del error de sincronización iCal**
- ✅ Agregado `UNIQUE constraint` en `booking_uid` de la tabla `synced_bookings`
- ✅ Reescrita la función `auto_sync_ical_bookings()` para manejar correctamente múltiples eventos
- ✅ La sincronización ahora funciona correctamente

### 2. **Sistema de alertas automático**
- ✅ Nueva tabla `sync_alerts` que almacena todas las alertas del sistema
- ✅ Trigger automático que crea alertas cuando hay errores de sincronización
- ✅ Resolución automática de alertas cuando el problema se soluciona
- ✅ Vista `active_alerts` para consultar alertas activas fácilmente

### 3. **Notificaciones por email**
- ✅ Edge Function `send-alert-email` creada
- ✅ Trigger que llama automáticamente a la Edge Function cuando hay errores HIGH o CRITICAL
- ✅ Email con formato HTML profesional incluyendo detalles del error

---

## ⚙️ Configuración pendiente

### Para activar las notificaciones por email:

**1. Crear cuenta en Resend (servicio de email gratuito)**
- Ir a: https://resend.com
- Crear cuenta gratuita (3,000 emails/mes gratis)
- Verificar tu dominio (o usar el dominio de prueba)

**2. Obtener API Key**
- En el dashboard de Resend, ir a "API Keys"
- Crear nueva API key
- Copiar la key (comienza con `re_...`)

**3. Configurar la API Key en Supabase**
```bash
# En la consola de Supabase:
# Settings > Edge Functions > Secrets
# Agregar:
RESEND_API_KEY=re_tu_api_key_aqui
```

**4. (Opcional) Configurar dominio personalizado**
Si tienes un dominio verificado en Resend, actualiza la Edge Function:
```typescript
// En: supabase/functions/send-alert-email/index.ts
// Cambiar línea ~65:
from: 'HostHelper Alerts <alerts@tudominio.com>',
```

---

## 📊 Cómo usar el sistema

### Ver alertas activas:
```sql
SELECT * FROM active_alerts;
```

### Ver historial completo de alertas:
```sql
SELECT 
  title,
  message,
  severity,
  is_resolved,
  created_at,
  resolved_at
FROM sync_alerts
ORDER BY created_at DESC
LIMIT 20;
```

### Resolver alerta manualmente:
```sql
UPDATE sync_alerts
SET is_resolved = true,
    resolved_at = now()
WHERE id = '<alert_id>';
```

### Ver configuración del sistema:
```sql
SELECT * FROM system_config;
```

---

## 🔄 Estado actual de las reservas

**Última sincronización:** Exitosa ✅  
**Reservas futuras:**
- 31 octubre - 3 noviembre 2025
- 6 - 13 noviembre 2025

**No hay visitantes activos HOY (27 octubre 2025)**

---

## 🛡️ Protección implementada

Este error **NO volverá a ocurrir** porque:

1. ✅ **UNIQUE constraint** en `booking_uid` previene duplicados
2. ✅ **Función reescrita** maneja correctamente múltiples eventos del iCal
3. ✅ **Manejo de errores** robusto con bloques `EXCEPTION`
4. ✅ **Logging detallado** para debug
5. ✅ **Sistema de alertas** te notifica inmediatamente si algo falla

---

## 📧 Email de notificación

Cuando hay un error, recibirás un email en **hosthelperai.services@gmail.com** con:
- 🚨 Tipo y severidad del error
- 📝 Mensaje de error técnico
- 🔍 Detalles técnicos (nombre iCal, URL, etc.)
- ⏰ Fecha y hora del error

---

## 🏗️ Arquitectura técnica

```
iCal Sync Error
     ↓
ical_configs (UPDATE)
     ↓
Trigger: create_ical_sync_alert()
     ↓
1. Crea registro en sync_alerts
2. Llama a Edge Function send-alert-email
     ↓
Edge Function
     ↓
Resend API
     ↓
📧 Email a hosthelperai.services@gmail.com
```

---

## 📝 Notas técnicas

- Los emails se envían **solo para errores HIGH y CRITICAL**
- Las alertas de severidad LOW y MEDIUM se registran pero no envían email
- El sistema es **tolerante a fallos**: si el email falla, la alerta se crea igualmente
- Las alertas se resuelven **automáticamente** cuando la sincronización vuelve a funcionar

---

## 🆘 Troubleshooting

**Si no recibes emails:**
1. Verificar que `RESEND_API_KEY` está configurado en Supabase
2. Verificar logs de la Edge Function: Settings > Edge Functions > send-alert-email > Logs
3. Verificar que el email en `system_config` es correcto:
   ```sql
   SELECT * FROM system_config WHERE key = 'alert_email';
   ```

**Para cambiar el email de notificaciones:**
```sql
UPDATE system_config
SET value = 'nuevo-email@ejemplo.com'
WHERE key = 'alert_email';
```

---

Creado: 27 octubre 2025  
Última actualización: 27 octubre 2025











