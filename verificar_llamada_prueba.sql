-- ====================================================
-- SCRIPT DE VERIFICACIÓN POST-LLAMADA
-- Ejecutar DESPUÉS de realizar la llamada de prueba
-- ====================================================

-- 1. ✅ VERIFICAR NUEVA CONVERSACIÓN (debe mostrar una más)
SELECT 
  '🆕 NUEVA CONVERSACIÓN' as verificacion,
  conversation_id,
  ROUND(duration_seconds/60.0, 1) as minutos_agregados,
  status,
  started_at::timestamp(0) as inicio,
  webhook_received_at::timestamp(0) as procesado
FROM elevenlabs_conversations
ORDER BY created_at DESC
LIMIT 1;

-- 2. 📊 VERIFICAR ACTUALIZACIÓN DE USO MENSUAL
SELECT 
  '📈 USO MENSUAL ACTUALIZADO' as verificacion,
  user_id,
  ROUND(conversation_minutes_used, 1) as minutos_totales_mes,
  conversation_count as llamadas_totales_mes,
  updated_at::timestamp(0) as ultima_actualizacion
FROM elevenlabs_usage
WHERE month_year = date_trunc('month', CURRENT_DATE)::date
ORDER BY updated_at DESC;

-- 3. 🔢 RESUMEN COMPARATIVO
SELECT 
  '📋 RESUMEN COMPARATIVO' as verificacion,
  'Total conversaciones' as metrica,
  COUNT(*) as valor_actual,
  '(era 12 antes de la prueba)' as nota
FROM elevenlabs_conversations

UNION ALL

SELECT 
  '',
  'Total minutos acumulados',
  ROUND(SUM(duration_seconds)/60.0)::int,
  '(era 73 antes de la prueba)'
FROM elevenlabs_conversations

UNION ALL

SELECT 
  '',
  'Minutos en uso mensual',
  ROUND(SUM(conversation_minutes_used))::int,
  '(era 76 antes de la prueba)'
FROM elevenlabs_usage;

-- 4. 🎯 DATOS PARA EL FRONTEND
SELECT 
  '🎨 DATOS FRONTEND' as verificacion,
  'Tiempo ahorrado (marcador)' as componente,
  ROUND(SUM(conversation_minutes_used))::int as valor_a_mostrar,
  'minutos (era 18 en la imagen)' as unidad
FROM elevenlabs_usage
WHERE month_year = date_trunc('month', CURRENT_DATE)::date

UNION ALL

SELECT 
  '',
  'Gráfica últimos 30 días',
  COUNT(*)::int,
  'conversaciones hoy'
FROM elevenlabs_conversations
WHERE DATE(started_at) = CURRENT_DATE;
