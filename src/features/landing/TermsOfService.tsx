// src/features/landing/TermsOfService.tsx
// Página de Términos de Servicio de Host Helper AI
// Incluye navegación completa, header y footer como las demás páginas del sitio
// Contenido estructurado con secciones claras y diseño responsive

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import MobileMenu from "@shared/components/MobileMenu";
import LanguageSelector from "@shared/components/LanguageSelector";
import Footer from "@shared/components/Footer";
import { useTranslation } from "react-i18next";

const TermsOfService = () => {
  const { t } = useTranslation();

  // Estado para controlar las animaciones de scroll
  const [visibleSections, setVisibleSections] = useState({
    pageHeader: false,
    contentSections: [false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false, false]
  });
  
  // Referencias para las secciones que queremos animar
  const pageHeaderRef = useRef<HTMLDivElement>(null);
  const contentSectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Intersection Observer para animaciones de scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "-50px 0px",
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Page Header
          if (pageHeaderRef.current === entry.target) {
            setVisibleSections(prev => ({ ...prev, pageHeader: true }));
          }

          // Content sections
          contentSectionRefs.current.forEach((ref, index) => {
            if (ref === entry.target) {
              setVisibleSections(prev => ({
                ...prev,
                contentSections: prev.contentSections.map((visible, idx) => 
                  idx === index ? true : visible
                )
              }));
            }
          });
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observar todos los elementos
    const allRefs = [
      pageHeaderRef.current,
      ...contentSectionRefs.current
    ].filter(Boolean) as Element[];
    
    allRefs.forEach(ref => observer.observe(ref));

    // Cleanup
    return () => observer.disconnect();
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }, []);
  
  // Navigation links configuration
  const navLinks = [
    { text: t("nav.features"), href: "/#features" },
    { text: t("nav.pricing"), href: "/pricing" },
    { text: t("nav.testimonials"), href: "/testimonios" },
    { text: t("nav.login"), href: "/login", isButton: true },
  ];

  // Terms of service sections data - placeholder content
  const termsSections = [
    {
      id: "introduction",
      title: t("terms.sections.introduction.title", "Introducción"),
      content: t("terms.sections.introduction.content", "Las presentes Condiciones de Servicio regulan el acceso y uso del sitio web www.hosthelperai.com")
    },
    {
      id: "identification",
      title: t("terms.sections.identification.title", "Identificación del Titular"),
      content: t("terms.sections.identification.content", "En cumplimiento de la Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y Comercio Electrónico (LSSI)")
    },
    {
      id: "object",
      title: t("terms.sections.object.title", "Objeto"),
      content: t("terms.sections.object.content", "Estas Condiciones tienen por objeto regular el acceso y uso del Sitio Web")
    },
    {
      id: "website-use",
      title: t("terms.sections.websiteUse.title", "Uso del Sitio Web"),
      content: t("terms.sections.websiteUse.content", "El Usuario se compromete a utilizar el Sitio Web de conformidad con la legislación vigente")
    },
    {
      id: "services-offered",
      title: t("terms.sections.servicesOffered.title", "Servicios Ofrecidos"),
      content: t("terms.sections.servicesOffered.content", "Host Helper AI ofrece servicios de mensajería automatizada basados en inteligencia artificial")
    },
    {
      id: "contracting-process",
      title: t("terms.sections.contractingProcess.title", "Proceso de Contratación"),
      content: t("terms.sections.contractingProcess.content", "El proceso de contratación de los servicios se realiza a través del Sitio Web")
    },
    {
      id: "prices-payment",
      title: t("terms.sections.pricesPayment.title", "Precios y Formas de Pago"),
      content: t("terms.sections.pricesPayment.content", "Los precios de los servicios están indicados en el Sitio Web en euros")
    },
    {
      id: "duration-cancellation",
      title: t("terms.sections.durationCancellation.title", "Duración y Cancelación del Servicio"),
      content: t("terms.sections.durationCancellation.content", "Los servicios se prestan por el período contratado")
    },
    {
      id: "withdrawal-right",
      title: t("terms.sections.withdrawalRight.title", "Derecho de Desistimiento"),
      content: t("terms.sections.withdrawalRight.content", "El Cliente tiene derecho a desistir del contrato en un plazo de 14 días naturales")
    },
    {
      id: "intellectual-property",
      title: t("terms.sections.intellectualProperty.title", "Propiedad Intelectual e Industrial"),
      content: t("terms.sections.intellectualProperty.content", "Todos los contenidos del Sitio Web son propiedad de HostHelperAI")
    },
    {
      id: "warranties",
      title: t("terms.sections.warranties.title", "Exclusión de Garantías y Responsabilidad"),
      content: t("terms.sections.warranties.content", "HostHelperAI no garantiza la disponibilidad ininterrumpida del Sitio Web")
    },
    {
      id: "data-protection",
      title: t("terms.sections.dataProtection.title", "Protección de Datos Personales"),
      content: t("terms.sections.dataProtection.content", "HostHelperAI trata los datos personales conforme a su Política de Privacidad")
    },
    {
      id: "third-party-links",
      title: t("terms.sections.thirdPartyLinks.title", "Enlaces a Terceros"),
      content: t("terms.sections.thirdPartyLinks.content", "El Sitio Web puede incluir enlaces a sitios de terceros")
    },
    {
      id: "exclusion-right",
      title: t("terms.sections.exclusionRight.title", "Derecho de Exclusión"),
      content: t("terms.sections.exclusionRight.content", "HostHelperAI se reserva el derecho de denegar o retirar el acceso")
    },
    {
      id: "modifications",
      title: t("terms.sections.modifications.title", "Modificaciones"),
      content: t("terms.sections.modifications.content", "HostHelperAI podrá modificar estas Condiciones en cualquier momento")
    },
    {
      id: "conflict-resolution",
      title: t("terms.sections.conflictResolution.title", "Resolución de Conflictos"),
      content: t("terms.sections.conflictResolution.content", "Para cualquier consulta, queja o reclamación, contacta con support@hosthelperai.com")
    },
    {
      id: "applicable-law",
      title: t("terms.sections.applicableLaw.title", "Legislación Aplicable"),
      content: t("terms.sections.applicableLaw.content", "Estas Condiciones se rigen por la legislación española")
    },
    {
      id: "contact",
      title: t("terms.sections.contact.title", "Contacto"),
      content: t("terms.sections.contact.content", "Para cualquier consulta sobre estas Condiciones, contáctanos")
    }
  ];

  return (
    <div className="min-h-screen bg-white" style={{ scrollBehavior: 'smooth' }}>
      {/* Estilos adicionales para garantizar el correcto comportamiento del scroll */}
      <style>
        {`
          html, body {
            scroll-behavior: smooth;
          }
          
          html {
            scroll-padding-top: 0;
          }
          
          body {
            -webkit-overflow-scrolling: touch;
          }
        `}
      </style>

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
          <div className="md:hidden">
             <MobileMenu links={navLinks} />
          </div>
        </div>
      </header>

      <main>
        {/* Page Header */}
        <section className="bg-gradient-to-r from-[#ECA408] to-[#F5B730] py-16 w-full">
          <div className="container-limited">
            <div 
              ref={pageHeaderRef}
              className={`text-center transition-all duration-1000 ease-out ${
                visibleSections.pageHeader
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t("terms.title", "Términos de Servicio")}
              </h1>
              <p className="text-xl text-white opacity-90 max-w-2xl mx-auto">
                {t("terms.subtitle", "Condiciones que rigen el uso de nuestros servicios")}
              </p>
              <p className="text-lg text-white opacity-80 mt-4">
                {t("terms.lastUpdated", "Última actualización: 24 de julio de 2025")}
              </p>
            </div>
          </div>
        </section>

        {/* Terms of Service Content */}
        <section className="py-16 bg-white">
          <div className="container-limited">
            {/* Table of Contents */}
            <div className="mb-12 bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t("terms.tableOfContents", "Índice de Contenidos")}
              </h2>
              <ul className="space-y-2">
                {termsSections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      {index + 1}. {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Terms of Service Sections */}
            <div className="space-y-12">
              {termsSections.map((section, index) => (
                <div 
                  key={section.id}
                  id={section.id}
                  ref={el => contentSectionRefs.current[index] = el}
                  className={`transition-all duration-1000 ease-out ${
                    visibleSections.contentSections[index]
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-8 scale-95'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <div className="bg-white border border-gray-200 rounded-lg p-8 shadow-sm">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                      <span className="bg-primary-100 text-primary-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">
                        {index + 1}
                      </span>
                      {section.title}
                    </h2>
                    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                      {section.content.split('\n').map((paragraph, pIndex) => (
                        paragraph.trim() && (
                          <p key={pIndex} className="mb-4">
                            {paragraph}
                          </p>
                        )
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Contact Information */}
            <div className="mt-16 p-6 bg-primary-50 rounded-lg border border-primary-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                {t("terms.contactSection.title", "¿Tienes preguntas?")}
              </h3>
              <p className="text-gray-700 mb-4">
                {t("terms.contactSection.description", "Si tienes alguna pregunta sobre estos Términos de Servicio, no dudes en contactarnos:")}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="mailto:support@hosthelperai.com"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  support@hosthelperai.com
                </a>
                <a
                  href="tel:+34687472327"
                  className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  +34 687 472 327
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer compartido */}
      <Footer />
    </div>
  );
};

export default TermsOfService; 