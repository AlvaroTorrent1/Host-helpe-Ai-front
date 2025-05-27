import { createClient } from "@supabase/supabase-js";
import { supabaseConfig, environment } from "@/config/environment";

// Estas variables de entorno deberán ser agregadas al archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const siteUrl = supabaseConfig.siteUrl;
const authRedirectUrl = supabaseConfig.authRedirectUrl;
const currentEnvironment = environment.current;

// Validación de la configuración necesaria
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Faltan las variables de entorno de Supabase. Por favor, crea un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.",
  );
}

// Verificación más estricta de la URL del sitio en producción
if (!siteUrl && !environment.development) {
  console.error(
    "CRÍTICO: Falta la variable de entorno VITE_SITE_URL en producción. Esto causará problemas con los enlaces de autenticación."
  );
}

const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'server-side';
const isDevelopment = import.meta.env.DEV;

// Log detailed information about the Supabase configuration
console.log(`Inicializando cliente Supabase en entorno ${currentEnvironment}:`, {
  environment: currentEnvironment,
  supabaseUrl,
  siteUrl,
  authRedirectUrl,
  currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'server-side',
  viteMode: import.meta.env.MODE,
});

// Initialize the Supabase client with improved options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  }
});

// Funciones de autenticación
export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

// Función para iniciar sesión con Google
export const signInWithGoogle = async () => {
  // Construir la URL de redirección correcta basada en la ubicación actual
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000';
  const redirectTo = `${currentOrigin}/auth/callback`;
  
  console.log('Iniciando autenticación con Google:', {
    redirectTo, 
    configuredRedirectTo: authRedirectUrl,
    origin: currentOrigin,
    environment: currentEnvironment
  });
  
  return await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
};

export const signUp = async (email: string, password: string) => {
  // Usar SIEMPRE la URL de redirección configurada en environment.ts
  // Esto asegura consistencia entre desarrollo y producción
  const redirectUrl = authRedirectUrl;
  
  console.log(`Registro con redirectTo: ${redirectUrl} (entorno: ${currentEnvironment})`);
  
  if (!redirectUrl) {
    console.error("ERROR: URL de redirección no definida. La autenticación por correo electrónico fallará.");
  } else if (redirectUrl.includes('localhost') && environment.production) {
    console.error("ADVERTENCIA: La URL de redirección contiene 'localhost' en producción. Los correos de confirmación no funcionarán correctamente.");
  }
  
  // Use redirectTo to ensure email confirmation links use the correct domain
  return await supabase.auth.signUp({ 
    email, 
    password,
    options: {
      emailRedirectTo: redirectUrl,
      // Datos de debug para ayudar a identificar problemas
      data: {
        signup_origin: typeof window !== 'undefined' ? window.location.origin : 'unknown',
        environment: currentEnvironment,
        timestamp: new Date().toISOString(),
      }
    }
  });
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async () => {
  return await supabase.auth.getUser();
};

// Función para verificar si el email está confirmado
export const checkEmailConfirmation = async (email: string) => {
  try {
    // Primera opción: comprobamos si ya hay sesión
    const { data: sessionData } = await supabase.auth.getSession();

    if (
      sessionData?.session?.user?.email === email &&
      sessionData?.session?.user?.email_confirmed_at
    ) {
      return true;
    }

    // Si no hay sesión, intentamos ver si podemos encontrar
    // el estado de confirmación de otra manera
    // Nota: Esto solo funciona para usuarios que tienen permisos adecuados
    const { data, error } = await supabase
      .from("auth.users")
      .select("email_confirmed_at")
      .eq("email", email)
      .single();

    if (error) {
      console.log("No se pudo verificar email directamente:", error);
      return false;
    }

    return !!data?.email_confirmed_at;
  } catch (error) {
    console.error("Error al verificar confirmación de email:", error);
    return false;
  }
};

// Esta función se utilizará para servicios adicionales en el futuro
export default supabase;
