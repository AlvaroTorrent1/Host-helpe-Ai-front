/**
 * Tests for animation utility functions
 */

import * as animationUtils from './animationUtils';

// Conditional imports for testing
let describe: Function;
let it: Function;
let expect: Function;
let beforeEach: Function;
let afterEach: Function;
let jest: any;

try {
  // Try to import from Vitest
  const vitest = require('vitest');
  describe = vitest.describe;
  it = vitest.it;
  expect = vitest.expect;
  beforeEach = vitest.beforeEach;
  afterEach = vitest.afterEach;
  jest = vitest;
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
  
  beforeEach = (fn: Function) => fn();
  afterEach = (fn: Function) => fn();
  
  jest = {
    fn: () => {
      const mockFn = (...args: any[]) => {
        mockFn.mock.calls.push(args);
        return mockFn.mock.returnValue;
      };
      mockFn.mock = { calls: [], returnValue: undefined };
      return mockFn;
    },
    spyOn: (obj: any, method: string) => {
      const original = obj[method];
      obj[method] = jest.fn();
      obj[method].mock.returnValue = undefined;
      obj[method].mockRestore = () => { obj[method] = original; };
      return obj[method];
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
    toBeCloseTo: (expected: number, precision: number = 2) => {
      const pow = Math.pow(10, precision);
      const actualRounded = Math.round(actual * pow) / pow;
      const expectedRounded = Math.round(expected * pow) / pow;
      if (actualRounded !== expectedRounded) {
        throw new Error(`Expected ${expected} to be close to ${actual}`);
      }
    },
    toBeCalled: () => {
      if (actual.mock.calls.length === 0) {
        throw new Error('Expected function to be called');
      }
    },
    toBeCalledWith: (...args: any[]) => {
      const called = actual.mock.calls.some((call: any[]) => {
        if (call.length !== args.length) return false;
        return call.every((arg: any, i: number) => JSON.stringify(arg) === JSON.stringify(args[i]));
      });
      if (!called) {
        throw new Error(`Expected function to be called with ${JSON.stringify(args)}`);
      }
    }
  });
}

describe('animationUtils', () => {
  describe('easingFunctions', () => {
    it('should provide various easing functions', () => {
      const { easingFunctions } = animationUtils;
      expect(typeof easingFunctions.linear).toBe('function');
      expect(typeof easingFunctions.easeInQuad).toBe('function');
      expect(typeof easingFunctions.easeOutQuad).toBe('function');
      expect(typeof easingFunctions.easeInOutQuad).toBe('function');
    });

    it('linear should return the same value', () => {
      const { linear } = animationUtils.easingFunctions;
      expect(linear(0)).toBe(0);
      expect(linear(0.5)).toBe(0.5);
      expect(linear(1)).toBe(1);
    });

    it('easeInQuad should provide quadratic easing', () => {
      const { easeInQuad } = animationUtils.easingFunctions;
      expect(easeInQuad(0)).toBe(0);
      expect(easeInQuad(0.5)).toBe(0.25);
      expect(easeInQuad(1)).toBe(1);
    });
  });

  describe('animate', () => {
    let originalRAF: any;
    let originalCAF: any;
    
    beforeEach(() => {
      // Mock requestAnimationFrame and cancelAnimationFrame
      originalRAF = window.requestAnimationFrame;
      originalCAF = window.cancelAnimationFrame;
      
      window.requestAnimationFrame = jest.fn((callback) => {
        return setTimeout(callback, 0) as unknown as number;
      });
      
      window.cancelAnimationFrame = jest.fn((id) => {
        clearTimeout(id as unknown as number);
      });
      
      // Mock Date.now to control animation timing
      jest.spyOn(Date, 'now').mockImplementation(() => 0);
    });
    
    afterEach(() => {
      // Restore original functions
      window.requestAnimationFrame = originalRAF;
      window.cancelAnimationFrame = originalCAF;
      if (Date.now.mockRestore) Date.now.mockRestore();
    });
    
    it('should animate a value from start to end', (done) => {
      const callback = jest.fn();
      
      animationUtils.animate(0, 100, 1000, 'linear', callback);
      
      // Fast-forward time to 500ms (50% progress)
      if (Date.now.mockImplementation) {
        Date.now.mockImplementation(() => 500);
      }
      
      // Wait for next animation frame
      setTimeout(() => {
        expect(callback).toBeCalled();
        
        // Now complete the animation
        if (Date.now.mockImplementation) {
          Date.now.mockImplementation(() => 1000);
        }
        
        setTimeout(() => {
          expect(callback).toBeCalled();
          done();
        }, 0);
      }, 0);
    });
  });

  describe('interpolateColor', () => {
    it('should interpolate between two colors', () => {
      // Black to white
      expect(animationUtils.interpolateColor('#000000', '#ffffff', 0)).toBe('#000000');
      expect(animationUtils.interpolateColor('#000000', '#ffffff', 0.5)).toBe('#7f7f7f');
      expect(animationUtils.interpolateColor('#000000', '#ffffff', 1)).toBe('#ffffff');
      
      // Red to blue
      expect(animationUtils.interpolateColor('#ff0000', '#0000ff', 0)).toBe('#ff0000');
      expect(animationUtils.interpolateColor('#ff0000', '#0000ff', 0.5)).toBe('#7f007f');
      expect(animationUtils.interpolateColor('#ff0000', '#0000ff', 1)).toBe('#0000ff');
    });
  });

  describe('rafDebounce', () => {
    let originalRAF: any;
    let originalCAF: any;
    
    beforeEach(() => {
      // Mock requestAnimationFrame and cancelAnimationFrame
      originalRAF = window.requestAnimationFrame;
      originalCAF = window.cancelAnimationFrame;
      
      window.requestAnimationFrame = jest.fn((callback) => {
        return setTimeout(callback, 0) as unknown as number;
      });
      
      window.cancelAnimationFrame = jest.fn((id) => {
        clearTimeout(id as unknown as number);
      });
    });
    
    afterEach(() => {
      // Restore original functions
      window.requestAnimationFrame = originalRAF;
      window.cancelAnimationFrame = originalCAF;
    });
    
    it('should debounce calls using requestAnimationFrame', (done) => {
      const callback = jest.fn();
      const debouncedFn = animationUtils.rafDebounce(callback);
      
      // Call multiple times
      debouncedFn(1);
      debouncedFn(2);
      debouncedFn(3);
      
      // Only the last call should be executed
      setTimeout(() => {
        expect(callback.mock?.calls.length).toBe(1);
        expect(callback).toBeCalledWith(3);
        done();
      }, 0);
    });
  });

  // Basic tests for DOM-related functions
  describe('DOM-related functions', () => {
    it('should have fadeIn function', () => {
      expect(typeof animationUtils.fadeIn).toBe('function');
    });

    it('should have fadeOut function', () => {
      expect(typeof animationUtils.fadeOut).toBe('function');
    });

    it('should have createParallaxEffect function', () => {
      expect(typeof animationUtils.createParallaxEffect).toBe('function');
    });
  });
}); 