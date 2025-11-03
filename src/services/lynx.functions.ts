// src/services/lynx.functions.ts
/**
 * Servicio frontend para llamar a las Edge Functions de Lynx Check-in
 * 
 * IMPORTANTE: Este servicio solo hace llamadas a Edge Functions.
 * Nunca debe llamar directamente a la API de Lynx (la API Key es secreta).
 * 
 * Funciones disponibles:
 * - listLodgings: Obtiene lista de lodgings registrados
 * - registerLodging: Registra una nueva propiedad en SES Hospedajes
 */

import { supabase } from './supabase';

/**
 * Interface para respuesta de listado de lodgings
 */
export interface LynxLodging {
  id: string;
  accountId: string;
  authConnId: string;
  name: string;
  establishment: {
    name: string;
    type: string;
    address: string;
    city: string;
    province: string;
    country: string;
  };
}

/**
 * Interface para respuesta de registro de lodging
 */
export interface RegisterLodgingResponse {
  success: boolean;
  lodging?: {
    id: string;
    accountId: string;
    status: 'active' | 'pending_validation' | 'rejected';
    createdAt: string;
    sesConnection?: {
      authConnId: string;
      established: boolean;
    };
  };
  message?: string;
  error?: string;
  details?: string;
  field?: string;
}

/**
 * Obtiene la lista de lodgings registrados en Lynx Check-in
 * 
 * Llama a la Edge Function 'lynx-list-lodgings' que consulta
 * el endpoint GET /accounts/{accountId}/lodgings del proveedor.
 * 
 * @returns Array de lodgings o error
 */
export const listLodgings = async (): Promise<{
  success: boolean;
  lodgings?: LynxLodging[];
  error?: string;
}> => {
  try {
    // Llamar a la Edge Function
    const { data, error } = await supabase.functions.invoke('lynx-list-lodgings', {
      body: {},
    });

    if (error) {
      console.error('Error calling lynx-list-lodgings:', error);
      return {
        success: false,
        error: error.message || 'Error al obtener lodgings',
      };
    }

    return {
      success: true,
      lodgings: data?.lodgings || [],
    };
  } catch (error) {
    console.error('Exception in listLodgings:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido',
    };
  }
};

/**
 * Registra una propiedad en SES Hospedajes a través de Lynx Check-in
 * 
 * Llama a la Edge Function 'lynx-register-lodging' que:
 * 1. Obtiene los datos completos de la propiedad desde Supabase
 * 2. Valida que tenga todos los campos requeridos
 * 3. Transforma los datos al formato de la API de Lynx
 * 4. Llama al endpoint POST /accounts/{accountId}/lodgings
 * 5. Actualiza la propiedad con los IDs retornados
 * 6. Retorna el resultado
 * 
 * @param propertyId - UUID de la propiedad a registrar
 * @returns Respuesta con el lodging creado o error
 */
export const registerLodging = async (
  propertyId: string
): Promise<RegisterLodgingResponse> => {
  try {
    console.log(`📝 Registrando propiedad ${propertyId} en SES Hospedajes...`);

    // Llamar a la Edge Function
    const { data, error } = await supabase.functions.invoke('lynx-register-lodging', {
      body: { propertyId },
    });

    if (error) {
      console.error('Error calling lynx-register-lodging:', error);
      return {
        success: false,
        error: error.message || 'Error al registrar propiedad',
      };
    }

    // Manejar respuesta de error desde la Edge Function
    if (!data.success) {
      return {
        success: false,
        error: data.error,
        details: data.details,
        field: data.field,
      };
    }

    console.log('✅ Propiedad registrada exitosamente:', data.lodging);

    // Retornar respuesta exitosa
    return {
      success: true,
      lodging: data.lodging,
      message: data.message,
    };
  } catch (error) {
    console.error('Exception in registerLodging:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al registrar',
    };
  }
};

/**
 * Helper: Verifica si una propiedad tiene todos los datos necesarios para registrar
 * 
 * @param property - Objeto de propiedad a validar
 * @returns true si está lista para registrar, false si faltan datos
 */
export const isPropertyReadyToRegister = (property: any): boolean => {
  // Datos básicos
  if (!property.name || !property.address || !property.city || 
      !property.province || !property.postal_code) {
    return false;
  }

  // Datos de vivienda turística
  if (!property.tourism_license || !property.license_type || 
      !property.property_type || !property.max_guests || 
      !property.num_bedrooms || !property.num_bathrooms) {
    return false;
  }

  // Datos del propietario
  if (!property.owner_name || !property.owner_email || 
      !property.owner_phone || !property.owner_id_type || 
      !property.owner_id_number) {
    return false;
  }

  // Credenciales SES
  if (!property.ses_landlord_code || !property.ses_username || 
      !property.ses_api_password || !property.ses_establishment_code) {
    return false;
  }

  // No debe estar ya registrada
  if (property.lynx_lodging_id) {
    return false;
  }

  return true;
};

/**
 * Helper: Obtiene lista de campos faltantes para registrar
 * 
 * @param property - Objeto de propiedad a validar
 * @returns Array de nombres de campos faltantes
 */
export const getMissingFieldsForRegistration = (property: any): string[] => {
  const missing: string[] = [];

  // Datos básicos
  if (!property.name) missing.push('Nombre de la propiedad');
  if (!property.address) missing.push('Dirección');
  if (!property.city) missing.push('Ciudad');
  if (!property.province) missing.push('Provincia');
  if (!property.postal_code) missing.push('Código postal');

  // Datos de vivienda turística
  if (!property.tourism_license) missing.push('Licencia turística');
  if (!property.license_type) missing.push('Tipo de licencia');
  if (!property.property_type) missing.push('Tipo de propiedad');
  if (!property.max_guests) missing.push('Capacidad máxima');
  if (!property.num_bedrooms) missing.push('Número de habitaciones');
  if (!property.num_bathrooms) missing.push('Número de baños');

  // Datos del propietario
  if (!property.owner_name) missing.push('Nombre del propietario');
  if (!property.owner_email) missing.push('Email del propietario');
  if (!property.owner_phone) missing.push('Teléfono del propietario');
  if (!property.owner_id_type) missing.push('Tipo de documento del propietario');
  if (!property.owner_id_number) missing.push('Número de documento del propietario');

  // Credenciales SES
  if (!property.ses_landlord_code) missing.push('Código de arrendador SES');
  if (!property.ses_username) missing.push('Usuario SES');
  if (!property.ses_api_password) missing.push('Contraseña API SES');
  if (!property.ses_establishment_code) missing.push('Código de establecimiento SES');

  return missing;
};

