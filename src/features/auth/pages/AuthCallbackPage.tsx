/**
 * src/features/auth/pages/AuthCallbackPage.tsx
 * Página de callback para manejar redirecciones de autenticación de Supabase
 */
import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { supabase } from "@services/supabase";
import { supabaseConfig, environment } from "@/config/environment";
import { LoadingSpinner, LoadingSize, LoadingVariant } from "@shared/components/loading";

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
  const [debug, setDebug] = useState<AuthDebugInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        // Procesando autenticación
        
        // Registrar información de debug extendida
        const debugInfo = collectDebugInfo();
        setDebug(debugInfo);
        console.log("Auth Callback Debug:", debugInfo);

        // Verificar si estamos en localhost en producción (error común)
        if (window.location.hostname === 'localhost' && !environment.development) {
          const errorMsg = t("auth.callback.localhostError");
          console.error(errorMsg);
          setError(errorMsg);
          setDebug({...debugInfo, errorDetails: errorMsg});
          setIsLoading(false);
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
          // Si hay una sesión activa, redirigir al dashboard directamente
          setTimeout(() => navigate("/dashboard"), 500);
        } else {
          // Si no hay sesión, verificar si hay un hash en la URL (para confirmación de correo)
          const hash = window.location.hash;
          const query = new URLSearchParams(window.location.search);
          const errorParam = query.get('error');
          const errorCode = query.get('error_code');
          const errorDescription = query.get('error_description');
          
          // Si hay un error en los parámetros de la URL, mostrarlo
          if (errorParam || errorCode) {
            setIsLoading(false);
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
                // Redirigir directamente al dashboard sin mensaje de éxito
                setTimeout(() => navigate("/dashboard"), 500);
              } else {
                // Si no hay sesión a pesar del hash/token, puede que el token haya expirado
                const expiredMsg = "No se pudo completar la autenticación. El enlace puede haber expirado o la URL de redirección es incorrecta.";
                setIsLoading(false);
                setError(expiredMsg);
                setDebug({...debugInfo, errorDetails: expiredMsg});
                setTimeout(() => navigate("/login"), 3000);
              }
            } catch (tokenError) {
              const tokenErrorMsg = `Error al procesar el token de autenticación: ${tokenError instanceof Error ? tokenError.message : 'Desconocido'}`;
              console.error("Error processing token:", tokenError);
              setIsLoading(false);
              setError(tokenErrorMsg);
              setDebug({...debugInfo, errorDetails: tokenErrorMsg});
              setTimeout(() => navigate("/login"), 3000);
            }
          } else {
            // No hay hash ni token, redirigir al login
            const noAuthInfoMsg = "No se encontró información de autenticación.";
            setIsLoading(false);
            setError(noAuthInfoMsg);
            setDebug({...debugInfo, errorDetails: noAuthInfoMsg});
            setTimeout(() => navigate("/login"), 2000);
          }
        }
      } catch (error) {
        const generalErrorMsg = `Error de autenticación: ${error instanceof Error ? error.message : 'Desconocido'}`;
        console.error("Error en la autenticación:", error);
        setIsLoading(false);
        setError(generalErrorMsg);
        setDebug(collectDebugInfo(generalErrorMsg));
        setTimeout(() => navigate("/login"), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, t]);

  // 🚀 PANTALLA DE LOADING UNIFICADA - Spinner simple consistente con toda la web
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner 
          size={LoadingSize.XL} 
          variant={LoadingVariant.PRIMARY}
          data-testid="auth-callback-loading"
        />
      </div>
    );
  }

  // ❌ PANTALLA DE ERROR
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center space-y-8 max-w-md mx-auto px-6">
          {/* Logo */}
          <div className="flex justify-center">
            <img 
              src="/imagenes/Logo_hosthelper_new.png" 
              alt="Host Helper AI" 
              className="h-24 w-auto"
            />
          </div>
          
          {/* Icono de error */}
          <div className="flex justify-center">
            <div className="rounded-full bg-red-100 p-4">
              <svg className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
                </div>
              </div>
          
          {/* Mensaje de error */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-gray-800">
              {t("auth.callback.errorTitle")}
            </h2>
            <p className="text-gray-600 text-sm">
              {error}
            </p>
            
            {/* Botón de acción */}
            <Link 
              to="/login"
              className="inline-block px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              {t("auth.callback.backToLogin")}
            </Link>
            </div>
          
          {/* Debug info solo en desarrollo y con errores */}
          {debug && import.meta.env.DEV && (
            <details className="mt-8 text-left">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                {t("auth.callback.debugInfo")}
              </summary>
              <pre className="mt-2 text-xs text-gray-600 font-mono bg-gray-100 p-4 rounded-lg overflow-auto max-h-32">
                {JSON.stringify(debug, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    );
  }

  // Fallback (no debería llegar aquí)
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-gray-600">{t('common.loading') || 'Cargando...'}</p>
      </div>
    </div>
  );
};

export default AuthCallbackPage; 