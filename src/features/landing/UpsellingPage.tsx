import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MobileMenu from "@shared/components/MobileMenu";
import LanguageSelector from "@shared/components/LanguageSelector";
import Footer from "@shared/components/Footer";
import { useTranslation } from "react-i18next";

const UpsellingPage = () => {
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
    featuresList: [false, false, false, false]
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
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observar todos los elementos
    const allRefs = [
      benefit1Ref, benefit2Ref, benefit3Ref,
      featuresRef,
      feature1Ref, feature2Ref, feature3Ref, feature4Ref
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

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{t("upsellingPage.meta.title")}</title>
        <meta
          name="description"
          content={t("upsellingPage.meta.description")}
        />
      </Helmet>

      {/* Header - Same as LandingPage */}
      <header className="bg-white shadow-sm w-full sticky top-0 z-50">
        <div className="container-limited py-4 flex justify-between items-center">
          <div onClick={handleLogoClick} className="flex items-center cursor-pointer">
            <img
              src="/imagenes/Logo_hosthelper_new.png"
              alt="Host Helper AI Logo"
              className="h-20 sm:h-36 responsive-img"
            />
          </div>

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
        {/* Beneficios principales */}
        <section className="py-20 bg-white">
          <div className="container-limited">
            <div className="text-center mb-16">
              <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                {t("upsellingPage.hero.title")}
              </h1>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {t("upsellingPage.hero.subtitle")}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t("upsellingPage.hero.description")}
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
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    ></path>
                  </svg>
                </div>
                <h3 className={`text-xl font-bold text-gray-900 mb-3 transition-all duration-700 ${
                  visibleSections.benefits[0]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                } delay-300`}>
                  {t("upsellingPage.benefits.passiveIncome.title")}
                </h3>
                <p className={`text-gray-600 transition-all duration-700 ${
                  visibleSections.benefits[0]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                } delay-500`}>
                  {t("upsellingPage.benefits.passiveIncome.description")}
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
                      d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                    ></path>
                  </svg>
                </div>
                <h3 className={`text-xl font-bold text-gray-900 mb-3 transition-all duration-700 ${
                  visibleSections.benefits[1]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                } delay-500`}>
                  {t("upsellingPage.benefits.betterExperience.title")}
                </h3>
                <p className={`text-gray-600 transition-all duration-700 ${
                  visibleSections.benefits[1]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                } delay-700`}>
                  {t("upsellingPage.benefits.betterExperience.description")}
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
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    ></path>
                  </svg>
                </div>
                <h3 className={`text-xl font-bold text-gray-900 mb-3 transition-all duration-700 ${
                  visibleSections.benefits[2]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                } delay-700`}>
                  {t("upsellingPage.benefits.totalControl.title")}
                </h3>
                <p className={`text-gray-600 transition-all duration-700 ${
                  visibleSections.benefits[2]
                    ? 'opacity-100 translate-x-0'
                    : 'opacity-0 -translate-x-4'
                } delay-900`}>
                  {t("upsellingPage.benefits.totalControl.description")}
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
                {t("upsellingPage.features.subtitle")}
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                {t("upsellingPage.features.title")}
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t("upsellingPage.features.description")}
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
                      {t("upsellingPage.features.utmLinks.title")}
                    </h3>
                    <p className={`mt-2 text-gray-600 transition-all duration-700 ${
                      visibleSections.featuresList[0]
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    } delay-500`}>
                      {t("upsellingPage.features.utmLinks.description")}
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
                      {t("upsellingPage.features.smartRecommendations.title")}
                    </h3>
                    <p className={`mt-2 text-gray-600 transition-all duration-700 ${
                      visibleSections.featuresList[1]
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    } delay-700`}>
                      {t(
                        "upsellingPage.features.smartRecommendations.description",
                      )}
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
                      {t("upsellingPage.features.localIntegration.title")}
                    </h3>
                    <p className={`mt-2 text-gray-600 transition-all duration-700 ${
                      visibleSections.featuresList[2]
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    } delay-900`}>
                      {t("upsellingPage.features.localIntegration.description")}
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
                      {t("upsellingPage.features.dashboard.title")}
                    </h3>
                    <p className={`mt-2 text-gray-600 transition-all duration-700 ${
                      visibleSections.featuresList[3]
                        ? 'opacity-100 translate-y-0'
                        : 'opacity-0 translate-y-4'
                    } delay-1000`}>
                      {t("upsellingPage.features.dashboard.description")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Imagen o animación */}
              <div 
                ref={featuresRef}
                className={`relative flex items-center justify-center transition-all duration-1000 ease-out ${
                  visibleSections.features
                    ? 'opacity-100 translate-x-0 scale-100'
                    : 'opacity-0 translate-x-8 scale-95'
                }`}
              >
                <div className="w-3/5 max-w-md mx-auto aspect-[3/4] bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Imagen del sistema de upselling con formato vertical - Aumentada 45% total */}
                  <img
                    src="/imagenes/comisions.jpg"
                    alt="Características del sistema de upselling"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "https://via.placeholder.com/335x450?text=Upselling+y+Comisiones";
                    }}
                  />
                </div>

                {/* Elementos decorativos - Ajustados para imagen aumentada 45% total */}
                <div className="absolute -right-4 -bottom-4 w-18 h-18 bg-primary-500/20 rounded-full blur-xl"></div>
                <div className="absolute -left-5 -top-5 w-22 h-22 bg-yellow-500/20 rounded-full blur-xl"></div>

                {/* Elemento flotante con un dato estadístico - Ajustado para imagen más grande */}
                <div
                  className={`absolute -bottom-5 -right-5 bg-white rounded-lg shadow-xl p-4 w-56 transform rotate-2 animate-float transition-all duration-1000 ${
                    visibleSections.features
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-8 scale-90'
                  } delay-500`}
                  style={{ animationDuration: "5s" }}
                >
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0">
                      <svg
                        className="w-6 h-6 text-primary-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-gray-500">
                        {t("upsellingPage.features.incomeIncrease.title")}
                      </p>
                      <p className="text-lg font-bold text-gray-900">
                        {t("upsellingPage.features.incomeIncrease.value")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {t("upsellingPage.features.incomeIncrease.description")}
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

      </main>

      {/* Footer compartido */}
      <Footer />
    </div>
  );
};

export default UpsellingPage;
