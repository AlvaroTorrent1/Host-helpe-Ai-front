// File: src/features/landing/components/MediaAppearances.tsx
// Componente extraído desde Testimonios.tsx
// Objetivo: reutilizar la sección "Apariciones en Medios" dentro de la landing.
// Cambios mínimos, misma UI y datos. Se expone un <section id="media-apariciones"> para anclajes.

import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const MediaAppearances: React.FC = () => {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Datos idénticos a Testimonios.tsx (incluye Premio Junior como primero)
  const mediaAppearances = [
    {
      // Nueva pestaña solicitada: Premio Junior 23º (YouTube)
      id: 3,
      title: "Entrevista Premio Junior 23º",
      media: "Programa TV - Premio Junior",
      date: "2025",
      url: "https://www.youtube.com/watch?v=ZqPOuvY1WNA&t=12s",
      excerpt: "Participación de Host Helper AI en el 23º Premio Junior para Empresas.",
      author: "Premio Junior",
      image: "/imagenes/premio junior 23º.jpg",
      hasImage: true,
    },
    {
      id: 1,
      title:
        "Host Helper AI, el asistente virtual que libera a los anfitriones del caos administrativo, se presenta en Alhambra Venture",
      media: "Alhambra Venture",
      date: "6 junio 2025",
      url:
        "https://alhambraventure.com/host-helper-ai-el-asistente-virtual-que-libera-a-los-anfitriones-del-caos-administrativo-se-presenta-en-alhambra-venture/",
      excerpt:
        "Startup andaluza presenta su asistente virtual de voz integrado con WhatsApp para gestores de alojamientos turísticos. Automatiza interacciones, mejora la experiencia del huésped y libera recursos clave.",
      author: "Alhambra Venture",
      image: "/imagenes/Host Helper Team (1).jpeg",
      hasImage: true,
    },
    {
      id: 2,
      title:
        "La 'startup' malagueña Host Helper AI automatiza la atención al cliente de los apartamentos turísticos",
      media: "El Español Málaga",
      date: "31 marzo 2025",
      url:
        "https://www.elespanol.com/malaga/economia/tecnologia/20250331/startup-malaguena-host-helper-ai-automatiza-atencion-cliente-apartamentos-turisticos/927157458_0.html",
      excerpt:
        "Host Helper AI automatiza la atención al turista mediante un chatbot que optimiza el registro de huéspedes y resuelve consultas en varios idiomas.",
      author: "Demófilo Peláez",
      image: "/imagenes/Roll up.png",
      hasImage: true,
    },
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % mediaAppearances.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + mediaAppearances.length) % mediaAppearances.length);

  return (
    <section id="media-apariciones" className="py-16 bg-white scroll-mt-24 md:scroll-mt-28">
      <div className="container-limited">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            {t("testimonials.mediaSection.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("testimonials.mediaSection.subtitle")}
          </p>
        </div>

        <div
          className="relative max-w-4xl mx-auto"
        >
          <div className="overflow-hidden rounded-xl">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {mediaAppearances.map((article) => (
                <div key={article.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {article.hasImage ? (
                      <div className="flex flex-col md:flex-row">
                        <div className="w-full md:w-2/5 relative">
                          <div className="h-64 md:h-80 relative overflow-hidden rounded-l-lg">
                            <img
                              src={article.image}
                              alt={`Equipo de ${article.media}`}
                              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                              style={{ maxWidth: "100%", height: "auto" }}
                              loading="lazy"
                              onError={(e) => {
                                e.currentTarget.src = "/imagenes/Logo_hosthelper_new.png";
                              }}
                            />
                          </div>
                        </div>

                        <div className="w-full md:w-3/5 p-8">
                          <div className="flex items-center mb-4">
                            <span className="text-primary-600 font-semibold text-sm">{article.media}</span>
                            <span className="mx-2 text-gray-400">•</span>
                            <span className="text-gray-500 text-sm">{article.date}</span>
                          </div>

                          <h3 className="text-2xl font-bold text-gray-900 mb-4">{article.title}</h3>
                          <p className="text-gray-600 mb-6 text-lg">{article.excerpt}</p>

                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">Por {article.author}</span>
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
                      <div className="p-8">
                        <div className="flex items-center mb-4">
                          <span className="text-primary-600 font-semibold text-sm">{article.media}</span>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-gray-500 text-sm">{article.date}</span>
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">{article.title}</h3>
                        <p className="text-gray-600 mb-6 text-lg">{article.excerpt}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-500">Por {article.author}</span>
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

          {mediaAppearances.length > 1 && (
            <>
              {/* Navegación desktop (laterales) */}
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

              {/* Navegación móvil (abajo) */}
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

              {/* Dots */}
              <div className="flex justify-center space-x-2 mt-6">
                {mediaAppearances.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      index === currentSlide ? 'bg-primary-500 scale-110' : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default MediaAppearances;


