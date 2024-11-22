// languageManager.js 
// FOR THE WHOLE WEBSITE !IMPORTANT

const translations = {
  en: {
      // Hero Section
      heroTitle: "Host Helper AI",
      heroSubtitle: "AI-powered assistance for Airbnb hosts",
      getStarted: "Get Started",
      
      // Navigation
      summary: "Summary",
      joinUs: "Join us",
      ourImpact: "Our impact",
      prices: "Prices",
      statistics: "Statistics",
      
      // Cards Section
      meetHostHelper: "Meet HostHelper AI",
      meetHostHelperDesc: "Your intelligent companion in the world of property hosting, designed to revolutionize how you manage your Airbnb listings with cutting-edge AI technology.",
      smartProperty: "Smart Property Management",
      smartPropertyDesc: "Experience seamless property management with our AI that monitors your properties 24/7, handling bookings, guest inquiries, and cleaning services coordination.",
      predictiveMaintenance: "Predictive Maintenance",
      predictiveMaintenanceDesc: "Stay ahead of maintenance needs with our advanced AI algorithms that predict and schedule necessary services before issues arise.",
      guestExperience: "Guest Experience Enhancement",
      guestExperienceDesc: "Elevate your hosting game with personalized guest interactions, from custom welcome messages to curated local recommendations.",
      
      // Features
      smartHostingSolutions: "Smart Hosting Solutions",
      support: "24/7 Support",
      supportDesc: "Instant assistance around the clock for your guests and property management needs",
      homeGuide: "Home Guide",
      homeGuideDesc: "Comprehensive digital guides for every aspect of your property",
      localTips: "Local Tips",
      localTipsDesc: "Curated recommendations for the best local experiences",
      aiConcierge: "AI Concierge",
      aiConciergeDesc: "Smart assistance powered by advanced AI technology",
      
      // Stats
      keyMetrics: "Key Metrics",
      activeUsers: "Active users",
      averageEvaluation: "Average positive evaluation (%)",
      averageMessages: "Average number of responded messages",
      
      // Chat Demo
      whatsappShowcase: "WhatsApp Showcase",
      whatsappDesc: "Experience an interactive preview of our AI assistant. Our actual product offers enhanced features, advanced AI capabilities, and seamless integration.",
      typeMessage: "Type a message...",
      whereAreTowels: "Where are the towels?",
      wifiPassword: "What's the Wi-Fi password?",
      whatAddress: "What's my address?",
      
      // Gallery
      ourClients: "Our Clients",
      luxuryVilla: "Luxury Villa",
      luxuryVillaDesc: "Elegant beachfront villa with panoramic ocean views.",
      urbanLoft: "Urban Loft",
      urbanLoftDesc: "Modern city living in the heart of downtown.",
      seasideCottage: "Beautiful view to the sea",
      seasideCottageDesc: "A amazing apartment with view straight to the sea",
      mountainRetreat: "Mountain Retreat",
      mountainRetreatDesc: "Cozy cabin with stunning mountain views.",
      forestHideaway: "Forest Hideaway",
      forestHideawayDesc: "Secluded forest retreat with luxury amenities.",
      
      // Contact
      getInTouch: "Get in Touch",
      fullName: "Full Name",
      emailAddress: "Email Address",
      subject: "Subject",
      yourMessage: "Your Message",
      sendMessage: "Send Message",
      
      // Footer
      copyright: "© 2024 Host Helper AI",
      empowering: "Empowering Airbnb hosts with AI-driven solutions",
      
      // Common
      perMonth: "/month",
      logoAlt: "Host Helper AI Logo",
      close: "Close",
      currency: "€",
      
      // Auth
      welcomeBack: "Welcome Back",
      createAccount: "Create Account",
      password: "Password",
      signIn: "Sign In",
      username: "Username",
      email: "Email"
  },
  es: {
      // Hero Section
      heroTitle: "Host Helper AI",
      heroSubtitle: "Asistencia con AI para anfitriones de Airbnb",
      getStarted: "Comenzar",
      
      // Navigation
      summary: "Resumen",
      joinUs: "Únete",
      ourImpact: "Nuestro impacto",
      prices: "Precios",
      statistics: "Estadísticas",
      
      // Cards Section
      meetHostHelper: "Conoce a HostHelper AI",
      meetHostHelperDesc: "Tu compañero inteligente en el mundo del alojamiento, diseñado para revolucionar cómo gestionas tus listados de Airbnb con tecnología de IA.",
      smartProperty: "Gestión Inteligente de Propiedades",
      smartPropertyDesc: "Experimenta una gestión perfecta con nuestra AI que monitorea tus propiedades 24/7, manejando reservas y consultas de huéspedes.",
      predictiveMaintenance: "Mantenimiento Predictivo",
      predictiveMaintenanceDesc: "Anticípate a las necesidades de mantenimiento con nuestros algoritmos avanzados de AI que predicen y programan servicios necesarios.",
      guestExperience: "Mejora de Experiencia del Huésped",
      guestExperienceDesc: "Eleva tu juego de anfitrión con interacciones personalizadas, desde mensajes de bienvenida hasta recomendaciones locales.",
      
      // Features
      smartHostingSolutions: "Soluciones Inteligentes de Alojamiento",
      support: "Soporte 24/7",
      supportDesc: "Asistencia instantánea las 24 horas para las necesidades de tus huéspedes y gestión de propiedades",
      homeGuide: "Guía del Hogar",
      homeGuideDesc: "Guías digitales completas para cada aspecto de tu propiedad",
      localTips: "Consejos Locales",
      localTipsDesc: "Recomendaciones seleccionadas para las mejores experiencias locales",
      aiConcierge: "Conserje IA",
      aiConciergeDesc: "Asistencia inteligente impulsada por tecnología avanzada de IA",
      
      // Stats
      keyMetrics: "Métricas Clave",
      activeUsers: "Usuarios activos",
      averageEvaluation: "Evaluación positiva promedio (%)",
      averageMessages: "Promedio de mensajes respondidos",
      
      // Chat Demo
      whatsappShowcase: "Demostración de WhatsApp",
      whatsappDesc: "Experimente una vista previa interactiva de nuestro asistente de IA. Nuestro producto real ofrece características mejoradas.",
      typeMessage: "Escribe un mensaje...",
      whereAreTowels: "¿Dónde están las toallas?",
      wifiPassword: "¿Cuál es la contraseña del Wi-Fi?",
      whatAddress: "¿Cuál es mi dirección?",
      
      // Gallery
      ourClients: "Nuestros Clientes",
      luxuryVilla: "Villa de Lujo",
      luxuryVillaDesc: "Elegante villa frente al mar con vistas panorámicas al océano.",
      urbanLoft: "Loft Urbano",
      urbanLoftDesc: "Vida moderna en el corazón de la ciudad.",
      seasideCottage: "Bonitas vistas al mar",
      seasideCottageDesc: "Un apartamento increíble con vistas directas al mar",
      mountainRetreat: "Refugio de Montaña",
      mountainRetreatDesc: "Cabaña acogedora con impresionantes vistas a la montaña.",
      forestHideaway: "Refugio del Bosque",
      forestHideawayDesc: "Retiro secreto en el bosque con amenidades de lujo.",
      
      // Contact
      getInTouch: "Contáctanos",
      fullName: "Nombre Completo",
      emailAddress: "Correo Electrónico",
      subject: "Asunto",
      yourMessage: "Tu Mensaje",
      sendMessage: "Enviar Mensaje",
      
      // Footer
      copyright: "© 2024 Host Helper AI",
      empowering: "Empoderando a los anfitriones de Airbnb con soluciones impulsadas por IA",
      
      // Common
      perMonth: "/mes",
      logoAlt: "Logo de Host Helper AI",
      close: "Cerrar",
      currency: "€",
      
      // Auth
      welcomeBack: "Bienvenido de nuevo",
      createAccount: "Crear cuenta",
      password: "Contraseña",
      signIn: "Iniciar sesión",
      username: "Nombre de usuario",
      email: "Correo electrónico"
  }
};

const LanguageManager = () => {
  const [currentLang, setCurrentLang] = React.useState('en');

  React.useEffect(() => {
      updateContent(currentLang);
  }, [currentLang]);

  const updateContent = (lang) => {
      // Update all elements with data-translate attribute
      const elements = document.querySelectorAll('[data-translate]');
      elements.forEach(element => {
          const key = element.getAttribute('data-translate');
          if (translations[lang][key]) {
              if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                  element.placeholder = translations[lang][key];
              } else {
                  element.textContent = translations[lang][key];
              }
          }
      });

      // Update chat language if the function exists
      if (window.updateChatLanguage) {
          window.updateChatLanguage(lang);
      }
  };

  // Make selectLanguage available globally
  window.selectLanguage = (lang) => {
      setCurrentLang(lang);
      const overlay = document.getElementById('languageOverlay');
      if (overlay) {
          overlay.classList.add('hiding');
          setTimeout(() => overlay.classList.add('hidden'), 500);
      }
  };

  return null;
};

// Make translations available globally
window.translations = translations;

// Render the component
ReactDOM.render(
  <LanguageManager />,
  document.getElementById('react-main-content')
);