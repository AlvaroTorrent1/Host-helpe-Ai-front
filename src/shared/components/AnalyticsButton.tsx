import React from 'react';

interface AnalyticsButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  category: string;
  action: string;
  label?: string;
  value?: number;
  className?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

/**
 * Botón con seguimiento de Google Analytics integrado
 * Registra automáticamente el evento en GA cuando se hace clic
 */
const AnalyticsButton: React.FC<AnalyticsButtonProps> = ({
  children,
  onClick,
  category,
  action,
  label,
  value,
  className = '',
  disabled = false,
  type = 'button',
}) => {
  const handleClick = () => {
    // Registrar el evento en Google Analytics usando importación dinámica
    import('@services/analytics').then(({ logEvent }) => {
      try {
        logEvent(category, action, label, value);
      } catch (error) {
        console.error('Error al registrar evento:', error);
      }
    }).catch(error => {
      console.error('Error al importar servicio de analytics:', error);
    });
    
    // Llamar al manejador de eventos personalizado si existe
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      className={className}
      onClick={handleClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default AnalyticsButton; 