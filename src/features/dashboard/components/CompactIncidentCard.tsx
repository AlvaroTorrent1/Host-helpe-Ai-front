// src/features/dashboard/components/CompactIncidentCard.tsx
// Componente optimizado para mostrar métricas de incidencias en móvil de forma compacta

import React from 'react';
import { useTranslation } from 'react-i18next';

interface CompactIncidentCardProps {
  pendingIncidents: number;
  resolutionRate: number;
  className?: string;
}

const CompactIncidentCard: React.FC<CompactIncidentCardProps> = ({
  pendingIncidents,
  resolutionRate,
  className = '',
}) => {
  const { t } = useTranslation();

  // Determinar color del indicador basado en la tasa de resolución
  const getStatusColor = () => {
    if (resolutionRate >= 80) return 'text-green-600 bg-green-50';
    if (resolutionRate >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  // Determinar color para incidencias pendientes
  const getPendingColor = () => {
    if (pendingIncidents === 0) return 'text-green-600';
    if (pendingIncidents <= 2) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-lg shadow p-3 ${className}`}>
      {/* Header con título e icono */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {t('dashboard.stats.incidents')}
        </h3>
        <div className="rounded-md p-1.5 bg-primary-50 text-primary-600">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      {/* Métricas principales en layout horizontal */}
      <div className="flex items-center justify-between">
        {/* Incidencias pendientes */}
        <div className="flex items-center space-x-2">
          <div className={`text-lg font-semibold ${getPendingColor()}`}>
            {pendingIncidents}
          </div>
          <span className="text-xs text-gray-500">
            {pendingIncidents === 1 ? 'Pendiente' : 'Pendientes'}
          </span>
        </div>

        {/* Separador visual */}
        <div className="h-8 w-px bg-gray-200 mx-3"></div>

        {/* Tasa de resolución */}
        <div className="flex items-center space-x-2">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
            {resolutionRate}% {t('dashboard.stats.resolved', { defaultValue: 'Resueltas' })}
          </div>
        </div>
      </div>

      {/* Footer informativo */}
      <div className="mt-2 pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          {pendingIncidents === 0 
            ? '🎉 ¡Todas las incidencias resueltas!'
            : `${t('dashboard.stats.resolutionRate', { rate: resolutionRate })}`
          }
        </p>
      </div>
    </div>
  );
};

export default CompactIncidentCard;
