// src/utils/urlNormalization.ts
// Utilidades para normalización de URLs y prevención de duplicados

/**
 * Normaliza una URL para comparación consistente
 */
export const normalizeUrl = (url: string): string => {
  if (!url || typeof url !== 'string') return '';
  
  try {
    // Limpiar espacios y convertir a minúsculas
    let normalized = url.trim().toLowerCase();
    
    // Si no tiene protocolo, añadir https://
    if (!normalized.match(/^https?:\/\//)) {
      normalized = `https://${normalized}`;
    }
    
    const urlObj = new URL(normalized);
    
    // Remover parámetros de tracking comunes
    const trackingParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid'];
    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    // Remover trailing slash para consistency
    let pathname = urlObj.pathname;
    if (pathname.endsWith('/') && pathname.length > 1) {
      pathname = pathname.slice(0, -1);
    }
    
    // Construir URL normalizada
    return `${urlObj.protocol}//${urlObj.host}${pathname}${urlObj.search}`;
    
  } catch (error) {
    console.warn('Error normalizando URL:', url, error);
    return url.trim().toLowerCase();
  }
};

/**
 * Detecta si dos URLs son funcionalmente iguales
 */
export const areUrlsEquivalent = (url1: string, url2: string): boolean => {
  const normalized1 = normalizeUrl(url1);
  const normalized2 = normalizeUrl(url2);
  return normalized1 === normalized2;
};

/**
 * Encuentra duplicados en un array de URLs
 */
export const findDuplicateUrls = (urls: string[]): { url: string; indices: number[] }[] => {
  const duplicates: { url: string; indices: number[] }[] = [];
  const seen = new Map<string, number[]>();
  
  urls.forEach((url, index) => {
    const normalized = normalizeUrl(url);
    if (!seen.has(normalized)) {
      seen.set(normalized, []);
    }
    seen.get(normalized)!.push(index);
  });
  
  seen.forEach((indices, normalizedUrl) => {
    if (indices.length > 1) {
      duplicates.push({
        url: normalizedUrl,
        indices
      });
    }
  });
  
  return duplicates;
};

/**
 * Remueve duplicados de un array de URLs manteniendo el primero
 */
export const deduplicateUrls = (urls: string[]): string[] => {
  const seen = new Set<string>();
  return urls.filter(url => {
    const normalized = normalizeUrl(url);
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
};
