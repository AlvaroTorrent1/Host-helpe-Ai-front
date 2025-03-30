/**
 * src/shared/components/DashboardHeader.tsx
 * Componente de header consistente para todas las páginas del dashboard
 */
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@shared/contexts/AuthContext";
import { useLanguage } from "@shared/contexts/LanguageContext";
import DashboardLanguageSelector from "../../features/dashboard/DashboardLanguageSelector";

interface DashboardHeaderProps {
  onSignOut?: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ onSignOut }) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  return (
    <header className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 py-2 sm:py-4 flex flex-col sm:flex-row justify-between items-center">
        <div className="flex items-center mb-4 sm:mb-0">
          <Link to="/">
            <img
              src="/imagenes/Logo_hosthelper_new.png"
              alt="Host Helper AI Logo"
              className="h-24 sm:h-54"
            />
          </Link>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4">
          <DashboardLanguageSelector />
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
    </header>
  );
};

export default DashboardHeader; 