/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Check if vitest is installed
const vitestInstalled = (() => {
  try {
    require.resolve('vitest');
    return true;
  } catch (e) {
    return false;
  }
})();

// Base configuration
const baseConfig = {
  plugins: [
    react(),
  ],
  server: {
    port: 4000,
    open: true,        // Opens the browser automatically
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
};

// Vitest configuration
const testConfig = vitestInstalled ? {
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    css: true,
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        'src/main.tsx',
        'src/vite-env.d.ts'
      ]
    }
  }
} : {};

// https://vite.dev/config/
export default defineConfig({
  ...baseConfig,
  ...testConfig
})
