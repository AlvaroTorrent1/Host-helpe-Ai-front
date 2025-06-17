import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import MobileMenu from "@shared/components/MobileMenu";
import LanguageSelector from "@shared/components/LanguageSelector";
import Footer from "@shared/components/Footer";
import { useLanguage } from "@shared/contexts/LanguageContext";

const Testimonios = () => {
  const { t } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Animation states
  const [pageHeaderVisible, setPageHeaderVisible] = useState(false);
  const [mediaHeaderVisible, setMediaHeaderVisible] = useState(false);
  const [mediaCarouselVisible, setMediaCarouselVisible] = useState(false);
  const [featuredHeaderVisible, setFeaturedHeaderVisible] = useState(false);
  const [featuredTestimonials, setFeaturedTestimonials] = useState([false, false, false]);
  const [moreHeaderVisible, setMoreHeaderVisible] = useState(false);
  const [moreTestimonials, setMoreTestimonials] = useState([false, false, false, false]);
  const [ctaVisible, setCtaVisible] = useState(false);

  // Refs for Intersection Observer
  const pageHeaderRef = useRef(null);
  const mediaHeaderRef = useRef(null);
  const mediaCarouselRef = useRef(null);
  const featuredHeaderRef = useRef(null);
  const featuredTestimonialRefs = useRef([]);
  const moreHeaderRef = useRef(null);
  const moreTestimonialRefs = useRef([]);
  const ctaRef = useRef(null);

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
          if (target === moreHeaderRef.current) {
            setMoreHeaderVisible(true);
          }
          if (target === ctaRef.current) {
            setCtaVisible(true);
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

          // More testimonials
          moreTestimonialRefs.current.forEach((ref, index) => {
            if (target === ref) {
              setMoreTestimonials(prev => {
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
      moreHeaderRef.current,
      ctaRef.current,
      ...featuredTestimonialRefs.current,
      ...moreTestimonialRefs.current
    ].filter(Boolean);

    elementsToObserve.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  // Media appearances data (primera noticia con imagen)
  const mediaAppearances = [
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

  // Navigation links configuration
  const navLinks = [
    { text: t("nav.features"), href: "/#features" },
    { text: t("nav.pricing"), href: "/pricing" },
    { text: t("nav.testimonials"), href: "/testimonios" },
    { text: t("nav.login"), href: "/login", isButton: true },
  ];

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
      name: "Alojamientos Doña Lola",
      image: "/imagenes/pic9.png",
      description: t("testimonials.testimonial3.description"),
      testimonial: t("testimonials.testimonial3.text"),
      author: t("testimonials.testimonial3.author"),
      position: t("testimonials.testimonial3.position"),
      website: "https://lolaalojamientos.com/",
    },
  ];

  return (
    <div className="min-h-screen bg-white" style={{ 
      scrollBehavior: 'smooth',
      scrollPaddingTop: '0px',
      WebkitOverflowScrolling: 'touch'
    }}>
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
        {/* Page Header */}
        <section className="bg-gradient-to-r from-[#ECA408] to-[#F5B730] py-16 w-full">
          <div className="container-limited">
            <div 
              ref={pageHeaderRef}
              className={`text-center transition-all duration-1000 ease-out ${
                pageHeaderVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Testimonios
              </h1>
            </div>
          </div>
        </section>

        {/* Media Appearances Carousel */}
        <section className="py-16 bg-gray-50">
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
                Apariciones en Medios
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Descubre lo que dicen los medios de comunicación sobre Host Helper AI
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
                                
                                <a
                                  href={article.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 transition-colors"
                                >
                                  Leer artículo
                                  <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                  </svg>
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
                              
                              <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-medium rounded-md hover:bg-primary-600 transition-colors"
                              >
                                Leer artículo
                                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Buttons */}
              {mediaAppearances.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <button
                    onClick={nextSlide}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110"
                  >
                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </>
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
        <section className="py-16 bg-white">
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
                Testimonios Destacados
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={testimonial.id}
                  ref={el => featuredTestimonialRefs.current[index] = el}
                  className={`bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-1000 ease-out hover:translate-y-[-5px] border border-gray-200 ${
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

        {/* More Testimonials (Text-based) */}
        <section className="py-16 bg-gray-50">
          <div className="container-limited">
            <h2 
              ref={moreHeaderRef}
              className={`text-2xl md:text-3xl font-bold text-gray-900 mb-10 text-center transition-all duration-1000 ease-out ${
                moreHeaderVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              {t("testimonials.more")}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div 
                ref={el => moreTestimonialRefs.current[0] = el}
                className={`bg-white p-6 rounded-lg shadow-md transition-all duration-1000 ease-out ${
                  moreTestimonials[0] 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                }`}
                style={{ 
                  transitionDelay: moreTestimonials[0] ? '200ms' : '0ms'
                }}
              >
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      AM
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">
                      {t(
                        "testimonials.additionalTestimonials.testimonial1.author",
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t(
                        "testimonials.additionalTestimonials.testimonial1.company",
                      )}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700">
                  "{t("testimonials.additionalTestimonials.testimonial1.text")}"
                </p>
              </div>

              <div 
                ref={el => moreTestimonialRefs.current[1] = el}
                className={`bg-white p-6 rounded-lg shadow-md transition-all duration-1000 ease-out ${
                  moreTestimonials[1] 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                }`}
                style={{ 
                  transitionDelay: moreTestimonials[1] ? '400ms' : '0ms'
                }}
              >
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      JL
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">
                      {t(
                        "testimonials.additionalTestimonials.testimonial2.author",
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t(
                        "testimonials.additionalTestimonials.testimonial2.company",
                      )}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700">
                  "{t("testimonials.additionalTestimonials.testimonial2.text")}"
                </p>
              </div>

              <div 
                ref={el => moreTestimonialRefs.current[2] = el}
                className={`bg-white p-6 rounded-lg shadow-md transition-all duration-1000 ease-out ${
                  moreTestimonials[2] 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                }`}
                style={{ 
                  transitionDelay: moreTestimonials[2] ? '600ms' : '0ms'
                }}
              >
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      PG
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">
                      {t(
                        "testimonials.additionalTestimonials.testimonial3.author",
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t(
                        "testimonials.additionalTestimonials.testimonial3.company",
                      )}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700">
                  "{t("testimonials.additionalTestimonials.testimonial3.text")}"
                </p>
              </div>

              <div 
                ref={el => moreTestimonialRefs.current[3] = el}
                className={`bg-white p-6 rounded-lg shadow-md transition-all duration-1000 ease-out ${
                  moreTestimonials[3] 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                }`}
                style={{ 
                  transitionDelay: moreTestimonials[3] ? '800ms' : '0ms'
                }}
              >
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      RF
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">
                      {t(
                        "testimonials.additionalTestimonials.testimonial4.author",
                      )}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t(
                        "testimonials.additionalTestimonials.testimonial4.company",
                      )}
                    </p>
                  </div>
                </div>
                <p className="text-gray-700">
                  "{t("testimonials.additionalTestimonials.testimonial4.text")}"
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-[#ECA408] to-[#F5B730]">
          <div 
            ref={ctaRef}
            className={`container-limited text-center transition-all duration-1000 ease-out ${
              ctaVisible 
                ? 'opacity-100 translate-y-0 scale-100' 
                : 'opacity-0 translate-y-8 scale-95'
            }`}
          >
            <h2 
              className={`text-2xl md:text-3xl font-bold text-white mb-4 transition-all duration-1000 ease-out ${
                ctaVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}
              style={{ 
                transitionDelay: ctaVisible ? '200ms' : '0ms'
              }}
            >
              {t("testimonials.cta.title")}
            </h2>
            <p 
              className={`text-white text-lg mb-8 max-w-2xl mx-auto transition-all duration-1000 ease-out ${
                ctaVisible 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-4'
              }`}
              style={{ 
                transitionDelay: ctaVisible ? '400ms' : '0ms'
              }}
            >
              {t("testimonials.cta.subtitle")}
            </p>
            <Link
              to="/schedule-demo"
              className={`inline-block px-8 py-4 bg-white text-primary-600 font-semibold rounded-md hover:bg-gray-100 transition-all duration-300 ${
                ctaVisible 
                  ? 'opacity-100 translate-y-0 scale-100' 
                  : 'opacity-0 translate-y-4 scale-95'
              }`}
              style={{ 
                transitionDelay: ctaVisible ? '600ms' : '0ms'
              }}
            >
              {t("testimonials.cta.button")}
            </Link>
          </div>
        </section>
      </main>

      {/* Footer compartido */}
      <Footer />
    </div>
  );
};

export default Testimonios;
