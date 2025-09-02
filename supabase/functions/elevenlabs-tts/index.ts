// Supabase Edge Function: elevenlabs-tts
// Maneja TTS con streaming, cache y chunking para textos largos

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
}

// Configuración
const MAX_CHUNK_SIZE = 1000 // Caracteres por chunk para evitar timeouts
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1'
const EXECUTION_TIMEOUT = 9000 // 9 segundos (dejando 1s de margen)

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const startTime = Date.now()

  try {
    // Inicializar Supabase con contexto de usuario
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { 
        global: { 
          headers: { Authorization: req.headers.get('Authorization')! } 
        } 
      }
    )

    // Verificar autenticación
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }), 
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Parsear request
    const { 
      text, 
      voice_id = "21m00Tcm4TlvDq8ikWAM", 
      voice_settings = { stability: 0.5, similarity_boost: 0.75 },
      model_id = "eleven_multilingual_v2"
    } = await req.json()
    
    if (!text || text.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Text is required' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verificar límites de uso antes de procesar
    const { data: canProcess } = await supabaseClient.rpc('check_usage_limits', {
      p_user_id: user.id,
      p_characters: text.length,
      p_minutes: 0
    })

    if (!canProcess) {
      return new Response(
        JSON.stringify({ error: 'Usage limit exceeded for this month' }), 
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generar hash para deduplicación
    const requestHash = await generateHash(`${text}:${voice_id}:${JSON.stringify(voice_settings)}`)
    
    // Verificar cache
    const { data: existingRequest } = await supabaseClient
      .from('tts_requests')
      .select('audio_file_path, status, chunk_info')
      .eq('request_hash', requestHash)
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .single()

    if (existingRequest?.audio_file_path) {
      // Devolver desde cache
      console.log('Serving from cache:', requestHash)
      
      const { data: signedUrl } = await supabaseClient.storage
        .from('elevenlabs-audio')
        .createSignedUrl(existingRequest.audio_file_path, 3600)

      if (signedUrl) {
        // Actualizar última fecha de acceso
        supabaseClient
          .from('tts_requests')
          .update({ last_accessed_at: new Date().toISOString() })
          .eq('request_hash', requestHash)
          .then(() => console.log('Updated last_accessed_at'))

        // Stream el audio existente
        const audioResponse = await fetch(signedUrl.signedUrl)
        return new Response(audioResponse.body, {
          headers: {
            ...corsHeaders,
            'Content-Type': 'audio/mpeg',
            'X-Audio-Source': 'cache',
            'X-Request-Hash': requestHash
          }
        })
      }
    }

    // Verificar si necesitamos chunking (texto > MAX_CHUNK_SIZE)
    if (text.length > MAX_CHUNK_SIZE) {
      console.log('Text too long, initiating batch processing')
      
      // Crear job de batch
      const chunks = splitTextIntoChunks(text, MAX_CHUNK_SIZE)
      const { data: batchJob, error: batchError } = await supabaseClient
        .from('tts_batch_jobs')
        .insert({
          user_id: user.id,
          original_text: text,
          chunks: chunks.map((chunk, i) => ({
            index: i,
            text: chunk,
            request_id: null
          })),
          total_chunks: chunks.length
        })
        .select()
        .single()

      if (batchError) throw batchError

      // Retornar respuesta indicando proceso batch
      return new Response(
        JSON.stringify({
          status: 'batch_processing',
          batch_job_id: batchJob.id,
          total_chunks: chunks.length,
          message: 'Text too long for real-time processing. Use batch status endpoint to check progress.'
        }),
        { 
          status: 202, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Procesar texto normal (< MAX_CHUNK_SIZE)
    
    // Crear registro de solicitud
    const { data: ttsRequest, error: insertError } = await supabaseClient
      .from('tts_requests')
      .insert({
        user_id: user.id,
        text,
        text_hash: await generateHash(text),
        voice_id,
        voice_settings,
        request_hash: requestHash,
        status: 'processing'
      })
      .select()
      .single()

    if (insertError && insertError.code !== '23505') {
      throw insertError
    }

    // Verificar tiempo restante
    const elapsedTime = Date.now() - startTime
    if (elapsedTime > EXECUTION_TIMEOUT - 2000) {
      // No hay suficiente tiempo, marcar para procesamiento async
      await supabaseClient
        .from('tts_requests')
        .update({ 
          status: 'pending',
          error_message: 'Deferred for async processing' 
        })
        .eq('request_hash', requestHash)

      return new Response(
        JSON.stringify({
          status: 'processing_deferred',
          request_hash: requestHash,
          message: 'Request queued for processing. Check status endpoint.'
        }),
        { 
          status: 202, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Llamar a ElevenLabs API
    const elevenLabsResponse = await fetch(
      `${ELEVENLABS_API_URL}/text-to-speech/${voice_id}/stream`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': Deno.env.get('ELEVENLABS_API_KEY')!
        },
        body: JSON.stringify({
          text,
          model_id,
          voice_settings
        })
      }
    )

    if (!elevenLabsResponse.ok) {
      const error = await elevenLabsResponse.text()
      throw new Error(`ElevenLabs API error: ${elevenLabsResponse.status} - ${error}`)
    }

    // Obtener el stream
    const audioStream = elevenLabsResponse.body
    if (!audioStream) {
      throw new Error('No audio stream received')
    }

    // Bifurcar stream
    const [responseStream, storageStream] = audioStream.tee()

    // Subir a storage en background
    const uploadPath = `${user.id}/${requestHash}.mp3`
    
    // Proceso de upload con retry
    const uploadWithRetry = async () => {
      let retries = 0
      const maxRetries = 3
      
      while (retries < maxRetries) {
        try {
          await uploadToStorage(
            supabaseClient,
            storageStream,
            uploadPath,
            requestHash,
            text.length
          )
          break
        } catch (error) {
          retries++
          console.error(`Upload attempt ${retries} failed:`, error)
          if (retries >= maxRetries) {
            // Marcar como fallido después de todos los reintentos
            await supabaseClient
              .from('tts_requests')
              .update({
                status: 'failed',
                error_message: `Upload failed after ${maxRetries} attempts: ${error.message}`,
                retry_count: retries
              })
              .eq('request_hash', requestHash)
          } else {
            // Esperar antes de reintentar (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, Math.pow(2, retries) * 1000))
          }
        }
      }
    }

    // Usar waitUntil si está disponible
    if (typeof globalThis.waitUntil === 'function') {
      globalThis.waitUntil(uploadWithRetry())
    } else {
      // Fallback: intentar upload pero sin bloquear respuesta
      uploadWithRetry().catch(console.error)
    }

    // Devolver stream al cliente
    return new Response(responseStream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'audio/mpeg',
        'X-Audio-Source': 'generated',
        'X-Request-Hash': requestHash,
        'X-Processing-Time': `${Date.now() - startTime}ms`
      }
    })

  } catch (error) {
    console.error('TTS Error:', error)
    
    // Determinar código de estado apropiado
    let status = 500
    let errorMessage = error.message

    if (error.message.includes('rate limit')) {
      status = 429
      errorMessage = 'Rate limit exceeded. Please try again later.'
    } else if (error.message.includes('Invalid API key')) {
      status = 401
      errorMessage = 'Invalid ElevenLabs API configuration'
    }

    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        processing_time: `${Date.now() - startTime}ms`
      }),
      { 
        status, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Función para generar hash SHA-256
async function generateHash(text: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Función para dividir texto en chunks inteligentes
function splitTextIntoChunks(text: string, maxChunkSize: number): string[] {
  const chunks: string[] = []
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
  
  let currentChunk = ''
  
  for (const sentence of sentences) {
    if ((currentChunk + sentence).length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim())
        currentChunk = sentence
      } else {
        // Sentencia individual muy larga, dividir por palabras
        const words = sentence.split(' ')
        let wordChunk = ''
        
        for (const word of words) {
          if ((wordChunk + ' ' + word).length > maxChunkSize) {
            chunks.push(wordChunk.trim())
            wordChunk = word
          } else {
            wordChunk += (wordChunk ? ' ' : '') + word
          }
        }
        
        if (wordChunk) {
          currentChunk = wordChunk
        }
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence
    }
  }
  
  if (currentChunk) {
    chunks.push(currentChunk.trim())
  }
  
  return chunks
}

// Función mejorada para subir audio a storage
async function uploadToStorage(
  supabase: any,
  stream: ReadableStream,
  path: string,
  requestHash: string,
  textLength: number
) {
  try {
    // Convertir stream a Uint8Array
    const reader = stream.getReader()
    const chunks: Uint8Array[] = []
    
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
    }
    
    // Combinar chunks
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    const audioData = new Uint8Array(totalLength)
    let position = 0
    
    for (const chunk of chunks) {
      audioData.set(chunk, position)
      position += chunk.length
    }
    
    // Subir a storage
    const { error: uploadError } = await supabase.storage
      .from('elevenlabs-audio')
      .upload(path, audioData, {
        contentType: 'audio/mpeg',
        upsert: true
      })

    if (uploadError) throw uploadError

    // Calcular duración aproximada (basado en bitrate típico de 128kbps)
    const durationSeconds = (totalLength * 8) / (128 * 1000)

    // Actualizar registro
    await supabase
      .from('tts_requests')
      .update({
        audio_file_path: path,
        audio_duration_seconds: durationSeconds,
        status: 'completed',
        processed_at: new Date().toISOString(),
        credits_used: Math.ceil(textLength / 1000),
        actual_characters_processed: textLength
      })
      .eq('request_hash', requestHash)

    // Actualizar uso mensual
    const monthYear = new Date().toISOString().slice(0, 7) + '-01'
    const { data: usageResult } = await supabase.rpc('increment_usage', {
      p_user_id: (await supabase.auth.getUser()).data.user.id,
      p_month_year: monthYear,
      p_tts_characters: textLength,
      p_tts_requests: 1
    })

    // Verificar si se excedieron límites
    if (usageResult && usageResult[0]?.exceeded_limits) {
      console.warn(`User ${(await supabase.auth.getUser()).data.user.id} exceeded limits: ${usageResult[0].usage_percentage}%`)
    }

    console.log(`Successfully uploaded audio: ${path} (${totalLength} bytes, ~${durationSeconds.toFixed(1)}s)`)

  } catch (error) {
    console.error('Upload error:', error)
    throw error
  }
}
