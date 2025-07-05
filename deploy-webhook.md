# 🚀 Guía de Despliegue del Sistema N8N Webhook

## Pasos de Despliegue Manual

### 1. ✅ Migración de Base de Datos (Completado)
La migración con las funciones de transacción ya se aplicó correctamente:
- `begin_transaction()`
- `commit_transaction()`
- `rollback_transaction()`
- `clean_property_data()`
- `create_property_with_media()`

### 2. 🔐 Configurar Variables de Entorno

#### Frontend (.env.local)
Crear archivo `.env.local` en la raíz:
```env
VITE_N8N_WEBHOOK_TOKEN=hosthelper-n8n-secure-token-2024
VITE_ENABLE_WEBHOOK_PROCESSING=true
VITE_DEBUG_WEBHOOK=true
```

#### Supabase Secrets
En el Dashboard de Supabase:
1. Ve a **Settings > Secrets**
2. Agrega: `N8N_WEBHOOK_TOKEN` = `hosthelper-n8n-secure-token-2024`

### 3. 📡 Desplegar Edge Function

**Comando:**
```bash
npx supabase login
npx supabase functions deploy n8n-webhook --no-verify-jwt
```

**Alternativa sin CLI local:**
1. Ve al Dashboard de Supabase
2. Entra a **Edge Functions**
3. Crea nueva función: `n8n-webhook`
4. Copia el código de: `supabase/functions/n8n-webhook/index.ts`

### 4. 🧪 Verificar Despliegue

#### Desde la UI (Modo Desarrollo)
1. Abre la aplicación en modo desarrollo
2. Ve a crear nueva propiedad
3. Habilita "Procesamiento Inteligente con IA"
4. Haz clic en "🔧 Test Salud" - debería mostrar ✅
5. Haz clic en "🧪 Test Completo" - debería crear una propiedad de prueba

#### Desde la Consola
```javascript
// En la consola del navegador:
import { webhookTestService } from './services/webhookTestService';

// Test simple
await webhookTestService.testWebhookOnly();

// Test completo
await webhookTestService.runFullTest();
```

### 5. ✅ Verificación de Funcionamiento

**Endpoint del Webhook:**
```
https://tu-proyecto.supabase.co/functions/v1/n8n-webhook
```

**Test Manual con curl:**
```bash
curl -X POST https://tu-proyecto.supabase.co/functions/v1/n8n-webhook \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer hosthelper-n8n-secure-token-2024" \
  -d '{
    "property_id": "test-123",
    "user_id": "test-user",
    "property_data": {
      "name": "Test Property",
      "address": "Test Address"
    },
    "uploaded_files": {
      "interni": [],
      "esterni": [],
      "elettrodomestici_foto": [],
      "documenti_casa": [],
      "documenti_elettrodomestici": []
    },
    "timestamp": "2025-01-19T12:00:00Z",
    "request_id": "test-req-123"
  }'
```

## 🔄 Estado Actual

- ✅ **Migración DB**: Aplicada correctamente
- ✅ **Edge Function**: Código listo para despliegue
- ✅ **Frontend**: Sistema dual implementado con testing
- ✅ **Categorización IA**: Sistema inteligente funcional
- ⏳ **Despliegue**: Pendiente de login en Supabase CLI

## 🚨 Siguientes Pasos

1. **Hacer login en Supabase CLI:**
   ```bash
   npx supabase login
   ```

2. **Desplegar la función:**
   ```bash
   npx supabase functions deploy n8n-webhook --no-verify-jwt
   ```

3. **Configurar el token en Supabase Secrets**

4. **Probar el sistema completo**

## 🐛 Troubleshooting

### Error: "Access token not provided"
```bash
npx supabase login
# Seguir las instrucciones para autenticarse
```

### Error: "Function not found"
- Verificar que el archivo `supabase/functions/n8n-webhook/index.ts` existe
- Verificar la estructura de directorios

### Error de autenticación en webhook
- Verificar que `N8N_WEBHOOK_TOKEN` está configurado en Supabase Secrets
- Verificar que `VITE_N8N_WEBHOOK_TOKEN` está en `.env.local`

### La categorización no funciona
- Los archivos se procesan pero la IA necesita patrones reconocibles
- Usar nombres descriptivos como "cocina_moderna.jpg" o "contrato_alquiler.pdf" 