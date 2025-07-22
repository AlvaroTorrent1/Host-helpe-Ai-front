import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import MobileMenu from "@shared/components/MobileMenu";
import LanguageSelector from "@shared/components/LanguageSelector";
import CalendlyLink from "@shared/components/CalendlyLink";
import Footer from "@shared/components/Footer";
import { useTranslation } from "react-i18next";



const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language as 'es' | 'en';

  // Configuración de videos según idioma
  const videoConfig: Record<'es' | 'en', { videoId: string; thumbnail: string }> = {
    es: {
      videoId: "MX8ypfuCieU",
      thumbnail: "https://img.youtube.com/vi/MX8ypfuCieU/maxresdefault.jpg"
    },
    en: {
      videoId: "plXI2I-vaxo", 
      thumbnail: "https://img.youtube.com/vi/plXI2I-vaxo/maxresdefault.jpg"
    }
  };

  // Obtener configuración del video actual basada en el idioma
  const currentVideo = videoConfig[language] || videoConfig.es;

  // Estado para controlar las animaciones de scroll
  // Expandido para incluir las 3 tarjetas de características
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>([false, false, false]);
  const [visibleFeatures, setVisibleFeatures] = useState<boolean[]>([false, false, false]);
  
  // Estado para controlar si el video está reproduciéndose
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // Estado para controlar el video promocional entre secciones
  const [isPromoVideoPlaying, setIsPromoVideoPlaying] = useState(false);
  
  // Referencias para los pasos
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  // Referencias para las tarjetas de características
  const feature1Ref = useRef<HTMLDivElement>(null);
  const feature2Ref = useRef<HTMLDivElement>(null);
  const feature3Ref = useRef<HTMLDivElement>(null);

  // Navigation links configuration
  const navLinks = [
    { text: t("nav.features"), href: "#features" },
    { text: t("nav.pricing"), href: "/pricing" },
    { text: t("nav.testimonials"), href: "/testimonios" },
    { text: t("nav.login"), href: "/login", isButton: true },
  ];

  // Intersection Observer para animaciones de scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.3, // Se activa cuando el 30% del elemento es visible
      rootMargin: "-50px 0px", // Margen para ajustar cuándo se activa
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Manejar pasos de "Cómo funciona"
          const stepRefs = [step1Ref, step2Ref, step3Ref];
          const stepIndex = stepRefs.findIndex(ref => ref.current === entry.target);
          
          if (stepIndex !== -1) {
            setVisibleSteps(prev => {
              const newVisible = [...prev];
              newVisible[stepIndex] = true;
              return newVisible;
            });
          }

          // Manejar tarjetas de características
          const featureRefs = [feature1Ref, feature2Ref, feature3Ref];
          const featureIndex = featureRefs.findIndex(ref => ref.current === entry.target);
          
          if (featureIndex !== -1) {
            setVisibleFeatures(prev => {
              const newVisible = [...prev];
              newVisible[featureIndex] = true;
              return newVisible;
            });
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observar cada paso y cada tarjeta de características
    const allRefs = [step1Ref, step2Ref, step3Ref, feature1Ref, feature2Ref, feature3Ref];
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

  // Ejemplo de uso directo de logEvent con importación dinámica
  const handleHeroInteraction = () => {
    // Activar el video al hacer clic
    setIsVideoPlaying(true);
    
    // Analytics
    import('@services/analytics').then(async ({ logEvent }) => {
      try {
        await logEvent('Landing', 'Hero Video Play', 'User clicked to play demo video');
      } catch (error) {
        console.error('Error al registrar evento:', error);
      }
    }).catch(error => {
      console.error('Error al importar servicio de analytics:', error);
    });
  };

  // Función para manejar clic en video promocional
  const handlePromoVideoClick = () => {
    // Activar el video promocional al hacer clic
    setIsPromoVideoPlaying(true);
    
    // Analytics
    import('@services/analytics').then(async ({ logEvent }) => {
      try {
        await logEvent('Landing', 'Promo Video Play', 'User clicked to play promotional video');
      } catch (error) {
        console.error('Error al registrar evento:', error);
      }
    }).catch(error => {
      console.error('Error al importar servicio de analytics:', error);
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm w-full">
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
        {/* Hero Section */}
        <section className="relative py-6 md:py-8 bg-gradient-to-r from-[#ECA408] to-[#F5B730] overflow-hidden w-full">
          {/* Circuitos animados en el fondo */}
          <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <style>
              {`
                @keyframes circuitPulse {
                  0%, 70%, 100% { 
                    opacity: 0;
                    stroke-dasharray: 0, 1000;
                  }
                  10%, 60% { 
                    opacity: 0.4;
                    stroke-dasharray: 1000, 0;
                  }
                }
                @keyframes nodePulse {
                  0%, 70%, 100% { 
                    opacity: 0;
                    transform: scale(0);
                  }
                  15%, 55% { 
                    opacity: 0.6;
                    transform: scale(1);
                  }
                }
                .circuit-line-1 { animation: circuitPulse 12s infinite; }
                .circuit-line-2 { animation: circuitPulse 12s infinite 1s; }
                .circuit-line-3 { animation: circuitPulse 12s infinite 2s; }
                .circuit-line-4 { animation: circuitPulse 12s infinite 0.5s; }
                .circuit-line-5 { animation: circuitPulse 12s infinite 1.5s; }
                .circuit-node-1 { animation: nodePulse 12s infinite 0.3s; }
                .circuit-node-2 { animation: nodePulse 12s infinite 1.3s; }
                .circuit-node-3 { animation: nodePulse 12s infinite 2.3s; }
                .circuit-node-4 { animation: nodePulse 12s infinite 0.8s; }
              `}
            </style>
            <svg
              className="w-full h-full"
              viewBox="0 0 1200 400"
              preserveAspectRatio="xMidYMid slice"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Línea principal horizontal superior */}
              <path
                className="circuit-line-1"
                d="M 100 80 L 300 80 L 320 100 L 500 100 L 520 80 L 800 80 L 820 100 L 1100 100"
                fill="none"
                stroke="#F4D03F"
                strokeWidth="2"
                opacity="0"
              />
              
              {/* Bifurcación vertical izquierda */}
              <path
                className="circuit-line-2"
                d="M 300 80 L 300 150 L 280 170 L 280 220 L 300 240 L 400 240"
                fill="none"
                stroke="#F7DC6F"
                strokeWidth="1.5"
                opacity="0"
              />
              
              {/* Línea diagonal central */}
              <path
                className="circuit-line-3"
                d="M 500 100 L 520 120 L 580 120 L 600 140 L 600 200 L 620 220 L 700 220"
                fill="none"
                stroke="#FCF3CF"
                strokeWidth="2"
                opacity="0"
              />
              
              {/* Circuito inferior derecho */}
              <path
                className="circuit-line-4"
                d="M 800 80 L 800 160 L 780 180 L 780 280 L 800 300 L 900 300 L 920 280 L 1000 280"
                fill="none"
                stroke="#F4D03F"
                strokeWidth="1.5"
                opacity="0"
              />
              
              {/* Línea horizontal inferior */}
              <path
                className="circuit-line-5"
                d="M 200 320 L 400 320 L 420 300 L 600 300 L 620 320 L 900 320"
                fill="none"
                stroke="#F7DC6F"
                strokeWidth="2"
                opacity="0"
              />
              
              {/* Nodos de conexión */}
              <circle
                className="circuit-node-1"
                cx="300"
                cy="80"
                r="4"
                fill="#F4D03F"
                opacity="0"
              />
              <circle
                className="circuit-node-2"
                cx="520"
                cy="100"
                r="3"
                fill="#FCF3CF"
                opacity="0"
              />
              <circle
                className="circuit-node-3"
                cx="800"
                cy="80"
                r="4"
                fill="#F7DC6F"
                opacity="0"
              />
              <circle
                className="circuit-node-4"
                cx="600"
                cy="200"
                r="3"
                fill="#F4D03F"
                opacity="0"
              />
              
              {/* Pequeños rectángulos que simulan componentes */}
              <rect
                className="circuit-node-1"
                x="296"
                y="236"
                width="8"
                height="8"
                fill="#F4D03F"
                opacity="0"
              />
              <rect
                className="circuit-node-3"
                x="916"
                y="276"
                width="8"
                height="8"
                fill="#FCF3CF"
                opacity="0"
              />
            </svg>
          </div>
          
          <div className="container-limited relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                  {t("landing.hero.title")}
                </h1>
                <p className="text-lg sm:text-xl text-white opacity-90 mb-8">
                  {t("landing.hero.subtitle")}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                  <CalendlyLink />
                  <Link
                    to="/pricing"
                    className="inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-white text-primary-600 font-medium rounded-md hover:bg-gray-100 transition-colors shadow-md hover:shadow-lg text-center w-full sm:w-auto"
                  >
                    {t("landing.hero.cta")}
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2">
                <div
                  className="group relative mx-auto overflow-hidden shadow-xl cursor-pointer rounded-xl max-w-xs"
                  style={{ aspectRatio: "9/16" }}
                  onClick={handleHeroInteraction}
                >
                  <style>
                    {`
                    @keyframes floating {
                      0% { transform: translateY(0) scale(1); }
                      25% { transform: translateY(-10px) scale(1.02); }
                      50% { transform: translateY(-5px) scale(1); }
                      75% { transform: translateY(-15px) scale(1.02); }
                      100% { transform: translateY(0) scale(1); }
                    }
                    `}
                  </style>
                  
                  {!isVideoPlaying ? (
                    // Imagen miniatura con botón de play personalizado
                    <div className="relative w-full h-full">
                      <img
                        src={currentVideo.thumbnail}
                        alt="Host Helper AI Demo - Click para reproducir"
                        className="w-full h-full object-cover transition-all duration-700 ease-in-out will-change-transform group-hover:scale-105"
                        style={{
                          animation: "floating 4s ease-in-out infinite",
                          aspectRatio: "9/16",
                        }}
                      />
                      {/* Overlay con botón de play personalizado */}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/30 transition-all duration-300">
                        <div className="bg-white/90 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                          <svg 
                            className="w-6 h-6 text-primary-600 ml-0.5" 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Video de YouTube cuando está activado
                    <iframe
                      src={`https://www.youtube.com/embed/${currentVideo.videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0`}
                      className="w-full h-full"
                      style={{
                        aspectRatio: "9/16",
                      }}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      title="Host Helper AI Demo Video"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Background design elements - Técnica defensiva multi-capa */}
          {/* Elemento de respaldo para eliminar gaps de sub-pixel */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-white"></div>
          
          {/* Elemento principal con ángulo (preservando diseño original) */}
          <div
            className="absolute bottom-0 left-0 right-0 h-24 bg-white"
            style={{ 
              clipPath: "polygon(0 100%, 100% 100%, 100% 0)",
              transform: "translateY(1px)" 
            }}
          ></div>
          
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white opacity-5 rounded-full transform translate-x-1/4 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-white opacity-5 rounded-full transform -translate-x-1/4 translate-y-1/4"></div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-20 bg-white w-full">
          <div className="container-limited">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
                {t("landing.features.title")}
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                {t("landing.features.subtitle")}
              </p>
            </div>

            <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-x-visible scrollbar-hide px-4 md:px-0 mobile-carousel">
              {/* Primera tarjeta de características - Agentes IA 24/7 */}
              <div 
                ref={feature1Ref}
                className={`bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-1000 ease-out w-[calc(100vw-2rem)] md:w-auto mobile-carousel-item flex-shrink-0 ${
                  visibleFeatures[0] 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                }`}
              >
                <div className="mb-4">
                  <div className={`w-52 h-52 mx-auto overflow-hidden relative transition-all duration-700 delay-200 ${
                    visibleFeatures[0] 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-90'
                  }`}>
                    <div className="absolute inset-0 bg-primary-500/10 mix-blend-overlay"></div>
                    <img
                      src="/imagenes/helpy_phone.png"
                      alt="Agentes IA 24/7"
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
                <div className="group">
                  <h3 className={`text-xl font-bold mb-2 text-gray-900 group-hover:text-primary-600 transition-all duration-700 delay-400 ${
                    visibleFeatures[0] 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 -translate-x-4'
                  }`}>
                    <Link
                      to="/chatbot"
                      className="text-gray-900 hover:text-primary-600 transition-colors inline-flex items-center"
                    >
                      {t("landing.features.chatbot")}
                      <svg
                        className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </Link>
                  </h3>
                </div>
                <p className={`text-gray-600 mb-4 transition-all duration-700 delay-600 ${
                  visibleFeatures[0] 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-4'
                }`}>
                  {t("landing.features.chatbotDesc")}
                </p>
              </div>

              {/* Segunda tarjeta de características - Check-in automatizado */}
              <div 
                ref={feature2Ref}
                className={`bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-1000 ease-out delay-200 w-[calc(100vw-2rem)] md:w-auto mobile-carousel-item flex-shrink-0 ${
                  visibleFeatures[1] 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                }`}
              >
                <div className="mb-4">
                  <div className={`w-52 h-52 mx-auto overflow-hidden relative transition-all duration-700 delay-400 ${
                    visibleFeatures[1] 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-90'
                  }`}>
                    <div className="absolute inset-0 bg-primary-500/10 mix-blend-overlay"></div>
                    <img
                      src="/imagenes/seshospedajes.png"
                      alt="Check-in automatizado"
                      className="w-full h-full object-contain transform hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
                <div className="group">
                  <h3 className={`text-xl font-bold mb-2 text-gray-900 group-hover:text-primary-600 transition-all duration-700 delay-600 ${
                    visibleFeatures[1] 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 -translate-x-4'
                  }`}>
                    <Link
                      to="/check-in"
                      className="text-gray-900 hover:text-primary-600 transition-colors inline-flex items-center"
                    >
                      {t("landing.features.checkIn")}
                      <svg
                        className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </Link>
                  </h3>
                </div>
                <p className={`text-gray-600 mb-4 transition-all duration-700 delay-800 ${
                  visibleFeatures[1] 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-4'
                }`}>
                  {t("landing.features.checkInDesc")}
                </p>
              </div>

              {/* Tercera tarjeta de características - Upselling inteligente */}
              <div 
                ref={feature3Ref}
                className={`bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-1000 ease-out delay-400 w-[calc(100vw-2rem)] md:w-auto mobile-carousel-item flex-shrink-0 ${
                  visibleFeatures[2] 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                }`}
              >
                <div className="mb-4">
                  <div className={`w-52 h-52 mx-auto overflow-hidden relative transition-all duration-700 delay-600 ${
                    visibleFeatures[2] 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-90'
                  }`}>
                    <div className="absolute inset-0 bg-primary-500/10 mix-blend-overlay"></div>
                    <img
                      src="/imagenes/comisions.jpg"
                      alt="Upselling inteligente"
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
                <div className="group">
                  <h3 className={`text-xl font-bold mb-2 text-gray-900 group-hover:text-primary-600 transition-all duration-700 delay-800 ${
                    visibleFeatures[2] 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 -translate-x-4'
                  }`}>
                    <Link
                      to="/upselling"
                      className="text-gray-900 hover:text-primary-600 transition-colors inline-flex items-center"
                    >
                      {t("landing.features.upselling")}
                      <svg
                        className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </Link>
                  </h3>
                </div>
                <p className={`text-gray-600 mb-4 transition-all duration-700 delay-1000 ${
                  visibleFeatures[2] 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-4'
                }`}>
                  {t("landing.features.upsellingDesc")}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Video Promocional */}
        <section className="py-16 bg-gray-50">
          <div className="container-limited">
            <div className="text-center mb-12">
              <h2 
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                dangerouslySetInnerHTML={{
                  __html: t("landing.promoVideo.title").replace('Host Helper Ai', (match) => 
                    match.replace('Ai', `<span style="color: #ECA404;">Ai</span>`)
                  )
                }}
              />
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t("landing.promoVideo.subtitle")}
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div 
                className="relative w-full cursor-pointer group"
                onClick={handlePromoVideoClick}
              >
                {!isPromoVideoPlaying ? (
                  // Imagen miniatura con botón de play personalizado
                  <div className="relative w-full h-full">
                    <img
                      src="https://img.youtube.com/vi/m7SL2_w5yP0/maxresdefault.jpg"
                      alt="Host Helper AI - Video promocional"
                      className="w-full h-full object-cover rounded-2xl shadow-2xl transition-all duration-700 ease-in-out group-hover:scale-[1.02]"
                      style={{
                        aspectRatio: "16/9",
                      }}
                    />
                    {/* Overlay con botón de play personalizado */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-all duration-300 rounded-2xl">
                      <div className="bg-white/95 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg 
                          className="w-6 h-6 text-primary-600 ml-0.5" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Video de YouTube cuando está activado
                  <iframe
                    src="https://www.youtube.com/embed/m7SL2_w5yP0?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0"
                    className="w-full h-full rounded-2xl shadow-2xl"
                    style={{
                      aspectRatio: "16/9",
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Host Helper AI - Video Promocional"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-white" id="how-it-works">
          <div className="container-limited">
            <div className="text-center mb-16">
              <h2 
                className="text-3xl md:text-4xl font-bold text-gray-900 mb-4"
                dangerouslySetInnerHTML={{
                  __html: t("landing.howItWorks.title").replace('Host Helper Ai', (match) => 
                    match.replace('Ai', `<span style="color: #ECA404;">Ai</span>`)
                  )
                }}
              />
            </div>

            {/* Paso 1 */}
            <div 
              ref={step1Ref}
              className={`flex flex-col md:flex-row items-center mb-16 transition-all duration-1000 ease-out ${
                visibleSteps[0] 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl font-semibold mr-4 transition-all duration-700 delay-200 ${
                    visibleSteps[0] 
                      ? 'scale-100 rotate-0' 
                      : 'scale-0 -rotate-45'
                  }`}>
                    1
                  </div>
                  <h3 className={`text-2xl font-bold text-gray-900 transition-all duration-700 delay-300 ${
                    visibleSteps[0] 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 -translate-x-4'
                  }`}>
                    {t("landing.howItWorks.step1.title")}
                  </h3>
                </div>
                <p className={`text-gray-600 mb-4 transition-all duration-700 delay-500 ${
                  visibleSteps[0] 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-4'
                }`}>
                  {t("landing.howItWorks.step1.description")}
                </p>
              </div>
              <div className="md:w-1/2">
                <div
                  className={`group relative w-5/6 h-64 mx-auto overflow-hidden shadow-xl transition-all duration-1000 delay-400 ${
                    visibleSteps[0] 
                      ? 'opacity-100 translate-x-0 scale-100' 
                      : 'opacity-0 translate-x-8 scale-95'
                  }`}
                  style={{
                    clipPath:
                      "polygon(0% 0%, 100% 0%, 95% 85%, 90% 100%, 0% 100%)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-transparent z-10"></div>
                  <img
                    src="/imagenes/CasaMarbella.png"
                    alt="Registro y añadir propiedad"
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute -bottom-10 left-0 w-32 h-32 bg-primary-600 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-all duration-500"></div>
                </div>
              </div>
            </div>

            {/* Paso 2 */}
            <div 
              ref={step2Ref}
              className={`flex flex-col md:flex-row-reverse items-center mb-16 transition-all duration-1000 ease-out ${
                visibleSteps[1] 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="md:w-1/2 mb-8 md:mb-0 md:pl-8">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl font-semibold mr-4 transition-all duration-700 delay-200 ${
                    visibleSteps[1] 
                      ? 'scale-100 rotate-0' 
                      : 'scale-0 -rotate-45'
                  }`}>
                    2
                  </div>
                  <h3 className={`text-2xl font-bold text-gray-900 transition-all duration-700 delay-300 ${
                    visibleSteps[1] 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 translate-x-4'
                  }`}>
                    {t("landing.howItWorks.step2.title")}
                  </h3>
                </div>
                <p className={`text-gray-600 mb-4 transition-all duration-700 delay-500 ${
                  visibleSteps[1] 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 translate-x-4'
                }`}>
                  {t("landing.howItWorks.step2.description")}
                </p>
              </div>
              <div className="md:w-1/2">
                <div
                  className={`group relative w-5/6 h-64 mx-auto overflow-hidden shadow-xl transition-all duration-1000 delay-400 ${
                    visibleSteps[1] 
                      ? 'opacity-100 translate-x-0 scale-100' 
                      : 'opacity-0 -translate-x-8 scale-95'
                  }`}
                  style={{
                    clipPath:
                      "polygon(0% 0%, 100% 0%, 95% 85%, 90% 100%, 0% 100%)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-bl from-primary-600/30 to-transparent z-10"></div>
                  <img
                    src="/imagenes/Helpy_checklist.jpeg"
                    alt="Configuración de Agentes de IA"
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute -bottom-10 left-0 w-32 h-32 bg-primary-600 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-all duration-500"></div>
                </div>
              </div>
            </div>

            {/* Paso 3 */}
            <div 
              ref={step3Ref}
              className={`flex flex-col md:flex-row items-center transition-all duration-1000 ease-out ${
                visibleSteps[2] 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <div className="flex items-center mb-4">
                  <div className={`w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl font-semibold mr-4 transition-all duration-700 delay-200 ${
                    visibleSteps[2] 
                      ? 'scale-100 rotate-0' 
                      : 'scale-0 -rotate-45'
                  }`}>
                    3
                  </div>
                  <h3 className={`text-2xl font-bold text-gray-900 transition-all duration-700 delay-300 ${
                    visibleSteps[2] 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 -translate-x-4'
                  }`}>
                    {t("landing.howItWorks.step3.title")}
                  </h3>
                </div>
                <p className={`text-gray-600 mb-4 transition-all duration-700 delay-500 ${
                  visibleSteps[2] 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-4'
                }`}>
                  {t("landing.howItWorks.step3.description")}
                </p>
              </div>
              <div className="md:w-1/2">
                <div
                  className={`group relative w-5/6 h-64 mx-auto overflow-hidden shadow-xl transition-all duration-1000 delay-400 ${
                    visibleSteps[2] 
                      ? 'opacity-100 translate-x-0 scale-100' 
                      : 'opacity-0 translate-x-8 scale-95'
                  }`}
                  style={{
                    clipPath:
                      "polygon(0% 0%, 100% 0%, 95% 85%, 90% 100%, 0% 100%)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-transparent z-10"></div>
                  <img
                    src="/imagenes/turist_phone.jpg"
                    alt="Compartir enlace con huéspedes"
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute -bottom-10 right-0 w-32 h-32 bg-primary-600 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-all duration-500"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ElevenLabs Convai Widget */}
        <section className="py-8 bg-white">
          <div className="container-limited">
            <div dangerouslySetInnerHTML={{ 
              __html: '<elevenlabs-convai agent-id="NWSYeahhc7b5XrxzO7eU"></elevenlabs-convai>' 
            }} />
          </div>
        </section>
      </main>

      {/* Footer compartido */}
      <Footer />
    </div>
  );
};

export default LandingPage;
