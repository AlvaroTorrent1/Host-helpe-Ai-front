import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import { useSubscription } from '@shared/hooks/useSubscription';

interface SubscriptionRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

/**
 * Componente que protege rutas que requieren suscripción activa.
 * Si el usuario no está autenticado, lo redirige a la página de login.
 * Si el usuario está autenticado pero no tiene suscripción activa, lo redirige a la página de precios.
 */
export const SubscriptionRoute: React.FC<SubscriptionRouteProps> = ({ 
  children, 
  redirectTo = '/pricing' 
}) => {
  const { user, loading: authLoading } = useAuth();
  const { hasActiveSubscription, loading: subLoading } = useSubscription();
  
  // Mostrar indicador de carga mientras verificamos autenticación y suscripción
  if (authLoading || subLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  // Redirigir a login si no hay usuario autenticado
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Redirigir a la página de precios si no hay suscripción activa
  if (!hasActiveSubscription) {
    return <Navigate to={redirectTo} />;
  }
  
  // Permitir acceso si tiene suscripción activa
  return <>{children}</>;
}; 