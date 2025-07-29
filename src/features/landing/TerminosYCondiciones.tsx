// src/features/landing/TerminosYCondiciones.tsx
// Página de Términos y Condiciones de Host Helper AI
// Incluye navegación completa, header y footer como las demás páginas del sitio
// Contenido estructurado con secciones claras y diseño responsive

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import LandingHeader from "@shared/components/LandingHeader";
import Footer from "@shared/components/Footer";
import { useTranslation } from "react-i18next";

const TerminosYCondiciones = () => {
  const { t } = useTranslation();

  // Estado para controlar las animaciones de scroll
  const [visibleSections, setVisibleSections] = useState({
    pageHeader: false,
    contentSections: new Array(18).fill(false)
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

    // Observar el header
    if (pageHeaderRef.current) {
      observer.observe(pageHeaderRef.current);
    }

    // Observar las secciones de contenido
    contentSectionRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  // Navigation links configuration - now handled by LandingHeader

  // Secciones de términos y condiciones - contenido completo
  const termsSections = [
    {
      id: "introduction",
      title: t("termsConditions.sections.introduction.title"),
      content: t("termsConditions.sections.introduction.content")
    },
    {
      id: "identification", 
      title: t("termsConditions.sections.identification.title"),
      content: t("termsConditions.sections.identification.content")
    },
    {
      id: "object",
      title: t("termsConditions.sections.object.title"),
      content: t("termsConditions.sections.object.content")
    },
    {
      id: "website-use",
      title: t("termsConditions.sections.websiteUse.title"),
      content: t("termsConditions.sections.websiteUse.content")
    },
    {
      id: "services-offered",
      title: t("termsConditions.sections.servicesOffered.title"),
      content: t("termsConditions.sections.servicesOffered.content")
    },
    {
      id: "contracting-process",
      title: t("termsConditions.sections.contractingProcess.title"),
      content: t("termsConditions.sections.contractingProcess.content")
    },
    {
      id: "prices-payment",
      title: t("termsConditions.sections.pricesPayment.title"),
      content: t("termsConditions.sections.pricesPayment.content")
    },
    {
      id: "compliance",
      title: t("termsConditions.sections.compliance.title"),
      content: t("termsConditions.sections.compliance.content")
    },
    {
      id: "liability",
      title: t("termsConditions.sections.liability.title"),
      content: t("termsConditions.sections.liability.content")
    },
    {
      id: "intellectual-property",
      title: t("termsConditions.sections.intellectualProperty.title"),
      content: t("termsConditions.sections.intellectualProperty.content")
    },
    {
      id: "data-protection",
      title: t("termsConditions.sections.dataProtection.title"),
      content: t("termsConditions.sections.dataProtection.content")
    },
    {
      id: "cookies",
      title: t("termsConditions.sections.cookies.title"),
      content: t("termsConditions.sections.cookies.content")
    },
    {
      id: "applicable-law",
      title: t("termsConditions.sections.applicableLaw.title"),
      content: t("termsConditions.sections.applicableLaw.content")
    },
    {
      id: "jurisdiction",
      title: t("termsConditions.sections.jurisdiction.title"),
      content: t("termsConditions.sections.jurisdiction.content")
    },
    {
      id: "modifications",
      title: t("termsConditions.sections.modifications.title"),
      content: t("termsConditions.sections.modifications.content")
    },
    {
      id: "contact",
      title: t("termsConditions.sections.contact.title"),
      content: t("termsConditions.sections.contact.content")
    },
    {
      id: "effective-date",
      title: t("termsConditions.sections.effectiveDate.title"),
      content: t("termsConditions.sections.effectiveDate.content")
    },
    {
      id: "severability",
      title: t("termsConditions.sections.severability.title"),
      content: t("termsConditions.sections.severability.content")
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

      {/* Header - Now using modular LandingHeader component */}
      <LandingHeader />

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
                {t("termsConditions.title", "Términos y Condiciones")}
              </h1>
              <p className="text-xl text-white opacity-90 max-w-2xl mx-auto">
                {t("termsConditions.subtitle", "Condiciones que rigen el uso de nuestros servicios")}
              </p>
              <p className="text-lg text-white opacity-80 mt-4">
                {t("termsConditions.lastUpdated", "Última actualización: 24 de enero de 2025")}
              </p>
            </div>
          </div>
        </section>

        {/* Terms and Conditions Content */}
        <section className="py-16 bg-white">
          <div className="container-limited">
            {/* Table of Contents */}
            <div className="bg-gray-50 p-6 rounded-lg mb-12 border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {t("termsConditions.tableOfContents", "Índice de Contenidos")}
              </h2>
              <ul className="space-y-2">
                {termsSections.map((section, index) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="text-primary-600 hover:text-primary-800 hover:underline transition-colors text-sm"
                    >
                      {index + 1}. {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Content Sections */}
            <div className="space-y-12">
              {termsSections.map((section, index) => (
                <div
                  key={section.id}
                  id={section.id}
                  ref={(el) => contentSectionRefs.current[index] = el}
                  className={`transition-all duration-1000 ease-out ${
                    visibleSections.contentSections[index]
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                >
                  <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b-2 border-primary-200">
                    {index + 1}. {section.title}
                  </h2>
                  <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                    {section.content.split('\n').map((paragraph, pIndex) => (
                      <p key={pIndex} className="mb-4">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>


          </div>
        </section>
      </main>

      {/* Footer compartido */}
      <Footer />
    </div>
  );
};

export default TerminosYCondiciones; 