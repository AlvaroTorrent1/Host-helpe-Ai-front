import React from "react";
import { useLanguage } from "@shared/contexts/LanguageContext";

const Footer: React.FC = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-gray-50 text-gray-800 py-6 w-full relative overflow-hidden">
      {/* Elementos decorativos */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-amber-300 to-primary-400 opacity-70"></div>
      <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-primary-300 rounded-full opacity-10"></div>
      <div className="absolute -top-10 right-10 w-24 h-24 bg-amber-300 rounded-full opacity-10"></div>

      <div className="container-limited relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
          {/* Con el apoyo de - Left */}
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-lg font-medium mb-3 relative inline-block">
              {t("footer.support")}
              <span className="absolute -bottom-1 left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0 w-10 h-0.5 bg-primary-400"></span>
            </h4>
            
            {/* Carrusel infinito de logos */}
            <div className="w-full max-w-sm overflow-hidden">
              <div className="flex animate-scroll-logos">
                {/* Primera serie de logos */}
                <div className="flex items-center gap-6 min-w-max">
                  <img
                    src="/imagenes/LogoMentorDay.png"
                    alt="MentorDay"
                    className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                  />
                  <img
                    src="/imagenes/Eoi logo.png"
                    alt="Escuela de Organización Industrial"
                    className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                  />
                  <img
                    src="/imagenes/logo_microsoft_for_startups.png"
                    alt="Microsoft for Startups"
                    className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                  />
                  <img
                    src="/imagenes/logo incibe.png"
                    alt="Incibe"
                    className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                  />
                  <img
                    src="/imagenes/Andalucia Lab.png"
                    alt="Andalucía Lab"
                    className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
                
                {/* Segunda serie de logos (duplicada para loop infinito) */}
                <div className="flex items-center gap-6 min-w-max ml-6">
                  <img
                    src="/imagenes/LogoMentorDay.png"
                    alt="MentorDay"
                    className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                  />
                  <img
                    src="/imagenes/Eoi logo.png"
                    alt="Escuela de Organización Industrial"
                    className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                  />
                  <img
                    src="/imagenes/logo_microsoft_for_startups.png"
                    alt="Microsoft for Startups"
                    className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                  />
                  <img
                    src="/imagenes/logo incibe.png"
                    alt="Incibe"
                    className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                  />
                  <img
                    src="/imagenes/Andalucia Lab.png"
                    alt="Andalucía Lab"
                    className="h-12 w-auto object-contain opacity-70 hover:opacity-100 transition-opacity duration-300"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Redes sociales - Centro */}
          <div className="flex flex-col items-center justify-center">
            <h4 className="text-lg font-medium mb-3 relative inline-block">
              {t("footer.follow")}
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-primary-400"></span>
            </h4>
            <div className="flex space-x-4 justify-center">
              <a
                href="https://www.linkedin.com/company/host-helper-ai"
                className="group"
                aria-label="LinkedIn"
              >
                <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                  <svg
                    className="w-5 h-5 text-primary-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </div>
              </a>
              <a
                href="https://www.instagram.com/host_helper_ai/"
                className="group"
                aria-label="Instagram"
              >
                <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                  <svg
                    className="w-5 h-5 text-primary-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.40z" />
                  </svg>
                </div>
              </a>
              <a
                href="https://www.youtube.com/@HostHelperAi"
                className="group"
                aria-label="YouTube"
              >
                <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                  <svg
                    className="w-5 h-5 text-primary-500"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </div>
              </a>
            </div>
          </div>

          {/* Contacto - Derecha */}
          <div className="flex flex-col items-center md:items-end">
            <h4 className="text-lg font-medium mb-3 relative inline-block">
              {t("footer.contact")}
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-primary-400"></span>
            </h4>
            <div className="flex flex-col space-y-2">
              <a
                href="mailto:support@hosthelperai.com"
                className="group flex items-center justify-center md:justify-end text-gray-600 hover:text-primary-600 transition-colors"
              >
                <div className="bg-white p-2 rounded-full shadow-sm mr-3 group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                  <svg
                    className="w-4 h-4 text-primary-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">
                  support@hosthelperai.com
                </span>
              </a>
              <a
                href="tel:+34687472327"
                className="group flex items-center justify-center md:justify-end text-gray-600 hover:text-primary-600 transition-colors"
              >
                <div className="bg-white p-2 rounded-full shadow-sm mr-3 group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                  <svg
                    className="w-4 h-4 text-primary-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                </div>
                <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">
                  +34 687 472 327
                </span>
              </a>
            </div>
          </div>
        </div>

        {/* Host Helper Logo & Description - Moved to bottom center */}
        <div className="mt-6 pt-4 border-t border-gray-200/50 flex flex-col items-center">
          <img
            src="/imagenes/Logo_hosthelper_new.png"
            alt="Host Helper AI Logo"
            className="h-28 md:h-28 responsive-img mb-2"
          />
          <div className="h-0.5 w-16 bg-gradient-to-r from-primary-400 to-amber-300 rounded mb-2"></div>
          <p className="text-gray-600 text-sm max-w-xs text-center mt-1">
            {t("footer.slogan")}
          </p>
        </div>

        <div className="mt-6 pt-3 border-t border-gray-200/50 text-center">
          <p className="text-gray-500 text-xs">{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 