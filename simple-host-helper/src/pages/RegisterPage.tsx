import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../services/supabase';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Extraer el plan de los query params si existe
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const plan = params.get('plan');
    if (plan) {
      setSelectedPlan(plan);
    }
  }, [location]);

  const validateForm = () => {
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    
    return true;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      // Registrar usuario en Supabase
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            plan: selectedPlan || 'basic'
          }
        }
      });
      
      if (error) throw error;
      
      // Redirigir a la página de éxito
      navigate('/register-success');
    } catch (error: any) {
      setError(error.message || 'Error al registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-indigo-900">
            Crea tu cuenta en Host Helper AI
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {selectedPlan ? 
              `Has seleccionado el plan ${selectedPlan.charAt(0).toUpperCase() + selectedPlan.slice(1)}` : 
              'Regístrate para comenzar a gestionar tus propiedades'}
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="name" className="sr-only">Nombre completo</label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Nombre completo"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Correo electrónico</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirmar contraseña</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirmar contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {!selectedPlan && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Selecciona un plan</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedPlan === 'basic'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedPlan('basic')}
                >
                  Básico
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedPlan === 'pro'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedPlan('pro')}
                >
                  Pro
                </button>
                <button
                  type="button"
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    selectedPlan === 'enterprise'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedPlan('enterprise')}
                >
                  Enterprise
                </button>
              </div>
            </div>
          )}

          {error && (
            <div className="text-sm text-red-600 mt-2">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading || !selectedPlan}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <span className="text-sm text-gray-600">¿Ya tienes una cuenta? </span>
          <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
            Inicia sesión
          </Link>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">O regístrate con</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
              onClick={async () => {
                try {
                  setLoading(true);
                  const { data, error } = await supabase.auth.signInWithOAuth({
                    provider: 'google',
                    options: {
                      redirectTo: `${window.location.origin}/dashboard`
                    }
                  });
                  if (error) throw error;
                } catch (error: any) {
                  setError(error.message || 'Error al registrarse con Google');
                } finally {
                  setLoading(false);
                }
              }}
            >
              <span className="sr-only">Registrarse con Google</span>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M23.76 12.27C23.76 11.48 23.69 10.73 23.57 10H12.26V14.51H18.74C18.44 15.99 17.6 17.24 16.33 18.09V21.09H20.28C22.57 19.01 23.76 15.92 23.76 12.27Z" fill="#4285F4"/>
                <path d="M12.25 24C15.57 24 18.35 22.92 20.27 21.09L16.32 18.09C15.24 18.81 13.87 19.25 12.25 19.25C9.13 19.25 6.48 17.15 5.52 14.29H1.44V17.38C3.35 21.3 7.5 24 12.25 24Z" fill="#34A853"/>
                <path d="M5.52 14.29C5.27 13.57 5.13 12.8 5.13 12C5.13 11.2 5.27 10.43 5.52 9.71V6.62H1.44C0.724 8.24 0.333 10.02 0.333 11.85V12.15C0.333 13.97 0.724 15.76 1.44 17.38L5.52 14.29Z" fill="#FBBC05"/>
                <path d="M12.25 4.75C14.03 4.75 15.61 5.36 16.85 6.55L20.34 3.06C18.34 1.17 15.57 0 12.25 0C7.5 0 3.35 2.7 1.44 6.62L5.52 9.71C6.48 6.85 9.13 4.75 12.25 4.75Z" fill="#EA4335"/>
              </svg>
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 