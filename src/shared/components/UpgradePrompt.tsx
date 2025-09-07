// src/shared/components/UpgradePrompt.tsx
// Componente reutilizable para mostrar prompt de upgrade cuando usuarios free intentan acceder a funciones premium

import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface UpgradePromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature: 'property' | 'reservation' | 'analytics' | 'export' | 'custom';
  customMessage?: string;
  recommendedPlan?: 'basic' | 'pro' | 'enterprise';
}

const UpgradePrompt: React.FC<UpgradePromptProps> = ({
  isOpen,
  onClose,
  feature,
  customMessage,
  recommendedPlan = 'basic'
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Función segura para cerrar el modal
  const handleClose = useCallback(() => {
    try {
      if (onClose && typeof onClose === 'function') {
        onClose();
      }
    } catch (error) {
      console.error('Error closing upgrade prompt:', error);
    }
  }, [onClose]);

  // Función segura para manejar el upgrade
  const handleUpgrade = useCallback(() => {
    try {
      // Cerrar el modal primero
      handleClose();
      
      // Guardar información del plan recomendado en localStorage
      const planPrices = {
        basic: 19,
        pro: 49,
        enterprise: 99
      };
      
      try {
        localStorage.setItem('selectedPlanId', recommendedPlan);
        localStorage.setItem('selectedPlanName', recommendedPlan.charAt(0).toUpperCase() + recommendedPlan.slice(1));
        localStorage.setItem('selectedPlanPrice', planPrices[recommendedPlan].toString());
      } catch (storageError) {
        console.warn('Could not save plan info to localStorage:', storageError);
      }
      
      // Navegar a pricing con un pequeño delay para evitar conflictos
      setTimeout(() => {
        try {
          navigate('/pricing');
        } catch (navError) {
          console.error('Error navigating to pricing:', navError);
          // Fallback: usar window.location
          window.location.href = '/pricing';
        }
      }, 100);
    } catch (error) {
      console.error('Error handling upgrade:', error);
      // Fallback: cerrar modal y navegar directamente
      handleClose();
      window.location.href = '/pricing';
    }
  }, [handleClose, navigate, recommendedPlan]);

  if (!isOpen) return null;

  // Mensajes por defecto para cada feature con traducciones
  const featureMessages = {
    property: {
      title: t('upgrade.features.property.title') || 'Suscripción requerida para crear propiedades',
      description: t('upgrade.features.property.description') || 'Con un plan de suscripción podrás crear y gestionar múltiples propiedades, añadir imágenes, documentos y acceder a todas las funcionalidades avanzadas.'
    },
    reservation: {
      title: t('upgrade.features.reservation.title') || 'Límite de reservas alcanzado',
      description: t('upgrade.features.reservation.description') || 'Actualiza tu plan para gestionar más reservas y acceder a funciones avanzadas de administración.'
    },
    analytics: {
      title: t('upgrade.features.analytics.title') || 'Analytics - Función Premium',
      description: t('upgrade.features.analytics.description') || 'Obtén insights valiosos sobre el rendimiento de tus propiedades y reservas con nuestros planes de suscripción.'
    },
    export: {
      title: t('upgrade.features.export.title') || 'Exportación de datos - Función Pro',
      description: t('upgrade.features.export.description') || 'Exporta tus datos en múltiples formatos con nuestros planes Pro y Enterprise.'
    },
    custom: {
      title: customMessage || t('upgrade.features.custom.title') || 'Función Premium',
      description: t('upgrade.features.custom.description') || 'Esta funcionalidad está disponible en nuestros planes de suscripción.'
    }
  };

  const currentFeature = featureMessages[feature] || featureMessages.custom;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        // Cerrar si se hace clic en el fondo
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        {/* Fondo oscuro */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>

        {/* Spacer para centrar */}
        <span
          className="hidden sm:inline-block sm:align-middle sm:h-screen"
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle max-w-lg w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {currentFeature.title}
              </h3>
              <button
                onClick={handleClose}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label={t('common.close')}
              >
                <span className="sr-only">{t('common.close')}</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white px-4 pt-0 pb-4 sm:p-6 sm:pt-0">
            {/* Description */}
            {currentFeature.description && (
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  {currentFeature.description}
                </p>
              </div>
            )}

            {/* Plan recommendations */}
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="w-5 h-5 text-primary-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-primary-800 mb-2">
                    {t('upgrade.plans.professional.recommend') || 'Te recomendamos el plan'} <span className="font-semibold">Professional</span>
                  </p>
                  <ul className="text-sm text-primary-700 space-y-1 text-left">
                    {recommendedPlan === 'basic' && (
                      <>
                        <li className="flex items-center text-left">
                          <svg className="w-4 h-4 text-primary-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {t('upgrade.plans.professional.features.properties') || 'Hasta 5 propiedades'}
                        </li>
                        <li className="flex items-center text-left">
                          <svg className="w-4 h-4 text-primary-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {t('upgrade.plans.professional.features.basic') || 'Todo lo de Básico'}
                        </li>
                        <li className="flex items-center text-left">
                          <svg className="w-4 h-4 text-primary-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {t('upgrade.plans.professional.features.priority') || 'Atención prioritaria'}
                        </li>
                        <li className="flex items-center text-left">
                          <svg className="w-4 h-4 text-primary-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {t('upgrade.plans.professional.features.analytics') || 'Analíticas e informes avanzados'}
                        </li>
                        <li className="flex items-center text-left">
                          <svg className="w-4 h-4 text-primary-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {t('pricing.features.maintenanceCleaningCoordination') || 'Coordinación con equipos de limpieza y mantenimiento'}
                        </li>
                      </>
                    )}
                    {recommendedPlan === 'pro' && (
                      <>
                        <li className="flex items-center">
                          <svg className="w-4 h-4 text-primary-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {t('upgrade.plans.pro.features.unlimited_properties') || 'Propiedades ilimitadas'}
                        </li>
                        <li className="flex items-center">
                          <svg className="w-4 h-4 text-primary-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {t('upgrade.plans.pro.features.unlimited_reservations') || 'Reservas ilimitadas'}
                        </li>
                        <li className="flex items-center">
                          <svg className="w-4 h-4 text-primary-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {t('upgrade.plans.pro.features.advanced_analytics') || 'Analytics avanzado'}
                        </li>
                        <li className="flex items-center">
                          <svg className="w-4 h-4 text-primary-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {t('upgrade.plans.pro.features.data_export') || 'Exportación de datos'}
                        </li>
                      </>
                    )}
                    {recommendedPlan === 'enterprise' && (
                      <>
                        <li className="flex items-center">
                          <svg className="w-4 h-4 text-primary-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {t('upgrade.plans.enterprise.features.everything_pro') || 'Todo lo de Pro'}
                        </li>
                        <li className="flex items-center">
                          <svg className="w-4 h-4 text-primary-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {t('upgrade.plans.enterprise.features.priority_support') || 'Soporte prioritario'}
                        </li>
                        <li className="flex items-center">
                          <svg className="w-4 h-4 text-primary-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          {t('upgrade.plans.enterprise.features.custom_integrations') || 'Integraciones personalizadas'}
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleClose}
                className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                {t('upgrade.actions.later') || 'Más tarde'}
              </button>
              <button
                onClick={handleUpgrade}
                className="w-full sm:w-auto px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
              >
                {t('upgrade.actions.viewPlans') || 'Ver planes disponibles'}
              </button>
            </div>

            {/* Free tier reminder */}
            <div className="mt-4 text-center">
              <p className="text-xs text-gray-500">
                {t('upgrade.freeReminder') || 'Puedes seguir explorando la aplicación con tu cuenta gratuita'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpgradePrompt; 