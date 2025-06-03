// Edge Function para crear un Payment Intent de Stripe
// Esta función se despliega en Supabase

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

// Configuración de Stripe
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {
  apiVersion: '2022-11-15',
}) : null

// Configuración de Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = (supabaseUrl && supabaseServiceKey) ? createClient(supabaseUrl, supabaseServiceKey) : null

console.log("🚀 Create Payment Intent function iniciada (versión producción)")
console.log("Environment variables check:")
console.log("- SUPABASE_URL:", supabaseUrl ? "✅ Configurada" : "❌ No configurada")
console.log("- SUPABASE_SERVICE_ROLE_KEY:", supabaseServiceKey ? "✅ Configurada" : "❌ No configurada")
console.log("- STRIPE_SECRET_KEY:", stripeSecretKey ? `✅ Configurada (${stripeSecretKey.substring(0, 8)}...)` : "❌ No configurada")

// Cors headers - Configuración para producción
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
}

serve(async (req) => {
  console.log(`📥 Recibida solicitud ${req.method} desde ${req.headers.get('origin')}`);
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log("✅ Respondiendo solicitud OPTIONS preflight");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Validar variables de entorno críticas al inicio
    if (!stripeSecretKey) {
      console.error("❌ STRIPE_SECRET_KEY no está configurada");
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: STRIPE_SECRET_KEY missing',
          details: 'Contact administrator - Stripe key not configured'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!stripe) {
      console.error("❌ Stripe client no pudo ser inicializado");
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Stripe client initialization failed',
          details: 'Contact administrator - Stripe configuration invalid'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!supabase) {
      console.error("❌ Supabase client no pudo ser inicializado");
      return new Response(
        JSON.stringify({ 
          error: 'Server configuration error: Supabase client initialization failed',
          details: 'Contact administrator - Supabase configuration invalid'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    // Solo permitir POST
    if (req.method !== 'POST') {
      console.error(`❌ Método no permitido: ${req.method}`);
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Obtener el cuerpo de la solicitud
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('📝 Request body recibido:', JSON.stringify(requestBody, null, 2));
    } catch (jsonError) {
      console.error("❌ Error al parsear JSON:", jsonError);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: jsonError.message
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const { amount, currency = 'eur', user_id, plan_id, email } = requestBody;
    
    console.log('💳 Creando payment intent con params:', { 
      amount, 
      currency, 
      user_id: user_id ? 'provided' : 'missing', 
      plan_id, 
      email: email ? 'provided' : 'missing'
    });

    // Validar parámetros requeridos
    if (!amount || amount < 1) {
      console.error('❌ Error: El monto debe ser al menos 1');
      return new Response(
        JSON.stringify({ 
          error: 'Amount is required and must be at least 1',
          received: { amount }
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Guardar el plan seleccionado como pendiente
    if (user_id && plan_id) {
      try {
        console.log('🔍 Verificando suscripción pendiente existente');
        
        const { data: existingSub, error: selectError } = await supabase
          .from('customer_subscriptions')
          .select('*')
          .eq('user_id', user_id)
          .eq('status', 'pending')
          .maybeSingle()
        
        if (selectError) {
          console.error('⚠️ Error al consultar suscripción pendiente:', selectError);
        }

        if (!existingSub) {
          console.log('📝 Creando suscripción pendiente');
          const { error: insertError } = await supabase.from('customer_subscriptions').insert({
            user_id: user_id,
            plan_id: plan_id,
            status: 'pending',
            current_period_end: null,
          })
          
          if (insertError) {
            console.error('⚠️ Error al crear suscripción pendiente:', insertError);
          } else {
            console.log('✅ Suscripción pendiente creada correctamente');
          }
        } else {
          console.log('ℹ️ Suscripción pendiente ya existe:', existingSub.id);
        }
      } catch (error) {
        console.error('⚠️ Error al guardar la suscripción pendiente:', error)
        // Continuar a pesar del error, ya que el pago puede seguir procesándose
      }
    }

    try {
      console.log('💰 Intentando crear payment intent con Stripe...');
      console.log('🔑 Usando clave Stripe:', stripeSecretKey.substring(0, 12) + '...');

    // Crear un payment intent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: currency.toLowerCase(),
      metadata: {
        user_id: user_id || '',
        plan_id: plan_id || '',
        email: email || '',
      },
        automatic_payment_methods: {
          enabled: true,
        },
    })

      console.log('🎉 Payment intent creado exitosamente:', paymentIntent.id);
      console.log('🔐 Client secret generado correctamente');

      // Devolver el client_secret al cliente (formato correcto para el frontend)
    return new Response(
      JSON.stringify({ 
          clientSecret: paymentIntent.client_secret,  // Cambio a camelCase
          paymentIntentId: paymentIntent.id           // Cambio a camelCase
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
    } catch (stripeError) {
      console.error('❌ Error de Stripe:', stripeError);
      console.error('📋 Detalles del error:', {
        type: stripeError.type,
        code: stripeError.code,
        message: stripeError.message,
        param: stripeError.param
      });
      
      return new Response(
        JSON.stringify({ 
          error: `Stripe error: ${stripeError.message}`,
          type: stripeError.type,
          code: stripeError.code,
          details: 'Payment processing failed - please check your payment method'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error) {
    console.error('💥 Error general al crear payment intent:', error)
    console.error('📋 Stack trace:', error.stack)
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error.message,
        details: 'An unexpected error occurred while processing the payment'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}) 