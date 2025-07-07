import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@shared/contexts/AuthContext";
import { supabase, checkEmailConfirmation } from "@services/supabase";
import { useLanguage } from "@shared/contexts/LanguageContext";
import SmartAuthRouter from "@shared/components/SmartAuthRouter";

export const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSmartRouter, setShowSmartRouter] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'google' | 'register'>('email');

  const { signIn, signInWithGoogle, user } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

  // Si el usuario ya está autenticado, mostrar SmartRouter
  if (user && !showSmartRouter) {
    return (
      <SmartAuthRouter 
        authMethod="email"
        showWelcomeMessage={false}
        onRedirectComplete={() => {
          // Router se encarga de la navegación
        }}
      />
    );
  }

  // Si necesitamos mostrar el SmartRouter después de autenticación
  if (showSmartRouter) {
    return (
      <SmartAuthRouter 
        authMethod={authMethod}
        showWelcomeMessage={true}
        onRedirectComplete={() => {
          setShowSmartRouter(false);
        }}
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Primero comprobar directamente si el email ya está confirmado
      const isEmailConfirmed = await checkEmailConfirmation(email);

      if (isEmailConfirmed) {
        // Si el email está confirmado, intentamos iniciar sesión normalmente
        const { error } = await signIn(email, password);

        if (error) {
          if (error.message.includes("Invalid login credentials")) {
            setError(t("auth.invalidCredentials"));
          } else {
            setError(error.message);
          }
        } else {
          // Autenticación exitosa - usar SmartRouter
          setAuthMethod('email');
          setShowSmartRouter(true);
        }
      } else {
        // Email no confirmado, mostramos un mensaje claro
        const { error } = await signIn(email, password);

        if (error && error.message.includes("Email not confirmed")) {
          setError(t("auth.emailNotConfirmed").replace("{email}", email));
        } else if (error) {
          setError(error.message);
        } else {
          // Autenticación exitosa - usar SmartRouter
          setAuthMethod('email');
          setShowSmartRouter(true);
        }
      }
    } catch (err: Error | unknown) {
      console.error("Error durante el inicio de sesión:", err);

      // Manejo específico para el error de conexión
      if (
        err instanceof Error &&
        err.message &&
        err.message.includes("fetch")
      ) {
        setError(t("auth.connectionError"));
      } else if (err instanceof Error && err.message) {
        setError(`${t("auth.loginError")}: ${err.message}`);
      } else {
        setError(t("auth.unknownError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para manejar el inicio de sesión con Google
  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      // Iniciar el flujo de autenticación con Google
      const { error } = await signInWithGoogle();
      
      if (error) {
        setError(error.message);
      } else {
        // Google OAuth exitoso - usar SmartRouter  
        setAuthMethod('google');
        setShowSmartRouter(true);
      }
      // No necesitamos manejar el caso de éxito aquí, ya que se redirigirá al usuario
    } catch (err: any) {
      console.error("Error durante la autenticación con Google:", err);
      setError("Error al iniciar sesión con Google. Inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Función para forzar la sincronización y limpiar datos de sesión local
  const handleForceSync = async () => {
    setIsLoading(true);
    try {
      // Forzar cierre de sesión actual
      await supabase.auth.signOut();

      // Limpiar localStorage
      localStorage.clear();

      // Recargar la página para forzar reconexión con Supabase
      window.location.reload();
    } catch (err) {
      console.error("Error al sincronizar:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Link to="/">
              <img
                src="/imagenes/Logo_hosthelper_new.png"
                alt="Host Helper AI Logo"
                className="h-48 cursor-pointer hover:opacity-90 transition-opacity"
              />
            </Link>
          </div>
          <p className="text-gray-600 mt-2">{t("auth.loginTitle")}</p>
        </div>

        <div className="bg-white p-8 border border-gray-300 rounded-lg shadow-sm">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Botón de Google */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition duration-150 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                <path fill="none" d="M0 0h48v48H0z"></path>
              </svg>
              Continuar con Google
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">O iniciar sesión con correo electrónico</span>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-gray-700 font-medium mb-2"
              >
                {t("auth.emailLabel")}
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
              />
            </div>

            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label
                  htmlFor="password"
                  className="block text-gray-700 font-medium"
                >
                  {t("auth.passwordLabel")}
                </label>
                <a
                  href="/forgot-password"
                  className="text-sm text-primary-600 hover:text-primary-800"
                >
                  {t("auth.forgotPassword")}
                </a>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                style={{ color: "#333" }}
              />
            </div>

            <div className="mb-6">
              <button
                type="button"
                onClick={handleForceSync}
                className="text-sm text-gray-600 hover:text-primary-600 underline"
              >
                {t("auth.forceSync")}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition duration-150 disabled:bg-primary-300 disabled:cursor-not-allowed"
            >
              {isLoading ? t("auth.loggingIn") : t("auth.login")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t("auth.noAccount")}{" "}
              <a
                href="/register"
                className="text-primary-600 hover:text-primary-800"
              >
                {t("auth.registerNow")}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
