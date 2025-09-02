# Configuración de Integración con ElevenLabs

## Variables de Entorno Requeridas

### 1. En Supabase Dashboard

Navega a **Project Settings > Edge Functions > Secrets** y agrega:

```bash
# API Key de ElevenLabs
ELEVENLABS_API_KEY=your_api_key_here

# Secret para verificar webhooks (genera uno seguro)
ELEVENLABS_WEBHOOK_SECRET=your_webhook_secret_here

# Opcional: Si usas un plan enterprise con endpoint personalizado
ELEVENLABS_API_URL=https://api.elevenlabs.io/v1
```

### 2. En tu archivo `.env.local` (desarrollo)

```bash
# Para desarrollo local
ELEVENLABS_API_KEY=your_api_key_here
ELEVENLABS_WEBHOOK_SECRET=your_webhook_secret_here
```

## Configuración de Webhooks en ElevenLabs

### 1. Acceder a la configuración de webhooks

1. Inicia sesión en [ElevenLabs](https://elevenlabs.io)
2. Ve a **Settings > Webhooks**

### 2. Configurar el endpoint

URL del webhook:
```
https://[tu-proyecto].supabase.co/functions/v1/elevenlabs-webhook-v2
```

### 3. Eventos a suscribir

Selecciona los siguientes eventos:
- ✅ `post_call_transcription` - Para conversaciones completadas
- ✅ `voice_created` - Para sincronizar voces personalizadas
- ✅ `voice_updated` - Para mantener voces actualizadas
- ✅ `usage_updated` - Para tracking preciso de uso (si disponible)

### 4. Configurar el secret

1. Genera un secret seguro:
   ```bash
   openssl rand -hex 32
   ```
2. Copia este valor en:
   - ElevenLabs webhook configuration
   - Supabase Edge Functions secrets (`ELEVENLABS_WEBHOOK_SECRET`)

## Límites y Consideraciones

### Edge Functions
- **Timeout**: 10 segundos máximo por ejecución
- **Memoria**: 150MB límite
- **Payload**: 6MB máximo

### Estrategias de Mitigación Implementadas

1. **Chunking Automático**: Textos > 1000 caracteres se dividen automáticamente
2. **Procesamiento Asíncrono**: Textos muy largos se procesan en background
3. **Retry con Backoff**: Reintentos automáticos con delays exponenciales
4. **Idempotencia**: Prevención de procesamiento duplicado de webhooks

### Límites de ElevenLabs

Por plan (verificar tu plan actual):
- **Free**: 10,000 caracteres/mes
- **Starter**: 30,000 caracteres/mes
- **Creator**: 100,000 caracteres/mes
- **Pro**: 500,000 caracteres/mes

## Testing

### 1. Test de TTS básico

```bash
curl -X POST https://[tu-proyecto].supabase.co/functions/v1/elevenlabs-tts \
  -H "Authorization: Bearer [tu-anon-key]" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Hola, esta es una prueba del sistema de texto a voz",
    "voice_id": "21m00Tcm4TlvDq8ikWAM"
  }'
```

### 2. Test de webhook

En ElevenLabs Dashboard, usa el botón "Send Test Event" para verificar la conexión.

### 3. Verificar logs

```bash
# Ver logs de Edge Functions
supabase functions logs elevenlabs-tts
supabase functions logs elevenlabs-webhook-v2
```

## Monitoreo

### Queries útiles para monitorear el sistema:

```sql
-- Ver uso del mes actual
SELECT * FROM elevenlabs_usage 
WHERE user_id = auth.uid() 
  AND month_year = date_trunc('month', CURRENT_DATE)::date;

-- Ver solicitudes TTS recientes
SELECT 
  created_at,
  text_length,
  status,
  credits_used,
  error_message
FROM tts_requests 
WHERE user_id = auth.uid()
ORDER BY created_at DESC 
LIMIT 20;

-- Ver conversaciones recientes
SELECT 
  started_at,
  duration_seconds,
  status,
  credits_used
FROM elevenlabs_conversations 
WHERE user_id = auth.uid()
ORDER BY started_at DESC 
LIMIT 20;

-- Verificar límites cercanos
SELECT 
  tts_characters_used,
  tts_characters_limit,
  (tts_characters_used::float / NULLIF(tts_characters_limit, 0) * 100)::int as usage_percentage
FROM elevenlabs_usage 
WHERE user_id = auth.uid() 
  AND month_year = date_trunc('month', CURRENT_DATE)::date;
```

## Troubleshooting

### Error: "Usage limit exceeded"
- Verifica tu plan en ElevenLabs
- Actualiza los límites en la tabla `elevenlabs_usage`

### Error: "Invalid signature"
- Verifica que `ELEVENLABS_WEBHOOK_SECRET` coincida en ambos lados
- Asegúrate de que el webhook esté configurado correctamente

### Audio no se genera
1. Verifica logs de Edge Function
2. Confirma que `ELEVENLABS_API_KEY` es válida
3. Revisa límites de uso

### Webhook no se procesa
1. Verifica que la URL del webhook sea correcta
2. Revisa logs para errores de firma
3. Confirma que los eventos están suscritos

## Próximos Pasos

1. Ejecutar migraciones de base de datos
2. Desplegar Edge Functions
3. Configurar variables de entorno
4. Configurar webhooks en ElevenLabs
5. Realizar pruebas de integración
6. Migrar datos existentes
7. Implementar frontend
