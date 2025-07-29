// src/features/landing/PrivacyPolicy.tsx
// Página de Política de Privacidad de Host Helper AI
// Incluye navegación completa, header y footer como las demás páginas del sitio
// Contenido estructurado con secciones claras y diseño responsive

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import LandingHeader from "@shared/components/LandingHeader";
import Footer from "@shared/components/Footer";
import { useTranslation } from "react-i18next";

const PrivacyPolicy = () => {
  const { t } = useTranslation();

  // Estado para controlar las animaciones de scroll
  const [visibleSections, setVisibleSections] = useState({
    pageHeader: false,
    contentSections: [false, false, false, false, false, false, false, false, false, false, false]
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
  
  // Navigation links configuration - now handled by LandingHeader

  // Privacy policy sections data
  const privacySections = [
    {
      id: "introduction",
      title: t("privacy.sections.introduction.title"),
      content: t("privacy.sections.introduction.content")
    },
    {
      id: "data-controller",
      title: t("privacy.sections.dataController.title"),
      content: t("privacy.sections.dataController.content")
    },
    {
      id: "processing-purposes",
      title: t("privacy.sections.processingPurposes.title"),
      content: t("privacy.sections.processingPurposes.content")
    },
    {
      id: "legal-basis",
      title: t("privacy.sections.legalBasis.title"),
      content: t("privacy.sections.legalBasis.content")
    },
    {
      id: "data-processor",
      title: t("privacy.sections.dataProcessor.title"),
      content: t("privacy.sections.dataProcessor.content")
    },
    {
      id: "retention-period",
      title: t("privacy.sections.retentionPeriod.title"),
      content: t("privacy.sections.retentionPeriod.content")
    },
    {
      id: "recipients-transfers",
      title: t("privacy.sections.recipientsTransfers.title"),
      content: t("privacy.sections.recipientsTransfers.content")
    },
    {
      id: "user-rights",
      title: t("privacy.sections.userRights.title"),
      content: t("privacy.sections.userRights.content")
    },
    {
      id: "security-measures",
      title: t("privacy.sections.securityMeasures.title"),
      content: t("privacy.sections.securityMeasures.content")
    },
    {
      id: "cookies",
      title: t("privacy.sections.cookies.title"),
      content: t("privacy.sections.cookies.content")
    },
    {
      id: "policy-updates",
      title: t("privacy.sections.policyUpdates.title"),
      content: t("privacy.sections.policyUpdates.content")
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
                {t("privacy.title")}
              </h1>
              <p className="text-xl text-white opacity-90 max-w-2xl mx-auto">
                {t("privacy.subtitle")}
              </p>
              <p className="text-lg text-white opacity-80 mt-4">
                {t("privacy.lastUpdated")}
              </p>
            </div>
          </div>
        </section>

        {/* Privacy Policy Content */}
        <section className="py-16 bg-white">
          <div className="container-limited">
            {/* Table of Contents */}
            <div className="mb-12 bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t("privacy.tableOfContents")}
              </h2>
              <ul className="space-y-2">
                {privacySections.map((section, index) => (
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

            {/* Privacy Policy Sections */}
            <div className="space-y-12">
              {privacySections.map((section, index) => (
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


          </div>
        </section>
      </main>

      {/* Footer compartido */}
      <Footer />
    </div>
  );
};

export default PrivacyPolicy; 