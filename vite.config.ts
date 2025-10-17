// File: vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import viteImagemin from 'vite-plugin-imagemin';
import viteCompression from 'vite-plugin-compression';

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
  
  const isProduction = mode === 'production';
  
  return {
    plugins: [
      react(),
      // ✅ OPTIMIZACIÓN: Compresión GZIP para reducir tamaño de transferencia (~30% menos)
      isProduction && viteCompression({
        algorithm: 'gzip',
        ext: '.gz',
        threshold: 10240, // Solo archivos > 10KB
        deleteOriginFile: false,
      }),
      // ✅ OPTIMIZACIÓN: Compresión Brotli (mejor que GZIP para navegadores modernos)
      isProduction && viteCompression({
        algorithm: 'brotliCompress',
        ext: '.br',
        threshold: 10240,
        deleteOriginFile: false,
      }),
      // ✅ OPTIMIZACIÓN: Minificar y convertir imágenes a WebP (50-70% reducción)
      isProduction && viteImagemin({
        gifsicle: { optimizationLevel: 3 },
        optipng: { optimizationLevel: 7 },
        mozjpeg: { quality: 75 },
        pngquant: { quality: [0.65, 0.8], speed: 4 },
        webp: { quality: 75 },
      }),
    ].filter(Boolean),
    
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
    
    // ✅ OPTIMIZACIÓN: Configuración de build para producción
    build: {
      // Usar terser para mejor minificación (más lento pero mejor resultado)
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: isProduction, // Remover console.log en producción
          drop_debugger: isProduction,
        },
      },
      // ✅ OPTIMIZACIÓN: Code splitting manual para mejor caching del navegador
      rollupOptions: {
        output: {
          manualChunks: {
            // Separar React y dependencias core (raramente cambian = mejor cache)
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // Stripe en su propio chunk (pesado y específico)
            'vendor-stripe': ['@stripe/react-stripe-js', '@stripe/stripe-js', 'stripe'],
            // Supabase separado (actualización independiente)
            'vendor-supabase': ['@supabase/supabase-js'],
            // Librerías de UI/animación
            'vendor-ui': ['framer-motion', 'recharts', 'react-hot-toast'],
            // i18n y traducciones
            'vendor-i18n': ['i18next', 'react-i18next'],
          },
        },
      },
      // Advertir si los chunks son > 1MB
      chunkSizeWarningLimit: 1000,
      // ✅ OPTIMIZACIÓN: Sourcemaps solo en dev (más rápido build producción)
      sourcemap: !isProduction,
    },
    
    resolve: {
      alias: {
        '@features': path.resolve(__dirname, './src/features'),
        '@shared': path.resolve(__dirname, './src/shared'),
        '@services': path.resolve(__dirname, './src/services'),
        '@translations': path.resolve(__dirname, './src/translations'),
        '@types': path.resolve(__dirname, './src/types'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@': path.resolve(__dirname, './src')
      }
    },
    
    // ✅ OPTIMIZACIÓN: Pre-bundling de dependencias para dev más rápido
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@supabase/supabase-js',
        'react-hot-toast',
      ],
    },
  };
}); 