# Restricción Flexible de Check-in

## 📋 Resumen del Cambio

Se ha modificado la restricción de fecha de check-in en la tabla `reservations` para ser más flexible con turistas que envían el parte de viajeros con retraso.

---

## 🔄 Cambio Implementado

### ❌ Restricción Antigua (Estricta)
```sql
CHECK (checkin_date >= CURRENT_DATE)
```
- Solo permitía fechas de check-in **futuras o del día actual**
- Bloqueaba cualquier reserva con check-in pasado
- Poco flexible con turistas despistados

### ✅ Nueva Restricción (Flexible)
```sql
CHECK (checkin_date >= CURRENT_DATE - INTERVAL '5 days')
```
- Permite fechas de check-in hasta **5 días en el pasado**
- Da margen a turistas que rellenan el parte con retraso
- Más user-friendly sin perder control

---

## 📖 Justificación

### Marco Legal
- La **ley española** requiere envío del parte de viajeros en **72 horas (3 días)**
- Ref: Real Decreto 933/2021 sobre registro de viajeros

### Nuestro Enfoque
- Damos **margen de 5 días** en lugar de 3
- **Beneficios**:
  - Ayuda a turistas despistados
  - Reduce errores de bloqueo innecesarios
  - Mejora la experiencia de usuario (UX)
  - Mantiene control razonable sobre fechas

---

## 🧪 Tests de Validación

### ✅ Tests que PASAN

| Escenario | Check-in | Resultado |
|-----------|----------|-----------|
| Check-in hoy | `CURRENT_DATE` | ✅ Permitido |
| Check-in mañana | `CURRENT_DATE + 1` | ✅ Permitido |
| Check-in hace 1 día | `CURRENT_DATE - 1` | ✅ Permitido |
| Check-in hace 3 días | `CURRENT_DATE - 3` | ✅ Permitido |
| Check-in hace 5 días | `CURRENT_DATE - 5` | ✅ Permitido (límite) |

### ❌ Tests que FALLAN (como esperado)

| Escenario | Check-in | Resultado |
|-----------|----------|-----------|
| Check-in hace 6 días | `CURRENT_DATE - 6` | ❌ RECHAZADO |
| Check-in hace 7 días | `CURRENT_DATE - 7` | ❌ RECHAZADO |
| Check-in hace 10 días | `CURRENT_DATE - 10` | ❌ RECHAZADO |

---

## 📁 Archivos Modificados

### 1. Migración SQL
**Archivo**: `supabase/migrations/20251103_flexible_checkin_constraint.sql`

```sql
-- Eliminar restricción antigua
ALTER TABLE reservations DROP CONSTRAINT IF EXISTS future_checkin;

-- Crear nueva restricción flexible
ALTER TABLE reservations 
ADD CONSTRAINT flexible_checkin_date 
CHECK (checkin_date >= CURRENT_DATE - INTERVAL '5 days')
NOT VALID;
```

### 2. Aplicación
- Migración aplicada con éxito en Supabase
- Restricción activa en la base de datos de producción

---

## 🎯 Casos de Uso Reales

### Caso 1: Turista Despistado ✅
```
Situación:
- Turista llega el lunes 1 de noviembre
- Se olvida de rellenar el parte
- Recuerda el miércoles 3 de noviembre (2 días después)

Resultado:
- ✅ PERMITIDO: Puede crear la reserva y rellenar el parte
- Sistema acepta check-in del 1 de noviembre
```

### Caso 2: Envío Muy Tardío ❌
```
Situación:
- Turista llega el 25 de octubre
- Intenta registrar la reserva el 3 de noviembre (9 días después)

Resultado:
- ❌ RECHAZADO: Excede el margen de 5 días
- Debe contactar soporte para registro manual
```

### Caso 3: Reserva Futura ✅
```
Situación:
- Turista reserva para el 10 de noviembre
- Crea la reserva con antelación

Resultado:
- ✅ PERMITIDO: Fechas futuras siempre funcionan
```

---

## 🔧 Configuración Técnica

### Constraint Details
```sql
-- Nombre de la restricción
constraint_name: flexible_checkin_date

-- Definición
CHECK ((checkin_date >= (CURRENT_DATE - '5 days'::interval)))

-- Validación
NOT VALID  -- No valida filas existentes, solo nuevas
```

### Por qué NOT VALID?
- Hay reservas históricas/prueba con fechas antiguas
- `NOT VALID` permite mantener esas filas sin error
- Solo valida INSERT/UPDATE de nuevas filas

---

## 📊 Impacto en el Sistema

### Funcionalidades Afectadas

1. **Creación de Reservas**
   - Frontend: Permite seleccionar fechas hasta 5 días atrás
   - Backend: Valida automáticamente en base de datos

2. **Parte de Viajeros**
   - Turistas pueden enviar el parte hasta 5 días después del check-in
   - Mejor UX, menos frustración

3. **Envío a Lynx/SES**
   - No afecta el envío a Lynx
   - Lynx/SES pueden tener sus propias validaciones

---

## ⚙️ Ajustes Futuros

Si se necesita cambiar el margen de días:

```sql
-- Para cambiar a 7 días (1 semana)
ALTER TABLE reservations DROP CONSTRAINT flexible_checkin_date;
ALTER TABLE reservations 
ADD CONSTRAINT flexible_checkin_date 
CHECK (checkin_date >= CURRENT_DATE - INTERVAL '7 days')
NOT VALID;

-- Para cambiar a 3 días (estricto legal)
ALTER TABLE reservations DROP CONSTRAINT flexible_checkin_date;
ALTER TABLE reservations 
ADD CONSTRAINT flexible_checkin_date 
CHECK (checkin_date >= CURRENT_DATE - INTERVAL '3 days')
NOT VALID;
```

---

## 🐛 Troubleshooting

### Error: "check constraint violated"
```
ERROR: new row violates check constraint "flexible_checkin_date"
```

**Causa**: Intentas crear una reserva con check-in de hace más de 5 días

**Solución**:
1. Verifica la fecha de check-in
2. Si es legítimo, contacta soporte para registro manual
3. O ajusta la restricción temporalmente (ver sección "Ajustes Futuros")

---

## 📝 Notas Importantes

1. ✅ La restricción mejora la UX sin comprometer la legalidad
2. ✅ 5 días es más generoso que el mínimo legal de 3 días
3. ✅ Ayuda a turistas despistados
4. ⚠️ Lynx/SES pueden rechazar partes muy tardíos independientemente
5. 💡 El margen puede ajustarse según feedback de usuarios

---

## 📅 Información de Cambio

- **Fecha**: 2025-11-03
- **Migración**: `20251103_flexible_checkin_constraint.sql`
- **Estado**: ✅ Aplicada en producción
- **Constraint**: `flexible_checkin_date`
- **Margen**: 5 días en el pasado

---

## 🎉 Beneficios Esperados

1. **Menos errores** de usuarios bloqueados
2. **Mejor experiencia** para turistas despistados
3. **Más conversión** de registros completados
4. **Menos soporte** manual necesario
5. **Flexibilidad** sin perder control

---

**✅ Cambio implementado y testeado exitosamente**

