import React from "react";
import { useAuth } from "@shared/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import ReservationManagementPage from "./ReservationManagementPage";

/**
 * ReservationsPage Component
 *
 * Un componente que muestra la página de gestión de reservas
 * con funcionalidad para cerrar sesión en vez del botón de Dashboard
 */
const ReservationsPage: React.FC = () => {
  const { signOut } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      // Redirigir a la landing page después de cerrar sesión exitosamente
      navigate("/");
    } catch (error) {
      console.error(t("errors.signOut"), error);
    }
  };

  return <ReservationManagementPage onSignOut={handleSignOut} />;
};

export default ReservationsPage;
