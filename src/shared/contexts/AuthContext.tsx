import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, AuthError, Session } from "@supabase/supabase-js";
import {
  supabase,
  signIn,
  signUp,
  signOut,
  getCurrentUser,
  signInWithGoogle,
} from "@services/supabase";

// Interfaces para los tipos de retorno de autenticación
interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  };
  error: AuthError | null;
}

// Definición del tipo para el contexto
type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<any>;
};

// Creación del contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

// Componente proveedor
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Comprobar usuario actual al cargar
    const getUser = async () => {
      try {
        setLoading(true);
        const { data } = await getCurrentUser();
        setUser(data.user);
        
        // Registrar usuario en Google Analytics (de forma anónima)
        if (data.user) {
          import('@services/analytics').then(({ setUser: setAnalyticsUser }) => {
            try {
              // Usamos un hash del ID de usuario para mantener privacidad
              const hashedUserId = `user-${btoa(data.user.id).substring(0, 10)}`;
              setAnalyticsUser(hashedUserId);
            } catch (error) {
              console.error('Error al establecer usuario de analytics:', error);
            }
          }).catch(error => {
            console.error('Error al importar servicio de analytics:', error);
          });
        }
      } catch (error) {
        console.error("Error al cargar el usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    getUser();

    // Configurar el listener para cambios de autenticación
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        // Actualizar usuario en Google Analytics cuando cambia el estado de autenticación
        if (currentUser) {
          import('@services/analytics').then(({ setUser: setAnalyticsUser, logEvent }) => {
            try {
              const hashedUserId = `user-${btoa(currentUser.id).substring(0, 10)}`;
              setAnalyticsUser(hashedUserId);
              
              // Registrar evento de inicio de sesión
              if (event === 'SIGNED_IN') {
                logEvent('Auth', 'Login', 'User signed in');
              } else if (event === 'USER_UPDATED') {
                logEvent('Auth', 'Profile Updated', 'User profile updated');
              }
            } catch (error) {
              console.error('Error al rastrear evento de autenticación:', error);
            }
          }).catch(error => {
            console.error('Error al importar servicio de analytics:', error);
          });
        } else if (event === 'SIGNED_OUT') {
          // Registrar evento de cierre de sesión
          import('@services/analytics').then(({ logEvent }) => {
            try {
              logEvent('Auth', 'Logout', 'User signed out');
            } catch (error) {
              console.error('Error al rastrear evento de cierre de sesión:', error);
            }
          }).catch(error => {
            console.error('Error al importar servicio de analytics:', error);
          });
        }
      },
    );

    // Limpiar el listener al desmontar
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // Valor del contexto
  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
