import React from 'react';
import { Link } from 'react-router-dom';
import MobileMenu from '@shared/components/MobileMenu';
import LanguageSelector from '@shared/components/LanguageSelector';
import CalendlyLink from '@shared/components/CalendlyLink';
import { useLanguage } from '@shared/contexts/LanguageContext';

// Definición de estilos CSS adicionales
const styles = {
  textShadowSm: {
    textShadow: '0 2px 4px rgba(0,0,0,0.4)'
  },
  textShadowLg: {
    textShadow: '0 4px 8px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.8)'
  }
};

const LandingPage = () => {
  const { t } = useLanguage();
  
  // Navigation links configuration
  const navLinks = [
    { text: t('nav.features'), href: '#features' },
    { text: t('nav.pricing'), href: '/pricing' },
    { text: t('nav.testimonials'), href: '/testimonios' },
    { text: t('nav.login'), href: '/login', isButton: true }
  ];

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
                  {link.href.startsWith('/') ? (
                    <Link 
                      to={link.href} 
                      className={link.isButton 
                        ? "bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md" 
                        : "text-gray-600 hover:text-primary-500"
                      }
                    >
                      {link.text}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-gray-600 hover:text-primary-500">
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
        <section className="relative py-12 md:py-20 bg-gradient-to-r from-[#ECA408] to-[#F5B730] overflow-hidden w-full">
          <div className="container-limited relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:w-1/2 mb-10 md:mb-0 text-center md:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight mb-6">
                  {t('landing.hero.title')}
                </h1>
                <p className="text-lg sm:text-xl text-white opacity-90 mb-8">
                  {t('landing.hero.subtitle')}
                </p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center md:justify-start">
                  <CalendlyLink />
                  <Link to="/register" className="px-6 sm:px-8 py-3 bg-white text-primary-600 font-medium rounded-md hover:bg-gray-100 transition-colors shadow-md hover:shadow-lg text-center">
                    {t('landing.hero.cta')}
                  </Link>
                </div>
              </div>
              <div className="md:w-1/2">
                <div className="group relative w-3/5 h-56 md:h-64 mx-auto overflow-hidden shadow-xl" style={{ clipPath: "polygon(0% 0%, 100% 0%, 95% 85%, 90% 100%, 0% 100%)" }}>
                  <style>
                    {`
                    @keyframes floating {
                      0% { transform: translateY(0) rotate(-3deg) scale(1.35); }
                      25% { transform: translateY(-15px) rotate(-1deg) scale(1.37); }
                      50% { transform: translateY(-10px) rotate(3deg) scale(1.35); }
                      75% { transform: translateY(-20px) rotate(1deg) scale(1.38); }
                      100% { transform: translateY(0) rotate(-3deg) scale(1.35); }
                    }
                    `}
                  </style>
                  <img 
                    src="/imagenes/wall-e.jpg" 
                    alt="Dashboard de Host Helper AI" 
                    className="w-full h-full object-cover transition-all duration-700 ease-in-out will-change-transform group-hover:scale-150 group-hover:rotate-3"
                    style={{ 
                      objectPosition: "center center", 
                      animation: "floating 4s ease-in-out infinite",
                      transform: "rotate(-3deg) scale(1.35)"
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          
          {/* Background design elements */}
          <div className="absolute bottom-0 left-0 right-0 h-20 bg-white" style={{ clipPath: 'polygon(0 100%, 100% 100%, 100% 0)' }}></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-white opacity-5 rounded-full transform translate-x-1/4 -translate-y-1/4"></div>
          <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-white opacity-5 rounded-full transform -translate-x-1/4 translate-y-1/4"></div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-12 md:py-20 bg-white w-full">
          <div className="container-limited">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">{t('landing.features.title')}</h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto">
                {t('landing.features.subtitle')}
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="mb-4">
                  <div className="w-52 h-52 mx-auto overflow-hidden relative" style={{ clipPath: "polygon(50% 0%, 95% 25%, 95% 75%, 50% 100%, 5% 75%, 5% 25%)" }}>
                    <div className="absolute inset-0 bg-primary-500/20 mix-blend-overlay"></div>
                    <img 
                      src="/imagenes/link_registro.jpg" 
                      alt="Chatbot 24/7" 
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 shadow-[inset_0_0_0_3px_rgba(236,164,8,0.3)] pointer-events-none"></div>
                  </div>
                </div>
                <a href="/features/chatbot" className="group">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-primary-600 transition-colors">{t('landing.features.chatbot')}</h3>
                </a>
                <p className="text-gray-600 mb-4">
                  {t('landing.features.chatbotDesc')}
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="mb-4">
                  <div className="w-52 h-52 mx-auto overflow-hidden relative">
                    <img 
                      src="/imagenes/seshospedajes.png" 
                      alt="Check-in automatizado" 
                      className="w-full h-full object-contain"
                    />
                  </div>
                </div>
                <a href="/features/check-in" className="group">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-primary-600 transition-colors">{t('landing.features.checkIn')}</h3>
                </a>
                <p className="text-gray-600 mb-4">
                  {t('landing.features.checkInDesc')}
                </p>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="mb-4">
                  <div className="w-52 h-52 mx-auto overflow-hidden relative" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}>
                    <div className="absolute inset-0 bg-primary-500/20 mix-blend-overlay"></div>
                    <img 
                      src="/imagenes/comisions.jpg" 
                      alt="Upselling inteligente" 
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 shadow-[inset_0_0_0_3px_rgba(236,164,8,0.3)] pointer-events-none"></div>
                  </div>
                </div>
                <a href="/features/upselling" className="group">
                  <h3 className="text-xl font-bold mb-2 text-gray-900 group-hover:text-primary-600 transition-colors">{t('landing.features.upselling')}</h3>
                </a>
                <p className="text-gray-600 mb-4">
                  {t('landing.features.upsellingDesc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-white" id="how-it-works">
          <div className="container-limited">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('landing.howItWorks.title')}</h2>
            </div>
            
            {/* Paso 1 */}
            <div className="flex flex-col md:flex-row items-center mb-16">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl font-semibold mr-4">
                    1
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{t('landing.howItWorks.step1.title')}</h3>
                </div>
                <p className="text-gray-600 mb-4">{t('landing.howItWorks.step1.description')}</p>
              </div>
              <div className="md:w-1/2">
                <div className="group relative w-5/6 h-64 mx-auto overflow-hidden shadow-xl" style={{ clipPath: "polygon(0% 0%, 100% 0%, 95% 85%, 90% 100%, 0% 100%)" }}>
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-transparent z-10"></div>
                  <img 
                    src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=500&q=80" 
                    alt="Registro y añadir propiedad" 
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute -bottom-10 left-0 w-32 h-32 bg-primary-600 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-all duration-500"></div>
                </div>
              </div>
            </div>
            
            {/* Paso 2 */}
            <div className="flex flex-col md:flex-row-reverse items-center mb-16">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pl-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl font-semibold mr-4">
                    2
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{t('landing.howItWorks.step2.title')}</h3>
                </div>
                <p className="text-gray-600 mb-4">{t('landing.howItWorks.step2.description')}</p>
              </div>
              <div className="md:w-1/2">
                <div className="group relative w-5/6 h-64 mx-auto overflow-hidden shadow-xl" style={{ clipPath: "polygon(0% 0%, 100% 0%, 95% 85%, 90% 100%, 0% 100%)" }}>
                  <div className="absolute inset-0 bg-gradient-to-bl from-primary-600/30 to-transparent z-10"></div>
                  <img 
                    src="/imagenes/link_registro.jpg" 
                    alt="Configuración del asistente virtual" 
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute -bottom-10 left-0 w-32 h-32 bg-primary-600 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-all duration-500"></div>
                </div>
              </div>
            </div>
            
            {/* Paso 3 */}
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-xl font-semibold mr-4">
                    3
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">{t('landing.howItWorks.step3.title')}</h3>
                </div>
                <p className="text-gray-600 mb-4">{t('landing.howItWorks.step3.description')}</p>
              </div>
              <div className="md:w-1/2">
                <div className="group relative w-5/6 h-64 mx-auto overflow-hidden shadow-xl" style={{ clipPath: "polygon(0% 0%, 100% 0%, 95% 85%, 90% 100%, 0% 100%)" }}>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-transparent z-10"></div>
                  <img 
                    src="/imagenes/turistas.jpg" 
                    alt="Compartir enlace con huéspedes" 
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute -bottom-10 right-0 w-32 h-32 bg-primary-600 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-all duration-500"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-10 md:py-20 w-full relative overflow-hidden">
          {/* Video de fondo */}
          <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
            <iframe 
              src="https://www.youtube.com/embed/uq1m31lh-tA?autoplay=1&mute=1&loop=1&playlist=uq1m31lh-tA&controls=0"
              className="absolute w-full h-full object-cover"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ 
                pointerEvents: 'none',
                filter: 'contrast(1.1) brightness(0.7)',
                transform: 'scale(1.25)'
              }}
            />
            {/* Overlay cinematográfico sin color naranja */}
            <div className="absolute inset-0 bg-black/30 mix-blend-multiply"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>
          </div>
          
          <div className="container-limited text-center relative z-10">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4" style={styles.textShadowLg}>{t('landing.cta.title')}</h2>
            <p className="text-lg sm:text-xl text-white opacity-90 mb-8 max-w-3xl mx-auto" style={styles.textShadowLg}>
              {t('landing.cta.subtitle')}
            </p>
            <Link 
              to="/register" 
              className="inline-block px-6 py-3 sm:px-8 sm:py-4 bg-white/30 backdrop-blur-sm text-white font-medium rounded-md border border-white/20 hover:bg-white/40 transition-colors shadow-lg text-lg"
            >
              {t('landing.cta.button')}
            </Link>
          </div>
        </section>
      </main>
      
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
                {t('footer.support')}
                <span className="absolute -bottom-1 left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0 w-10 h-0.5 bg-primary-400"></span>
              </h4>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                <img 
                  src="/imagenes/LogoMentorDay.png" 
                  alt="MentorDay" 
                  className="max-h-[3.25rem] w-auto object-contain"
                />
                <img 
                  src="/imagenes/logo_eoi.jpg" 
                  alt="Escuela de Organización Industrial" 
                  className="max-h-[3.25rem] w-auto object-contain"
                />
                <img 
                  src="/imagenes/logo_microsoft_for_startups.png" 
                  alt="Microsoft for Startups" 
                  className="max-h-[3.25rem] w-auto object-contain"
                />
                <img 
                  src="/imagenes/logo-incibe.png" 
                  alt="Incibe" 
                  className="max-h-[3.25rem] w-auto object-contain"
                />
                <img 
                  src="/imagenes/andalucia lab.jpg" 
                  alt="Andalucía Lab" 
                  className="max-h-[3.25rem] w-auto object-contain"
                />
              </div>
            </div>
            
            {/* Redes sociales - Centro */}
            <div className="flex flex-col items-center justify-center">
              <h4 className="text-lg font-medium mb-3 relative inline-block">
                {t('footer.follow')}
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-primary-400"></span>
              </h4>
              <div className="flex space-x-4 justify-center">
                <a href="https://www.linkedin.com/company/host-helper-ai" className="group" aria-label="LinkedIn">
                  <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                    <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </div>
                </a>
                <a href="https://www.instagram.com/host_helper_ai/" className="group" aria-label="Instagram">
                  <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                    <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                </a>
                <a href="https://www.youtube.com/@HostHelperAi" className="group" aria-label="YouTube">
                  <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                    <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                    </svg>
                  </div>
                </a>
              </div>
            </div>

            {/* Contacto - Derecha */}
            <div className="flex flex-col items-center md:items-end">
              <h4 className="text-lg font-medium mb-3 relative inline-block">
                {t('footer.contact')}
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-primary-400"></span>
              </h4>
              <div className="flex flex-col space-y-2">
                <a href="mailto:support@hosthelperai.com" className="group flex items-center justify-center md:justify-end text-gray-600 hover:text-primary-600 transition-colors">
                  <div className="bg-white p-2 rounded-full shadow-sm mr-3 group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                    <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">support@hosthelperai.com</span>
                </a>
                <a href="tel:+34687472327" className="group flex items-center justify-center md:justify-end text-gray-600 hover:text-primary-600 transition-colors">
                  <div className="bg-white p-2 rounded-full shadow-sm mr-3 group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                    <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">+34 687 472 327</span>
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
              {t('footer.slogan')}
            </p>
          </div>
          
          <div className="mt-6 pt-3 border-t border-gray-200/50 text-center">
            <p className="text-gray-500 text-xs">{t('footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 