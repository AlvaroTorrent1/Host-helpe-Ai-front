// Supabase Edge Function: elevenlabs-webhook-v2
// Maneja webhooks de ElevenLabs con idempotencia y retry handling

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'content-type, x-elevenlabs-signature'
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    })
  }

  const startTime = Date.now()

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const body = await req.text()
    const signature = req.headers.get('X-ElevenLabs-Signature')
    const webhookSecret = Deno.env.get('ELEVENLABS_WEBHOOK_SECRET')
    
    // Verificar firma HMAC si está configurada
    if (signature && webhookSecret) {
      const encoder = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(webhookSecret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign', 'verify']
      )
      
      const expectedSignature = await crypto.subtle.sign(
        'HMAC',
        key,
        encoder.encode(body)
      )
      
      const expectedHex = 'sha256=' + Array.from(new Uint8Array(expectedSignature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
      
      if (signature !== expectedHex) {
        console.error('Invalid webhook signature')
        return new Response('Invalid signature', { 
          status: 401, 
          headers: corsHeaders 
        })
      }
    }

    const webhookData = JSON.parse(body)
    console.log(`Webhook event received: ${webhookData.type} (${webhookData.event_id || 'no-id'})`)

    // Implementar idempotencia usando event_id
    const eventId = webhookData.event_id || 
                   webhookData.data?.conversation_id || 
                   `${webhookData.type}_${Date.now()}`

    // Verificar si ya procesamos este evento
    const { data: existingEvent } = await supabase
      .from('elevenlabs_webhook_events')
      .select('id, processed_at')
      .eq('event_id', eventId)
      .single()

    if (existingEvent) {
      console.log(`Event ${eventId} already processed at ${existingEvent.processed_at}`)
      return new Response(
        JSON.stringify({ 
          status: 'already_processed',
          event_id: eventId,
          processed_at: existingEvent.processed_at
        }), 
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Registrar evento para idempotencia
    const { error: eventError } = await supabase
      .from('elevenlabs_webhook_events')
      .insert({
        event_id: eventId,
        event_type: webhookData.type,
        payload: webhookData
      })

    if (eventError && eventError.code !== '23505') {
      // Ignorar error de duplicado, pero loggear otros errores
      console.error('Error registering webhook event:', eventError)
    }

    // Procesar según tipo de evento
    try {
      switch (webhookData.type) {
        case 'post_call_transcription':
          await handlePostCallTranscription(supabase, webhookData)
          break

        case 'voice_created':
        case 'voice_updated':
          await handleVoiceEvent(supabase, webhookData)
          break

        case 'usage_updated':
          await handleUsageUpdate(supabase, webhookData)
          break

        case 'agent_created':
        case 'agent_updated':
          await handleAgentEvent(supabase, webhookData)
          break

        default:
          console.log(`Unhandled webhook type: ${webhookData.type}`)
      }

      // Marcar como procesado exitosamente
      await supabase
        .from('elevenlabs_webhook_events')
        .update({ 
          processed_at: new Date().toISOString(),
          retry_count: 0 
        })
        .eq('event_id', eventId)

    } catch (processingError) {
      console.error(`Error processing webhook ${eventId}:`, processingError)
      
      // Incrementar contador de reintentos
      await supabase
        .from('elevenlabs_webhook_events')
        .update({ 
          retry_count: existingEvent?.retry_count || 0 + 1,
          payload: {
            ...webhookData,
            last_error: processingError.message,
            last_error_at: new Date().toISOString()
          }
        })
        .eq('event_id', eventId)

      // Devolver error para que ElevenLabs reintente
      return new Response(
        JSON.stringify({ 
          error: 'Processing failed',
          event_id: eventId,
          message: processingError.message
        }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const processingTime = Date.now() - startTime
    console.log(`Webhook processed successfully in ${processingTime}ms`)

    return new Response(
      JSON.stringify({ 
        status: 'processed',
        event_id: eventId,
        processing_time: `${processingTime}ms`
      }), 
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ 
        error: 'Internal error',
        message: error.message
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})

// Handler para eventos de transcripción de llamadas
async function handlePostCallTranscription(supabase: any, webhookData: any) {
  const { conversation_id, agent_id, analysis, transcript, started_at, ended_at } = webhookData.data
  
  console.log(`Processing post_call_transcription for conversation ${conversation_id}`)

  // Buscar agente en nueva estructura
  const { data: agent, error: agentError } = await supabase
    .from('elevenlabs_agents')
    .select('id, user_id')
    .eq('agent_id', agent_id)
    .single()

  if (agentError || !agent) {
    // Si no existe el agente, intentar crearlo desde el webhook
    console.warn(`Agent ${agent_id} not found, attempting to create from webhook data`)
    
    // Buscar user_id desde conversaciones anteriores o mapeo legacy
    const { data: legacyMapping } = await supabase
      .from('agent_user_mapping')
      .select('user_id, agent_name')
      .eq('agent_id', agent_id)
      .single()

    if (!legacyMapping) {
      throw new Error(`No user mapping found for agent ${agent_id}`)
    }

    // Crear agente
    const { data: newAgent, error: createError } = await supabase
      .from('elevenlabs_agents')
      .insert({
        agent_id,
        user_id: legacyMapping.user_id,
        name: legacyMapping.agent_name || webhookData.data.agent_name || 'Unknown Agent'
      })
      .select()
      .single()

    if (createError) throw createError
    agent = newAgent
  }

  // Calcular duración con múltiples fuentes
  let duration = null
  
  // 1. Metadata (ElevenLabs principal)
  if (webhookData.data?.metadata?.call_duration_secs) {
    duration = webhookData.data.metadata.call_duration_secs
  }
  // 2. Analysis 
  else if (analysis?.duration_seconds) {
    duration = analysis.duration_seconds
  } else if (analysis?.call_duration_secs) {
    duration = analysis.call_duration_secs
  } 
  // 3. Transcript
  else if (transcript?.duration) {
    duration = Math.round(transcript.duration)
  } 
  // 4. Calcular desde timestamps
  else if (started_at && ended_at) {
    const start = new Date(started_at).getTime()
    const end = new Date(ended_at).getTime()
    duration = Math.round((end - start) / 1000)
  }

  // Validar duración
  if (!duration || duration < 0) {
    console.warn(`Invalid duration for conversation ${conversation_id}: ${duration}`)
    duration = 0
  }

  // Actualizar o crear conversación
  const conversationData = {
    conversation_id,
    agent_id: agent.id,
    user_id: agent.user_id,
    started_at: started_at || new Date().toISOString(),
    ended_at: ended_at || new Date().toISOString(),
    duration_seconds: duration,
    status: 'completed',
    transcript: transcript || null,
    analysis: analysis || null,
    metadata: webhookData.data.metadata || {},
    credits_used: Math.ceil(duration / 60),
    webhook_received_at: new Date().toISOString()
  }

  // Usar upsert para manejar duplicados
  const { error: conversationError } = await supabase
    .from('elevenlabs_conversations')
    .upsert(conversationData, {
      onConflict: 'conversation_id',
      ignoreDuplicates: false
    })

  if (conversationError) {
    throw new Error(`Failed to upsert conversation: ${conversationError.message}`)
  }

  // Actualizar uso mensual
  if (duration > 0) {
    const monthYear = new Date(started_at || new Date()).toISOString().slice(0, 7) + '-01'
    const { data: usageResult } = await supabase.rpc('increment_usage', {
      p_user_id: agent.user_id,
      p_month_year: monthYear,
      p_conversation_minutes: duration / 60,
      p_conversation_count: 1
    })

    if (usageResult && usageResult[0]?.exceeded_limits) {
      console.warn(`User ${agent.user_id} exceeded limits: ${usageResult[0].usage_percentage}%`)
      // Aquí podrías enviar una notificación o desactivar el agente
    }
  }

  console.log(`Successfully processed conversation ${conversation_id}: ${duration}s`)
}

// Handler para eventos de voz
async function handleVoiceEvent(supabase: any, webhookData: any) {
  const { voice_id, name, category, labels, description, preview_url } = webhookData.data
  
  console.log(`Processing voice event for ${voice_id}`)

  await supabase
    .from('elevenlabs_voices')
    .upsert({
      voice_id,
      name,
      category,
      labels: labels || {},
      description,
      preview_url,
      is_custom: true,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'voice_id'
    })
}

// Handler para actualizaciones de uso
async function handleUsageUpdate(supabase: any, webhookData: any) {
  const { user_id, usage_data } = webhookData.data
  
  console.log(`Processing usage update for user ${user_id}`)

  // Actualizar con datos reales de ElevenLabs
  const monthYear = new Date().toISOString().slice(0, 7) + '-01'
  
  await supabase
    .from('elevenlabs_usage')
    .upsert({
      user_id,
      month_year: monthYear,
      tts_characters_used: usage_data.tts_characters || 0,
      conversation_minutes_used: usage_data.conversation_minutes || 0,
      total_credits_used: usage_data.total_credits || 0,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,month_year'
    })
}

// Handler para eventos de agente
async function handleAgentEvent(supabase: any, webhookData: any) {
  const agentData = webhookData.data
  
  console.log(`Processing agent event for ${agentData.agent_id}`)

  // Buscar user_id asociado
  let userId = agentData.user_id
  
  if (!userId) {
    // Intentar obtener de mapeo existente
    const { data: mapping } = await supabase
      .from('agent_user_mapping')
      .select('user_id')
      .eq('agent_id', agentData.agent_id)
      .single()
    
    userId = mapping?.user_id
  }

  if (!userId) {
    console.error(`No user_id found for agent ${agentData.agent_id}`)
    return
  }

  await supabase
    .from('elevenlabs_agents')
    .upsert({
      agent_id: agentData.agent_id,
      user_id: userId,
      name: agentData.name || 'Unnamed Agent',
      description: agentData.description,
      voice_id: agentData.voice_id,
      first_message: agentData.first_message,
      system_prompt: agentData.system_prompt,
      language: agentData.language || 'es',
      config: agentData.config || {},
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'agent_id'
    })
}
