// src/features/landing/DeletionStatus.tsx
// Página para consultar el estado de solicitudes de eliminación de datos
// Permite a los usuarios verificar el progreso usando su código de confirmación

import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import MobileMenu from "@shared/components/MobileMenu";
import LanguageSelector from "@shared/components/LanguageSelector";
import Footer from "@shared/components/Footer";
import { useTranslation } from "react-i18next";

interface DeletionRequest {
  confirmation_code: string;
  status: 'pending' | 'in_progress' | 'completed' | 'denied' | 'error';
  human_readable_status: string;
  request_date: string;
  completion_date?: string;
  denial_reason?: string;
  source: string;
}

const DeletionStatus = () => {
  const { t } = useTranslation();
  
  // Estados para la página
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [deletionRequest, setDeletionRequest] = useState<DeletionRequest | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [visibleSections, setVisibleSections] = useState({
    pageHeader: false,
    searchForm: false,
    results: false
  });
  
  // Referencias para animaciones
  const pageHeaderRef = useRef<HTMLDivElement>(null);
  const searchFormRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para animaciones
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2,
      rootMargin: "-50px 0px",
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (pageHeaderRef.current === entry.target) {
            setVisibleSections(prev => ({ ...prev, pageHeader: true }));
          }
          if (searchFormRef.current === entry.target) {
            setVisibleSections(prev => ({ ...prev, searchForm: true }));
          }
          if (resultsRef.current === entry.target) {
            setVisibleSections(prev => ({ ...prev, results: true }));
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const refs = [pageHeaderRef.current, searchFormRef.current, resultsRef.current].filter(Boolean);
    refs.forEach(ref => observer.observe(ref as Element));

    return () => observer.disconnect();
  }, []);

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Navigation links
  const navLinks = [
    { text: t("nav.features"), href: "/#features" },
    { text: t("nav.pricing"), href: "/pricing" },
    { text: t("nav.testimonials"), href: "/testimonios" },
    { text: t("nav.login"), href: "/login", isButton: true },
  ];

  // Status emoji mapping
  const statusEmojis: Record<string, string> = {
    'pending': '⏳',
    'in_progress': '🔄',
    'completed': '✅',
    'denied': '❌',
    'error': '⚠️'
  };

  // Status color mapping
  const statusColors: Record<string, string> = {
    'pending': 'text-yellow-600 bg-yellow-50 border-yellow-200',
    'in_progress': 'text-blue-600 bg-blue-50 border-blue-200',
    'completed': 'text-green-600 bg-green-50 border-green-200',
    'denied': 'text-red-600 bg-red-50 border-red-200',
    'error': 'text-orange-600 bg-orange-50 border-orange-200'
  };

  // Function to search for deletion request
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!confirmationCode.trim()) {
      setError(t("deletionStatus.errors.emptyCode"));
      return;
    }

    setIsLoading(true);
    setError(null);
    setDeletionRequest(null);

    try {
      // Call our Supabase Edge Function
      const response = await fetch(
        `/functions/v1/deletion-status?code=${encodeURIComponent(confirmationCode.trim())}&format=json`
      );
      
      if (response.ok) {
        const data = await response.json();
        setDeletionRequest(data);
        
        // Trigger results animation
        setTimeout(() => {
          setVisibleSections(prev => ({ ...prev, results: true }));
        }, 100);
      } else {
        const errorData = await response.json();
        setError(errorData.error || t("deletionStatus.errors.notFound"));
      }
    } catch (err) {
      console.error('Error fetching deletion status:', err);
      setError(t("deletionStatus.errors.network"));
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(t("locale"), {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
        <section className="bg-gradient-to-r from-red-500 to-orange-500 py-16 w-full">
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
                {t("deletionStatus.title")}
              </h1>
              <p className="text-xl text-white opacity-90 max-w-2xl mx-auto">
                {t("deletionStatus.subtitle")}
              </p>
            </div>
          </div>
        </section>

        {/* Search Form */}
        <section className="py-16 bg-gray-50">
          <div className="container-limited">
            <div 
              ref={searchFormRef}
              className={`max-w-2xl mx-auto transition-all duration-1000 ease-out ${
                visibleSections.searchForm
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-8 scale-95'
              }`}
            >
              <div className="bg-white rounded-lg shadow-lg p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                  {t("deletionStatus.searchForm.title")}
                </h2>
                
                <form onSubmit={handleSearch} className="space-y-6">
                  <div>
                    <label htmlFor="confirmationCode" className="block text-sm font-medium text-gray-700 mb-2">
                      {t("deletionStatus.searchForm.codeLabel")}
                    </label>
                    <input
                      type="text"
                      id="confirmationCode"
                      value={confirmationCode}
                      onChange={(e) => setConfirmationCode(e.target.value)}
                      placeholder={t("deletionStatus.searchForm.codePlaceholder")}
                      className="w-full px-4 py-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors font-mono text-center"
                      disabled={isLoading}
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      {t("deletionStatus.searchForm.codeHelp")}
                    </p>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-red-700">{error}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-red-500 text-white py-3 px-6 rounded-md hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t("deletionStatus.searchForm.searching")}
                      </>
                    ) : (
                      t("deletionStatus.searchForm.searchButton")
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>

        {/* Results */}
        {deletionRequest && (
          <section className="py-16 bg-white">
            <div className="container-limited">
              <div 
                ref={resultsRef}
                className={`max-w-4xl mx-auto transition-all duration-1000 ease-out ${
                  visibleSections.results
                    ? 'opacity-100 translate-y-0 scale-100'
                    : 'opacity-0 translate-y-8 scale-95'
                }`}
              >
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border">
                  {/* Status Header */}
                  <div className={`px-6 py-4 border-b ${statusColors[deletionRequest.status]}`}>
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">
                        {statusEmojis[deletionRequest.status]}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold capitalize">
                          {deletionRequest.status.replace('_', ' ')}
                        </h3>
                        <p className="text-sm opacity-75">
                          {t("deletionStatus.results.code")}: {deletionRequest.confirmation_code}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Status Description */}
                  <div className="px-6 py-4">
                    <p className="text-gray-700 text-lg leading-relaxed">
                      {deletionRequest.human_readable_status}
                    </p>
                  </div>

                  {/* Details */}
                  <div className="px-6 py-4 bg-gray-50">
                    <h4 className="font-semibold text-gray-900 mb-4">
                      {t("deletionStatus.results.details")}
                    </h4>
                    <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <dt className="text-sm font-medium text-gray-600">
                          {t("deletionStatus.results.requestDate")}
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {formatDate(deletionRequest.request_date)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-gray-600">
                          {t("deletionStatus.results.source")}
                        </dt>
                        <dd className="text-sm text-gray-900">
                          {deletionRequest.source === 'facebook_login' 
                            ? t("deletionStatus.results.sourceFacebook")
                            : t("deletionStatus.results.sourceEmail")
                          }
                        </dd>
                      </div>
                      {deletionRequest.completion_date && (
                        <div>
                          <dt className="text-sm font-medium text-gray-600">
                            {t("deletionStatus.results.completionDate")}
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {formatDate(deletionRequest.completion_date)}
                          </dd>
                        </div>
                      )}
                      {deletionRequest.denial_reason && (
                        <div className="md:col-span-2">
                          <dt className="text-sm font-medium text-gray-600">
                            {t("deletionStatus.results.denialReason")}
                          </dt>
                          <dd className="text-sm text-gray-900">
                            {deletionRequest.denial_reason}
                          </dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  {/* Completion Message */}
                  {deletionRequest.status === 'completed' && (
                    <div className="px-6 py-4 bg-green-50 border-t border-green-200">
                      <div className="flex items-start">
                        <svg className="w-5 h-5 text-green-500 mt-0.5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <div>
                          <h4 className="text-green-800 font-semibold">
                            {t("deletionStatus.results.completedTitle")}
                          </h4>
                          <p className="text-green-700 text-sm mt-1">
                            {t("deletionStatus.results.completedMessage")}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Contact Information */}
                  <div className="px-6 py-4 bg-gray-100 border-t">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {t("deletionStatus.results.contactTitle")}
                    </h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>
                        <strong>{t("deletionStatus.results.contactEmail")}:</strong>{" "}
                        <a href="mailto:support@hosthelperai.com" className="text-blue-600 hover:underline">
                          support@hosthelperai.com
                        </a>
                      </p>
                      <p>
                        <strong>{t("deletionStatus.results.contactPhone")}:</strong>{" "}
                        <a href="tel:+34687472327" className="text-blue-600 hover:underline">
                          +34 687472327
                        </a>
                      </p>
                      <p className="text-xs mt-2 font-mono bg-gray-200 px-2 py-1 rounded">
                        {t("deletionStatus.results.includeCode")}: {deletionRequest.confirmation_code}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Information Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-limited">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                {t("deletionStatus.info.title")}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("deletionStatus.info.whatIsCode.title")}
                  </h3>
                  <p className="text-gray-600">
                    {t("deletionStatus.info.whatIsCode.content")}
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("deletionStatus.info.howLong.title")}
                  </h3>
                  <p className="text-gray-600">
                    {t("deletionStatus.info.howLong.content")}
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("deletionStatus.info.gdprCompliance.title")}
                  </h3>
                  <p className="text-gray-600">
                    {t("deletionStatus.info.gdprCompliance.content")}
                  </p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {t("deletionStatus.info.metaIntegration.title")}
                  </h3>
                  <p className="text-gray-600">
                    {t("deletionStatus.info.metaIntegration.content")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DeletionStatus; 