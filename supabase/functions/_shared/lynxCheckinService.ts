// supabase/functions/_shared/lynxCheckinService.ts
/**
 * Lynx Check-in API Service para Edge Functions
 * 
 * Version simplificada del servicio para usar en Deno/Edge Functions
 * No usar import.meta.env aquí - usar Deno.env.get()
 */

// Configuración de la API (usar variables de entorno de Deno)
export const LYNX_API_URL = 'https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1';
export const LYNX_ACCOUNT_ID = 'a190fff8-c5d0-49a2-80a8-79b38ce0f284';
// Authority Connection ID - Conexión con SES Hospedajes
// Usar el authConnId que funciona con los lodgings exitosos
const LYNX_AUTH_CONN_ID = '18b8c296-5ffb-4015-a5e9-8e0fb5050dc4';

// ✅ API Token para autenticación con Lynx Partners API
// Se obtiene desde Supabase Secrets: LYNX_PARTNERS_API_TOKEN
// Configurar con: supabase secrets set LYNX_PARTNERS_API_TOKEN="<token>"
const LYNX_API_TOKEN = Deno.env.get('LYNX_PARTNERS_API_TOKEN') || '';

// Log para debugging (solo mostrar si existe y primeros caracteres)
if (LYNX_API_TOKEN) {
  console.log(`✅ Token API encontrado: ${LYNX_API_TOKEN.substring(0, 8)}...`);
} else {
  console.error('❌ LYNX_PARTNERS_API_TOKEN no está configurado en Supabase Secrets');
}

/**
 * Interface para un alojamiento (lodging) en Lynx Check-in
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

export interface LynxTravelerAddress {
  address: string;
  municipalityCode?: string;
  municipalityName?: string;
  postalCode: string;
  country: string;
}

/**
 * Interface para datos de viajero en formato Lynx
 */
export interface LynxTraveler {
  name: string;
  surname1: string;
  surname2?: string;
  birthdate: string;
  email: string;
  phone: string;
  idType: string;
  idNum: string;
  idSupport: string; // Número de soporte del documento (obligatorio para adultos)
  nationality?: string;
  sex: string;
  address: LynxTravelerAddress;
  signature: string; // URL pública del archivo SVG (S3 URL según swagger de Lynx)
}

export interface LynxPayment {
  paymentMethodCode: string;
  paymentDate?: string;
}

/**
 * Interface para payload completo de envío a Lynx (Reports API)
 */
export interface LynxReportPayload {
  checkInDate: string;
  checkOutDate: string;
  numPeople: number;
  payment: LynxPayment;
  travelers: LynxTraveler[];
}

/**
 * Interface para respuesta de Lynx al enviar un parte
 */
export interface LynxSubmissionResponse {
  success: boolean;
  submissionId: string;
  status: string;
  submittedAt: string;
  sesResponse?: {
    partId: string;
    accepted: boolean;
  };
  error?: string;
}

/**
 * Lista todos los alojamientos registrados en Lynx para esta cuenta
 * ✅ REQUIERE AUTENTICACIÓN - Header X-PARTNERS-API-TOKEN
 */
export async function listLodgings(): Promise<LynxLodging[]> {
  try {
    const response = await fetch(
      `${LYNX_API_URL}/accounts/${LYNX_ACCOUNT_ID}/lodgings`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-PARTNERS-API-TOKEN': LYNX_API_TOKEN,
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
 * Envía un parte de viajero a Lynx Check-in
 * ✅ REQUIERE AUTENTICACIÓN - Header X-PARTNERS-API-TOKEN
 * Endpoint correcto: /reports (no /travelers)
 */
export async function submitTravelerData(
  lodgingId: string,
  travelerData: LynxReportPayload
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

    console.log(`📤 Enviando parte a Lynx para lodging ${lodgingId}...`);
    console.log(`📍 URL: ${LYNX_API_URL}/accounts/${LYNX_ACCOUNT_ID}/lodgings/${lodgingId}/reports`);

    // Llamar a la API de Lynx con autenticación
    // ✅ Header requerido: X-PARTNERS-API-TOKEN
    // ✅ Endpoint correcto: /reports (no /travelers)
    const response = await fetch(
      `${LYNX_API_URL}/accounts/${LYNX_ACCOUNT_ID}/lodgings/${lodgingId}/reports`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PARTNERS-API-TOKEN': LYNX_API_TOKEN,
        },
        body: JSON.stringify(travelerData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Lynx submission error:', data);
      return {
        success: false,
        submissionId: '',
        status: 'error',
        submittedAt: new Date().toISOString(),
        error: data.message || data.error || 'Error al enviar a Lynx Check-in',
      };
    }

    console.log('✅ Parte enviado exitosamente a Lynx');

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
 * Mapea datos de Host Helper (traveler_form_data) a formato Lynx Reports API
 * Formato basado en swagger: /partners-api/v1/.../reports
 * @param signatureUrl - URL pública del archivo SVG de la firma (requerido por Lynx API)
 */
export function mapHostHelperToLynx(
  travelerFormData: any[],
  checkInDate: string,
  checkOutDate: string,
  signatureUrl: string,
  paymentMethod: string
): LynxReportPayload {
  // Mapear método de pago: Host Helper → Lynx
  // Ajustado a enums de model.PaymentMethod
  const paymentMethodMap: Record<string, string> = {
    'CASH': 'EFECT',
    'CARD': 'TARJT',
    'TRANSFER': 'TRANS',
    'PLATFORM': 'PLATF',
    'DESTINATION': 'DESTI',
    'MOBILE': 'MOVIL',
    'OTHER': 'OTRO',
  };
  
  const lynxPaymentMethod = paymentMethodMap[paymentMethod] || 'EFECT';
  
  // Mapear tipo de documento: DNI → NIF para Lynx
  const mapDocumentType = (type: string) => {
    if (type === 'DNI') return 'NIF';
    return type; // NIE, PASSPORT, etc. se mantienen
  };

  // Mapear nacionalidad ISO-2 a ISO-3 (requerido por Lynx)
  // ES → ESP, AR → ARG, US → USA, etc.
  const mapNationalityToISO3 = (iso2: string): string => {
    const iso2to3: Record<string, string> = {
      'ES': 'ESP', 'AR': 'ARG', 'US': 'USA', 'GB': 'GBR', 'FR': 'FRA',
      'DE': 'DEU', 'IT': 'ITA', 'PT': 'PRT', 'BR': 'BRA', 'MX': 'MEX',
      'CO': 'COL', 'CL': 'CHL', 'PE': 'PER', 'VE': 'VEN', 'UY': 'URY',
      'CN': 'CHN', 'JP': 'JPN', 'IN': 'IND', 'RU': 'RUS', 'CA': 'CAN',
      // Agregar más según necesidad
    };
    
    const iso3 = iso2to3[iso2.toUpperCase()];
    if (!iso3) {
      console.warn(`⚠️ Nacionalidad ISO-2 '${iso2}' no mapeada. Usando '${iso2}' como fallback.`);
      return iso2; // Fallback: usar el código original
    }
    return iso3;
  };

  return {
    checkInDate: new Date(checkInDate).toISOString(),
    checkOutDate: new Date(checkOutDate).toISOString(),
    numPeople: travelerFormData.length,
    payment: {
      paymentMethodCode: lynxPaymentMethod,
    },
    travelers: travelerFormData.map((t: any) => {
      // Procesar apellidos: separar surname1 y surname2
      const lastNameParts = (t.last_name || '').trim().split(' ');
      const surname1 = lastNameParts[0] || 'Apellido1';
      const surname2Value = lastNameParts.slice(1).join(' ').trim();
      const surname2 = surname2Value.length > 0 ? surname2Value : undefined;
      
      // Procesar teléfono: asegurar formato internacional con +
      let phone = t.phone || '+34000000000';
      // Si el teléfono no empieza con +, asumir España (+34)
      if (!phone.startsWith('+')) {
        // Mantener solo dígitos
        phone = phone.replace(/[^0-9]/g, '');
        // Si empieza con 34, agregar solo +
        if (phone.startsWith('34')) {
          phone = '+' + phone;
        } else {
          // Si no tiene código de país, agregar +34
          phone = '+34' + phone;
        }
      } else {
        phone = '+' + phone.slice(1).replace(/[^0-9]/g, '');
      }

      // Limitar longitud del teléfono a 20 caracteres para prevenir rechazos
      if (phone.length > 20) {
        phone = phone.slice(0, 20);
      }

      const isSpain = (t.address_country || t.nationality || '').toUpperCase() === 'ES';
      const nationalityIso3 = t.nationality ? mapNationalityToISO3(t.nationality) : undefined;
      
      // Formatear código INE: eliminar espacios y limitar a 5 caracteres (código de municipio)
      // Formato correcto: "29067" (2 dígitos provincia + 3 dígitos municipio)
      // El swagger muestra "29 051 6" pero el formato estándar INE es sin espacios
      let municipalityCode = undefined;
      if (isSpain) {
        const rawCode = t.ine_code || '29067'; // Málaga por defecto
        // Eliminar espacios y quedarnos solo con los primeros 5 dígitos
        municipalityCode = rawCode.replace(/\s+/g, '').slice(0, 5);
      }
      
      return {
        name: t.first_name,
        surname1: surname1,
        surname2: mapDocumentType(t.document_type) === 'NIF' ? (surname2 || 'SinSegundoApellido') : surname2,
        birthdate: new Date(t.birth_date).toISOString(),
        email: t.email,
        phone: phone, // ✅ Con formato internacional +XX
        idType: mapDocumentType(t.document_type),
        idNum: t.document_number,
        idSupport: t.document_support_number, // ✅ Número de soporte del documento (obligatorio)
        nationality: nationalityIso3,
        sex: t.gender === 'M' ? 'H' : t.gender === 'F' ? 'M' : 'X', // H=Hombre, M=Mujer, X=Otro
        address: {
          address: t.address_street || 'Sin dirección',
          municipalityCode,
          municipalityName: !isSpain ? (t.address_city || undefined) : undefined,
          postalCode: t.address_postal_code || '00000',
          country: mapNationalityToISO3(t.address_country || t.nationality), // ✅ Convertir ISO-2 a ISO-3
        },
        signature: signatureUrl, // SVG simplificado en base64 o path interno
      };
    }),
  };
}

/**
 * Interface para payload de registro de lodging
 */
export interface LynxRegisterLodgingPayload {
  property: {
    name: string;
    tourismLicense: string;
    licenseType: 'VFT' | 'VUT' | 'VTAR' | 'Other';
    propertyType: 'apartment' | 'house' | 'villa' | 'room';
    address: {
      street: string;
      city: string;
      postalCode: string;
      province: string;
      country: string;
    };
    capacity: {
      maxGuests: number;
      bedrooms: number;
      bathrooms: number;
    };
  };
  owner: {
    name: string;
    email: string;
    phone: string;
    idType: 'DNI' | 'NIE' | 'PASSPORT';
    idNumber: string;
  };
  sesCredentials: {
    landlordCode: string;
    username: string;
    apiPassword: string;
    establishmentCode: string;
  };
}

/**
 * Interface para respuesta de registro de lodging
 */
export interface LynxRegisterLodgingResponse {
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
  error?: string;
  field?: string;
  statusCode?: number;
}

/**
 * Registra un nuevo lodging (alojamiento) en Lynx Check-in
 * 
 * Permite registrar una propiedad de Host Helper en el sistema SES Hospedajes
 * a través de Lynx Check-in. Crea la conexión de autoridad con el Ministerio.
 * 
 * @param apiKey - API Key de Lynx Check-in
 * @param payload - Datos completos de la propiedad, propietario y credenciales SES
 * @returns Respuesta con ID del lodging creado y estado de registro
 */
export async function registerLodging(
  apiKey: string,
  payload: LynxRegisterLodgingPayload
): Promise<LynxRegisterLodgingResponse> {
  try {
    console.log(`📤 Registrando lodging en Lynx: ${payload.property.name}`);

    // ✅ TRANSFORMAR payload al formato que espera la API de Lynx
    // La API espera un formato simple, no el complejo que recibimos
    const lynxPayload = {
      name: payload.property.name,
      authConnId: LYNX_AUTH_CONN_ID, // Usar la conexión configurada
      establishmentCode: payload.sesCredentials.establishmentCode,
      internet: true, // Asumir que todas las propiedades tienen internet
      numRooms: payload.property.capacity.bedrooms,
    };

    console.log('📋 Payload transformado para Lynx:', lynxPayload);

    // Verificar que tenemos el token antes de hacer la llamada
    if (!LYNX_API_TOKEN) {
      console.error('❌ No se puede llamar a Lynx API sin token');
      return {
        success: false,
        error: 'Token API no configurado. Configura LYNX_PARTNERS_API_TOKEN en Supabase Secrets',
        statusCode: 500,
      };
    }

    console.log('🔑 Enviando request con token API...');

    // Llamar al endpoint POST de Lynx con autenticación
    // ✅ Header requerido: X-PARTNERS-API-TOKEN
    const response = await fetch(
      `${LYNX_API_URL}/accounts/${LYNX_ACCOUNT_ID}/lodgings`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-PARTNERS-API-TOKEN': LYNX_API_TOKEN,
        },
        body: JSON.stringify(lynxPayload),
      }
    );

    const data = await response.json();

    // Manejar errores HTTP
    if (!response.ok) {
      console.error('❌ Lynx API error:', data);
      
      // Extraer mensaje de error más detallado
      let errorMessage = 'Error al registrar en SES Hospedajes';
      if (data.message) {
        errorMessage = data.message;
      } else if (data.error) {
        errorMessage = data.error;
      } else if (data.errors) {
        errorMessage = JSON.stringify(data.errors);
      }
      
      return {
        success: false,
        error: errorMessage,
        field: data.field,
        statusCode: response.status,
      };
    }

    // La API devuelve el lodging directamente en el response, no en data.lodging
    // Verificar si tenemos un ID
    if (!data.id) {
      console.error('❌ Respuesta de Lynx sin lodging ID:', data);
      return {
        success: false,
        error: 'Respuesta inválida del servidor - sin ID',
        statusCode: 500,
      };
    }

    console.log(`✅ Lodging registrado exitosamente. ID: ${data.id}`);

    // Retornar respuesta exitosa
    return {
      success: true,
      lodging: {
        id: data.id,
        accountId: data.accountId || LYNX_ACCOUNT_ID,
        status: 'active', // Si el POST fue exitoso, asumimos que está activo
        createdAt: data.createdAt || new Date().toISOString(),
        sesConnection: {
          authConnId: LYNX_AUTH_CONN_ID,
          established: true,
        },
      },
    };
  } catch (error) {
    console.error('❌ Error calling Lynx register lodging API:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error de conexión con el servidor',
      statusCode: 500,
    };
  }
}


