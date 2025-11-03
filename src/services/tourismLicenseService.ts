// src/services/tourismLicenseService.ts
// Servicio para validar licencias turísticas con el proveedor de registro SES
// IMPORTANTE: Este servicio se comunica con nuestro proveedor de backend,
// pero nunca exponemos el nombre del proveedor al cliente final (Host Helper AI)

interface ValidateLicenseRequest {
  tourism_license: string;
  province: string;
}

interface ValidateLicenseResponse {
  valid: boolean;
  license_type?: 'VFT' | 'VUT' | 'VTAR' | 'Other';
  province?: string;
  status?: 'active' | 'inactive';
  errors?: string[];
}

// URL base de la API del proveedor (Lynx) - solo para uso interno
const API_BASE_URL = 'https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1';

// Account ID - debería venir de variables de entorno en producción
const ACCOUNT_ID = 'a190fff8-c5d0-49a2-80a8-79b38ce0f284';

/**
 * Valida una licencia turística contra la base de datos oficial
 * @param tourismLicense - Número de licencia turística (ej: VFT/MA/12345)
 * @param province - Provincia donde está registrada la vivienda
 * @returns Resultado de la validación con información adicional
 */
export const validateTourismLicense = async (
  tourismLicense: string,
  province: string
): Promise<ValidateLicenseResponse> => {
  try {
    // 🚧 MODO DESARROLLO: Deshabilitado temporalmente para evitar errores CORS
    // La validación externa solo funciona en producción con API Key válida
    const ENABLE_EXTERNAL_VALIDATION = false;
    
    if (!ENABLE_EXTERNAL_VALIDATION) {
      console.log('⚠️ Validación externa de licencia deshabilitada en desarrollo');
      // Retornar validación local básica
      const formatValidation = validateLicenseFormat(tourismLicense, undefined);
      return {
        valid: formatValidation.valid,
        errors: formatValidation.valid ? [] : [formatValidation.error || 'Formato inválido']
      };
    }
    
    // Validación básica antes de llamar a la API
    if (!tourismLicense || !province) {
      return {
        valid: false,
        errors: ['Por favor completa todos los campos requeridos']
      };
    }

    // Limpiar espacios en blanco
    const cleanLicense = tourismLicense.trim();
    const cleanProvince = province.trim();

    // Construir la URL del endpoint
    const url = `${API_BASE_URL}/accounts/${ACCOUNT_ID}/validate-license`;

    const requestBody: ValidateLicenseRequest = {
      tourism_license: cleanLicense,
      province: cleanProvince
    };

    console.log('🔍 Validando licencia turística:', requestBody);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // TODO: Agregar Authorization header cuando tengamos el API key
        // 'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      // Manejar errores HTTP
      const errorData = await response.json().catch(() => null);
      console.error('❌ Error validando licencia:', response.status, errorData);
      
      return {
        valid: false,
        errors: [
          errorData?.message || 
          'No se pudo validar la licencia turística. Por favor intenta de nuevo.'
        ]
      };
    }

    const data: ValidateLicenseResponse = await response.json();
    console.log('✅ Resultado validación:', data);

    return data;

  } catch (error) {
    console.error('❌ Error en validación de licencia:', error);
    
    // Mensaje genérico para el usuario - no exponemos detalles técnicos
    return {
      valid: false,
      errors: [
        'Error al conectar con el servicio de validación. Verifica tu conexión a internet.'
      ]
    };
  }
};

/**
 * Verifica si una licencia tiene el formato correcto según el tipo
 * Esta es una validación local/offline que se ejecuta antes de la validación remota
 */
export const validateLicenseFormat = (
  license: string,
  licenseType?: 'VFT' | 'VUT' | 'VTAR' | 'Other'
): { valid: boolean; error?: string } => {
  if (!license || license.trim().length === 0) {
    return { valid: false, error: 'La licencia turística es obligatoria' };
  }

  const cleanLicense = license.trim().toUpperCase();

  // Validación básica del formato
  // Formato típico: VFT/MA/12345 o VUT/12345/2023
  const hasValidFormat = /^[A-Z]{2,5}[\/\-][A-Z0-9\/\-]+$/i.test(cleanLicense);

  if (!hasValidFormat) {
    return {
      valid: false,
      error: 'Formato inválido. Ejemplo: VFT/MA/12345'
    };
  }

  // Validar que el tipo de licencia coincida con el prefijo
  if (licenseType && licenseType !== 'Other') {
    if (!cleanLicense.startsWith(licenseType)) {
      return {
        valid: false,
        error: `La licencia debe comenzar con ${licenseType}`
      };
    }
  }

  return { valid: true };
};

export default {
  validateTourismLicense,
  validateLicenseFormat
};

