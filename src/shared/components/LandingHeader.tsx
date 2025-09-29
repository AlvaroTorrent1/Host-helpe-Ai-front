// src/shared/components/LandingHeader.tsx
// Componente header unificado para todas las páginas landing/públicas

import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import MobileMenu from "@shared/components/MobileMenu";
import LanguageSelector from "@shared/components/LanguageSelector";

interface LandingHeaderProps {
  onLogoClick?: () => void; // Función opcional para comportamiento custom del logo
}

const LandingHeader: React.FC<LandingHeaderProps> = ({ onLogoClick }) => {
  const { t } = useTranslation();

  // Estado: detecta si hemos hecho scroll para aplicar fondo translúcido
  // Nota: usamos 'backdrop-filter' para difuminar SOLO el contenido de detrás.
  // El texto y los iconos del header permanecen nítidos (no aplicamos 'opacity' al contenedor).
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Umbral pequeño para activar el estado con un toque de scroll
      setIsScrolled(window.scrollY > 8);
    };

    onScroll(); // establecer estado inicial
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Navigation links configuration - idéntica para todas las páginas
  const navLinks = [
    { text: "Características", href: "/#features" },
    { text: t("nav.pricing"), href: "/pricing" },
    // Redirigir "Testimonios" a la sección de landing
    { text: t("nav.testimonials"), href: "/#testimonios" },
    { text: t("nav.login"), href: "/login", isButton: true },
  ];

  // Función para manejar click en logo
  const handleLogoClick = () => {
    if (onLogoClick) {
      onLogoClick();
    }
    // Comportamiento por defecto si no hay función custom
  };

  // Scroll suave a secciones internas (hash) como #features
  const handleHashNavigation = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    href: string,
  ) => {
    const idx = href.indexOf('#');
    if (idx === -1) return;
    const id = href.slice(idx + 1);
    const el = document.getElementById(id);
    if (!el) return;
    e.preventDefault();
    try { window.history.pushState(null, '', `/#${id}`); } catch {}
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    // Importante: mantenemos el contenido nítido. El efecto de vidrio se logra
    // con 'bg-white/70' + 'backdrop-blur-md' cuando hay scroll.
    // No usamos 'opacity-*' en el header para no desvanecer el texto.
    <>
      <header
        className={
          // Nota importante:
          // - En tamaños con hamburguesa (lg:hidden en `MobileMenu`), el header NO debe ser sticky ni translúcido.
          // - Conservamos fondo sólido en mobile/tablet para evitar superposición con el contenido.
          // - A partir de `lg:` (donde aparece la navegación de escritorio) sí aplicamos sticky + glass.
          (
            `relative top-0 left-0 right-0 z-50 w-full border-b transition-all duration-300 ` +
            // Mobile/Tablet: fondo sólido, sin blur
            `bg-white border-gray-200 shadow-sm ` +
            // Desktop (lg+): sticky + fondo translúcido cuando hay scroll
            (isScrolled
              ? ` lg:sticky lg:bg-white/70 lg:backdrop-blur-md`
              : ` lg:sticky lg:bg-white/60 lg:backdrop-blur`)
          )
        }
        style={{ minHeight: '96px' }}
      >
      <div className="container-limited py-3 md:py-4 flex items-center justify-between">
        {/* Logo */}
        {/*
          Pixel-perfect constraint: The logo size and position in Landing must
          match DashboardHeader exactly. We mirror the container alignment and
          the image height classes from DashboardHeader so both headers stay
          consistent across breakpoints.
        */}
        <div className="flex items-center justify-start mb-0">
          {onLogoClick ? (
            <div onClick={handleLogoClick} className="flex items-center cursor-pointer">
              {/* Contenedor de recorte: mantiene la altura del header en móvil (96px) */}
              <div className="h-24 sm:h-auto lg:h-24 overflow-hidden sm:overflow-visible flex items-center">
                {/* Imagen 15% más alta en móvil, recortada por arriba/abajo sin aumentar el header */}
                <img
                  src="/imagenes/Logo_hosthelper_new.png"
                  alt="Host Helper AI Logo"
                  className="h-[115%] sm:h-20 md:h-36 responsive-img"
                />
              </div>
            </div>
          ) : (
            <Link to="/">
              <div className="h-24 sm:h-auto lg:h-24 overflow-hidden sm:overflow-visible flex items-center">
                <img
                  src="/imagenes/Logo_hosthelper_new.png"
                  alt="Host Helper AI Logo"
                  className="h-[115%] sm:h-20 md:h-36 responsive-img"
                />
              </div>
            </Link>
          )}
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center space-x-4">
          <ul className="flex space-x-4 mr-4">
            {navLinks.map((link, index) => (
              <li key={index}>
                {link.href.includes('#') ? (
                  <a
                    href={link.href}
                    onClick={(e) => handleHashNavigation(e, link.href)}
                    className={
                      link.isButton
                        ? "bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-300"
                        : "text-gray-600 hover:text-primary-500 transition-colors duration-300"
                    }
                  >
                    {link.text}
                  </a>
                ) : link.href.startsWith("/") ? (
                  <Link
                    to={link.href}
                    className={
                      link.isButton
                        ? "bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md shadow-sm hover:shadow-md transition-all duration-300"
                        : "text-gray-600 hover:text-primary-500 transition-colors duration-300"
                    }
                  >
                    {link.text}
                  </Link>
                ) : (
                  <a
                    href={link.href}
                    className="text-gray-600 hover:text-primary-500 transition-colors duration-300"
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
    </>
  );
};

export default LandingHeader; 