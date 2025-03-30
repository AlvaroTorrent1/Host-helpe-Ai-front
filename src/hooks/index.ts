/**
 * src/hooks/index.ts
 * Export all custom hooks for easy importing
 */

// Storage hooks
export { default as useLocalStorage } from './useLocalStorage';
export * from './useLocalStorage';

// Form hooks
export { default as useForm } from './useForm';
export * from './useForm';

// Animation hooks
export { useFade, useParallax } from './useAnimation';
export { default as animationHooks } from './useAnimation';

// Translation hooks
export { default as useTranslation } from './useTranslation';
export * from './useTranslation';

// Supabase hooks
export { 
  default as useSupabase,
  useSupabaseQuery,
  useSupabaseMutation,
  invalidateCache,
  clearCache,
} from './useSupabase'; 