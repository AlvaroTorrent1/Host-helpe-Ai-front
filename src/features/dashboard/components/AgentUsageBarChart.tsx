// src/features/dashboard/components/AgentUsageBarChart.tsx
// Gráfico de barras que muestra el uso diario del agente en los últimos 30 días

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { agentService, DailyUsage } from '../../../services/agentService';

interface AgentUsageBarChartProps {
  className?: string;
}

const AgentUsageAreaChart: React.FC<AgentUsageBarChartProps> = ({ className = '' }) => {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [totalCalls, setTotalCalls] = useState(0);
  const [activeDays, setActiveDays] = useState(0);
  const [selectedDayInfo, setSelectedDayInfo] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Cargando datos de uso diario para gráfico de área...');
        
        // Obtener datos reales de la base de datos
        const dailyData = await agentService.getDailyUsageLast30Days();
        console.log('✅ Datos de uso diario cargados:', dailyData);
        console.log('📊 Número total de días con datos:', dailyData.length);
        console.log('📅 Datos con actividad:', dailyData.filter(d => d.total_minutes > 0));
        
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
            <span className="text-gray-800 font-medium">{data.total_minutes} minutos</span>
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
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600"></div>
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

      {/* Gráfico de barras con gradiente */}
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
            onClick={(data) => {
              if (data && data.activePayload && data.activePayload[0]) {
                const clickedData = data.activePayload[0].payload;
                console.log('📊 Día seleccionado:', clickedData);
                setSelectedDayInfo(clickedData);
              }
            }}
          >
            {/* Definición del gradiente vertical para barras */}
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ECA408" stopOpacity={0.9}/>
                <stop offset="30%" stopColor="#F59E0B" stopOpacity={0.7}/>
                <stop offset="70%" stopColor="#F59E0B" stopOpacity={0.5}/>
                <stop offset="100%" stopColor="#E5E7EB" stopOpacity={0.2}/>
              </linearGradient>
            </defs>
            
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
              fill="url(#barGradient)"
              stroke="#ECA408"
              strokeWidth={1}
              radius={[2, 2, 0, 0]}
              animationDuration={1200}
              animationEasing="ease-out"
              style={{ cursor: 'pointer' }}
            >
              {/* Cada barra individual puede tener interactividad */}
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill="url(#barGradient)"
                  stroke="#ECA408"
                  strokeWidth={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Información del día seleccionado */}
      {selectedDayInfo && (
        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">
                📅 Información del día {selectedDayInfo.day}
              </h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-700 font-medium">Llamadas:</span>
                  <span className="ml-2 text-gray-800">{selectedDayInfo.total_calls}</span>
                </div>
                <div>
                  <span className="text-gray-700 font-medium">Minutos:</span>
                  <span className="ml-2 text-gray-800">{selectedDayInfo.total_minutes}</span>
                </div>
                <div>
                  <span className="text-gray-700 font-medium">Promedio:</span>
                  <span className="ml-2 text-gray-800">
                    {selectedDayInfo.total_calls > 0 
                      ? `${Math.round(selectedDayInfo.total_minutes / selectedDayInfo.total_calls)} min/llamada`
                      : 'Sin llamadas'
                    }
                  </span>
                </div>
                <div>
                  <span className="text-gray-700 font-medium">Fecha:</span>
                  <span className="ml-2 text-gray-800">
                    {new Date(selectedDayInfo.date).toLocaleDateString('es-ES', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setSelectedDayInfo(null)}
              className="text-gray-600 hover:text-gray-800 font-medium text-sm"
            >
              ✕
            </button>
          </div>
        </div>
      )}

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

export default AgentUsageAreaChart;
