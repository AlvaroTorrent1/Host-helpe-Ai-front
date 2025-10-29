// src/features/sesregistro/utils/logoBase64.ts
/**
 * Logo de Host Helper en formato base64 para incluir en PDFs
 * El logo se carga desde /public/imagenes/Logo_hosthelper_new.png
 */

/**
 * Obtiene el logo como base64 desde la carpeta public
 * @returns Promise con el logo en formato base64 (data:image/png;base64,...)
 */
export async function getLogoBase64(): Promise<string> {
  try {
    // Cargar la imagen desde la carpeta public
    const response = await fetch('/imagenes/Logo_hosthelper_new.png');
    
    if (!response.ok) {
      throw new Error('Error al cargar el logo');
    }
    
    // Convertir a blob
    const blob = await response.blob();
    
    // Convertir blob a base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Error al cargar logo:', error);
    // Retornar string vacío si falla
    return '';
  }
}

/**
 * Logo pre-cargado en base64 (cache)
 * Se carga una vez cuando se importa el módulo
 */
let cachedLogo: string | null = null;

/**
 * Obtiene el logo con cache
 * La primera vez lo carga, las siguientes usa el cache
 */
export async function getCachedLogoBase64(): Promise<string> {
  if (cachedLogo) {
    return cachedLogo;
  }
  
  cachedLogo = await getLogoBase64();
  return cachedLogo;
}

