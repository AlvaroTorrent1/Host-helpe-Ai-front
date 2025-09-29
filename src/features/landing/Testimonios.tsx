// File: src/features/landing/Testimonios.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import LandingHeader from "@shared/components/LandingHeader";
import Footer from "@shared/components/Footer";
import AnimatedBackground from "@shared/components/AnimatedBackground";
import { useTranslation } from "react-i18next";

const Testimonios = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Animation states
  const [pageHeaderVisible, setPageHeaderVisible] = useState(false);
  const [mediaHeaderVisible, setMediaHeaderVisible] = useState(false);
  const [mediaCarouselVisible, setMediaCarouselVisible] = useState(false);
  const [featuredHeaderVisible, setFeaturedHeaderVisible] = useState(false);
  const [featuredTestimonials, setFeaturedTestimonials] = useState([false, false, false]);

  // Refs for Intersection Observer
  const pageHeaderRef = useRef(null);
  const mediaHeaderRef = useRef(null);
  const mediaCarouselRef = useRef(null);
  const featuredHeaderRef = useRef(null);
  const featuredTestimonialRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Scroll to top on component mount
  useEffect(() => {
    // Enhanced scroll to top with multiple methods for reliability
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  // Enhanced scroll to top on route change
  useEffect(() => {
    const handleRouteChange = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    };
    
    handleRouteChange();
  }, [window.location.pathname]);

  // Intersection Observer setup
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: '-50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const target = entry.target;
          
          if (target === pageHeaderRef.current) {
            setPageHeaderVisible(true);
          }
          if (target === mediaHeaderRef.current) {
            setMediaHeaderVisible(true);
          }
          if (target === mediaCarouselRef.current) {
            setMediaCarouselVisible(true);
          }
          if (target === featuredHeaderRef.current) {
            setFeaturedHeaderVisible(true);
          }

          // Featured testimonials
          featuredTestimonialRefs.current.forEach((ref, index) => {
            if (target === ref) {
              setFeaturedTestimonials(prev => {
                const newState = [...prev];
                newState[index] = true;
                return newState;
              });
            }
          });
        }
      });
    }, observerOptions);

    // Observe all elements
    const elementsToObserve = [
      pageHeaderRef.current,
      mediaHeaderRef.current,
      mediaCarouselRef.current,
      featuredHeaderRef.current,
      ...featuredTestimonialRefs.current
    ].filter(Boolean) as Element[];

    elementsToObserve.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Media appearances data (primera noticia con imagen)
  const mediaAppearances = [
    {
      // Nueva pestaña solicitada: Premio Junior 23º (YouTube)
      // Mantener estructura y estilos existentes para mínima modificación
      id: 3,
      title: "Entrevista Premio Junior 23º",
      media: "Programa TV - Premio Junior",
      date: "2025",
      url: "https://www.youtube.com/watch?v=ZqPOuvY1WNA&t=12s",
      excerpt: "Participación de Host Helper AI en el 23º Premio Junior para Empresas.",
      author: "Premio Junior",
      image: "/imagenes/premio junior 23º.jpg",
      hasImage: true
    },
    {
      id: 1,
      title: "Host Helper AI, el asistente virtual que libera a los anfitriones del caos administrativo, se presenta en Alhambra Venture",
      media: "Alhambra Venture",
      date: "6 junio 2025",
      url: "https://alhambraventure.com/host-helper-ai-el-asistente-virtual-que-libera-a-los-anfitriones-del-caos-administrativo-se-presenta-en-alhambra-venture/",
      excerpt: "Startup andaluza presenta su asistente virtual de voz integrado con WhatsApp para gestores de alojamientos turísticos. Automatiza interacciones, mejora la experiencia del huésped y libera recursos clave.",
      author: "Alhambra Venture",
      image: "/imagenes/Host Helper Team (1).jpeg",
      hasImage: true
    },
    {
      id: 2,
      title: "La 'startup' malagueña Host Helper AI automatiza la atención al cliente de los apartamentos turísticos",
      media: "El Español Málaga",
      date: "31 marzo 2025",
      url: "https://www.elespanol.com/malaga/economia/tecnologia/20250331/startup-malaguena-host-helper-ai-automatiza-atencion-cliente-apartamentos-turisticos/927157458_0.html",
      excerpt: "Host Helper AI automatiza la atención al turista mediante un chatbot que optimiza el registro de huéspedes y resuelve consultas en varios idiomas.",
      author: "Demófilo Peláez",
      image: "/imagenes/Roll up.png",
      hasImage: true
    },
  ];

  // Navigation functions for carousel
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % mediaAppearances.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + mediaAppearances.length) % mediaAppearances.length);
  };

  // Navigation links configuration - now handled by LandingHeader

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: "Casa Rural El Pilar",
      image: "/imagenes/ELPILAR.jpg",
      description: t("testimonials.testimonial1.description"),
      testimonial: t("testimonials.testimonial1.text"),
      author: t("testimonials.testimonial1.author"),
      position: t("testimonials.testimonial1.position"),
      website: "https://www.casaruralelpilar.com/",
    },
    {
      id: 2,
      name: "Casa María Flora",
      image: "/imagenes/OjenSpain-scaled.jpeg",
      description: t("testimonials.testimonial2.description"),
      testimonial: t("testimonials.testimonial2.text"),
      author: t("testimonials.testimonial2.author"),
      position: t("testimonials.testimonial2.position"),
      website: "https://casa-maria-flora.com/",
    },
    {
      id: 3,
      name: "Hotel Platería",
      image: "/imagenes/Hotel plateria.png",
      description: t("testimonials.testimonial3.description"),
      testimonial: t("testimonials.testimonial3.text"),
      author: t("testimonials.testimonial3.author"),
      position: t("testimonials.testimonial3.position"),
      website: "https://booking.com/hotel/es/plateria.en.html?aid=311984;label=plateria-u6VTVmJODM99KTPrtpSm3wS442477547736:pl:ta:p1:p2:ac:ap:neg:fi:tikwd-12683080509:lp9197933:li:dec:dm:ppccp=UmFuZG9tSVYkc2RlIyh9YTQUGSsRwx9_3qo3uPTHyoo;ws=&gad_source=1&gad_campaignid=345388365&gbraid=0AAAAAD_Ls1Jx88C1asg6z3lYFUWDHMa5E&gclid=CjwKCAjwtrXFBhBiEiwAEKen13goyq_hFjOzuqItGj0oBixZdgDBXTIJcIlKmsUjyplVjPMFrK86CRoCgcUQAvD_BwE",
    },
  ];

  return (
    <div className="min-h-screen bg-white" style={{ 
      scrollBehavior: 'smooth',
      scrollPaddingTop: '0px',
      WebkitOverflowScrolling: 'touch'
    }}>
      {/* Header - Now using modular LandingHeader component */}
      <LandingHeader />

      <main>
        {/* Page Header with Animated Background */}
        <AnimatedBackground 
          className="py-16 w-full"
          particleCount={60}
          variant="hero"
          withBottomWhiteFade
        >
          <div className="container-limited">
            <div 
              ref={pageHeaderRef}
              className={`text-center transition-all duration-1000 ease-out ${
                pageHeaderVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                {t("testimonials.pageTitle")}
              </h1>
            </div>
          </div>
        </AnimatedBackground>

        {/* Media Appearances Carousel */}
        {/* Fondo blanco solicitado para Apariciones en Medios */}
        <section className="py-16 bg-white">
          <div className="container-limited">
            <div 
              ref={mediaHeaderRef}
              className={`text-center mb-12 transition-all duration-1000 ease-out ${
                mediaHeaderVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {t("testimonials.mediaSection.title")}
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t("testimonials.mediaSection.subtitle")}
              </p>
            </div>

            {/* Carousel Container */}
            <div 
              ref={mediaCarouselRef}
              className={`relative max-w-4xl mx-auto transition-all duration-1000 ease-out ${
                mediaCarouselVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
              style={{ 
                transitionDelay: mediaCarouselVisible ? '400ms' : '0ms'
              }}
            >
              <div className="overflow-hidden rounded-xl">
                <div 
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {mediaAppearances.map((article) => (
                    <div key={article.id} className="w-full flex-shrink-0 px-4">
                      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                        {/* Layout condicional: con imagen vs sin imagen */}
                        {article.hasImage ? (
                          /* Layout con imagen optimizado para calidad */
                          <div className="flex flex-col md:flex-row">
                            {/* Sección de imagen - 40% en desktop */}
                            <div className="w-full md:w-2/5 relative">
                              <div className="h-64 md:h-80 relative overflow-hidden rounded-l-lg">
                                <img
                                  src={article.image}
                                  alt={`Equipo de ${article.media}`}
                                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                  style={{ 
                                    maxWidth: '100%',
                                    height: 'auto'
                                  }}
                                  loading="lazy"
                                  onError={(e) => {
                                    e.currentTarget.src = "/imagenes/Logo_hosthelper_new.png";
                                  }}
                                />
                              </div>
                            </div>
                            
                            {/* Sección de contenido - 65% en desktop */}
                            <div className="w-full md:w-3/5 p-8">
                              <div className="flex items-center mb-4">
                                <span className="text-primary-600 font-semibold text-sm">
                                  {article.media}
                                </span>
                                <span className="mx-2 text-gray-400">•</span>
                                <span className="text-gray-500 text-sm">
                                  {article.date}
                                </span>
                              </div>
                              
                              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                                {article.title}
                              </h3>
                              
                              <p className="text-gray-600 mb-6 text-lg">
                                {article.excerpt}
                              </p>
                              
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-500">
                                  Por {article.author}
                                </span>
                                
                                {/* Hero-style external link button (keep href unchanged) */}
                                <a
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group relative inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl"
                                >
                                  <span className="relative z-10 font-medium">Leer artículo</span>
                                  <svg className="w-4 h-4 ml-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
                                  <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-400 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                                </a>
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* Layout sin imagen (original) */
                          <div className="p-8">
                            <div className="flex items-center mb-4">
                              <span className="text-primary-600 font-semibold text-sm">
                                {article.media}
                              </span>
                              <span className="mx-2 text-gray-400">•</span>
                              <span className="text-gray-500 text-sm">
                                {article.date}
                              </span>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-gray-900 mb-4">
                              {article.title}
                            </h3>
                            
                            <p className="text-gray-600 mb-6 text-lg">
                              {article.excerpt}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                Por {article.author}
                              </span>
                              
                              {/* Hero-style external link button (keep href unchanged) */}
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative inline-flex items-center justify-center px-6 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl"
                              >
                                <span className="relative z-10 font-medium">Leer artículo</span>
                                <svg className="w-4 h-4 ml-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                                <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-400 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons (desktop only) */}
              {mediaAppearances.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                    aria-label={t('common.previous')}
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <button
                    onClick={nextSlide}
                    className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                    aria-label={t('common.next')}
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
              )}

              {/* Mobile bottom-centered navigation arrows (match Pricing/Features style) */}
              {mediaAppearances.length > 1 && (
                <div className="flex justify-center mt-6 md:hidden">
                  <div className="flex gap-2">
                    <button
                      onClick={prevSlide}
                      className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                      aria-label={t('common.previous')}
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextSlide}
                      className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                      aria-label={t('common.next')}
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Dots Indicator */}
              {mediaAppearances.length > 1 && (
                <div className="flex justify-center space-x-2 mt-6">
                  {mediaAppearances.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`w-3 h-3 rounded-full transition-all duration-200 ${
                        index === currentSlide
                          ? 'bg-primary-500 scale-110'
                          : 'bg-gray-300 hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Featured Testimonials */}
        {/* Fondo gris claro (plata) solicitado para Testimonios Destacados */}
        <section className="py-16 bg-gray-100">
          <div className="container-limited">
            {/* Hidden header for animation trigger */}
            <div 
              ref={featuredHeaderRef}
              className={`text-center mb-12 transition-all duration-1000 ease-out ${
                featuredHeaderVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
                {t("testimonials.title")}
              </h2>
            </div>

            <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-x-visible scrollbar-hide px-4 md:px-0 mobile-carousel">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  ref={el => featuredTestimonialRefs.current[index] = el}
                  className={`w-[calc(100vw-2rem)] md:w-auto mobile-carousel-item flex-shrink-0 bg-white rounded-xl shadow-xl hover:shadow-2xl overflow-hidden transition-all duration-1000 ease-out hover:translate-y-[-4px] md:hover:translate-y-[-8px] border border-gray-200 ${
                    featuredTestimonials[index] 
                      ? 'opacity-100 translate-y-0 scale-100' 
                      : 'opacity-0 translate-y-8 scale-95'
                  }`}
                  style={{ 
                    transitionDelay: featuredTestimonials[index] ? `${index * 200}ms` : '0ms'
                  }}
                >
                  <div className="relative h-56 overflow-hidden">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {testimonial.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      {testimonial.description}
                    </p>

                    <div className="mb-6 relative">
                      <div className="absolute -top-2 -left-2 text-4xl text-primary-300 opacity-50">
                        "
                      </div>
                      <p className="text-gray-700 italic relative z-10 pl-4">
                        {testimonial.testimonial}
                      </p>
                      <div className="absolute -bottom-4 -right-2 text-4xl text-primary-300 opacity-50">
                        "
                      </div>
                    </div>

                    <div className="flex justify-between items-center mt-6">
                      <div>
                        <p className="font-semibold text-gray-900">
                          {testimonial.author}
                        </p>
                        <p className="text-sm text-gray-600">
                          {testimonial.position}
                        </p>
                      </div>
                      <a
                        href={testimonial.website}
                        className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t("testimonials.visitWebsite")}
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Testimonios;