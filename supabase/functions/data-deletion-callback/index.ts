// supabase/functions/data-deletion-callback/index.ts
// Meta/Facebook Data Deletion Request Callback
// Handles signed requests from Meta when users remove app or request data deletion

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const facebookAppSecret = Deno.env.get('FACEBOOK_APP_SECRET')! // Set this in Supabase secrets

// Initialize Supabase client with service role key
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Base64 URL decode function (equivalent to PHP's base64_url_decode)
function base64UrlDecode(input: string): Uint8Array {
  // Replace URL-safe characters with standard base64 characters
  const base64 = input.replace(/-/g, '+').replace(/_/g, '/')
  
  // Add padding if necessary
  const padLength = 4 - (base64.length % 4)
  const paddedBase64 = padLength < 4 ? base64 + '='.repeat(padLength) : base64
  
  // Decode base64
  const binaryString = atob(paddedBase64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

// HMAC-SHA256 function
async function hmacSha256(secret: string, message: string): Promise<Uint8Array> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message))
  return new Uint8Array(signature)
}

// Parse signed request from Meta
async function parseSignedRequest(signedRequest: string): Promise<any> {
  try {
    const [encodedSig, payload] = signedRequest.split('.', 2)
    
    if (!encodedSig || !payload) {
      throw new Error('Invalid signed request format')
    }
    
    // Decode signature and payload
    const sig = base64UrlDecode(encodedSig)
    const dataBytes = base64UrlDecode(payload)
    const dataString = new TextDecoder().decode(dataBytes)
    const data = JSON.parse(dataString)
    
    // Verify signature
    const expectedSig = await hmacSha256(facebookAppSecret, payload)
    
    // Compare signatures (constant-time comparison would be better for production)
    if (sig.length !== expectedSig.length) {
      throw new Error('Invalid signature')
    }
    
    for (let i = 0; i < sig.length; i++) {
      if (sig[i] !== expectedSig[i]) {
        throw new Error('Invalid signature')
      }
    }
    
    return data
  } catch (error) {
    console.error('Error parsing signed request:', error)
    throw new Error('Failed to parse signed request')
  }
}

// Main handler function
serve(async (req) => {
  // Set CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    })
  }

  // Only accept POST requests
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
    // Parse form data from Meta
    const formData = await req.formData()
    const signedRequest = formData.get('signed_request') as string
    
    if (!signedRequest) {
      return new Response(
        JSON.stringify({ error: 'Missing signed_request parameter' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Received signed request:', signedRequest.substring(0, 50) + '...')

    // Parse and verify the signed request
    const requestData = await parseSignedRequest(signedRequest)
    
    if (!requestData.user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing user_id in signed request' }), 
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Parsed request data:', {
      user_id: requestData.user_id,
      algorithm: requestData.algorithm,
      issued_at: requestData.issued_at
    })

    // Generate unique confirmation code
    const currentYear = new Date().getFullYear()
    const randomString = crypto.randomUUID().slice(0, 8).toUpperCase()
    const confirmationCode = `DEL-${currentYear}-${randomString}`
    
    // Create status URL for Meta response
    const statusUrl = `${supabaseUrl.replace('/rest/v1', '')}/functions/v1/deletion-status?code=${confirmationCode}`

    // Get client IP and User-Agent for audit
    const clientIP = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    const userAgent = req.headers.get('user-agent') || 'unknown'

    // Insert deletion request into database
    const { data: deletionRequest, error: insertError } = await supabase
      .from('data_deletion_requests')
      .insert({
        facebook_user_id: requestData.user_id,
        signed_request_payload: requestData,
        confirmation_code: confirmationCode,
        source: 'facebook_login',
        status: 'pending',
        status_url: statusUrl,
        ip_address: clientIP,
        user_agent: userAgent,
        additional_data: {
          algorithm: requestData.algorithm,
          issued_at: requestData.issued_at,
          expires: requestData.expires
        }
      })
      .select()
      .single()

    if (insertError) {
      console.error('Database insertion error:', insertError)
      return new Response(
        JSON.stringify({ error: 'Failed to process deletion request' }), 
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    console.log('Created deletion request:', deletionRequest.id)

    // TODO: Trigger actual data deletion process here
    // This could be a background job, webhook, or direct deletion
    // For now, we'll set it to in_progress after a delay
    setTimeout(async () => {
      await supabase
        .from('data_deletion_requests')
        .update({ status: 'in_progress' })
        .eq('id', deletionRequest.id)
    }, 5000)

    // Return response in format required by Meta
    const response = {
      url: statusUrl,
      confirmation_code: confirmationCode
    }

    console.log('Returning Meta response:', response)

    return new Response(
      JSON.stringify(response),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Callback processing error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

/* 
To set up this Edge Function:

1. Deploy to Supabase:
   supabase functions deploy data-deletion-callback

2. Set environment variable for Facebook App Secret:
   supabase secrets set FACEBOOK_APP_SECRET=your_app_secret_here

3. In Facebook App Dashboard, set Data Deletion Request URL to:
   https://your-project.supabase.co/functions/v1/data-deletion-callback

4. Test the callback using Meta's testing process:
   - Login with Facebook to your app
   - Go to Facebook Settings > Apps and Websites
   - Remove your app
   - Click "View Removed Apps and Websites"
   - Click "View" button for your app
   - Click "Send Request" to trigger the callback

The callback will:
- Verify the signed request from Meta
- Create a deletion request record
- Return the required JSON response with URL and confirmation code
- Initiate the data deletion process (to be implemented)
*/ 