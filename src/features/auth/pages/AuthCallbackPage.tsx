/**
 * src/features/auth/pages/AuthCallbackPage.tsx
 * Página de callback para manejar redirecciones de autenticación de Supabase
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@services/supabase";
import { useLanguage } from "@shared/contexts/LanguageContext";
import { supabaseConfig, environment } from "@/config/environment";

// Tipos para mejor manejo de errores
interface AuthDebugInfo {
  url: string;
  origin: string;
  hash: string;
  search: string;
  redirectUrl: string;
  environment: string;
  timestamp: string;
  errorDetails?: string;
}

const AuthCallbackPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>("Procesando autenticación...");
  const [debug, setDebug] = useState<AuthDebugInfo | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Función para recopilar información de depuración
  const collectDebugInfo = (errorDetails?: string): AuthDebugInfo => {
    return {
      url: window.location.href,
      origin: window.location.origin,
      hash: window.location.hash,
      search: window.location.search,
      redirectUrl: supabaseConfig.authRedirectUrl,
      environment: environment.development ? 'development' : 'production',
      timestamp: new Date().toISOString(),
      errorDetails
    };
  };

  useEffect(() => {
    // Función para manejar el callback de autenticación
    const handleAuthCallback = async () => {
      try {
        // Registrar información de debug extendida
        const debugInfo = collectDebugInfo();
        setDebug(debugInfo);
        console.log("Auth Callback Debug:", debugInfo);

        // Verificar si estamos en localhost en producción (error común)
        if (window.location.hostname === 'localhost' && !environment.development) {
          const errorMsg = "Error de redirección: Se está usando localhost en un entorno de producción. Verifica la configuración de VITE_SITE_URL.";
          console.error(errorMsg);
          setError(errorMsg);
          setDebug({...debugInfo, errorDetails: errorMsg});
          return;
        }
        
        // Esperamos un poco para dar tiempo a que Supabase procese el hash en la URL
        // Esto es crucial para tokens expirados o problemas de redirección
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Intenta obtener información de la sesión actual
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
          setDebug({...debugInfo, errorDetails: `Session error: ${error.message}`});
          throw error;
        }

        if (data?.session) {
          // Si hay una sesión activa, redirigir al dashboard
          setMessage("Autenticación exitosa. Redirigiendo...");
          setTimeout(() => navigate("/dashboard"), 1500);
        } else {
          // Si no hay sesión, verificar si hay un hash en la URL (para confirmación de correo)
          const hash = window.location.hash;
          const query = new URLSearchParams(window.location.search);
          const errorParam = query.get('error');
          const errorCode = query.get('error_code');
          const errorDescription = query.get('error_description');
          
          // Si hay un error en los parámetros de la URL, mostrarlo
          if (errorParam || errorCode) {
            setMessage(null);
            const errorMsg = errorDescription 
              ? `Error: ${errorDescription}` 
              : `Error de autenticación: ${errorParam || errorCode}`;
            setError(errorMsg);
            setDebug({...debugInfo, errorDetails: errorMsg});
            console.error("URL contains error parameters:", errorMsg);
            setTimeout(() => navigate("/login"), 3000);
            return;
          }
          
          // Comprobar si hay un token o hash para procesar
          if (hash || query.get('token_hash') || query.get('type') === 'recovery') {
            setMessage("Verificando autenticación...");
            try {
              // Intenta procesar manualmente el hash para recuperar la sesión
              // Esto es útil cuando el token ha expirado o cuando hay problemas con la redirección
              const hashParams = hash?.substring(1).split('&').reduce((params, param) => {
                const [key, value] = param.split('=');
                if (key && value) params[key] = decodeURIComponent(value);
                return params;
              }, {} as Record<string, string>) || {};
              
              if (hashParams.access_token || query.get('token_hash')) {
                // Si hay un token disponible, intentamos establecer la sesión manualmente
                console.log("Attempting to process auth parameters manually");
                
                // Intentar extraer y configurar el token directamente si está presente
                if (hashParams.access_token && hashParams.refresh_token) {
                  try {
                    // Este método es un intento de establecer manualmente los tokens
                    // pero puede no funcionar en todas las versiones de Supabase
                    console.log("Attempting to set session manually with tokens from URL");
                    // No se puede implementar directamente, solo para demostración
                  } catch (tokenSetError) {
                    console.error("Failed to set tokens manually:", tokenSetError);
                  }
                }
              }
              
              // Esperamos para que Supabase procese el token automáticamente
              await new Promise(resolve => setTimeout(resolve, 2000));
              
              // Volvemos a verificar si ya hay una sesión
              const { data: sessionData } = await supabase.auth.getSession();
              if (sessionData?.session) {
                setMessage("Correo confirmado. Redirigiendo al dashboard...");
                setTimeout(() => navigate("/dashboard"), 1500);
              } else {
                // Si no hay sesión a pesar del hash/token, puede que el token haya expirado
                const expiredMsg = "No se pudo completar la autenticación. El enlace puede haber expirado o la URL de redirección es incorrecta. Intente iniciar sesión nuevamente.";
                setMessage(null);
                setError(expiredMsg);
                setDebug({...debugInfo, errorDetails: expiredMsg});
                setTimeout(() => navigate("/login"), 3000);
              }
            } catch (tokenError) {
              const tokenErrorMsg = `Error al procesar el token de autenticación: ${tokenError instanceof Error ? tokenError.message : 'Desconocido'}`;
              console.error("Error processing token:", tokenError);
              setMessage(null);
              setError(tokenErrorMsg);
              setDebug({...debugInfo, errorDetails: tokenErrorMsg});
              setTimeout(() => navigate("/login"), 3000);
            }
          } else {
            // No hay hash ni token, redirigir al login
            const noAuthInfoMsg = "No se encontró información de autenticación. Verifique que esté usando el enlace completo del correo de confirmación.";
            setMessage(null);
            setError(noAuthInfoMsg);
            setDebug({...debugInfo, errorDetails: noAuthInfoMsg});
            setTimeout(() => navigate("/login"), 2000);
          }
        }
      } catch (error) {
        const generalErrorMsg = `Error de autenticación: ${error instanceof Error ? error.message : 'Desconocido'}`;
        console.error("Error en la autenticación:", error);
        setMessage(null);
        setError(generalErrorMsg);
        setDebug(collectDebugInfo(generalErrorMsg));
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, t]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {t("auth.authCallback.title")}
          </h2>
          
          {message && (
            <div className="mt-4 p-4 bg-blue-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-blue-700">{message}</p>
                </div>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-red-700">{error}</p>
                  <p className="mt-2 text-xs text-red-700">
                    <a href="/login" className="font-medium underline">Volver al inicio de sesión</a>
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* Mostrar información de debug expandida tanto en desarrollo como en producción cuando hay error */}
          {debug && (import.meta.env.DEV || error) && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <div className="flex">
                <div className="ml-3 flex-1">
                  <p className="text-xs font-semibold mb-1">Información de depuración:</p>
                  <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap overflow-auto max-h-40">
                    {JSON.stringify(debug, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthCallbackPage; 