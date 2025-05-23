import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import MobileMenu from "@shared/components/MobileMenu";
import LanguageSelector from "@shared/components/LanguageSelector";
import { useLanguage } from "@shared/contexts/LanguageContext";

const UpsellingPage = () => {
  const { t } = useLanguage();

  // Navigation links configuration (same as LandingPage)
  const navLinks = [
    { text: t("nav.features"), href: "/#features" },
    { text: t("nav.pricing"), href: "/pricing" },
    { text: t("nav.testimonials"), href: "/testimonios" },
    { text: t("nav.login"), href: "/login", isButton: true },
  ];

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
              <div className="bg-white rounded-xl shadow-lg p-8 transform hover:-translate-y-2 transition-all duration-300 group hover:shadow-xl">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-100 transition-colors">
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
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t("upsellingPage.benefits.passiveIncome.title")}
                </h3>
                <p className="text-gray-600">
                  {t("upsellingPage.benefits.passiveIncome.description")}
                </p>
              </div>

              {/* Beneficio 2 */}
              <div className="bg-white rounded-xl shadow-lg p-8 transform hover:-translate-y-2 transition-all duration-300 group hover:shadow-xl">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-100 transition-colors">
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
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t("upsellingPage.benefits.betterExperience.title")}
                </h3>
                <p className="text-gray-600">
                  {t("upsellingPage.benefits.betterExperience.description")}
                </p>
              </div>

              {/* Beneficio 3 */}
              <div className="bg-white rounded-xl shadow-lg p-8 transform hover:-translate-y-2 transition-all duration-300 group hover:shadow-xl">
                <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-primary-100 transition-colors">
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
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {t("upsellingPage.benefits.totalControl.title")}
                </h3>
                <p className="text-gray-600">
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
                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white">
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
                    <h3 className="text-xl font-semibold text-gray-900">
                      {t("upsellingPage.features.utmLinks.title")}
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {t("upsellingPage.features.utmLinks.description")}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white">
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
                    <h3 className="text-xl font-semibold text-gray-900">
                      {t("upsellingPage.features.smartRecommendations.title")}
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {t(
                        "upsellingPage.features.smartRecommendations.description",
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white">
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
                    <h3 className="text-xl font-semibold text-gray-900">
                      {t("upsellingPage.features.localIntegration.title")}
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {t("upsellingPage.features.localIntegration.description")}
                    </p>
                  </div>
                </div>

                <div className="flex">
                  <div className="flex-shrink-0 mt-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white">
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
                    <h3 className="text-xl font-semibold text-gray-900">
                      {t("upsellingPage.features.dashboard.title")}
                    </h3>
                    <p className="mt-2 text-gray-600">
                      {t("upsellingPage.features.dashboard.description")}
                    </p>
                  </div>
                </div>
              </div>

              {/* Columna derecha - Imagen o animación */}
              <div className="relative">
                <div className="aspect-w-16 aspect-h-9 bg-white rounded-xl shadow-lg overflow-hidden">
                  {/* Placeholder para una imagen o animación mostrando el sistema de upselling */}
                  <img
                    src="/imagenes/comisions.jpg"
                    alt="Características del sistema de upselling"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src =
                        "https://via.placeholder.com/800x450?text=Upselling+y+Comisiones";
                    }}
                  />
                </div>

                {/* Elementos decorativos */}
                <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-primary-500/20 rounded-full blur-xl"></div>
                <div className="absolute -left-10 -top-10 w-32 h-32 bg-yellow-500/20 rounded-full blur-xl"></div>

                {/* Elemento flotante con un dato estadístico */}
                <div
                  className="absolute bottom-8 right-4 bg-white rounded-lg shadow-xl p-4 w-64 transform rotate-2 animate-float"
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
                    <div className="ml-4">
                      <p className="text-xs text-gray-500">
                        {t("upsellingPage.features.incomeIncrease.title")}
                      </p>
                      <p className="text-xl font-bold text-gray-900">
                        {t("upsellingPage.features.incomeIncrease.value")}
                      </p>
                      <p className="text-xs text-gray-500">
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

      {/* Footer - Same as LandingPage */}
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
                {t("footer.support")}
                <span className="absolute -bottom-1 left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0 w-10 h-0.5 bg-primary-400"></span>
              </h4>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                <img
                  src="/imagenes/LogoMentorDay.png"
                  alt="MentorDay"
                  className="max-h-[3.25rem] w-auto object-contain"
                />
                <img
                  src="/imagenes/Eoi logo.png"
                  alt="Escuela de Organización Industrial"
                  className="max-h-[3.25rem] w-auto object-contain"
                />
                <img
                  src="/imagenes/logo_microsoft_for_startups.png"
                  alt="Microsoft for Startups"
                  className="max-h-[3.25rem] w-auto object-contain"
                />
                <img
                  src="/imagenes/logo incibe.png"
                  alt="Incibe"
                  className="max-h-[3.25rem] w-auto object-contain"
                />
                <img
                  src="/imagenes/Andalucia Lab.png"
                  alt="Andalucía Lab"
                  className="max-h-[3.25rem] w-auto object-contain"
                />
              </div>
            </div>

            {/* Redes sociales - Centro */}
            <div className="flex flex-col items-center justify-center">
              <h4 className="text-lg font-medium mb-3 relative inline-block">
                {t("footer.follow")}
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-primary-400"></span>
              </h4>
              <div className="flex space-x-4 justify-center">
                <a
                  href="https://www.linkedin.com/company/host-helper-ai"
                  className="group"
                  aria-label="LinkedIn"
                >
                  <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                    <svg
                      className="w-5 h-5 text-primary-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                  </div>
                </a>
                <a
                  href="https://www.instagram.com/host_helper_ai/"
                  className="group"
                  aria-label="Instagram"
                >
                  <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                    <svg
                      className="w-5 h-5 text-primary-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                  </div>
                </a>
                <a
                  href="https://www.youtube.com/@HostHelperAi"
                  className="group"
                  aria-label="YouTube"
                >
                  <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                    <svg
                      className="w-5 h-5 text-primary-500"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                    </svg>
                  </div>
                </a>
              </div>
            </div>

            {/* Contacto - Derecha */}
            <div className="flex flex-col items-center md:items-end">
              <h4 className="text-lg font-medium mb-3 relative inline-block">
                {t("footer.contact")}
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-primary-400"></span>
              </h4>
              <div className="flex flex-col space-y-2">
                <a
                  href="mailto:support@hosthelperai.com"
                  className="group flex items-center justify-center md:justify-end text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <div className="bg-white p-2 rounded-full shadow-sm mr-3 group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                    <svg
                      className="w-4 h-4 text-primary-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">
                    support@hosthelperai.com
                  </span>
                </a>
                <a
                  href="tel:+34687472327"
                  className="group flex items-center justify-center md:justify-end text-gray-600 hover:text-primary-600 transition-colors"
                >
                  <div className="bg-white p-2 rounded-full shadow-sm mr-3 group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                    <svg
                      className="w-4 h-4 text-primary-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">
                    +34 687 472 327
                  </span>
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
              {t("footer.slogan")}
            </p>
          </div>

          <div className="mt-6 pt-3 border-t border-gray-200/50 text-center">
            <p className="text-gray-500 text-xs">{t("footer.copyright")}</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UpsellingPage;
