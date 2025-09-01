// C:\Users\Usuario\Desktop\nuevo-repo\check-documents.js
// Ejemplos de uso del API de analytics para el dashboard

/**
 * EJEMPLOS DE USO: Dashboard Analytics API
 * 
 * Los siguientes endpoints están disponibles para obtener datos
 * de uso de agentes ElevenLabs en tu dashboard.
 */

const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const API_BASE = `${SUPABASE_URL}/functions/v1/agents-analytics`;

// Configuración de headers con autenticación
const getHeaders = (userToken) => ({
  'Authorization': `Bearer ${userToken}`,
  'Content-Type': 'application/json'
});

/**
 * 1. RESUMEN DEL DASHBOARD
 * Obtiene estadísticas generales del usuario actual
 */
export async function getDashboardSummary(userToken) {
  try {
    const response = await fetch(`${API_BASE}/summary`, {
      method: 'GET',
      headers: getHeaders(userToken)
    });
    
    const result = await response.json();
    
    /*
    Respuesta ejemplo:
    {
      "success": true,
      "data": {
        "current_month_calls": 156,
        "current_month_minutes": 234.5,
        "total_calls_all_time": 1420,
        "total_minutes_all_time": 2150.75,
        "active_agents": 3,
        "avg_call_duration_minutes": 1.51
      }
    }
    */
    
    return result.data;
  } catch (error) {
    console.error('Error fetching dashboard summary:', error);
    throw error;
  }
}\n\n/**\n * 2. DATOS MENSUALES PARA GRÁFICOS\n * Obtiene uso agregado por mes para crear gráficos de tendencias\n */\nexport async function getMonthlyUsage(userToken, options = {}) {\n  const { from, to } = options;\n  \n  const params = new URLSearchParams();\n  if (from) params.set('from', from); // Formato: YYYY-MM\n  if (to) params.set('to', to);       // Formato: YYYY-MM\n  \n  try {\n    const response = await fetch(`${API_BASE}/monthly?${params}`, {\n      method: 'GET',\n      headers: getHeaders(userToken)\n    });\n    \n    const result = await response.json();\n    \n    /*\n    Respuesta ejemplo:\n    {\n      \"success\": true,\n      \"data\": [\n        {\n          \"month_year\": \"2025-01-01\",\n          \"total_calls\": 156,\n          \"total_minutes\": 234.5,\n          \"avg_minutes\": 1.50,\n          \"unique_agents_used\": 3\n        },\n        {\n          \"month_year\": \"2024-12-01\",\n          \"total_calls\": 98,\n          \"total_minutes\": 167.2,\n          \"avg_minutes\": 1.71,\n          \"unique_agents_used\": 2\n        }\n      ]\n    }\n    */\n    \n    return result.data;\n  } catch (error) {\n    console.error('Error fetching monthly usage:', error);\n    throw error;\n  }\n}\n\n/**\n * 3. BREAKDOWN POR AGENTE\n * Obtiene uso detallado por agente para análisis específico\n */\nexport async function getAgentUsage(userToken, options = {}) {\n  const { agent_id, from, to } = options;\n  \n  const params = new URLSearchParams();\n  if (agent_id) params.set('agent_id', agent_id);\n  if (from) params.set('from', from);\n  if (to) params.set('to', to);\n  \n  try {\n    const response = await fetch(`${API_BASE}/agents?${params}`, {\n      method: 'GET',\n      headers: getHeaders(userToken)\n    });\n    \n    const result = await response.json();\n    \n    /*\n    Respuesta ejemplo:\n    {\n      \"success\": true,\n      \"data\": [\n        {\n          \"agent_id\": \"agent_abc123\",\n          \"agent_name\": \"Customer Support Agent\",\n          \"month_year\": \"2025-01-01\",\n          \"total_calls\": 89,\n          \"total_minutes\": 134.5,\n          \"avg_minutes\": 1.51\n        },\n        {\n          \"agent_id\": \"agent_def456\",\n          \"agent_name\": \"Sales Agent\",\n          \"month_year\": \"2025-01-01\",\n          \"total_calls\": 67,\n          \"total_minutes\": 100.0,\n          \"avg_minutes\": 1.49\n        }\n      ]\n    }\n    */\n    \n    return result.data;\n  } catch (error) {\n    console.error('Error fetching agent usage:', error);\n    throw error;\n  }\n}\n\n/**\n * 4. LLAMADAS RECIENTES\n * Obtiene lista de llamadas más recientes para tabla de actividad\n */\nexport async function getRecentCalls(userToken) {\n  try {\n    const response = await fetch(`${API_BASE}/recent`, {\n      method: 'GET',\n      headers: getHeaders(userToken)\n    });\n    \n    const result = await response.json();\n    \n    /*\n    Respuesta ejemplo:\n    {\n      \"success\": true,\n      \"data\": [\n        {\n          \"conversation_id\": \"conv_789\",\n          \"agent_id\": \"agent_abc123\",\n          \"agent_name\": \"Customer Support Agent\",\n          \"started_at\": \"2025-01-20T14:30:00Z\",\n          \"duration_seconds\": 95,\n          \"status\": \"done\"\n        }\n      ]\n    }\n    */\n    \n    return result.data;\n  } catch (error) {\n    console.error('Error fetching recent calls:', error);\n    throw error;\n  }\n}\n\n/**\n * EJEMPLO DE INTEGRACIÓN EN REACT/VUE\n */\nexport const DashboardExampleReact = `\nimport React, { useState, useEffect } from 'react';\nimport { getDashboardSummary, getMonthlyUsage, getAgentUsage } from './dashboard-api-examples';\n\nfunction AgentsDashboard() {\n  const [summary, setSummary] = useState(null);\n  const [monthlyData, setMonthlyData] = useState([]);\n  const [loading, setLoading] = useState(true);\n  \n  // Obtener token del usuario autenticado (Supabase)\n  const userToken = 'tu_user_token_aqui';\n  \n  useEffect(() => {\n    async function loadDashboardData() {\n      try {\n        setLoading(true);\n        \n        // Cargar datos en paralelo\n        const [summaryData, monthlyUsage] = await Promise.all([\n          getDashboardSummary(userToken),\n          getMonthlyUsage(userToken)\n        ]);\n        \n        setSummary(summaryData);\n        setMonthlyData(monthlyUsage);\n        \n      } catch (error) {\n        console.error('Error loading dashboard:', error);\n      } finally {\n        setLoading(false);\n      }\n    }\n    \n    loadDashboardData();\n  }, [userToken]);\n  \n  if (loading) return <div>Cargando...</div>;\n  \n  return (\n    <div className=\"agents-dashboard\">\n      <h1>Dashboard de Agentes</h1>\n      \n      {/* Tarjetas de resumen */}\n      <div className=\"summary-cards\">\n        <div className=\"card\">\n          <h3>Llamadas este mes</h3>\n          <p>{summary.current_month_calls}</p>\n        </div>\n        <div className=\"card\">\n          <h3>Minutos este mes</h3>\n          <p>{summary.current_month_minutes}</p>\n        </div>\n        <div className=\"card\">\n          <h3>Agentes activos</h3>\n          <p>{summary.active_agents}</p>\n        </div>\n      </div>\n      \n      {/* Gráfico de tendencias (usar Chart.js, Recharts, etc.) */}\n      <div className=\"chart-container\">\n        <h3>Uso mensual</h3>\n        {/* Aquí irían los gráficos usando monthlyData */}\n      </div>\n    </div>\n  );\n}\n\nexport default AgentsDashboard;\n`;\n\n/**\n * CONFIGURACIÓN DE CRON JOB PARA SINCRONIZACIÓN\n */\nexport const cronJobSetup = `\n// Ejemplo con Vercel Cron o similar\n// api/cron/sync-elevenlabs.js\n\nexport default async function handler(req, res) {\n  // Verificar que es una llamada de cron autorizada\n  if (req.headers.authorization !== \\`Bearer \\${process.env.CRON_SECRET}\\`) {\n    return res.status(401).json({ error: 'Unauthorized' });\n  }\n  \n  try {\n    const response = await fetch('https://tu-proyecto.supabase.co/functions/v1/sync-elevenlabs-data', {\n      method: 'POST',\n      headers: {\n        'Authorization': 'Bearer ' + process.env.SYNC_FUNCTION_SECRET,\n        'Content-Type': 'application/json'\n      },\n      body: JSON.stringify({})\n    });\n    \n    const result = await response.json();\n    \n    console.log('Sync completed:', result);\n    \n    // Enviar alerta si hay errores\n    if (result.errors > 0) {\n      // Implementar notificación (email, Slack, etc.)\n      console.warn('Sync had errors:', result.errors);\n    }\n    \n    res.status(200).json({ success: true, result });\n    \n  } catch (error) {\n    console.error('Cron sync failed:', error);\n    res.status(500).json({ error: 'Sync failed' });\n  }\n}\n\n// vercel.json\n{\n  \"crons\": [\n    {\n      \"path\": \"/api/cron/sync-elevenlabs\",\n      \"schedule\": \"*/30 * * * *\"\n    }\n  ]\n}\n`;\n\nconsole.log('Dashboard API examples loaded. Check the functions and React example above.');
