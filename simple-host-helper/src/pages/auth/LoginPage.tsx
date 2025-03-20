import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, checkEmailConfirmation } from '../../services/supabase';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      // Primero comprobar directamente si el email ya está confirmado
      const isEmailConfirmed = await checkEmailConfirmation(email);
      
      if (isEmailConfirmed) {
        // Si el email está confirmado, intentamos iniciar sesión normalmente
        const { error } = await signIn(email, password);
        
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Credenciales incorrectas. Verifica tu email y contraseña.');
          } else {
            setError(error.message);
          }
        } else {
          navigate('/dashboard');
        }
      } else {
        // Email no confirmado, mostramos un mensaje claro
        const { error } = await signIn(email, password);
        
        if (error && error.message.includes('Email not confirmed')) {
          setError(`Necesitas confirmar tu correo electrónico antes de iniciar sesión. 
          Por favor, revisa tu bandeja de entrada (${email}) y haz clic en el enlace de confirmación.
          Si no encuentras el correo, revisa tu carpeta de spam.`);
        } else if (error) {
          setError(error.message);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      console.error('Error durante el inicio de sesión:', err);
      
      // Manejo específico para el error de conexión
      if (err.message && err.message.includes('fetch')) {
        setError('Error de conexión: No se pudo conectar con el servidor. Verifica tus credenciales de Supabase en el archivo .env');
      } else if (err.message) {
        setError(`Error durante el inicio de sesión: ${err.message}`);
      } else {
        setError('Ha ocurrido un error desconocido al iniciar sesión');
      }
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
      console.error('Error al sincronizar:', err);
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
          <p className="text-gray-600 mt-2">Inicia sesión en tu cuenta</p>
        </div>
        
        <div className="bg-white p-8 border border-gray-300 rounded-lg shadow-sm">
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">
                Correo electrónico
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
                <label htmlFor="password" className="block text-gray-700 font-medium">
                  Contraseña
                </label>
                <a href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-800">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                required
                style={{ color: '#333' }}
              />
            </div>

            <div className="mb-6">
              <button 
                type="button"
                onClick={handleForceSync}
                className="text-sm text-gray-600 hover:text-primary-600 underline"
              >
                Forzar sincronización con Supabase
              </button>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition duration-150 disabled:bg-primary-300 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              ¿No tienes una cuenta?{' '}
              <a href="/register" className="text-primary-600 hover:text-primary-800">
                Regístrate ahora
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 