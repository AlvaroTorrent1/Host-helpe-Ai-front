// src/features/dashboard/components/AgentUsageBarChart.tsx
// Gráfico de barras que muestra el uso diario del agente en los últimos 30 días

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { agentService, DailyUsage } from '../../../services/agentService';

interface AgentUsageBarChartProps {
  className?: string;
}

const AgentUsageBarChart: React.FC<AgentUsageBarChartProps> = ({ className = '' }) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalCalls, setTotalCalls] = useState(0);
  const [activeDays, setActiveDays] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Cargando datos de uso diario para gráfico de barras...');
        
        // Obtener datos reales de la base de datos
        const dailyData = await agentService.getDailyUsageLast30Days();
        console.log('✅ Datos de uso diario cargados:', dailyData);
        
        // Crear un mapa con los datos existentes
        const dataMap = new Map<string, DailyUsage>();
        dailyData.forEach(item => {
          const dateStr = new Date(item.usage_date).toISOString().split('T')[0];
          dataMap.set(dateStr, item);
        });
        
        // Generar array de los últimos 30 días
        const last30Days = [];
        const today = new Date();
        let totalMin = 0;
        let totalCall = 0;
        let activeCount = 0;
        
        for (let i = 29; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          const dayData = dataMap.get(dateStr);
          
          const minutes = dayData?.total_minutes || 0;
          const calls = dayData?.total_calls || 0;
          
          // Acumular totales
          totalMin += minutes;
          totalCall += calls;
          if (minutes > 0) activeCount++;
          
          last30Days.push({
            date: dateStr,
            day: date.getDate(), // Solo el día del mes para el eje X
            dayLabel: date.toLocaleDateString('es-ES', { 
              weekday: 'short', 
              day: 'numeric' 
            }).replace(',', ''), // Formato: "lun 15"
            total_minutes: minutes,
            total_calls: calls,
            // Formato para tooltip
            fullDate: date.toLocaleDateString('es-ES', { 
              weekday: 'long', 
              day: 'numeric',
              month: 'long'
            })
          });
        }
        
        setData(last30Days);
        setTotalMinutes(totalMin);
        setTotalCalls(totalCall);
        setActiveDays(activeCount);
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

  // Función personalizada para el tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload[0]) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800 mb-1">{data.fullDate}</p>
          <p className="text-sm">
            <span className="text-blue-600 font-medium">{data.total_minutes} minutos</span>
          </p>
          <p className="text-sm text-gray-600">
            {data.total_calls} {data.total_calls === 1 ? 'llamada' : 'llamadas'}
          </p>
        </div>
      );
    }
    return null;
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
          <div className="text-red-500">❌ {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      {/* Header simplificado */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Uso del Agente - Últimos 30 Días
        </h3>
      </div>

      {/* Gráfico de barras sin eje Y */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{
              top: 10,
              right: 10,
              left: 5,
              bottom: 25,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="day"
              stroke="#666"
              fontSize={11}
              tick={{ fill: '#666' }}
              interval={2}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={false}
              width={0}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="total_minutes" 
              fill="#ECA408"
              radius={[4, 4, 0, 0]}
              animationDuration={800}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Nota informativa */}
      {activeDays === 0 && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            ℹ️ No hay datos de uso registrados en los últimos 30 días
          </p>
        </div>
      )}
    </div>
  );
};

export default AgentUsageBarChart;
