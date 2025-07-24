// supabase/functions/deletion-status/index.ts
// Data Deletion Status Checker
// Allows users to check the status of their data deletion request using confirmation code

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!

// Initialize Supabase client with anon key (read-only access)
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Status to emoji mapping for better UX
const statusEmojis: Record<string, string> = {
  'pending': '⏳',
  'in_progress': '🔄',
  'completed': '✅',
  'denied': '❌',
  'error': '⚠️'
}

// Status to color mapping for UI
const statusColors: Record<string, string> = {
  'pending': '#f59e0b',
  'in_progress': '#3b82f6', 
  'completed': '#10b981',
  'denied': '#ef4444',
  'error': '#f59e0b'
}

// Generate HTML response for human-readable status
function generateHtmlResponse(request: any): string {
  const status = request.status
  const emoji = statusEmojis[status] || '❓'
  const color = statusColors[status] || '#6b7280'
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Data Deletion Request Status - Host Helper AI</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 600px;
            margin: 40px auto;
            padding: 20px;
            background-color: #f9fafb;
            color: #374151;
            line-height: 1.6;
        }
        .container {
            background: white;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            margin-bottom: 32px;
        }
        .logo {
            font-size: 24px;
            font-weight: bold;
            color: #1f2937;
            margin-bottom: 8px;
        }
        .status-card {
            border: 2px solid ${color};
            border-radius: 8px;
            padding: 24px;
            margin: 24px 0;
            background-color: ${color}10;
        }
        .status-title {
            font-size: 20px;
            font-weight: bold;
            color: ${color};
            margin-bottom: 12px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        .status-description {
            font-size: 16px;
            margin-bottom: 16px;
        }
        .details {
            background-color: #f3f4f6;
            border-radius: 6px;
            padding: 16px;
            margin: 16px 0;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin: 8px 0;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 8px;
        }
        .detail-row:last-child {
            border-bottom: none;
            margin-bottom: 0;
            padding-bottom: 0;
        }
        .detail-label {
            font-weight: 600;
            color: #6b7280;
        }
        .detail-value {
            color: #1f2937;
        }
        .footer {
            text-align: center;
            margin-top: 32px;
            padding-top: 24px;
            border-top: 1px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
        }
        .contact-info {
            margin-top: 16px;
            padding: 16px;
            background-color: #f9fafb;
            border-radius: 6px;
        }
        .code {
            font-family: monospace;
            background-color: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🏠 Host Helper AI</div>
            <h1>Data Deletion Request Status</h1>
        </div>
        
        <div class="status-card">
            <div class="status-title">
                <span>${emoji}</span>
                <span>${status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}</span>
            </div>
            <div class="status-description">
                ${request.human_readable_status || 'Status information not available.'}
            </div>
        </div>
        
        <div class="details">
            <div class="detail-row">
                <span class="detail-label">Confirmation Code:</span>
                <span class="detail-value code">${request.confirmation_code}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Request Date:</span>
                <span class="detail-value">${new Date(request.request_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Source:</span>
                <span class="detail-value">${request.source === 'facebook_login' ? 'Facebook Login' : request.source.charAt(0).toUpperCase() + request.source.slice(1)}</span>
            </div>
            ${request.completion_date ? `
            <div class="detail-row">
                <span class="detail-label">Completed:</span>
                <span class="detail-value">${new Date(request.completion_date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
            </div>
            ` : ''}
            ${request.denial_reason ? `
            <div class="detail-row">
                <span class="detail-label">Denial Reason:</span>
                <span class="detail-value">${request.denial_reason}</span>
            </div>
            ` : ''}
        </div>
        
        ${request.status === 'completed' ? `
        <div style="background-color: #dcfce7; border: 1px solid #16a34a; border-radius: 6px; padding: 16px; margin: 16px 0;">
            <strong>✅ Data Deletion Completed</strong><br>
            Your personal data has been successfully removed from our systems in accordance with GDPR Article 17.
        </div>
        ` : ''}
        
        <div class="contact-info">
            <strong>Need assistance?</strong><br>
            Email: <a href="mailto:support@hosthelperai.com">support@hosthelperai.com</a><br>
            Phone: <a href="tel:+34687472327">+34 687472327</a><br>
            Include your confirmation code: <span class="code">${request.confirmation_code}</span>
        </div>
        
        <div class="footer">
            <p><strong>ITERATOR DATAWORKS S.L.</strong></p>
            <p>Avenida Imperio Argentina 7, portal 4, 4a, 29004 Málaga, España</p>
            <p>This status page complies with Meta/Facebook data deletion callback requirements.</p>
            <p>Last updated: ${new Date(request.updated_at).toLocaleDateString()}</p>
        </div>
    </div>
</body>
</html>`
}

// Main handler function
serve(async (req) => {
  // Set CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, { 
      status: 200, 
      headers: corsHeaders 
    })
  }

  // Only accept GET requests
  if (req.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }), 
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // Parse URL parameters
    const url = new URL(req.url)
    const confirmationCode = url.searchParams.get('code')
    const format = url.searchParams.get('format') || 'html' // 'html' or 'json'
    
    if (!confirmationCode) {
      const error = 'Missing confirmation code parameter. Please provide ?code=DEL-YYYY-XXXXXXXX'
      
      if (format === 'json') {
        return new Response(
          JSON.stringify({ error }), 
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      return new Response(
        `<html><body><h1>Error</h1><p>${error}</p></body></html>`,
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'text/html' } 
        }
      )
    }

    console.log('Looking up deletion request for code:', confirmationCode)

    // Query the deletion request
    const { data: request, error: queryError } = await supabase
      .from('data_deletion_requests')
      .select('*')
      .eq('confirmation_code', confirmationCode)
      .single()

    if (queryError || !request) {
      console.error('Query error:', queryError)
      
      const error = 'Deletion request not found. Please check your confirmation code and try again.'
      
      if (format === 'json') {
        return new Response(
          JSON.stringify({ 
            error,
            code: confirmationCode 
          }), 
          { 
            status: 404, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        )
      }
      
      return new Response(
        `<html><body><h1>Request Not Found</h1><p>${error}</p><p>Code: ${confirmationCode}</p></body></html>`,
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'text/html' } 
        }
      )
    }

    console.log('Found deletion request:', request.id, 'Status:', request.status)

    // Return JSON format for API consumers
    if (format === 'json') {
      return new Response(
        JSON.stringify({
          confirmation_code: request.confirmation_code,
          status: request.status,
          human_readable_status: request.human_readable_status,
          request_date: request.request_date,
          completion_date: request.completion_date,
          denial_reason: request.denial_reason,
          source: request.source
        }),
        { 
          status: 200, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Return HTML format for human viewing (default)
    const htmlResponse = generateHtmlResponse(request)
    
    return new Response(
      htmlResponse,
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' } 
      }
    )

  } catch (error) {
    console.error('Status checking error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: errorMessage
      }), 
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

/* 
Usage:

1. Human-readable status page (default):
   GET /functions/v1/deletion-status?code=DEL-2025-ABC123XY

2. JSON API response:
   GET /functions/v1/deletion-status?code=DEL-2025-ABC123XY&format=json

3. This endpoint is used by:
   - Meta's data deletion callback system
   - Users checking their request status
   - Customer support for status verification

The endpoint provides:
- Human-readable status explanations
- Request timeline information
- Contact information for support
- Compliance with Meta/Facebook requirements
*/ 