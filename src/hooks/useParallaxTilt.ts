// File: src/hooks/useParallaxTilt.ts
// Purpose: Lightweight, dependency-free mouse parallax/tilt effect for desktop only
// Design notes:
// - Uses requestAnimationFrame to batch updates and avoid layout thrashing
// - Listens on window mousemove to start slightly before the cursor reaches the element
// - Applies transform to the target element only (no re-renders); safe with Tailwind scale on parent
// - Respects prefers-reduced-motion and disables below lg breakpoint to avoid conflicts on mobile/tablet
// - Keeps code simple, commented, and under 200 lines for maintainability

import { useEffect } from "react";

type ParallaxTiltOptions = {
  // Maximum degrees to tilt along each axis
  maxTiltDeg?: number; // default 10
  // Perspective depth for the 3D transform
  perspectivePx?: number; // default 800
  // Start reacting when mouse is within this margin (px) around the element
  activationMarginPx?: number; // default 120
  // Transition durations for enter/exit (ms)
  enterMs?: number; // default 120
  exitMs?: number; // default 180
  // Optional extra scale applied by transform (leave 1 to preserve outer Tailwind scale)
  scale?: number; // default 1
  // Desktop min width (Tailwind lg by default = 1024)
  desktopMinWidth?: number; // default 1024
  // Internal smoothing factor (0..1), higher = snappier; we keep subtle
  smoothingLerp?: number; // default 0.12
};

/**
 * Adds a subtle mouse-tilt parallax to a single element.
 * - Desktop only (>= desktopMinWidth)
 * - No effect when prefers-reduced-motion is set
 * - Proximity activation using activationMarginPx to begin reacting before hover
 */
export function useParallaxTilt(
  elementRef: React.RefObject<HTMLElement>,
  options: ParallaxTiltOptions = {}
) {
  useEffect(() => {
    const el = elementRef.current as HTMLElement | null;
    if (!el) return;

    // Respect user motion preferences
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      return;
    }

    const {
      maxTiltDeg = 10,
      perspectivePx = 800,
      activationMarginPx = 120,
      enterMs = 120,
      exitMs = 180,
      scale = 1,
      desktopMinWidth = 1024,
      smoothingLerp = 0.12,
    } = options;

    // Guard: desktop only
    const isDesktop = () => window.innerWidth >= desktopMinWidth;
    if (!isDesktop()) {
      // Ensure clean state on mount when not desktop
      el.style.transform = "";
      el.style.transition = "";
      el.style.willChange = "";
      el.style.transformStyle = "";
    }

    let rafId: number | null = null;
    let latestMouseX = 0;
    let latestMouseY = 0;
    let isActive = false; // inside activation area
    // Smoothed tilt state
    let currentTiltX = 0;
    let currentTiltY = 0;

    // Ensure GPU-friendly rendering
    el.style.willChange = "transform";
    el.style.transformStyle = "preserve-3d";

    const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

    const inExpandedBounds = (mx: number, my: number) => {
      const r = el.getBoundingClientRect();
      const x1 = r.left - activationMarginPx;
      const y1 = r.top - activationMarginPx;
      const x2 = r.right + activationMarginPx;
      const y2 = r.bottom + activationMarginPx;
      return mx >= x1 && mx <= x2 && my >= y1 && my <= y2;
    };

    const applyTilt = (mx: number, my: number) => {
      // Skip when not desktop to avoid conflicts with touch UIs
      if (!isDesktop()) return reset(true);
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;

      const dx = mx - cx;
      const dy = my - cy;
      // Normalize to [-1, 1]
      const nx = clamp(dx / (rect.width / 2), -1, 1);
      const ny = clamp(dy / (rect.height / 2), -1, 1);

      const targetTiltX = -(ny * maxTiltDeg); // invert so moving mouse up tilts back
      const targetTiltY = nx * maxTiltDeg;

      // Lerp towards target for smoother motion
      currentTiltX = currentTiltX + (targetTiltX - currentTiltX) * smoothingLerp;
      currentTiltY = currentTiltY + (targetTiltY - currentTiltY) * smoothingLerp;

      // Immediate transform during interaction; transition only on enter/exit
      el.style.transition = "";
      el.style.transform = `perspective(${perspectivePx}px) rotateX(${currentTiltX}deg) rotateY(${currentTiltY}deg) translateZ(0)`;
    };

    const reset = (instant = false) => {
      el.style.transition = instant ? "" : `transform ${exitMs}ms cubic-bezier(.22,1,.36,1)`;
      currentTiltX = 0;
      currentTiltY = 0;
      el.style.transform = `perspective(${perspectivePx}px) rotateX(0deg) rotateY(0deg) translateZ(0)`;
    };

    const onMove = (e: MouseEvent) => {
      latestMouseX = e.clientX;
      latestMouseY = e.clientY;

      const shouldActivate = isDesktop() && inExpandedBounds(latestMouseX, latestMouseY);
      if (shouldActivate && !isActive) {
        isActive = true;
        // Smoothly ramp into interaction from rest
        el.style.transition = `transform ${enterMs}ms cubic-bezier(.22,1,.36,1)`;
      } else if (!shouldActivate && isActive) {
        isActive = false;
        reset();
      }

      if (!isActive) return;

      if (rafId == null) {
        rafId = requestAnimationFrame(() => {
          applyTilt(latestMouseX, latestMouseY);
          rafId = null;
        });
      }
    };

    const onResize = () => {
      if (!isDesktop()) {
        // Disable effect and clear styles on smaller screens
        isActive = false;
        reset(true);
      }
    };

    // Init to resting state
    reset(true);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMove as any);
      window.removeEventListener("resize", onResize);
      // Leave element in clean resting state
      reset(true);
      el.style.willChange = "";
      el.style.transformStyle = "";
      el.style.transition = "";
    };
  }, [elementRef, options.maxTiltDeg, options.perspectivePx, options.activationMarginPx, options.enterMs, options.exitMs, options.scale, options.desktopMinWidth, options.smoothingLerp]);
}

export default useParallaxTilt;


