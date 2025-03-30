/**
 * src/hooks/useSupabase.ts
 * Hook for making Supabase queries with improved error handling and caching
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import supabase from '../services/supabase';
import { PostgrestError } from '@supabase/supabase-js';
import { cacheConfig } from '../config/environment';
import { tryCatch } from '../utils/commonUtils';

// Generic query options
interface QueryOptions<T> {
  // Whether to execute the query immediately on mount
  immediate?: boolean;
  // Initial data to use before the query resolves
  initialData?: T | null;
  // Cache key for storing results
  cacheKey?: string;
  // Cache time to live in milliseconds
  cacheTTL?: number;
  // Whether to refresh cached data on mount
  refreshCache?: boolean;
  // Error handler callback
  onError?: (error: PostgrestError) => void;
  // Success handler callback
  onSuccess?: (data: T) => void;
}

// Cache entry
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Global in-memory cache
const queryCache: Record<string, CacheEntry<any>> = {};

/**
 * Check if a cache entry is still valid
 */
function isCacheValid<T>(cacheKey: string): boolean {
  const entry = queryCache[cacheKey] as CacheEntry<T> | undefined;
  if (!entry) return false;
  
  const now = Date.now();
  return now - entry.timestamp < entry.ttl;
}

/**
 * Get cached data
 */
function getCachedData<T>(cacheKey: string): T | null {
  if (!cacheKey || !isCacheValid(cacheKey)) return null;
  return (queryCache[cacheKey] as CacheEntry<T>).data;
}

/**
 * Set cache data
 */
function setCacheData<T>(cacheKey: string, data: T, ttl: number) {
  if (!cacheKey) return;
  
  queryCache[cacheKey] = {
    data,
    timestamp: Date.now(),
    ttl,
  };
}

/**
 * Hook for making a Supabase query with improved error handling and caching
 * @param queryFn Function that returns a Supabase query
 * @param options Query options
 * @returns Query state and control functions
 */
export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  options: QueryOptions<T> = {}
) {
  const {
    immediate = true,
    initialData = null,
    cacheKey,
    cacheTTL = cacheConfig.defaultTTL,
    refreshCache = false,
    onError,
    onSuccess,
  } = options;

  // Manage query state
  const [data, setData] = useState<T | null>(() => {
    if (cacheKey) {
      const cachedData = getCachedData<T>(cacheKey);
      return cachedData !== null ? cachedData : initialData;
    }
    return initialData;
  });
  
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(immediate);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // Keep track of whether the component is mounted
  const isMounted = useRef(true);
  
  // Function to execute the query
  const execute = useCallback(async (): Promise<T | null> => {
    // Reset query state
    setIsLoading(true);
    setError(null);
    setIsError(false);
    setIsSuccess(false);
    
    // Check cache first if a cache key is provided
    if (cacheKey && !refreshCache) {
      const cachedData = getCachedData<T>(cacheKey);
      if (cachedData !== null) {
        if (isMounted.current) {
          setData(cachedData);
          setIsLoading(false);
          setIsSuccess(true);
          onSuccess?.(cachedData);
        }
        return cachedData;
      }
    }
    
    try {
      // Execute the query
      const { data: responseData, error: responseError } = await queryFn();
      
      // Handle error case
      if (responseError) {
        if (isMounted.current) {
          setError(responseError);
          setIsError(true);
          setIsLoading(false);
          onError?.(responseError);
        }
        return null;
      }
      
      // Handle success case
      if (isMounted.current) {
        setData(responseData);
        setIsSuccess(true);
        setIsLoading(false);
        
        // Save to cache if needed
        if (cacheKey && responseData) {
          setCacheData(cacheKey, responseData, cacheTTL);
        }
        
        // Call success callback if provided
        if (responseData && onSuccess) {
          onSuccess(responseData);
        }
      }
      
      return responseData;
    } catch (err) {
      // Handle unexpected errors
      console.error('Unexpected error in useSupabaseQuery:', err);
      
      const postgrestError: PostgrestError = {
        message: err instanceof Error ? err.message : 'Unknown error',
        details: '',
        hint: '',
        code: 'UNKNOWN',
        name: 'PostgrestError'
      };
      
      if (isMounted.current) {
        setError(postgrestError);
        setIsError(true);
        setIsLoading(false);
        onError?.(postgrestError);
      }
      
      return null;
    }
  }, [queryFn, cacheKey, refreshCache, cacheTTL, onError, onSuccess]);

  // Execute the query immediately if requested
  useEffect(() => {
    if (immediate) {
      execute();
    }
    
    // Clean up on unmount
    return () => {
      isMounted.current = false;
    };
  }, [execute, immediate]);

  return {
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    execute,
    setData,
  };
}

/**
 * Hook for a Supabase mutation with error handling
 * @param mutationFn Function that makes a Supabase mutation
 * @param options Mutation options
 * @returns Mutation state and execute function
 */
export function useSupabaseMutation<T, V = any>(
  mutationFn: (variables: V) => Promise<{ data: T | null; error: PostgrestError | null }>,
  options: {
    onError?: (error: PostgrestError, variables: V) => void;
    onSuccess?: (data: T, variables: V) => void;
    invalidateCache?: string[];
  } = {}
) {
  const { onError, onSuccess, invalidateCache = [] } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  
  // Keep track of whether the component is mounted
  const isMounted = useRef(true);
  
  // Function to execute the mutation
  const mutate = useCallback(
    async (variables: V): Promise<T | null> => {
      if (isMounted.current) {
        setIsLoading(true);
        setError(null);
        setIsError(false);
        setIsSuccess(false);
      }
      
      try {
        // Execute the mutation
        const { data: responseData, error: responseError } = await mutationFn(variables);
        
        // Handle error case
        if (responseError) {
          if (isMounted.current) {
            setError(responseError);
            setIsError(true);
            setIsLoading(false);
            onError?.(responseError, variables);
          }
          return null;
        }
        
        // Handle success case
        if (isMounted.current) {
          setData(responseData);
          setIsSuccess(true);
          setIsLoading(false);
          
          // Call success callback if provided
          if (responseData && onSuccess) {
            onSuccess(responseData, variables);
          }
          
          // Invalidate cache keys if provided
          if (invalidateCache.length > 0) {
            invalidateCache.forEach((key) => {
              delete queryCache[key];
            });
          }
        }
        
        return responseData;
      } catch (err) {
        // Handle unexpected errors
        console.error('Unexpected error in useSupabaseMutation:', err);
        
        const postgrestError: PostgrestError = {
          message: err instanceof Error ? err.message : 'Unknown error',
          details: '',
          hint: '',
          code: 'UNKNOWN',
          name: 'PostgrestError'
        };
        
        if (isMounted.current) {
          setError(postgrestError);
          setIsError(true);
          setIsLoading(false);
          onError?.(postgrestError, variables);
        }
        
        return null;
      }
    },
    [mutationFn, onError, onSuccess, invalidateCache]
  );
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);
  
  return {
    data,
    error,
    isLoading,
    isSuccess,
    isError,
    mutate,
    reset: () => {
      setData(null);
      setError(null);
      setIsLoading(false);
      setIsSuccess(false);
      setIsError(false);
    },
  };
}

/**
 * Manually invalidate cache entries by key or pattern
 * @param cacheKey Exact cache key or regular expression pattern
 */
export function invalidateCache(cacheKey: string | RegExp): void {
  if (typeof cacheKey === 'string') {
    delete queryCache[cacheKey];
  } else {
    Object.keys(queryCache).forEach((key) => {
      if (cacheKey.test(key)) {
        delete queryCache[key];
      }
    });
  }
}

/**
 * Clear the entire cache
 */
export function clearCache(): void {
  Object.keys(queryCache).forEach((key) => {
    delete queryCache[key];
  });
}

export default { useSupabaseQuery, useSupabaseMutation, invalidateCache, clearCache }; 