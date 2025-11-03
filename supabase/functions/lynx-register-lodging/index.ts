// supabase/functions/lynx-register-lodging/index.ts
/**
 * Edge Function para registrar un alojamiento (lodging) en Lynx Check-in
 * 
 * Esta función permite a los gestores registrar sus propiedades en el sistema
 * SES Hospedajes del Ministerio del Interior a través del proveedor Lynx.
 * 
 * Flujo:
 * 1. Verificar autenticación del usuario
 * 2. Obtener datos completos de la propiedad desde Supabase
 * 3. Validar que tiene todos los campos requeridos
 * 4. Transformar datos al formato de la API de Lynx
 * 5. Llamar al endpoint POST /accounts/{accountId}/lodgings
 * 6. Actualizar la propiedad con los IDs retornados
 * 7. Retornar resultado al frontend
 * 
 * Requiere autenticación (solo para gestores)
 * 
 * IMPORTANTE: Nunca mencionar "Lynx" al usuario. Siempre usar "SES Hospedajes".
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { registerLodging } from '../_shared/lynxCheckinService.ts';

// CORS headers - permitir requests desde el frontend
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
    // ========================================
    // 1. VERIFICAR AUTENTICACIÓN
    // ========================================
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

    // Obtener token del header Authorization
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No autorizado - falta token de autenticación' }),
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

    console.log(`📝 Registrando lodging para usuario ${user.id}`);

    // ========================================
    // 2. OBTENER PROPERTY ID DEL BODY
    // ========================================
    
    const body = await req.json();
    const { propertyId } = body;

    if (!propertyId) {
      return new Response(
        JSON.stringify({ 
          error: 'Falta propertyId en el request',
          details: 'Debe enviar { propertyId: "uuid" }' 
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================
    // 3. OBTENER DATOS DE LA PROPIEDAD
    // ========================================
    
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .eq('user_id', user.id) // Asegurar que el usuario es dueño
      .single();

    if (propertyError || !property) {
      console.error('❌ Error obteniendo propiedad:', propertyError);
      return new Response(
        JSON.stringify({ 
          error: 'Propiedad no encontrada',
          details: 'Verifica que la propiedad existe y te pertenece'
        }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================
    // 4. VALIDAR QUE NO ESTÉ YA REGISTRADA
    // ========================================
    
    if (property.lynx_lodging_id) {
      return new Response(
        JSON.stringify({ 
          error: 'Propiedad ya registrada',
          details: 'Esta propiedad ya está registrada en SES Hospedajes',
          lodgingId: property.lynx_lodging_id
        }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================
    // 5. VALIDAR CAMPOS REQUERIDOS
    // ========================================
    
    const missingFields: string[] = [];

    // Datos básicos de propiedad
    if (!property.name) missingFields.push('Nombre de la propiedad');
    if (!property.address) missingFields.push('Dirección');
    if (!property.city) missingFields.push('Ciudad');
    if (!property.province) missingFields.push('Provincia');
    if (!property.postal_code) missingFields.push('Código postal');
    
    // Datos de vivienda turística
    if (!property.tourism_license) missingFields.push('Licencia turística');
    if (!property.license_type) missingFields.push('Tipo de licencia');
    if (!property.property_type) missingFields.push('Tipo de propiedad');
    if (!property.max_guests) missingFields.push('Capacidad máxima');
    if (!property.num_bedrooms) missingFields.push('Número de habitaciones');
    if (!property.num_bathrooms) missingFields.push('Número de baños');
    
    // Datos del propietario
    if (!property.owner_name) missingFields.push('Nombre del propietario');
    if (!property.owner_email) missingFields.push('Email del propietario');
    if (!property.owner_phone) missingFields.push('Teléfono del propietario');
    if (!property.owner_id_type) missingFields.push('Tipo de documento del propietario');
    if (!property.owner_id_number) missingFields.push('Número de documento del propietario');
    
    // Credenciales SES
    if (!property.ses_landlord_code) missingFields.push('Código de arrendador SES');
    if (!property.ses_username) missingFields.push('Usuario SES');
    if (!property.ses_api_password) missingFields.push('Contraseña API SES');
    if (!property.ses_establishment_code) missingFields.push('Código de establecimiento SES');

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({ 
          error: 'Datos incompletos para registro',
          details: `Faltan los siguientes campos: ${missingFields.join(', ')}`,
          missingFields
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================
    // 6. OBTENER API KEY DE LYNX (OPCIONAL)
    // ========================================
    
    // La API de Lynx Partners NO requiere autenticación
    // Pasamos string vacío como placeholder ya que no se usa
    const lynxApiKey = Deno.env.get('LYNX_API_KEY') || '';

    // ========================================
    // 7. PREPARAR PAYLOAD PARA LYNX API
    // (Mapeo de campos de Host Helper → Lynx)
    // ========================================
    
    const lynxPayload = {
      property: {
        name: property.name,
        tourismLicense: property.tourism_license,
        licenseType: property.license_type,
        propertyType: property.property_type,
        address: {
          street: property.address,
          city: property.city,
          postalCode: property.postal_code,
          province: property.province,
          country: property.country || 'ES'
        },
        capacity: {
          maxGuests: property.max_guests,
          bedrooms: property.num_bedrooms,
          bathrooms: property.num_bathrooms
        }
      },
      owner: {
        name: property.owner_name,
        email: property.owner_email,
        phone: property.owner_phone,
        idType: property.owner_id_type,
        idNumber: property.owner_id_number
      },
      sesCredentials: {
        landlordCode: property.ses_landlord_code,
        username: property.ses_username,
        apiPassword: property.ses_api_password,
        establishmentCode: property.ses_establishment_code
      }
    };

    console.log(`📤 Enviando registro a Lynx para propiedad: ${property.name}`);

    // ========================================
    // 8. LLAMAR A LA API DE LYNX
    // ========================================
    
    const result = await registerLodging(lynxApiKey, lynxPayload);

    if (!result.success) {
      console.error('❌ Error registrando en Lynx:', result.error);
      return new Response(
        JSON.stringify({ 
          error: 'Error al registrar en SES Hospedajes',
          details: result.error,
          field: result.field
        }),
        { status: result.statusCode || 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ========================================
    // 9. ACTUALIZAR PROPIEDAD EN SUPABASE
    // ========================================
    
    const { error: updateError } = await supabase
      .from('properties')
      .update({
        lynx_lodging_id: result.lodging.id,
        lynx_account_id: result.lodging.accountId,
        lynx_authority_connection_id: result.lodging.sesConnection?.authConnId,
        lynx_lodging_status: result.lodging.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId);

    if (updateError) {
      console.error('⚠️ Lodging registrado pero error actualizando BD:', updateError);
      // No retornar error, el registro sí se hizo
    }

    console.log(`✅ Propiedad registrada exitosamente. Status: ${result.lodging.status}`);

    // ========================================
    // 10. RETORNAR RESPUESTA EXITOSA
    // ========================================
    
    return new Response(
      JSON.stringify({
        success: true,
        lodging: result.lodging,
        message: result.lodging.status === 'active' 
          ? 'Propiedad registrada exitosamente en SES Hospedajes'
          : 'Propiedad enviada. Pendiente de validación (24-48h)'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ Error inesperado en lynx-register-lodging:', error);
    return new Response(
      JSON.stringify({
        error: 'Error inesperado al registrar',
        details: error instanceof Error ? error.message : 'Error desconocido',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

