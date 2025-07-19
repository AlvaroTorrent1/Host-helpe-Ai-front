import React from "react";
import { useAuth } from "@shared/contexts/AuthContext";
import { useTranslation } from "react-i18next";
import PropertyManagementPage from "../properties/PropertyManagementPage";

/**
 * PropertiesPage Component
 *
 * Un componente que proporciona la página de gestión de propiedades
 * con funcionalidad para cerrar sesión en vez del botón de Dashboard
 */
const PropertiesPage: React.FC = () => {
  const { signOut } = useAuth();
  const { t } = useTranslation();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error(t("errors.signOut"), error);
    }
  };

  return <PropertyManagementPage onSignOut={handleSignOut} />;
};

export default PropertiesPage; 