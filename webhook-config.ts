// Edge Function para manejar webhooks de Stripe - SIN VERIFICACIÓN JWT
// Esta función se despliega en Supabase y permite acceso directo desde Stripe

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@12.0.0'

// Configuración CORS para permitir acceso sin JWT
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

// Configuración de Stripe
const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY') || ''
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2022-11-15',
})

// Configuración de Supabase
const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Clave secreta para verificar eventos de Stripe
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''

console.log("🚀 Webhook iniciado - Acceso permitido sin JWT")

serve(async (req) => {
  // Manejar preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Verificar método HTTP
  if (req.method !== 'POST') {
    return new Response('Método no permitido', { 
      status: 405,
      headers: corsHeaders 
    })
  }

  // Necesitamos la firma de stripe para verificar el evento
  const signature = req.headers.get('stripe-signature')
  if (!signature) {
    console.error('❌ No se proporcionó firma de Stripe')
    return new Response('No se proporcionó firma de Stripe', { 
      status: 400,
      headers: corsHeaders 
    })
  }

  // Obtener el cuerpo de la solicitud
  const body = await req.text()
  let event
  
  // Verificar y construir el evento
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    console.log(`✅ Evento recibido: ${event.type}`)
  } catch (err) {
    console.error(`❌ Error al verificar webhook: ${err.message}`)
    return new Response(`Webhook Error: ${err.message}`, { 
      status: 400,
      headers: corsHeaders 
    })
  }

  // Manejar tipos específicos de eventos
  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object
        console.log('🎉 Payment Intent succeeded:', paymentIntent.id)
        
        // Extraer datos del metadata
        const userId = paymentIntent.metadata?.user_id
        const planId = paymentIntent.metadata?.plan_id || 'basic'
        const email = paymentIntent.metadata?.email
        
        if (!userId) {
          console.error('❌ No se encontró user_id en metadata del Payment Intent')
          throw new Error('No se encontró user_id en el Payment Intent')
        }

        console.log('🔄 Activando suscripción para Payment Intent:', {
          paymentIntentId: paymentIntent.id,
          userId,
          planId,
          email
        })

        // Buscar suscripción pendiente para este usuario y plan
        const { data: pendingSubscription, error: pendingError } = await supabase
          .from('customer_subscriptions')
          .select('*')
          .eq('user_id', userId)
          .eq('plan_id', planId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(1)
          .single()
        
        if (pendingSubscription) {
          // Actualizar la suscripción pendiente a activa
          const { error: updateError } = await supabase
            .from('customer_subscriptions')
            .update({
              stripe_customer_id: paymentIntent.customer || null,
              stripe_subscription_id: paymentIntent.id,
              status: 'active',
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq('id', pendingSubscription.id)
          
          if (updateError) {
            console.error('❌ Error al actualizar suscripción pendiente:', updateError)
            throw new Error('Error al actualizar suscripción pendiente')
          }
          
          console.log('✅ Suscripción pendiente actualizada a ACTIVE:', pendingSubscription.id)
        } else {
          // Si no existe un registro pendiente, crear uno nuevo como activo
          const { data, error } = await supabase
            .from('customer_subscriptions')
            .insert({
              user_id: userId,
              stripe_customer_id: paymentIntent.customer || null,
              stripe_subscription_id: paymentIntent.id,
              plan_id: planId,
              status: 'active',
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })

          if (error) {
            console.error('❌ Error al crear nueva suscripción activa:', error)
            throw new Error('Error al crear suscripción activa')
          }
          
          console.log('✅ Nueva suscripción ACTIVE creada:', userId)
        }
        break
      }
      
      case 'checkout.session.completed': {
        const session = event.data.object
        console.log('🛒 Checkout completado:', session.id)
        
        // Extraer datos del cliente
        const customerEmail = session.customer_details?.email
        const customerId = session.customer
        const subscriptionId = session.subscription
        const planId = session.metadata?.plan_id || 'basic'
        
        if (!customerEmail) {
          throw new Error('No se encontró email del cliente')
        }

        // Buscar usuario por email
        const { data: userData, error: userError } = await supabase
          .from('auth.users')
          .select('id')
          .eq('email', customerEmail)
          .single()

        if (userError || !userData) {
          console.error('❌ Error al buscar usuario:', userError)
          throw new Error(`No se encontró usuario con email ${customerEmail}`)
        }

        // Primero verificar si existe un registro pendiente para este usuario y plan
        const { data: pendingSubscription, error: pendingError } = await supabase
          .from('customer_subscriptions')
          .select('*')
          .eq('user_id', userData.id)
          .eq('plan_id', planId)
          .eq('status', 'pending')
          .single()
        
        if (pendingSubscription) {
          // Actualizar la suscripción pendiente a activa
          const { error: updateError } = await supabase
            .from('customer_subscriptions')
            .update({
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              status: 'active',
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })
            .eq('id', pendingSubscription.id)
          
          if (updateError) {
            console.error('❌ Error al actualizar suscripción pendiente:', updateError)
            throw new Error('Error al actualizar suscripción pendiente')
          }
          
          console.log('✅ Suscripción pendiente actualizada con éxito:', pendingSubscription.id)
        } else {
          // Si no existe un registro pendiente, crear uno nuevo
          const { data, error } = await supabase
            .from('customer_subscriptions')
            .insert({
              user_id: userData.id,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              plan_id: planId,
              status: 'active',
              current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            })

          if (error) {
            console.error('❌ Error al registrar suscripción:', error)
            throw new Error('Error al registrar suscripción')
          }
          
          console.log('✅ Nueva suscripción registrada con éxito:', userData.id)
        }
        break
      }
      
      case 'invoice.paid': {
        const invoice = event.data.object
        const subscriptionId = invoice.subscription
        
        if (!subscriptionId) break
        
        // Actualizar período de suscripción
        const { data: subscription } = await stripe.subscriptions.retrieve(subscriptionId as string)
        
        if (subscription) {
          await supabase
            .from('customer_subscriptions')
            .update({
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              status: 'active',
            })
            .eq('stripe_subscription_id', subscriptionId)
        }
        break
      }
      
      case 'customer.subscription.updated': {
        const subscription = event.data.object
        
        await supabase
          .from('customer_subscriptions')
          .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          })
          .eq('stripe_subscription_id', subscription.id)
        
        break
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object
        
        await supabase
          .from('customer_subscriptions')
          .update({
            status: 'canceled',
          })
          .eq('stripe_subscription_id', subscription.id)
        
        break
      }

      default:
        console.log(`⚠️ Evento no manejado: ${event.type}`)
    }
    
    return new Response(JSON.stringify({ received: true }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      status: 200,
    })
  } catch (error) {
    console.error(`❌ Error al procesar evento: ${error.message}`)
    return new Response(JSON.stringify({ error: error.message }), { 
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      },
      status: 500,
    })
  }
}) 