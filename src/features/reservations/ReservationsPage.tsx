import React from "react";
import { useAuth } from "@shared/contexts/AuthContext";
import { useLanguage } from "@shared/contexts/LanguageContext";
import ReservationManagementPage from "./ReservationManagementPage";

/**
 * ReservationsPage Component
 *
 * Un componente que muestra la página de gestión de reservas
 * con funcionalidad para cerrar sesión en vez del botón de Dashboard
 */
const ReservationsPage: React.FC = () => {
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error(t("errors.signOut"), error);
    }
  };

  return <ReservationManagementPage onSignOut={handleSignOut} />;
};

export default ReservationsPage;
