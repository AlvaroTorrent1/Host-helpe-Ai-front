// dev-server.js - Servidor de desarrollo para manejar pagos de Stripe
// Este servidor simula las funciones de Supabase para desarrollo local

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:4000', 'http://localhost:4001', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());

// Clave secreta de Stripe desde variables de entorno
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

// Importar Stripe
let stripe;
try {
  stripe = require('stripe')(STRIPE_SECRET_KEY);
  console.log('✅ Stripe inicializado correctamente');
} catch (error) {
  console.error('❌ Error inicializando Stripe:', error.message);
  console.log('💡 Instala stripe con: npm install stripe');
}

// Endpoint para crear payment intent
app.post('/functions/v1/create-payment-intent', async (req, res) => {
  console.log('📝 Solicitud recibida para crear payment intent:', req.body);
  
  try {
    if (!stripe) {
      throw new Error('Stripe no está inicializado');
    }
    
    const { amount, currency = 'eur', user_id, plan_id, email } = req.body;
    
    // Validar parámetros requeridos
    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Parámetro amount es requerido y debe ser mayor a 0'
      });
    }
    
    if (!user_id) {
      return res.status(400).json({
        error: 'Parámetro user_id es requerido'
      });
    }
    
    console.log('💳 Creando payment intent con Stripe...');
    console.log(`   Amount: ${amount} centavos`);
    console.log(`   Currency: ${currency}`);
    console.log(`   User ID: ${user_id}`);
    console.log(`   Plan ID: ${plan_id}`);
    console.log(`   Email: ${email}`);
    
    // Crear payment intent con Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: parseInt(amount),
      currency: currency.toLowerCase(),
      metadata: {
        user_id: user_id,
        plan_id: plan_id || 'unknown',
        email: email || 'unknown'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    console.log('✅ Payment intent creado exitosamente:', paymentIntent.id);
    
    // Responder con el client_secret
    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
    
  } catch (error) {
    console.error('❌ Error creando payment intent:', error);
    
    // Manejar errores específicos de Stripe
    if (error.type === 'StripeCardError') {
      res.status(400).json({
        error: `Error de tarjeta: ${error.message}`
      });
    } else if (error.type === 'StripeInvalidRequestError') {
      res.status(400).json({
        error: `Solicitud inválida: ${error.message}`
      });
    } else if (error.type === 'StripeAPIError') {
      res.status(500).json({
        error: `Error de API de Stripe: ${error.message}`
      });
    } else if (error.type === 'StripeConnectionError') {
      res.status(500).json({
        error: `Error de conexión con Stripe: ${error.message}`
      });
    } else if (error.type === 'StripeAuthenticationError') {
      res.status(401).json({
        error: `Error de autenticación de Stripe: ${error.message} - Verifica la clave secreta`
      });
    } else {
      res.status(500).json({
        error: `Error interno del servidor: ${error.message}`
      });
    }
  }
});

// Endpoint de prueba
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Servidor de desarrollo funcionando',
    timestamp: new Date().toISOString(),
    stripeConfigured: !!stripe
  });
});

// Manejar rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint no encontrado',
    availableEndpoints: [
      'POST /functions/v1/create-payment-intent',
      'GET /health'
    ]
  });
});

// Manejar errores globales
app.use((error, req, res, next) => {
  console.error('❌ Error global del servidor:', error);
  res.status(500).json({
    error: 'Error interno del servidor',
    message: error.message
  });
});

// Iniciar servidor
app.listen(port, () => {
  console.log('🚀 Servidor de desarrollo iniciado');
  console.log(`📍 Escuchando en: http://localhost:${port}`);
  console.log('🔗 Endpoints disponibles:');
  console.log(`   POST http://localhost:${port}/functions/v1/create-payment-intent`);
  console.log(`   GET  http://localhost:${port}/health`);
  console.log('');
  console.log('💡 Para probar el endpoint de health:');
  console.log(`   curl http://localhost:${port}/health`);
  console.log('');
  console.log('🔧 Configuración:');
  console.log(`   Stripe configurado: ${!!stripe ? '✅' : '❌'}`);
  console.log(`   Puerto: ${port}`);
  console.log(`   CORS habilitado para: localhost:4000, localhost:4001, localhost:3000`);
}); 