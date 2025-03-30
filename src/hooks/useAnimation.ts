/**
 * src/hooks/useAnimation.ts
 * Hook to work with animations using our animation utilities
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  animate,
  easingFunctions,
  fadeIn,
  fadeOut,
  createParallaxEffect,
} from '../utils/animationUtils';

/**
 * Animation configuration
 */
interface AnimationConfig {
  /** Initial value of the animation */
  initialValue?: number;
  /** Final value of the animation */
  finalValue?: number;
  /** Animation duration in milliseconds */
  duration?: number;
  /** Animation easing function */
  easing?: keyof typeof easingFunctions | ((t: number) => number);
  /** Whether to play the animation immediately on mount */
  autoplay?: boolean;
  /** Whether to play the animation in reverse when restarting */
  reverse?: boolean;
}

/**
 * Hook to control animations
 * @param config Animation configuration
 * @returns Animation state and control functions
 */
export function useAnimation(config: AnimationConfig = {}) {
  const {
    initialValue = 0,
    finalValue = 1,
    duration = 500,
    easing = 'easeInOutQuad',
    autoplay = false,
    reverse = false,
  } = config;

  // Animation state
  const [value, setValue] = useState(initialValue);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Reference to the cancel function
  const cancelRef = useRef<(() => void) | null>(null);
  
  // Function to play the animation
  const play = useCallback(() => {
    // Cancel any ongoing animation
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    
    setIsPlaying(true);
    setIsCompleted(false);
    
    const start = reverse ? finalValue : initialValue;
    const end = reverse ? initialValue : finalValue;
    
    cancelRef.current = animate(
      start,
      end,
      duration,
      easing,
      (val) => {
        setValue(val);
        
        // Check if animation has completed
        if (
          (reverse && val <= initialValue) || 
          (!reverse && val >= finalValue)
        ) {
          setIsPlaying(false);
          setIsCompleted(true);
          cancelRef.current = null;
        }
      }
    );
  }, [initialValue, finalValue, duration, easing, reverse]);
  
  // Function to pause the animation
  const pause = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
      setIsPlaying(false);
    }
  }, []);
  
  // Function to restart the animation
  const restart = useCallback(() => {
    setValue(initialValue);
    setIsCompleted(false);
    
    if (autoplay) {
      play();
    }
  }, [initialValue, autoplay, play]);
  
  // Function to reverse the animation
  const toggleReverse = useCallback(() => {
    return { ...config, reverse: !reverse };
  }, [config, reverse]);
  
  // Function to change animation configuration
  const updateConfig = useCallback(
    (newConfig: Partial<AnimationConfig>) => {
      return { ...config, ...newConfig };
    },
    [config]
  );
  
  // Autoplay the animation when requested
  useEffect(() => {
    if (autoplay) {
      play();
    }
    
    // Clean up on unmount
    return () => {
      if (cancelRef.current) {
        cancelRef.current();
      }
    };
  }, [autoplay, play]);
  
  return {
    value,
    isPlaying,
    isCompleted,
    play,
    pause,
    restart,
    toggleReverse,
    updateConfig,
  };
}

/**
 * Hook to apply fade effects to an element
 * @param options Fade options
 * @returns Fade control functions
 */
export function useFade(options: {
  duration?: number;
  easing?: keyof typeof easingFunctions | ((t: number) => number);
  initialVisible?: boolean;
} = {}) {
  const { 
    duration = 300, 
    easing = 'easeInOutQuad',
    initialVisible = false 
  } = options;
  
  const [isVisible, setIsVisible] = useState(initialVisible);
  const elementRef = useRef<HTMLElement | null>(null);
  
  // Function to set the target element
  const setElement = useCallback((el: HTMLElement | null) => {
    elementRef.current = el;
    
    // Apply initial visibility
    if (el) {
      if (initialVisible) {
        el.style.opacity = '1';
        el.style.display = '';
      } else {
        el.style.opacity = '0';
        el.style.display = 'none';
      }
    }
  }, [initialVisible]);
  
  // Function to show the element with a fade effect
  const show = useCallback(async () => {
    if (!elementRef.current) return;
    
    await fadeIn(elementRef.current, duration, easing);
    setIsVisible(true);
  }, [duration, easing]);
  
  // Function to hide the element with a fade effect
  const hide = useCallback(async () => {
    if (!elementRef.current) return;
    
    await fadeOut(elementRef.current, duration, easing);
    setIsVisible(false);
  }, [duration, easing]);
  
  // Function to toggle visibility
  const toggle = useCallback(async () => {
    if (isVisible) {
      await hide();
    } else {
      await show();
    }
  }, [isVisible, hide, show]);
  
  return {
    isVisible,
    setElement,
    show,
    hide,
    toggle,
    ref: setElement,
  };
}

/**
 * Hook to create a parallax effect
 * @param options Parallax options
 * @returns Function to set the target element
 */
export function useParallax(options: {
  speed?: number;
  direction?: 'horizontal' | 'vertical';
} = {}) {
  const { speed = 0.5, direction = 'vertical' } = options;
  
  // Function to set up the parallax effect
  const ref = useCallback(
    (element: HTMLElement | null) => {
      if (!element) return;
      
      const cleanup = createParallaxEffect(element, speed, direction);
      
      return () => {
        cleanup();
      };
    },
    [speed, direction]
  );
  
  return ref;
}

export default {
  useAnimation,
  useFade,
  useParallax,
}; 