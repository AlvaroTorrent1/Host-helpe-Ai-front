// src/services/stripeApi.ts - API de Stripe
// Este archivo maneja la integración con Stripe usando Supabase Edge Functions
// CONFIGURADO PARA PRODUCCIÓN - Pagos reales con claves LIVE

import supabase from './supabase';
import stripeConfig from '../../config/stripe-config';

/**
 * Interfaz para los datos necesarios para crear un payment intent
 */
interface CreatePaymentIntentParams {
  amount: number;
  currency: string;
  user_id: string;
  plan_id: string;
  email: string;
}

interface CreatePaymentIntentResponse {
  clientSecret: string;
  paymentIntentId?: string;
}

/**
 * Crea un payment intent en Stripe a través de Supabase Edge Functions
 * Solo para producción - sin código de desarrollo o simulaciones
 */
export const createPaymentIntent = async (params: CreatePaymentIntentParams): Promise<CreatePaymentIntentResponse> => {
  // Validación directa sin singleton - más confiable
  const publicKey = stripeConfig.publicKey;
  const isValidKey = publicKey && (publicKey.startsWith('pk_live_') || publicKey.startsWith('pk_test_'));
  
  if (!isValidKey) {
    console.error('❌ Configuración de Stripe inválida: Clave pública no válida');
    console.error('📋 Configurar VITE_STRIPE_PUBLIC_KEY en .env.production');
    throw new Error('Error de configuración del servidor. Verifique las claves de Stripe en el backend.');
  }

  // Log del modo actual
  const mode = publicKey.startsWith('pk_live_') ? 'PRODUCCIÓN' : 'TEST';
  console.log(`✅ Modo ${mode} detectado`);

  // Sistema en MODO PRODUCCIÓN - Pagos reales
  console.log('💳 Creando payment intent para MODO PRODUCCIÓN (LIVE):', {
    amount: params.amount,
    currency: params.currency,
    user_id: params.user_id,
    plan_id: params.plan_id,
    email: params.email
  });
  
  try {
    // Validar parámetros de entrada
    if (!params.amount || params.amount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }
    
    if (!params.user_id) {
      throw new Error('ID de usuario es requerido');
    }
    
    if (!params.email) {
      throw new Error('Email es requerido');
    }
    
    // Llamar a la función de Supabase para crear el payment intent
    console.log('📡 Invocando función create-payment-intent de Supabase...');
    console.log('💳 Modo PRODUCCIÓN activo - Procesando pago real con claves LIVE');
    
    // Añadir metadata sobre el modo para debugging
    const enrichedParams = {
      ...params,
      metadata: {
        frontend_mode: 'production',
        key_type: 'live',
        timestamp: new Date().toISOString(),
        environment: 'production'
      }
    };
    
    const { data, error } = await supabase.functions.invoke('create-payment-intent', {
      body: enrichedParams
    });
    
    if (error) {
      console.error('❌ Error de Supabase functions:', error);
      
      // Proporcionar mensajes más específicos según el error
      if (error.message?.includes('non-2xx status code')) {
        console.error('📋 Posibles causas:');
        console.error('  - STRIPE_SECRET_KEY no configurada en Supabase Edge Functions');
        console.error('  - Clave secreta incorrecta (debe ser sk_live_ para producción)');
        console.error('  - Problema de red o timeout');
        throw new Error('Error de configuración del servidor. Verifique las claves de Stripe en el backend.');
      }
      
      throw new Error(`Error al crear payment intent: ${error.message}`);
    }
    
    // Manejar tanto formato camelCase como snake_case por compatibilidad
    const clientSecret = data.clientSecret || data.client_secret;
    const paymentIntentId = data.paymentIntentId || data.payment_intent_id;
    
    if (!clientSecret) {
      console.error('❌ Respuesta inválida de Supabase functions:', data);
      throw new Error('No se recibió un client_secret válido del servidor');
    }
    
    console.log('✅ Payment intent creado exitosamente');
    return {
      clientSecret,
      paymentIntentId
    };
    
  } catch (error: any) {
    console.error('❌ Error en createPaymentIntent:', error);
    
    // Proporcionar mensajes de error más específicos
    if (error.message?.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu conexión a internet e intenta de nuevo.');
    }
    
    if (error.message?.includes('unauthorized')) {
      throw new Error('Error de autorización. Por favor, inicia sesión de nuevo.');
    }
    
    // Re-lanzar el error original con contexto adicional
    throw new Error(`Error al procesar el pago: ${error.message}`);
  }
};

/**
 * Actualiza el estado de una suscripción en la base de datos
 * Se usa después de confirmación exitosa de pago
 */
export const updateSubscriptionStatus = async (userId: string, planId: string, status: string) => {
  try {
    console.log('🔄 Actualizando estado de suscripción:', { userId, planId, status });
    
    const { error } = await supabase
      .from('customer_subscriptions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('plan_id', planId);

    if (error) {
      console.error('❌ Error al actualizar estado de suscripción:', error);
      throw new Error(`Error al actualizar suscripción: ${error.message}`);
    }

    console.log('✅ Estado de suscripción actualizado correctamente');
    return { success: true };
  } catch (error: any) {
    console.error('❌ Error al actualizar estado de suscripción:', error);
    throw new Error(`Error al actualizar suscripción: ${error.message}`);
  }
};

/**
 * Crear un registro de suscripción pendiente antes del pago
 * Esto permite rastrear intentos de pago y asociarlos con usuarios
 */
export const createPendingSubscription = async (userId: string, planId: string, email: string) => {
  try {
    console.log('🔄 Creando suscripción pendiente:', { userId, planId, email });
    
    const { data, error } = await supabase
      .from('customer_subscriptions')
      .insert({
        user_id: userId,
        plan_id: planId,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error al crear suscripción pendiente:', error);
      throw new Error(`Error al crear suscripción: ${error.message}`);
    }

    console.log('✅ Suscripción pendiente creada correctamente');
    return data;
  } catch (error: any) {
    console.error('❌ Error al crear suscripción pendiente:', error);
    throw new Error(`Error al preparar suscripción: ${error.message}`);
  }
}; 