// src/features/sesregistro/utils/svgToPng.ts
/**
 * Utilidad para convertir firma SVG a PNG base64
 * Necesario para incluir firmas en PDFs generados con @react-pdf/renderer
 */

/**
 * Convierte un string SVG a imagen PNG en formato base64
 * Usa canvas del navegador para la conversión
 * 
 * @param svgString - String XML del SVG
 * @param width - Ancho deseado de la imagen PNG (opcional, por defecto usa el del SVG)
 * @param height - Alto deseado de la imagen PNG (opcional, por defecto usa el del SVG)
 * @returns Promise que resuelve con el PNG en formato base64 (data:image/png;base64,...)
 */
export async function svgToPngBase64(
  svgString: string,
  width?: number,
  height?: number
): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Crear un elemento SVG desde el string
      const parser = new DOMParser();
      const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
      const svgElement = svgDoc.documentElement;

      // Verificar que se parseó correctamente
      if (svgElement.tagName !== 'svg') {
        throw new Error('El string proporcionado no es un SVG válido');
      }

      // Obtener dimensiones del SVG original si no se especificaron
      const svgWidth = width || parseInt(svgElement.getAttribute('width') || '600', 10);
      const svgHeight = height || parseInt(svgElement.getAttribute('height') || '200', 10);

      // Crear un blob del SVG para poder cargarlo como imagen
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      // Crear un elemento Image para cargar el SVG
      const img = new Image();
      
      img.onload = () => {
        try {
          // Crear canvas con las dimensiones especificadas
          const canvas = document.createElement('canvas');
          canvas.width = svgWidth;
          canvas.height = svgHeight;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            throw new Error('No se pudo obtener el contexto 2D del canvas');
          }

          // Fondo blanco (importante para que la firma sea visible)
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, svgWidth, svgHeight);

          // Dibujar la imagen SVG en el canvas
          ctx.drawImage(img, 0, 0, svgWidth, svgHeight);

          // Convertir canvas a PNG base64
          const pngBase64 = canvas.toDataURL('image/png');

          // Limpiar URL temporal
          URL.revokeObjectURL(url);

          resolve(pngBase64);
        } catch (error) {
          URL.revokeObjectURL(url);
          reject(error);
        }
      };

      img.onerror = (error) => {
        URL.revokeObjectURL(url);
        reject(new Error('Error al cargar el SVG como imagen: ' + error));
      };

      // Cargar el SVG como imagen
      img.src = url;
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Verifica si un string es un SVG válido
 * Soporta: SVG string directo ("<svg...") y SVG en base64 data URL
 * @param str - String a verificar
 * @returns true si es un SVG válido
 */
export function isSVG(str: string): boolean {
  if (!str || typeof str !== 'string') return false;
  
  // Caso 1: SVG string directo
  if (str.trim().startsWith('<svg') && str.includes('</svg>')) {
    return true;
  }
  
  // Caso 2: SVG en base64 data URL (data:image/svg+xml;base64,...)
  if (str.startsWith('data:image/svg+xml;base64,')) {
    return true;
  }
  
  return false;
}

/**
 * Convierte firma a formato compatible con PDF
 * Si es SVG (string o base64), lo convierte a PNG base64
 * Si ya es base64 PNG/JPG, lo devuelve sin modificar
 * 
 * @param signatureData - Datos de la firma (SVG string, SVG base64, PNG base64, o JPG base64)
 * @returns Promise que resuelve con base64 PNG compatible con @react-pdf/renderer
 */
export async function prepareSignatureForPDF(signatureData: string | null | undefined): Promise<string | null> {
  // Si no hay firma, retornar null
  if (!signatureData) return null;

  try {
    // Caso 1: SVG en base64 data URL (data:image/svg+xml;base64,...)
    if (signatureData.startsWith('data:image/svg+xml;base64,')) {
      console.log('Decodificando firma SVG base64 y convirtiendo a PNG para PDF...');
      
      // Extraer el base64 (quitar el prefijo "data:image/svg+xml;base64,")
      const base64Data = signatureData.split(',')[1];
      
      // Decodificar base64 a SVG string
      const svgString = atob(base64Data);
      
      // Convertir SVG a PNG
      const pngBase64 = await svgToPngBase64(svgString);
      console.log('Firma SVG base64 convertida exitosamente a PNG');
      return pngBase64;
    }
    
    // Caso 2: SVG string directo ("<svg...")
    if (signatureData.trim().startsWith('<svg')) {
      console.log('Convirtiendo firma SVG string a PNG para PDF...');
      const pngBase64 = await svgToPngBase64(signatureData);
      console.log('Firma SVG string convertida exitosamente a PNG');
      return pngBase64;
    }

    // Caso 3: Ya es PNG/JPG base64, retornar tal cual
    if (signatureData.startsWith('data:image/png') || signatureData.startsWith('data:image/jpeg')) {
      console.log('Firma ya está en formato PNG/JPG base64, usando directamente');
      return signatureData;
    }

    // Formato no reconocido
    console.warn('Formato de firma no reconocido:', signatureData.substring(0, 50));
    return null;
  } catch (error) {
    console.error('Error al preparar firma para PDF:', error);
    return null;
  }
}

