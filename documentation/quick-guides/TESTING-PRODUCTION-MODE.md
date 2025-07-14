# 🚀 Guía de Testing - Modo Producción

## ✅ Configuración Completada

Has configurado exitosamente el sistema para alternar entre modo TEST y PRODUCCIÓN. Todo está listo para testing.

## 🎯 Estado Actual

```bash
npm run verify:config
```

**Resultado esperado:**
- ✅ Configuración: PRODUCCIÓN
- ✅ Variable de entorno: No definida (usa configuración manual)
- ✅ Modo efectivo: PRODUCCIÓN

## 🌐 Testing del Modo Producción

### 1. Abrir la Aplicación

Ve a: **http://localhost:4003/pricing** (o el puerto que muestre el servidor)

### 2. Verificar en DevTools

1. Presiona **F12** para abrir DevTools
2. Ve a la pestaña **Console**
3. Busca el mensaje: `🔧 Stripe Config: Modo PRODUCTION`
4. Deberías ver:
   ```
   🔧 Stripe Config: Modo PRODUCTION {
     publicKey: "pk_live_DEMO_FOR...",
     isProduction: true,
     source: "configuración manual"
   }
   ```

### 3. Probar el Modal de Pago

1. Haz clic en **"Empezar"** en el plan Profesional
2. Completa el registro/login
3. En el modal de pago verifica:

#### ✅ DEBE APARECER (Modo Producción):
- 🔒 **"Pago seguro procesado por Stripe"**
- ✅ **"Transacción protegida con SSL"**
- Interfaz limpia y profesional

#### ❌ NO DEBE APARECER (Textos de Test):
- ~~"Modo de prueba - usar tarjetas de test"~~
- ~~"Tarjeta: 4242 4242 4242 4242"~~
- ~~Botón "Diagnóstico"~~

### 4. ⚠️ IMPORTANTE - No Completar Pago

- **NO introduzcas datos reales de tarjeta**
- Solo verifica la **interfaz visual**
- El formulario usará la clave `pk_live_DEMO_FOR_TESTING_ONLY`
- Habrá un error al intentar procesar (es normal con clave demo)

## 🔄 Comandos Útiles

```bash
# Ver estado actual
npm run stripe:status

# Cambiar a modo TEST (desarrollo)
npm run stripe:test

# Cambiar a modo PRODUCCIÓN 
npm run stripe:production

# Verificar configuración completa
npm run verify:config

# Guía de testing producción
npm run test:production
```

## ✅ Lista de Verificación

**Modo Producción Configurado Correctamente:**

- [ ] Comando `npm run verify:config` muestra "MODO PRODUCCIÓN"
- [ ] Console del navegador muestra "Stripe Config: Modo PRODUCTION"
- [ ] Modal de pago muestra "Pago seguro procesado por Stripe"
- [ ] NO aparece "Modo de prueba" en el modal
- [ ] NO aparece "4242 4242 4242 4242" en el modal
- [ ] NO hay botón de "Diagnóstico"
- [ ] Interfaz se ve profesional y lista para usuarios

## 🚀 Para Producción Real

Una vez que hayas verificado que la interfaz funciona correctamente:

### 1. Obtener Claves Live de Stripe

1. Ve a [Stripe Dashboard](https://dashboard.stripe.com)
2. Completa la verificación de tu cuenta
3. Obtén tus claves reales:
   - **Publishable key**: `pk_live_...`
   - **Secret key**: `sk_live_...`

### 2. Configurar Claves Reales

**Opción A: Variables de Entorno (Recomendado)**
```bash
# Crear .env.local
VITE_STRIPE_PUBLIC_KEY=pk_live_TU_CLAVE_REAL_AQUI
```

**Opción B: Archivo de Configuración**
```typescript
// En config/stripe-config.ts
const PRODUCTION_CONFIG: StripeConfig = {
  publicKey: 'pk_live_TU_CLAVE_REAL_AQUI',
  mode: 'production',
  isProduction: true
};
```

### 3. Configurar Supabase Edge Functions

```bash
supabase secrets set STRIPE_SECRET_KEY=sk_live_TU_CLAVE_SECRETA
```

### 4. Testing Final con Dinero Real

- ⚠️ **Solo hacer cuando esté 100% listo**
- Usar tarjeta real con cantidad pequeña (ej: €1)
- Verificar que la suscripción se cree correctamente
- Verificar que el usuario obtenga acceso premium

## 🔧 Troubleshooting

### Problema: Sigo viendo textos de test

**Soluciones:**
1. `npm run verify:config` - verificar configuración
2. `Ctrl + Shift + R` - recarga completa del navegador
3. `npm run stripe:production` - forzar modo producción
4. Revisar Console para logs de configuración

### Problema: Error en el pago

**Con clave demo (`pk_live_DEMO_FOR_TESTING_ONLY`):**
- ✅ **Normal** - es una clave falsa para testing de UI
- ✅ Lo importante es que **NO aparezcan textos de test**

**Con clave real:**
- Revisar que la clave esté completa y correcta
- Verificar que la cuenta Stripe esté activada
- Revisar logs de Supabase Edge Functions

## 📞 ¿Todo Correcto?

Si ves **"Pago seguro procesado por Stripe"** y **NO** ves textos de test:

🎉 **¡FELICITACIONES!** 

Tu aplicación está lista para producción. Solo necesitas configurar las claves reales de Stripe cuando estés listo para aceptar pagos reales.

---

**Próximo paso:** Configura las claves reales de Stripe y ¡lanza tu aplicación! 🚀 