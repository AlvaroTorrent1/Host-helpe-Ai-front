import React from "react";
import ReservationManagementPage from "./ReservationManagementPage";

/**
 * ReservationsPage Component
 *
 * Un componente que simplemente redirige a ReservationManagementPage
 * para mantener la compatibilidad con la estructura de rutas
 */
const ReservationsPage: React.FC = () => {
  return <ReservationManagementPage />;
};

export default ReservationsPage;
