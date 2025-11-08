// src/services/lynxCheckinService.ts
/**
 * Lynx Check-in API Service
 * Servicio para comunicarse con la API de Partners de Lynx Check-in
 * 
 * IMPORTANTE: Este servicio contiene métodos que solo deben llamarse desde
 * Edge Functions (server-side) porque requieren API Key secreta.
 */

// Configuración de la API de Lynx
const LYNX_API_URL = import.meta.env.VITE_LYNX_API_URL || 
  'https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1';
const LYNX_ACCOUNT_ID = import.meta.env.VITE_LYNX_ACCOUNT_ID || 
  'a190fff8-c5d0-49a2-80a8-79b38ce0f284';

/**
 * Interface para un alojamiento (lodging) en Lynx Check-in
 */
export interface LynxLodging {
  id: string;                    // UUID del lodging en Lynx
  accountId: string;             // ID de la cuenta en Lynx
  authConnId: string;            // ID de conexión de autorización
  name: string;                  // Nombre del alojamiento
  establishment: {
    name: string;                // Nombre del establecimiento
    type: string;                // Tipo (apartment, hotel, etc)
    address: string;             // Dirección completa
    city: string;                // Ciudad
    province: string;            // Provincia
    country: string;             // País (ISO code)
  };
}

/**
 * Interface para datos de viajero en formato Lynx
 */
export interface LynxTraveler {
  firstName: string;             // Nombre
  lastName: string;              // Apellidos (concatenados)
  documentType: string;          // DNI | NIE | PASSPORT
  documentNumber: string;        // Número de documento
  nationality: string;           // Nacionalidad (ISO Alpha-2)
  birthDate: string;             // Fecha de nacimiento (YYYY-MM-DD)
  gender: string;                // M | F | X
  email: string;                 // Email de contacto
  phone: string;                 // Teléfono con código de país
  address: {
    street: string;              // Calle y número
    city: string;                // Ciudad
    postalCode: string;          // Código postal
    country: string;             // País de residencia (ISO Alpha-2)
  };
}

/**
 * Interface para payload completo de envío a Lynx
 */
export interface LynxTravelerData {
  checkInDate: string;           // Fecha de entrada (YYYY-MM-DD)
  checkOutDate: string;          // Fecha de salida (YYYY-MM-DD)
  travelers: LynxTraveler[];     // Array de viajeros
  signature: string;             // Firma en base64 (data:image/png;base64,...)
  paymentMethod: string;         // CASH | CARD | TRANS
}

/**
 * Interface para respuesta de Lynx al enviar un parte
 */
export interface LynxSubmissionResponse {
  success: boolean;              // Indica si fue exitoso
  submissionId: string;          // ID de la submission en Lynx
  status: string;                // Estado (submitted, pending, error)
  submittedAt: string;           // Timestamp ISO 8601
  sesResponse?: {                // Respuesta del Ministerio (SES.hospedajes)
    partId: string;              // ID del parte en SES
    accepted: boolean;           // Si fue aceptado por el Ministerio
  };
  error?: string;                // Mensaje de error si success=false
}

/**
 * Clase principal del servicio Lynx Check-in
 */
class LynxCheckinService {
  /**
   * Lista todos los alojamientos registrados en Lynx para esta cuenta
   * 
   * ⚠️ SOLO LLAMAR DESDE EDGE FUNCTION - Requiere API Key secreta
   * 
   * @param apiKey - API Key de Lynx (debe estar en secrets de Supabase)
   * @returns Array de lodgings
   */
  async listLodgings(apiKey: string): Promise<LynxLodging[]> {
    try {
      const response = await fetch(
        `${LYNX_API_URL}/accounts/${LYNX_ACCOUNT_ID}/lodgings`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Lynx API error response:', errorText);
        throw new Error(`Lynx API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return data.lodgings || [];
    } catch (error) {
      console.error('Error fetching Lynx lodgings:', error);
      throw error;
    }
  }

  /**
   * Envía un parte de viajero a Lynx Check-in para transmisión al Ministerio
   * 
   * ⚠️ SOLO LLAMAR DESDE EDGE FUNCTION - Requiere API Key secreta
   * 
   * @param apiKey - API Key de Lynx
   * @param lodgingId - ID del lodging en Lynx
   * @param travelerData - Datos completos del parte de viajero
   * @returns Respuesta de Lynx con submissionId y status
   */
  async submitTravelerData(
    apiKey: string,
    lodgingId: string,
    travelerData: LynxTravelerData
  ): Promise<LynxSubmissionResponse> {
    try {
      // Validar que hay al menos un viajero
      if (!travelerData.travelers || travelerData.travelers.length === 0) {
        return {
          success: false,
          submissionId: '',
          status: 'error',
          submittedAt: new Date().toISOString(),
          error: 'No hay viajeros en el parte',
        };
      }

      // Llamar a la API de Lynx
      const response = await fetch(
        `${LYNX_API_URL}/accounts/${LYNX_ACCOUNT_ID}/lodgings/${lodgingId}/travelers`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(travelerData),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        console.error('Lynx submission error:', data);
        return {
          success: false,
          submissionId: '',
          status: 'error',
          submittedAt: new Date().toISOString(),
          error: data.message || data.error || 'Error al enviar a Lynx Check-in',
        };
      }

      // Respuesta exitosa
      return {
        success: true,
        submissionId: data.submissionId || data.id,
        status: data.status || 'submitted',
        submittedAt: data.submittedAt || data.createdAt || new Date().toISOString(),
        sesResponse: data.sesResponse,
      };
    } catch (error) {
      console.error('Error submitting to Lynx:', error);
      return {
        success: false,
        submissionId: '',
        status: 'error',
        submittedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Mapea datos de Host Helper (traveler_form_data) a formato Lynx
   * 
   * @param travelerFormData - Array de registros de traveler_form_data
   * @param checkInDate - Fecha de check-in (YYYY-MM-DD)
   * @param checkOutDate - Fecha de check-out (YYYY-MM-DD)
   * @param signatureData - Firma en base64
   * @param paymentMethod - Método de pago (CASH/CARD/TRANS)
   * @returns Payload listo para enviar a Lynx
   */
  mapHostHelperToLynx(
    travelerFormData: any[],
    checkInDate: string,
    checkOutDate: string,
    signatureData: string,
    paymentMethod: string
  ): LynxTravelerData {
    return {
      checkInDate,
      checkOutDate,
      // Mapear cada viajero al formato Lynx
      travelers: travelerFormData.map(t => ({
        firstName: t.first_name,
        lastName: t.last_name,
        documentType: t.document_type,
        documentNumber: t.document_number,
        nationality: t.nationality,
        birthDate: t.birth_date,
        // Mapear género: M/F/Other → M/F/X
        gender: t.gender === 'M' ? 'M' : t.gender === 'F' ? 'F' : 'X',
        email: t.email,
        phone: t.phone || '',
        address: {
          street: t.address_street,
          city: t.address_city,
          postalCode: t.address_postal_code,
          country: t.address_country,
        },
      })),
      signature: signatureData,
      paymentMethod: paymentMethod || 'CASH',
    };
  }

  /**
   * Valida que un payload cumpla con los requisitos de Lynx
   * 
   * @param payload - Datos a validar
   * @returns { valid: boolean, errors: string[] }
   */
  validatePayload(payload: LynxTravelerData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validar fechas
    if (!payload.checkInDate || !payload.checkOutDate) {
      errors.push('Fechas de check-in/out son obligatorias');
    }

    // Validar viajeros
    if (!payload.travelers || payload.travelers.length === 0) {
      errors.push('Debe haber al menos un viajero');
    }

    // Validar cada viajero
    payload.travelers?.forEach((traveler, index) => {
      if (!traveler.firstName) errors.push(`Viajero ${index + 1}: Falta nombre`);
      if (!traveler.lastName) errors.push(`Viajero ${index + 1}: Falta apellido`);
      if (!traveler.documentType) errors.push(`Viajero ${index + 1}: Falta tipo de documento`);
      if (!traveler.documentNumber) errors.push(`Viajero ${index + 1}: Falta número de documento`);
      if (!traveler.nationality) errors.push(`Viajero ${index + 1}: Falta nacionalidad`);
      if (!traveler.birthDate) errors.push(`Viajero ${index + 1}: Falta fecha de nacimiento`);
      if (!traveler.email) errors.push(`Viajero ${index + 1}: Falta email`);
      if (!traveler.address?.street) errors.push(`Viajero ${index + 1}: Falta dirección`);
      if (!traveler.address?.city) errors.push(`Viajero ${index + 1}: Falta ciudad`);
      if (!traveler.address?.country) errors.push(`Viajero ${index + 1}: Falta país`);
    });

    // Validar firma
    if (!payload.signature || !payload.signature.startsWith('data:image/')) {
      errors.push('Firma inválida o faltante');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Obtiene la URL base de la API (útil para debugging)
   */
  getApiUrl(): string {
    return LYNX_API_URL;
  }

  /**
   * Obtiene el Account ID configurado
   */
  getAccountId(): string {
    return LYNX_ACCOUNT_ID;
  }
}

// Exportar instancia singleton
export const lynxCheckinService = new LynxCheckinService();

// Exportar la clase para testing
export default LynxCheckinService;


















