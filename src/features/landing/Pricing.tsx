// Pricing.tsx
// Este componente gestiona la sección de precios y planes de suscripción.
// Incluye integración con Stripe para los enlaces de pago y con Calendly para demostraciones.
// La selección entre planes mensuales o anuales actualiza dinámicamente los enlaces de pago.

import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import MobileMenu from "@shared/components/MobileMenu";
import LanguageSelector from "@shared/components/LanguageSelector";
import Footer from "@shared/components/Footer";
import { useTranslation } from "react-i18next";
import { useAuth } from "@shared/contexts/AuthContext";
import { useSubscription } from "@shared/hooks/useSubscription";
import { usePaymentFlow } from "@shared/contexts/PaymentFlowContext";
import { usePaymentFlowResume } from "@shared/hooks/usePaymentFlowResume";
import RegisterModal from "@shared/components/RegisterModal";
import toast from "react-hot-toast";

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(true);
  
  const { t } = useTranslation();
  const { user, signIn } = useAuth();
  const { hasActiveSubscription } = useSubscription();
  const navigate = useNavigate();
  
  // 🚀 NUEVO: Usar PaymentFlow context en lugar de estado local
  const { selectedPlan, shouldShowModal, startFlow, clearFlow } = usePaymentFlow();
  
  // 🚀 NUEVO: Auto-detectar y reanudar flujos de pago pendientes
  const paymentFlowStatus = usePaymentFlowResume();
  
  console.log('💰 Pricing: Estado del flujo de pago:', {
    selectedPlan,
    shouldShowModal,
    flowStatus: paymentFlowStatus
  });

  // Estado para controlar las animaciones de scroll
  const [visibleSections, setVisibleSections] = useState({
    pricingCards: [false, false, false],
    faqTitle: false,
    faqItems: [false, false, false, false, false, false],
    ctaSection: false
  });
  
  // Referencias para las secciones que queremos animar
  const pricingCard1Ref = useRef<HTMLDivElement>(null);
  const pricingCard2Ref = useRef<HTMLDivElement>(null);
  const pricingCard3Ref = useRef<HTMLDivElement>(null);
  const faqTitleRef = useRef<HTMLDivElement>(null);
  const faqItem1Ref = useRef<HTMLDivElement>(null);
  const faqItem2Ref = useRef<HTMLDivElement>(null);
  const faqItem3Ref = useRef<HTMLDivElement>(null);
  const faqItem4Ref = useRef<HTMLDivElement>(null);
  const faqItem5Ref = useRef<HTMLDivElement>(null);
  const faqItem6Ref = useRef<HTMLDivElement>(null);
  const ctaSectionRef = useRef<HTMLDivElement>(null);

  // Intersection Observer para animaciones de scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.2, // Se activa cuando el 20% del elemento es visible
      rootMargin: "-50px 0px", // Margen para ajustar cuándo se activa
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Tarjetas de precios
          const pricingCardRefs = [pricingCard1Ref, pricingCard2Ref, pricingCard3Ref];
          const cardIndex = pricingCardRefs.findIndex(ref => ref.current === entry.target);
          
          if (cardIndex !== -1) {
            setVisibleSections(prev => ({
              ...prev,
              pricingCards: prev.pricingCards.map((visible, index) => 
                index === cardIndex ? true : visible
              )
            }));
          }

          // Título de FAQ
          if (faqTitleRef.current === entry.target) {
            setVisibleSections(prev => ({ ...prev, faqTitle: true }));
          }

          // Items de FAQ
          const faqItemRefs = [faqItem1Ref, faqItem2Ref, faqItem3Ref, faqItem4Ref, faqItem5Ref, faqItem6Ref];
          const faqIndex = faqItemRefs.findIndex(ref => ref.current === entry.target);
          
          if (faqIndex !== -1) {
            setVisibleSections(prev => ({
              ...prev,
              faqItems: prev.faqItems.map((visible, index) => 
                index === faqIndex ? true : visible
              )
            }));
          }

          // Sección CTA
          if (ctaSectionRef.current === entry.target) {
            setVisibleSections(prev => ({ ...prev, ctaSection: true }));
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observar todos los elementos
    const allRefs = [
      pricingCard1Ref, pricingCard2Ref, pricingCard3Ref,
      faqTitleRef,
      faqItem1Ref, faqItem2Ref, faqItem3Ref, faqItem4Ref, faqItem5Ref, faqItem6Ref,
      ctaSectionRef
    ];
    
    allRefs.forEach(ref => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    // Cleanup
    return () => {
      allRefs.forEach(ref => {
        if (ref.current) {
          observer.unobserve(ref.current);
        }
      });
    };
  }, []);

  // Scroll to top on mount - Enhanced para garantizar que siempre comience desde arriba
  useEffect(() => {
    // Scroll inmediato al cargar la página
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant' // Sin animación para carga inicial
    });
    
    // Backup scroll para asegurar que funcione en todos los navegadores
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // También asegurar que el scroll lateral esté en 0
    window.scrollTo(0, 0);
  }, []);
  
  // Enlaces base de Stripe para los diferentes planes
  const stripeLinks = {
    basic: {
      annual: "https://buy.stripe.com/cNi14o1sn3qDcUs2QO1Nu07",
      monthly: "https://buy.stripe.com/4gM8wQ0oj3qD1bKfDA1Nu08",
    },
    pro: {
      annual: "https://buy.stripe.com/cNi8wQgnhe5h7A80IG1Nu05",
      monthly: "https://buy.stripe.com/8x2fZi8UP4uH4nWbnk1Nu06",
    },
    enterprise: "https://hosthelperai.com/schedule-demo",
  };
  
  // Navigation links configuration
  const navLinks = [
    { text: t("nav.features"), href: "/#features" },
    { text: t("nav.pricing"), href: "/pricing" },
    { text: t("nav.testimonials"), href: "/testimonios" },
    { text: t("nav.login"), href: "/login", isButton: true },
  ];

  // Función para manejar el clic en los botones de los planes
  const handlePlanClick = (planId: string, _baseUrl: string, planName: string, planPrice: number | null) => {
    // Si el usuario ya está autenticado y tiene una suscripción activa, redireccionar directamente a dashboard
    if (user && hasActiveSubscription) {
      navigate('/dashboard');
      return;
    }
    
    let actualPrice = 0;
    if (planPrice !== null) {
        const planDetails = plans.find(p => p.id === planId);
        if (planDetails && planDetails.annualPrice !== null && planDetails.monthlyPrice !== null) { // Ensure prices are not null
            actualPrice = isAnnual ? planDetails.annualPrice : planDetails.monthlyPrice;
        } else if (planPrice) { // Fallback if details or specific prices are missing
            actualPrice = isAnnual ? planPrice : planPrice * 1.25;
        }
    } // If planPrice is null (e.g. enterprise), actualPrice remains 0

    // 🚀 NUEVO: Usar PaymentFlow context para iniciar el flujo
    const planData = {
      id: planId,
      name: planName,
      price: actualPrice 
    };
        
    console.log('🎯 Pricing: Iniciando flujo de pago con plan:', planData);
    startFlow(planData);
  };

  // Pricing plans
  // Define Plan interface/type
  interface Plan {
    id: string;
    name: string;
    monthlyPrice: number | null;
    annualPrice: number | null;
    features: string[];
    isPopular: boolean;
    cta: string;
    customPrice?: string; // Optional for enterprise plan
    baseLink?: string; // Optional, as it might not be used directly for redirection now
    onClickAction: () => void; // Define the type for onClickAction
  }

  const plans: Plan[] = [
    {
      id: "basic",
      name: t("pricing.basic"),
      monthlyPrice: 23.99,
      annualPrice: 19.99,
      features: [
        `1 ${t("common.property")}`,
        t("pricing.features.aiAgentVoiceCalls"),
        t("pricing.features.whatsappIntegrated"),
        t("pricing.features.interactionDashboard"),
        t("pricing.features.support247"),
      ],
      isPopular: false,
      cta: t("pricing.cta"),
      onClickAction: () => handlePlanClick("basic", isAnnual ? stripeLinks.basic.annual : stripeLinks.basic.monthly, t("pricing.basic"), isAnnual ? 19.99 : 23.99) 
    },
    {
      id: "pro",
      name: t("pricing.pro"),
      monthlyPrice: 59.99,
      annualPrice: 49.99,
      features: [
        `${t("pricing.features.upTo")} 5 ${t("common.properties")}`,
        `${t("pricing.features.allFrom")} ${t("pricing.basic")}`,
        t("pricing.features.priorityAttention"),
        t("pricing.features.advancedAnalyticsReports"),
        t("pricing.features.legalTourismConsulting"),
        t("pricing.features.programmableAutomaticCalls"),
      ],
      isPopular: true,
      cta: t("pricing.cta"),
      onClickAction: () => handlePlanClick("pro", isAnnual ? stripeLinks.pro.annual : stripeLinks.pro.monthly, t("pricing.pro"), isAnnual ? 49.99 : 59.99)
    },
    {
      id: "enterprise",
      name: t("pricing.enterprise"),
      monthlyPrice: null,
      annualPrice: null,
      customPrice: t("pricing.customPrice"),
      features: [
        t("pricing.features.unlimitedProperties"),
        `${t("pricing.features.allFrom")} ${t("pricing.pro")}`,
        t("pricing.features.dedicatedPersonalizedAPI"),
        t("pricing.features.prioritySupport247"),
        t("pricing.features.completeCustomization"),
        t("pricing.features.advancedMultichannelIntegration"),
      ],
      isPopular: false,
      cta: t("pricing.contact"),
      onClickAction: () => navigate("/schedule-demo")
    },
  ];

  // FAQ items
  const faqItems = [
    {
      question: t("pricing.faq.q5"),
      answer: t("pricing.faq.a5"),
    },
    {
      question: t("pricing.faq.q6"),
      answer: t("pricing.faq.a6"),
    },
    {
      question: t("pricing.faq.q2"),
      answer: t("pricing.faq.a2"),
    },
    {
      question: t("pricing.faq.q3"),
      answer: t("pricing.faq.a3"),
    },
    {
      question: t("pricing.faq.q4"),
      answer: t("pricing.faq.a4"),
    },
    {
      question: t("pricing.faq.q7"),
      answer: t("pricing.faq.a7"),
    },
  ];

  return (
    <div className="min-h-screen bg-white" style={{ scrollBehavior: 'smooth' }}>
      {/* Estilos adicionales para garantizar el correcto comportamiento del scroll */}
      <style>
        {`
          html, body {
            scroll-behavior: smooth;
          }
          
          /* Asegurar que la página comience desde el top */
          html {
            scroll-padding-top: 0;
          }
          
          /* Prevenir problemas de scroll en iOS */
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
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {t("pricing.title")}
              </h1>
              <p className="text-xl text-white opacity-90 max-w-2xl mx-auto">
                {t("pricing.subtitle")}
              </p>
              <Link 
                to="/schedule-demo" 
                className="mt-6 inline-block px-8 py-4 bg-white text-primary-600 font-semibold rounded-md hover:bg-gray-100 transition-colors"
              >
                {t("pricing.scheduleDemo") || "Agendar demo"}
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section className="py-16 bg-white">
          <div className="container-limited">
            {/* Toggle Monthly/Annual */}
            <div className="flex justify-center mb-12">
              <div className="bg-gray-100 p-1 rounded-lg inline-flex">
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium ${!isAnnual ? "bg-white shadow-sm text-gray-800" : "text-gray-500"}`}
                  onClick={() => setIsAnnual(false)}
                >
                  {t("pricing.monthly")}
                </button>
                <button 
                  className={`px-4 py-2 rounded-md text-sm font-medium ${isAnnual ? "bg-white shadow-sm text-gray-800" : "text-gray-500"}`}
                  onClick={() => setIsAnnual(true)}
                >
                  {t("pricing.annual")}
                  <span className="ml-1 text-primary-500 text-xs">
                    {t("pricing.annualDiscount")}
                  </span>
                </button>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 items-stretch overflow-x-auto md:overflow-x-visible scrollbar-hide px-4 md:px-0 mobile-carousel">
              {plans.map((plan, index) => (
                <div 
                  key={index}
                  ref={index === 0 ? pricingCard1Ref : index === 1 ? pricingCard2Ref : pricingCard3Ref}
                  className={`bg-white rounded-xl shadow-xl hover:shadow-2xl overflow-hidden transition-transform hover:translate-y-[-5px] border ${plan.isPopular ? "border-primary-400" : "border-gray-200"} flex flex-col w-[calc(100vw-2rem)] md:w-auto mobile-carousel-item flex-shrink-0 ${
                    visibleSections.pricingCards[index]
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-8 scale-95'
                  } transition-all duration-1000 ease-out`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  {plan.isPopular && (
                    <div className="bg-primary-400 text-white text-xs font-semibold py-1 px-3 text-center">
                      {t("pricing.mostPopular")}
                    </div>
                  )}

                  <div className="p-6 flex flex-col h-full">
                    {/* Plan name section - Fixed height */}
                    <div className="mb-4">
                      <h3 className="text-xl font-bold text-gray-900 text-center md:text-left">
                        {plan.name}
                      </h3>
                    </div>
                    
                    {/* Price section - Fixed height */}
                    <div className="mb-6">
                      {plan.customPrice ? (
                        <div className="h-16 flex flex-col justify-center">
                          <span className="text-3xl font-bold text-gray-900 text-center md:text-left">
                            {t("pricing.customPrice")}
                          </span>
                        </div>
                      ) : (
                        <div className="h-16 flex flex-col justify-center">
                          <div className="text-center md:text-left">
                            <span className="text-3xl font-bold text-gray-900">
                              € {isAnnual ? plan.annualPrice : plan.monthlyPrice}
                            </span>
                            <span className="text-gray-600 ml-1">
                              {t("pricing.month")}
                            </span>
                          </div>
                          {isAnnual && (
                            <div className="text-sm text-gray-500 mt-1 text-center md:text-left">
                              {t("pricing.billedAnnually")}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Features section - Flexible height */}
                    <div className="flex-grow mb-6">
                      <ul className="space-y-3">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <svg
                              className="w-5 h-5 text-primary-500 mt-0.5 flex-shrink-0"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span className="text-gray-600 text-base leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* CTA Button - Fixed at bottom */}
                    <div className="mt-auto">
                      <button
                        onClick={() => plan.onClickAction()}
                        className={`block w-full text-center py-3 px-4 rounded-md font-medium transition-colors ${
                          plan.isPopular 
                            ? "bg-primary-500 hover:bg-primary-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                        }`}
                      >
                        {plan.cta}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container-limited">
            <h2 
              ref={faqTitleRef}
              className={`text-2xl md:text-3xl font-bold text-gray-900 mb-10 text-center transition-all duration-1000 ease-out ${
                visibleSections.faqTitle
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-6 scale-95'
              }`}
            >
              {t("pricing.faq.title")}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {faqItems.map((item, index) => (
                <div 
                  key={index} 
                  ref={
                    index === 0 ? faqItem1Ref :
                    index === 1 ? faqItem2Ref :
                    index === 2 ? faqItem3Ref :
                    index === 3 ? faqItem4Ref :
                    index === 4 ? faqItem5Ref :
                    faqItem6Ref
                  }
                  className={`bg-white p-6 rounded-lg shadow-md transition-all duration-1000 ease-out ${
                    visibleSections.faqItems[index]
                      ? 'opacity-100 translate-y-0 scale-100'
                      : 'opacity-0 translate-y-8 scale-95'
                  }`}
                  style={{ transitionDelay: `${index * 150}ms` }}
                >
                  <h3 className={`text-lg font-semibold text-gray-900 mb-3 transition-all duration-700 ${
                    visibleSections.faqItems[index]
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-4'
                  }`}
                  style={{ transitionDelay: `${(index * 150) + 200}ms` }}
                  >
                    {item.question}
                  </h3>
                  <p className={`text-gray-600 transition-all duration-700 ${
                    visibleSections.faqItems[index]
                      ? 'opacity-100 translate-x-0'
                      : 'opacity-0 -translate-x-4'
                  }`}
                  style={{ transitionDelay: `${(index * 150) + 400}ms` }}
                  >
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section 
          ref={ctaSectionRef}
          className={`py-16 bg-gradient-to-r from-[#ECA408] to-[#F5B730] transition-all duration-1000 ease-out ${
            visibleSections.ctaSection
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="container-limited text-center">
            <h2 className={`text-2xl md:text-3xl font-bold text-white mb-4 transition-all duration-700 ${
              visibleSections.ctaSection
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '200ms' }}
            >
              {t("pricing.ctaSection.title")}
            </h2>
            <p className={`text-white text-lg mb-8 max-w-2xl mx-auto transition-all duration-700 ${
              visibleSections.ctaSection
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-4'
            }`}
            style={{ transitionDelay: '400ms' }}
            >
              {t("pricing.ctaSection.subtitle")}
            </p>
            <Link 
              to="/schedule-demo" 
              className={`inline-block px-8 py-4 bg-white text-primary-600 font-semibold rounded-md hover:bg-gray-100 transition-all duration-700 ${
                visibleSections.ctaSection
                  ? 'opacity-100 translate-y-0 scale-100'
                  : 'opacity-0 translate-y-4 scale-95'
              }`}
              style={{ transitionDelay: '600ms' }}
            >
              {t("pricing.scheduleDemo") || "Agendar demo"}
            </Link>
          </div>
        </section>
      </main>

      {/* Footer compartido */}
      <Footer />
      
      {/* Modal de registro */}
      <RegisterModal 
        isOpen={shouldShowModal} 
        onClose={() => {
          clearFlow();
        }} 
        onSuccess={() => { 
          clearFlow();
        }}
        selectedPlan={selectedPlan ? selectedPlan : undefined}
      />
    </div>
  );
};

export default Pricing; 
