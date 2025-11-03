// supabase/functions/lynx-list-lodgings/index.ts
/**
 * Edge Function para listar alojamientos de Lynx Check-in
 * 
 * Esta función obtiene la lista de lodgings configurados en Lynx Check-in
 * para que los gestores puedan mapearlos con sus propiedades en Host Helper.
 * 
 * Requiere autenticación (solo para gestores)
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { listLodgings } from '../_shared/lynxCheckinService.ts';

// CORS headers
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
    // Verificar autenticación (requiere JWT válido)
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Obtener token del header Authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado - falta token' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Crear cliente de Supabase con el token del usuario
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    // Verificar que el usuario está autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'No autorizado - token inválido' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📋 Listando lodgings de Lynx para usuario ${user.id}`);

    // Obtener API Key de Lynx desde secrets
    const lynxApiKey = Deno.env.get('LYNX_API_KEY');
    if (!lynxApiKey) {
      console.error('❌ LYNX_API_KEY no está configurado en secrets');
      return new Response(
        JSON.stringify({ 
          error: 'Configuración incompleta',
          details: 'Lynx API Key no está configurado' 
        }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Llamar al servicio de Lynx para obtener lodgings
    const lodgings = await listLodgings(lynxApiKey);

    console.log(`✅ Se encontraron ${lodgings.length} lodgings en Lynx`);

    // Retornar lista de lodgings
    return new Response(
      JSON.stringify({
        success: true,
        lodgings,
        count: lodgings.length,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('❌ Error listando lodgings de Lynx:', error);
    return new Response(
      JSON.stringify({
        error: 'Error al obtener lodgings de Lynx',
        details: error instanceof Error ? error.message : 'Error desconocido',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});








