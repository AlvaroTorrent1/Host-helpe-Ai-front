# ⚠️ ACCIÓN REQUERIDA: Configurar Variables de Entorno

## 📋 Variables a Configurar en Supabase Dashboard

Ve a **Project Settings > Edge Functions > Secrets** en tu dashboard de Supabase y agrega:

### 1. API Key de ElevenLabs
```
ELEVENLABS_API_KEY=tu_api_key_aqui
```
- Obtén tu API key desde: https://elevenlabs.io/app/settings/api-keys
- Asegúrate de usar una clave con permisos suficientes

### 2. Secret para Webhooks
```
ELEVENLABS_WEBHOOK_SECRET=tu_webhook_secret_seguro
```
- Genera un secret seguro con: `openssl rand -hex 32` (o usa un generador online)
- Este mismo valor debe configurarse en ElevenLabs

### 3. URL de API (Opcional)
```
ELEVENLABS_API_URL=https://api.elevenlabs.io/v1
```
- Solo necesario si usas un endpoint personalizado

## ✅ Checklist
- [ ] Configurar ELEVENLABS_API_KEY
- [ ] Configurar ELEVENLABS_WEBHOOK_SECRET
- [ ] Verificar que ambas variables están activas

**IMPORTANTE**: Sin estas variables, las Edge Functions no funcionarán correctamente.
