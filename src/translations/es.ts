// src/translations/es.ts
// Archivo de traducciones en español

export const es = {
  // Navegación
  nav: {
    features: 'Características',
    pricing: 'Precios',
    testimonials: 'Testimonios',
    login: 'Iniciar sesión',
    contact: 'Contacto'
  },
  
  // Landing Page
  landing: {
    hero: {
      title: 'Gestión Inteligente de Alojamientos',
      subtitle: 'Automatiza tu negocio con inteligencia artificial',
      cta: 'Comenzar ahora'
    },
    features: {
      title: 'Características Principales',
      subtitle: 'Todo lo que necesitas para gestionar tus alojamientos turísticos de forma eficiente',
      chatbot: 'Chatbot 24/7',
      chatbotDesc: 'Asistente virtual para huéspedes que resuelve consultas en tiempo real',
      registration: 'Registro Automatizado',
      registrationDesc: 'Simplifica el registro de viajeros según normativa española (SES)',
      income: 'Generación de Ingresos Extra',
      incomeDesc: 'Sistema de venta cruzada de servicios con modelo de comisiones',
      dashboard: 'Dashboard Centralizado',
      dashboardDesc: 'Gestión intuitiva de todas las propiedades desde un solo lugar',
      incidents: 'Gestión de Incidencias',
      incidentsDesc: 'Sistema automatizado para resolución de problemas comunes',
      checkIn: 'Check-in automatizado',
      checkInDesc: 'Automatiza el registro de viajeros y verificación de documentos. Ahorra tiempo y evita problemas con la documentación.',
      upselling: 'Upselling inteligente',
      upsellingDesc: 'Genera ingresos adicionales ofreciendo servicios complementarios en el momento adecuado. Transfers, actividades locales, late check-out y más.'
    },
    technologies: {
      title: 'Tecnologías Utilizadas',
      frontend: 'Frontend',
      frontendDesc: 'React, TypeScript, Tailwind CSS',
      backend: 'Backend/BaaS',
      backendDesc: 'Supabase (PostgreSQL)',
      auth: 'Autenticación',
      authDesc: 'Sistema nativo de Supabase',
      integration: 'Integración',
      integrationDesc: 'API del Ministerio del Interior (SES), Botpress (chatbots)',
      deployment: 'Despliegue',
      deploymentDesc: 'Netlify/Vercel'
    },
    howItWorks: {
      title: 'Empezar a utilizar Host Helper AI es muy sencillo',
      step1: {
        title: 'Regístrate y añade tu propiedad',
        description: 'Crea tu cuenta en minutos y añade los detalles de tu propiedad. Sube fotos, descripción y las normas del alojamiento.'
      },
      step2: {
        title: 'Configura tu asistente virtual',
        description: 'Personaliza las respuestas del chatbot, información del alojamiento y servicios adicionales que quieres ofrecer.'
      },
      step3: {
        title: 'Comparte el enlace con tus huéspedes',
        description: 'Proporciona el enlace de tu asistente a tus huéspedes. Ellos podrán hacer check-in, recibir asistencia y adquirir servicios adicionales fácilmente.'
      }
    },
    cta: {
      title: 'Únete a los propietarios que están automatizando su gestión',
      subtitle: 'Ahorra tiempo, aumenta tus ingresos y mejora la satisfacción de tus huéspedes.',
      button: 'Empieza tu prueba gratuita'
    }
  },
  
  // ChatbotPage
  chatbotPage: {
    meta: {
      title: 'Chatbots Inteligentes para Alojamientos | Host Helper AI',
      description: 'Nuestros chatbots con IA avanzada atienden a tus huéspedes 24/7, resuelven dudas, optimizan check-ins y generan ingresos adicionales mediante recomendaciones personalizadas.'
    },
    hero: {
      title: 'Chatbots Inteligentes',
      subtitle: 'Beneficios de Nuestros Chatbots',
      description: 'Nuestros chatbots inteligentes combinan lo mejor de la tecnología de IA con el conocimiento específico de tu alojamiento para ofrecer una experiencia excepcional a tus huéspedes.'
    },
    benefits: {
      availability: {
        title: 'Disponible 24/7',
        description: 'Tus huéspedes reciben atención inmediata a cualquier hora del día, cualquier día de la semana. Nunca más mensajes sin responder ni huéspedes frustrados esperando.'
      },
      income: {
        title: 'Ingresos Adicionales',
        description: 'Genera comisiones extra recomendando tours, actividades y servicios cercanos a tus huéspedes. Nuestros chatbots sugieren experiencias personalizadas.'
      },
      experience: {
        title: 'Mejor Experiencia',
        description: 'Tus huéspedes obtienen respuestas inmediatas, precisas y personalizadas, mejorando su experiencia general y aumentando las valoraciones positivas.'
      }
    },
    features: {
      title: 'Características y Capacidades',
      subtitle: 'Tecnología avanzada',
      description: 'Nuestros chatbots están diseñados específicamente para la industria de alojamientos turísticos con funcionalidades que automatizan tus procesos y mejoran la experiencia de tus huéspedes.',
      multilingual: {
        title: 'Multilingüe',
        description: 'Nuestros chatbots pueden comunicarse en más de 10 idiomas, adaptándose automáticamente al idioma utilizado por el huésped.'
      },
      sesAutomation: {
        title: 'Automatización del SES',
        description: 'Gestiona automáticamente el proceso de registro obligatorio para el Ministerio del Interior, cumpliendo la normativa española.'
      },
      incidentResolution: {
        title: 'Resolución de Incidencias',
        description: 'Soluciona problemas comunes como WiFi, aire acondicionado o electrodomésticos con instrucciones específicas para tu propiedad.'
      },
      localRecommendations: {
        title: 'Recomendaciones Locales',
        description: 'Ofrece información valiosa sobre restaurantes, atracciones y actividades cercanas, con posibilidad de generar comisiones.'
      },
      conversionRate: {
        title: 'Tasa de resolución',
        value: '+80%',
        description: 'de consultas sin intervención humana'
      }
    },
    demo: {
      title: 'Un asistente virtual que realmente resuelve problemas',
      subtitle: 'Ver en acción',
      description: 'Nuestros chatbots se entrenan específicamente con la información de tu alojamiento: normas, instrucciones, recomendaciones locales y respuestas a las preguntas más comunes de tus huéspedes.',
      capabilities: {
        instructions: 'Instrucciones de check-in y check-out personalizadas',
        technicalProblems: 'Solución de problemas técnicos como WiFi o electrodomésticos',
        recommendations: 'Recomendaciones de restaurantes y actividades cercanas',
        transportation: 'Información sobre transporte público y opciones de movilidad'
      },
      videoPlaceholder: 'Video Demo del Chatbot'
    }
  },
  
  // CheckinPage
  checkinPage: {
    meta: {
      title: 'Automatización de Check-in y Registro SES | Host Helper AI',
      description: 'Automatiza el registro de viajeros según la normativa española (SES) y simplifica el proceso de check-in para tus huéspedes y para ti.'
    },
    hero: {
      title: 'Automatización de Check-in',
      subtitle: 'Beneficios del Registro Automatizado',
      description: 'Simplifica el registro de viajeros según la normativa española (SES) y optimiza el proceso de check-in, ahorrando tiempo a tus huéspedes y reduciendo tu carga administrativa.'
    },
    benefits: {
      compliance: {
        title: 'Cumplimiento Legal',
        description: 'Cumple automáticamente con la normativa española de registro de viajeros (SES) sin preocupaciones ni riesgo de sanciones por incumplimiento.'
      },
      timeSaving: {
        title: 'Ahorro de Tiempo',
        description: 'Reduce el tiempo de gestión hasta en un 90%. El proceso de registro que solía tomar horas ahora se completa en minutos sin tu intervención.'
      },
      experience: {
        title: 'Mejor Experiencia',
        description: 'Brinda a tus huéspedes una experiencia digital moderna y fluida que pueden completar antes de su llegada, facilitando un check-in sin complicaciones.'
      }
    },
    features: {
      title: 'Características y Capacidades',
      subtitle: 'Tecnología avanzada',
      description: 'Nuestro sistema de automatización de check-in está diseñado específicamente para cumplir con las normativas españolas y optimizar la gestión de alojamientos turísticos.',
      sesIntegration: {
        title: 'Integración con SES',
        description: 'Conexión directa con el sistema SES del Ministerio del Interior, garantizando el cumplimiento de la normativa española de registro de viajeros.'
      },
      customForms: {
        title: 'Formularios Personalizables',
        description: 'Adapta los formularios de registro a tu marca y estilo, incluyendo todos los campos obligatorios según la normativa vigente.'
      },
      documentCapture: {
        title: 'Captura de Documentos',
        description: 'Permite a los huéspedes subir fotografías de sus documentos de identidad de forma segura antes de su llegada.'
      },
      reservationManagement: {
        title: 'Gestión de Reservas',
        description: 'Creación manual o importación automática de reservas desde Airbnb, Booking y otras plataformas, manteniendo todos los datos sincronizados.'
      },
      registrationTime: {
        title: 'Tiempo promedio de registro',
        value: '< 2 min',
        description: 'por huésped'
      }
    },
    demo: {
      title: 'Proceso de Check-in Simplificado',
      subtitle: 'Ver en acción',
      description: 'Nuestro sistema automatiza todo el proceso de registro de viajeros, desde la recopilación de datos hasta el envío al SES, ahorrándote tiempo y evitando errores.',
      capabilities: {
        dataCollection: 'Recopilación automática de datos de reservas desde Airbnb, Booking y otras plataformas',
        links: 'Envío de enlaces personalizados a huéspedes para completar su registro',
        validation: 'Validación automática de datos y documentos de identidad',
        transmission: 'Transmisión segura y directa de la información al sistema SES'
      },
      videoPlaceholder: 'Video Demo del Sistema de Check-in'
    }
  },
  
  // UpsellingPage
  upsellingPage: {
    meta: {
      title: 'Upselling y Generación de Ingresos Adicionales | Host Helper AI',
      description: 'Aumenta tus ingresos con nuestro sistema de venta cruzada que recomienda servicios adicionales a tus huéspedes mientras mejora su experiencia.'
    },
    hero: {
      title: 'Upselling y Comisiones',
      subtitle: 'Incrementa tus Ingresos',
      description: 'Genera ingresos adicionales recomendando servicios y experiencias relevantes a tus huéspedes, mejorando su estancia mientras aumentas tu rentabilidad.'
    },
    benefits: {
      passiveIncome: {
        title: 'Ingresos Pasivos',
        description: 'Obtén comisiones por cada servicio contratado a través de tus recomendaciones, creando una fuente de ingresos adicional sin esfuerzo extra.'
      },
      betterExperience: {
        title: 'Mejor Experiencia',
        description: 'Tus huéspedes valoran las recomendaciones personalizadas, lo que mejora su experiencia general y aumenta las valoraciones positivas.'
      },
      totalControl: {
        title: 'Control Total',
        description: 'Accede a informes detallados sobre comisiones generadas, servicios más populares y tasas de conversión para optimizar tus estrategias.'
      }
    },
    features: {
      title: 'Características y Posibilidades',
      subtitle: 'Sistema inteligente',
      description: 'Nuestro sistema de upselling está diseñado para maximizar tus ingresos adicionales mientras ofrece valor real a tus huéspedes con recomendaciones relevantes.',
      utmLinks: {
        title: 'Links Personalizados con UTM',
        description: 'Genera enlaces de seguimiento automáticamente para cada recomendación, permitiendo un rastreo preciso de conversiones y comisiones.'
      },
      smartRecommendations: {
        title: 'Recomendaciones Inteligentes',
        description: 'El sistema analiza las preferencias y comportamientos de tus huéspedes para ofrecer sugerencias personalizadas de alta conversión.'
      },
      localIntegration: {
        title: 'Integración con Proveedores Locales',
        description: 'Conecta con servicios de alta calidad en tu área: desde tours y actividades hasta transfers y servicios gastronómicos.'
      },
      dashboard: {
        title: 'Dashboard de Comisiones',
        description: 'Visualiza en tiempo real tus ingresos por comisiones, con informes detallados por tipo de servicio, temporada y propiedades.'
      },
      incomeIncrease: {
        title: 'Incremento promedio',
        value: '+15%',
        description: 'en ingresos mensuales'
      }
    },
    demo: {
      title: 'Cómo Funciona el Sistema de Comisiones',
      subtitle: 'Ver en acción',
      description: 'Nuestro sistema se integra con tu operativa actual sin complejidades, generando ingresos adicionales mientras mejora la experiencia de tus huéspedes.',
      process: {
        recommendations: 'Los chatbots recomiendan servicios y experiencias relevantes a tus huéspedes',
        tracking: 'El sistema genera enlaces de seguimiento personalizados (UTM) para cada recomendación',
        commissions: 'Cada reserva o compra realizada a través de estos enlaces genera una comisión automáticamente',
        dashboard: 'Las comisiones se acumulan en tu cuenta y puedes seguirlas en tiempo real en tu dashboard'
      },
      videoPlaceholder: 'Video Demo del Sistema de Upselling'
    }
  },
  
  // Widget de Calendly
  calendly: {
    title: 'Agenda una demostración personalizada',
    subtitle: 'Reserva una cita con nuestro equipo para conocer cómo Host Helper AI puede ayudarte a automatizar la gestión de tus alojamientos turísticos',
    button: 'Reservar cita ahora',
    linkText: 'Programa una demo',
    pageTitle: 'Calendario de Demostraciones',
    pageSubtitle: 'Selecciona una fecha y hora conveniente para ti',
    backToHome: 'Volver al inicio'
  },
  
  // Testimonios
  testimonials: {
    title: 'Testimonios',
    subtitle: 'Lo que dicen nuestros clientes sobre Host Helper AI',
    more: 'Más experiencias de nuestros clientes',
    visitWebsite: 'Visitar web',
    testimonial1: {
      description: 'Alojamiento rural con encanto en Sierra de Gata, Extremadura.',
      text: 'Host Helper ha transformado nuestra gestión de reservas. Los huéspedes están encantados con la atención 24/7 y nosotros ahorramos tiempo en responder preguntas repetitivas.',
      author: 'María González',
      position: 'Propietaria'
    },
    testimonial2: {
      description: 'Apartamentos con vistas al mar con terrazas privadas y piscina en Nerja.',
      text: 'Desde que implementamos Host Helper, nuestros huéspedes pueden hacer check-in sin problemas a cualquier hora. Hemos aumentado nuestras valoraciones en un 20%.',
      author: 'Carlos Ruiz',
      position: 'Director'
    },
    testimonial3: {
      description: 'Alojamiento boutique en el centro histórico de Lucena.',
      text: 'La función de venta de servicios adicionales nos ha permitido aumentar nuestros ingresos en un 30%. Los huéspedes valoran mucho la facilidad para solicitar servicios extra.',
      author: 'Lola Martínez',
      position: 'Gerente'
    },
    additionalTestimonials: {
      testimonial1: {
        author: 'Ana Moreno',
        company: 'Apartamentos Turísticos Sevilla',
        text: 'El asistente virtual de Host Helper ha sido una revolución para nuestra gestión diaria. Los huéspedes reciben respuestas inmediatas y nosotros podemos centrarnos en mejorar otros aspectos del negocio.'
      },
      testimonial2: {
        author: 'Javier López',
        company: 'Villa Costa del Sol',
        text: 'Hemos reducido en un 70% el tiempo que dedicábamos a responder preguntas básicas de los huéspedes. La integración fue muy sencilla y el equipo de soporte siempre está disponible.'
      },
      testimonial3: {
        author: 'Patricia García',
        company: 'Hostal Madrid Centro',
        text: 'Lo que más me gusta es que los huéspedes pueden hacer check-in a cualquier hora sin problemas. Es como tener un recepcionista 24/7 pero sin los costes asociados.'
      },
      testimonial4: {
        author: 'Ricardo Fernández',
        company: 'Apartamentos Turísticos Barcelona',
        text: 'Desde que implementamos Host Helper, hemos incrementado nuestras ventas de servicios adicionales en un 40%. Es increíble cómo el chatbot puede sugerir servicios de forma natural y no intrusiva.'
      }
    },
    cta: {
      title: 'Únete a nuestros clientes satisfechos',
      subtitle: 'Comienza a disfrutar de los beneficios de Host Helper AI y transforma la gestión de tus alojamientos',
      button: 'Solicitar demo gratuita'
    }
  },
  
  // Precios
  pricing: {
    title: 'Planes y Precios',
    subtitle: 'Soluciones adaptadas a tus necesidades',
    basic: 'Básico',
    pro: 'Profesional',
    enterprise: 'Empresarial',
    month: '/mes',
    cta: 'Comenzar',
    contact: 'Contactar',
    monthly: 'Mensual',
    annual: 'Anual',
    annualDiscount: 'Ahorra 20%',
    billedAnnually: 'Facturado anualmente',
    mostPopular: 'Más popular',
    customPrice: 'Personalizado',
    features: {
      support247: 'Soporte 24/7',
      basicDataManagement: 'Gestión básica de datos',
      upTo: 'Hasta',
      allFrom: 'Todo lo de',
      automaticCalls: 'Llamadas automáticas',
      advancedDataManagement: 'Gestión avanzada de datos',
      analyticsReports: 'Analíticas e informes',
      unlimitedProperties: 'Propiedades ilimitadas',
      dedicatedAPI: 'API dedicada',
      prioritySupport: 'Soporte prioritario',
      fullCustomization: 'Personalización completa'
    },
    faq: {
      title: 'Preguntas Frecuentes',
      q1: '¿Qué incluye el soporte prioritario?',
      a1: 'El soporte prioritario incluye atención telefónica en horario extendido, tiempo de respuesta garantizado menor a 2 horas y un gestor de cuenta dedicado.',
      q2: '¿Puedo cambiar de plan más adelante?',
      a2: 'Sí, puedes actualizar o cambiar tu plan en cualquier momento de manera prorrateada.',
      q3: '¿En qué idiomas está disponible el asistente?',
      a3: 'El asistente está disponible en español e inglés, con capacidad para detectar automáticamente el idioma del huésped y responder adecuadamente.',
      q4: '¿Cómo funciona el sistema de ingresos extra?',
      a4: 'El asistente ofrece proactivamente servicios adicionales a tus huéspedes, como transfers, entradas a espectáculos o reservas en restaurantes, generando comisiones para ti.',
      q5: '¿Es fácil implementar Host Helper AI?',
      a5: 'Sí, la implementación es muy sencilla. Nuestro equipo te guiará durante todo el proceso y tendrás tu asistente virtual funcionando en menos de 24 horas.',
      q6: '¿Hay un período de prueba?',
      a6: 'Ofrecemos una demostración personalizada gratuita donde podrás ver cómo funciona el asistente con tus propios datos y casos de uso específicos.',
      q7: '¿Qué soporte técnico está incluido?',
      a7: 'Todos los planes incluyen soporte técnico por correo electrónico. Los planes Pro y Empresarial también incluyen soporte prioritario y acceso a un gestor de cuenta dedicado.'
    },
    ctaSection: {
      title: '¿Listo para revolucionar la gestión de tus alojamientos?',
      subtitle: 'Comienza a ahorrar tiempo y aumentar tus ingresos con Host Helper AI hoy mismo',
      button: 'Iniciar prueba gratuita'
    }
  },
  
  // Dashboard
  dashboard: {
    welcome: 'Bienvenido al dashboard',
    description: 'Esta es una versión preliminar del dashboard para Host Helper AI. Aquí podrás gestionar tus alojamientos, revisar reservas y acceder a todas las funcionalidades de nuestra plataforma.',
    notice: 'Estamos trabajando en la implementación de todas las funcionalidades. Por ahora, esto es una demo de la interfaz.',
    loading: 'Cargando...',
    properties: {
      title: 'Propiedades',
      total: 'Total de propiedades registradas',
      view: 'Ver propiedades',
      add: 'Añadir propiedad'
    },
    reservations: {
      title: 'Reservas Activas',
      confirmed: 'Reservas confirmadas y pendientes',
      view: 'Ver reservas',
      register: 'Registrar reserva'
    },
    registrations: {
      title: 'Registro SES',
      pending: 'Pendientes de envío al SES',
      view: 'Ver registros',
      manage: 'Gestionar registros SES'
    },
    quickActions: {
      title: 'Acciones Rápidas',
      messages: 'Ver mensajes',
      help: 'Ayuda'
    },
    incidents: {
      title: 'Incidencias Recientes',
      empty: 'No hay incidencias para mostrar',
      viewAll: 'Ver todas las incidencias',
      status: {
        resolved: 'Resuelta',
        pending: 'Pendiente'
      },
      categories: {
        all: 'Todas',
        checkInOut: 'Check-in/Check-out',
        propertyIssue: 'Problemas de Propiedad',
        touristInfo: 'Información Turística',
        emergency: 'Emergencias',
        other: 'Otros'
      }
    },
    ses: {
      title: 'Registros SES Recientes',
      status: {
        approved: 'Aprobado',
        pending: 'Pendiente',
        error: 'Error'
      }
    },
    menu: {
      dashboard: 'Dashboard',
      properties: 'Propiedades',
      reservations: 'Reservas',
      registrations: 'Registro SES',
      account: 'Mi Cuenta',
      settings: 'Configuración',
      logout: 'Cerrar sesión'
    }
  },
  
  // Autenticación
  auth: {
    loginTitle: 'Inicia sesión en tu cuenta',
    emailLabel: 'Correo electrónico',
    passwordLabel: 'Contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    login: 'Iniciar sesión',
    loggingIn: 'Iniciando sesión...',
    noAccount: '¿No tienes una cuenta?',
    registerNow: 'Regístrate ahora',
    forceSync: 'Forzar sincronización con Supabase',
    invalidCredentials: 'Credenciales incorrectas. Verifica tu email y contraseña.',
    emailNotConfirmed: 'Necesitas confirmar tu correo electrónico antes de iniciar sesión. Por favor, revisa tu bandeja de entrada ({email}) y haz clic en el enlace de confirmación. Si no encuentras el correo, revisa tu carpeta de spam.',
    connectionError: 'Error de conexión: No se pudo conectar con el servidor. Verifica tus credenciales de Supabase en el archivo .env',
    loginError: 'Error durante el inicio de sesión',
    unknownError: 'Ha ocurrido un error desconocido al iniciar sesión'
  },
  
  // Footer
  footer: {
    support: 'Con el apoyo de',
    follow: 'Síguenos',
    contact: 'Contacto',
    slogan: 'Automatizando la gestión de alojamientos turísticos con IA',
    copyright: '© 2025 Host Helper AI. Todos los derechos reservados.'
  },
  
  // Común
  common: {
    language: 'Idioma',
    spanish: 'Español',
    english: 'English',
    property: 'propiedad',
    properties: 'propiedades'
  }
}; 