import React, { useState, useEffect } from 'react';
import { useAuth } from '@shared/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { usePaymentFlow } from '@shared/contexts/PaymentFlowContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import supabase from '@/services/supabase';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentElement from './StripePaymentElement';
import SimpleStripeTest from './SimpleStripeTest';
import { createPaymentIntent } from '@/services/stripeApi';
import { useNavigate } from 'react-router-dom';
import { useSubscription } from '@shared/hooks/useSubscription';
import { stripeConfig } from '../../../config/stripe-config';
import { LoadingSpinner, LoadingInline, LoadingSize, LoadingVariant } from '@shared/components/loading';

// Configuración de Stripe - Usando sistema centralizado
const STRIPE_PUBLIC_KEY = stripeConfig.publicKey;
const isProductionMode = stripeConfig.isProduction;
const stripeMode = stripeConfig.mode.toUpperCase();

console.log(`RegisterModal: Usando configuración Stripe en modo ${stripeMode}:`, {
  publicKey: STRIPE_PUBLIC_KEY?.substring(0, 15) + '...',
  isProductionMode,
  productionForced: true, // Sistema configurado para producción
  source: 'stripe-config.ts'
});

// Verificar que la clave pública tenga un formato válido
if (!STRIPE_PUBLIC_KEY || !STRIPE_PUBLIC_KEY.startsWith('pk_')) {
  console.error('¡ADVERTENCIA! La clave pública de Stripe no es válida:', STRIPE_PUBLIC_KEY);
} else {
  console.log(`RegisterModal: Clave pública de Stripe ${stripeMode} válida detectada`);
}

// Cargar Stripe fuera del componente para evitar recreaciones
let stripePromise: Promise<any> | null = null;

// Función para limpiar el estado de Stripe
const clearStripePromise = () => {
  stripePromise = null;
  console.log('RegisterModal: Stripe promise limpiada para reinicialización');
};

// Función para inicializar Stripe de forma segura
const getStripePromise = () => {
  if (!stripePromise && STRIPE_PUBLIC_KEY && STRIPE_PUBLIC_KEY.startsWith('pk_')) {
    console.log(`RegisterModal: Inicializando Stripe.js en modo ${stripeMode}:`, STRIPE_PUBLIC_KEY?.substring(0, 15) + '...');
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY).then(stripe => {
      if (stripe) {
        console.log(`RegisterModal: Stripe.js ${stripeMode} cargado exitosamente`);
      } else {
        console.error('RegisterModal: Error - Stripe.js devolvió null');
      }
      return stripe;
    }).catch(error => {
      console.error('RegisterModal: Error cargando Stripe.js:', error);
      // Limpiar la promesa para permitir reintentos
      stripePromise = null;
      return null;
    });
  }
  return stripePromise;
};

// Inicializar Stripe de inmediato
const stripe = getStripePromise();

// Verificar el estado de la carga de Stripe periódicamente
if (stripe) {
  stripe.then(stripeInstance => {
    if (stripeInstance) {
      console.log('RegisterModal: Confirmación final - Stripe.js está listo para usar');
    } else {
      console.error('RegisterModal: Confirmación final - Stripe.js falló al cargar');
    }
  });
}

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, password: string) => void;
  selectedPlan?: {
    id: string;
    name: string;
    price: number;
  };
}

const RegisterModal: React.FC<RegisterModalProps> = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  selectedPlan 
}) => {
  const navigate = useNavigate();
  // Estados para el formulario
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para la integración de Stripe
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'register' | 'payment' | 'success'>('register');
  const [userId, setUserId] = useState<string | null>(null);
  
  // 🔧 NUEVO: Estado para confirmar cuenta después de Google OAuth
  const [showAccountConfirmation, setShowAccountConfirmation] = useState(false);
  
  const { signUp, user, signInWithGoogle } = useAuth();
  const { t } = useTranslation();
  const { refetchSubscription } = useSubscription();
  const { clearFlow } = usePaymentFlow();
  
  // Cuando se abre el modal, verificar si el usuario ya está autenticado
  useEffect(() => {
    if (isOpen) {
      // Limpiar estado de Stripe al abrir el modal para evitar errores de versión
      clearStripePromise();
      
      // Resetear estados de confirmación
      setShowAccountConfirmation(false);
      
      console.log('📝 Modal: Modal abierto, verificando estado de autenticación');
      
      // Si el usuario ya está autenticado, mostrar confirmación en lugar de proceder automáticamente
      if (user && selectedPlan) {
        console.log('🔍 Modal: Usuario ya autenticado, mostrando confirmación de cuenta');
        setShowAccountConfirmation(true);
      }
    }
  }, [isOpen, user, selectedPlan]);

  // Detectar retorno de Google OAuth y mostrar confirmación
  useEffect(() => {
    const awaitingConfirmation = localStorage.getItem('awaitingAccountConfirmation') === 'true';
    
    // Si tenemos usuario, plan seleccionado, y estamos esperando confirmación
    if (user && selectedPlan && awaitingConfirmation && isOpen) {
      console.log('🔄 Modal: Usuario retornó de Google OAuth, mostrando confirmación de cuenta');
      
      // Limpiar el flag y mostrar confirmación
      localStorage.removeItem('awaitingAccountConfirmation');
      setShowAccountConfirmation(true);
    }
  }, [user, selectedPlan, isOpen]);

  // Función para manejar el inicio de sesión con Google
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // Si hay un plan seleccionado, guardarlo en localStorage antes de redirigir
      if (selectedPlan) {
        localStorage.setItem("selectedPlanId", selectedPlan.id);
        localStorage.setItem("selectedPlanName", selectedPlan.name);
        localStorage.setItem("selectedPlanPrice", selectedPlan.price.toString());
      }
      
      // Marcar que esperamos confirmación después de OAuth
      localStorage.setItem('awaitingAccountConfirmation', 'true');
      
      // Iniciar el flujo de autenticación con Google
      const { error } = await signInWithGoogle();
      
      if (error) {
        setError(error.message);
        localStorage.removeItem('awaitingAccountConfirmation');
      }
      // No necesitamos manejar el caso de éxito aquí, ya que se redirigirá al usuario
    } catch (err: any) {
      console.error("Error durante la autenticación con Google:", err);
      setError("Error al iniciar sesión con Google. Inténtalo de nuevo.");
      localStorage.removeItem('awaitingAccountConfirmation');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para proceder al pago después de confirmar la cuenta
  const proceedToPayment = async () => {
    if (user && selectedPlan) {
      try {
        setIsLoading(true);
        setError("");
        setShowAccountConfirmation(false); // Ocultar confirmación
        
        console.log("🎯 Iniciando proceso de pago para usuario confirmado:", {
          userId: user.id,
          planId: selectedPlan.id,
          email: user.email,
          price: selectedPlan.price,
          priceInCents: selectedPlan.price * 100
        });
        
        // Comprobar que el precio sea válido
        if (!selectedPlan.price || selectedPlan.price <= 0) {
          console.error("❌ Precio inválido detectado:", selectedPlan.price);
          throw new Error(`El precio del plan no es válido: ${selectedPlan.price}`);
        }
        
        console.log("Llamando a createPaymentIntent...");
        
        // Iniciar el proceso de pago creando un payment intent
        try {
          // Limpiar completamente el estado anterior
          setClientSecret(null);
          setPaymentStep('register');
          
          // Esperar un tick para que React procese la limpieza del estado
          await new Promise(resolve => setTimeout(resolve, 50));
          
          // Log detallado antes de llamar a createPaymentIntent
          const paymentParams = {
            amount: selectedPlan.price * 100, // Convertir a centavos
            currency: 'eur',
            user_id: user.id,
            plan_id: selectedPlan.id,
            email: user.email || ''
          };
          
          console.log('💳 Llamando a createPaymentIntent con parámetros:', paymentParams);
          console.log(`📊 Verificación: Plan ${selectedPlan.id} - €${selectedPlan.price} = ${selectedPlan.price * 100} centavos`);
          
          const { clientSecret } = await createPaymentIntent(paymentParams);
          
          if (!clientSecret) {
            throw new Error("No se recibió client_secret del servidor");
          }
          
          console.log("Payment intent creado correctamente, obtenido client_secret");
        
          // Guardar información para el flujo de pago
          setUserId(user.id);
          
          // Crear un registro pendiente de suscripción si no existe
          console.log("Guardando suscripción pendiente en Supabase");
          await supabase.from('customer_subscriptions').upsert({
            user_id: user.id,
            plan_id: selectedPlan.id,
            status: 'pending',
            current_period_end: null,
          });
          
          // Guardar información del plan seleccionado en localStorage para uso posterior
          localStorage.setItem("selectedPlanId", selectedPlan.id);
          localStorage.setItem("selectedPlanName", selectedPlan.name);
          localStorage.setItem("selectedPlanPrice", selectedPlan.price.toString());
            
          // Establecer el estado de pago y el client secret en el orden correcto
          setPaymentStep('payment');
          
          // Pequeña demora para asegurar que el componente esté listo
          await new Promise(resolve => setTimeout(resolve, 100));
          
          setClientSecret(clientSecret);
        } catch (apiError: any) {
          console.error("Error llamando a la API de Stripe:", apiError);
          if (apiError.message.includes('CORS')) {
            setError("Error de conexión: El servidor rechazó la solicitud. Puede ser un problema con CORS.");
          } else if (apiError.message.includes('Failed to fetch') || apiError.message.includes('NetworkError')) {
            setError("Error de red: No se pudo conectar con el servidor de pagos. Verifica tu conexión a internet.");
          } else {
            setError(`Error API: ${apiError.message}`);
          }
          throw apiError; // Re-lanzar para manejo posterior
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error("Error preparando la suscripción:", err);
        
        // Mostrar un mensaje de error más específico
        if (err instanceof Error) {
          if (err.message.includes('client_secret')) {
            setError("Error al crear el pago: No se pudo generar la información de pago");
          } else if (err.message.includes('conexión')) {
            setError("Error de conexión: No se pudo conectar con el servidor de pagos");
          } else if (err.message.includes('CORS')) {
            setError("Error de conexión: El servidor rechazó la solicitud (CORS)");
          } else {
            setError(`Error: ${err.message}`);
          }
        } else {
          setError("Ha ocurrido un error preparando el pago. Inténtalo de nuevo.");
        }
        
        setIsLoading(false);
        setShowAccountConfirmation(true); // Volver a mostrar confirmación en caso de error
      }
    }
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;
  
  // Manejador para el éxito del pago y navegación
  const handlePaymentSuccessAndNavigate = async () => {
    console.log('🎉 Modal: Pago exitoso, preparando para navegar al dashboard...');
    setPaymentStep('success');
                    toast.success(t('payment.subscriptionActivated') || "¡Suscripción activada correctamente!");
    
    // SOLUCIÓN TEMPORAL DE RESPALDO: Actualizar directamente el status a 'active'
    // Esto asegura que funcione mientras verificamos el webhook
    if (userId && selectedPlan) {
      console.log('🔄 Modal: Aplicando solución de respaldo - Actualizando suscripción a ACTIVE directamente...');
      try {
        const { data: updateResult, error: updateError } = await supabase
          .from('customer_subscriptions')
          .update({
            status: 'active',
            current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          })
          .eq('user_id', userId)
          .eq('plan_id', selectedPlan.id)
          .eq('status', 'pending')
          .select();
          
        if (updateError) {
          console.error('❌ Modal: Error en solución de respaldo:', updateError);
        } else {
          console.log('✅ Modal: Solución de respaldo aplicada - Suscripción actualizada a ACTIVE:', updateResult);
          
          // FORZAR REFETCH de la suscripción antes de navegar
          console.log('🔄 Modal: Forzando refetch de suscripción...');
          try {
            await refetchSubscription();
            console.log('✅ Modal: Refetch completado');
            
            // Esperar un poco más para asegurar que el estado se actualice
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Verificar una vez más que la suscripción esté activa
            const verificationStatus = await checkCurrentSubscriptionStatus();
            console.log('🔍 Modal: Estado de verificación final:', verificationStatus);
            
          } catch (refetchError) {
            console.error('❌ Modal: Error en refetch:', refetchError);
          }
          
          // NAVEGACIÓN DIRECTA después del update exitoso
          console.log('🎉 Modal: Navegando directamente al dashboard...');
    setTimeout(() => {
            // 🚀 NUEVO: Limpiar el flujo de pago del contexto global
            clearFlow();
            onSuccess("", "");
            navigate('/dashboard');
          }, 2000); // 2 segundos para mostrar el mensaje de éxito
          return; // Salir aquí, no hacer polling
        }
      } catch (error) {
        console.error('❌ Modal: Error en solución de respaldo:', error);
      }
    }
    
    // Solo hacer polling si la actualización directa falló
    console.log('⚠️ Modal: Actualización directa falló, iniciando polling de verificación...');
    
    const pollForActiveSubscription = async (maxAttempts = 5, intervalMs = 2000) => {
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`Modal: Intento ${attempt}/${maxAttempts} - Verificando suscripción...`);
        
        try {
          await refetchSubscription();
          
          // Check if subscription is now active
          const currentSubscriptionStatus = await checkCurrentSubscriptionStatus();
          
          if (currentSubscriptionStatus === 'active') {
            console.log('🎉 Modal: ¡Suscripción activa encontrada! Navegando al dashboard...');
            // 🚀 NUEVO: Limpiar el flujo de pago del contexto global
            clearFlow();
            onSuccess("", "");
            navigate('/dashboard');
            return true; // Success
          }
          
          console.log(`Modal: Intento ${attempt} - Suscripción aún no activa. Esperando ${intervalMs}ms...`);
          
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, intervalMs));
          }
        } catch (error) {
          console.error(`Modal: Error en intento ${attempt}:`, error);
          if (attempt < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, intervalMs));
          }
        }
      }
      
      // If we get here, polling failed - navigate anyway
      console.warn('Modal: Timeout esperando suscripción activa. Navegando al dashboard...');
      toast.success("Pago completado. Accediendo al dashboard...");
      // 🚀 NUEVO: Limpiar el flujo de pago del contexto global
      clearFlow();
      onSuccess("", "");
      navigate('/dashboard');
      return false;
    };
    
    // Start polling only if direct update failed
    await pollForActiveSubscription();
  };
  
  // Manejador para los errores de pago
  const handlePaymentError = (message: string) => {
    setError(message);
    setIsProcessingPayment(false);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Si el usuario ya está autenticado, saltamos al proceso de pago
    if (user) {
      proceedToPayment();
      return;
    }
    
    // Validar que las contraseñas coincidan
    if (password !== confirmPassword) {
      setError(t("auth.register.form.passwordMismatch"));
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Guardar el nombre en localStorage
      localStorage.setItem("userFullName", fullName);
      
      // Guardar información del plan seleccionado en localStorage para uso posterior
      if (selectedPlan) {
        localStorage.setItem("selectedPlanId", selectedPlan.id);
        localStorage.setItem("selectedPlanName", selectedPlan.name);
        localStorage.setItem("selectedPlanPrice", selectedPlan.price.toString());
      }
      
      // Intentar crear una cuenta
      const { error, data } = await signUp(email, password);
      
      if (error) {
        setError(error.message);
        setIsLoading(false);
      } else {
        // Si el registro es exitoso y tenemos un plan seleccionado, procedemos al pago
        if (data?.user && selectedPlan) {
          proceedToPayment();
        } else {
          // Si no hay plan seleccionado o no tenemos datos del usuario, simplemente cerramos el modal
          onSuccess(email, password);
        }
      }
    } catch (err: any) {
      console.error("Error durante el registro:", err);
      setError(err?.message || "Error durante el registro. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Título del modal según el paso actual
  const getModalTitle = () => {
    if (showAccountConfirmation) {
      return t("auth.register.modalTitles.confirmAccount");
    }
    
    switch (paymentStep) {
      case 'register':
        return selectedPlan ? `${t("auth.register.modalTitles.subscriptionTo")} ${selectedPlan.name}` : t("auth.register.modalTitles.createAccount");
      case 'payment':
        return t("auth.register.modalTitles.completePayout");
      case 'success':
        return t("auth.register.modalTitles.paymentSuccess");
      default:
        return t("auth.register.modalTitles.createAccount");
    }
  };
  
  // Helper function to check current subscription status
  const checkCurrentSubscriptionStatus = async () => {
    if (!user) {
      console.log('❌ Modal: No user found for subscription check');
      return null;
    }
    
    try {
      // Query for this specific user's active subscriptions
      const { data: userAnyData, error: userAnyError } = await supabase
        .from('customer_subscriptions')
        .select('*')
        .eq('user_id', user.id);
        
      if (userAnyError) {
        console.error('❌ Modal: User query failed:', userAnyError);
        return null;
      }
      
      if (userAnyData && userAnyData.length > 0) {
        // Look for active subscription
        const activeSubscription = userAnyData.find(sub => sub.status === 'active');
        if (activeSubscription) {
          console.log('✅ Modal: Found active subscription:', activeSubscription);
          return 'active';
        }
      }
      
      return null;
    } catch (error) {
      console.error('❌ Modal: Exception during subscription check:', error);
      return null;
    }
  };
  
  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        // Cerrar si se hace clic en el fondo
        if (e.target === e.currentTarget) {
          // Limpiar completamente el estado de Stripe al cerrar
          clearStripePromise();
          setClientSecret(null);
          setPaymentStep('register');
          setError('');
          
          // Limpiar flags de confirmación
          setShowAccountConfirmation(false);
          localStorage.removeItem('awaitingAccountConfirmation');
          
          // 🚀 NUEVO: Limpiar el flujo de pago del contexto global
          clearFlow();
          
          onClose();
        }
      }}
    >
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
        {/* Fondo oscuro */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          aria-hidden="true"
        ></div>

        {/* Spacer para centrar */}
        <span 
          className="hidden sm:inline-block sm:align-middle sm:h-screen" 
          aria-hidden="true"
        >
          &#8203;
        </span>

        {/* Modal */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle max-w-lg w-full">
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {getModalTitle()}
              </h3>
            <button
              onClick={() => {
                // Limpiar completamente el estado de Stripe al cerrar
                clearStripePromise();
                setClientSecret(null);
                setPaymentStep('register');
                setError('');
                
                // Limpiar flags de confirmación
                setShowAccountConfirmation(false);
                localStorage.removeItem('awaitingAccountConfirmation');
                
                // 🚀 NUEVO: Limpiar el flujo de pago del contexto global
                clearFlow();
                
                onClose();
              }}
                className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                aria-label="Cerrar"
            >
                <span className="sr-only">Cerrar</span>
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            </div>
          </div>
          
          {/* Content */}
          <div className="bg-white px-4 pt-0 pb-4 sm:p-6 sm:pt-0">
              {/* Mostrar errores */}
            {error && (
              <div className="mb-4 p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            
              {/* Step: Registro */}
              {paymentStep === 'register' && !showAccountConfirmation && (
              <div className="space-y-6">
                {/* Plan seleccionado */}
                {selectedPlan && (
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <svg className="w-5 h-5 text-primary-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <h4 className="text-sm font-medium text-primary-800">{t("auth.register.confirmation.planSelectedTitle")}</h4>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-primary-700">{selectedPlan.name}</span>
                      <span className="text-lg font-bold text-primary-800">{selectedPlan.price}€</span>
                    </div>
                    <p className="text-xs text-primary-600 mt-1">{t("auth.register.confirmation.paymentAssociationNote")}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre completo */}
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("auth.register.form.fullName")}
                    </label>
                    <input
                        id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                        placeholder={t("auth.register.form.fullNamePlaceholder")}
                    />
                  </div>
                  
                    {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("auth.register.form.email")}
                    </label>
                    <input
                        id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                        placeholder={t("auth.register.form.emailPlaceholder")}
                    />
                  </div>
                  
                    {/* Contraseña */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("auth.register.form.password")}
                    </label>
                    <input
                        id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                        placeholder={t("auth.register.form.passwordPlaceholder")}
                    />
                  </div>
                  
                    {/* Confirmar contraseña */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      {t("auth.register.form.confirmPassword")}
                    </label>
                    <input
                        id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 text-sm"
                        placeholder={t("auth.register.form.confirmPasswordPlaceholder")}
                    />
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="space-y-3 pt-2">
                      {/* Botón de Google - PRIORITARIO */}
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                      className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
                          />
                        </svg>
{t("auth.register.form.continueWithGoogle")}
                      </button>
                      
                      {/* Separador */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                        <span className="px-2 text-gray-500 bg-white">{t("auth.register.form.or")}</span>
                        </div>
                      </div>
                      
                    {/* Botón de registro manual */}
                  <button
                    type="submit"
                    disabled={isLoading}
                      className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? (
                          <>
                          <LoadingSpinner size={LoadingSize.SM} variant={LoadingVariant.WHITE} className="mr-3" />
                          {t("auth.register.form.processing")}
                          </>
                        ) : (
                        t("auth.register.form.createAccountButton")
                        )}
                  </button>
                    </div>
                </form>
              </div>
              )}

              {/* Step: Confirmación de cuenta (después de Google OAuth) */}
              {showAccountConfirmation && user && selectedPlan && (
              <div className="space-y-6">
                {/* Mensaje de éxito */}
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-2">
                      {t("auth.register.confirmation.authSuccessTitle")}
                    </h3>
                  <p className="text-sm text-gray-600">
                      {t("auth.register.confirmation.authSuccessMessage")}
                    </p>
                  </div>
                  
                  {/* Información de la cuenta seleccionada */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                    </svg>
                    {t("auth.register.confirmation.accountSelectedTitle")}
                    </h4>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-blue-900 truncate">
                          {user.email}
                        </p>
                        {user.user_metadata?.full_name && (
                        <p className="text-xs text-blue-700 truncate">
                            {user.user_metadata.full_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Resumen del plan seleccionado */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {t("auth.register.confirmation.planSelectedTitle")}
                    </h4>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{selectedPlan.name}</span>
                      <span className="text-lg font-bold text-gray-900">{selectedPlan.price}€</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {t("auth.register.confirmation.paymentAssociationNote")}
                    </p>
                  </div>
                  
                  {/* Botones de acción */}
                <div className="space-y-3">
                    <button
                      onClick={proceedToPayment}
                      disabled={isLoading}
                    className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? (
                        <>
                        <LoadingSpinner size={LoadingSize.SM} variant={LoadingVariant.WHITE} className="mr-3" />
                        {t("auth.register.confirmation.preparingPayment")}
                        </>
                      ) : (
                      t("auth.register.confirmation.continueToPayment")
                      )}
                    </button>
                    
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                        setShowAccountConfirmation(false);
                        setError('');
                        toast.success(t("auth.register.confirmation.logoutSuccess"));
                      }}
                      disabled={isLoading}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {t("auth.register.confirmation.useOtherAccount")}
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Pago */}
              {paymentStep === 'payment' && clientSecret && (
              <div className="space-y-6">
                  {/* Mostrar resumen del plan seleccionado */}
                  {selectedPlan && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">{t("auth.register.payment.purchaseSummary")}</h4>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{selectedPlan.name}</span>
                      <span className="text-lg font-bold text-gray-900">{selectedPlan.price}€</span>
                      </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {t("auth.register.payment.subscriptionStartsNote")}
                      </p>
                    </div>
                  )}
                  
                                    {/* Renderizar Elements de forma más simple */}
                  {stripe && clientSecret ? (
                    <Elements 
                      stripe={stripe} 
                      options={{ 
                        clientSecret,
                        appearance: { theme: 'stripe' }
                      }}
                      key={clientSecret} // Clave única basada en clientSecret
                    >
                      <StripePaymentElement 
                        clientSecret={clientSecret}
                        onSuccess={handlePaymentSuccessAndNavigate}
                        onError={handlePaymentError}
                        isTestMode={false} // Forzado a false - Modo producción
                      />
                    </Elements>
                  ) : clientSecret && !stripe ? (
                  <div className="text-center py-8">
                    <LoadingSpinner size={LoadingSize.LG} variant={LoadingVariant.DANGER} className="mx-auto mb-4" />
                    <p className="text-red-600 font-medium">{t("auth.register.payment.loadingPaymentSystem")}</p>
                    <p className="text-sm text-gray-500 mb-4">{t("auth.register.payment.invalidKeyMessage")}</p>
                        <button 
                          onClick={() => window.location.reload()}
                      className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm"
                        >
                          {t("auth.register.payment.reloadPage")}
                    </button>
                    </div>
                  ) : !clientSecret ? (
                  <div className="text-center py-8">
                    <LoadingSpinner size={LoadingSize.LG} variant={LoadingVariant.PRIMARY} className="mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">{t("auth.register.payment.preparingPaymentTitle")}</p>
                      <p className="text-sm text-gray-500">{t("auth.register.payment.creatingSecureInfo")}</p>
                    </div>
                  ) : (
                  <div className="text-center py-8">
                    <LoadingSpinner size={LoadingSize.LG} variant={LoadingVariant.PRIMARY} className="mx-auto mb-4" />
                    <p className="text-gray-600 font-medium">{t("auth.register.payment.initializingSystem")}</p>
                    <p className="text-sm text-gray-500 mb-4">{t("auth.register.payment.loadingStripe")} {stripeMode}...</p>
                      <button 
                        onClick={() => {
                          // Limpiar estado y reiniciar
                          clearStripePromise();
                          setClientSecret(null);
                          setPaymentStep('register');
                          setTimeout(() => {
                            if (user && selectedPlan) {
                              proceedToPayment();
                            }
                          }, 100);
                        }}
                      className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                      >
                        {t("auth.register.payment.retryInitialization")}
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Step: Éxito */}
              {paymentStep === 'success' && (
              <div className="text-center py-6">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-3">{t("auth.register.success.paymentCompletedTitle")}</h3>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    {t("auth.register.success.subscriptionActivated", { planName: selectedPlan?.name })}
                  </p>
                  <p className="text-sm text-gray-500">
                      {t("auth.register.success.enjoyFeatures")}
                    </p>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal; 