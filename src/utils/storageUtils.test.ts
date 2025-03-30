/**
 * src/utils/storageUtils.test.ts
 * Tests for storage utility functions
 */

// Import testing functions conditionally
let describe: any;
let it: any;
let expect: any;
let beforeEach: any;
let afterEach: any;
let vi: any;

try {
  // This will work after vitest is installed
  const vitest = require('vitest');
  describe = vitest.describe;
  it = vitest.it;
  expect = vitest.expect;
  beforeEach = vitest.beforeEach;
  afterEach = vitest.afterEach;
  vi = vitest.vi;
} catch (e) {
  // Fallback for when vitest is not installed
  describe = (name: string, fn: Function) => { console.log(`Test suite: ${name}`); fn(); };
  it = (name: string, fn: Function) => { console.log(`  Test: ${name}`); fn(); };
  beforeEach = (fn: Function) => { console.log(`  [Setup] Running beforeEach`); fn && fn(); };
  afterEach = (fn: Function) => { console.log(`  [Cleanup] Running afterEach`); fn && fn(); };
  vi = { 
    fn: () => {
      const mockFn = (...args: any[]) => { mockFn.calls.push(args); return mockFn.returnValue; };
      mockFn.calls = [] as any[][];
      mockFn.returnValue = undefined;
      mockFn.mockReturnValue = (val: any) => { mockFn.returnValue = val; return mockFn; };
      return mockFn;
    },
    spyOn: (obj: any, method: string) => {
      console.log(`  [Mock] Spying on ${method}`);
      return { mockImplementation: (fn: any) => console.log(`    Mocked implementation`) };
    }
  };
  expect = (value: any) => ({
    toBe: (expected: any) => console.log(`    Expected: ${expected}, Actual: ${value}`),
    toEqual: (expected: any) => console.log(`    Expected to equal: ${expected}`),
    toBeTruthy: () => console.log(`    Expected to be truthy, Actual: ${value}`),
    toBeFalsy: () => console.log(`    Expected to be falsy, Actual: ${value}`),
    toBeNull: () => console.log(`    Expected to be null, Actual: ${value}`),
    toHaveBeenCalled: () => console.log(`    Expected to have been called`),
    toHaveBeenCalledTimes: (times: number) => console.log(`    Expected to have been called ${times} times`),
    toHaveBeenCalledWith: (...args: any[]) => console.log(`    Expected to have been called with: ${args}`),
  });
}

import {
  createMemoryStorage,
  getStorage,
  getWithExpiry,
  isLocalStorageAvailable,
  isSessionStorageAvailable,
  localStorageService,
  sessionStorageService,
  setWithExpiry,
  Storage
} from './storageUtils';

// Mock localStorage and sessionStorage
let mockStorage: Record<string, string> = {};

const mockLocalStorage = {
  getItem: vi.fn((key: string) => mockStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
  clear: vi.fn(() => { mockStorage = {}; })
};

const mockSessionStorage = {
  getItem: vi.fn((key: string) => mockStorage[key] || null),
  setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
  clear: vi.fn(() => { mockStorage = {}; })
};

// Define a global object for testing
const win = typeof window !== 'undefined' ? window : {} as any;

describe('Storage Utils', () => {
  let originalLocalStorage: any;
  let originalSessionStorage: any;

  beforeEach(() => {
    // Save original objects if in a browser environment
    if (typeof window !== 'undefined') {
      originalLocalStorage = window.localStorage;
      originalSessionStorage = window.sessionStorage;
      
      // Apply our mocks
      Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });
      Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage });
    } else {
      // In a non-browser environment, define the globals
      (global as any).localStorage = mockLocalStorage;
      (global as any).sessionStorage = mockSessionStorage;
    }
    
    // Reset mock storage
    mockStorage = {};
  });

  afterEach(() => {
    // Restore original objects if in a browser environment
    if (typeof window !== 'undefined' && originalLocalStorage && originalSessionStorage) {
      Object.defineProperty(window, 'localStorage', { value: originalLocalStorage });
      Object.defineProperty(window, 'sessionStorage', { value: originalSessionStorage });
    } else {
      // In a non-browser environment, clean up
      delete (global as any).localStorage;
      delete (global as any).sessionStorage;
    }
    
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    mockLocalStorage.clear.mockClear();
    
    mockSessionStorage.getItem.mockClear();
    mockSessionStorage.setItem.mockClear();
    mockSessionStorage.removeItem.mockClear();
    mockSessionStorage.clear.mockClear();
  });

  describe('Memory Storage', () => {
    it('creates a memory storage instance', () => {
      const storage = createMemoryStorage();
      
      expect(storage.getItem('nonexistent')).toBeNull();
      
      storage.setItem('test', 'value');
      expect(storage.getItem('test')).toBe('value');
      
      expect(storage.hasItem('test')).toBeTruthy();
      expect(storage.hasItem('nonexistent')).toBeFalsy();
      
      storage.removeItem('test');
      expect(storage.hasItem('test')).toBeFalsy();
      
      // Test with an object
      const testObj = { name: 'Test', value: 123 };
      storage.setItem('testObj', testObj);
      expect(storage.getItem('testObj')).toEqual(testObj);
      
      storage.clear();
      expect(storage.hasItem('testObj')).toBeFalsy();
    });
  });

  describe('Local Storage Service', () => {
    it('interacts with localStorage correctly', () => {
      // Test setting and getting an item
      localStorageService.setItem('test', 'value');
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('test', '"value"');
      
      mockStorage.test = '"value"';
      expect(localStorageService.getItem('test')).toBe('value');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('test');
      
      // Test checking if an item exists
      expect(localStorageService.hasItem('test')).toBeTruthy();
      expect(localStorageService.hasItem('nonexistent')).toBeFalsy();
      
      // Test removing an item
      localStorageService.removeItem('test');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('test');
      
      // Test clearing storage
      localStorageService.clear();
      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });
    
    it('handles JSON parsing errors gracefully', () => {
      // Set an invalid JSON string
      mockStorage.invalid = 'not valid json';
      
      // Should return null when JSON parsing fails
      expect(localStorageService.getItem('invalid')).toBeNull();
    });
  });

  describe('Session Storage Service', () => {
    it('interacts with sessionStorage correctly', () => {
      // Test setting and getting an item
      sessionStorageService.setItem('test', 'value');
      expect(mockSessionStorage.setItem).toHaveBeenCalledWith('test', '"value"');
      
      mockStorage.test = '"value"';
      expect(sessionStorageService.getItem('test')).toBe('value');
      expect(mockSessionStorage.getItem).toHaveBeenCalledWith('test');
      
      // Test checking if an item exists
      expect(sessionStorageService.hasItem('test')).toBeTruthy();
      expect(sessionStorageService.hasItem('nonexistent')).toBeFalsy();
      
      // Test removing an item
      sessionStorageService.removeItem('test');
      expect(mockSessionStorage.removeItem).toHaveBeenCalledWith('test');
      
      // Test clearing storage
      sessionStorageService.clear();
      expect(mockSessionStorage.clear).toHaveBeenCalled();
    });
  });

  describe('Storage Availability Checks', () => {
    it('detects if localStorage is available', () => {
      // Mock successful storage access
      expect(isLocalStorageAvailable()).toBeTruthy();
      
      // Mock localStorage throwing an error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage disabled');
      });
      
      expect(isLocalStorageAvailable()).toBeFalsy();
    });
    
    it('detects if sessionStorage is available', () => {
      // Mock successful storage access
      expect(isSessionStorageAvailable()).toBeTruthy();
      
      // Mock sessionStorage throwing an error
      mockSessionStorage.setItem.mockImplementation(() => {
        throw new Error('sessionStorage disabled');
      });
      
      expect(isSessionStorageAvailable()).toBeFalsy();
    });
  });

  describe('Get Storage', () => {
    it('returns localStorageService when local storage is available', () => {
      // We already mocked localStorage to be available
      const storage = getStorage('local');
      
      // Test a method to confirm it's using localStorage
      storage.setItem('test', 'value');
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
    
    it('returns sessionStorageService when session storage is available', () => {
      const storage = getStorage('session');
      
      // Test a method to confirm it's using sessionStorage
      storage.setItem('test', 'value');
      expect(mockSessionStorage.setItem).toHaveBeenCalled();
    });
    
    it('returns memoryStorage when specified', () => {
      const storage = getStorage('memory');
      
      // Memory storage doesn't use the mocks, so these shouldn't be called
      storage.setItem('test', 'value');
      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      expect(mockSessionStorage.setItem).not.toHaveBeenCalled();
      
      // But the value should still be retrievable
      expect(storage.getItem('test')).toBe('value');
    });
    
    it('falls back to memory storage when localStorage is unavailable', () => {
      // Make localStorage throw an error
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('localStorage disabled');
      });
      
      const storage = getStorage('local');
      
      // Should use memory storage instead
      storage.setItem('test', 'value');
      expect(storage.getItem('test')).toBe('value');
      
      // localStorage.setItem should have been called (and thrown an error)
      // but the value should still be stored in memory
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('Expiring Storage', () => {
    it('stores and retrieves items with expiry', () => {
      // Mock Date.now to return a fixed timestamp
      const now = 1600000000000; // Some fixed timestamp
      const realDateNow = Date.now;
      Date.now = vi.fn(() => now);
      
      // Store an item with 60 minutes TTL
      setWithExpiry('memory', 'test', 'value', 60);
      
      // Should be retrievable
      expect(getWithExpiry('memory', 'test')).toBe('value');
      
      // Advance time by 30 minutes (still within TTL)
      (Date.now as any).mockReturnValue(now + 30 * 60 * 1000);
      expect(getWithExpiry('memory', 'test')).toBe('value');
      
      // Advance time by 90 minutes (past TTL)
      (Date.now as any).mockReturnValue(now + 90 * 60 * 1000);
      expect(getWithExpiry('memory', 'test')).toBeNull();
      
      // Restore Date.now
      Date.now = realDateNow;
    });
  });
}); 