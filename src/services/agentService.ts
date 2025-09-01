// src/services/agentService.ts
// Servicio para gestionar datos de agentes de ElevenLabs

import { supabase } from './supabase';

export interface AgentCall {
  id: number;
  conversation_id: string;
  agent_id: string;
  user_id: string;
  started_at: string;
  duration_seconds: number | null;
  status: 'initiated' | 'in-progress' | 'done' | 'failed';
  agent_name: string | null;
  raw_metadata?: any;
  month_year: string | null;
  created_at: string;
  updated_at: string;
}

export interface AgentUserMapping {
  id: number;
  agent_id: string;
  user_id: string;
  agent_name: string | null;
  phone_number: string | null;
  user_email: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AgentStats {
  total_calls: number;
  total_minutes: number;
  current_month_calls: number;
  current_month_minutes: number;
  active_agents: number;
  avg_call_duration_minutes: number;
}

export interface DailyUsage {
  usage_date: string;
  total_minutes: number;
  total_calls: number;
}

class AgentService {
  /**
   * Obtener estadísticas de agentes para el usuario actual
   */
  async getAgentStats(): Promise<AgentStats> {
    try {
      // Obtener el usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('No authenticated user found:', userError);
        return this.getEmptyStats();
      }

      // Consultar directamente las tablas para evitar problemas con la función SQL
      const currentMonth = new Date().toISOString().slice(0, 7) + '-01'; // YYYY-MM-01
      
      // Estadísticas del mes actual
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('user_monthly_usage')
        .select('total_calls, total_minutes')
        .eq('user_id', user.id)
        .eq('month_year', currentMonth)
        .maybeSingle();

      // Estadísticas totales
      const { data: totalData, error: totalError } = await supabase
        .from('agent_calls')
        .select('duration_seconds, agent_id')
        .eq('user_id', user.id)
        .eq('status', 'done')
        .not('duration_seconds', 'is', null);

      if (monthlyError || totalError) {
        console.error('Error fetching agent data:', { monthlyError, totalError });
        return this.getEmptyStats();
      }

      // Calcular estadísticas
      const currentMonthCalls = monthlyData?.total_calls || 0;
      const currentMonthMinutes = monthlyData?.total_minutes || 0;
      
      const totalCalls = totalData?.length || 0;
      const totalMinutes = totalData?.reduce((sum, call) => 
        sum + Math.round((call.duration_seconds || 0) / 60), 0) || 0;
      
      const uniqueAgents = new Set(totalData?.map(call => call.agent_id) || []).size;
      const avgDuration = totalCalls > 0 ? Math.round(totalMinutes / totalCalls) : 0;

      return {
        total_calls: totalCalls,
        total_minutes: totalMinutes,
        current_month_calls: currentMonthCalls,
        current_month_minutes: currentMonthMinutes,
        active_agents: uniqueAgents,
        avg_call_duration_minutes: avgDuration
      };
    } catch (error) {
      console.error('Error in getAgentStats:', error);
      return this.getEmptyStats();
    }
  }

  /**
   * Retorna estadísticas vacías como fallback
   */
  private getEmptyStats(): AgentStats {
    return {
      total_calls: 0,
      total_minutes: 0,
      current_month_calls: 0,
      current_month_minutes: 0,
      active_agents: 0,
      avg_call_duration_minutes: 0
    };
  }

  /**
   * Obtener minutos ahorrados del mes actual
   * Cada minuto de conversación con IA = 1 minuto ahorrado al usuario
   */
  async getCurrentMonthSavedMinutes(): Promise<number> {
    try {
      // Obtener el usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('No authenticated user found:', userError);
        return 0;
      }

      // Llamar a la función simple directamente
      const { data, error } = await supabase
        .rpc('get_current_month_minutes', { p_user_id: user.id });

      if (error) {
        console.error('Error fetching current month minutes:', error);
        return 0;
      }

      console.log('Current month minutes from DB:', data);
      return data || 0;
    } catch (error) {
      console.error('Error in getCurrentMonthSavedMinutes:', error);
      return 0;
    }
  }

  /**
   * Obtener total de minutos ahorrados (histórico)
   */
  async getTotalSavedMinutes(): Promise<number> {
    try {
      // Obtener el usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('No authenticated user found:', userError);
        return 0;
      }

      // Llamar a la función simple directamente
      const { data, error } = await supabase
        .rpc('get_total_minutes', { p_user_id: user.id });

      if (error) {
        console.error('Error fetching total minutes:', error);
        return 0;
      }

      console.log('Total minutes from DB:', data);
      return data || 0;
    } catch (error) {
      console.error('Error in getTotalSavedMinutes:', error);
      return 0;
    }
  }

  /**
   * Obtener llamadas recientes del usuario
   */
  async getRecentCalls(limit: number = 10): Promise<AgentCall[]> {
    try {
      const { data: calls, error } = await supabase
        .from('agent_calls')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching recent calls:', error);
        return [];
      }

      return calls || [];
    } catch (error) {
      console.error('Error in getRecentCalls:', error);
      return [];
    }
  }

  /**
   * Obtener uso diario de los últimos 30 días
   */
  async getDailyUsageLast30Days(): Promise<DailyUsage[]> {
    try {
      // Obtener el usuario actual
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error('No authenticated user found:', userError);
        return [];
      }

      // Llamar a la función SQL para obtener datos diarios
      const { data, error } = await supabase
        .rpc('get_daily_usage_last_30_days', { p_user_id: user.id });

      if (error) {
        console.error('Error fetching daily usage:', error);
        return [];
      }

      console.log('Daily usage data from DB:', data);
      return data || [];
    } catch (error) {
      console.error('Error in getDailyUsageLast30Days:', error);
      return [];
    }
  }

  /**
   * Obtener configuración de agentes del usuario
   */
  async getUserAgents(): Promise<AgentUserMapping[]> {
    try {
      const { data: agents, error } = await supabase
        .from('agent_user_mapping')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching user agents:', error);
        return [];
      }

      return agents || [];
    } catch (error) {
      console.error('Error in getUserAgents:', error);
      return [];
    }
  }

  /**
   * Obtener datos para gráficos mensuales
   */
  async getMonthlyData(months: number = 6) {
    try {
      const { data, error } = await supabase.functions.invoke('agents-analytics/monthly', {
        method: 'GET',
        body: { 
          from: new Date(Date.now() - months * 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 7)
        }
      });

      if (error) {
        console.error('Error fetching monthly data:', error);
        return [];
      }

      return data?.data || [];
    } catch (error) {
      console.error('Error in getMonthlyData:', error);
      return [];
    }
  }

  /**
   * Formatear duración en minutos
   */
  formatDuration(seconds: number | null): number {
    if (!seconds) return 0;
    return Math.round(seconds / 60);
  }

  /**
   * Formatear fecha relativa
   */
  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) {
      return `hace ${diffInMinutes} min`;
    } else if (diffInHours < 24) {
      return `hace ${diffInHours}h`;
    } else if (diffInDays < 7) {
      return `hace ${diffInDays}d`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

export const agentService = new AgentService();
export default agentService;
