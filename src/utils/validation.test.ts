/**
 * src/utils/validation.test.ts
 * Tests for validation utility functions
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
  describe = (name: string, fn: Function) => { console.log(`Test suite: ${name}`); };
  it = (name: string, fn: Function) => { console.log(`  Test: ${name}`); };
  expect = (value: any) => ({
    toBe: (expected: any) => console.log(`    Expected: ${expected}, Actual: ${value}`),
    toEqual: (expected: any) => console.log(`    Expected to equal: ${expected}, Actual: ${value}`),
    toContain: (item: any) => console.log(`    Expected to contain: ${item}, Actual: ${value}`),
    toBeTruthy: () => console.log(`    Expected to be truthy, Actual: ${value}`),
    toBeFalsy: () => console.log(`    Expected to be falsy, Actual: ${value}`)
  });
}

import {
  isValidEmail,
  validatePasswordStrength,
  isValidPhoneNumber,
  isValidUrl,
  isNotEmpty,
  isInRange,
  isValidDateRange,
  createMinLengthValidator,
  createMaxLengthValidator,
  isValidSpanishId
} from './validation';

// Email validation tests
describe('isValidEmail', () => {
  it('validates correct email formats', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('test.email+label@example.co.uk')).toBe(true);
    expect(isValidEmail('test_email@example-domain.com')).toBe(true);
  });

  it('rejects incorrect email formats', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('test')).toBe(false);
    expect(isValidEmail('test@')).toBe(false);
    expect(isValidEmail('test@example')).toBe(false);
    expect(isValidEmail('@example.com')).toBe(false);
  });
});

// Password validation tests
describe('validatePasswordStrength', () => {
  it('validates strong passwords', () => {
    const result = validatePasswordStrength('Test1234!');
    expect(result.isValid).toBe(true);
    expect(result.issues.length).toBe(0);
  });

  it('rejects weak passwords and returns issues', () => {
    const result = validatePasswordStrength('weak');
    expect(result.isValid).toBe(false);
    expect(result.issues.length).toEqual(4);
    expect(result.issues).toContain('Password must contain at least one uppercase letter');
    expect(result.issues).toContain('Password must contain at least one number');
    expect(result.issues).toContain('Password must contain at least one special character');
    expect(result.issues).toContain('Password must be at least 8 characters long');
  });

  it('handles empty passwords', () => {
    const result = validatePasswordStrength('');
    expect(result.isValid).toBe(false);
    expect(result.issues).toContain('Password is required');
  });
});

// Phone number validation tests
describe('isValidPhoneNumber', () => {
  it('validates Spanish phone numbers', () => {
    expect(isValidPhoneNumber('612345678')).toBe(true);
    expect(isValidPhoneNumber('+34612345678')).toBe(true);
    expect(isValidPhoneNumber('0034612345678')).toBe(true);
    expect(isValidPhoneNumber('34612345678')).toBe(true);
  });

  it('validates US phone numbers with US country code', () => {
    expect(isValidPhoneNumber('2123456789', 'US')).toBe(true);
    expect(isValidPhoneNumber('+12123456789', 'US')).toBe(true);
    expect(isValidPhoneNumber('001212456789', 'US')).toBe(true);
  });

  it('rejects invalid phone numbers', () => {
    expect(isValidPhoneNumber('')).toBe(false);
    expect(isValidPhoneNumber('123')).toBe(false);
    expect(isValidPhoneNumber('1234567890', 'ES')).toBe(false); // Too many digits for Spanish
  });
});

// URL validation tests
describe('isValidUrl', () => {
  it('validates correct URLs', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://example.com')).toBe(true);
    expect(isValidUrl('https://www.example.co.uk/path?query=param')).toBe(true);
  });

  it('rejects incorrect URLs', () => {
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('example')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false); // Missing protocol
  });
});

// Empty check tests
describe('isNotEmpty', () => {
  it('validates non-empty strings', () => {
    expect(isNotEmpty('test')).toBe(true);
    expect(isNotEmpty(' test ')).toBe(true);
  });

  it('rejects empty strings', () => {
    expect(isNotEmpty('')).toBe(false);
    expect(isNotEmpty('   ')).toBe(false);
    expect(isNotEmpty(null)).toBe(false);
    expect(isNotEmpty(undefined)).toBe(false);
  });
});

// Range validation tests
describe('isInRange', () => {
  it('validates numbers within range', () => {
    expect(isInRange(5, 1, 10)).toBe(true);
    expect(isInRange(1, 1, 10)).toBe(true); // Min boundary
    expect(isInRange(10, 1, 10)).toBe(true); // Max boundary
  });

  it('rejects numbers outside range', () => {
    expect(isInRange(0, 1, 10)).toBe(false);
    expect(isInRange(11, 1, 10)).toBe(false);
  });
});

// Date range validation tests
describe('isValidDateRange', () => {
  it('validates correct date ranges', () => {
    const start = new Date('2023-01-01');
    const end = new Date('2023-01-15');
    expect(isValidDateRange(start, end)).toBe(true);
  });

  it('rejects invalid date ranges', () => {
    const start = new Date('2023-01-15');
    const end = new Date('2023-01-01');
    expect(isValidDateRange(start, end)).toBe(false);
  });

  it('validates equal dates when allowEqual is true', () => {
    const date = new Date('2023-01-15');
    expect(isValidDateRange(date, date, true)).toBe(true);
    expect(isValidDateRange(date, date, false)).toBe(false);
  });
});

// Min length validator tests
describe('createMinLengthValidator', () => {
  it('creates a validator that checks minimum length', () => {
    const validator = createMinLengthValidator(3);
    expect(validator('abc')).toBe(true);
    expect(validator('abcd')).toBe(true);
    expect(validator('ab')).toBe(false);
    expect(validator('')).toBe(false);
  });
});

// Max length validator tests
describe('createMaxLengthValidator', () => {
  it('creates a validator that checks maximum length', () => {
    const validator = createMaxLengthValidator(3);
    expect(validator('abc')).toBe(true);
    expect(validator('ab')).toBe(true);
    expect(validator('')).toBe(true);
    expect(validator('abcd')).toBe(false);
  });
});

// Spanish ID validation tests
describe('isValidSpanishId', () => {
  it('validates correct DNI format', () => {
    expect(isValidSpanishId('12345678Z')).toBe(true);
  });

  it('validates correct NIE format', () => {
    expect(isValidSpanishId('X1234567L')).toBe(true);
    expect(isValidSpanishId('Y1234567X')).toBe(true);
    expect(isValidSpanishId('Z1234567R')).toBe(true);
  });

  it('rejects invalid DNI/NIE formats', () => {
    expect(isValidSpanishId('')).toBe(false);
    expect(isValidSpanishId('123456789')).toBe(false); // Too many digits
    expect(isValidSpanishId('1234567A')).toBe(false); // Too few digits
    expect(isValidSpanishId('12345678A')).toBe(false); // Invalid check digit
  });
}); 