// src/components/SystemHealthMonitor.tsx
// Componente de monitoreo del sistema para mostrar estado de integridad y alertas

import React, { useState, useEffect, useCallback } from 'react';
import { robustModalService } from '../services/robustModalService';
import { useTranslation } from '../hooks/useTranslation';

// Iconos (puedes reemplazar con tu sistema de iconos)
const HealthIcon = ({ status }: { status: 'healthy' | 'warning' | 'error' | 'unknown' }) => {
  const colors = {
    healthy: 'text-green-500',
    warning: 'text-yellow-500', 
    error: 'text-red-500',
    unknown: 'text-gray-400'
  };

  return (
    <div className={`w-3 h-3 rounded-full ${colors[status]} bg-current`} />
  );
};

const AlertIcon = ({ severity }: { severity: string }) => {
  const colors = {
    critical: 'text-red-600',
    high: 'text-orange-500',
    medium: 'text-yellow-500',
    low: 'text-blue-500'
  };

  return (
    <div className={`w-2 h-2 rounded-full ${colors[severity as keyof typeof colors] || 'text-gray-400'} bg-current`} />
  );
};

interface SystemHealthData {
  integrityStatus: 'healthy' | 'warning' | 'error' | 'unknown';
  totalIssues: number;
  orphanedDocuments: number;
  brokenReferences: number;
  lastCheck: string;
  alerts: Array<{
    id: string;
    alert_type: string;
    severity: string;
    title: string;
    description: string;
    active_count: number;
    latest_alert: string;
  }>;
}

export const SystemHealthMonitor: React.FC<{
  isMinimized?: boolean;
  onToggleMinimized?: () => void;
}> = ({ isMinimized = false, onToggleMinimized }) => {
  const { t } = useTranslation();
  const [healthData, setHealthData] = useState<SystemHealthData>({
    integrityStatus: 'unknown',
    totalIssues: 0,
    orphanedDocuments: 0,
    brokenReferences: 0,
    lastCheck: '',
    alerts: []
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isPerformingMaintenance, setIsPerformingMaintenance] = useState(false);
  const [maintenanceLog, setMaintenanceLog] = useState<string[]>([]);

  // ========================================
  // CARGA DE DATOS DE SALUD
  // ========================================

  const loadSystemHealth = useCallback(async () => {
    setIsLoading(true);
    try {
      // Obtener estado de integridad
      const integrityResult = await robustModalService.checkSystemIntegrity();
      
      // Obtener alertas activas
      const alerts = await robustModalService.getActiveAlerts();

      setHealthData({
        integrityStatus: integrityResult.total_issues_found === 0 ? 'healthy' :
                        integrityResult.total_issues_found < 5 ? 'warning' : 'error',
        totalIssues: integrityResult.total_issues_found,
        orphanedDocuments: integrityResult.check_summary.orphaned_documents,
        brokenReferences: integrityResult.check_summary.broken_featured_refs,
        lastCheck: integrityResult.check_summary.check_completed_at,
        alerts: alerts
      });
    } catch (error) {
      console.error('Error loading system health:', error);
      setHealthData(prev => ({
        ...prev,
        integrityStatus: 'error'
      }));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ========================================
  // OPERACIONES DE MANTENIMIENTO
  // ========================================

  const performCleanup = useCallback(async () => {
    setIsPerformingMaintenance(true);
    setMaintenanceLog([]);

    try {
      // Limpiar documentos huérfanos
      if (healthData.orphanedDocuments > 0) {
        setMaintenanceLog(prev => [...prev, 'Iniciando limpieza de documentos huérfanos...']);
        
        const cleanupResult = await robustModalService.cleanupOrphanedDocuments();
        
        if (cleanupResult.success) {
          setMaintenanceLog(prev => [
            ...prev, 
            `✅ Eliminados ${cleanupResult.affected_records} documentos huérfanos`
          ]);
        } else {
          setMaintenanceLog(prev => [
            ...prev, 
            `❌ Error en limpieza: ${cleanupResult.error}`
          ]);
        }
      }

      // Recargar estado después de limpieza
      setMaintenanceLog(prev => [...prev, 'Verificando estado del sistema...']);
      await loadSystemHealth();
      
      setMaintenanceLog(prev => [...prev, '✅ Mantenimiento completado']);
    } catch (error) {
      setMaintenanceLog(prev => [
        ...prev, 
        `❌ Error durante mantenimiento: ${error instanceof Error ? error.message : 'Unknown error'}`
      ]);
    } finally {
      setIsPerformingMaintenance(false);
    }
  }, [healthData.orphanedDocuments, loadSystemHealth]);

  // ========================================
  // EFECTOS
  // ========================================

  // Cargar datos iniciales y configurar auto-refresh
  useEffect(() => {
    loadSystemHealth();
    
    // Auto-refresh cada 30 segundos
    const interval = setInterval(loadSystemHealth, 30 * 1000);
    
    return () => clearInterval(interval);
  }, [loadSystemHealth]);

  // ========================================
  // RENDERIZADO
  // ========================================

  if (isMinimized) {
    return (
      <div 
        className="fixed bottom-4 right-4 bg-white rounded-full shadow-lg border p-2 cursor-pointer hover:shadow-xl transition-shadow"
        onClick={onToggleMinimized}
      >
        <div className="flex items-center space-x-2">
          <HealthIcon status={healthData.integrityStatus} />
          {healthData.alerts.length > 0 && (
            <span className="text-xs font-medium text-red-600">
              {healthData.alerts.length}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <HealthIcon status={healthData.integrityStatus} />
          <h3 className="text-lg font-semibold">
            {t('systemHealth.title', 'System Health')}
          </h3>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            onClick={loadSystemHealth}
            disabled={isLoading}
            className="px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100 disabled:opacity-50"
          >
            {isLoading ? '...' : t('systemHealth.refresh', 'Refresh')}
          </button>
          
          {onToggleMinimized && (
            <button
              onClick={onToggleMinimized}
              className="px-3 py-1 text-sm bg-gray-50 text-gray-600 rounded hover:bg-gray-100"
            >
              {t('systemHealth.minimize', 'Minimize')}
            </button>
          )}
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gray-50 rounded p-3">
          <div className="text-sm text-gray-600">
            {t('systemHealth.integrityStatus', 'Integrity')}
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <HealthIcon status={healthData.integrityStatus} />
            <span className="text-sm font-medium capitalize">
              {healthData.integrityStatus}
            </span>
          </div>
        </div>

        <div className="bg-gray-50 rounded p-3">
          <div className="text-sm text-gray-600">
            {t('systemHealth.totalIssues', 'Total Issues')}
          </div>
          <div className="text-lg font-semibold mt-1">
            {healthData.totalIssues}
          </div>
        </div>

        <div className="bg-gray-50 rounded p-3">
          <div className="text-sm text-gray-600">
            {t('systemHealth.orphanedDocs', 'Orphaned Docs')}
          </div>
          <div className="text-lg font-semibold mt-1">
            {healthData.orphanedDocuments}
          </div>
        </div>

        <div className="bg-gray-50 rounded p-3">
          <div className="text-sm text-gray-600">
            {t('systemHealth.brokenRefs', 'Broken Refs')}
          </div>
          <div className="text-lg font-semibold mt-1">
            {healthData.brokenReferences}
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {healthData.alerts.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            {t('systemHealth.activeAlerts', 'Active Alerts')} ({healthData.alerts.length})
          </h4>
          
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {healthData.alerts.map((alert, index) => (
              <div 
                key={index}
                className="flex items-start space-x-3 p-2 bg-red-50 rounded border-l-4 border-red-400"
              >
                <AlertIcon severity={alert.severity} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">
                    {alert.alert_type.replace('_', ' ')}
                  </div>
                  <div className="text-xs text-gray-600">
                    {alert.active_count} active • {alert.severity} severity
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(alert.latest_alert).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Maintenance Actions */}
      {(healthData.orphanedDocuments > 0 || healthData.brokenReferences > 0) && (
        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-900">
              {t('systemHealth.maintenance', 'Maintenance')}
            </h4>
            
            <button
              onClick={performCleanup}
              disabled={isPerformingMaintenance}
              className="px-4 py-2 bg-orange-500 text-white text-sm rounded hover:bg-orange-600 disabled:opacity-50"
            >
              {isPerformingMaintenance 
                ? t('systemHealth.cleaning', 'Cleaning...')
                : t('systemHealth.runCleanup', 'Run Cleanup')
              }
            </button>
          </div>

          {maintenanceLog.length > 0 && (
            <div className="bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
              <div className="text-xs font-mono space-y-1">
                {maintenanceLog.map((log, index) => (
                  <div key={index} className="text-gray-600">
                    {log}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="text-xs text-gray-500 border-t pt-2">
        {t('systemHealth.lastCheck', 'Last check')}: {' '}
        {healthData.lastCheck ? new Date(healthData.lastCheck).toLocaleString() : 'Never'}
      </div>
    </div>
  );
};

// Hook para uso fácil del monitor
export const useSystemHealthMonitor = () => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [shouldShow, setShouldShow] = useState(false);

  // Auto-mostrar cuando hay problemas
  useEffect(() => {
    const checkAndShow = async () => {
      try {
        const result = await robustModalService.checkSystemIntegrity();
        setShouldShow(result.total_issues_found > 0);
      } catch (error) {
        setShouldShow(true); // Mostrar si hay error de conexión
      }
    };

    checkAndShow();
    
    // Check cada minuto
    const interval = setInterval(checkAndShow, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {
    isMinimized,
    shouldShow,
    toggleMinimized: () => setIsMinimized(!isMinimized),
    show: () => setShouldShow(true),
    hide: () => setShouldShow(false)
  };
}; 