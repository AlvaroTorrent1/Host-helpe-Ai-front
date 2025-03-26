import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import { supabase, checkEmailConfirmation } from '@services/supabase';
import { useLanguage } from '@shared/contexts/LanguageContext';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();

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
            setError(t('auth.invalidCredentials'));
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
          setError(t('auth.emailNotConfirmed').replace('{email}', email));
        } else if (error) {
          setError(error.message);
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: Error | unknown) {
      console.error('Error durante el inicio de sesión:', err);
      
      // Manejo específico para el error de conexión
      if (err instanceof Error && err.message && err.message.includes('fetch')) {
        setError(t('auth.connectionError'));
      } else if (err instanceof Error && err.message) {
        setError(`${t('auth.loginError')}: ${err.message}`);
      } else {
        setError(t('auth.unknownError'));
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
          <p className="text-gray-600 mt-2">{t('auth.loginTitle')}</p>
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
                {t('auth.emailLabel')}
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
                  {t('auth.passwordLabel')}
                </label>
                <a href="/forgot-password" className="text-sm text-primary-600 hover:text-primary-800">
                  {t('auth.forgotPassword')}
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
                {t('auth.forceSync')}
              </button>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary-500 text-white py-2 px-4 rounded-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition duration-150 disabled:bg-primary-300 disabled:cursor-not-allowed"
            >
              {isLoading ? t('auth.loggingIn') : t('auth.login')}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {t('auth.noAccount')}{' '}
              <a href="/register" className="text-primary-600 hover:text-primary-800">
                {t('auth.registerNow')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 