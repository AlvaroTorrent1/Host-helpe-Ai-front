import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@shared/contexts/AuthContext';
import { useSubscription } from '@shared/hooks/useSubscription';
import { LoadingScreen } from '@shared/components/loading';

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
  
  // Mostrar sistema modular de loading mientras verificamos autenticación y suscripción
  if (authLoading || subLoading) {
    return (
      <LoadingScreen 
        message="Verificando suscripción..."
        subtext="Validando permisos de acceso"
        gradient={true}
      />
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