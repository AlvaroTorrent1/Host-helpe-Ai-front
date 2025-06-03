# 🚀 Configuración de Producción - Host Helper AI

## Resumen de configuración necesaria

### 1. Stripe Live Mode
- Activar modo LIVE en dashboard de Stripe
- Crear productos Basic y Pro con precios en EUR
- Obtener claves API live (pk_live_* y sk_live_*)
- Configurar webhook para tu dominio de producción

### 2. Supabase Configuration  
- Configurar variables de entorno en Edge Functions
- Actualizar URL de sitio para OAuth a dominio de producción
- Verificar que Edge Functions estén usando claves live

### 3. Frontend Environment
- Configurar archivo .env.production con claves live
- Verificar que build de producción funcione sin errores
- Deploy a hosting (Vercel, Netlify, etc.)

### 4. Testing
- Probar flujo OAuth completo
- Realizar test de pago con tarjeta real (⚠️ dinero real)
- Verificar webhooks y actualización de suscripciones

## ⚠️ Importante
- En producción se procesan pagos reales
- Tener plan de rollback preparado
- Monitorear logs de Stripe y Supabase post-lanzamiento

Para detalles específicos de configuración, contactar al equipo de desarrollo. 