// src/features/sesregistro/components/wizard/WizardProgressBar.tsx
/**
 * Barra de progreso del wizard de añadir viajero
 * Muestra 4 pasos con indicación visual del paso actual
 */

import React from 'react';
import { WizardStep } from '../../types';
import { WIZARD_STEPS, TOTAL_WIZARD_STEPS } from '../../constants';

interface WizardProgressBarProps {
  currentStep: WizardStep;
}

const WizardProgressBar: React.FC<WizardProgressBarProps> = ({ currentStep }) => {
  const currentStepNumber = WIZARD_STEPS[currentStep].order;
  const progressPercentage = ((currentStepNumber - 1) / (TOTAL_WIZARD_STEPS - 1)) * 100;

  return (
    <div className="w-full mb-8">
      {/* Barra de progreso */}
      <div className="relative">
        {/* Línea de fondo gris */}
        <div className="h-1 bg-gray-200 rounded-full">
          {/* Línea de progreso naranja */}
          <div
            className="h-1 bg-primary rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Indicadores de pasos */}
        <div className="absolute top-0 left-0 w-full flex justify-between -mt-2">
          {Array.from({ length: TOTAL_WIZARD_STEPS }, (_, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStepNumber;
            const isCurrent = stepNumber === currentStepNumber;

            return (
              <div
                key={stepNumber}
                className="flex flex-col items-center"
              >
                {/* Círculo del paso */}
                <div
                  className={`
                    w-5 h-5 rounded-full flex items-center justify-center
                    transition-all duration-300 border-2
                    ${
                      isCompleted
                        ? 'bg-primary border-primary'
                        : isCurrent
                        ? 'bg-primary border-primary'
                        : 'bg-white border-gray-300'
                    }
                  `}
                >
                  {isCompleted ? (
                    // Check mark para pasos completados
                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    // Número del paso
                    <span
                      className={`
                        text-xs font-semibold
                        ${isCurrent ? 'text-white' : 'text-gray-400'}
                      `}
                    >
                      {stepNumber}
                    </span>
                  )}
                </div>

                {/* Línea vertical opcional en móvil (oculta por ahora) */}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WizardProgressBar;


