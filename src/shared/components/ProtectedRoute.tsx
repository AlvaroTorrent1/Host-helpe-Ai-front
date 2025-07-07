/**
 * Componente ProtectedRoute
 * Protege rutas que requieren autenticación y redirige a los usuarios no autenticados
 */

import { ReactNode, useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { securityService } from "../../services/security.service";
import { ROUTES } from "../../config/constants";
import { useGlobalLoading } from "../contexts/GlobalLoadingContext";

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: string; // Rol requerido para acceder (opcional)
}

/**
 * Componente que protege las rutas que requieren autenticación
 * Redirige a la página de inicio de sesión si el usuario no está autenticado
 * También puede verificar roles específicos si se especifica requiredRole
 * CAMBIO: Ya no verifica suscripciones - las limitaciones se manejan en cada componente
 */
const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(true);
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
  if (isLoading) {
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

  // CAMBIO: Eliminada toda la lógica de verificación de suscripción
  // Los usuarios autenticados pueden acceder a todas las rutas protegidas
  // Las limitaciones por plan se manejan dentro de cada componente usando UserStatusContext
  
  // Si está autenticado y tiene el rol requerido (si aplica), mostrar el contenido
  return <>{children}</>;
};

export default ProtectedRoute;
