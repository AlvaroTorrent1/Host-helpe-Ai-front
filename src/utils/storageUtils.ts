/**
 * src/utils/storageUtils.ts
 * Utility functions for interacting with local and session storage
 */

/**
 * Storage interface for consistent API across local and session storage
 */
export interface Storage {
  /**
   * Get an item from storage
   * @param key The key to retrieve
   * @returns The parsed value or null if not found
   */
  getItem<T>(key: string): T | null;
  
  /**
   * Set an item in storage
   * @param key The key to set
   * @param value The value to store
   */
  setItem<T>(key: string, value: T): void;
  
  /**
   * Remove an item from storage
   * @param key The key to remove
   */
  removeItem(key: string): void;
  
  /**
   * Clear all items from storage
   */
  clear(): void;
  
  /**
   * Check if a key exists in storage
   * @param key The key to check
   * @returns True if the key exists
   */
  hasItem(key: string): boolean;
}

/**
 * Local storage implementation
 */
export const localStorageService: Storage = {
  getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item '${key}' from localStorage:`, error);
      return null;
    }
  },
  
  setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item '${key}' in localStorage:`, error);
    }
  },
  
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item '${key}' from localStorage:`, error);
    }
  },
  
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  },
  
  hasItem(key: string): boolean {
    try {
      return localStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking if item '${key}' exists in localStorage:`, error);
      return false;
    }
  }
};

/**
 * Session storage implementation
 */
export const sessionStorageService: Storage = {
  getItem<T>(key: string): T | null {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error(`Error getting item '${key}' from sessionStorage:`, error);
      return null;
    }
  },
  
  setItem<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting item '${key}' in sessionStorage:`, error);
    }
  },
  
  removeItem(key: string): void {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing item '${key}' from sessionStorage:`, error);
    }
  },
  
  clear(): void {
    try {
      sessionStorage.clear();
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
    }
  },
  
  hasItem(key: string): boolean {
    try {
      return sessionStorage.getItem(key) !== null;
    } catch (error) {
      console.error(`Error checking if item '${key}' exists in sessionStorage:`, error);
      return false;
    }
  }
};

/**
 * Memory storage fallback (for environments without localStorage/sessionStorage)
 */
export const createMemoryStorage = (): Storage => {
  const storage = new Map<string, string>();
  
  return {
    getItem<T>(key: string): T | null {
      try {
        const item = storage.get(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error(`Error getting item '${key}' from memory storage:`, error);
        return null;
      }
    },
    
    setItem<T>(key: string, value: T): void {
      try {
        storage.set(key, JSON.stringify(value));
      } catch (error) {
        console.error(`Error setting item '${key}' in memory storage:`, error);
      }
    },
    
    removeItem(key: string): void {
      storage.delete(key);
    },
    
    clear(): void {
      storage.clear();
    },
    
    hasItem(key: string): boolean {
      return storage.has(key);
    }
  };
};

/**
 * Checks if localStorage is available
 * @returns True if localStorage is available
 */
export const isLocalStorageAvailable = (): boolean => {
  try {
    const testKey = '__test_key__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Checks if sessionStorage is available
 * @returns True if sessionStorage is available
 */
export const isSessionStorageAvailable = (): boolean => {
  try {
    const testKey = '__test_key__';
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch (e) {
    return false;
  }
};

/**
 * Gets the appropriate storage based on availability and type
 * @param storageType The type of storage to use ('local', 'session', or 'memory')
 * @returns The storage service
 */
export const getStorage = (storageType: 'local' | 'session' | 'memory' = 'local'): Storage => {
  switch (storageType) {
    case 'local':
      return isLocalStorageAvailable() ? localStorageService : createMemoryStorage();
    case 'session':
      return isSessionStorageAvailable() ? sessionStorageService : createMemoryStorage();
    case 'memory':
      return createMemoryStorage();
    default:
      return createMemoryStorage();
  }
};

/**
 * Set an item with an expiration time
 * @param storageType The storage type to use
 * @param key The key to set
 * @param value The value to store
 * @param ttlMinutes Time to live in minutes
 */
export const setWithExpiry = <T>(
  storageType: 'local' | 'session' | 'memory',
  key: string,
  value: T,
  ttlMinutes: number
): void => {
  const storage = getStorage(storageType);
  const item = {
    value,
    expiry: Date.now() + ttlMinutes * 60 * 1000
  };
  
  storage.setItem(key, item);
};

/**
 * Get an item and check if it has expired
 * @param storageType The storage type to use
 * @param key The key to retrieve
 * @returns The value if not expired, or null if expired or not found
 */
export const getWithExpiry = <T>(
  storageType: 'local' | 'session' | 'memory',
  key: string
): T | null => {
  const storage = getStorage(storageType);
  const item = storage.getItem<{ value: T; expiry: number }>(key);
  
  if (!item) return null;
  
  // Check if the item has expired
  if (Date.now() > item.expiry) {
    storage.removeItem(key);
    return null;
  }
  
  return item.value;
}; 