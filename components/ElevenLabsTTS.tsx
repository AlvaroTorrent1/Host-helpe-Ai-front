// components/ElevenLabsTTS.tsx
// Componente React para el nuevo sistema TTS con ElevenLabs

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface Voice {
  voice_id: string
  name: string
  category: string
  description?: string
  is_custom: boolean
}

interface TTSResponse {
  status: string
  batch_job_id?: string
  total_chunks?: number
  request_hash?: string
  message?: string
}

export function ElevenLabsTTS() {
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('21m00Tcm4TlvDq8ikWAM')
  const [voices, setVoices] = useState<Voice[]>([])
  const [loading, setLoading] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [audioSource, setAudioSource] = useState<'cache' | 'generated' | null>(null)
  const [processingTime, setProcessingTime] = useState<string | null>(null)
  const [usage, setUsage] = useState<any>(null)

  // Cargar voces disponibles
  useEffect(() => {
    loadVoices()
    loadUsage()
  }, [])

  const loadVoices = async () => {
    try {
      const { data, error } = await supabase
        .from('elevenlabs_voices')
        .select('voice_id, name, category, description, is_custom')
        .eq('is_active', true)
        .order('is_custom', { ascending: true })
        .order('name')

      if (error) throw error
      setVoices(data || [])
    } catch (err) {
      console.error('Error loading voices:', err)
    }
  }

  const loadUsage = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const currentMonth = new Date().toISOString().slice(0, 7) + '-01'
      const { data, error } = await supabase
        .from('elevenlabs_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .single()

      if (error && error.code !== 'PGRST116') throw error
      setUsage(data)
    } catch (err) {
      console.error('Error loading usage:', err)
    }
  }

  const generateSpeech = async () => {
    if (!text.trim()) {
      setError('Por favor ingresa algún texto')
      return
    }

    setLoading(true)
    setError(null)
    setAudioUrl(null)
    setAudioSource(null)
    setProcessingTime(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('No estás autenticado')
      }

      const response = await fetch('/api/elevenlabs/tts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: text,
          voice_id: selectedVoice,
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75
          }
        })
      })

      // Verificar headers de respuesta
      const source = response.headers.get('X-Audio-Source')
      const time = response.headers.get('X-Processing-Time')
      
      setAudioSource(source as 'cache' | 'generated')
      setProcessingTime(time)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error ${response.status}`)
      }

      // Verificar si es una respuesta de batch processing
      const contentType = response.headers.get('Content-Type')
      if (contentType?.includes('application/json')) {
        const batchResponse: TTSResponse = await response.json()
        
        if (batchResponse.status === 'batch_processing') {
          setError(`Texto muy largo. Se procesará en ${batchResponse.total_chunks} chunks. Revisa el estado en tu dashboard.`)
          return
        } else if (batchResponse.status === 'processing_deferred') {
          setError('Procesamiento diferido. El audio se generará en segundo plano.')
          return
        }
      }

      // Obtener audio como blob
      const audioBlob = await response.blob()
      const url = URL.createObjectURL(audioBlob)
      setAudioUrl(url)

      // Actualizar uso después de generar
      await loadUsage()

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const getUsagePercentage = () => {
    if (!usage) return 0
    
    const ttsPercentage = usage.tts_characters_limit 
      ? (usage.tts_characters_used / usage.tts_characters_limit) * 100
      : 0
    
    const convPercentage = usage.conversation_minutes_limit
      ? (usage.conversation_minutes_used / usage.conversation_minutes_limit) * 100
      : 0
    
    return Math.max(ttsPercentage, convPercentage)
  }

  const getUsageColor = () => {
    const percentage = getUsagePercentage()
    if (percentage >= 90) return 'text-red-500'
    if (percentage >= 70) return 'text-yellow-500'
    return 'text-green-500'
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        🎵 Text-to-Speech con ElevenLabs
      </h2>

      {/* Panel de uso */}
      {usage && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            📊 Uso del Mes Actual
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Caracteres TTS:</span>
              <span className={`font-medium ml-2 ${getUsageColor()}`}>
                {usage.tts_characters_used?.toLocaleString() || 0}
                {usage.tts_characters_limit && ` / ${usage.tts_characters_limit.toLocaleString()}`}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Solicitudes:</span>
              <span className="font-medium ml-2 text-blue-600">
                {usage.tts_requests_count || 0}
              </span>
            </div>
          </div>
          {usage.tts_characters_limit && (
            <div className="mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    getUsagePercentage() >= 90 ? 'bg-red-500' :
                    getUsagePercentage() >= 70 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(getUsagePercentage(), 100)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selector de voz */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          🎤 Selecciona una Voz:
        </label>
        <select
          value={selectedVoice}
          onChange={(e) => setSelectedVoice(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {voices.map((voice) => (
            <option key={voice.voice_id} value={voice.voice_id}>
              {voice.name} ({voice.category})
              {voice.is_custom && ' - Personalizada'}
            </option>
          ))}
        </select>
      </div>

      {/* Área de texto */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          📝 Texto a Convertir:
        </label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escribe aquí el texto que quieres convertir en audio..."
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          maxLength={5000}
        />
        <div className="text-right text-xs text-gray-500 mt-1">
          {text.length} / 5000 caracteres
          {text.length > 1000 && (
            <span className="ml-2 text-orange-500">
              (Se procesará en chunks)
            </span>
          )}
        </div>
      </div>

      {/* Botón de generar */}
      <button
        onClick={generateSpeech}
        disabled={loading || !text.trim()}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Generando Audio...
          </>
        ) : (
          '🎵 Generar Audio'
        )}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          ❌ {error}
        </div>
      )}

      {/* Resultado de audio */}
      {audioUrl && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-gray-800">🎵 Audio Generado</h3>
            <div className="flex items-center text-sm text-gray-600">
              {audioSource === 'cache' ? (
                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                  📦 Desde Cache
                </span>
              ) : (
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  ✨ Recién Generado
                </span>
              )}
              {processingTime && (
                <span className="ml-2 text-gray-500">
                  ⏱️ {processingTime}
                </span>
              )}
            </div>
          </div>
          <audio 
            controls 
            src={audioUrl} 
            className="w-full"
            onLoad={() => URL.revokeObjectURL(audioUrl)}
          />
          <div className="mt-2 text-xs text-gray-500">
            💡 El audio se guarda automáticamente en caché para futuras solicitudes idénticas
          </div>
        </div>
      )}

      {/* Información adicional */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-2">ℹ️ Información del Sistema</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Textos > 1000 caracteres se procesan automáticamente en chunks</li>
          <li>• El sistema usa cache inteligente para evitar regenerar audios idénticos</li>
          <li>• Se aplican límites de uso mensuales configurables</li>
          <li>• Soporte para voces personalizadas y predeterminadas</li>
        </ul>
      </div>
    </div>
  )
}

export default ElevenLabsTTS
