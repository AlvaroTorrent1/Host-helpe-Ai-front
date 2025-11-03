// supabase/functions/find-ses-property/index.ts
/**
 * Edge Function temporal para buscar la propiedad "ses" 
 * que está realmente conectada a SES Hospedajes
 * 
 * Esta función lista todos los lodgings disponibles en Lynx
 * y busca específicamente la propiedad de prueba "ses"
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { listLodgings, LynxLodging } from '../_shared/lynxCheckinService.ts';

// CORS headers para poder llamar desde el frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Manejar preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('🔍 Listando TODAS las propiedades en Lynx Check-in...');

    // Listar todos los lodgings disponibles
    const lodgings: LynxLodging[] = await listLodgings();

    console.log(`📋 Total lodgings encontrados: ${lodgings.length}`);

    // Buscar propiedades que empiecen con "ses" (case insensitive)
    const sesProperties = lodgings.filter(lodging => 
      lodging.name.toLowerCase().startsWith('ses')
    );

    console.log(`🔍 Propiedades que empiezan con "ses": ${sesProperties.length}`);

    // Retornar TODOS los lodgings para inspección manual
    return new Response(
      JSON.stringify({
        success: true,
        message: `✅ Listado completo: ${lodgings.length} propiedades encontradas`,
        totalCount: lodgings.length,
        sesPropertiesCount: sesProperties.length,
        sesProperties: sesProperties.map(l => ({
          id: l.id,
          name: l.name,
          authConnId: l.authConnId,
          establishment: l.establishment,
        })),
        allLodgings: lodgings.map(l => ({
          id: l.id,
          name: l.name,
          authConnId: l.authConnId,
          establishment: l.establishment,
        })),
        instructions: [
          '1. Revisa el array "sesProperties" para propiedades que empiezan con "ses"',
          '2. Si no hay ninguna, revisa "allLodgings" completo',
          '3. Busca manualmente la propiedad que te indicó el proveedor',
          '4. Copia su "id" para usarlo como lynx_lodging_id',
        ],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('❌ Error buscando propiedad ses:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido',
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

