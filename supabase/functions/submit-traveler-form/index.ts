// supabase/functions/submit-traveler-form/index.ts
/**
 * Edge Function para enviar datos del formulario de viajeros
 * Permite a turistas (sin autenticación) completar el parte del viajero
 * Usa service_role para bypassear RLS y escribir en la BD
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// CORS headers para permitir requests desde el frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { token, travelerData } = await req.json();

    if (!token || !travelerData) {
      return new Response(
        JSON.stringify({ error: 'Token y datos del viajero son requeridos' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service_role (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // 1. Validate token and get request
    const { data: request, error: requestError } = await supabase
      .from('traveler_form_requests')
      .select('*')
      .eq('token', token)
      .single();

    if (requestError || !request) {
      console.error('Token validation error:', requestError);
      return new Response(
        JSON.stringify({ error: 'Token inválido o no encontrado' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 2. Check if expired
    if (new Date(request.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'El enlace ha expirado' }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Check if already completed
    if (request.status === 'completed') {
      return new Response(
        JSON.stringify({ error: 'Este formulario ya ha sido completado' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 4. Get client IP for audit trail (extract first IP if multiple)
    const forwardedFor = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    
    // x-forwarded-for puede contener múltiples IPs: "client, proxy1, proxy2"
    // Tomamos solo la primera (la del cliente)
    let clientIp = 'unknown';
    if (forwardedFor) {
      clientIp = forwardedFor.split(',')[0].trim();
    } else if (realIp) {
      clientIp = realIp.trim();
    }

    // 5. Insert traveler data
    const { data: insertedData, error: insertError } = await supabase
      .from('traveler_form_data')
      .insert({
        form_request_id: request.id,
        first_name: travelerData.first_name,
        last_name: travelerData.last_name,
        document_type: travelerData.document_type,
        document_number: travelerData.document_number,
        nationality: travelerData.nationality,
        birth_date: travelerData.birth_date,
        gender: travelerData.gender || null,
        email: travelerData.email,
        phone: travelerData.phone || null,
        address_street: travelerData.address_street,
        address_city: travelerData.address_city,
        address_postal_code: travelerData.address_postal_code,
        address_country: travelerData.address_country,
        address_additional: travelerData.address_additional || null,
        payment_method: travelerData.payment_method || null,
        payment_holder: travelerData.payment_holder || null,
        payment_identifier: travelerData.payment_identifier || null,
        payment_date: travelerData.payment_date || null,
        signature_data: travelerData.signature_data,
        consent_accepted: travelerData.consent_accepted || true,
        consent_ip_address: clientIp,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Insert error:', insertError);
      return new Response(
        JSON.stringify({ 
          error: 'Error al guardar los datos', 
          details: insertError.message 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 6. The trigger will automatically update the request status
    // No need to manually update it here

    console.log(`✅ Traveler data submitted for request ${request.id}`);

    // 7. Return success response
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Parte de viajero enviado exitosamente',
        data: {
          request_id: request.id,
          traveler_id: insertedData.id,
        },
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

