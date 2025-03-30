/**
 * src/utils/animationUtils.ts
 * Utility functions for animations and transitions
 */

/**
 * Easing functions for animations
 */
export const easingFunctions = {
  // Linear, no easing
  linear: (t: number): number => t,
  
  // Quadratic easing in
  easeInQuad: (t: number): number => t * t,
  
  // Quadratic easing out
  easeOutQuad: (t: number): number => t * (2 - t),
  
  // Quadratic easing in and out
  easeInOutQuad: (t: number): number => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  
  // Cubic easing in
  easeInCubic: (t: number): number => t * t * t,
  
  // Cubic easing out
  easeOutCubic: (t: number): number => (--t) * t * t + 1,
  
  // Cubic easing in and out
  easeInOutCubic: (t: number): number => 
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  
  // Elastic easing in
  easeInElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  
  // Elastic easing out
  easeOutElastic: (t: number): number => {
    const c4 = (2 * Math.PI) / 3;
    return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  
  // Bounce easing out
  easeOutBounce: (t: number): number => {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  }
};

/**
 * Animation frame request that works cross-browser
 */
export const requestAnimFrame = 
  window.requestAnimationFrame ||
  window.webkitRequestAnimationFrame ||
  ((callback: FrameRequestCallback) => window.setTimeout(callback, 1000 / 60));

/**
 * Animation frame cancellation that works cross-browser
 */
export const cancelAnimFrame = 
  window.cancelAnimationFrame ||
  window.webkitCancelAnimationFrame ||
  window.clearTimeout;

/**
 * Animate a value from start to end
 * @param start Starting value
 * @param end Ending value
 * @param duration Duration in milliseconds
 * @param easing Easing function name from easingFunctions or custom function
 * @param callback Callback function called on each animation frame with current value
 * @returns A function to cancel the animation
 */
export function animate(
  start: number,
  end: number,
  duration: number,
  easing: keyof typeof easingFunctions | ((t: number) => number),
  callback: (value: number) => void
): () => void {
  const startTime = Date.now();
  let animationFrame: number;
  
  // Get easing function (default to linear)
  const easingFunction = typeof easing === 'function' 
    ? easing 
    : (easingFunctions[easing] || easingFunctions.linear);
  
  // Animation loop
  const animateFrame = () => {
    const currentTime = Date.now();
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const easedProgress = easingFunction(progress);
    const currentValue = start + (end - start) * easedProgress;
    
    callback(currentValue);
    
    if (progress < 1) {
      animationFrame = requestAnimFrame(animateFrame) as number;
    }
  };
  
  // Start animation
  animationFrame = requestAnimFrame(animateFrame) as number;
  
  // Return cancel function
  return () => {
    cancelAnimFrame(animationFrame);
  };
}

/**
 * Creates a debounced animation frame callback
 * @param callback The function to call on animation frame
 * @returns A function that schedules the callback for the next animation frame
 */
export function rafDebounce<T extends (...args: any[]) => void>(callback: T): T {
  let requestId: number | null = null;
  
  const debouncedFunction = ((...args: any[]) => {
    if (requestId) {
      cancelAnimFrame(requestId);
    }
    
    requestId = requestAnimFrame(() => {
      callback(...args);
      requestId = null;
    }) as number;
  }) as T;
  
  return debouncedFunction;
}

/**
 * Interpolates between two colors
 * @param color1 Starting color in hex format (#RRGGBB)
 * @param color2 Ending color in hex format (#RRGGBB)
 * @param progress Progress value between 0 and 1
 * @returns Interpolated color in hex format
 */
export function interpolateColor(color1: string, color2: string, progress: number): string {
  // Parse hex colors to RGB
  const r1 = parseInt(color1.substring(1, 3), 16);
  const g1 = parseInt(color1.substring(3, 5), 16);
  const b1 = parseInt(color1.substring(5, 7), 16);
  
  const r2 = parseInt(color2.substring(1, 3), 16);
  const g2 = parseInt(color2.substring(3, 5), 16);
  const b2 = parseInt(color2.substring(5, 7), 16);
  
  // Interpolate RGB values
  const r = Math.round(r1 + (r2 - r1) * progress);
  const g = Math.round(g1 + (g2 - g1) * progress);
  const b = Math.round(b1 + (b2 - b1) * progress);
  
  // Convert back to hex
  return `#${(r).toString(16).padStart(2, '0')}${(g).toString(16).padStart(2, '0')}${(b).toString(16).padStart(2, '0')}`;
}

/**
 * Creates a smooth parallax effect based on scroll position
 * @param element The element to apply the effect to
 * @param speed The speed factor (1 is normal, higher is faster)
 * @param direction 'horizontal' or 'vertical'
 * @returns A cleanup function to remove event listeners
 */
export function createParallaxEffect(
  element: HTMLElement,
  speed: number = 0.5,
  direction: 'horizontal' | 'vertical' = 'vertical'
): () => void {
  const handleScroll = () => {
    const scrollPos = direction === 'vertical' ? window.scrollY : window.scrollX;
    const offset = scrollPos * speed;
    
    if (direction === 'vertical') {
      element.style.transform = `translateY(${offset}px)`;
    } else {
      element.style.transform = `translateX(${offset}px)`;
    }
  };
  
  // Initial positioning
  handleScroll();
  
  // Add scroll listener
  window.addEventListener('scroll', handleScroll);
  
  // Return cleanup function
  return () => {
    window.removeEventListener('scroll', handleScroll);
  };
}

/**
 * Creates a smooth fade-in effect for an element
 * @param element The element to fade in
 * @param duration Duration in milliseconds
 * @param easing Easing function name or custom function
 * @returns A promise that resolves when the animation is complete
 */
export function fadeIn(
  element: HTMLElement,
  duration: number = 300,
  easing: keyof typeof easingFunctions | ((t: number) => number) = 'easeInOutQuad'
): Promise<void> {
  // Set initial style
  element.style.opacity = '0';
  element.style.display = '';
  
  return new Promise((resolve) => {
    animate(0, 1, duration, easing, (opacity) => {
      element.style.opacity = opacity.toString();
      if (opacity === 1) resolve();
    });
  });
}

/**
 * Creates a smooth fade-out effect for an element
 * @param element The element to fade out
 * @param duration Duration in milliseconds
 * @param easing Easing function name or custom function
 * @param hideAfter If true, sets display: none after the animation
 * @returns A promise that resolves when the animation is complete
 */
export function fadeOut(
  element: HTMLElement,
  duration: number = 300,
  easing: keyof typeof easingFunctions | ((t: number) => number) = 'easeInOutQuad',
  hideAfter: boolean = true
): Promise<void> {
  return new Promise((resolve) => {
    animate(1, 0, duration, easing, (opacity) => {
      element.style.opacity = opacity.toString();
      if (opacity === 0) {
        if (hideAfter) {
          element.style.display = 'none';
        }
        resolve();
      }
    });
  });
} 