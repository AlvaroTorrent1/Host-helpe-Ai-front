# 🚀 Configuración de Producción - Host Helper AI

## Configuración de Claves Stripe LIVE

Para habilitar pagos reales en producción, configura las siguientes claves:

### 1. Frontend - Clave Pública

**Opción A: Variable de Entorno (.env.production)**
```env
VITE_STRIPE_PUBLIC_KEY=pk_live_TU_CLAVE_PUBLICA_AQUI
```

**Opción B: Configuración Manual (config/stripe-config.ts)**
```typescript
const PRODUCTION_CONFIG: StripeConfig = {
  publicKey: 'pk_live_TU_CLAVE_PUBLICA_AQUI',
  mode: 'production',
  isProduction: true,
  isDemo: false
};
```

### 2. Backend - Clave Secreta

**Supabase Edge Functions:**
1. Dashboard: https://app.supabase.com/project/stripekol-dt5qxkz6
2. Settings → Edge Functions → Secrets
3. Crear variable: `STRIPE_SECRET_KEY` = `sk_live_TU_CLAVE_SECRETA_AQUI`

### 3. Webhook de Stripe

**Configuración en Stripe Dashboard:**
- Endpoint: `https://stripekol-dt5qxkz6.supabase.co/functions/v1/stripe-webhook`
- Eventos: `payment_intent.succeeded`, `payment_intent.payment_failed`
- Signing Secret: Configurar en Supabase como `STRIPE_WEBHOOK_SECRET`

## Obtener Claves de Stripe

1. **Ir a Stripe Dashboard:** https://dashboard.stripe.com/apikeys
2. **Activar modo LIVE** (toggle en la esquina superior izquierda)
3. **Copiar claves:**
   - **Publishable key** (empieza con `pk_live_`) → Frontend
   - **Secret key** (empieza con `sk_live_`) → Backend

## Verificación

```bash
# Verificar configuración
npm run verify:production

# Build de producción
npm run build

# Servir en modo producción
npm run preview
```

## ⚠️ Importante

- **NUNCA** subir claves reales a Git
- Las claves `pk_live_` y `sk_live_` procesan **pagos reales**
- Usar claves `pk_test_` y `sk_test_` solo para desarrollo
- Ambas claves (frontend y backend) deben ser del mismo tipo

## 🛡️ Seguridad

Este repositorio tiene **GitHub Secret Scanning** habilitado para prevenir la exposición accidental de claves de API.

Si necesitas las claves reales, contacta al administrador del proyecto.
