import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Verificar si existen certificados para desarrollo HTTPS
const hasCerts = fs.existsSync('./certs/localhost.key') && fs.existsSync('./certs/localhost.crt');

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno basadas en el modo
  const env = loadEnv(mode, process.cwd(), '');
  
  // Configuración de Stripe - Dinámico según el entorno
  const stripePublicKey = env.VITE_STRIPE_PUBLIC_KEY || 
    // Fallback para desarrollo si no hay variable definida
    'pk_test_51QNuzlKpVJd2j1yPbsg080QS7mmqz68IIrjommi2AkMxLkIhi5PsaONdqSQsivUNkHTgcJAEfkjiMRP4BM5aXlKu00MLBpcYdQ';
  
  // Validaciones importantes para producción
  if (mode === 'production') {
    if (!env.VITE_STRIPE_PUBLIC_KEY) {
      console.error('🚨 ERROR: VITE_STRIPE_PUBLIC_KEY no está definido para producción');
      process.exit(1);
    }
    
    if (stripePublicKey.includes('pk_test_')) {
      console.error('🚨 ERROR: Se está usando una clave de Stripe TEST en producción');
      console.error('Debe usar una clave pk_live_* para producción');
      process.exit(1);
    }
    
    if (!env.VITE_SITE_URL) {
      console.error('🚨 ERROR: VITE_SITE_URL no está definido para producción');
      process.exit(1);
    }
    
    if (env.VITE_SITE_URL.includes('localhost')) {
      console.error('🚨 ERROR: VITE_SITE_URL contiene localhost en producción');
      process.exit(1);
    }
  }
  
  // Log de configuración para debugging
  console.log(`🔧 Configurando Vite para modo: ${mode}`);
  console.log(`🔑 Stripe Key: ${stripePublicKey.substring(0, 15)}...`);
  console.log(`🌐 Site URL: ${env.VITE_SITE_URL || 'no definido'}`);
  
  return {
  plugins: [react()],
  server: {
    port: 4000,
    open: true,
    // Configuración para HTTPS en desarrollo (evita advertencias de Stripe)
    https: hasCerts ? {
      key: fs.readFileSync('./certs/localhost.key'),
      cert: fs.readFileSync('./certs/localhost.crt'),
    } : undefined,
    // Configuración para proxy de API - soluciona problemas de CORS
    proxy: {
      '/api/supabase-functions': {
        target: 'http://localhost:54321',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/supabase-functions/, ''),
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      '@features': path.resolve(__dirname, './src/features'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@services': path.resolve(__dirname, './src/services'),
      '@translations': path.resolve(__dirname, './src/translations'),
      '@types': path.resolve(__dirname, './src/types'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@': path.resolve(__dirname, './src')
    }
  },
    // ✅ CONFIGURACIÓN DINÁMICA - Ya no hardcoded
  define: {
      'import.meta.env.VITE_STRIPE_PUBLIC_KEY': JSON.stringify(stripePublicKey)
  }
  };
}); 