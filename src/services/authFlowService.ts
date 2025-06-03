// src/services/authFlowService.ts
// Servicio centralizado para manejar la lógica de flujo de autenticación
// Determina hacia dónde redirigir al usuario basado en su estado

import supabase from './supabase';
import { User } from '@supabase/supabase-js';

export type AuthFlowDestination = '/dashboard' | '/pricing' | '/login';

export interface UserSubscriptionStatus {
  hasActiveSubscription: boolean;
  subscriptionStatus: string | null;
  planId: string | null;
}

/**
 * Verifica el estado de suscripción del usuario
 */
export const checkUserSubscriptionStatus = async (userId: string): Promise<UserSubscriptionStatus> => {
  try {
    console.log('🔍 AuthFlow: Verificando estado de suscripción para usuario:', userId);
    
    // Buscar suscripción activa del usuario
    const { data: activeSubscription, error: activeError } = await supabase
      .from('customer_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .limit(1);
      
    if (activeError) {
      console.error('❌ AuthFlow: Error al verificar suscripción activa:', activeError);
    }
    
    if (activeSubscription && activeSubscription.length > 0) {
      console.log('✅ AuthFlow: Usuario tiene suscripción activa:', activeSubscription[0]);
      return {
        hasActiveSubscription: true,
        subscriptionStatus: 'active',
        planId: activeSubscription[0].plan_id
      };
    }
    
    // Si no hay suscripción activa, verificar si tiene alguna suscripción
    const { data: anySubscription, error: anyError } = await supabase
      .from('customer_subscriptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);
      
    if (anyError) {
      console.error('❌ AuthFlow: Error al verificar cualquier suscripción:', anyError);
    }
    
    if (anySubscription && anySubscription.length > 0) {
      console.log('⚠️ AuthFlow: Usuario tiene suscripción pero no activa:', anySubscription[0]);
      return {
        hasActiveSubscription: false,
        subscriptionStatus: anySubscription[0].status,
        planId: anySubscription[0].plan_id
      };
    }
    
    console.log('❌ AuthFlow: Usuario sin suscripción');
    return {
      hasActiveSubscription: false,
      subscriptionStatus: null,
      planId: null
    };
    
  } catch (error) {
    console.error('❌ AuthFlow: Error inesperado verificando suscripción:', error);
    return {
      hasActiveSubscription: false,
      subscriptionStatus: null,
      planId: null
    };
  }
};

/**
 * Determina hacia dónde redirigir al usuario basado en su estado de autenticación y suscripción
 */
export const determineUserDestination = async (
  user: User | null,
  authMethod?: 'email' | 'google' | 'register'
): Promise<AuthFlowDestination> => {
  console.log('🎯 AuthFlow: Determinando destino para usuario:', {
    userId: user?.id,
    email: user?.email,
    authMethod
  });
  
  // Si no hay usuario autenticado, ir a login
  if (!user) {
    console.log('❌ AuthFlow: No hay usuario, redirigiendo a login');
    return '/login';
  }
  
  // Verificar estado de suscripción
  const subscriptionStatus = await checkUserSubscriptionStatus(user.id);
  
  // Si tiene suscripción activa, ir al dashboard
  if (subscriptionStatus.hasActiveSubscription) {
    console.log('✅ AuthFlow: Usuario con suscripción activa, redirigiendo a dashboard');
    return '/dashboard';
  }
  
  // Si no tiene suscripción activa, ir a pricing
  console.log('⚠️ AuthFlow: Usuario sin suscripción activa, redirigiendo a pricing');
  return '/pricing';
};

/**
 * Maneja el flujo de autenticación completo
 * Esta función se puede llamar después de cualquier tipo de autenticación
 */
export const handleAuthenticationFlow = async (
  user: User | null,
  authMethod: 'email' | 'google' | 'register',
  navigate: (path: string) => void,
  options?: {
    showWelcomeMessage?: boolean;
    selectedPlan?: { id: string; name: string; price: number };
  }
): Promise<void> => {
  try {
    console.log('🚀 AuthFlow: Iniciando flujo de autenticación completo');
    
    const destination = await determineUserDestination(user, authMethod);
    
    // Mostrar mensaje de bienvenida si es necesario
    if (options?.showWelcomeMessage && user) {
      const welcomeMessage = authMethod === 'google' 
        ? `¡Bienvenido/a ${user.email}!`
        : '¡Cuenta creada exitosamente!';
      
      // Aquí podrías importar toast si quieres mostrar notificaciones
      console.log('💬 AuthFlow:', welcomeMessage);
    }
    
    // Guardar información del plan seleccionado si existe
    if (options?.selectedPlan) {
      localStorage.setItem("selectedPlanId", options.selectedPlan.id);
      localStorage.setItem("selectedPlanName", options.selectedPlan.name);
      localStorage.setItem("selectedPlanPrice", options.selectedPlan.price.toString());
      console.log('💾 AuthFlow: Plan seleccionado guardado:', options.selectedPlan);
    }
    
    console.log('🎯 AuthFlow: Navegando a:', destination);
    navigate(destination);
    
  } catch (error) {
    console.error('❌ AuthFlow: Error en flujo de autenticación:', error);
    // En caso de error, redirigir a pricing como fallback
    navigate('/pricing');
  }
};

/**
 * Verifica si el usuario actual puede acceder al dashboard
 */
export const canAccessDashboard = async (user: User | null): Promise<boolean> => {
  if (!user) return false;
  
  const subscriptionStatus = await checkUserSubscriptionStatus(user.id);
  return subscriptionStatus.hasActiveSubscription;
};

/**
 * Limpia datos temporales de autenticación/planes
 */
export const clearAuthFlowData = (): void => {
  const itemsToRemove = [
    'selectedPlanId',
    'selectedPlanName', 
    'selectedPlanPrice',
    'pending_session_id',
    'pending_plan_id',
    'userFullName'
  ];
  
  itemsToRemove.forEach(item => {
    localStorage.removeItem(item);
  });
  
  console.log('🧹 AuthFlow: Datos temporales limpiados');
}; 