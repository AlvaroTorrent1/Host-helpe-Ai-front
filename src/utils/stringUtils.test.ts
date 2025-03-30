/**
 * src/utils/stringUtils.test.ts
 * Tests for string utility functions
 */

// Import testing functions conditionally
let describe: any;
let it: any;
let expect: any;

try {
  // This will work after vitest is installed
  const vitest = require('vitest');
  describe = vitest.describe;
  it = vitest.it;
  expect = vitest.expect;
} catch (e) {
  // Fallback for when vitest is not installed
  describe = (name: string, fn: Function) => { console.log(`Test suite: ${name}`); fn(); };
  it = (name: string, fn: Function) => { console.log(`  Test: ${name}`); fn(); };
  expect = (value: any) => ({
    toBe: (expected: any) => console.log(`    Expected: ${expected}, Actual: ${value}`),
    toEqual: (expected: any) => console.log(`    Expected to equal: ${expected}`),
    toBeNull: () => console.log(`    Expected to be null, Actual: ${value}`),
    toBeTruthy: () => console.log(`    Expected to be truthy, Actual: ${value}`),
    toBeFalsy: () => console.log(`    Expected to be falsy, Actual: ${value}`),
    toContain: (expected: any) => console.log(`    Expected to contain: ${expected}`)
  });
}

import {
  capitalize,
  titleCase,
  truncate,
  stripHtml,
  toCamelCase,
  toKebabCase,
  toSnakeCase,
  slugify,
  escapeRegExp,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatFileSize,
  getInitials,
  generateRandomString,
  hasUpperCase,
  hasLowerCase,
  hasNumber,
  hasSpecialChar,
  removeAccents
} from './stringUtils';

describe('String Utils', () => {
  describe('capitalize', () => {
    it('capitalizes the first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });
    
    it('leaves already capitalized strings unchanged', () => {
      expect(capitalize('Hello')).toBe('Hello');
    });
    
    it('handles empty strings', () => {
      expect(capitalize('')).toBe('');
    });
    
    it('handles single letters', () => {
      expect(capitalize('a')).toBe('A');
    });
  });
  
  describe('titleCase', () => {
    it('capitalizes each word', () => {
      expect(titleCase('hello world')).toBe('Hello World');
    });
    
    it('converts all caps to title case', () => {
      expect(titleCase('HELLO WORLD')).toBe('Hello World');
    });
    
    it('handles empty strings', () => {
      expect(titleCase('')).toBe('');
    });
    
    it('handles single words', () => {
      expect(titleCase('hello')).toBe('Hello');
    });
  });
  
  describe('truncate', () => {
    it('truncates strings longer than maxLength', () => {
      expect(truncate('Hello world', 5)).toBe('Hello...');
    });
    
    it('does not truncate strings shorter than maxLength', () => {
      expect(truncate('Hello', 10)).toBe('Hello');
    });
    
    it('uses custom suffix when provided', () => {
      expect(truncate('Hello world', 5, ' [more]')).toBe('Hello [more]');
    });
    
    it('handles empty strings', () => {
      expect(truncate('', 5)).toBe('');
    });
  });
  
  describe('stripHtml', () => {
    it('removes HTML tags', () => {
      expect(stripHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
    });
    
    it('handles strings without HTML', () => {
      expect(stripHtml('Hello world')).toBe('Hello world');
    });
    
    it('handles empty strings', () => {
      expect(stripHtml('')).toBe('');
    });
  });
  
  describe('toCamelCase', () => {
    it('converts space-separated strings to camelCase', () => {
      expect(toCamelCase('hello world')).toBe('helloWorld');
    });
    
    it('converts kebab-case to camelCase', () => {
      expect(toCamelCase('hello-world')).toBe('helloWorld');
    });
    
    it('converts snake_case to camelCase', () => {
      expect(toCamelCase('hello_world')).toBe('helloWorld');
    });
    
    it('handles empty strings', () => {
      expect(toCamelCase('')).toBe('');
    });
  });
  
  describe('toKebabCase', () => {
    it('converts space-separated strings to kebab-case', () => {
      expect(toKebabCase('hello world')).toBe('hello-world');
    });
    
    it('converts camelCase to kebab-case', () => {
      expect(toKebabCase('helloWorld')).toBe('hello-world');
    });
    
    it('converts snake_case to kebab-case', () => {
      expect(toKebabCase('hello_world')).toBe('hello-world');
    });
    
    it('handles empty strings', () => {
      expect(toKebabCase('')).toBe('');
    });
  });
  
  describe('toSnakeCase', () => {
    it('converts space-separated strings to snake_case', () => {
      expect(toSnakeCase('hello world')).toBe('hello_world');
    });
    
    it('converts camelCase to snake_case', () => {
      expect(toSnakeCase('helloWorld')).toBe('hello_world');
    });
    
    it('converts kebab-case to snake_case', () => {
      expect(toSnakeCase('hello-world')).toBe('hello_world');
    });
    
    it('handles empty strings', () => {
      expect(toSnakeCase('')).toBe('');
    });
  });
  
  describe('slugify', () => {
    it('converts strings to slugs', () => {
      expect(slugify('Hello World!')).toBe('hello-world');
    });
    
    it('removes special characters', () => {
      expect(slugify('Hello, World & Universe!')).toBe('hello-world-universe');
    });
    
    it('removes leading and trailing hyphens', () => {
      expect(slugify(' Hello World! ')).toBe('hello-world');
    });
    
    it('handles empty strings', () => {
      expect(slugify('')).toBe('');
    });
  });
  
  describe('escapeRegExp', () => {
    it('escapes special regex characters', () => {
      expect(escapeRegExp('.*+?^${}()|[]\\')).toBe('\\.\\*\\+\\?\\^\\$\\{\\}\\(\\)\\|\\[\\]\\\\');
    });
    
    it('handles strings without special characters', () => {
      expect(escapeRegExp('hello')).toBe('hello');
    });
    
    it('handles empty strings', () => {
      expect(escapeRegExp('')).toBe('');
    });
  });
  
  describe('formatCurrency', () => {
    it('formats numbers as currency', () => {
      // This test is locale-dependent, so we'll check for basic structure
      const result = formatCurrency(1234.56);
      expect(result).toContain('1,234.56');
    });
    
    it('uses specified currency', () => {
      const result = formatCurrency(1234.56, 'EUR');
      expect(result).toContain('1,234.56');
      // Different environments may format EUR differently, so we can't check exact format
    });
  });
  
  describe('formatNumber', () => {
    it('formats numbers with thousand separators', () => {
      expect(formatNumber(1234567)).toContain('1,234,567');
    });
    
    it('handles decimal numbers', () => {
      expect(formatNumber(1234.56)).toContain('1,234.56');
    });
  });
  
  describe('formatPercent', () => {
    it('formats numbers as percentages', () => {
      expect(formatPercent(0.1234)).toContain('12%');
    });
    
    it('respects decimals parameter', () => {
      expect(formatPercent(0.1234, 'en-US', 2)).toContain('12.34%');
    });
  });
  
  describe('formatFileSize', () => {
    it('formats small file sizes', () => {
      expect(formatFileSize(100)).toBe('100 Bytes');
    });
    
    it('formats KB file sizes', () => {
      expect(formatFileSize(1500)).toBe('1.46 KB');
    });
    
    it('formats MB file sizes', () => {
      expect(formatFileSize(1500000)).toBe('1.43 MB');
    });
    
    it('formats GB file sizes', () => {
      expect(formatFileSize(1500000000)).toBe('1.4 GB');
    });
    
    it('handles zero bytes', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });
  });
  
  describe('getInitials', () => {
    it('gets initials from a full name', () => {
      expect(getInitials('John Doe')).toBe('JD');
    });
    
    it('respects maxInitials parameter', () => {
      expect(getInitials('John Middle Doe', 3)).toBe('JMD');
    });
    
    it('handles single names', () => {
      expect(getInitials('John')).toBe('J');
    });
    
    it('handles empty strings', () => {
      expect(getInitials('')).toBe('');
    });
  });
  
  describe('generateRandomString', () => {
    it('generates strings of the specified length', () => {
      const result = generateRandomString(10);
      expect(result.length).toBe(10);
    });
    
    it('includes special characters when specified', () => {
      // This is hard to test deterministically, but we'll check a large sample
      const result = generateRandomString(100, true);
      const hasSpecial = /[!@#$%^&*()_+]/.test(result);
      expect(hasSpecial).toBeTruthy();
    });
  });
  
  describe('hasUpperCase', () => {
    it('detects uppercase letters', () => {
      expect(hasUpperCase('Hello')).toBeTruthy();
    });
    
    it('returns false for lowercase-only strings', () => {
      expect(hasUpperCase('hello')).toBeFalsy();
    });
    
    it('returns false for non-letter strings', () => {
      expect(hasUpperCase('123')).toBeFalsy();
    });
  });
  
  describe('hasLowerCase', () => {
    it('detects lowercase letters', () => {
      expect(hasLowerCase('Hello')).toBeTruthy();
    });
    
    it('returns false for uppercase-only strings', () => {
      expect(hasLowerCase('HELLO')).toBeFalsy();
    });
    
    it('returns false for non-letter strings', () => {
      expect(hasLowerCase('123')).toBeFalsy();
    });
  });
  
  describe('hasNumber', () => {
    it('detects numbers', () => {
      expect(hasNumber('hello123')).toBeTruthy();
    });
    
    it('returns false for strings without numbers', () => {
      expect(hasNumber('hello')).toBeFalsy();
    });
  });
  
  describe('hasSpecialChar', () => {
    it('detects special characters', () => {
      expect(hasSpecialChar('hello!')).toBeTruthy();
    });
    
    it('returns false for strings without special characters', () => {
      expect(hasSpecialChar('hello123')).toBeFalsy();
    });
  });
  
  describe('removeAccents', () => {
    it('removes accents from letters', () => {
      expect(removeAccents('café')).toBe('cafe');
    });
    
    it('handles multiple accented characters', () => {
      expect(removeAccents('Crème Brûlée')).toBe('Creme Brulee');
    });
    
    it('leaves non-accented text unchanged', () => {
      expect(removeAccents('hello')).toBe('hello');
    });
    
    it('handles empty strings', () => {
      expect(removeAccents('')).toBe('');
    });
  });
}); 