import { loadStripe } from '@stripe/stripe-js';

// src/services/stripe.ts - Configuración de Stripe para MODO TEST
const ENVIRONMENT = import.meta.env.MODE;
// Clave pública de Stripe de TEST - ACTUALIZADA para modo de pruebas
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51QNuzlKpVJd2j1yPbsg080QS7mmqz68IIrjommi2AkMxLkIhi5PsaONdqSQsivUNkHTgcJAEfkjiMRP4BM5aXlKu00MLBpcYdQ';

console.log("Entorno actual:", ENVIRONMENT);
console.log("Clave de Stripe (fallback configurado):", !!STRIPE_PUBLIC_KEY);
console.log("Valor de la clave (primeros 10 caracteres):", 
  STRIPE_PUBLIC_KEY ? 
  STRIPE_PUBLIC_KEY.substring(0, 10) + "..." : 
  "No disponible");

// Asegúrate de reemplazar con tu propia clave publicable
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

export default stripePromise; 