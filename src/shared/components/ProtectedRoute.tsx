/**
 * Componente ProtectedRoute
 * Protege rutas que requieren autenticación y redirige a los usuarios no autenticados
 */

import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { securityService } from "../../services/security.service";
import { ROUTES } from "../../config/constants";
import { useGlobalLoading } from "../contexts/GlobalLoadingContext";
import { useSubscription } from "@shared/hooks/useSubscription";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string; // Rol requerido para acceder (opcional)
}

/**
 * Componente que protege las rutas que requieren autenticación
 * Redirige a la página de inicio de sesión si el usuario no está autenticado
 * También puede verificar roles específicos si se especifica requiredRole
 * Además, verifica si el usuario tiene una suscripción activa, si no, redirige a la página de precios
 */
const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(true);
  const { hasActiveSubscription, loading: subscriptionLoading } = useSubscription();
  const { setLoading, clearLoading } = useGlobalLoading();
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true, 'protected-route', 1);
        
        // Verificar autenticación
        const authenticated = await securityService.isAuthenticated();
        setIsAuthenticated(authenticated);

        // Si requiere un rol específico y está autenticado, verificar el rol
        if (requiredRole && authenticated) {
          const hasRole = await securityService.hasRole(requiredRole);
          setHasRequiredRole(hasRole);
        }
      } catch (error) {
        console.error("Error al verificar autenticación:", error);
        setIsAuthenticated(false);
        setHasRequiredRole(false);
      } finally {
        setIsLoading(false);
        clearLoading('protected-route');
      }
    };

    checkAuth();
  }, [requiredRole, setLoading, clearLoading]);

  // El GlobalLoadingProvider maneja el loading state
  // Solo verificar si está listo para proceder
  if (isLoading || subscriptionLoading) {
    return null; // El GlobalLoadingProvider se encarga del loading visual
  }

  // Si no está autenticado, redirigir a inicio de sesión
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  // Si requiere un rol específico y el usuario no lo tiene, mostrar acceso denegado
  if (requiredRole && !hasRequiredRole) {
    return <Navigate to="/access-denied" replace />;
  }

  // 🔧 EXCEPCIÓN: Permitir acceso a /properties/management sin verificar suscripción
  // Esto es para testing del sistema de webhook N8N con categorización IA
  const isPropertiesManagement = location.pathname === '/properties/management';
  
  // Si está autenticado pero no tiene suscripción activa, redirigir a la página de precios
  // EXCEPTO para /properties/management que se permite para testing
  if (!hasActiveSubscription && !isPropertiesManagement) {
    return <Navigate to="/pricing" state={{ from: location }} replace />;
  }

  // Si está autenticado, tiene el rol requerido (o no se requiere rol) y tiene suscripción activa, mostrar el contenido
  // O si está en la ruta de testing /properties/management
  return <>{children}</>;
};

export default ProtectedRoute;
