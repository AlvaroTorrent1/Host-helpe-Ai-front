// src/features/dashboard/components/AgentUsageSimple.tsx
// Componente simple para mostrar datos de uso del agente sin gráfico (para debug)

import React, { useState, useEffect } from 'react';
import { agentService, DailyUsage } from '../../../services/agentService';

const AgentUsageSimple: React.FC = () => {
  const [data, setData] = useState<DailyUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Cargando datos de uso diario...');
        
        const dailyData = await agentService.getDailyUsageLast30Days();
        console.log('✅ Datos de uso diario cargados:', dailyData);
        
        setData(dailyData);
        setError(null);
      } catch (err) {
        console.error('❌ Error al cargar datos de uso diario:', err);
        setError('Error al cargar los datos');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Cargando datos del agente...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="text-red-500">❌ {error}</div>
      </div>
    );
  }

  const totalMinutes = data.reduce((sum, item) => sum + item.total_minutes, 0);
  const totalCalls = data.reduce((sum, item) => sum + item.total_calls, 0);
  const activeDays = data.filter(item => item.total_minutes > 0).length;
  const recentDays = data.slice(-7); // Últimos 7 días

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        📊 Uso del Agente Casa Maria Flora
      </h3>
      
      {/* Resumen */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{totalCalls}</div>
          <div className="text-sm text-gray-600">Llamadas totales</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{totalMinutes}</div>
          <div className="text-sm text-gray-600">Minutos totales</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{activeDays}</div>
          <div className="text-sm text-gray-600">Días activos</div>
        </div>
      </div>

      {/* Últimos 7 días */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">📅 Últimos 7 días:</h4>
        <div className="space-y-2">
          {recentDays.map((day, index) => (
            <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-700">
                {new Date(day.usage_date).toLocaleDateString('es-ES', { 
                  weekday: 'short', 
                  day: '2-digit', 
                  month: '2-digit' 
                })}
              </span>
              <span className="font-medium text-blue-600">
                {day.total_minutes} min ({day.total_calls} llamadas)
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Debug info */}
      <div className="mt-4 p-3 bg-gray-50 rounded text-sm">
        <strong>Debug:</strong> {data.length} días de datos cargados
      </div>
    </div>
  );
};

export default AgentUsageSimple;
