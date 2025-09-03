import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";

const DashboardNavigation: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const currentPath = location.pathname;

  const navItems = [
    { path: "/dashboard", label: t("dashboard.menu.dashboard") },
    { path: "/reservations", label: t("dashboard.menu.reservations") },
    { path: "/properties", label: t("dashboard.menu.properties") },

  ];

  const isActive = (path: string) => {
    return currentPath === path;
  };



  return (
    <div className="bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Navigation */}
        <div className="hidden md:flex md:space-x-8 py-3">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`py-2 px-1 border-b-2 text-sm font-medium ${
                isActive(item.path)
                  ? "border-primary-500 text-primary-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Mobile Navigation - Horizontal tabs like desktop */}
        <div className="md:hidden py-3">
          <div className="flex space-x-4 sm:space-x-6">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`py-2 px-1 border-b-2 text-sm sm:text-base font-medium flex-1 text-center ${
                  isActive(item.path)
                    ? "border-primary-500 text-primary-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardNavigation;
