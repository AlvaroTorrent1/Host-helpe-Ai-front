import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';

// Verificar si existen certificados para desarrollo HTTPS
const hasCerts = fs.existsSync('./certs/localhost.key') && fs.existsSync('./certs/localhost.crt');

// https://vite.dev/config/
export default defineConfig({
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
  define: {
    'import.meta.env.VITE_STRIPE_PUBLIC_KEY': JSON.stringify('pk_test_51QNuzJGqB3BnCkzVWHaM0K4GvzUW2MmvzkTJbMIuP0KiGJgKVnJVJAhW1uTEm9fjMq2op3Osu9dfo2YMZGVzAUcG00NeMVRMGM')
  }
}); 