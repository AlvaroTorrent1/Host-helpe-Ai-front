import { loadStripe } from '@stripe/stripe-js';

// src/services/stripe.ts - Configuración de Stripe para Producción
const ENVIRONMENT = import.meta.env.MODE;
// Clave pública de Stripe de producción - ACTUALIZADA para producción
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_live_51QNuzlKpVJd2j1yPFx0LzTWN0c6J7kmw6NsdjJ6z4g5Ki1xnEBWs4uxzSwHcoswuwfNbhWXJTKHWJW2bxcWjOuNd009GmX21J4';

console.log("Entorno actual:", ENVIRONMENT);
console.log("Clave de Stripe (fallback configurado):", !!STRIPE_PUBLIC_KEY);
console.log("Valor de la clave (primeros 10 caracteres):", 
  STRIPE_PUBLIC_KEY ? 
  STRIPE_PUBLIC_KEY.substring(0, 10) + "..." : 
  "No disponible");

// Asegúrate de reemplazar con tu propia clave publicable
const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

export default stripePromise; 