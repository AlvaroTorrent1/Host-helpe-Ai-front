// supabase/functions/proxy-n8n-webhook/index.ts
// Proxy robusto para reenviar imágenes a n8n webhook - Actualizado Julio 2025
// Resuelve CORS y maneja FormData con archivos binarios correctamente

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const N8N_WEBHOOK_URL = 'https://hosthelperai.app.n8n.cloud/webhook/images'

// Headers CORS actualizados según estándares 2025
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-auth',
  'Access-Control-Max-Age': '86400', // 24 horas cache preflight
  // Nuevos headers requeridos en 2025 para FormData con binarios
  'Access-Control-Allow-Private-Network': 'true',
  'Cross-Origin-Resource-Policy': 'cross-origin',
  'Cross-Origin-Embedder-Policy': 'unsafe-none'
}

serve(async (req: Request) => {
  const startTime = Date.now()
  const requestId = crypto.randomUUID()
  
  console.log(`🚀 [${requestId}] Incoming request: ${req.method} from ${req.headers.get('origin') || 'unknown'}`)

  // Handle CORS preflight con logging detallado
  if (req.method === 'OPTIONS') {
    console.log(`✅ [${requestId}] Preflight request handled`)
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    })
  }

  // Solo aceptar POST
  if (req.method !== 'POST') {
    console.log(`❌ [${requestId}] Method not allowed: ${req.method}`)
    return new Response(
      JSON.stringify({ 
        error: 'Method not allowed',
        allowed: 'POST',
        received: req.method 
      }), 
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // Verificar Content-Type
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      console.warn(`⚠️ [${requestId}] Unexpected content-type: ${contentType}`)
    }

    console.log(`📥 [${requestId}] Parsing FormData...`)
    const formData = await req.formData()
    
    // Log detallado de lo que recibimos (sin datos sensibles)
    const entries = Array.from(formData.entries())
    const summary = {
      property_id: formData.get('property_id'),
      total_images: formData.get('total_images'),
      user_id: formData.get('user_id'),
      fields_count: entries.length,
      image_fields: entries.filter(([key]) => key.startsWith('image_')).length
    }
    
    console.log(`📊 [${requestId}] FormData summary:`, JSON.stringify(summary))

    // Validación básica
    if (!summary.property_id) {
      throw new Error('Missing required field: property_id')
    }

    // Preparar el reenvío a n8n
    console.log(`🔄 [${requestId}] Forwarding to n8n webhook: ${N8N_WEBHOOK_URL}`)
    
    // Crear nuevo FormData para asegurar compatibilidad
    const forwardFormData = new FormData()
    
    // Copiar todos los campos
    for (const [key, value] of entries) {
      forwardFormData.append(key, value)
    }

    // Hacer request a n8n con timeout y retry
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 60000) // 60s timeout

    let response: Response
    let retries = 0
    const maxRetries = 2

    while (retries <= maxRetries) {
      try {
        response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          body: forwardFormData,
          signal: controller.signal,
          // Headers mínimos - dejar que fetch maneje Content-Type para FormData
          headers: {
            'User-Agent': 'Supabase-Edge-Function/1.0',
            'X-Request-ID': requestId
          }
        })

        clearTimeout(timeoutId)
        break // Éxito, salir del loop

      } catch (error) {
        retries++
        if (retries > maxRetries || error.name === 'AbortError') {
          clearTimeout(timeoutId)
          throw error
        }
        console.log(`⚠️ [${requestId}] Retry ${retries}/${maxRetries} after error:`, error.message)
        await new Promise(resolve => setTimeout(resolve, 1000 * retries)) // Backoff
      }
    }

    const duration = Date.now() - startTime
    console.log(`📨 [${requestId}] n8n response: ${response!.status} ${response!.statusText} (${duration}ms)`)

    // Procesar respuesta de n8n
    let responseData: any
    const responseContentType = response!.headers.get('content-type') || ''
    
    try {
      if (responseContentType.includes('application/json')) {
        responseData = await response!.json()
      } else {
        const responseText = await response!.text()
        console.log(`📄 [${requestId}] Non-JSON response:`, responseText.substring(0, 200))
        
        // Crear respuesta estructurada
        responseData = {
          success: response!.ok,
          status: response!.status,
          message: response!.ok ? 'Images forwarded to n8n successfully' : `n8n returned ${response!.status}`,
          n8n_response: responseText,
          processed_images: [],
          request_id: requestId,
          duration_ms: duration
        }
      }
    } catch (parseError) {
      console.error(`❌ [${requestId}] Error parsing n8n response:`, parseError)
      responseData = {
        success: response!.ok,
        status: response!.status,
        message: 'Response parsing failed but request was sent',
        request_id: requestId,
        duration_ms: duration
      }
    }

    // Log final status
    console.log(`✅ [${requestId}] Request completed: success=${responseData.success}, duration=${duration}ms`)

    // Retornar respuesta al frontend
    return new Response(JSON.stringify(responseData), {
      status: response!.ok ? 200 : response!.status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'X-Request-ID': requestId,
        'X-Response-Time': `${duration}ms`
      },
    })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`❌ [${requestId}] Proxy error after ${duration}ms:`, error)
    
    // Determinar tipo de error y mensaje apropiado
    let errorMessage = 'Internal proxy error'
    let errorDetails = error instanceof Error ? error.message : 'Unknown error'
    let statusCode = 500

    if (error.name === 'AbortError') {
      errorMessage = 'Request timeout - n8n webhook took too long to respond'
      statusCode = 504
    } else if (errorDetails.includes('Failed to fetch')) {
      errorMessage = 'Could not connect to n8n webhook'
      statusCode = 502
    } else if (errorDetails.includes('property_id')) {
      errorMessage = 'Invalid request data'
      statusCode = 400
    }
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: errorMessage,
        details: errorDetails,
        request_id: requestId,
        duration_ms: duration,
        timestamp: new Date().toISOString()
      }), 
      { 
        status: statusCode, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Request-ID': requestId 
        } 
      }
    )
  }
}) 