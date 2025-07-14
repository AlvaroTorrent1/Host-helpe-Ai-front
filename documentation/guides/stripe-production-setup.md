# Configuración de Stripe para Producción

## 🎯 Resumen

Esta guía explica cómo configurar y cambiar entre los modos TEST y PRODUCCIÓN de Stripe en Host Helper AI.

## 🔧 Sistema de Configuración

### Cambio Rápido entre Modos

Usa estos comandos para cambiar entre modos:

```bash
# Ver estado actual
npm run stripe:status

# Cambiar a modo TEST (desarrollo)
npm run stripe:test

# Cambiar a modo PRODUCCIÓN
npm run stripe:production

# Ver ayuda
npm run stripe:help
```

### Configuración Manual

También puedes editar `config/stripe-config.ts`:

```typescript
// Cambiar esta variable:
const USE_PRODUCTION_MODE = false; // false = TEST, true = PRODUCCIÓN
```

## 🧪 Modo TEST (Desarrollo)

### Características:
- ✅ Pagos simulados (sin dinero real)
- ✅ Muestra texto "Modo de prueba - usar tarjetas de test"
- ✅ Tarjeta de prueba: `4242 4242 4242 4242`
- ✅ Logs detallados en consola
- ✅ Botón de diagnóstico disponible

### Configuración:
```bash
npm run stripe:test
```

### Verificación:
- Ve a `/pricing` → Selecciona plan → Modal debe mostrar "Modo de prueba"
- En consola: `Stripe Config: Modo TEST`

## 🚀 Modo PRODUCCIÓN

### Características:
- ⚠️ **PAGOS REALES** con dinero real
- ✅ Texto profesional: "Pago seguro procesado por Stripe"
- ✅ Sin referencias a tarjetas de test
- ✅ Interfaz lista para usuarios finales

### Configuración:
```bash
npm run stripe:production
```

### Verificación:
- Ve a `/pricing` → Selecciona plan → Modal debe mostrar "Pago seguro"
- En consola: `Stripe Config: Modo PRODUCTION`

## 🔑 Configuración de Claves de Producción

### 1. Obtener Claves de Stripe Live

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. Asegúrate de estar en **modo LIVE** (no test)
3. Ve a Developers → API keys
4. Copia las claves:
   - **Publishable key** (empieza con `pk_live_...`)
   - **Secret key** (empieza con `sk_live_...`)

### 2. Configurar Variables de Entorno

Crea un archivo `.env.local` (no commitear):

```env
# Claves de PRODUCCIÓN
VITE_STRIPE_PUBLIC_KEY=pk_live_TU_CLAVE_PUBLICA_AQUI
STRIPE_SECRET_KEY=sk_live_TU_CLAVE_SECRETA_AQUI

# URL de producción
VITE_SITE_URL=https://tu-dominio.com
```

### 3. Configurar Supabase Edge Functions

Actualiza las variables en Supabase:

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_TU_CLAVE_SECRETA
```

### 4. Configurar Webhooks de Stripe

1. En Stripe Dashboard → Developers → Webhooks
2. Añade endpoint: `https://tu-proyecto.supabase.co/functions/v1/stripe-webhook`
3. Selecciona eventos:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## ✅ Lista de Verificación para Producción

### Antes del Lanzamiento:

- [ ] **Cuenta Stripe activada** (verificación de identidad completada)
- [ ] **Claves live configuradas** (`pk_live_*`, `sk_live_*`)
- [ ] **Variables de entorno actualizadas** en todos los entornos
- [ ] **Webhooks configurados** con URL de producción
- [ ] **Modo producción activado** (`npm run stripe:production`)
- [ ] **SSL habilitado** en el dominio
- [ ] **Tests de pago realizados** con tarjetas reales

### Verificación Final:

```bash
# 1. Verificar modo actual
npm run stripe:status

# 2. Verificar configuración
npm run verify:production

# 3. Build de producción
npm run build

# 4. Test del modal de pago
# - Ve a /pricing
# - Selecciona un plan
# - Verifica que NO aparezca "Modo de prueba"
# - Verifica que aparezca "Pago seguro procesado por Stripe"
```

## 🔄 Volver a Modo TEST

Después de probar producción, vuelve a modo test:

```bash
npm run stripe:test
npm run dev
```

## ⚠️ Consideraciones de Seguridad

### Variables de Entorno:
- ❌ **NUNCA** commitear claves live en Git
- ✅ Usar `.env.local` para desarrollo
- ✅ Configurar variables en el servidor de producción

### Claves de Stripe:
- ❌ **NUNCA** usar claves test en producción
- ❌ **NUNCA** usar claves live en desarrollo
- ✅ El sistema detecta automáticamente el tipo de clave

### Validaciones Automáticas:
```typescript
// El sistema valida automáticamente:
if (stripeConfig.isProduction && stripeConfig.publicKey.includes('DEMO')) {
  console.error('🚨 ERROR: Usando clave de demostración en modo producción!');
}
```

## 🚨 Troubleshooting

### Problema: Sigo viendo "Modo de prueba"
**Solución:**
1. Verifica que cambiaste el modo: `npm run stripe:status`
2. Recarga completamente el navegador: `Ctrl + Shift + R`
3. Verifica las claves en consola del navegador

### Problema: Error "clave no válida"
**Solución:**
1. Verifica que la clave empiece con `pk_live_` para producción
2. Verifica que la clave esté completa (sin espacios)
3. Verifica que la cuenta Stripe esté activada

### Problema: Webhook no funciona
**Solución:**
1. Verifica la URL del webhook en Stripe Dashboard
2. Verifica que los eventos estén seleccionados
3. Verifica los logs en Supabase Functions

## 📞 Soporte

Si encuentras problemas:
1. Revisa los logs en consola del navegador
2. Verifica la configuración paso a paso
3. Contacta al equipo de desarrollo con los logs específicos

---

**⚡ Consejo:** Usa siempre el modo TEST durante desarrollo y solo cambiar a PRODUCCIÓN para testing final y lanzamiento. 