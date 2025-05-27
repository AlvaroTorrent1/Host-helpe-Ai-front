import React, { useState, useEffect } from 'react';
import { useAuth } from '@shared/contexts/AuthContext';
import { useLanguage } from '@shared/contexts/LanguageContext';
import { XMarkIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import supabase from '@/services/supabase';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import StripePaymentElement from './StripePaymentElement';
import { createPaymentIntent } from '@/services/stripeApi';

// Configuración de Stripe para PRODUCCIÓN
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_live_51QNuzlKpVJd2j1yPFx0LzTWN0c6J7kmw6NsdjJ6z4g5Ki1xnEBWs4uxzSwHcoswuwfNbhWXJTKHWJW2bxcWjOuNd009GmX21J4';
console.log('RegisterModal: Usando clave pública de Stripe:', STRIPE_PUBLIC_KEY?.substring(0, 15) + '...');

// Verificar que la clave pública tenga un formato válido
if (!STRIPE_PUBLIC_KEY || !STRIPE_PUBLIC_KEY.startsWith('pk_')) {
  console.error('¡ADVERTENCIA! La clave pública de Stripe no es válida:', STRIPE_PUBLIC_KEY);
} else {
  console.log('RegisterModal: Clave pública de Stripe válida detectada');
}

// Cargar Stripe fuera del componente para evitar recreaciones
let stripePromise: Promise<any> | null = null;

// Función para inicializar Stripe de forma segura
const getStripePromise = () => {
  if (!stripePromise && STRIPE_PUBLIC_KEY && STRIPE_PUBLIC_KEY.startsWith('pk_')) {
    console.log('RegisterModal: Inicializando Stripe.js con clave:', STRIPE_PUBLIC_KEY?.substring(0, 15) + '...');
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY).then(stripe => {
      if (stripe) {
        console.log('RegisterModal: Stripe.js cargado exitosamente');
      } else {
        console.error('RegisterModal: Error - Stripe.js devolvió null');
      }
      return stripe;
    }).catch(error => {
      console.error('RegisterModal: Error cargando Stripe.js:', error);
      // En caso de error, devolver null para que el componente maneje el error
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
  
  const { signUp, user, signInWithGoogle } = useAuth();
  const { t } = useLanguage();
  
  // Si el usuario ya está autenticado, pasamos directamente al proceso de pago
  const handleAlreadyAuthenticated = async () => {
    if (user && selectedPlan) {
      try {
        setIsLoading(true);
        setError("");
        
        console.log("Iniciando proceso de pago para usuario autenticado:", {
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
      }
    }
  };
  
  // Cuando se abre el modal, verificar si el usuario ya está autenticado
  useEffect(() => {
    if (isOpen && user && selectedPlan) {
      // Si el usuario ya está autenticado cuando se abre el modal, iniciar proceso de pago
      handleAlreadyAuthenticated();
    }
  }, [isOpen, user, selectedPlan]);

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
      
      // Iniciar el flujo de autenticación con Google
      const { error } = await signInWithGoogle();
      
      if (error) {
        setError(error.message);
      }
      // No necesitamos manejar el caso de éxito aquí, ya que se redirigirá al usuario
    } catch (err: any) {
      console.error("Error durante la autenticación con Google:", err);
      setError("Error al iniciar sesión con Google. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Si el modal no está abierto, no renderizar nada
  if (!isOpen) return null;
  
  // Manejador para el éxito del pago
  const handlePaymentSuccess = () => {
    setPaymentStep('success');
    toast.success("¡Pago completado con éxito!");
    
    // Esperar un poco y cerrar el modal
    setTimeout(() => {
      // Llamar al callback de éxito con email y password vacíos ya que el usuario ya está autenticado
      onSuccess("", "");
    }, 2000);
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
      handleAlreadyAuthenticated();
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
          try {
            // Crear un registro pendiente de suscripción (estado "pending")
            await supabase.from('customer_subscriptions').insert({
              user_id: data.user.id,
              plan_id: selectedPlan.id,
              status: 'pending', // Esta será actualizada cuando complete el pago
              current_period_end: null,
            });
            
            // Limpiar completamente el estado anterior
            setClientSecret(null);
            setPaymentStep('register');
            
            // Esperar un tick para que React procese la limpieza del estado
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Crear un payment intent
            const { clientSecret } = await createPaymentIntent({
              amount: selectedPlan.price * 100, // Convertir a centavos
              currency: 'eur',
              user_id: data.user.id,
              plan_id: selectedPlan.id,
              email
            });
            
            // Actualizar estado para mostrar el formulario de pago
            setUserId(data.user.id);
            setPaymentStep('payment');
            
            // Pequeña demora para asegurar que el componente esté listo
            await new Promise(resolve => setTimeout(resolve, 100));
            
            setClientSecret(clientSecret);
          } catch (err) {
            console.error("Error preparando pago:", err);
            
            // Mostrar un mensaje de error más específico
            if (err instanceof Error) {
              if (err.message.includes('client_secret')) {
                setError("Error al crear el pago: No se pudo generar la información de pago");
              } else if (err.message.includes('conexión')) {
                setError("Error de conexión: No se pudo conectar con el servidor de pagos");
              } else if (err.message.includes('CORS')) {
                setError("Error de conexión: El servidor rechazó la solicitud (CORS)");
              } else {
                setError(`Error API: ${err.message}`);
              }
            } else {
              setError("Error al preparar el pago. Por favor, inténtalo de nuevo.");
            }
          }
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
              onClick={onClose}
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
              {paymentStep === 'register' && (
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
                  
                  {/* Verificar que tenemos tanto Stripe como clientSecret antes de renderizar Elements */}
                  {stripe && clientSecret ? (
                    <Elements 
                      stripe={stripe} 
                      options={{ 
                        clientSecret, 
                        appearance: {
                          theme: 'stripe',
                          variables: {
                            colorPrimary: '#4f46e5',
                          }
                        },
                        // Configuraciones adicionales para evitar problemas
                        fonts: [
                          {
                            cssSrc: 'https://fonts.googleapis.com/css?family=Roboto'
                          }
                        ],
                        loader: 'auto'
                      }}
                      // Clave única basada en clientSecret y timestamp para forzar recreación
                      key={`elements-${clientSecret.substring(0, 10)}-${Date.now()}`}
                    >
                      <StripePaymentElement 
                        clientSecret={clientSecret}
                        onSuccess={handlePaymentSuccess}
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
                      <p className="text-sm text-gray-500">Cargando Stripe.js...</p>
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
                  <h3 className="text-lg leading-6 font-medium text-gray-900">¡Pago completado!</h3>
                  <div className="mt-3">
                    <p className="text-sm text-gray-500">
                      Tu suscripción ha sido activada y ya puedes disfrutar de todas las funcionalidades.
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