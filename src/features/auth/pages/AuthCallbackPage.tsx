/**
 * src/features/auth/pages/AuthCallbackPage.tsx
 * Página de callback para manejar redirecciones de autenticación de Supabase
 */
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@services/supabase";
import { useLanguage } from "@shared/contexts/LanguageContext";
import { supabaseConfig } from "@/config/environment";

const AuthCallbackPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>("Procesando autenticación...");
  const [debug, setDebug] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useLanguage();

  useEffect(() => {
    // Función para manejar el callback de autenticación
    const handleAuthCallback = async () => {
      try {
        // Registrar información de debug extendida
        const currentUrl = window.location.href;
        const detailedDebug = `
          URL: ${currentUrl}
          Origin: ${window.location.origin}
          Hash: ${window.location.hash}
          Search params: ${window.location.search}
          Auth Redirect URL: ${supabaseConfig.authRedirectUrl}
          Environment mode: ${import.meta.env.MODE}
        `;
        setDebug(detailedDebug);
        console.log("Auth Callback Debug:", detailedDebug);
        
        // Esperamos un poco para dar tiempo a que Supabase procese el hash en la URL
        // Esto es crucial para tokens expirados o problemas de redirección
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Intenta obtener información de la sesión actual
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error getting session:", error);
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
                setMessage(null);
                setError("No se pudo completar la autenticación. El enlace puede haber expirado. Intente iniciar sesión nuevamente.");
                setTimeout(() => navigate("/login"), 3000);
              }
            } catch (tokenError) {
              console.error("Error processing token:", tokenError);
              setMessage(null);
              setError(`Error al procesar el token de autenticación: ${tokenError instanceof Error ? tokenError.message : 'Desconocido'}`);
              setTimeout(() => navigate("/login"), 3000);
            }
          } else {
            // No hay hash ni token, redirigir al login
            setMessage(null);
            setError("No se encontró información de autenticación");
            setTimeout(() => navigate("/login"), 2000);
          }
        }
      } catch (error) {
        console.error("Error en la autenticación:", error);
        setMessage(null);
        setError(`Error de autenticación: ${error instanceof Error ? error.message : 'Desconocido'}`);
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
                </div>
              </div>
            </div>
          )}
          
          {debug && import.meta.env.DEV && (
            <div className="mt-4 p-4 bg-gray-100 rounded-md">
              <div className="flex">
                <div className="ml-3 flex-1">
                  <p className="text-xs text-gray-700 font-mono whitespace-pre-wrap">{debug}</p>
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