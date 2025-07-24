// src/features/landing/DataDeletion.tsx
// Página de Eliminación de Datos de Usuario de Host Helper AI
// Incluye navegación completa, header y footer como las demás páginas del sitio
// Proporciona información sobre cómo los usuarios pueden solicitar la eliminación de sus datos

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import MobileMenu from "@shared/components/MobileMenu";
import LanguageSelector from "@shared/components/LanguageSelector";
import Footer from "@shared/components/Footer";
import { useTranslation } from "react-i18next";

const DataDeletion = () => {
  const { t } = useTranslation();

  // Estado para controlar las animaciones de scroll
  const [visibleSections, setVisibleSections] = useState({
    pageHeader: false,
    contentSections: [false, false, false, false, false, false, false, false, false, false, false, false]
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

  // Data deletion sections data
  const deletionSections = [
    {
      id: "introduction",
      title: t("dataDeletion.sections.introduction.title"),
      content: t("dataDeletion.sections.introduction.content")
    },
    {
      id: "dataController",
      title: t("dataDeletion.sections.dataController.title"),
      content: t("dataDeletion.sections.dataController.content")
    },
    {
      id: "deletionRights",
      title: t("dataDeletion.sections.deletionRights.title"),
      content: t("dataDeletion.sections.deletionRights.content")
    },
    {
      id: "exceptions",
      title: t("dataDeletion.sections.exceptions.title"),
      content: t("dataDeletion.sections.exceptions.content")
    },
    {
      id: "requestProcess",
      title: t("dataDeletion.sections.requestProcess.title"),
      content: t("dataDeletion.sections.requestProcess.content")
    },
    {
      id: "deletionProcess",
      title: t("dataDeletion.sections.deletionProcess.title"),
      content: t("dataDeletion.sections.deletionProcess.content")
    },
    {
      id: "responseTime",
      title: t("dataDeletion.sections.responseTime.title"),
      content: t("dataDeletion.sections.responseTime.content")
    },
    {
      id: "technicalMeasures",
      title: t("dataDeletion.sections.technicalMeasures.title"),
      content: t("dataDeletion.sections.technicalMeasures.content")
    },
    {
      id: "anonymizedData",
      title: t("dataDeletion.sections.anonymizedData.title"),
      content: t("dataDeletion.sections.anonymizedData.content")
    },
    {
      id: "dataProcessor",
      title: t("dataDeletion.sections.dataProcessor.title"),
      content: t("dataDeletion.sections.dataProcessor.content")
    },
    {
      id: "contact",
      title: t("dataDeletion.sections.contact.title"),
      content: t("dataDeletion.sections.contact.content")
    },
    {
      id: "updates",
      title: t("dataDeletion.sections.updates.title"),
      content: t("dataDeletion.sections.updates.content")
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
                {t("dataDeletion.title")}
              </h1>
              <p className="text-xl text-white opacity-90 max-w-2xl mx-auto">
                {t("dataDeletion.subtitle")}
              </p>
              <p className="text-sm text-white opacity-75 mt-4">
                {t("dataDeletion.lastUpdated")}
              </p>
            </div>
          </div>
        </section>

        {/* Data Deletion Content */}
        <section className="py-16 bg-white">
          <div className="container-limited">
            {/* Table of Contents */}
            <div className="mb-12 bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {t("dataDeletion.tableOfContents")}
              </h2>
              <ul className="space-y-2">
                {deletionSections.map((section, index) => (
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

            {/* Data Deletion Sections */}
            <div className="space-y-12">
              {deletionSections.map((section, index) => (
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
                      <span className="bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mr-4">
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

export default DataDeletion; 