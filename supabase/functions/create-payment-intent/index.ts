// Edge Function para crear un Payment Intent de Stripe
// Esta función se despliega en Supabase

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

// Configuración de Stripe
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2022-11-15',
})

// Configuración de Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl, supabaseServiceKey)

console.log("Create Payment Intent function iniciada (versión desarrollo)")
console.log("URL de Supabase:", supabaseUrl ? "Configurada" : "No configurada")
console.log("Clave de servicio de Supabase:", supabaseServiceKey ? "Configurada" : "No configurada")
console.log("Clave secreta de Stripe:", stripeSecretKey ? "Configurada" : "No configurada")

// Cors headers - Configuración específica para desarrollo
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // Permitir todos los orígenes en desarrollo
  'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
  'Access-Control-Allow-Headers': '*', // Permitir todas las cabeceras en desarrollo
  'Access-Control-Max-Age': '86400',
  'Access-Control-Allow-Credentials': 'true',
}

serve(async (req) => {
  // Imprimir información de la solicitud para depuración
  console.log(`Recibida solicitud ${req.method} desde ${req.headers.get('origin')} a ${new URL(req.url).pathname}`);
  
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    console.log("Recibida solicitud OPTIONS preflight - respondiendo con CORS headers");
    return new Response(null, { 
      headers: corsHeaders,
      status: 204
    });
  }

  try {
    // Log the request for debugging
    const origin = req.headers.get('origin');
    console.log(`Received ${req.method} request from origin:`, origin);
    
    // Imprimir todas las cabeceras para depuración
    console.log("Headers de la solicitud:");
    for (const [key, value] of req.headers.entries()) {
      console.log(`${key}: ${value}`);
    }
    
    // Solo permitir POST
    if (req.method !== 'POST') {
      console.error(`Método no permitido: ${req.method}`);
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Obtener el cuerpo de la solicitud
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (jsonError) {
      console.error("Error al parsear JSON:", jsonError);
      return new Response(
        JSON.stringify({ error: 'Error parsing request JSON' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
    
    const { amount, currency = 'eur', user_id, plan_id, email } = requestBody;
    
    console.log('Creating payment intent with params:', { amount, currency, user_id, plan_id, email });

    if (!amount || amount < 1) {
      console.error('Error: El monto debe ser al menos 1');
      return new Response(
        JSON.stringify({ error: 'Amount is required and must be at least 1' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Guardar el plan seleccionado como pendiente
    if (user_id && plan_id) {
      try {
        console.log('Verificando suscripción pendiente existente');
        // Comprobar si ya existe una suscripción pendiente
        const { data: existingSub, error: selectError } = await supabase
          .from('customer_subscriptions')
          .select('*')
          .eq('user_id', user_id)
          .eq('status', 'pending')
          .maybeSingle()
        
        if (selectError) {
          console.error('Error al consultar suscripción pendiente:', selectError);
        }

        if (!existingSub) {
          console.log('Creando suscripción pendiente');
          // Crear una suscripción pendiente
          const { error: insertError } = await supabase.from('customer_subscriptions').insert({
            user_id: user_id,
            plan_id: plan_id,
            status: 'pending',
            current_period_end: null,
          })
          
          if (insertError) {
            console.error('Error al crear suscripción pendiente:', insertError);
          } else {
            console.log('Suscripción pendiente creada correctamente');
          }
        } else {
          console.log('Suscripción pendiente ya existe:', existingSub.id);
        }
      } catch (error) {
        console.error('Error al guardar la suscripción pendiente:', error)
        // Continuar a pesar del error, ya que el pago puede seguir procesándose
      }
    }

    // Verificar la clave de Stripe
    if (!stripeSecretKey || stripeSecretKey.trim() === '') {
      console.error('STRIPE_SECRET_KEY no está configurada');
      return new Response(
        JSON.stringify({ error: 'Stripe configuration error: Missing secret key' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    try {
      console.log('Intentando crear payment intent con clave:', stripeSecretKey.substring(0, 8) + '...');
      // Crear un payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount, // Stripe espera el monto en centavos
        currency,
        metadata: {
          user_id: user_id || '',
          plan_id: plan_id || '',
          email: email || '',
        },
      })
      
      console.log('Payment intent created successfully:', paymentIntent.id);

      // Devolver el client_secret al cliente
      return new Response(
        JSON.stringify({ 
          client_secret: paymentIntent.client_secret,
          payment_intent_id: paymentIntent.id
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    } catch (stripeError) {
      console.error('Error from Stripe:', stripeError);
      return new Response(
        JSON.stringify({ 
          error: `Stripe error: ${stripeError.message}`,
          details: stripeError
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }
  } catch (error) {
    console.error('Error al crear payment intent:', error)
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: error.stack
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
}) 