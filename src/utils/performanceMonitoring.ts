// File: src/utils/performanceMonitoring.ts
// Sistema de monitoreo de performance usando Web Vitals
// Trackea métricas críticas: LCP, INP (antes FID), CLS, FCP, TTFB

import { onCLS, onINP, onFCP, onLCP, onTTFB, type Metric } from 'web-vitals';

// ✅ THRESHOLDS: Valores recomendados por Google
const THRESHOLDS = {
  // Largest Contentful Paint: < 2.5s es bueno
  LCP: { good: 2500, poor: 4000 },
  // Interaction to Next Paint: < 200ms es bueno (reemplaza FID)
  INP: { good: 200, poor: 500 },
  // Cumulative Layout Shift: < 0.1 es bueno
  CLS: { good: 0.1, poor: 0.25 },
  // First Contentful Paint: < 1.8s es bueno
  FCP: { good: 1800, poor: 3000 },
  // Time to First Byte: < 800ms es bueno
  TTFB: { good: 800, poor: 1800 },
};

// ✅ CLASIFICACIÓN: Determinar si la métrica es buena/media/mala
const getRating = (metric: Metric): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = THRESHOLDS[metric.name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';

  if (metric.value <= threshold.good) return 'good';
  if (metric.value <= threshold.poor) return 'needs-improvement';
  return 'poor';
};

// ✅ HANDLER: Procesar y loggear métricas
const handleMetric = (metric: Metric) => {
  const rating = getRating(metric);
  const emoji = rating === 'good' ? '✅' : rating === 'needs-improvement' ? '⚠️' : '❌';
  
  // Log en consola (solo en desarrollo)
  if (import.meta.env.DEV) {
    console.log(
      `${emoji} [Performance] ${metric.name}:`,
      `${metric.value.toFixed(2)}ms`,
      `(${rating})`
    );
  }

  // ✅ ENVIAR A ANALYTICS: En producción enviar a Google Analytics
  if (import.meta.env.PROD && window.gtag) {
    window.gtag('event', metric.name, {
      event_category: 'Web Vitals',
      event_label: metric.id,
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      metric_rating: rating,
      non_interaction: true,
    });
  }

  // ✅ STORAGE: Guardar métricas en localStorage para análisis posterior
  try {
    const perfData = JSON.parse(localStorage.getItem('perf_metrics') || '{}');
    perfData[metric.name] = {
      value: metric.value,
      rating,
      timestamp: Date.now(),
    };
    localStorage.setItem('perf_metrics', JSON.stringify(perfData));
  } catch (error) {
    // Ignorar errores de storage (puede estar lleno o deshabilitado)
  }
};

/**
 * ✅ SETUP: Inicializar monitoreo de performance
 * Llamar en main.tsx al inicio de la app
 * 
 * Métricas monitoreadas:
 * - LCP (Largest Contentful Paint): Tiempo hasta renderizar contenido principal
 * - INP (Interaction to Next Paint): Responsividad durante interacciones (reemplaza FID)
 * - CLS (Cumulative Layout Shift): Estabilidad visual durante carga
 * - FCP (First Contentful Paint): Tiempo hasta primer contenido
 * - TTFB (Time to First Byte): Tiempo de respuesta del servidor
 */
export const setupPerformanceMonitoring = () => {
  try {
    // ✅ LARGEST CONTENTFUL PAINT: Tiempo hasta contenido principal visible
    onLCP(handleMetric);

    // ✅ INTERACTION TO NEXT PAINT: Responsividad durante interacciones (nueva métrica Core Web Vital)
    onINP(handleMetric);

    // ✅ CUMULATIVE LAYOUT SHIFT: Estabilidad visual
    onCLS(handleMetric);

    // ✅ FIRST CONTENTFUL PAINT: Tiempo hasta primer pixel
    onFCP(handleMetric);

    // ✅ TIME TO FIRST BYTE: Velocidad del servidor
    onTTFB(handleMetric);

    if (import.meta.env.DEV) {
      console.log('🚀 [Performance] Monitoring initialized');
    }
  } catch (error) {
    console.error('❌ [Performance] Failed to initialize monitoring:', error);
  }
};

/**
 * ✅ HELPER: Obtener métricas guardadas
 * Útil para debugging o mostrar en panel de admin
 */
export const getStoredMetrics = () => {
  try {
    return JSON.parse(localStorage.getItem('perf_metrics') || '{}');
  } catch {
    return {};
  }
};

/**
 * ✅ HELPER: Limpiar métricas guardadas
 */
export const clearStoredMetrics = () => {
  localStorage.removeItem('perf_metrics');
};

/**
 * ✅ HELPER: Log de navegación (para medir tiempo entre rutas)
 */
let lastNavigationTime = Date.now();

export const logNavigationPerformance = (routeName: string) => {
  const now = Date.now();
  const timeSinceLastNav = now - lastNavigationTime;
  
  if (import.meta.env.DEV && timeSinceLastNav > 100) {
    console.log(`⏱️ [Navigation] ${routeName}: ${timeSinceLastNav}ms since last route`);
  }
  
  lastNavigationTime = now;
};

// ✅ TYPE AUGMENTATION: Agregar gtag al window
declare global {
  interface Window {
    gtag?: (
      command: string,
      eventName: string,
      eventParams: Record<string, any>
    ) => void;
  }
}

