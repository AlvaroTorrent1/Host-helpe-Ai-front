import React from "react";
import SESRegistrationPage from "../ses/SESRegistrationPage";

/**
 * SesPage Component
 *
 * Un componente que simplemente redirige a SESRegistrationPage
 * para mantener la compatibilidad con la estructura de rutas
 */
const SesPage: React.FC = () => {
  return <SESRegistrationPage />;
};

export default SesPage; 