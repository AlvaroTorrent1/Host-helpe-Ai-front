/**
 * Global test configuration for the Host Helper AI application
 * This file is loaded before running tests
 */

import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extender los matchers de Vitest con los de @testing-library/jest-dom
expect.extend(matchers);

// Limpiar después de cada test
afterEach(() => {
  cleanup();
});

// Mock de ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Intersection Observer
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn().mockReturnValue([])
});

window.IntersectionObserver = mockIntersectionObserver as unknown as typeof IntersectionObserver;

// Suppress specific console errors during tests
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Suppress specific React errors that appear during tests but not in real app
  const suppressedMessages = [
    'Warning: ReactDOM.render is no longer supported',
    'Warning: useLayoutEffect does nothing on the server',
    'Warning: React does not recognize the'
  ];
  
  if (typeof args[0] === 'string' && suppressedMessages.some(msg => args[0].includes(msg))) {
    return;
  }
  
  originalConsoleError(...args);
};

// Utility to pause execution for a specific time (useful for testing async code)
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
