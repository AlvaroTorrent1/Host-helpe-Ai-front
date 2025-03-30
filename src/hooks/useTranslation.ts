/**
 * src/hooks/useTranslation.ts
 * Hook for accessing translations in components
 */

import { useCallback, useEffect, useState } from 'react';
import { getLocale, setLocale, translate as t } from '../i18n/i18n';
import useLocalStorage from './useLocalStorage';

/**
 * Options for useTranslation hook
 */
interface UseTranslationOptions {
  /** Whether to persist locale preference in localStorage */
  persist?: boolean;
}

/**
 * Hook to use translations with locale switching
 * @param options Hook options
 * @returns Object with translation functions and locale control
 */
export function useTranslation(options: UseTranslationOptions = {}) {
  const { persist = true } = options;
  
  // Keep track of current locale
  const [currentLocale, setCurrentLocale] = useState(() => getLocale());
  
  // Optionally persist locale preference in localStorage
  const [savedLocale, setSavedLocale] = useLocalStorage<string | null>('locale', {
    defaultValue: null,
    sync: true,
  });
  
  // Apply saved locale on mount
  useEffect(() => {
    if (persist && savedLocale) {
      setLocale(savedLocale);
      setCurrentLocale(getLocale());
    }
  }, [persist, savedLocale]);
  
  // Function to change locale
  const changeLocale = useCallback((newLocale: string) => {
    setLocale(newLocale);
    setCurrentLocale(getLocale());
    
    if (persist) {
      setSavedLocale(newLocale);
    }
  }, [persist, setSavedLocale]);
  
  // Translation function with current locale
  const translate = useCallback((key: string, params?: Record<string, string | number>) => {
    return t(key, params);
  }, [currentLocale]); // Add currentLocale dependency to refresh when locale changes
  
  return {
    t: translate,
    translate,
    locale: currentLocale,
    changeLocale,
  };
}

export default useTranslation; 