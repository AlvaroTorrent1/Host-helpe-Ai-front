/**
 * src/shared/components/DashboardHeader.tsx
 * Componente de header consistente para todas las páginas del dashboard
 * MIGRADO a react-i18next
 */
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@shared/contexts/AuthContext";
import { useTranslation } from 'react-i18next';
import LanguageSelector from "./LanguageSelector";

interface DashboardHeaderProps {
  onSignOut?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onSignOut }) => {
  const { user } = useAuth();
  const { t } = useTranslation();

  return (
    <header className="bg-white shadow-sm w-full">
      {/*
        Mobile/iPad layout (below lg):
        - Row 1: Logo (left) + Language selector (right)
        - Row 2: User email + Logout button (right)
        - Logo wrapper/scale mirrors LandingHeader to keep letters pixel-aligned.
        Desktop (lg+): single row, unchanged.
      */}
      <div className="container-limited py-2 lg:py-4">
        {/* Row 1: logo + language (mobile/tablet) */}
        <div className="flex items-center justify-between lg:hidden">
          <div className="flex items-center justify-start mb-0">
            <Link to="/">
              {/* Crop wrapper: identical to LandingHeader for pixel parity */}
              <div className="h-24 sm:h-auto overflow-hidden sm:overflow-visible flex items-center">
                <img
                  src="/imagenes/Logo_hosthelper_new.png"
                  alt="Host Helper AI Logo"
                  className="h-[115%] sm:h-20 md:h-36 responsive-img"
                />
              </div>
            </Link>
          </div>
          <LanguageSelector variant="dashboard" />
        </div>

        {/* Row 2: email + action (mobile/tablet)
            Cambio solicitado: justificar el contenido al margen izquierdo para mejorar visibilidad del correo.
            - Contenedor: ahora usa justify-start y ocupa todo el ancho (w-full)
            - Email: usa flex-1 y min-w-0 para aprovechar el espacio disponible; mantiene truncate por si el correo es muy largo
            - Botón/Link: con ml-auto para quedar alineado a la derecha sin afectar el email a la izquierda
        */}
        <div className="flex items-center lg:hidden mt-1 w-full justify-start space-x-2 sm:space-x-3">
          <span className="text-gray-700 text-xs sm:text-sm truncate flex-1 min-w-0 text-left">
            {user?.email}
          </span>
          {onSignOut ? (
            <button
              onClick={onSignOut}
              className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm transition duration-150"
            >
              {t("dashboard.menu.logout")}
            </button>
          ) : (
            <Link 
              to="/dashboard" 
              className="ml-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 sm:px-3 py-1 rounded-md text-xs sm:text-sm transition duration-150"
            >
              Dashboard
            </Link>
          )}
        </div>

        {/* Desktop: original single-row layout */}
        <div className="hidden lg:flex items-center justify-between">
          <div className="flex items-center justify-start mb-0">
            <Link to="/">
              <div className="h-24 overflow-hidden lg:overflow-visible flex items-center">
                <img
                  src="/imagenes/Logo_hosthelper_new.png"
                  alt="Host Helper AI Logo"
                  className="h-[115%] lg:h-36 responsive-img"
                />
              </div>
            </Link>
          </div>
          <div className="flex justify-center lg:justify-end items-center space-x-2 sm:space-x-4">
            <LanguageSelector variant="dashboard" />
            <span className="text-gray-700 text-sm sm:text-base truncate max-w-[120px] sm:max-w-full">
              {user?.email}
            </span>
            {onSignOut && (
              <button
                onClick={onSignOut}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm transition duration-150"
              >
                {t("dashboard.menu.logout")}
              </button>
            )}
            {!onSignOut && (
              <Link 
                to="/dashboard" 
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 sm:px-4 py-1 sm:py-2 rounded-md text-sm transition duration-150"
              >
                Dashboard
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader; 