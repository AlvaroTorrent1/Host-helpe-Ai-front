// src/shared/components/Footer.tsx
// Componente Footer global - MIGRADO a react-i18next

import React from "react";
import { useTranslation } from 'react-i18next';

const Footer: React.FC = () => {
  const { t } = useTranslation();

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
                
                {/* Segunda serie de logos (duplicada para efecto infinito) */}
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
              </div>
            </div>
          </div>

          {/* Síguenos - Center */}
          <div className="flex flex-col items-center">
            <h4 className="text-lg font-medium mb-3 relative inline-block">
              {t("footer.follow")}
              <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-primary-400"></span>
            </h4>
            <div className="flex justify-center space-x-4">
              {/* LinkedIn */}
              <a
                href="https://www.linkedin.com/company/host-helper-ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white p-2 rounded-full shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300"
              >
                <svg
                  className="w-5 h-5 text-primary-500 group-hover:scale-110 transition-transform duration-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.338 16.338H13.67V12.16c0-.995-.017-2.277-1.387-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248H8.014v-8.59h2.559v1.174h.037c.356-.675 1.227-1.387 2.526-1.387 2.703 0 3.203 1.778 3.203 4.092v4.711zM5.005 6.575a1.548 1.548 0 11-.003-3.096 1.548 1.548 0 01.003 3.096zm-1.337 9.763H6.34v-8.59H3.667v8.59zM17.668 1H2.328C1.595 1 1 1.581 1 2.298v15.403C1 18.418 1.595 19 2.328 19h15.34c.734 0 1.332-.582 1.332-1.299V2.298C19 1.581 18.402 1 17.668 1z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
              
              {/* Instagram */}
              <a
                href="https://www.instagram.com/host_helper_ai/"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white p-2 rounded-full shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300"
              >
                <svg
                  className="w-5 h-5 text-primary-500 group-hover:scale-110 transition-transform duration-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 0C7.284 0 6.944.012 5.877.06 4.813.109 4.086.277 3.45.525a4.92 4.92 0 00-1.78 1.16A4.92 4.92 0 00.525 3.45C.277 4.086.109 4.813.06 5.877.012 6.944 0 7.284 0 10s.012 3.056.06 4.123c.049 1.064.217 1.791.465 2.427a4.92 4.92 0 001.16 1.78 4.92 4.92 0 001.78 1.16c.636.248 1.363.416 2.427.465C6.944 19.988 7.284 20 10 20s3.056-.012 4.123-.06c1.064-.049 1.791-.217 2.427-.465a4.92 4.92 0 001.78-1.16 4.92 4.92 0 001.16-1.78c.248-.636.416-1.363.465-2.427C19.988 13.056 20 12.716 20 10s-.012-3.056-.06-4.123c-.049-1.064-.217-1.791-.465-2.427a4.92 4.92 0 00-1.16-1.78A4.92 4.92 0 0016.55.525C15.914.277 15.187.109 14.123.06 13.056.012 12.716 0 10 0zm0 1.8c2.67 0 2.986.01 4.04.058.975.045 1.505.207 1.858.344.467.182.8.399 1.15.748.35.35.566.683.748 1.15.137.353.3.883.344 1.858.048 1.054.058 1.37.058 4.04s-.01 2.986-.058 4.04c-.045.975-.207 1.505-.344 1.858-.182.467-.399.8-.748 1.15-.35.35-.683.566-1.15.748-.353.137-.883.3-1.858.344-1.054.048-1.37.058-4.04.058s-2.986-.01-4.04-.058c-.975-.045-1.505-.207-1.858-.344a3.1 3.1 0 01-1.15-.748 3.1 3.1 0 01-.748-1.15c-.137-.353-.3-.883-.344-1.858C1.81 12.986 1.8 12.67 1.8 10s.01-2.986.058-4.04c.045-.975.207-1.505.344-1.858.182-.467.399-.8.748-1.15a3.1 3.1 0 011.15-.748c.353-.137.883-.3 1.858-.344C7.014 1.81 7.33 1.8 10 1.8zm0 3.065a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm6.538-8.203a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@HostHelperAi"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-white p-2 rounded-full shadow-sm hover:shadow-md hover:translate-y-[-2px] transition-all duration-300"
              >
                <svg
                  className="w-5 h-5 text-primary-500 group-hover:scale-110 transition-transform duration-300"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18.606 4.462c.206.19.348.44.406.719.105.502.159 1.005.159 1.508v6.622c0 .503-.054 1.006-.159 1.508a1.872 1.872 0 01-.406.719 1.892 1.892 0 01-.719.406c-.502.105-1.005.159-1.508.159H3.621c-.503 0-1.006-.054-1.508-.159a1.892 1.892 0 01-.719-.406 1.872 1.872 0 01-.406-.719C.883 13.317.829 12.814.829 12.311V5.689c0-.503.054-1.006.159-1.508.058-.279.2-.529.406-.719.19-.206.44-.348.719-.406.502-.105 1.005-.159 1.508-.159h12.758c.503 0 1.006.054 1.508.159.279.058.529.2.719.406zM8.282 12.553l4.944-2.842L8.282 6.87v5.683z"
                    clipRule="evenodd"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Contacto - Right */}
          <div className="flex flex-col items-center md:items-end">
            <h4 className="text-lg font-medium mb-3 relative inline-block">
              {t("footer.contact")}
              <span className="absolute -bottom-1 left-1/2 md:right-0 transform -translate-x-1/2 md:translate-x-0 w-10 h-0.5 bg-primary-400"></span>
            </h4>
            <div className="flex flex-col items-center md:items-end space-y-2">
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