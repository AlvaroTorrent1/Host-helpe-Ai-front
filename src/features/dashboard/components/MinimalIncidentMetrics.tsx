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

  // Estilo unificado con subrayado naranja leve y texto gris
  const underlineOrange = 'border-b-2 border-primary-300 pb-0.5 text-gray-800';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-2 shadow-sm">
      {/* Una sola línea con ambas métricas */}
      <div className="flex items-center justify-between text-sm">
        
        {/* Pendientes */}
        <div className="flex items-center space-x-2">
          <span className="text-gray-500 text-xs">
            {t('dashboard.incidents.pending', { defaultValue: 'Pendientes' })}:
          </span>
          <span className={`inline-flex items-center px-1 text-xs font-medium ${underlineOrange}`}>
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
          <span className={`inline-flex items-center px-1 text-xs font-medium ${underlineOrange}`}>
            {resolutionRate}%
          </span>
        </div>

      </div>
    </div>
  );
};

export default MinimalIncidentMetrics;
