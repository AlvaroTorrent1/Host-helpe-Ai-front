import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User } from "@supabase/supabase-js";
import {
  supabase,
  signIn,
  signUp,
  signOut,
  getCurrentUser,
} from "../services/supabase";

// Definición del tipo para el contexto
type AuthContextType = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<unknown>;
  signUp: (email: string, password: string) => Promise<unknown>;
  signOut: () => Promise<unknown>;
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
        setUser(session?.user ?? null);
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
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
