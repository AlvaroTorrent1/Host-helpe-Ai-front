/**
 * Example test file to verify testing setup
 * 
 * This file demonstrates basic test structure and can be used
 * to verify that the testing framework is properly installed.
 */

import { describe, it, expect } from 'vitest';

/**
 * A simple utility function to test
 */
function add(a: number, b: number): number {
  return a + b;
}

/**
 * A simple utility function with string manipulation
 */
function greet(name: string): string {
  return `Hello, ${name}!`;
}

// Basic test suite
describe('Example Tests', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });

  it('should add numbers correctly', () => {
    expect(1 + 1).toBe(2);
  });

  // Simple numeric test
  it('adds two numbers correctly', () => {
    expect(add(1, 2)).toBe(3);
    expect(add(-1, 1)).toBe(0);
    expect(add(5, 5)).toBe(10);
  });

  // String test
  it('generates greeting correctly', () => {
    expect(greet('World')).toBe('Hello, World!');
    expect(greet('User')).toContain('User');
    expect(greet('')).toBe('Hello, !');
  });
});

/**
 * To run this test:
 * 
 * 1. Make sure you've installed the testing dependencies:
 *    npm install --save-dev vitest @testing-library/react @testing-library/jest-dom
 * 
 * 2. Run the test command:
 *    npm test
 * 
 * If everything is set up correctly, you should see these tests pass.
 */ 