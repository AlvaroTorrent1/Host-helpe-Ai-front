/**
 * src/utils/formatting.test.ts
 * Tests for formatting utility functions
 * 
 * Note: These tests will only work after installing Vitest
 */

// Import testing functions conditionally
// This approach allows TypeScript to compile without errors before vitest is installed
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
  describe = (name: string, fn: Function) => { console.log(`Test suite: ${name}`); };
  it = (name: string, fn: Function) => { console.log(`  Test: ${name}`); };
  expect = (value: any) => ({
    toBe: (expected: any) => console.log(`    Expected: ${expected}, Actual: ${value}`),
    toMatch: (regex: RegExp) => console.log(`    Expected to match: ${regex}, Actual: ${value}`),
    toContain: (substring: string) => console.log(`    Expected to contain: ${substring}, Actual: ${value}`)
  });
}

import {
  formatCurrency,
  formatDate,
  truncateText,
  capitalizeWords,
  formatPhoneNumber
} from './formatting';

// Currency formatting tests
describe('formatCurrency', () => {
  it('formats EUR currency correctly', () => {
    expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
    expect(formatCurrency(1000.5, 'EUR')).toBe('€1,000.50');
    expect(formatCurrency(0, 'EUR')).toBe('€0.00');
  });

  it('formats USD currency correctly', () => {
    expect(formatCurrency(1000, 'USD')).toBe('$1,000.00');
  });

  it('handles null and undefined', () => {
    expect(formatCurrency(null as any)).toBe('');
    expect(formatCurrency(undefined as any)).toBe('');
  });
});

// Date formatting tests
describe('formatDate', () => {
  const testDate = new Date('2023-05-15T12:00:00Z');

  it('formats date with different styles', () => {
    // Note: Exact output may vary by browser/locale
    expect(formatDate(testDate, 'short')).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/);
    expect(formatDate(testDate, 'medium')).toMatch(/\w+/); // Contains text
  });

  it('returns empty string for null/undefined', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });
});

// Text truncation tests
describe('truncateText', () => {
  it('truncates text correctly', () => {
    expect(truncateText('Hello world', 5)).toBe('Hello...');
    expect(truncateText('Hello', 5)).toBe('Hello');
    expect(truncateText('Hello', 10)).toBe('Hello');
  });

  it('handles empty and null values', () => {
    expect(truncateText('', 5)).toBe('');
    expect(truncateText(null as any, 5)).toBe('');
  });
});

// Word capitalization tests
describe('capitalizeWords', () => {
  it('capitalizes words correctly', () => {
    expect(capitalizeWords('hello world')).toBe('Hello World');
    expect(capitalizeWords('HELLO WORLD')).toBe('Hello World');
    expect(capitalizeWords('hElLo WoRlD')).toBe('Hello World');
  });

  it('handles empty and null values', () => {
    expect(capitalizeWords('')).toBe('');
    expect(capitalizeWords(null as any)).toBe('');
  });
});

// Phone number formatting tests
describe('formatPhoneNumber', () => {
  it('formats Spanish phone numbers correctly', () => {
    expect(formatPhoneNumber('612345678')).toBe('+34 612 345 678');
    expect(formatPhoneNumber('34612345678')).toBe('+34 612 345 678');
    expect(formatPhoneNumber('+34612345678')).toBe('+34 612 345 678');
  });

  it('handles phone numbers with different country codes', () => {
    expect(formatPhoneNumber('1234567890', '+1')).toBe('+11234567890');
  });

  it('handles empty and null values', () => {
    expect(formatPhoneNumber('')).toBe('');
    expect(formatPhoneNumber(null as any)).toBe('');
  });
}); 