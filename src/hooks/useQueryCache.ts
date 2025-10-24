// File: src/hooks/useQueryCache.ts
// Hook para cachear queries de API y reducir llamadas repetitivas a Supabase
// Usa Map para storage en memoria con TTL configurable

import { useState, useEffect, useCallback } from 'react';

// ✅ CACHE GLOBAL: Compartido entre componentes para máxima eficiencia
const queryCache = new Map<string, { data: any; timestamp: number }>();

// ✅ LIMPIEZA AUTOMÁTICA: Limpiar cache viejo cada 10 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of queryCache.entries()) {
    // Eliminar entradas más viejas de 30 minutos
    if (now - value.timestamp > 30 * 60 * 1000) {
      queryCache.delete(key);
    }
  }
}, 10 * 60 * 1000);

interface UseQueryCacheOptions<T> {
  // Clave única para identificar el query
  key: string;
  // Función que ejecuta el query
  queryFn: () => Promise<T>;
  // Tiempo de vida del cache en ms (default: 5 minutos)
  ttl?: number;
  // Si true, ejecuta el query incluso si hay cache (para refrescar en background)
  refetchInBackground?: boolean;
}

/**
 * Hook para cachear queries de API con TTL
 * 
 * @example
 * const { data, loading, error, refetch } = useQueryCache({
 *   key: 'properties-list',
 *   queryFn: () => propertyService.getProperties(),
 *   ttl: 5 * 60 * 1000, // 5 minutos
 * });
 */
export const useQueryCache = <T>({
  key,
  queryFn,
  ttl = 5 * 60 * 1000, // Default: 5 minutos
  refetchInBackground = false,
}: UseQueryCacheOptions<T>) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // ✅ FUNCIÓN DE REFETCH: Permite forzar actualización del cache
  const refetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await queryFn();
      const now = Date.now();
      
      // Actualizar cache
      queryCache.set(key, { data: result, timestamp: now });
      setData(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error');
      setError(error);
      console.error(`[useQueryCache] Error refetching "${key}":`, error);
    } finally {
      setLoading(false);
    }
  }, [key, queryFn]);

  useEffect(() => {
    const now = Date.now();
    const cached = queryCache.get(key);

    // ✅ CACHE HIT: Si hay datos en cache y no han expirado
    if (cached && cached.timestamp + ttl > now) {
      setData(cached.data);
      setLoading(false);
      
      // ✅ REFETCH EN BACKGROUND: Actualizar cache sin bloquear UI
      if (refetchInBackground) {
        queryFn().then(result => {
          queryCache.set(key, { data: result, timestamp: Date.now() });
          setData(result);
        }).catch(err => {
          console.error(`[useQueryCache] Background refetch error for "${key}":`, err);
        });
      }
      
      return;
    }

    // ✅ CACHE MISS o EXPIRADO: Ejecutar query
    setLoading(true);
    setError(null);

    queryFn()
      .then(result => {
        const now = Date.now();
        queryCache.set(key, { data: result, timestamp: now });
        setData(result);
      })
      .catch(err => {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        console.error(`[useQueryCache] Error fetching "${key}":`, error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key, queryFn, ttl, refetchInBackground]);

  return { data, loading, error, refetch };
};

/**
 * Función helper para invalidar cache manualmente
 * Útil después de crear/actualizar/eliminar datos
 * 
 * @example
 * // Después de crear una propiedad
 * await createProperty(newProperty);
 * invalidateCache('properties-list');
 */
export const invalidateCache = (key: string) => {
  queryCache.delete(key);
};

/**
 * Función helper para limpiar todo el cache
 * Útil al hacer logout o cambiar de usuario
 */
export const clearCache = () => {
  queryCache.clear();
};

/**
 * Función helper para obtener estadísticas del cache (debugging)
 */
export const getCacheStats = () => {
  return {
    size: queryCache.size,
    keys: Array.from(queryCache.keys()),
  };
};



