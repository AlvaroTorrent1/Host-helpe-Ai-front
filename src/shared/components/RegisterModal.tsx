import React, { useState, useEffect } from 'react';
import { useAuth } from '@shared/contexts/AuthContext';
import { useLanguage } from '@shared/contexts/LanguageContext';
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

// Configuración de Stripe - Se adapta automáticamente según las variables de entorno
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51QNuzlKpVJd2j1yPbsg080QS7mmqz68IIrjommi2AkMxLkIhi5PsaONdqSQsivUNkHTgcJAEfkjiMRP4BM5aXlKu00MLBpcYdQ';

// Detectar automáticamente si estamos en modo producción o test
const isProductionMode = STRIPE_PUBLIC_KEY.startsWith('pk_live_');
const stripeMode = isProductionMode ? 'PRODUCCIÓN' : 'TEST';

console.log(`RegisterModal: Usando clave pública de Stripe en modo ${stripeMode}:`, STRIPE_PUBLIC_KEY?.substring(0, 15) + '...');

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
  const { t } = useLanguage();
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
        
        console.log("Iniciando proceso de pago para usuario confirmado:", {
          userId: user.id,
          planId: selectedPlan.id,
          email: user.email,
          price: selectedPlan.price
        });
        
        // Comprobar que el precio sea válido
        if (!selectedPlan.price || selectedPlan.price <= 0) {
          throw new Error("El precio del plan no es válido");
        }
        
        console.log("Llamando a createPaymentIntent...");
        
        // Iniciar el proceso de pago creando un payment intent
        try {
          // Limpiar completamente el estado anterior
          setClientSecret(null);
          setPaymentStep('register');
          
          // Esperar un tick para que React procese la limpieza del estado
          await new Promise(resolve => setTimeout(resolve, 50));
          
          const { clientSecret } = await createPaymentIntent({
            amount: selectedPlan.price * 100, // Convertir a centavos
            currency: 'eur',
            user_id: user.id,
            plan_id: selectedPlan.id,
            email: user.email || ''
          });
          
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
    toast.success("¡Suscripción activada! Redirigiendo al dashboard...");
    
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
      setError("Las contraseñas no coinciden");
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
      return "Confirmar cuenta";
    }
    
    switch (paymentStep) {
      case 'register':
        return selectedPlan ? `Suscripción a ${selectedPlan.name}` : "Crear cuenta";
      case 'payment':
        return "Completar pago";
      case 'success':
        return "¡Pago exitoso!";
      default:
        return "Crear cuenta";
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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Overlay de fondo */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" 
          onClick={onClose}
          aria-hidden="true"
        ></div>

        {/* Centrar el modal */}
        <span 
          className="hidden sm:inline-block sm:align-middle sm:h-screen" 
          aria-hidden="true"
        >&#8203;</span>
        
        {/* Modal content */}
        <div className="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none"
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
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          
          <div className="sm:flex sm:items-start">
            <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
              <h3 className="text-2xl font-bold leading-6 text-gray-900 mb-6">
                {getModalTitle()}
              </h3>
              
              {/* Mostrar errores */}
            {error && (
                <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 rounded-md">
                {error}
              </div>
            )}
            
              {/* Step: Registro */}
              {paymentStep === 'register' && !showAccountConfirmation && (
                <>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Nombre completo */}
                  <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                      Nombre completo
                    </label>
                    <input
                        id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Tu nombre completo"
                    />
                  </div>
                  
                    {/* Email */}
                  <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Correo electrónico
                    </label>
                    <input
                        id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="tu@correo.com"
                    />
                  </div>
                  
                    {/* Contraseña */}
                  <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                      Contraseña
                    </label>
                    <input
                        id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Mínimo 6 caracteres"
                    />
                  </div>
                  
                    {/* Confirmar contraseña */}
                  <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                      Confirmar contraseña
                    </label>
                    <input
                        id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                        className="block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        placeholder="Repite tu contraseña"
                    />
                  </div>
                  
                    {/* Mostrar resumen del plan seleccionado */}
                    {selectedPlan && (
                      <div className="p-4 mt-4 border border-gray-200 rounded-md bg-gray-50">
                        <h4 className="text-md font-medium">Resumen del plan</h4>
                        <div className="flex justify-between items-center mt-2">
                          <span>{selectedPlan.name}</span>
                          <span className="font-bold">{selectedPlan.price}€</span>
                        </div>
                      </div>
                    )}
                    
                    {/* GOOGLE OAUTH PRIMERO - Opción recomendada */}
                    <div className="flex flex-col space-y-3">
                      {/* Botón de Google - PRIORITARIO */}
                      <button
                        type="button"
                        onClick={handleGoogleSignIn}
                        disabled={isLoading}
                        className="w-full px-4 py-3 flex items-center justify-center border-2 border-blue-500 rounded-md shadow-sm bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                      >
                        <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                          <path
                            fill="#4285F4"
                            d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"
                          />
                        </svg>
                        <span className="font-medium text-blue-700">
                          🚀 Continuar con Google (Recomendado)
                        </span>
                      </button>
                      
                      {/* Separador */}
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                          <span className="px-2 text-gray-500 bg-white">o crea cuenta manualmente</span>
                        </div>
                      </div>
                      
                      {/* Botón de registro manual - SECUNDARIO */}
                  <button
                    type="submit"
                    disabled={isLoading}
                        className="w-full px-4 py-2 text-white bg-gray-600 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                      >
                        {isLoading ? (
                          <>
                            <span className="mr-2">Procesando...</span>
                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </>
                        ) : (
                          "Crear cuenta con email"
                        )}
                  </button>
                    </div>
                </form>
                </>
              )}

              {/* Step: Confirmación de cuenta (después de Google OAuth) */}
              {showAccountConfirmation && user && selectedPlan && (
                <div className="space-y-6 py-2">
                  <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                      <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-3">
                      ¡Autenticación exitosa!
                    </h3>
                    <p className="text-sm text-gray-600 mb-6">
                      Has iniciado sesión correctamente con tu cuenta de Google.
                    </p>
                  </div>
                  
                  {/* Información de la cuenta seleccionada */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h4 className="text-sm font-medium text-blue-900 mb-2">
                      📧 Cuenta seleccionada:
                    </h4>
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">
                            {user.email?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-blue-900">
                          {user.email}
                        </p>
                        {user.user_metadata?.full_name && (
                          <p className="text-xs text-blue-700">
                            {user.user_metadata.full_name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Resumen del plan seleccionado */}
                  <div className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                      📋 Plan seleccionado:
                    </h4>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-700">{selectedPlan.name}</span>
                      <span className="text-lg font-bold text-gray-900">{selectedPlan.price}€</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      El pago se asociará a la cuenta mostrada arriba
                    </p>
                  </div>
                  
                  {/* Botones de acción */}
                  <div className="flex flex-col space-y-3">
                    <button
                      onClick={proceedToPayment}
                      disabled={isLoading}
                      className="w-full px-4 py-3 bg-primary-600 text-white font-medium rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isLoading ? (
                        <>
                          <span className="mr-2">Preparando pago...</span>
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </>
                      ) : (
                        "✅ Continuar al pago"
                      )}
                    </button>
                    
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut();
                        setShowAccountConfirmation(false);
                        setError('');
                        toast.success('Sesión cerrada. Puedes elegir otra cuenta.');
                      }}
                      disabled={isLoading}
                      className="w-full px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:bg-gray-50 disabled:cursor-not-allowed text-sm"
                    >
                      🔄 Usar otra cuenta de Google
                    </button>
                  </div>
                </div>
              )}

              {/* Step: Pago */}
              {paymentStep === 'payment' && clientSecret && (
                <div className="space-y-6 py-2">
                  {/* Mostrar resumen del plan seleccionado */}
                  {selectedPlan && (
                    <div className="p-4 border border-gray-200 rounded-md bg-gray-50 mb-4">
                      <h4 className="text-md font-medium">Resumen de la compra</h4>
                      <div className="flex justify-between items-center mt-2">
                        <span>{selectedPlan.name}</span>
                        <span className="font-bold">{selectedPlan.price}€</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-2">
                        Tu suscripción comenzará inmediatamente después del pago
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
                      />
                    </Elements>
                  ) : clientSecret && !stripe ? (
                    <div className="text-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                      <p className="mt-4 text-red-600 font-medium">Error cargando Stripe.js</p>
                      <p className="text-sm text-gray-500">La clave pública puede ser inválida o hay problemas de conexión</p>
                      <div className="mt-4 space-y-2">
                        <button 
                          onClick={() => window.location.reload()}
                          className="mx-auto block px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
                        >
                          Recargar página
                    </button>
                        <p className="text-xs text-gray-400">
                          Si el problema persiste, contacta con soporte
                        </p>
                      </div>
                    </div>
                  ) : !clientSecret ? (
                    <div className="text-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
                      <p className="mt-4 text-yellow-600 font-medium">Preparando pago...</p>
                      <p className="text-sm text-gray-500">Creando información de pago segura</p>
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Inicializando sistema de pago...</p>
                      <p className="text-sm text-gray-500">Cargando Stripe.js en modo {stripeMode}...</p>
                      {/* Botón de reintento si hay problemas */}
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
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
                      >
                        Reintentar inicialización
                      </button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Step: Éxito */}
              {paymentStep === 'success' && (
                <div className="text-center py-4">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-lg leading-6 font-medium text-gray-900">¡Pago completado exitosamente!</h3>
                  <div className="mt-3">
                    <p className="text-sm text-gray-500">
                      🎉 Tu suscripción al plan <strong>{selectedPlan?.name}</strong> ha sido activada correctamente.
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      Ya puedes disfrutar de todas las funcionalidades premium. Serás redirigido automáticamente.
                    </p>
                  </div>
                </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterModal; 