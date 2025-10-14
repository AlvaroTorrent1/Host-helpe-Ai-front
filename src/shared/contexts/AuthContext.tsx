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

const createSafeAnalyticsUserId = (id: string) => {
  try {
    return `user-${btoa(id).substring(0, 10)}`;
  } catch (error) {
    console.error("Error al codificar ID de usuario para analytics:", error);
    return `user-${id.substring(0, 10)}`;
  }
};

const setAnalyticsUserSafe = async (id: string) => {
  try {
    const { setUser: setAnalyticsUser } = await import("@services/analytics");
    setAnalyticsUser(createSafeAnalyticsUserId(id));
  } catch (error) {
    console.error("Error al establecer usuario de analytics:", error);
  }
};

const logAnalyticsEventSafe = async (action: string, label: string) => {
  try {
    const { logEvent } = await import("@services/analytics");
    logEvent("Auth", action, label);
  } catch (error) {
    console.error("Error al rastrear evento de autenticación:", error);
  }
};

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
        
        // Verificar cache del localStorage primero
        const cachedUser = localStorage.getItem('supabase.auth.user');
        if (cachedUser) {
          try {
            const parsedUser = JSON.parse(cachedUser);
            setUser(parsedUser);
          } catch (e) {
            // Cache inválido, limpiar
            localStorage.removeItem('supabase.auth.user');
          }
        }
        
        const { data } = await getCurrentUser();
        setUser(data.user);
        
        // Cachear usuario para futuras sesiones
        if (data.user) {
          localStorage.setItem('supabase.auth.user', JSON.stringify(data.user));
        } else {
          localStorage.removeItem('supabase.auth.user');
        }
        
        // Registrar usuario en Google Analytics (de forma anónima)
        if (data.user) {
          setAnalyticsUserSafe(data.user.id);
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
          setAnalyticsUserSafe(currentUser.id);

          if (event === "SIGNED_IN") {
            logAnalyticsEventSafe("Login", "User signed in");
          } else if (event === "USER_UPDATED") {
            logAnalyticsEventSafe("Profile Updated", "User profile updated");
          }
        } else if (event === "SIGNED_OUT") {
          logAnalyticsEventSafe("Logout", "User signed out");
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
