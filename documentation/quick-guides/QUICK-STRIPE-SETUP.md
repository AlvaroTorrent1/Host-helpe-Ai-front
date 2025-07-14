# 🚀 Cambio Rápido de Modo Stripe

## Comandos Principales

```bash
# Ver modo actual
npm run stripe:status

# 🧪 Modo TEST (desarrollo)
npm run stripe:test

# 🚀 Modo PRODUCCIÓN (pagos reales)
npm run stripe:production
```

## ¡IMPORTANTE!

- **Después de cambiar modo → Recarga el navegador** (`Ctrl + Shift + R`)
- **Modo TEST:** Muestra "Modo de prueba - usar tarjetas de test"
- **Modo PRODUCCIÓN:** Muestra "Pago seguro procesado por Stripe"

## Para Producción Real

1. Configura claves `pk_live_...` en variables de entorno
2. `npm run stripe:production`
3. Verifica en `/pricing` que NO aparezca texto de test

## Documentación Completa

📖 Ver: `documentation/guides/stripe-production-setup.md` 