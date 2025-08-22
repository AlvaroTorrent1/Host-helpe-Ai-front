# Guía de Solución de Problemas - Stripe en Producción

## Error: Edge Function returned a non-2xx status code

### Síntomas
- Error al procesar pagos en producción
- Mensaje: "Edge Function returned a non-2xx status code"
- La función `create-payment-intent` falla

### Causas Comunes

#### 1. **Desincronización de Claves Stripe**
- Frontend usa claves LIVE pero backend usa TEST (o viceversa)
- Claves no configuradas en variables de entorno

#### 2. **Variables de Entorno Faltantes**

**Frontend (.env):**
```env
VITE_STRIPE_PUBLIC_KEY=pk_live_YOUR_KEY_HERE
```

**Backend (Supabase Edge Functions):**
- Configurar en Dashboard > Edge Functions > Secrets:
  - `STRIPE_SECRET_KEY=sk_live_YOUR_KEY_HERE`

#### 3. **Modo de Configuración Incorrecto**
- El archivo `config/stripe-config.ts` está en modo incorrecto
- La configuración manual no coincide con las variables de entorno

## Solución Paso a Paso

### Paso 1: Verificar Configuración Actual
```bash
npm run verify:production
```

Este comando verificará:
- Variables de entorno del frontend
- Conexión con Supabase
- Configuración de Edge Functions
- Consistencia entre frontend y backend

### Paso 2: Configurar Variables de Entorno

#### Frontend
1. Crear archivo `.env` en la raíz del proyecto:
```env
# Stripe - Claves de Producción
VITE_STRIPE_PUBLIC_KEY=pk_live_YOUR_LIVE_PUBLIC_KEY

# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

2. Obtener claves desde [Stripe Dashboard](https://dashboard.stripe.com/apikeys)

#### Backend (Supabase)
1. Ir a [Supabase Dashboard](https://app.supabase.com)
2. Navegar a: Settings > Edge Functions > Secrets
3. Añadir:
   - `STRIPE_SECRET_KEY`: sk_live_YOUR_SECRET_KEY

### Paso 3: Verificar Consistencia

Asegurar que ambas claves sean del mismo tipo:
- **Producción**: `pk_live_...` y `sk_live_...`
- **Test**: `pk_test_...` y `sk_test_...`

### Paso 4: Reiniciar Servicios

```bash
# Reiniciar servidor de desarrollo
npm run dev:prod

# O para build de producción
npm run build
```

### Paso 5: Probar Configuración

```bash
# Verificar que todo esté correcto
npm run verify:production
```

## Prevención a Largo Plazo

### 1. Sistema de Validación Automática
El código ahora incluye `stripe-validator.ts` que:
- Valida configuración al iniciar
- Detecta inconsistencias
- Proporciona recomendaciones específicas

### 2. Logs Mejorados
Las Edge Functions ahora registran:
- Tipo de clave (TEST/LIVE)
- Inconsistencias detectadas
- Información de debugging detallada

### 3. Verificación Pre-Deploy
```bash
# Antes de desplegar a producción
npm run pre-deploy
```

Este comando:
1. Verifica configuración de Stripe
2. Ejecuta linters
3. Construye el proyecto

### 4. Monitoreo Continuo

#### En el Frontend
```javascript
// El validador se ejecuta automáticamente
import { stripeValidator } from '@/config/stripe-validator';

// Verificar estado
const status = stripeValidator.getValidationStatus();
if (!status.isValid) {
  console.error('Configuración inválida:', status.errors);
}
```

#### En Edge Functions
Los logs ahora incluyen:
- Modo de operación (TEST/LIVE)
- Validación de consistencia
- Errores específicos de configuración

## Checklist de Producción

- [ ] Variables de entorno configuradas en `.env`
- [ ] `VITE_STRIPE_PUBLIC_KEY` con clave `pk_live_`
- [ ] `STRIPE_SECRET_KEY` configurada en Supabase con `sk_live_`
- [ ] Webhook de Stripe configurado con endpoint correcto
- [ ] `STRIPE_WEBHOOK_SECRET` configurado en Supabase
- [ ] Ejecutado `npm run verify:production` sin errores
- [ ] Probado flujo de pago completo en producción

## Comandos Útiles

```bash
# Verificar configuración
npm run verify:production

# Cambiar a modo test
npm run stripe:test

# Cambiar a modo producción
npm run stripe:production

# Build con verificación
npm run pre-deploy
```

## Soporte

Si el problema persiste después de seguir esta guía:

1. Revisar logs de Edge Functions en Supabase Dashboard
2. Verificar estado de Stripe en https://status.stripe.com
3. Contactar soporte con:
   - Output de `npm run verify:production`
   - Logs de Edge Functions
   - Versión del navegador y sistema operativo
