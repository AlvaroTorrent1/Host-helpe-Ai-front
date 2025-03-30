/**
 * src/utils/commonUtils.ts
 * General utility functions for common tasks
 */

/**
 * Safely access deeply nested properties in an object without throwing errors
 * @param obj The object to traverse
 * @param path The path to the property as a dot-separated string
 * @param defaultValue The default value to return if the path does not exist
 * @returns The value at the path, or the default value if not found
 */
export function getNestedValue<T = any>(
  obj: Record<string, any>,
  path: string,
  defaultValue: T | null = null
): T | null {
  if (!obj || !path) return defaultValue;
  
  const keys = path.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current === null || current === undefined || typeof current !== 'object') {
      return defaultValue;
    }
    current = current[key];
  }
  
  return (current === undefined) ? defaultValue : (current as T);
}

/**
 * Debounces a function to prevent it from being called too frequently
 * @param func The function to debounce
 * @param wait The time in milliseconds to wait before calling the function
 * @returns A debounced version of the function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait = 300
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>): void {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout !== null) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttles a function to limit how often it can be called
 * @param func The function to throttle
 * @param limit The time in milliseconds between function calls
 * @returns A throttled version of the function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit = 300
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;
  
  return function(...args: Parameters<T>): void {
    lastArgs = args;
    
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func(...lastArgs);
        }
      }, limit);
    }
  };
}

/**
 * Checks if a value is undefined or null
 * @param value The value to check
 * @returns True if the value is undefined or null
 */
export function isNil(value: any): value is null | undefined {
  return value === null || value === undefined;
}

/**
 * Checks if a value is an empty object, array, string, or is undefined/null
 * @param value The value to check
 * @returns True if the value is empty
 */
export function isEmpty(value: any): boolean {
  if (isNil(value)) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

/**
 * Returns the value if it's not null/undefined, otherwise returns a default value
 * @param value The value to check
 * @param defaultValue The default value to return if the value is null/undefined
 * @returns The value or default value
 */
export function defaultTo<T>(value: T | null | undefined, defaultValue: T): T {
  return isNil(value) ? defaultValue : value as T;
}

/**
 * Creates a delay using a promise
 * @param ms The number of milliseconds to delay
 * @returns A promise that resolves after the specified delay
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Enhanced try-catch utility for async functions
 * @param fn The async function to execute
 * @param fallbackValue Value to return on error
 * @returns Result of fn or fallbackValue on error
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  fallbackValue: T
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error("Error caught in tryCatch:", error);
    return fallbackValue;
  }
}

/**
 * Creates a unique ID (not cryptographically secure)
 * @param prefix A prefix for the ID
 * @returns A unique ID string
 */
export function uniqueId(prefix = ''): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  return `${prefix}${timestamp}${randomPart}`;
}

/**
 * Groups an array of objects by a key
 * @param array The array to group
 * @param key The key to group by
 * @returns An object with keys grouped by the specified property
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const keyValue = String(item[key]);
    
    if (!result[keyValue]) {
      result[keyValue] = [];
    }
    
    result[keyValue].push(item);
    return result;
  }, {} as Record<string, T[]>);
}

/**
 * Picks specified properties from an object to create a new object
 * @param obj The source object
 * @param keys The keys to pick
 * @returns A new object with only the picked properties
 */
export function pick<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  return keys.reduce((result, key) => {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
    return result;
  }, {} as Pick<T, K>);
}

/**
 * Creates a new object without the specified properties
 * @param obj The source object
 * @param keys The keys to omit
 * @returns A new object without the omitted properties
 */
export function omit<T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  
  for (const key of keys) {
    delete result[key];
  }
  
  return result as Omit<T, K>;
}

/**
 * Merges two objects, with properties from 'b' overriding those in 'a'
 * @param a First object
 * @param b Second object (takes precedence)
 * @returns A new merged object
 */
export function merge<A extends object, B extends object>(
  a: A,
  b: B
): A & B {
  return { ...a, ...b };
}

/**
 * Performs a deep merge of objects
 * @param target The target object
 * @param sources The source objects
 * @returns The merged object
 */
export function deepMerge<T extends object>(
  target: T,
  ...sources: Partial<T>[]
): T {
  if (!sources.length) return target;
  
  const source = sources.shift();
  if (source === undefined) return target;
  
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const targetValue = (target as any)[key];
      const sourceValue = (source as any)[key];
      
      if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
        (target as any)[key] = targetValue.concat(sourceValue);
      } else if (isObject(targetValue) && isObject(sourceValue)) {
        (target as any)[key] = deepMerge(targetValue, sourceValue);
      } else {
        (target as any)[key] = sourceValue;
      }
    });
  }
  
  return deepMerge(target, ...sources);
}

/**
 * Checks if a value is an object (excluding null and arrays)
 * @param value The value to check
 * @returns True if the value is an object
 */
export function isObject(value: any): value is object {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/**
 * Clones an object or array deeply
 * @param obj The object to clone
 * @returns A deep clone of the object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }
  
  const clone = {} as T;
  
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      clone[key] = deepClone(obj[key]);
    }
  }
  
  return clone;
}

/**
 * Compares two values for deep equality
 * @param a First value
 * @param b Second value
 * @returns True if the values are deeply equal
 */
export function isEqual(a: any, b: any): boolean {
  if (a === b) return true;
  
  if (a === null || b === null) return a === b;
  if (typeof a !== 'object' || typeof b !== 'object') return a === b;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => isEqual(a[key], b[key]));
}

/**
 * Checks if all values in an array are truthy
 * @param values The array of values to check
 * @returns True if all values are truthy
 */
export function allTrue(values: any[]): boolean {
  return values.every(Boolean);
}

/**
 * Checks if any value in an array is truthy
 * @param values The array of values to check
 * @returns True if any value is truthy
 */
export function anyTrue(values: any[]): boolean {
  return values.some(Boolean);
}

/**
 * Chunks an array into arrays of the specified size
 * @param array The array to chunk
 * @param size The size of each chunk
 * @returns An array of chunks
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = [];
  
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  
  return result;
}

/**
 * Returns a memoized version of a function that remembers results for previous inputs
 * @param fn The function to memoize
 * @returns A memoized version of the function
 */
export function memoize<T extends (...args: any[]) => any>(fn: T): T {
  const cache = new Map();
  
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    
    if (cache.has(key)) {
      return cache.get(key);
    }
    
    const result = fn(...args);
    cache.set(key, result);
    
    return result;
  }) as T;
} 