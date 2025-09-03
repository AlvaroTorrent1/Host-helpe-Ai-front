// src/features/dashboard/components/MinimalIncidentMetrics.tsx  
// Métricas super minimalistas para incidencias en una sola línea

import React from 'react';
import { useTranslation } from 'react-i18next';

interface MinimalIncidentMetricsProps {
  pendingIncidents: number;
  resolutionRate: number;
}

const MinimalIncidentMetrics: React.FC<MinimalIncidentMetricsProps> = ({
  pendingIncidents,
  resolutionRate
}) => {
  const { t } = useTranslation();

  // Color dinámico para pendientes
  const getPendingColor = () => {
    if (pendingIncidents === 0) return 'text-green-600 bg-green-50';
    if (pendingIncidents <= 2) return 'text-yellow-600 bg-yellow-50';  
    return 'text-red-600 bg-red-50';
  };

  // Color dinámico para tasa de resolución
  const getResolutionColor = () => {
    if (resolutionRate >= 80) return 'text-green-600 bg-green-50';
    if (resolutionRate >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
      {/* Una sola línea con ambas métricas */}
      <div className="flex items-center justify-between text-sm">
        
        {/* Pendientes */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 text-xs">
            {t('dashboard.incidents.pending', { defaultValue: 'Pendientes' })}:
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getPendingColor()}`}>
            {pendingIncidents}
          </span>
        </div>

        {/* Separador minimalista */}
        <div className="text-gray-300 mx-2">•</div>

        {/* Tasa de resolución */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 text-xs">
            {t('dashboard.incidents.resolutionRate', { defaultValue: 'Resolución' })}:
          </span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getResolutionColor()}`}>
            {resolutionRate}%
          </span>
        </div>

      </div>
    </div>
  );
};

export default MinimalIncidentMetrics;
