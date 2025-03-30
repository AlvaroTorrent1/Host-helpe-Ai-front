import React from "react";
import PropertyManagementPage from "../properties/PropertyManagementPage";

/**
 * PropertiesPage Component
 *
 * Un componente que simplemente redirige a PropertyManagementPage
 * para mantener la compatibilidad con la estructura de rutas
 */
const PropertiesPage: React.FC = () => {
  return <PropertyManagementPage />;
};

export default PropertiesPage; 