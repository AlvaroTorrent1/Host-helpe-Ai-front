import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { LoadingInlineVariants } from "@shared/components/loading";

const ScheduleDemoPage: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  
  // Pre-calcular el texto de carga
  const loadingText = t("common.loading") || "Cargando calendario de citas...";
  
  // La URL de Calendly debe estar correcta y activa
  const calendlyUrl = "https://calendly.com/hosthelperai-services/30min";

  useEffect(() => {
    // Cargar el script de Calendly de forma simple
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    
    script.onload = () => {
      console.log('Script de Calendly cargado');
      setIsLoading(false);
    };
    
    script.onerror = () => {
      console.error('Error al cargar Calendly');
      setIsLoading(false);
    };
    
    // Verificar si ya existe
    if (!document.querySelector('script[src*="calendly"]')) {
      document.body.appendChild(script);
    } else {
      setIsLoading(false);
    }

    return () => {
      // Cleanup solo si el script existe
      const existingScript = document.querySelector('script[src*="calendly"]');
      if (existingScript && document.body.contains(existingScript)) {
        document.body.removeChild(existingScript);
      }
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-sm py-4 border-b border-gray-200">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-3"
            >
              <path
                d="M19.25 11.5C19.25 16.0593 15.5593 19.75 11 19.75C6.44065 19.75 2.75 16.0593 2.75 11.5C2.75 6.94065 6.44065 3.25 11 3.25C15.5593 3.25 19.25 6.94065 19.25 11.5Z"
                fill="#ECA408"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                d="M11 7.5V11.5L13.5 14"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <h1 className="text-xl font-bold text-gray-900">
              {t("calendly.pageTitle")}
            </h1>
          </div>
          <Link
            to="/"
            className="flex items-center text-primary-500 hover:text-primary-600 font-medium transition-colors group"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-1 group-hover:-translate-x-1 transition-transform duration-300"
            >
              <path
                d="M19 12H5M5 12L12 19M5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {t("calendly.backToHome")}
          </Link>
        </div>
      </header>

      <main className="flex-grow px-4 py-8">
        <div className="container mx-auto max-w-screen-xl">
          <div className="mb-8 text-center">
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t("calendly.pageSubtitle")}
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/3 mb-6 md:mb-0">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Host Helper AI
                </h2>
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center mr-3">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                        stroke="#ECA408"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 6V12L16 14"
                        stroke="#ECA408"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">30 min</p>
                    <p className="text-sm text-gray-500">Demo personalizada</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4">
                  Conoce cómo Host Helper AI puede ayudarte a automatizar la
                  gestión de tus alojamientos turísticos.
                </p>
                <div className="border-t border-gray-100 pt-4">
                  <div className="flex items-center">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-gray-400 mr-2"
                    >
                      <path
                        d="M21 10H3M16 2V6M8 2V6M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span className="text-sm text-gray-600">
                      Disponible en tu zona horaria
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="md:w-2/3">
              {isLoading ? (
                <div className="bg-white p-6 rounded-lg shadow-md text-center">
                  {LoadingInlineVariants.card(loadingText)}
                </div>
              ) : (
                <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                  <div
                    className="w-full mx-auto"
                    style={{ height: "650px", minWidth: "320px" }}
                  >
                    <div
                      className="calendly-inline-widget"
                      data-url={calendlyUrl}
                      style={{ minWidth: '320px', height: '630px' }}
                    ></div>
                  </div>
                  
                  {/* Botón de reinicio en caso de problemas */}
                  <div className="p-4 border-t border-gray-100 text-center">
                    <a 
                      href={calendlyUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      ↗ Abrir en nueva ventana si no se muestra correctamente
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="bg-white py-4 border-t border-gray-200 text-center text-gray-500 text-sm">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Host Helper AI</p>
        </div>
      </footer>
    </div>
  );
};

export default ScheduleDemoPage;
