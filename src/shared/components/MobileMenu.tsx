import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";

interface NavLink {
  text: string;
  href: string;
  isButton?: boolean;
}

interface MobileMenuProps {
  links: NavLink[];
}

const MobileMenu: React.FC<MobileMenuProps> = ({ links }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstItemRef = useRef<HTMLAnchorElement | null>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Manejar cierre del menú al pulsar ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    // Enfocar primer elemento del menú al abrirlo
    if (isOpen && firstItemRef.current) {
      firstItemRef.current.focus();
    }

    // Bloquear scroll cuando el menú está abierto
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Detectar clics fuera del menú
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (
        isOpen &&
        menuRef.current &&
        menuButtonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside as EventListener);
    document.addEventListener(
      "touchstart",
      handleClickOutside as EventListener,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside as EventListener,
      );
      document.removeEventListener(
        "touchstart",
        handleClickOutside as EventListener,
      );
    };
  }, [isOpen]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <div className="relative md:hidden">
      <button
        ref={menuButtonRef}
        className="p-2 text-gray-600 hover:text-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-controls="mobile-menu"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
      >
        {isOpen ? (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        ) : (
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16m-7 6h7"
            ></path>
          </svg>
        )}
      </button>

      {isOpen && (
        <>
          {/* Overlay para facilitar el cierre del menú */}
          <div
            ref={overlayRef}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ease-in-out"
            onClick={closeMenu}
            aria-hidden="true"
          />

          <div
            id="mobile-menu"
            ref={menuRef}
            className="fixed top-20 left-0 right-0 bg-white shadow-md py-4 px-6 z-50 max-h-[80vh] overflow-y-auto transition-transform duration-300 ease-in-out"
            role="navigation"
            aria-label="Menú móvil"
          >
            <ul className="space-y-3">
              {links.map((link, index) => (
                <li key={index}>
                  {link.href.startsWith("/") ? (
                    <Link
                      to={link.href}
                      className={
                        link.isButton
                          ? "bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md inline-block w-full text-center focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                          : "text-gray-600 hover:text-primary-500 block px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                      }
                      onClick={() => setIsOpen(false)}
                      ref={index === 0 ? firstItemRef : null}
                    >
                      {link.text}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-gray-600 hover:text-primary-500 block px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-primary-500"
                      onClick={() => setIsOpen(false)}
                      ref={index === 0 ? firstItemRef : null}
                      rel="noopener noreferrer"
                    >
                      {link.text}
                    </a>
                  )}
                </li>
              ))}

              {/* Language Selector */}
              <LanguageSelector isMobile={true} />
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default MobileMenu;
