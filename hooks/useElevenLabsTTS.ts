// hooks/useElevenLabsTTS.ts
// Hook personalizado para el sistema TTS de ElevenLabs

import { useState, useCallback } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

interface TTSOptions {
  voice_id?: string
  voice_settings?: {
    stability?: number
    similarity_boost?: number
  }
  model_id?: string
}

interface TTSResult {
  audioUrl: string | null
  audioSource: 'cache' | 'generated' | null
  processingTime: string | null
  requestHash: string | null
}

interface BatchResult {
  batchJobId: string
  totalChunks: number
  status: 'batch_processing' | 'processing_deferred'
  message: string
}

export function useElevenLabsTTS() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<{
    current: number
    total: number
  } | null>(null)

  const generateSpeech = useCallback(async (
    text: string, 
    options: TTSOptions = {}
  ): Promise<TTSResult | BatchResult | null> => {
    if (!text.trim()) {
      setError('El texto es requerido')
      return null
    }

    setLoading(true)
    setError(null)
    setProgress(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Usuario no autenticado')
      }

      const requestBody = {
        text: text.trim(),
        voice_id: options.voice_id || '21m00Tcm4TlvDq8ikWAM',
        voice_settings: options.voice_settings || {
          stability: 0.5,
          similarity_boost: 0.75
        },
        model_id: options.model_id || 'eleven_multilingual_v2'
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      )

      // Extraer headers útiles
      const audioSource = response.headers.get('X-Audio-Source') as 'cache' | 'generated' | null
      const processingTime = response.headers.get('X-Processing-Time')
      const requestHash = response.headers.get('X-Request-Hash')

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error HTTP ${response.status}`)
      }

      // Verificar si es respuesta JSON (batch processing)
      const contentType = response.headers.get('Content-Type')
      if (contentType?.includes('application/json')) {
        const batchResponse = await response.json()
        
        if (batchResponse.status === 'batch_processing') {
          return {
            batchJobId: batchResponse.batch_job_id,
            totalChunks: batchResponse.total_chunks,
            status: 'batch_processing',
            message: batchResponse.message
          }
        } else if (batchResponse.status === 'processing_deferred') {
          return {
            batchJobId: batchResponse.request_hash,
            totalChunks: 1,
            status: 'processing_deferred',
            message: batchResponse.message
          }
        }
      }

      // Procesar respuesta de audio
      const audioBlob = await response.blob()
      const audioUrl = URL.createObjectURL(audioBlob)

      return {
        audioUrl,
        audioSource,
        processingTime,
        requestHash
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const generateSpeechWithRetry = useCallback(async (
    text: string,
    options: TTSOptions = {},
    maxRetries = 3
  ): Promise<TTSResult | BatchResult | null> => {
    let lastError: Error | null = null
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await generateSpeech(text, options)
        if (result) return result
      } catch (err) {
        lastError = err instanceof Error ? err : new Error('Error desconocido')
        
        if (attempt < maxRetries) {
          // Esperar antes de reintentar (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000
          await new Promise(resolve => setTimeout(resolve, delay))
          
          setError(`Intento ${attempt} falló, reintentando en ${delay/1000}s...`)
        }
      }
    }
    
    if (lastError) {
      setError(`Error después de ${maxRetries} intentos: ${lastError.message}`)
    }
    
    return null
  }, [generateSpeech])

  const checkBatchStatus = useCallback(async (batchJobId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('tts_batch_jobs')
        .select('*')
        .eq('id', batchJobId)
        .single()

      if (error) throw error

      setProgress({
        current: data.completed_chunks,
        total: data.total_chunks
      })

      return {
        status: data.status,
        completedChunks: data.completed_chunks,
        totalChunks: data.total_chunks,
        mergedAudioPath: data.merged_audio_path,
        completedAt: data.completed_at
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error verificando estado'
      setError(errorMessage)
      return null
    }
  }, [])

  const getAudioFromCache = useCallback(async (requestHash: string): Promise<string | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Usuario no autenticado')

      const { data, error } = await supabase
        .from('tts_requests')
        .select('audio_file_path')
        .eq('request_hash', requestHash)
        .eq('status', 'completed')
        .single()

      if (error || !data?.audio_file_path) return null

      const { data: signedUrl } = await supabase.storage
        .from('elevenlabs-audio')
        .createSignedUrl(data.audio_file_path, 3600)

      return signedUrl?.signedUrl || null

    } catch (err) {
      console.error('Error obteniendo audio desde cache:', err)
      return null
    }
  }, [])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const clearProgress = useCallback(() => {
    setProgress(null)
  }, [])

  return {
    generateSpeech,
    generateSpeechWithRetry,
    checkBatchStatus,
    getAudioFromCache,
    loading,
    error,
    progress,
    clearError,
    clearProgress
  }
}

export default useElevenLabsTTS
