import { createClient } from '@supabase/supabase-js';

// Estas variables de entorno deberán ser agregadas al archivo .env
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Faltan las variables de entorno de Supabase. Por favor, crea un archivo .env con VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Funciones de autenticación
export const signIn = async (email: string, password: string) => {
  return await supabase.auth.signInWithPassword({ email, password });
};

export const signUp = async (email: string, password: string) => {
  return await supabase.auth.signUp({ email, password });
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
    
    if (sessionData?.session?.user?.email === email && 
        sessionData?.session?.user?.email_confirmed_at) {
      return true;
    }
    
    // Si no hay sesión, intentamos ver si podemos encontrar 
    // el estado de confirmación de otra manera
    // Nota: Esto solo funciona para usuarios que tienen permisos adecuados
    const { data, error } = await supabase
      .from('auth.users')
      .select('email_confirmed_at')
      .eq('email', email)
      .single();
    
    if (error) {
      console.log('No se pudo verificar email directamente:', error);
      return false;
    }
    
    return !!data?.email_confirmed_at;
  } catch (error) {
    console.error('Error al verificar confirmación de email:', error);
    return false;
  }
};

// Esta función se utilizará para servicios adicionales en el futuro
export default supabase; 