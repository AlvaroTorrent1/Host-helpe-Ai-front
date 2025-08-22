import { loadStripe } from '@stripe/stripe-js';

// src/services/stripe.ts - Configuración de Stripe para PRODUCCIÓN
const ENVIRONMENT = import.meta.env.MODE;
// Clave pública de Stripe - DEBE venir de variable de entorno
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;

console.log("Entorno actual:", ENVIRONMENT);
console.log("Clave de Stripe (configurada):", !!STRIPE_PUBLIC_KEY);

if (!STRIPE_PUBLIC_KEY) {
  console.error("🚨 ERROR: VITE_STRIPE_PUBLIC_KEY no está configurada en archivo .env");
  console.error("🚨 Crea archivo .env con: VITE_STRIPE_PUBLIC_KEY=pk_live_...");
} else {
  console.log("Tipo de clave:", 
    STRIPE_PUBLIC_KEY.startsWith('pk_live_') ? '🚀 PRODUCCIÓN (live)' : '🧪 TEST'
  );
}

// Configuración de Stripe para pagos reales - requiere variable de entorno
const stripePromise = STRIPE_PUBLIC_KEY ? loadStripe(STRIPE_PUBLIC_KEY) : null;

export default stripePromise; 