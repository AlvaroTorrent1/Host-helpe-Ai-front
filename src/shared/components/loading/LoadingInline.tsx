// src/shared/components/loading/LoadingInline.tsx
// Componente para loading inline dentro de otros componentes

import React from 'react';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from './LoadingSpinner';
import { LoadingInlineProps, LoadingSize, LoadingVariant } from './types';

/**
 * LoadingInline - Componente de loading para usar dentro de otros componentes
 * Útil para spinners locales en formularios, listas, botones, etc.
 * Soporte para layout horizontal y vertical
 */
const LoadingInline: React.FC<LoadingInlineProps> = ({
  message,
  direction = 'horizontal',
  gap = 'md',
  size = LoadingSize.MD,
  variant = LoadingVariant.PRIMARY,
  className = '',
  'data-testid': testId = 'loading-inline'
}) => {
  const { t } = useTranslation();

  // Mensaje por defecto con fallback
  const defaultMessage = message || t('common.loading') || 'Cargando...';

  // Configuración de gaps
  const gapConfig = {
    sm: direction === 'horizontal' ? 'space-x-2' : 'space-y-1',
    md: direction === 'horizontal' ? 'space-x-3' : 'space-y-2', 
    lg: direction === 'horizontal' ? 'space-x-4' : 'space-y-3'
  };

  // Configuración de dirección
  const directionClasses = direction === 'horizontal' 
    ? 'flex items-center'
    : 'flex flex-col items-center';

  return (
    <div 
      className={`
        ${directionClasses}
        ${gapConfig[gap]}
        ${className}
      `}
      data-testid={testId}
      role="status"
      aria-live="polite"
      aria-label={defaultMessage}
    >
      {/* Spinner */}
      <LoadingSpinner 
        size={size} 
        variant={variant}
      />
      
      {/* Mensaje (opcional) */}
      {message && (
        <span 
          className={`
            text-gray-600 font-medium
            ${size === LoadingSize.SM ? 'text-sm' : 
              size === LoadingSize.LG ? 'text-lg' : 
              size === LoadingSize.XL ? 'text-xl' : 'text-base'}
          `}
        >
          {defaultMessage}
        </span>
      )}
      
      {/* Texto de accesibilidad (screen reader) */}
      <span className="sr-only">{defaultMessage}</span>
    </div>
  );
};

/**
 * Variantes predefinidas para casos comunes
 */
export const LoadingInlineVariants = {
  // Para usar en listas y grids
  list: (message?: string) => (
    <div className="flex justify-center py-8">
      <LoadingInline
        message={message}
        size={LoadingSize.LG}
        variant={LoadingVariant.PRIMARY}
        direction="vertical"
      />
    </div>
  ),

  // Para usar en formularios
  form: (message?: string) => (
    <LoadingInline
      message={message}
      size={LoadingSize.MD}
      variant={LoadingVariant.PRIMARY}
      direction="horizontal"
      gap="sm"
    />
  ),

  // Para usar en botones (sin texto)
  button: () => (
    <LoadingInline
      size={LoadingSize.SM}
      variant={LoadingVariant.WHITE}
      className="justify-center"
    />
  ),

  // Para usar en tarjetas
  card: (message?: string) => (
    <div className="text-center py-6">
      <LoadingInline
        message={message}
        size={LoadingSize.MD}
        variant={LoadingVariant.PRIMARY}
        direction="vertical"
        gap="md"
      />
    </div>
  )
};

export default LoadingInline; 