/**
 * Tests for text utility functions
 */

import * as textUtils from './textUtils';

// Conditional imports for testing
let describe: Function;
let it: Function;
let expect: Function;

try {
  // Try to import from Vitest
  const vitest = require('vitest');
  describe = vitest.describe;
  it = vitest.it;
  expect = vitest.expect;
} catch (error) {
  // Fallback to simple functions if Vitest is not available
  describe = (name: string, fn: Function) => {
    console.log(`Running test suite: ${name}`);
    fn();
  };
  
  it = (name: string, fn: Function) => {
    console.log(`  Test: ${name}`);
    try {
      fn();
      console.log('    ✓ Passed');
    } catch (error) {
      console.error('    ✗ Failed:', error);
    }
  };
  
  expect = (actual: any) => ({
    toBe: (expected: any) => {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toEqual: (expected: any) => {
      const actualStr = JSON.stringify(actual);
      const expectedStr = JSON.stringify(expected);
      if (actualStr !== expectedStr) {
        throw new Error(`Expected ${expectedStr} but got ${actualStr}`);
      }
    },
    toBeTruthy: () => {
      if (!actual) {
        throw new Error(`Expected truthy value but got ${actual}`);
      }
    },
    toBeFalsy: () => {
      if (actual) {
        throw new Error(`Expected falsy value but got ${actual}`);
      }
    },
  });
}

describe('textUtils', () => {
  describe('truncate', () => {
    it('should truncate a string if it exceeds the maximum length', () => {
      const text = 'This is a long text that needs to be truncated';
      expect(textUtils.truncate(text, 20)).toBe('This is a long text...');
    });

    it('should not truncate a string if it does not exceed the maximum length', () => {
      const text = 'Short text';
      expect(textUtils.truncate(text, 20)).toBe('Short text');
    });

    it('should handle empty or null strings', () => {
      expect(textUtils.truncate('', 20)).toBe('');
      expect(textUtils.truncate(null as any, 20)).toBe(null);
    });

    it('should use a custom ellipsis if provided', () => {
      const text = 'This is a long text that needs to be truncated';
      expect(textUtils.truncate(text, 20, '___')).toBe('This is a long text___');
    });
  });

  describe('capitalize', () => {
    it('should capitalize the first letter of a string', () => {
      expect(textUtils.capitalize('hello world')).toBe('Hello world');
    });

    it('should handle empty or null strings', () => {
      expect(textUtils.capitalize('')).toBe('');
      expect(textUtils.capitalize(null as any)).toBe(null);
    });

    it('should not change already capitalized strings', () => {
      expect(textUtils.capitalize('Hello world')).toBe('Hello world');
    });
  });

  describe('titleCase', () => {
    it('should capitalize the first letter of each word', () => {
      expect(textUtils.titleCase('hello world')).toBe('Hello World');
    });

    it('should handle empty or null strings', () => {
      expect(textUtils.titleCase('')).toBe('');
      expect(textUtils.titleCase(null as any)).toBe(null);
    });

    it('should convert uppercase words to title case', () => {
      expect(textUtils.titleCase('HELLO WORLD')).toBe('Hello World');
    });
  });

  describe('camelCase', () => {
    it('should convert a string to camelCase', () => {
      expect(textUtils.camelCase('hello world')).toBe('helloWorld');
      expect(textUtils.camelCase('hello-world')).toBe('helloWorld');
      expect(textUtils.camelCase('hello_world')).toBe('helloWorld');
    });

    it('should handle empty or null strings', () => {
      expect(textUtils.camelCase('')).toBe('');
      expect(textUtils.camelCase(null as any)).toBe(null);
    });
  });

  describe('snakeCase', () => {
    it('should convert a string to snake_case', () => {
      expect(textUtils.snakeCase('helloWorld')).toBe('hello_world');
      expect(textUtils.snakeCase('hello world')).toBe('hello_world');
      expect(textUtils.snakeCase('hello-world')).toBe('hello_world');
    });

    it('should handle empty or null strings', () => {
      expect(textUtils.snakeCase('')).toBe('');
      expect(textUtils.snakeCase(null as any)).toBe(null);
    });
  });

  describe('kebabCase', () => {
    it('should convert a string to kebab-case', () => {
      expect(textUtils.kebabCase('helloWorld')).toBe('hello-world');
      expect(textUtils.kebabCase('hello world')).toBe('hello-world');
      expect(textUtils.kebabCase('hello_world')).toBe('hello-world');
    });

    it('should handle empty or null strings', () => {
      expect(textUtils.kebabCase('')).toBe('');
      expect(textUtils.kebabCase(null as any)).toBe(null);
    });
  });

  describe('removeAccents', () => {
    it('should remove accents from a string', () => {
      expect(textUtils.removeAccents('café')).toBe('cafe');
      expect(textUtils.removeAccents('résumé')).toBe('resume');
      expect(textUtils.removeAccents('piñata')).toBe('pinata');
    });

    it('should handle empty or null strings', () => {
      expect(textUtils.removeAccents('')).toBe('');
      expect(textUtils.removeAccents(null as any)).toBe(null);
    });
  });

  describe('stripHtml', () => {
    it('should remove HTML tags from a string', () => {
      expect(textUtils.stripHtml('<p>Hello <strong>world</strong></p>')).toBe('Hello world');
      expect(textUtils.stripHtml('<div>Text with <a href="#">link</a></div>')).toBe('Text with link');
    });

    it('should handle empty or null strings', () => {
      expect(textUtils.stripHtml('')).toBe('');
      expect(textUtils.stripHtml(null as any)).toBe(null);
    });
  });

  describe('maskString', () => {
    it('should mask a portion of a string', () => {
      expect(textUtils.maskString('1234567890', 4, 8)).toBe('1234*****0');
      expect(textUtils.maskString('example@email.com', 3, 9)).toBe('exa*******@email.com');
    });

    it('should handle empty or null strings', () => {
      expect(textUtils.maskString('', 4, 8)).toBe('');
      expect(textUtils.maskString(null as any, 4, 8)).toBe(null);
    });

    it('should use a custom mask character if provided', () => {
      expect(textUtils.maskString('1234567890', 4, 8, '#')).toBe('1234#####0');
    });

    it('should handle out of bounds indices', () => {
      expect(textUtils.maskString('1234567890', -2, 8)).toBe('*********0');
      expect(textUtils.maskString('1234567890', 4, 15)).toBe('1234******');
    });
  });

  describe('slugify', () => {
    it('should convert a string to a URL-friendly slug', () => {
      expect(textUtils.slugify('Hello World')).toBe('hello-world');
      expect(textUtils.slugify('This is a test!')).toBe('this-is-a-test');
      expect(textUtils.slugify('café mañana')).toBe('cafe-manana');
    });

    it('should handle empty or null strings', () => {
      expect(textUtils.slugify('')).toBe('');
      expect(textUtils.slugify(null as any)).toBe(null);
    });
  });

  describe('escapeRegExp', () => {
    it('should escape special regex characters', () => {
      expect(textUtils.escapeRegExp('hello.world')).toBe('hello\\.world');
      expect(textUtils.escapeRegExp('(test)')).toBe('\\(test\\)');
      expect(textUtils.escapeRegExp('a+b*c?')).toBe('a\\+b\\*c\\?');
    });

    it('should handle empty or null strings', () => {
      expect(textUtils.escapeRegExp('')).toBe('');
      expect(textUtils.escapeRegExp(null as any)).toBe(null);
    });
  });

  describe('formatCurrency', () => {
    it('should format a number as currency', () => {
      // Note: this test might vary depending on the locale
      expect(textUtils.formatCurrency(1000)).toEqual('1.000,00 €');
      expect(textUtils.formatCurrency(1000, 'USD', 'en-US')).toEqual('$1,000.00');
    });
  });

  describe('getInitials', () => {
    it('should get initials from a name', () => {
      expect(textUtils.getInitials('John Doe')).toBe('JD');
      expect(textUtils.getInitials('John')).toBe('J');
      expect(textUtils.getInitials('John David Smith')).toBe('JD');
    });

    it('should handle empty or null strings', () => {
      expect(textUtils.getInitials('')).toBe('');
      expect(textUtils.getInitials(null as any)).toBe('');
    });

    it('should respect the maxLength parameter', () => {
      expect(textUtils.getInitials('John David Smith', 3)).toBe('JDS');
      expect(textUtils.getInitials('John David Smith', 1)).toBe('J');
    });
  });
}); 