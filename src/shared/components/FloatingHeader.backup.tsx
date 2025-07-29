// src/shared/components/FloatingHeader.tsx
// Componente de header floating y translúcido reutilizable

import React from "react";
import { Link } from "react-router-dom";
import MobileMenu from "@shared/components/MobileMenu";
import LanguageSelector from "@shared/components/LanguageSelector";

// Interface para los enlaces de navegación
interface NavLink {
  text: string;
  href: string;
  isButton?: boolean;
}

// Props del componente FloatingHeader
interface FloatingHeaderProps {
  navLinks: NavLink[];
  onLogoClick?: () => void; // Función opcional para click en logo
  className?: string; // Clases CSS adicionales
}

const FloatingHeader: React.FC<FloatingHeaderProps> = ({
  navLinks,
  onLogoClick,
  className = "",
}) => {
  // Función para manejar el click en el logo
  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    }
  };

  return (
    <header 
      className={`
        fixed top-0 left-0 right-0 z-50 
        bg-white/90 backdrop-blur-md 
        shadow-sm border-b border-white/20
        transition-all duration-300 ease-in-out
        ${className}
      `}
    >
      <div className="container-limited py-4 sm:py-5 md:py-6 flex justify-between items-center">
        {/* Logo - con o sin función de click */}
        {onLogoClick ? (
          <div 
            onClick={handleLogoClick} 
            className="flex items-center cursor-pointer hover:opacity-80 transition-opacity duration-200 h-28 sm:h-36 md:h-44"
          >
            <img
              src="/imagenes/Logo_hosthelper_new.png"
              alt="Host Helper AI Logo"
              className="h-full w-auto object-contain"
            />
          </div>
        ) : (
          <Link to="/" className="flex items-center hover:opacity-80 transition-opacity duration-200 h-28 sm:h-36 md:h-44">
            <img
              src="/imagenes/Logo_hosthelper_new.png"
              alt="Host Helper AI Logo"
              className="h-full w-auto object-contain"
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
                        ? "bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors duration-200"
                        : "text-gray-600 hover:text-primary-500 transition-colors duration-200"
                    }
                  >
                    {link.text}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-primary-500 transition-colors duration-200"
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

export default FloatingHeader; 