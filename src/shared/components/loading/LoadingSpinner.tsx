// src/shared/components/loading/LoadingSpinner.tsx
// Componente base para spinner de carga con animación elegante

import React from 'react';
import { LoadingSpinnerProps, LoadingSize, LoadingVariant } from './types';

/**
 * Componente base LoadingSpinner
 * Proporciona un spinner animado elegante con diferentes tamaños y variantes
 * Basado en la animación de la segunda imagen del usuario
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = LoadingSize.MD,
  variant = LoadingVariant.PRIMARY,
  className = '',
  'data-testid': testId = 'loading-spinner'
}) => {
  // Configuración de tamaños
  const sizeConfig = {
    [LoadingSize.SM]: {
      container: 'w-4 h-4',
      border: 'border-2',
      thickness: '2px'
    },
    [LoadingSize.MD]: {
      container: 'w-6 h-6',
      border: 'border-2',
      thickness: '2px'
    },
    [LoadingSize.LG]: {
      container: 'w-8 h-8',
      border: 'border-3',
      thickness: '3px'
    },
    [LoadingSize.XL]: {
      container: 'w-12 h-12',
      border: 'border-4',
      thickness: '4px'
    }
  };

  // Configuración de colores por variante
  const variantConfig = {
    [LoadingVariant.PRIMARY]: {
      border: 'border-primary-200',
      accent: 'border-t-primary-600',
      glow: 'shadow-primary-200'
    },
    [LoadingVariant.SECONDARY]: {
      border: 'border-gray-200',
      accent: 'border-t-gray-600',
      glow: 'shadow-gray-200'
    },
    [LoadingVariant.SUCCESS]: {
      border: 'border-green-200',
      accent: 'border-t-green-600',
      glow: 'shadow-green-200'
    },
    [LoadingVariant.WARNING]: {
      border: 'border-yellow-200',
      accent: 'border-t-yellow-600',
      glow: 'shadow-yellow-200'
    },
    [LoadingVariant.DANGER]: {
      border: 'border-red-200',
      accent: 'border-t-red-600',
      glow: 'shadow-red-200'
    },
    [LoadingVariant.WHITE]: {
      border: 'border-white/30',
      accent: 'border-t-white',
      glow: 'shadow-white/50'
    }
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  return (
    <div 
      className={`
        relative inline-block
        ${currentSize.container}
        ${className}
      `}
      data-testid={testId}
      role="status"
      aria-label="Cargando"
    >
      {/* Spinner principal con animación elegante */}
      <div
        className={`
          ${currentSize.container}
          ${currentSize.border}
          ${currentVariant.border}
          ${currentVariant.accent}
          rounded-full
          animate-spin
          transition-all
          duration-200
          ease-in-out
        `}
        style={{
          animationDuration: '1s',
          animationTimingFunction: 'cubic-bezier(0.4, 0, 0.6, 1)'
        }}
      />
      
      {/* Anillo de brillo sutil para efecto elegante */}
      <div
        className={`
          absolute
          inset-0
          ${currentSize.container}
          ${currentSize.border}
          border-transparent
          ${currentVariant.accent}
          rounded-full
          animate-pulse
          opacity-50
        `}
        style={{
          animationDuration: '2s'
        }}
      />

      {/* Texto de accesibilidad (screen reader) */}
      <span className="sr-only">Cargando contenido...</span>
    </div>
  );
};

/**
 * Hook personalizado para usar el spinner con configuración predeterminada
 */
export const useLoadingSpinner = (
  size: LoadingSize = LoadingSize.MD,
  variant: LoadingVariant = LoadingVariant.PRIMARY
) => {
  return React.useMemo(
    () => (
      <LoadingSpinner 
        size={size} 
        variant={variant} 
      />
    ),
    [size, variant]
  );
};

export default LoadingSpinner; 