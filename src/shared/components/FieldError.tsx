// src/shared/components/FieldError.tsx
/**
 * Componente para mostrar mensajes de error de validación
 * en los campos de formulario
 */

import React from 'react';

interface FieldErrorProps {
  error?: string;
  show?: boolean;
}

export const FieldError: React.FC<FieldErrorProps> = ({ error, show = true }) => {
  if (!error || !show) return null;

  return (
    <p className="mt-1 text-sm text-red-600 flex items-start">
      <svg 
        className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" 
        fill="currentColor" 
        viewBox="0 0 20 20"
      >
        <path 
          fillRule="evenodd" 
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" 
          clipRule="evenodd" 
        />
      </svg>
      <span>{error}</span>
    </p>
  );
};

export default FieldError;

