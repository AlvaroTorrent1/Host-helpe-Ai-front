// supabase/functions/test-lynx-submission/index.ts
/**
 * Edge Function de prueba para enviar un parte de viajeros a Lynx Check-in
 * 
 * Endpoint: POST /test-lynx-submission
 * Body: { formRequestId: string }
 * 
 * Esta función:
 * 1. Busca el traveler_form_request por ID
 * 2. Obtiene todos los traveler_form_data asociados
 * 3. Mapea los datos al formato Lynx
 * 4. Envía el parte a Lynx Check-in API
 * 5. Actualiza el registro con el resultado
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import {
  submitTravelerData,
  mapHostHelperToLynx,
  type LynxReportPayload,
} from '../_shared/lynxCheckinService.ts';

// CORS headers para permitir llamadas desde localhost
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // 1. Parse request body
    const { formRequestId } = await req.json();

    if (!formRequestId) {
      return new Response(
        JSON.stringify({ error: 'formRequestId es requerido' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔍 Buscando traveler_form_request: ${formRequestId}`);

    // 2. Crear cliente de Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 3. Obtener traveler_form_request con property data
    const { data: request, error: requestError } = await supabase
      .from('traveler_form_requests')
      .select(`
        *,
        property:properties!inner(
          id,
          name,
          lynx_lodging_id,
          lynx_lodging_status
        )
      `)
      .eq('id', formRequestId)
      .single();

    if (requestError || !request) {
      console.error('❌ Error al buscar traveler_form_request:', requestError);
      return new Response(
        JSON.stringify({ error: 'No se encontró el traveler_form_request' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`✅ Request encontrado: ${request.property_name}`);

    // 4. Verificar que la propiedad tiene lynx_lodging_id
    const property = request.property as any;
    if (!property.lynx_lodging_id) {
      return new Response(
        JSON.stringify({ 
          error: 'La propiedad no tiene lynx_lodging_id configurado',
          property_name: property.name 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🏠 Propiedad: ${property.name} (Lynx ID: ${property.lynx_lodging_id})`);

    // 5. Obtener traveler_form_data asociados
    const { data: travelers, error: travelersError } = await supabase
      .from('traveler_form_data')
      .select('*')
      .eq('form_request_id', formRequestId);

    if (travelersError || !travelers || travelers.length === 0) {
      console.error('❌ Error al buscar traveler_form_data:', travelersError);
      return new Response(
        JSON.stringify({ error: 'No se encontraron datos de viajeros' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`👥 Viajeros encontrados: ${travelers.length}`);

    // 6. Subir firma a Supabase Storage y obtener URL pública
    // Por ahora usamos la firma en base64 directamente (Lynx acepta data URLs)
    const signatureUrl = travelers[0].signature_data;

    // 7. Mapear datos al formato Lynx
    const lynxPayload: LynxReportPayload = mapHostHelperToLynx(
      travelers,
      request.check_in_date,
      request.check_out_date,
      signatureUrl,
      travelers[0].payment_method || 'CARD'
    );

    console.log('📦 Payload mapeado para Lynx:', JSON.stringify(lynxPayload, null, 2));

    // 8. Enviar a Lynx Check-in
    console.log('📤 Enviando parte a Lynx...');
    const lynxResponse = await submitTravelerData(
      property.lynx_lodging_id,
      lynxPayload
    );

    console.log('📥 Respuesta de Lynx:', JSON.stringify(lynxResponse, null, 2));

    // 9. Actualizar traveler_form_request con resultado
    const updateData: any = {
      lynx_payload: lynxPayload,
      lynx_response: lynxResponse,
      updated_at: new Date().toISOString(),
    };

    if (lynxResponse.success) {
      updateData.lynx_submission_id = lynxResponse.submissionId;
      updateData.lynx_submitted_at = lynxResponse.submittedAt;
    }

    const { error: updateError } = await supabase
      .from('traveler_form_requests')
      .update(updateData)
      .eq('id', formRequestId);

    if (updateError) {
      console.error('⚠️ Error al actualizar traveler_form_request:', updateError);
    }

    // 10. Retornar respuesta
    return new Response(
      JSON.stringify({
        success: lynxResponse.success,
        message: lynxResponse.success 
          ? '✅ Parte enviado exitosamente a Lynx Check-in'
          : '❌ Error al enviar parte a Lynx Check-in',
        formRequestId,
        submissionId: lynxResponse.submissionId,
        lynxResponse,
        travelers: travelers.length,
      }),
      {
        status: lynxResponse.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error en test-lynx-submission:', error);
    return new Response(
      JSON.stringify({
        error: 'Error interno del servidor',
        details: error instanceof Error ? error.message : 'Error desconocido',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

