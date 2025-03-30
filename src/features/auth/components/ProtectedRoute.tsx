import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@shared/contexts/AuthContext";

type ProtectedRouteProps = {
  children: ReactNode;
  adminOnly?: boolean;
};

const ProtectedRoute = ({
  children,
  adminOnly = false,
}: ProtectedRouteProps) => {
  const { user, loading } = useAuth();

  // Mientras verificamos el estado de autenticación, podríamos mostrar un spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  // Si no hay usuario, redirigir a login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Si se requiere ser admin, verificar rol (esto se implementará más adelante)
  if (adminOnly) {
    // Aquí verificaríamos si el usuario es admin
    // Por ahora, asumimos que no lo es
    return <Navigate to="/dashboard" replace />;
  }

  // Si todo está bien, mostrar los children
  return <>{children}</>;
};

export default ProtectedRoute;
