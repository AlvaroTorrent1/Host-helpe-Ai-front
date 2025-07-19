/**
 * src/features/dashboard/DashboardStats.tsx
 * Componente para mostrar estadísticas y métricas clave en el dashboard
 */

import React from 'react';
import { useTranslation } from 'react-i18next';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  footer?: string;
  className?: string;
}

interface DashboardStatsProps {
  activeProperties: number;
  pendingReservations: number;
  totalReservations: number;
  pendingIncidents: number;
  resolutionRate: number;
  activeUsers?: number;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  footer,
  className = '',
}) => {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold mt-1 text-gray-800">{value}</p>
          {trend && (
            <div className="flex items-center mt-1">
              <span
                className={`text-xs font-medium ${
                  trend.isPositive ? 'text-green-600' : 'text-red-600'
                } flex items-center`}
              >
                {trend.isPositive ? (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-3 w-3 mr-1" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                ) : (
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-3 w-3 mr-1" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                )}
                {Math.abs(trend.value)}%
              </span>
            </div>
          )}
        </div>
        <div className="rounded-md p-2 bg-primary-50 text-primary-600">{icon}</div>
      </div>
      {footer && <p className="mt-3 text-xs text-gray-500">{footer}</p>}
    </div>
  );
};

const DashboardStats: React.FC<DashboardStatsProps> = ({
  activeProperties,
  pendingReservations,
  totalReservations,
  pendingIncidents,
  resolutionRate,
  activeUsers = 0,
  className = '',
}) => {
  const { t } = useTranslation();
  
  // Calcular porcentaje de reservas pendientes
  const pendingReservationRate = totalReservations > 0
    ? Math.round((pendingReservations / totalReservations) * 100)
    : 0;

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 ${className}`}>
      <StatCard 
        title={t('dashboard.stats.properties')}
        value={activeProperties}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
          </svg>
        }
        footer={t('dashboard.stats.activePropertiesFooter')}
      />

      <StatCard 
        title={t('dashboard.stats.pendingReservations')}
        value={pendingReservations}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
          </svg>
        }
        trend={{
          value: pendingReservationRate,
          isPositive: pendingReservationRate < 30 // Mejor si menos del 30% está pendiente
        }}
        footer={
          totalReservations > 0
            ? t('dashboard.stats.pendingReservationsFooter', { percent: pendingReservationRate })
            : t('dashboard.stats.noReservations')
        }
      />

      <StatCard 
        title={t('dashboard.stats.incidents')}
        value={pendingIncidents}
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        }
        trend={{
          value: 100 - resolutionRate,
          isPositive: resolutionRate > 70 // Bueno si la tasa de resolución es alta
        }}
        footer={t('dashboard.stats.resolutionRate', { rate: resolutionRate })}
      />
    </div>
  );
};

export default DashboardStats; 