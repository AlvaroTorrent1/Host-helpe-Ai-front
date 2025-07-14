// File: supabase/functions/process-images-webhook/index.ts
// Edge Function to proxy image processing requests to n8n webhook

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImageBatchRequest {
  batch_id: string;
  property_id: string;
  images: Array<{
    media_file_id: string;
    filename: string;
    supabase_url: string;
    property_context: {
      property_id: string;
      property_name: string;
      property_type?: string;
      room_context?: string;
    };
  }>;
  processing_options: {
    generate_description: boolean;
    max_description_length: number;
    focus_areas: string[];
    language: string;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify authentication
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    // Get request body
    const requestData: ImageBatchRequest = await req.json()
    
    console.log('📥 Received image processing request:', {
      batch_id: requestData.batch_id,
      property_id: requestData.property_id,
      images_count: requestData.images.length
    })

    // Forward request to n8n webhook
    const n8nWebhookUrl = 'https://hosthelperai.app.n8n.cloud/webhook/images'
    
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add any required n8n authentication headers here
        'X-Source': 'supabase-edge-function',
        'X-Property-Id': requestData.property_id
      },
      body: JSON.stringify(requestData)
    })

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text()
      console.error('❌ n8n webhook error:', n8nResponse.status, errorText)
      
      return new Response(
        JSON.stringify({ 
          error: `n8n webhook error: ${n8nResponse.status}`,
          details: errorText,
          success: false
        }),
        { 
          status: n8nResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const n8nResult = await n8nResponse.json()
    
    console.log('✅ n8n processing completed:', {
      success: n8nResult.success,
      total_processed: n8nResult.total_processed,
      total_failed: n8nResult.total_failed
    })

    // Return the n8n response
    return new Response(
      JSON.stringify(n8nResult),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )

  } catch (error) {
    console.error('❌ Edge function error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error',
        success: false
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
}) 