// src/shared/components/loading/LoadingScreen.tsx
// Componente de pantalla de carga completa con animación elegante

import React from 'react';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from './LoadingSpinner';
import { LoadingScreenProps, LoadingSize, LoadingVariant } from './types';

/**
 * LoadingScreen - Pantalla de carga completa
 * Reemplaza el logo estático con animación elegante y soporte multiidioma
 * Diseñado para casos como autenticación, inicialización de la app, etc.
 */
const LoadingScreen: React.FC<LoadingScreenProps> = ({
  message,
  subtext,
  showLogo = false,
  customContent,
  gradient = true,
  transparent = false,
  size = LoadingSize.XL,
  variant = LoadingVariant.PRIMARY,
  className = '',
  'data-testid': testId = 'loading-screen'
}) => {
  const { t } = useTranslation();

  // Mensajes por defecto con fallback
  const defaultMessage = message || t('common.loading') || 'Cargando...';
  const defaultSubtext = subtext || t('common.loadingSubtext') || 'Esto solo tomará unos segundos';

  // Configuración de fondo
  const backgroundClasses = transparent 
    ? 'bg-white/90 backdrop-blur-sm'
    : gradient
    ? 'bg-gradient-to-br from-gray-50 to-gray-100'
    : 'bg-white';

  return (
    <div 
      className={`
        fixed inset-0 
        ${backgroundClasses}
        flex items-center justify-center 
        z-50 
        transition-opacity duration-300 ease-in-out
        ${className}
      `}
      data-testid={testId}
      role="dialog"
      aria-live="polite"
      aria-label={defaultMessage}
    >
      <div className="text-center space-y-6 max-w-sm mx-auto px-4">
        {/* Logo opcional (para casos específicos como autenticación) */}
        {showLogo && (
          <div 
            className="flex justify-center" 
            style={{ animation: 'fadeIn 0.6s ease-out' }}
          >
            <img 
              src="/imagenes/Logo_hosthelper_new.png" 
              alt="Host Helper AI" 
              className="h-16 w-auto opacity-80"
            />
          </div>
        )}
        
        {/* Contenido personalizado o spinner por defecto */}
        {customContent ? (
          customContent
        ) : (
          <div className="relative">
            {/* Spinner principal con efecto de brillo */}
            <div className="relative flex justify-center">
              <LoadingSpinner 
                size={size} 
                variant={variant}
                className="drop-shadow-sm"
              />
              
              {/* Efecto de pulso sutil en el fondo */}
              <div className="absolute inset-0 flex justify-center items-center">
                <div 
                  className={`
                    w-20 h-20 
                    rounded-full 
                    bg-primary-500/10 
                    animate-ping
                  `}
                  style={{
                    animationDuration: '3s',
                    animationDelay: '0.5s'
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Mensaje principal */}
        <div className="space-y-3" style={{ 
          animation: 'fadeInUp 0.8s ease-out 0.2s both' 
        }}>
          <h2 className="text-xl font-semibold text-gray-800 tracking-wide">
            {defaultMessage}
          </h2>
          
          {/* Subtexto */}
          <p className="text-gray-600 text-sm leading-relaxed">
            {defaultSubtext}
          </p>
        </div>

        {/* Indicador de progreso visual sutil */}
        <div className="w-32 mx-auto">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary-500 rounded-full"
              style={{
                animation: 'loadingBar 2s ease-in-out infinite'
              }}
            />
          </div>
        </div>
      </div>

      {/* CSS personalizado para animaciones */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateY(10px); 
          }
          to { 
            opacity: 1; 
            transform: translateY(0); 
          }
        }
        
        @keyframes loadingBar {
          0% { 
            transform: translateX(-100%); 
            width: 0%; 
          }
          50% { 
            width: 40%; 
          }
          100% { 
            transform: translateX(100%); 
            width: 0%; 
          }
        }
      `}</style>
    </div>
  );
};

/**
 * Variantes predefinidas para casos de uso comunes
 */
export const LoadingScreenVariants = {
  // Para autenticación (con logo)
  auth: (message?: string) => (
    <LoadingScreen
      message={message}
      showLogo={true}
      variant={LoadingVariant.PRIMARY}
      size={LoadingSize.LG}
    />
  ),
  
  // Para carga general de datos
  data: (message?: string) => (
    <LoadingScreen
      message={message}
      showLogo={false}
      variant={LoadingVariant.PRIMARY}
      size={LoadingSize.LG}
    />
  ),
  
  // Para pagos
  payment: (message?: string) => (
    <LoadingScreen
      message={message || 'Procesando pago...'}
      showLogo={false}
      variant={LoadingVariant.SUCCESS}
      size={LoadingSize.LG}
    />
  ),
  
  // Para overlay transparente
  overlay: (message?: string) => (
    <LoadingScreen
      message={message}
      transparent={true}
      showLogo={false}
      variant={LoadingVariant.PRIMARY}
      size={LoadingSize.MD}
    />
  )
};

export default LoadingScreen; 