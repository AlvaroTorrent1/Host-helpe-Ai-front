// C:\Users\Usuario\Desktop\nuevo-repo\supabase\functions\elevenlabs-webhook\index.ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { crypto } from 'https://deno.land/std@0.167.0/crypto/mod.ts'

Deno.serve(async (req) => {
  try {
    // CORS headers - Allow all origins for testing
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-elevenlabs-signature',
      'Access-Control-Allow-Methods': 'POST, OPTIONS'
    }

    if (req.method === 'OPTIONS') {
      return new Response(null, {
        status: 200,
        headers: corsHeaders
      })
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { 
        status: 405,
        headers: corsHeaders
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const body = await req.text()
    const webhookData = JSON.parse(body)

    console.log('Webhook received:', JSON.stringify(webhookData, null, 2))

    // For test requests, skip HMAC verification
    if (webhookData.type === 'test') {
      console.log('Test request received, skipping HMAC verification')
      return new Response('Test OK - CORS Fixed!', { 
        status: 200,
        headers: corsHeaders
      })
    }

    // Verify HMAC signature for real ElevenLabs requests
    const signature = req.headers.get('X-ElevenLabs-Signature')
    const webhookSecret = Deno.env.get('ELEVENLABS_WEBHOOK_SECRET')
    
    if (!signature || !webhookSecret) {
      console.error('Missing signature or webhook secret')
      return new Response('Unauthorized', { 
        status: 401,
        headers: corsHeaders
      })
    }

    // Verify HMAC
    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(webhookSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )

    const providedSignature = signature.replace('sha256=', '')
    const expectedSignature = Array.from(
      new Uint8Array(
        await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
      )
    ).map(b => b.toString(16).padStart(2, '0')).join('')

    if (providedSignature !== expectedSignature) {
      console.error('Invalid signature')
      return new Response('Invalid signature', { 
        status: 401,
        headers: corsHeaders
      })
    }

    // Process post_call_transcription event
    if (webhookData.type === 'post_call_transcription') {
      const { conversation_id, agent_id, analysis, transcript } = webhookData.data
      
      console.log('Processing post_call_transcription for:', conversation_id)

      // Extract duration from analysis or transcript
      let duration_seconds = null
      if (analysis?.duration_seconds) {
        duration_seconds = analysis.duration_seconds
      } else if (transcript?.duration) {
        duration_seconds = Math.round(transcript.duration)
      }

      if (!duration_seconds) {
        console.error('No duration found in webhook data')
        return new Response('No duration found', { 
          status: 400,
          headers: corsHeaders
        })
      }

      // Get user_id from agent mapping
      const { data: mapping, error: mappingError } = await supabase
        .from('agent_user_mapping')
        .select('user_id, agent_name')
        .eq('agent_id', agent_id)
        .single()

      if (mappingError || !mapping) {
        console.error('Agent mapping not found:', agent_id, mappingError)
        return new Response('Agent mapping not found', { 
          status: 404,
          headers: corsHeaders
        })
      }

      // Call upsert function
      const { error: upsertError } = await supabase.rpc('upsert_agent_call', {
        p_conversation_id: conversation_id,
        p_agent_id: agent_id,
        p_user_id: mapping.user_id,
        p_started_at: new Date(webhookData.data.started_at || new Date()).toISOString(),
        p_duration_seconds: duration_seconds,
        p_status: 'done',
        p_agent_name: mapping.agent_name,
        p_raw_metadata: webhookData
      })

      if (upsertError) {
        console.error('Error upserting call:', upsertError)
        return new Response('Database error', { 
          status: 500,
          headers: corsHeaders
        })
      }

      console.log(`Successfully processed call: ${conversation_id}, duration: ${duration_seconds}s`)
    }

    return new Response('OK', { 
      status: 200,
      headers: corsHeaders
    })
    
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal server error', { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
})
