// supabase/functions/proxy-n8n-webhook/index.ts
// Simple proxy to forward image processing requests to external n8n webhook
// Solves CORS issues by acting as server-to-server intermediary

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const N8N_WEBHOOK_URL = 'https://hosthelperai.app.n8n.cloud/webhook/images'

interface CorsHeaders {
  [key: string]: string
}

const corsHeaders: CorsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    console.log('🔄 Proxying request to n8n webhook:', N8N_WEBHOOK_URL)
    
    // Forward the exact same FormData to n8n webhook
    const formData = await req.formData()
    
    // Log some basic info (without sensitive data)
    const propertyId = formData.get('property_id')
    const totalImages = formData.get('total_images')
    console.log(`📤 Forwarding: property_id=${propertyId}, total_images=${totalImages}`)

    // Make server-to-server request to n8n webhook (no CORS issues)
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      body: formData,
      // Don't set Content-Type header - let fetch handle it for FormData
    })

    console.log(`📥 n8n webhook response: ${response.status} ${response.statusText}`)

    // Forward response back to frontend
    let responseData
    const contentType = response.headers.get('content-type')
    
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json()
    } else {
      // If n8n doesn't return JSON, create a success response
      const responseText = await response.text()
      responseData = {
        success: response.ok,
        message: response.ok ? 'Processing completed' : 'Processing failed',
        n8n_response: responseText,
        processed_images: []
      }
    }

    return new Response(JSON.stringify(responseData), {
      status: response.ok ? 200 : response.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    })

  } catch (error) {
    console.error('❌ Proxy error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: 'Proxy request failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
}) 