// supabase/functions/submit-traveler-form/index.ts
/**
 * Edge Function para enviar datos del formulario de viajeros
 * Permite a turistas (sin autenticación) completar el parte del viajero
 * Usa service_role para bypassear RLS y escribir en la BD
 * 
 * FLUJO:
 * 1. Guardar datos en nuestra BD (traveler_form_data)
 * 2. Si todos los viajeros están completos, enviar a Lynx Check-in
 * 3. Lynx transmite al Ministerio del Interior (SES.hospedajes)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { submitTravelerData, mapHostHelperToLynx, LYNX_ACCOUNT_ID } from '../_shared/lynxCheckinService.ts';

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
        document_support_number: travelerData.document_support_number || null, // ✅ Número de soporte del documento
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
        ine_code: travelerData.ine_code || null, // ✅ Código INE del municipio (solo España)
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

    // 7. Check if all travelers are completed, then send to Lynx
    // Get updated request to check num_travelers_completed
    const { data: updatedRequest } = await supabase
      .from('traveler_form_requests')
      .select('*')
      .eq('id', request.id)
      .single();

    // Only submit to Lynx if all travelers are completed AND not already sent
    const shouldSendToLynx = updatedRequest && 
      updatedRequest.num_travelers_completed >= updatedRequest.num_travelers_expected &&
      !updatedRequest.lynx_submission_id;

    if (shouldSendToLynx) {
      console.log(`🚀 All travelers completed. Sending to Lynx Check-in...`);

      // Get property to find lynx_lodging_id
      const { data: property } = await supabase
        .from('properties')
        .select('lynx_lodging_id, name')
        .eq('id', request.property_id)
        .single();

      if (!property?.lynx_lodging_id) {
        console.warn(`⚠️ Property ${request.property_id} (${property?.name}) no tiene lynx_lodging_id configurado`);
        console.warn('El parte NO se enviará a Lynx. Gestor debe configurar la propiedad primero.');
        // Don't fail the request - data is saved in our DB
        // Gestor can retry manually from dashboard
      } else {
        // Get all travelers for this form
        const { data: allTravelers } = await supabase
          .from('traveler_form_data')
          .select('*')
          .eq('form_request_id', request.id);

        if (allTravelers && allTravelers.length > 0) {
          // Lynx API es ABIERTA - no requiere API Key
          console.log('🌐 Lynx API abierta - enviando sin autenticación');
          
          try {
            // ✅ PASO 1: Subir firma a Supabase Storage (si existe)
            const signatureSvg = allTravelers[0].signature_data;
            const requestSlug = request.id.slice(0, 8);
            const baseSignaturePath = `account/${LYNX_ACCOUNT_ID}/lodging/${property.lynx_lodging_id}/report/${requestSlug}/signature`;
            const storagePath = `${baseSignaturePath}.svg`;

            // ✅ PASO 2: Preparar firma simplificada como SVG para Lynx
            let signatureForLynx = '';
            
            if (signatureSvg) {
              console.log(`📝 Procesando firma SVG para Lynx...`);

              // Simplificar SVG drásticamente para reducir tamaño
              const simplifiedSvg = signatureSvg
                .replace(/(\d+\.\d{2,})/g, (match) => parseFloat(match).toFixed(1))
                .replace(/\s+/g, ' ')
                .replace(/\s*=\s*/g, '=')
                .trim();

              console.log(`📏 Firma simplificada: ${simplifiedSvg.length} caracteres`);
              
              // Guardar también en Storage para nuestros registros
              const signatureBytes = new TextEncoder().encode(simplifiedSvg);
              await supabase.storage
                .from('traveler-signatures')
                .upload(storagePath, signatureBytes, {
                  contentType: 'image/svg+xml',
                  upsert: true,
                });

              // Enviar el SVG directamente a Lynx (no la URL)
              signatureForLynx = simplifiedSvg;
              console.log(`✅ Enviando firma como SVG (${simplifiedSvg.length} chars)`);
            } else {
              // Si no hay firma, usar un placeholder simple
              console.warn('⚠️ No se capturó la firma digital. Usando placeholder.');
              const placeholderSvg = '<svg width="120" height="40" xmlns="http://www.w3.org/2000/svg"><path d="M5 20 L115 20" stroke="#000" stroke-width="4" fill="none" stroke-linecap="round"/></svg>';
              signatureForLynx = placeholderSvg;
              
              // Guardar placeholder en Storage
              const placeholderBytes = new TextEncoder().encode(placeholderSvg);
              const placeholderPath = `${storagePath.replace('.svg', '')}-missing.svg`;
              await supabase.storage
                .from('traveler-signatures')
                .upload(placeholderPath, placeholderBytes, {
                  contentType: 'image/svg+xml',
                  upsert: true,
                });
            }

            const lynxPayload = mapHostHelperToLynx(
              allTravelers,
              request.check_in_date,
              request.check_out_date,
              signatureForLynx, // ✅ Enviar SVG directamente
              allTravelers[0].payment_method || 'CASH'
            );

            console.log(`📦 Payload preparado para ${allTravelers.length} viajero(s)`);

            // ✅ PASO 3: Enviar a Lynx (sin API key - API abierta)
            const lynxResponse = await submitTravelerData(
              property.lynx_lodging_id,
              lynxPayload
            );

            // Validar que lynxResponse no sea undefined
            if (!lynxResponse) {
              console.error('❌ submitTravelerData retornó undefined. Posible error en la importación o ejecución.');
              throw new Error('submitTravelerData retornó undefined');
            }

            if (lynxResponse.success) {
              console.log(`✅ Enviado a Lynx exitosamente: ${lynxResponse.submissionId}`);
              
              // Update request with Lynx response
              await supabase
                .from('traveler_form_requests')
                .update({
                  lynx_submission_id: lynxResponse.submissionId,
                  lynx_submitted_at: lynxResponse.submittedAt,
                  lynx_payload: lynxPayload,
                  lynx_response: lynxResponse,
                })
                .eq('id', request.id);
            } else {
              console.error(`❌ Error en respuesta de Lynx: ${lynxResponse.error}`);
              console.error(`📄 Respuesta completa:`, lynxResponse);
            }
          } catch (lynxError) {
            console.error('❌ Error sending to Lynx:', lynxError);
            // Don't fail the request - data is saved in our DB
          }
        }
      }
    }

    // 8. Return success response
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

