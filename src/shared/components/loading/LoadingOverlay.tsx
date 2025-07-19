// src/shared/components/loading/LoadingOverlay.tsx
// Componente de overlay de loading sobre contenido existente

import React from 'react';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from './LoadingSpinner';
import { LoadingOverlayProps, LoadingSize, LoadingVariant } from './types';

/**
 * LoadingOverlay - Overlay de loading sobre contenido existente
 * Útil para mostrar loading state sin reemplazar completamente el contenido
 * Soporte para diferentes niveles de transparencia y efectos de blur
 */
const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  message,
  blur = false,
  transparent = false,
  zIndex = 40,
  size = LoadingSize.LG,
  variant = LoadingVariant.PRIMARY,
  className = '',
  'data-testid': testId = 'loading-overlay'
}) => {
  const { t } = useTranslation();

  // Mensaje por defecto con fallback
  const defaultMessage = message || t('common.loading') || 'Cargando...';

  // Configuración de fondo
  const backgroundClasses = transparent 
    ? 'bg-white/50'
    : 'bg-white/90';

  // Configuración de blur
  const blurClasses = blur ? 'backdrop-blur-sm' : '';

  // Configuración de z-index
  const zIndexStyle = { zIndex };

  return (
    <div 
      className={`
        absolute inset-0
        ${backgroundClasses}
        ${blurClasses}
        flex items-center justify-center
        transition-all duration-200 ease-in-out
        ${className}
      `}
      style={zIndexStyle}
      data-testid={testId}
      role="status"
      aria-live="polite"
      aria-label={defaultMessage}
    >
      <div className="text-center space-y-4 max-w-xs mx-auto px-4">
        {/* Contenedor del spinner con efecto sutil */}
        <div className="relative">
          <LoadingSpinner 
            size={size} 
            variant={variant}
            className="drop-shadow-sm"
          />
          
          {/* Efecto de pulso sutil en el fondo */}
          <div className="absolute inset-0 flex justify-center items-center">
            <div 
              className={`
                w-16 h-16 
                rounded-full 
                bg-primary-500/5 
                animate-ping
              `}
              style={{
                animationDuration: '2s',
                animationDelay: '0.3s'
              }}
            />
          </div>
        </div>

        {/* Mensaje (opcional) */}
        {message && (
          <div className="space-y-2">
            <p className="text-gray-700 font-medium text-base">
              {defaultMessage}
            </p>
            <p className="text-gray-500 text-sm">
              {t('common.loadingSubtext') || 'Esto solo tomará unos segundos'}
            </p>
          </div>
        )}

        {/* Texto de accesibilidad (screen reader) */}
        <span className="sr-only">{defaultMessage}</span>
      </div>
    </div>
  );
};

/**
 * Variantes predefinidas para casos comunes
 */
export const LoadingOverlayVariants = {
  // Overlay estándar con mensaje
  standard: (message?: string) => (
    <LoadingOverlay
      message={message}
      blur={false}
      transparent={false}
      size={LoadingSize.LG}
      variant={LoadingVariant.PRIMARY}
    />
  ),

  // Overlay transparente sin blur
  transparent: (message?: string) => (
    <LoadingOverlay
      message={message}
      blur={false}
      transparent={true}
      size={LoadingSize.MD}
      variant={LoadingVariant.PRIMARY}
    />
  ),

  // Overlay con efecto blur
  blurred: (message?: string) => (
    <LoadingOverlay
      message={message}
      blur={true}
      transparent={false}
      size={LoadingSize.LG}
      variant={LoadingVariant.PRIMARY}
    />
  ),

  // Overlay sutil para operaciones rápidas
  subtle: () => (
    <LoadingOverlay
      blur={false}
      transparent={true}
      size={LoadingSize.MD}
      variant={LoadingVariant.SECONDARY}
      zIndex={30}
    />
  ),

  // Overlay para formularios
  form: (message?: string) => (
    <LoadingOverlay
      message={message || 'Guardando...'}
      blur={true}
      transparent={false}
      size={LoadingSize.MD}
      variant={LoadingVariant.PRIMARY}
      zIndex={45}
    />
  )
};

export default LoadingOverlay; 