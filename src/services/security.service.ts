/**
 * Servicio de seguridad centralizado
 * Proporciona funciones para autenticación, autorización y protección de datos
 */

import { createClient, Session } from "@supabase/supabase-js";
import { validatePasswordStrength } from '../utils/validation';
import { getStorage } from '../utils';

// Tipos
export interface User {
  id: string;
  email: string;
  name?: string;
  role?: string;
  created_at?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  user: User | null;
  session: Session | null;
  error: Error | null;
}

// Creación del cliente de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Configuración de almacenamiento local
const storage = getStorage('local');
const AUTH_KEY = 'auth';
const USER_KEY = 'user';

// Interfaz para los datos de autenticación almacenados localmente
interface StoredAuthData {
  token: string;
  refreshToken: string;
  expiresAt: string;
}

/**
 * Clase de servicio de seguridad
 */
export class SecurityService {
  constructor() {
    // Configuración inicial
    this.setupAuthListener();
  }

  /**
   * Configura listeners para cambios en la autenticación
   */
  private setupAuthListener(): void {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Guardamos la sesión en almacenamiento local
        this.persistSession(session);
      } else if (event === 'SIGNED_OUT') {
        // Limpiamos el almacenamiento local
        this.clearPersistedData();
      }
    });
  }

  /**
   * Persiste la sesión en almacenamiento local
   */
  private persistSession(session: Session): void {
    storage.setItem<StoredAuthData>(AUTH_KEY, {
      token: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: new Date(Date.now() + (session.expires_in || 3600) * 1000).toISOString(),
    });
  }

  /**
   * Persiste datos de usuario en almacenamiento local
   */
  private persistUserData(user: User): void {
    storage.setItem(USER_KEY, user);
  }

  /**
   * Limpia los datos persistidos
   */
  private clearPersistedData(): void {
    storage.removeItem(AUTH_KEY);
    storage.removeItem(USER_KEY);
  }

  /**
   * Registra un nuevo usuario
   */
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            name: credentials.name || "",
          },
        },
      });

      if (error) throw error;

      // Si el registro es exitoso, también actualizamos la base de datos de usuarios
      if (data.user) {
        await this.updateUserProfile(data.user.id, {
          name: credentials.name || "",
        });
      }

      const user = data.user
        ? {
            id: data.user.id,
            email: data.user.email || "",
            name: credentials.name,
            role: "user",
            created_at: new Date().toISOString(),
          }
        : null;

      if (user && data.session) {
        this.persistSession(data.session);
        this.persistUserData(user);
      }

      return {
        user,
        session: data.session,
        error: null,
      };
    } catch (error) {
      console.error("Error en registro:", error);
      return {
        user: null,
        session: null,
        error: error as Error,
      };
    }
  }

  /**
   * Inicia sesión con un usuario existente
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      // Obtener información adicional del usuario desde la base de datos
      const { data: userData } = await supabase
        .from("users")
        .select("name, role")
        .eq("id", data.user?.id)
        .single();

      const user = data.user
        ? {
            id: data.user.id,
            email: data.user.email || "",
            name: userData?.name || "",
            role: userData?.role || "user",
            created_at: data.user.created_at,
          }
        : null;

      if (user && data.session) {
        this.persistSession(data.session);
        this.persistUserData(user);
      }

      return {
        user,
        session: data.session,
        error: null,
      };
    } catch (error) {
      console.error("Error en login:", error);
      return {
        user: null,
        session: null,
        error: error as Error,
      };
    }
  }

  /**
   * Cierra la sesión del usuario actual
   */
  async logout(): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      this.clearPersistedData();
      return { error: null };
    } catch (error) {
      console.error("Error en logout:", error);
      return { error: error as Error };
    }
  }

  /**
   * Obtiene el usuario actual
   */
  async getCurrentUser(): Promise<User | null> {
    // Primero intentamos obtener desde el almacenamiento local para respuesta inmediata
    const cachedUser = storage.getItem<User>(USER_KEY);
    if (cachedUser) return cachedUser;

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      // Obtener información adicional del usuario desde la base de datos
      const { data: userData } = await supabase
        .from("users")
        .select("name, role")
        .eq("id", user.id)
        .single();

      const currentUser = {
        id: user.id,
        email: user.email || "",
        name: userData?.name || "",
        role: userData?.role || "user",
        created_at: user.created_at,
      };
      
      // Actualizar caché
      this.persistUserData(currentUser);
      
      return currentUser;
    } catch (error) {
      console.error("Error al obtener usuario actual:", error);
      return null;
    }
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateUserProfile(
    userId: string,
    data: Partial<User>,
  ): Promise<{ error: Error | null }> {
    try {
      // Aseguramos que no se intente actualizar el id directamente en el objeto de datos
      const { id, ...updateData } = data;
      const { error } = await supabase
        .from("users")
        .upsert({ id: userId, ...updateData, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (error) throw error;

      // Actualizar caché si el usuario actualizó su propio perfil
      const currentUser = await this.getCurrentUser();
      if (currentUser && currentUser.id === userId) {
        this.persistUserData({
          ...currentUser,
          ...updateData,
        });
      }

      return { error: null };
    } catch (error) {
      console.error("Error al actualizar perfil:", error);
      return { error: error as Error };
    }
  }

  /**
   * Recuperación de contraseña
   */
  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error("Error en recuperación de contraseña:", error);
      return { error: error as Error };
    }
  }

  /**
   * Actualización de contraseña
   */
  async updatePassword(
    newPassword: string
  ): Promise<{ error: Error | null }> {
    try {
      // Verificar fuerza de contraseña primero
      const validation = this.validatePasswordStrength(newPassword);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return { error: null };
    } catch (error) {
      console.error("Error actualizando contraseña:", error);
      return { error: error as Error };
    }
  }

  /**
   * Verifica si hay una sesión activa
   */
  async isAuthenticated(): Promise<boolean> {
    const cachedSession = storage.getItem<StoredAuthData>(AUTH_KEY);
    if (cachedSession && new Date(cachedSession.expiresAt) > new Date()) {
      return true;
    }

    try {
      const { data } = await supabase.auth.getSession();
      return !!data.session;
    } catch (error) {
      console.error("Error al comprobar autenticación:", error);
      return false;
    }
  }

  /**
   * Comprueba si el usuario tiene un rol específico
   */
  async hasRole(role: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user?.role === role;
    } catch (error) {
      console.error("Error al comprobar rol:", error);
      return false;
    }
  }

  /**
   * Funciones de seguridad para evitar ataques comunes
   */

  /**
   * Sanitiza input para prevenir XSS
   */
  sanitizeInput(input: string): string {
    return input
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  /**
   * Genera un token seguro para operaciones sensibles
   */
  generateSecureToken(): string {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join(
      "",
    );
  }

  /**
   * Valida una contraseña según reglas de seguridad
   * Reglas: al menos 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 carácter especial
   */
  validatePasswordStrength(password: string): {
    valid: boolean;
    message: string;
  } {
    const validation = validatePasswordStrength(password);
    
    if (!validation.isValid) {
      return {
        valid: false,
        message: validation.issues.join('. '),
      };
    }

    return {
      valid: true,
      message: "Contraseña segura",
    };
  }
}

// Exportamos una instancia única del servicio
export const securityService = new SecurityService();
