// src/features/dashboard/components/AgentUsageChart.tsx
// Gráfico de uso diario del agente en los últimos 30 días

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { agentService, DailyUsage } from '../../../services/agentService';

interface AgentUsageChartProps {
  className?: string;
}

const AgentUsageChart: React.FC<AgentUsageChartProps> = ({ className = '' }) => {
  const { t } = useTranslation();
  const [data, setData] = useState<DailyUsage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Cargando datos de uso diario...');
        
        const dailyData = await agentService.getDailyUsageLast30Days();
        console.log('✅ Datos de uso diario cargados:', dailyData.length, 'días');
        
        // Formatear datos para el gráfico
        const formattedData = dailyData.map(item => ({
          ...item,
          // Formatear fecha para mostrar en el gráfico (DD/MM)
          date_display: new Date(item.usage_date).toLocaleDateString('es-ES', { 
            day: '2-digit', 
            month: '2-digit' 
          })
        }));
        
        setData(formattedData);
        setError(null);
      } catch (err) {
        console.error('❌ Error al cargar datos de uso diario:', err);
        setError('Error al cargar los datos del gráfico');
        setData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Formatear tooltip
  const formatTooltip = (value: number, name: string) => {
    if (name === 'total_minutes') {
      return [`${value} min`, 'Minutos de uso'];
    }
    if (name === 'total_calls') {
      return [`${value}`, 'Llamadas'];
    }
    return [value, name];
  };

  // Formatear label del tooltip
  const formatLabel = (label: string) => {
    // label viene como date_display (DD/MM)
    return `Fecha: ${label}`;
  };

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Cargando gráfico...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="text-red-500 mb-2">⚠️</div>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const totalMinutes = data.reduce((sum, item) => sum + item.total_minutes, 0);
  const totalCalls = data.reduce((sum, item) => sum + item.total_calls, 0);
  const activeDays = data.filter(item => item.total_minutes > 0).length;

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          📊 Uso del Agente - Últimos 30 Días
        </h3>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>📞 <strong>{totalCalls}</strong> llamadas totales</span>
          <span>⏱️ <strong>{totalMinutes}</strong> minutos totales</span>
          <span>📅 <strong>{activeDays}</strong> días activos</span>
        </div>
      </div>

      {/* Gráfico */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{
              top: 5,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date_display" 
              stroke="#666"
              fontSize={12}
              tick={{ fill: '#666' }}
              interval={Math.floor(data.length / 8)} // Mostrar ~8 etiquetas
            />
            <YAxis 
              stroke="#666"
              fontSize={12}
              tick={{ fill: '#666' }}
              label={{ value: 'Minutos', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              formatter={formatTooltip}
              labelFormatter={formatLabel}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="total_minutes" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer informativo */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        🤖 Casa Maria Flora - Minutos de atención automatizada
      </div>
    </div>
  );
};

export default AgentUsageChart;
