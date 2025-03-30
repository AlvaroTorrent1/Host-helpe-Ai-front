/**
 * src/hooks/useLocalStorage.ts
 * Hook to use localStorage with automatic serialization and tab synchronization
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Options for useLocalStorage hook
 */
interface UseLocalStorageOptions<T> {
  /** Initial value if localStorage is empty */
  defaultValue: T;
  /** Whether to synchronize across browser tabs */
  sync?: boolean;
  /** Custom storage object (for testing) */
  storage?: Storage;
  /** Storage key prefix */
  prefix?: string;
}

/**
 * Hook to use localStorage with automatic serialization and tab synchronization
 * @param key The key to store under in localStorage
 * @param options Hook options
 * @returns A tuple of [storedValue, setValue, removeValue]
 */
export function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T>
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  const {
    defaultValue,
    sync = true,
    storage = localStorage,
    prefix = 'host-helper-'
  } = options;

  const storageKey = `${prefix}${key}`;

  // Initialize state from localStorage or default value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = storage.getItem(storageKey);
      // Parse stored json or return defaultValue if no value is stored
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${storageKey}":`, error);
      return defaultValue;
    }
  });

  // Function to update localStorage and state
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      try {
        // Allow value to be a function for complex updates
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        
        // Save state and localStorage
        setStoredValue(valueToStore);
        storage.setItem(storageKey, JSON.stringify(valueToStore));
        
        // If sync is enabled, dispatch a custom event for tab synchronization
        if (sync && typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent('local-storage-change', {
              detail: { key: storageKey, value: valueToStore }
            })
          );
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${storageKey}":`, error);
      }
    },
    [storageKey, storedValue, storage, sync]
  );

  // Function to remove the item from localStorage
  const removeValue = useCallback(() => {
    try {
      storage.removeItem(storageKey);
      setStoredValue(defaultValue);
      
      // If sync is enabled, dispatch a custom event for tab synchronization
      if (sync && typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('local-storage-change', {
            detail: { key: storageKey, value: null, removed: true }
          })
        );
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${storageKey}":`, error);
    }
  }, [storageKey, storage, defaultValue, sync]);

  // Listen for changes in other tabs
  useEffect(() => {
    if (!sync || typeof window === 'undefined') return;

    // Handler for storage events (from other tabs)
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === storageKey && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue));
        } catch (error) {
          console.error(`Error parsing storage event for "${storageKey}":`, error);
        }
      } else if (event.key === storageKey && event.newValue === null) {
        // Item was removed
        setStoredValue(defaultValue);
      }
    };

    // Handler for custom events (from same tab)
    const handleCustomEvent = (event: CustomEvent) => {
      if (event.detail.key === storageKey && !event.detail.removed) {
        setStoredValue(event.detail.value);
      } else if (event.detail.key === storageKey && event.detail.removed) {
        setStoredValue(defaultValue);
      }
    };

    // Add event listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(
      'local-storage-change',
      handleCustomEvent as EventListener
    );

    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(
        'local-storage-change',
        handleCustomEvent as EventListener
      );
    };
  }, [storageKey, defaultValue, sync]);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage; 