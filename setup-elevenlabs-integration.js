// C:\Users\Usuario\Desktop\nuevo-repo\check-documents.js
// Setup script for ElevenLabs integration

/**
 * SETUP GUIDE: ElevenLabs Integration con Webhooks y Sincronización
 * 
 * Este script te guía para configurar la integración completa entre
 * ElevenLabs y tu dashboard para trackear uso de agentes.
 */

console.log(`
🚀 SETUP: ElevenLabs Integration
================================

✅ Completado:
1. Base de datos configurada (agent_calls, vistas, funciones)
2. Edge Functions deployadas:
   - elevenlabs-webhook: maneja webhooks en tiempo real
   - sync-elevenlabs-data: sincronización cada 30 min
3. Tabla de mapeo agentes-usuarios creada

📋 PASOS RESTANTES:

PASO 1: Configurar Variables de Entorno
---------------------------------------
Agrega estas variables a tu .env o Supabase:

ELEVENLABS_API_KEY=tu_api_key_aqui
ELEVENLABS_WEBHOOK_SECRET=tu_webhook_secret_aqui
SYNC_FUNCTION_SECRET=un_secret_para_proteger_sync
SUPABASE_URL=tu_supabase_url
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key

PASO 2: Configurar Webhook en ElevenLabs
----------------------------------------
1. Ve a: https://elevenlabs.io/app/conversational-ai/settings
2. Haz clic en "Add endpoint" en Webhook Endpoints
3. URL del webhook: https://tu-proyecto.supabase.co/functions/v1/elevenlabs-webhook
4. Selecciona evento: "post_call_transcription"
5. Método de autenticación: HMAC
6. Guarda el shared secret como ELEVENLABS_WEBHOOK_SECRET

PASO 3: Mapear Agentes a Usuarios
---------------------------------
Para cada agente de ElevenLabs, ejecuta:

INSERT INTO agent_user_mapping (agent_id, user_id, agent_name)
VALUES ('tu_agent_id_de_elevenlabs', 'uuid_del_usuario', 'Nombre del Agente');

PASO 4: Configurar Job de 30 Minutos
------------------------------------
Configura un cron job o servicio que llame:

POST https://tu-proyecto.supabase.co/functions/v1/sync-elevenlabs-data
Authorization: Bearer tu_SYNC_FUNCTION_SECRET
Content-Type: application/json

{}

PASO 5: Probar la Integración
-----------------------------
1. Haz una llamada de prueba con tu agente de ElevenLabs
2. Espera a que termine (webhook automático)
3. O ejecuta manualmente el sync:
   curl -X POST "https://tu-proyecto.supabase.co/functions/v1/sync-elevenlabs-data" \\
   -H "Authorization: Bearer tu_SYNC_FUNCTION_SECRET"

PASO 6: Verificar Datos
-----------------------
SELECT * FROM agent_calls;
SELECT * FROM user_monthly_usage;
SELECT * FROM agent_monthly_usage;

🎯 PRÓXIMOS PASOS:
- Crear endpoint para dashboard (/analytics/agents/usage)
- Implementar gráficos en frontend
- Configurar alertas si la sincronización falla

📚 URLs de Documentación:
- Post-call webhooks: https://elevenlabs.io/docs/conversational-ai/workflows/post-call-webhooks
- Conversations API: https://elevenlabs.io/docs/api-reference/conversations/list
`);

// Función de utilidad para insertar mapeo agente-usuario
export function insertAgentMapping(agentId, userId, agentName) {
  return {
    sql: `INSERT INTO agent_user_mapping (agent_id, user_id, agent_name) VALUES ($1, $2, $3);`,
    params: [agentId, userId, agentName]
  };
}

// Función de utilidad para probar sincronización manual
export async function testSync(supabaseUrl, syncSecret) {
  try {
    const response = await fetch(`${supabaseUrl}/functions/v1/sync-elevenlabs-data`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${syncSecret}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from_date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Últimas 24 horas
      })
    });
    
    const result = await response.json();
    console.log('Sync result:', result);
    return result;
  } catch (error) {
    console.error('Sync test failed:', error);
    throw error;
  }
}

// Configuración ejemplo de cron job (usando node-cron o similar)
export const cronJobExample = `
// Ejemplo con node-cron para ejecutar cada 30 minutos
const cron = require('node-cron');

cron.schedule('*/30 * * * *', async () => {
  console.log('Running ElevenLabs sync...');
  
  try {
    const response = await fetch('https://tu-proyecto.supabase.co/functions/v1/sync-elevenlabs-data', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.SYNC_FUNCTION_SECRET,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({})
    });
    
    const result = await response.json();
    console.log('Sync completed:', result);
    
    if (result.errors > 0) {
      console.warn('Sync had errors:', result.errors);
      // Enviar alerta si hay muchos errores
    }
  } catch (error) {
    console.error('Sync failed:', error);
    // Enviar alerta de fallo crítico
  }
});
`;

// Query ejemplo para dashboard
export const dashboardQueries = {
  // Minutos totales por usuario en el último mes
  userMonthlyMinutes: `
    SELECT 
      user_id,
      total_calls,
      total_minutes,
      avg_minutes,
      unique_agents_used
    FROM user_monthly_usage 
    WHERE month_year = date_trunc('month', NOW())::date
    AND user_id = $1;
  `,
  
  // Uso por agente en los últimos 3 meses
  agentUsageTrend: `
    SELECT 
      agent_id,
      agent_name,
      month_year,
      total_calls,
      total_minutes,
      avg_minutes
    FROM agent_monthly_usage 
    WHERE user_id = $1
    AND month_year >= date_trunc('month', NOW() - INTERVAL '2 months')::date
    ORDER BY month_year DESC, total_minutes DESC;
  `,
  
  // Estadísticas del dashboard
  dashboardStats: `
    SELECT * FROM get_user_dashboard_stats($1, 12);
  `
};

console.log('Setup script loaded. Import functions as needed.');
