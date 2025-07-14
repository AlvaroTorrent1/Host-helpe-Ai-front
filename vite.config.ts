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
  
  // 🚫 CONFIGURACIÓN DE STRIPE MOVIDA A config/stripe-config.ts
  // Ya no se inyecta desde vite.config.ts para permitir configuración manual
  
  // Log de configuración para debugging
  console.log(`🔧 Configurando Vite para modo: ${mode}`);
  console.log(`🌐 Site URL: ${env.VITE_SITE_URL || 'http://localhost:4000'}`);
  console.log(`ℹ️  Configuración de Stripe: Usando config/stripe-config.ts`);
  
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
  }
  // 🚫 CONFIGURACIÓN STRIPE REMOVIDA - Ahora se usa config/stripe-config.ts
  };
}); 