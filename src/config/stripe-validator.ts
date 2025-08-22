// src/config/stripe-validator.ts
// Validador de configuración de Stripe para prevenir errores de sincronización

import stripeConfig from '../../config/stripe-config';

/**
 * Valida que las claves de Stripe estén correctamente configuradas
 * y sean consistentes entre frontend y backend
 */
export class StripeConfigValidator {
  private static instance: StripeConfigValidator;
  private isValid: boolean = false;
  private errors: string[] = [];
  private warnings: string[] = [];

  private constructor() {
    this.validate();
  }

  static getInstance(): StripeConfigValidator {
    if (!StripeConfigValidator.instance) {
      StripeConfigValidator.instance = new StripeConfigValidator();
    }
    return StripeConfigValidator.instance;
  }

  /**
   * Valida la configuración de Stripe (ejecuta validación fresca cada vez)
   */
  private validate(): void {
    this.errors = [];
    this.warnings = [];
    
    // Importar dinámicamente para obtener configuración fresca
    // Nota: En producción, esto siempre obtendrá la configuración actual
    const publicKey = stripeConfig.publicKey;
    
    if (!publicKey || publicKey === 'pk_live_REQUIRED_FROM_ENV_VARIABLE' || publicKey === 'pk_live_REQUIRED_FROM_ENV') {
      this.errors.push('❌ Clave pública de Stripe no configurada. Configurar VITE_STRIPE_PUBLIC_KEY en .env');
      this.isValid = false;
      return;
    }

    // Detectar modo basado en la clave
    const isTestKey = publicKey.startsWith('pk_test_');
    const isLiveKey = publicKey.startsWith('pk_live_');
    
    if (!isTestKey && !isLiveKey) {
      this.errors.push('❌ Clave pública de Stripe inválida. Debe comenzar con pk_test_ o pk_live_');
      this.isValid = false;
      return;
    }

    // Validar consistencia con el modo configurado
    if (stripeConfig.mode === 'production' && !isLiveKey) {
      this.errors.push('⚠️ Modo PRODUCCIÓN configurado pero usando clave TEST');
      this.warnings.push('Cambiar a clave pk_live_ para pagos reales');
    }

    if (stripeConfig.mode === 'test' && isLiveKey) {
      this.errors.push('⚠️ Modo TEST configurado pero usando clave LIVE');
      this.warnings.push('Cambiar a clave pk_test_ para desarrollo');
    }

    // Validar variable de entorno
    const envKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
    if (!envKey && stripeConfig.mode === 'production') {
      this.warnings.push('⚠️ Se recomienda usar variable de entorno VITE_STRIPE_PUBLIC_KEY en producción');
    }

    this.isValid = this.errors.length === 0;
  }

  /**
   * Obtiene el estado de validación (ejecuta validación fresca cada vez)
   */
  getValidationStatus(): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    mode: string;
    keyType: 'test' | 'live' | 'unknown';
  } {
    // Ejecutar validación fresca cada vez para evitar problemas de cache
    this.validate();
    
    // Usar la configuración importada, no require()
    const publicKey = stripeConfig.publicKey;
    let keyType: 'test' | 'live' | 'unknown' = 'unknown';
    
    if (publicKey?.startsWith('pk_test_')) keyType = 'test';
    else if (publicKey?.startsWith('pk_live_')) keyType = 'live';

    return {
      isValid: this.isValid,
      errors: this.errors,
      warnings: this.warnings,
      mode: stripeConfig.mode,
      keyType
    };
  }

  /**
   * Muestra el estado de configuración en consola
   */
  logStatus(): void {
    const status = this.getValidationStatus();
    
    console.group('🔍 Validación de Configuración Stripe');
    console.log(`Modo: ${status.mode.toUpperCase()}`);
    console.log(`Tipo de clave: ${status.keyType.toUpperCase()}`);
    console.log(`Estado: ${status.isValid ? '✅ VÁLIDO' : '❌ INVÁLIDO'}`);
    
    if (status.errors.length > 0) {
      console.group('Errores:');
      status.errors.forEach(error => console.error(error));
      console.groupEnd();
    }
    
    if (status.warnings.length > 0) {
      console.group('Advertencias:');
      status.warnings.forEach(warning => console.warn(warning));
      console.groupEnd();
    }
    
    console.groupEnd();
  }

  /**
   * Verifica si la configuración es segura para producción
   */
  isProductionReady(): boolean {
    const status = this.getValidationStatus();
    return status.isValid && 
           status.mode === 'production' && 
           status.keyType === 'live' &&
           status.errors.length === 0;
  }

  /**
   * Obtiene recomendaciones para corregir la configuración
   */
  getRecommendations(): string[] {
    const recommendations: string[] = [];
    const status = this.getValidationStatus();

    if (!status.isValid) {
      recommendations.push('1. Verificar que existe el archivo .env con VITE_STRIPE_PUBLIC_KEY');
      recommendations.push('2. Asegurar que la clave comience con pk_test_ (desarrollo) o pk_live_ (producción)');
      recommendations.push('3. Reiniciar el servidor de desarrollo después de cambiar .env');
    }

    if (status.mode === 'production' && status.keyType === 'test') {
      recommendations.push('⚠️ CRÍTICO: Actualizar a claves LIVE de Stripe para producción');
      recommendations.push('- Obtener pk_live_ desde el dashboard de Stripe');
      recommendations.push('- Actualizar VITE_STRIPE_PUBLIC_KEY en .env');
      recommendations.push('- Configurar STRIPE_SECRET_KEY en Supabase Edge Functions');
    }

    return recommendations;
  }
}

// Exportar instancia singleton
export const stripeValidator = StripeConfigValidator.getInstance();

// Auto-validar al cargar el módulo
if (import.meta.env.DEV) {
  stripeValidator.logStatus();
}
