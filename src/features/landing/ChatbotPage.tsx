import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MobileMenu from "@shared/components/MobileMenu";
import LanguageSelector from "@shared/components/LanguageSelector";
import Footer from "@shared/components/Footer";
import { useLanguage } from "@shared/contexts/LanguageContext";

const ChatbotPage = () => {
  const { t } = useLanguage();

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

  // Navigation links configuration (same as LandingPage)
  const navLinks = [
    { text: t("nav.features"), href: "/#features" },
    { text: t("nav.pricing"), href: "/pricing" },
    { text: t("nav.testimonials"), href: "/testimonios" },
    { text: t("nav.login"), href: "/login", isButton: true },
  ];

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

  // Scroll to top on mount con funcionalidad mejorada
  useEffect(() => {
    // Scroll inmediato al top
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    
    // Fallbacks adicionales para asegurar el scroll
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <div className="min-h-screen bg-white" style={{ scrollPaddingTop: '0px', scrollBehavior: 'smooth' }}>
      <Helmet>
        <title>{t("chatbotPage.meta.title")}</title>
        <meta name="description" content={t("chatbotPage.meta.description")} />
      </Helmet>

      {/* Header - Same as LandingPage */}
      <header className="bg-white shadow-sm w-full sticky top-0 z-50">
        <div className="container-limited py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img
              src="/imagenes/Logo_hosthelper_new.png"
              alt="Host Helper AI Logo"
              className="h-20 sm:h-36 responsive-img"
            />
          </Link>

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

      <main>
        {/* Beneficios principales - Agentes de IA */}
        <section className="py-20 bg-white">
          <div className="container-limited">
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                {t("chatbotPage.hero.title")}
              </h1>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {t("chatbotPage.hero.subtitle")}
              </h2>
              <p className="text-lg text-gray-600 max-w-4xl mx-auto">
                {t("chatbotPage.hero.description")}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Beneficio 1 - Atención por Voz 24/7 */}
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
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    ></path>
                  </svg>
                </div>
                <h3 className={`text-xl font-bold text-gray-900 mb-3 transition-all duration-700 ${
                  visibleSections.benefits[0]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                } delay-300`}>
                  {t("chatbotPage.benefits.phoneService.title")}
                </h3>
                <p className={`text-gray-600 transition-all duration-700 ${
                  visibleSections.benefits[0]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                } delay-500`}>
                  {t("chatbotPage.benefits.phoneService.description")}
                </p>
              </div>

              {/* Beneficio 2 - Comunicación Multicanal */}
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
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    ></path>
                  </svg>
                </div>
                <h3 className={`text-xl font-bold text-gray-900 mb-3 transition-all duration-700 ${
                  visibleSections.benefits[1]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                } delay-500`}>
                  {t("chatbotPage.benefits.multichannel.title")}
                </h3>
                <p className={`text-gray-600 transition-all duration-700 ${
                  visibleSections.benefits[1]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                } delay-700`}>
                  {t("chatbotPage.benefits.multichannel.description")}
                </p>
              </div>

              {/* Beneficio 3 - Colaboración entre Agentes */}
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    ></path>
                  </svg>
                </div>
                <h3 className={`text-xl font-bold text-gray-900 mb-3 transition-all duration-700 ${
                  visibleSections.benefits[2]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                } delay-700`}>
                  {t("chatbotPage.benefits.teamwork.title")}
                </h3>
                <p className={`text-gray-600 transition-all duration-700 ${
                  visibleSections.benefits[2]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                } delay-900`}>
                  {t("chatbotPage.benefits.teamwork.description")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Características avanzadas de los Agentes */}
        <section className="py-20 bg-gray-50">
          <div className="container-limited">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {t("chatbotPage.features.title")}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t("chatbotPage.features.subtitle")}
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
                      {t("chatbotPage.features.multilingual.title")}
                    </h3>
                    <p className={`mt-2 text-gray-600 transition-all duration-700 ${
                      visibleSections.featuresList[0]
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    } delay-500`}>
                      {t("chatbotPage.features.multilingual.description")}
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
                      {t("chatbotPage.features.maintenanceCoordination.title")}
                    </h3>
                    <p className={`mt-2 text-gray-600 transition-all duration-700 ${
                      visibleSections.featuresList[1]
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    } delay-700`}>
                      {t("chatbotPage.features.maintenanceCoordination.description")}
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
                      {t("chatbotPage.features.intelligentEscalation.title")}
                    </h3>
                    <p className={`mt-2 text-gray-600 transition-all duration-700 ${
                      visibleSections.featuresList[2]
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    } delay-900`}>
                      {t("chatbotPage.features.intelligentEscalation.description")}
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
                      {t("chatbotPage.features.personalizedRecommendations.title")}
                    </h3>
                    <p className={`mt-2 text-gray-600 transition-all duration-700 ${
                      visibleSections.featuresList[3]
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    } delay-1000`}>
                      {t("chatbotPage.features.personalizedRecommendations.description")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Imagen del agente */}
              <div 
                ref={featuresRef}
                className={`relative flex items-center justify-center transition-all duration-1000 ease-out ${
                  visibleSections.features
                    ? 'opacity-100 translate-x-0 scale-100'
                    : 'opacity-0 translate-x-8 scale-95'
                }`}
              >
                <div className="w-3/4 max-w-md mx-auto aspect-square bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Helper robot con teléfono representando los agentes de IA */}
                  <img
                    src="/imagenes/link_registro.jpg"
                    alt={t("chatbotPage.hero.title")}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "https://via.placeholder.com/400x400?text=AI+Agents";
                    }}
                  />
                </div>

                {/* Elementos decorativos */}
                <div className="absolute -right-3 -bottom-3 w-16 h-16 bg-primary-500/20 rounded-full blur-xl"></div>
                <div className="absolute -left-6 -top-6 w-20 h-20 bg-yellow-500/20 rounded-full blur-xl"></div>

                {/* Elemento flotante con estadística de eficiencia */}
                <div
                  className={`absolute -bottom-6 -right-6 bg-white rounded-lg shadow-xl p-3 w-56 transform rotate-3 animate-float transition-all duration-1000 ${
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
                        {t("chatbotPage.features.responseTime.title")}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {t("chatbotPage.features.responseTime.value")}
                      </p>
                      <p className="text-xs text-gray-500">
                        {t("chatbotPage.features.responseTime.description")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Demo Section - Caso práctico */}
        <section className="py-20 bg-white">
          <div className="container-limited">
            <div className="flex flex-col lg:flex-row items-center">
              <div 
                ref={demoRef}
                className={`lg:w-1/2 mb-10 lg:mb-0 transition-all duration-1000 ease-out ${
                  visibleSections.demo
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-8'
                }`}
              >
                <span className={`inline-block px-4 py-1 bg-primary-100 text-primary-600 rounded-full text-sm font-medium mb-4 transition-all duration-700 ${
                  visibleSections.demo
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-90'
                } delay-200`}>
                  {t("chatbotPage.demo.subtitle")}
                </span>
                <h2 className={`text-3xl sm:text-4xl font-bold text-gray-900 mb-6 transition-all duration-700 ${
                  visibleSections.demo
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                } delay-300`}>
                  {t("chatbotPage.demo.title")}
                </h2>
                <p className={`text-lg text-gray-600 mb-8 transition-all duration-700 ${
                  visibleSections.demo
                    ? 'opacity-100 translate-y-0'
                    : 'opacity-0 translate-y-4'
                } delay-500`}>
                  {t("chatbotPage.demo.description")}
                </p>
                <ul className="space-y-4">
                  <li className={`flex items-start transition-all duration-700 ${
                    visibleSections.demo
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-4'
                  } delay-700`}>
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-primary-600 font-bold text-sm">1</span>
                    </div>
                    <span className="text-gray-600">
                      <strong>{t("chatbotPage.demo.steps.step1.title")}</strong> "{t("chatbotPage.demo.steps.step1.description")}"
                    </span>
                  </li>
                  <li className={`flex items-start transition-all duration-700 ${
                    visibleSections.demo
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-4'
                  } delay-900`}>
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-primary-600 font-bold text-sm">2</span>
                    </div>
                    <span className="text-gray-600">
                      <strong>{t("chatbotPage.demo.steps.step2.title")}</strong> {t("chatbotPage.demo.steps.step2.description")}
                    </span>
                  </li>
                  <li className={`flex items-start transition-all duration-700 ${
                    visibleSections.demo
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-4'
                  } delay-1000`}>
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-primary-600 font-bold text-sm">3</span>
                    </div>
                    <span className="text-gray-600">
                      <strong>{t("chatbotPage.demo.steps.step3.title")}</strong> {t("chatbotPage.demo.steps.step3.description")}
                    </span>
                  </li>
                  <li className={`flex items-start transition-all duration-700 ${
                    visibleSections.demo
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-4'
                  } delay-1100`}>
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                      <span className="text-primary-600 font-bold text-sm">4</span>
                    </div>
                    <span className="text-gray-600">
                      <strong>{t("chatbotPage.demo.steps.step4.title")}</strong> "{t("chatbotPage.demo.steps.step4.description")}"
                    </span>
                  </li>
                </ul>
              </div>
              <div className={`lg:w-1/2 lg:pl-16 transition-all duration-1000 ease-out ${
                visibleSections.demo
                  ? 'opacity-100 translate-x-0 scale-100'
                  : 'opacity-0 translate-x-8 scale-95'
              } delay-400`}>
                {/* Visualización del flujo de trabajo */}
                <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-primary-50 to-gray-50 rounded-xl shadow-lg overflow-hidden p-8">
                  <div className="w-full h-full flex flex-col items-center justify-center">
                    <div className="grid grid-cols-2 gap-6 w-full max-w-sm">
                      {/* Huésped */}
                      <div className="text-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600">{t("chatbotPage.demo.workflow.guest")}</p>
                      </div>
                      
                      {/* Agente IA */}
                      <div className="text-center">
                        <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600">{t("chatbotPage.demo.workflow.aiAgent")}</p>
                      </div>
                      
                      {/* WhatsApp */}
                      <div className="text-center">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600">{t("chatbotPage.demo.workflow.whatsapp")}</p>
                      </div>
                      
                      {/* Fontanero */}
                      <div className="text-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                          <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"></path>
                          </svg>
                        </div>
                        <p className="text-sm text-gray-600">{t("chatbotPage.demo.workflow.plumber")}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-500 font-medium">{t("chatbotPage.demo.workflow.coordination")}</p>
                      <p className="text-xs text-gray-400 mt-1">{t("chatbotPage.demo.workflow.resolution")}</p>
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
      </main>

      {/* Footer compartido */}
      <Footer />
    </div>
  );
};

export default ChatbotPage;
