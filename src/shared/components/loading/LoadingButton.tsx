// src/shared/components/loading/LoadingButton.tsx
// Componente de botón con estado de loading integrado

import React from 'react';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from './LoadingSpinner';
import { LoadingButtonProps, LoadingSize, LoadingVariant } from './types';

/**
 * LoadingButton - Botón con estado de loading integrado
 * Muestra un spinner cuando está cargando y deshabilita la interacción
 * Soporte completo para traducciones y diferentes variantes
 */
const LoadingButton: React.FC<LoadingButtonProps> = ({
  loading,
  loadingText,
  children,
  disabled = false,
  onClick,
  type = 'button',
  size = LoadingSize.SM,
  variant = LoadingVariant.WHITE,
  className = '',
  'data-testid': testId = 'loading-button'
}) => {
  const { t } = useTranslation();

  // Texto de loading por defecto con fallback
  const defaultLoadingText = loadingText || t('common.processing') || 'Procesando...';

  // Configuración de padding según tamaño
  const sizeConfig = {
    [LoadingSize.SM]: 'px-3 py-1.5 text-sm',
    [LoadingSize.MD]: 'px-4 py-2 text-base', 
    [LoadingSize.LG]: 'px-6 py-3 text-lg',
    [LoadingSize.XL]: 'px-8 py-4 text-xl'
  };

  // Configuración de colores para el botón
  const buttonVariantConfig = {
    [LoadingVariant.PRIMARY]: loading || disabled 
      ? 'bg-primary-400 cursor-not-allowed' 
      : 'bg-primary-600 hover:bg-primary-700 active:bg-primary-800',
    [LoadingVariant.SECONDARY]: loading || disabled
      ? 'bg-gray-400 cursor-not-allowed'
      : 'bg-gray-600 hover:bg-gray-700 active:bg-gray-800',
    [LoadingVariant.SUCCESS]: loading || disabled
      ? 'bg-green-400 cursor-not-allowed'
      : 'bg-green-600 hover:bg-green-700 active:bg-green-800',
    [LoadingVariant.WARNING]: loading || disabled
      ? 'bg-yellow-400 cursor-not-allowed'
      : 'bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800',
    [LoadingVariant.DANGER]: loading || disabled
      ? 'bg-red-400 cursor-not-allowed'
      : 'bg-red-600 hover:bg-red-700 active:bg-red-800',
    [LoadingVariant.WHITE]: loading || disabled
      ? 'bg-white/70 cursor-not-allowed border border-gray-300'
      : 'bg-white hover:bg-gray-50 active:bg-gray-100 border border-gray-300'
  };

  // Color del texto según variante
  const textColorConfig = {
    [LoadingVariant.WHITE]: 'text-gray-700',
    [LoadingVariant.PRIMARY]: 'text-white',
    [LoadingVariant.SECONDARY]: 'text-white',
    [LoadingVariant.SUCCESS]: 'text-white',
    [LoadingVariant.WARNING]: 'text-white',
    [LoadingVariant.DANGER]: 'text-white'
  };

  const handleClick = () => {
    if (!loading && !disabled && onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={loading || disabled}
      className={`
        inline-flex items-center justify-center
        ${sizeConfig[size]}
        ${buttonVariantConfig[variant]}
        ${textColorConfig[variant]}
        font-medium rounded-md
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
        transition-all duration-200 ease-in-out
        ${className}
      `}
      data-testid={testId}
      aria-label={loading ? defaultLoadingText : undefined}
    >
      {loading ? (
        <>
          {/* Spinner con espaciado adecuado */}
          <LoadingSpinner 
            size={size} 
            variant={variant}
            className="mr-2"
          />
          <span>{defaultLoadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

/**
 * Variantes predefinidas para casos comunes
 */
export const LoadingButtonVariants = {
  // Botón primario para acciones principales
  primary: (loading: boolean, children: React.ReactNode, onClick?: () => void) => (
    <LoadingButton
      loading={loading}
      variant={LoadingVariant.PRIMARY}
      size={LoadingSize.MD}
      onClick={onClick}
    >
      {children}
    </LoadingButton>
  ),

  // Botón de envío para formularios
  submit: (loading: boolean, text: string = 'Enviar') => (
    <LoadingButton
      type="submit"
      loading={loading}
      loadingText="Enviando..."
      variant={LoadingVariant.PRIMARY}
      size={LoadingSize.MD}
    >
      {text}
    </LoadingButton>
  ),

  // Botón de eliminación peligroso
  danger: (loading: boolean, children: React.ReactNode, onClick?: () => void) => (
    <LoadingButton
      loading={loading}
      loadingText="Eliminando..."
      variant={LoadingVariant.DANGER}
      size={LoadingSize.MD}
      onClick={onClick}
    >
      {children}
    </LoadingButton>
  ),

  // Botón secundario
  secondary: (loading: boolean, children: React.ReactNode, onClick?: () => void) => (
    <LoadingButton
      loading={loading}
      variant={LoadingVariant.SECONDARY}
      size={LoadingSize.MD}
      onClick={onClick}
    >
      {children}
    </LoadingButton>
  ),

  // Botón pequeño para acciones rápidas
  small: (loading: boolean, children: React.ReactNode, onClick?: () => void) => (
    <LoadingButton
      loading={loading}
      variant={LoadingVariant.PRIMARY}
      size={LoadingSize.SM}
      onClick={onClick}
    >
      {children}
    </LoadingButton>
  )
};

export default LoadingButton; 