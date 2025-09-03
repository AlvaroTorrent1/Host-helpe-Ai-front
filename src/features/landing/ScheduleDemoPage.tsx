// src/features/landing/ScheduleDemoPage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const ScheduleDemoPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  
  // URLs de Calendly configuradas por idioma
  const getCalendlyUrl = () => {
    const baseUrl = "https://calendly.com/hosthelperai-services/30min";
    const currentLanguage = i18n.language;
    
    // Configurar parámetros según idioma
    if (currentLanguage === 'es') {
      // Para español, mantenemos la URL base (configurar desde Calendly panel)
      return baseUrl;
    } else {
      // Para inglés y otros idiomas
      return baseUrl;
    }
  };
  
  const primaryUrl = getCalendlyUrl();
  const fallbackUrl = "https://calendly.com/acmecorp/30min";
  
  console.log('📅 Calendly - Método iframe simple:', primaryUrl);

  // Componente Iframe Simple (sin JavaScript, sin problemas de timing)
  const CalendlyIframe = () => (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <iframe 
        src={primaryUrl}
        width="100%" 
        height="700px"
        style={{
          border: 'none',
          display: 'block',
          borderRadius: '8px'
        }}
        loading="lazy"
        title="Programar Demo - Host Helper AI"
        allow="microphone; camera"
      />
    </div>
  );



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {t('calendly.pageTitle')}
              </h1>
              <p className="text-gray-600 mt-2 max-w-2xl">
                {t('calendly.pageSubtitle')}
              </p>
            </div>
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              ← {t('calendly.backToHome')}
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Sidebar con información */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-primary-600"
                    >
                      <path
                        d="M21 10H3M16 2V6M8 2V6M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <h2 className="text-xl font-semibold text-gray-900">Host Helper AI</h2>
                    <p className="text-sm text-gray-600">30 min</p>
                    <p className="text-sm text-gray-500">Demo personalizada</p>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-4">
                  {t('calendly.demoDescription')}
                </p>
                
                <div className="flex items-center text-sm text-gray-600">
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
                    {t('calendly.availableInYourTimezone')}
                  </span>
                </div>
              </div>
            </div>

                         {/* Widget de Calendly */}
             <div className="lg:col-span-2">
               <div className="w-full mx-auto relative" style={{ minHeight: "700px" }}>
                 <CalendlyIframe />
               </div>
             </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 border-t border-gray-200 text-center text-gray-500 text-sm">
        <div className="container mx-auto px-4">
          <p>&copy; {new Date().getFullYear()} Host Helper AI</p>
        </div>
      </footer>
    </div>
  );
};

export default ScheduleDemoPage;
