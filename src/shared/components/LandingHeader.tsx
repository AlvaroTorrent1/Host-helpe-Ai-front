// src/shared/components/LandingHeader.tsx
// Componente header unificado para todas las páginas landing/públicas

import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MobileMenu from "@shared/components/MobileMenu";
import LanguageSelector from "@shared/components/LanguageSelector";

interface LandingHeaderProps {
  onLogoClick?: () => void; // Función opcional para comportamiento custom del logo
}

const LandingHeader: React.FC<LandingHeaderProps> = ({ onLogoClick }) => {
  const { t } = useTranslation();

  // Navigation links configuration - idéntica para todas las páginas
  const navLinks = [
    { text: t("nav.features"), href: "/#features" },
    { text: t("nav.pricing"), href: "/pricing" },
    { text: t("nav.testimonials"), href: "/testimonios" },
    { text: t("nav.login"), href: "/login", isButton: true },
  ];

  // Función para manejar click en logo
  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    }
    // Comportamiento por defecto si no hay función custom
  };

  return (
    <header className="bg-white shadow-sm w-full">
      <div className="container-limited py-4 flex justify-between items-center">
        {/* Logo */}
        {onLogoClick ? (
          <div onClick={handleLogoClick} className="flex items-center cursor-pointer">
            <img
              src="/imagenes/Logo_hosthelper_new.png"
              alt="Host Helper AI Logo"
              className="h-20 sm:h-36 responsive-img"
            />
          </div>
        ) : (
          <Link to="/" className="flex items-center">
            <img
              src="/imagenes/Logo_hosthelper_new.png"
              alt="Host Helper AI Logo"
              className="h-20 sm:h-36 responsive-img"
            />
          </Link>
        )}

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <ul className="flex space-x-4 mr-4">
            {navLinks.map((link, index) => (
              <li key={index}>
                {link.href.startsWith("/") ? (
                  <Link
                    to={link.href}
                    className={
                      link.isButton
                        ? "bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md"
                        : "text-gray-600 hover:text-primary-500"
                    }
                  >
                    {link.text}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-primary-500"
                  >
                    {link.text}
                  </a>
                )}
              </li>
            ))}
          </ul>

          {/* Language Selector */}
          <LanguageSelector />
        </nav>

        {/* Mobile Menu */}
        <MobileMenu links={navLinks} />
      </div>
    </header>
  );
};

export default LandingHeader; 