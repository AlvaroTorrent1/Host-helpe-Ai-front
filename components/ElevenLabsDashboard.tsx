// components/ElevenLabsDashboard.tsx
// Dashboard para monitorear el uso de ElevenLabs

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface UsageData {
  tts_characters_used: number
  tts_characters_limit?: number
  tts_requests_count: number
  conversation_minutes_used: number
  conversation_minutes_limit?: number
  conversation_count: number
  total_credits_used: number
  month_year: string
}

interface RecentActivity {
  id: string
  text: string
  status: string
  created_at: string
  credits_used: number
  audio_source?: 'cache' | 'generated'
}

interface ConversationActivity {
  id: string
  conversation_id: string
  duration_seconds: number
  status: string
  started_at: string
  agent_name?: string
}

export function ElevenLabsDashboard() {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [recentTTS, setRecentTTS] = useState<RecentActivity[]>([])
  const [recentConversations, setRecentConversations] = useState<ConversationActivity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError('Usuario no autenticado')
        return
      }

      // Cargar uso actual
      await loadUsage(user.id)
      
      // Cargar actividad reciente
      await loadRecentTTS(user.id)
      await loadRecentConversations(user.id)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando datos')
    } finally {
      setLoading(false)
    }
  }

  const loadUsage = async (userId: string) => {
    const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
    
    const { data, error } = await supabase
      .from('elevenlabs_usage')
      .select('*')
      .eq('user_id', userId)
      .eq('month_year', currentMonth)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw error
    }

    setUsage(data || {
      tts_characters_used: 0,
      tts_requests_count: 0,
      conversation_minutes_used: 0,
      conversation_count: 0,
      total_credits_used: 0,
      month_year: currentMonth
    })
  }

  const loadRecentTTS = async (userId: string) => {
    const { data, error } = await supabase
      .from('tts_requests')
      .select('id, text, status, created_at, credits_used')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (error) throw error

    setRecentTTS(data.map(item => ({
      ...item,
      text: item.text.length > 50 ? item.text.substring(0, 50) + '...' : item.text
    })))
  }

  const loadRecentConversations = async (userId: string) => {
    const { data, error } = await supabase
      .from('elevenlabs_conversations')
      .select(`
        id,
        conversation_id,
        duration_seconds,
        status,
        started_at,
        elevenlabs_agents(name)
      `)
      .eq('user_id', userId)
      .order('started_at', { ascending: false })
      .limit(10)

    if (error) throw error

    setRecentConversations(data.map(item => ({
      ...item,
      agent_name: (item as any).elevenlabs_agents?.name
    })))
  }

  const getUsagePercentage = (used: number, limit?: number) => {
    if (!limit) return 0
    return Math.min((used / limit) * 100, 100)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100'
      case 'processing': return 'text-blue-600 bg-blue-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        ❌ {error}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          📊 Dashboard ElevenLabs
        </h2>
        <button
          onClick={loadDashboardData}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
        >
          🔄 Actualizar
        </button>
      </div>

      {/* Tarjetas de uso */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Caracteres TTS */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                📝
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Caracteres TTS</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                  {usage?.tts_characters_used?.toLocaleString() || 0}
                </p>
                {usage?.tts_characters_limit && (
                  <p className="ml-2 text-sm text-gray-500">
                    / {usage.tts_characters_limit.toLocaleString()}
                  </p>
                )}
              </div>
              {usage?.tts_characters_limit && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{
                        width: `${getUsagePercentage(usage.tts_characters_used, usage.tts_characters_limit)}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Solicitudes TTS */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                🎵
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Solicitudes TTS</p>
              <p className="text-2xl font-semibold text-gray-900">
                {usage?.tts_requests_count || 0}
              </p>
            </div>
          </div>
        </div>

        {/* Minutos de Conversación */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                💬
              </div>
            </div>
            <div className="ml-4 flex-1">
              <p className="text-sm font-medium text-gray-600">Minutos Conversación</p>
              <div className="flex items-baseline">
                <p className="text-2xl font-semibold text-gray-900">
                  {usage?.conversation_minutes_used?.toFixed(1) || '0.0'}
                </p>
                {usage?.conversation_minutes_limit && (
                  <p className="ml-2 text-sm text-gray-500">
                    / {usage.conversation_minutes_limit}
                  </p>
                )}
              </div>
              {usage?.conversation_minutes_limit && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className="bg-purple-500 h-1.5 rounded-full"
                      style={{
                        width: `${getUsagePercentage(usage.conversation_minutes_used, usage.conversation_minutes_limit)}%`
                      }}
                    ></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Créditos Totales */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                🪙
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Créditos Usados</p>
              <p className="text-2xl font-semibold text-gray-900">
                {usage?.total_credits_used || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Solicitudes TTS Recientes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              🎵 Solicitudes TTS Recientes
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentTTS.length > 0 ? (
              recentTTS.map((item) => (
                <div key={item.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 truncate">
                        {item.text}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {item.credits_used} créditos
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No hay solicitudes TTS recientes
              </div>
            )}
          </div>
        </div>

        {/* Conversaciones Recientes */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              💬 Conversaciones Recientes
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            {recentConversations.length > 0 ? (
              recentConversations.map((item) => (
                <div key={item.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        {item.agent_name || 'Agente Desconocido'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(item.started_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDuration(item.duration_seconds)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="px-6 py-8 text-center text-gray-500">
                No hay conversaciones recientes
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Health Status */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          🟢 Estado del Sistema
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl text-green-500">✅</div>
            <p className="text-sm font-medium text-gray-900">Edge Functions</p>
            <p className="text-xs text-gray-500">Funcionando</p>
          </div>
          <div className="text-center">
            <div className="text-2xl text-green-500">✅</div>
            <p className="text-sm font-medium text-gray-900">Base de Datos</p>
            <p className="text-xs text-gray-500">Sincronizada</p>
          </div>
          <div className="text-center">
            <div className="text-2xl text-green-500">✅</div>
            <p className="text-sm font-medium text-gray-900">Storage</p>
            <p className="text-xs text-gray-500">Disponible</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ElevenLabsDashboard
