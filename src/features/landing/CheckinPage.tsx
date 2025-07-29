import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import LandingHeader from "@shared/components/LandingHeader";
import { useTranslation } from "react-i18next";

const CheckinPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Función para manejar clic en el logo
  const handleLogoClick = () => {
    navigate("/");
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  // Estado para controlar las animaciones de scroll
  const [visibleSections, setVisibleSections] = useState({
    benefits: [false, false, false],
    features: false,
    featuresList: [false, false, false, false],
    demo: false
  });
  
  // Referencias para las secciones que queremos animar
  const benefit1Ref = useRef<HTMLDivElement>(null);
  const benefit2Ref = useRef<HTMLDivElement>(null);
  const benefit3Ref = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const feature1Ref = useRef<HTMLDivElement>(null);
  const feature2Ref = useRef<HTMLDivElement>(null);
  const feature3Ref = useRef<HTMLDivElement>(null);
  const feature4Ref = useRef<HTMLDivElement>(null);
  const demoRef = useRef<HTMLDivElement>(null);

  // Navigation links configuration - now handled by LandingHeader

  // Intersection Observer para animaciones de scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2, // Se activa cuando el 20% del elemento es visible
      rootMargin: "-50px 0px", // Margen para ajustar cuándo se activa
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Beneficios principales
          const benefitRefs = [benefit1Ref, benefit2Ref, benefit3Ref];
          const benefitIndex = benefitRefs.findIndex(ref => ref.current === entry.target);
          
          if (benefitIndex !== -1) {
            setVisibleSections(prev => ({
              ...prev,
              benefits: prev.benefits.map((visible, index) => 
                index === benefitIndex ? true : visible
              )
            }));
          }

          // Sección de características
          if (featuresRef.current === entry.target) {
            setVisibleSections(prev => ({ ...prev, features: true }));
          }

          // Lista de características
          const featureRefs = [feature1Ref, feature2Ref, feature3Ref, feature4Ref];
          const featureIndex = featureRefs.findIndex(ref => ref.current === entry.target);
          
          if (featureIndex !== -1) {
            setVisibleSections(prev => ({
              ...prev,
              featuresList: prev.featuresList.map((visible, index) => 
                index === featureIndex ? true : visible
              )
            }));
          }

          // Sección demo
          if (demoRef.current === entry.target) {
            setVisibleSections(prev => ({ ...prev, demo: true }));
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observar todos los elementos
    const allRefs = [
      benefit1Ref, benefit2Ref, benefit3Ref,
      featuresRef,
      feature1Ref, feature2Ref, feature3Ref, feature4Ref,
      demoRef
    ];
    
    allRefs.forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    // Cleanup
    return () => {
      allRefs.forEach(ref => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  // Scroll to top on mount - Enhanced para garantizar que siempre comience desde arriba
  useEffect(() => {
    // Scroll inmediato al cargar la página
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Sin animación para carga inicial
    });
    
    // Backup scroll para asegurar que funcione en todos los navegadores
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // También asegurar que el scroll lateral esté en 0
    window.scrollTo(0, 0);
  }, []);

  // Efecto adicional para resetear el scroll cuando cambie la ruta
  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant'
      });
    };

    // Ejecutar inmediatamente al montar
    handleRouteChange();
    
    return () => {
      // Cleanup si es necesario
    };
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ scrollBehavior: 'smooth' }}>
      <Helmet>
        <title>{t("checkinPage.meta.title")}</title>
        <meta name="description" content={t("checkinPage.meta.description")} />
      </Helmet>

      {/* Estilos adicionales para garantizar el correcto comportamiento del scroll */}
      <style>
        {`
          html, body {
            scroll-behavior: smooth;
          }
          
          /* Asegurar que la página comience desde el top */
          html {
            scroll-padding-top: 0;
          }
          
          /* Prevenir problemas de scroll en iOS */
          body {
            -webkit-overflow-scrolling: touch;
          }
        `}
      </style>

      {/* Header - Now using modular LandingHeader component (NON-sticky for consistency) */}
      <LandingHeader onLogoClick={handleLogoClick} />

      <main>
        {/* Beneficios principales */}
        <section className="py-20 bg-white">
          <div className="container-limited">
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                {t("checkinPage.hero.title")}
              </h1>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {t("checkinPage.hero.subtitle")}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t("checkinPage.hero.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Beneficio 1 */}
              <div 
                ref={benefit1Ref}
                className={`bg-white rounded-xl shadow-lg p-8 transform hover:-translate-y-2 transition-all duration-300 group hover:shadow-xl ${
                  visibleSections.benefits[0]
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-8 scale-95'
                } transition-all duration-1000 ease-out`}
              >
                <div className={`w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-100 transition-all duration-700 ${
                  visibleSections.benefits[0]
                    ? 'scale-100 rotate-0'
                    : 'scale-0 rotate-45'
                } delay-200`}>
                  <svg
                    className="w-8 h-8 text-primary-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h3 className={`text-xl font-bold text-gray-900 mb-3 transition-all duration-700 ${
                  visibleSections.benefits[0]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                } delay-300`}>
                  {t("checkinPage.benefits.compliance.title")}
                </h3>
                <p className={`text-gray-600 transition-all duration-700 ${
                  visibleSections.benefits[0]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                } delay-500`}>
                  {t("checkinPage.benefits.compliance.description")}
                </p>
              </div>

              {/* Beneficio 2 */}
              <div 
                ref={benefit2Ref}
                className={`bg-white rounded-xl shadow-lg p-8 transform hover:-translate-y-2 transition-all duration-300 group hover:shadow-xl ${
                  visibleSections.benefits[1]
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-8 scale-95'
                } transition-all duration-1000 ease-out delay-200`}
              >
                <div className={`w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-100 transition-all duration-700 ${
                  visibleSections.benefits[1]
                    ? 'scale-100 rotate-0'
                    : 'scale-0 rotate-45'
                } delay-400`}>
                  <svg
                    className="w-8 h-8 text-primary-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h3 className={`text-xl font-bold text-gray-900 mb-3 transition-all duration-700 ${
                  visibleSections.benefits[1]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                } delay-500`}>
                  {t("checkinPage.benefits.timeSaving.title")}
                </h3>
                <p className={`text-gray-600 transition-all duration-700 ${
                  visibleSections.benefits[1]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                } delay-700`}>
                  {t("checkinPage.benefits.timeSaving.description")}
                </p>
              </div>

              {/* Beneficio 3 */}
              <div 
                ref={benefit3Ref}
                className={`bg-white rounded-xl shadow-lg p-8 transform hover:-translate-y-2 transition-all duration-300 group hover:shadow-xl ${
                  visibleSections.benefits[2]
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-8 scale-95'
                } transition-all duration-1000 ease-out delay-400`}
              >
                <div className={`w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-100 transition-all duration-700 ${
                  visibleSections.benefits[2]
                    ? 'scale-100 rotate-0'
                    : 'scale-0 rotate-45'
                } delay-600`}>
                  <svg
                    className="w-8 h-8 text-primary-500"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    ></path>
                  </svg>
                </div>
                <h3 className={`text-xl font-bold text-gray-900 mb-3 transition-all duration-700 ${
                  visibleSections.benefits[2]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                } delay-700`}>
                  {t("checkinPage.benefits.experience.title")}
                </h3>
                <p className={`text-gray-600 transition-all duration-700 ${
                  visibleSections.benefits[2]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                } delay-900`}>
                  {t("checkinPage.benefits.experience.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Características avanzadas */}
        <section className="py-20 bg-gray-50">
          <div className="container-limited">
            <div className="text-center mb-16">
              <span className="inline-block px-4 py-1 bg-primary-100 text-primary-600 rounded-full text-sm font-medium mb-4">
                {t("checkinPage.features.subtitle")}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {t("checkinPage.features.title")}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t("checkinPage.features.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
              {/* Columna izquierda - Lista de características */}
              <div className="space-y-8">
                <div 
                  ref={feature1Ref}
                  className={`flex transition-all duration-1000 ease-out ${
                    visibleSections.featuresList[0]
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-8'
                  }`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white transition-all duration-700 ${
                      visibleSections.featuresList[0]
                        ? 'scale-100 rotate-0'
                        : 'scale-0 rotate-90'
                    } delay-200`}>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-xl font-semibold text-gray-900 transition-all duration-700 ${
                      visibleSections.featuresList[0]
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    } delay-300`}>
                      {t("checkinPage.features.sesIntegration.title")}
                    </h3>
                    <p className={`mt-2 text-gray-600 transition-all duration-700 ${
                      visibleSections.featuresList[0]
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    } delay-500`}>
                      {t("checkinPage.features.sesIntegration.description")}
                    </p>
                  </div>
                </div>

                <div 
                  ref={feature2Ref}
                  className={`flex transition-all duration-1000 ease-out ${
                    visibleSections.featuresList[1]
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-8'
                  } delay-200`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white transition-all duration-700 ${
                      visibleSections.featuresList[1]
                        ? 'scale-100 rotate-0'
                        : 'scale-0 rotate-90'
                    } delay-400`}>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-xl font-semibold text-gray-900 transition-all duration-700 ${
                      visibleSections.featuresList[1]
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    } delay-500`}>
                      {t("checkinPage.features.customForms.title")}
                    </h3>
                    <p className={`mt-2 text-gray-600 transition-all duration-700 ${
                      visibleSections.featuresList[1]
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    } delay-700`}>
                      {t("checkinPage.features.customForms.description")}
                    </p>
                  </div>
                </div>

                <div 
                  ref={feature3Ref}
                  className={`flex transition-all duration-1000 ease-out ${
                    visibleSections.featuresList[2]
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-8'
                  } delay-400`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white transition-all duration-700 ${
                      visibleSections.featuresList[2]
                        ? 'scale-100 rotate-0'
                        : 'scale-0 rotate-90'
                    } delay-600`}>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-xl font-semibold text-gray-900 transition-all duration-700 ${
                      visibleSections.featuresList[2]
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    } delay-700`}>
                      {t("checkinPage.features.documentCapture.title")}
                    </h3>
                    <p className={`mt-2 text-gray-600 transition-all duration-700 ${
                      visibleSections.featuresList[2]
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    } delay-900`}>
                      {t("checkinPage.features.documentCapture.description")}
                    </p>
                  </div>
                </div>

                <div 
                  ref={feature4Ref}
                  className={`flex transition-all duration-1000 ease-out ${
                    visibleSections.featuresList[3]
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-8'
                  } delay-600`}
                >
                  <div className="flex-shrink-0 mt-1">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white transition-all duration-700 ${
                      visibleSections.featuresList[3]
                        ? 'scale-100 rotate-0'
                        : 'scale-0 rotate-90'
                    } delay-800`}>
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className={`text-xl font-semibold text-gray-900 transition-all duration-700 ${
                      visibleSections.featuresList[3]
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    } delay-900`}>
                      {t("checkinPage.features.reservationManagement.title")}
                    </h3>
                    <p className={`mt-2 text-gray-600 transition-all duration-700 ${
                      visibleSections.featuresList[3]
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    } delay-1000`}>
                      {t(
                        "checkinPage.features.reservationManagement.description",
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Imagen o animación */}
              <div 
                ref={featuresRef}
                className={`relative transition-all duration-1000 ease-out ${
                  visibleSections.features
                    ? 'opacity-100 translate-x-0 scale-100'
                    : 'opacity-0 translate-x-8 scale-95'
                } flex items-center justify-center`}
              >
                <div className="w-3/4 max-w-md mx-auto">
                  <div className="aspect-square bg-white rounded-xl shadow-lg overflow-hidden">
                    {/* Imagen de llamada telefónica para check-in */}
                    <img
                      src="/imagenes/phoneCall.png"
                      alt="Llamada telefónica - Sistema de check-in automatizado"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        // Usar una imagen de fallback local en lugar de un servicio externo
                        target.src = "/imagenes/default-feature-image.jpg";
                        // Si también falla la imagen de fallback, mostrar un div con gradiente
                        target.onerror = () => {
                          if (target.parentElement) {
                            // Crear un elemento div con gradiente para reemplazar la imagen
                            const div = document.createElement('div');
                            div.className = 'w-full h-full bg-gradient-to-br from-primary-100 to-primary-300 flex items-center justify-center';
                            div.innerHTML = `<div class="text-center p-6">
                              <svg class="w-12 h-12 text-primary-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              <p class="text-primary-700 font-medium">Registro automatizado de huéspedes</p>
                            </div>`;
                            
                            // Reemplazar la imagen con el div
                            if (target.parentElement) {
                              target.parentElement.replaceChild(div, target);
                            }
                          }
                        };
                      }}
                    />
                  </div>

                  {/* Elementos decorativos - Ajustados para la imagen más pequeña */}
                  <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-primary-500/20 rounded-full blur-xl"></div>
                  <div className="absolute -left-6 -top-6 w-20 h-20 bg-yellow-500/20 rounded-full blur-xl"></div>
                </div>

                {/* Elemento flotante con un dato estadístico - Reposicionado */}
                <div
                  className={`absolute -bottom-4 -right-4 bg-white rounded-lg shadow-xl p-3 w-56 transform rotate-3 animate-float transition-all duration-1000 ${
                    visibleSections.features
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-8 scale-90'
                  } delay-500`}
                  style={{ animationDuration: "5s" }}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-5 h-5 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-xs text-gray-500">
                        {t("checkinPage.features.registrationTime.title")}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {t("checkinPage.features.registrationTime.value")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("checkinPage.features.registrationTime.description")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Animación flotante */}
        <style>
          {`
          @keyframes float {
            0% { transform: translateY(0px) rotate(3deg); }
            50% { transform: translateY(-10px) rotate(5deg); }
            100% { transform: translateY(0px) rotate(3deg); }
          }
          
          .animate-float {
            animation-name: float;
            animation-duration: 3s;
            animation-iteration-count: infinite;
            animation-timing-function: ease-in-out;
          }
          `}
        </style>

        {/* Demo Section */}
        <section className="py-20 bg-white">
          <div className="container-limited">
            <div 
              ref={demoRef}
              className={`flex flex-col lg:flex-row items-center transition-all duration-1000 ease-out ${
                visibleSections.demo
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <div className={`lg:w-1/2 mb-10 lg:mb-0 transition-all duration-1000 ease-out ${
                visibleSections.demo
                  ? 'opacity-100 translate-x-0'
                  : 'opacity-0 -translate-x-8'
              } delay-200`}>
                <span className={`inline-block px-4 py-1 bg-primary-100 text-primary-600 rounded-full text-sm font-medium mb-4 transition-all duration-700 ${
                  visibleSections.demo
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-75'
                } delay-300`}>
                  {t("checkinPage.demo.subtitle")}
                </span>
                <h2 className={`text-3xl sm:text-4xl font-bold text-gray-900 mb-6 transition-all duration-700 ${
                  visibleSections.demo
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                } delay-400`}>
                  {t("checkinPage.demo.title")}
                </h2>
                <p className={`text-lg text-gray-600 mb-8 transition-all duration-700 ${
                  visibleSections.demo
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                } delay-500`}>
                  {t("checkinPage.demo.description")}
                </p>
                <ul className={`space-y-4 transition-all duration-700 ${
                  visibleSections.demo
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                } delay-600`}>
                  <li className={`flex items-start transition-all duration-500 ${
                    visibleSections.demo
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-4'
                  } delay-700`}>
                    <svg
                      className="w-6 h-6 text-primary-500 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span className="ml-3 text-gray-600">
                      {t("checkinPage.demo.capabilities.dataCollection")}
                    </span>
                  </li>
                  <li className={`flex items-start transition-all duration-500 ${
                    visibleSections.demo
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-4'
                  } delay-800`}>
                    <svg
                      className="w-6 h-6 text-primary-500 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span className="ml-3 text-gray-600">
                      {t("checkinPage.demo.capabilities.links")}
                    </span>
                  </li>
                  <li className={`flex items-start transition-all duration-500 ${
                    visibleSections.demo
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-4'
                  } delay-900`}>
                    <svg
                      className="w-6 h-6 text-primary-500 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span className="ml-3 text-gray-600">
                      {t("checkinPage.demo.capabilities.validation")}
                    </span>
                  </li>
                  <li className={`flex items-start transition-all duration-500 ${
                    visibleSections.demo
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-4'
                  } delay-1000`}>
                    <svg
                      className="w-6 h-6 text-primary-500 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      ></path>
                    </svg>
                    <span className="ml-3 text-gray-600">
                      {t("checkinPage.demo.capabilities.transmission")}
                    </span>
                  </li>
                </ul>
              </div>
              <div className={`lg:w-1/2 lg:pl-16 transition-all duration-1000 ease-out ${
                visibleSections.demo
                  ? 'opacity-100 translate-x-0 scale-100'
                  : 'opacity-0 translate-x-8 scale-95'
              } delay-400`}>
                {/* Placeholder para una demo interactiva o video */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-xl shadow-lg overflow-hidden">
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    {/* Aquí podría ir un iframe o componente de video */}
                    <div className="text-center p-8">
                      <svg
                        className="w-16 h-16 text-primary-300 mx-auto mb-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        ></path>
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <p className="text-gray-500">
                        {t("checkinPage.demo.videoPlaceholder")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer - Same as LandingPage */}
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
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                <img
                  src="/imagenes/LogoMentorDay.png"
                  alt="MentorDay"
                  className="max-h-[3.25rem] w-auto object-contain"
                />
                <img
                  src="/imagenes/Eoi logo.png"
                  alt="Escuela de Organización Industrial"
                  className="max-h-[3.25rem] w-auto object-contain"
                />
                <img
                  src="/imagenes/logo_microsoft_for_startups.png"
                  alt="Microsoft for Startups"
                  className="max-h-[3.25rem] w-auto object-contain"
                />
                <img
                  src="/imagenes/logo incibe.png"
                  alt="Incibe"
                  className="max-h-[3.25rem] w-auto object-contain"
                />
                <img
                  src="/imagenes/Andalucia Lab.png"
                  alt="Andalucía Lab"
                  className="max-h-[3.25rem] w-auto object-contain"
                />
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
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
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
    </div>
  );
};

export default CheckinPage;
