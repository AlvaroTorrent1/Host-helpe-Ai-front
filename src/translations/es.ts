// src/translations/es.ts
// Archivo de traducciones en español

export const es = {
  // Navegación
  nav: {
    features: "Características",
    pricing: "Precios",
    testimonials: "Testimonios",
    login: "Iniciar sesión",
    contact: "Contacto",
  },
  
  // Landing Page
  landing: {
    hero: {
      title: "Gestión Inteligente de Alojamientos",
      subtitle: "Automatiza tu negocio con inteligencia artificial",
      cta: "Comenzar ahora",
    },
    features: {
      title: "Características Principales",
      subtitle:
        "Todo lo que necesitas para gestionar tus alojamientos turísticos de forma eficiente",
      chatbot: "Agentes IA 24/7",
      chatbotDesc:
        "Agentes de IA para huéspedes que resuelven consultas en tiempo real",
      registration: "Registro Automatizado",
      registrationDesc:
        "Simplifica el registro de viajeros según normativa española (SES)",
      income: "Generación de Ingresos Extra",
      incomeDesc:
        "Sistema de venta cruzada de servicios con modelo de comisiones",
      dashboard: "Dashboard Centralizado",
      dashboardDesc:
        "Gestión intuitiva de todas las propiedades desde un solo lugar",
      incidents: "Gestión de Incidencias",
      incidentsDesc:
        "Sistema automatizado para resolución de problemas comunes",
      checkIn: "Check-in automatizado",
      checkInDesc:
        "Automatiza el registro de viajeros y verificación de documentos. Ahorra tiempo y evita problemas con la documentación.",
      upselling: "Upselling inteligente",
      upsellingDesc:
        "Genera ingresos adicionales ofreciendo servicios complementarios en el momento adecuado. Transfers, actividades locales, late check-out y más.",
    },
    technologies: {
      title: "Tecnologías Utilizadas",
      frontend: "Frontend",
      frontendDesc: "React, TypeScript, Tailwind CSS",
      backend: "Backend/BaaS",
      backendDesc: "Supabase (PostgreSQL)",
      auth: "Autenticación",
      authDesc: "Sistema nativo de Supabase",
      integration: "Integración",
      integrationDesc:
        "API del Ministerio del Interior (SES), Botpress (chatbots)",
      deployment: "Despliegue",
      deploymentDesc: "Netlify/Vercel",
    },
    howItWorks: {
      title: "Empezar a utilizar Host Helper Ai es muy sencillo",
      step1: {
        title: "Regístrate y añade tu propiedad",
        description:
          "Crea tu cuenta en minutos y añade los detalles de tu propiedad. Sube fotos, descripción y las normas del alojamiento.",
      },
      step2: {
        title: "Configura tus agentes de IA",
        description:
          "Personaliza las respuestas del chatbot, información del alojamiento y servicios adicionales que quieres ofrecer.",
      },
      step3: {
        title: "Comparte el enlace con tus huéspedes",
        description:
          "Proporciona el enlace de tus agentes de IA a tus huéspedes. Ellos podrán hacer check-in, recibir asistencia y adquirir servicios adicionales fácilmente.",
      },
    },
    cta: {
      title: "Únete a los propietarios que están automatizando su gestión",
      subtitle:
        "Ahorra tiempo, aumenta tus ingresos y mejora la satisfacción de tus huéspedes.",
      button: "Comenzar ahora",
    },
  },

  // ChatbotPage - Actualizado para Agentes de IA
  chatbotPage: {
    meta: {
      title: "Agentes de IA para Alojamientos Turísticos | Host Helper AI",
      description:
        "Agentes de IA avanzados que atienden por teléfono 24/7, gestionan incidencias y coordinan con proveedores. Integración con WhatsApp y Telegram para property managers.",
    },
    hero: {
      title: "Agentes de IA Inteligentes",
      subtitle: "Atención Telefónica 24/7 para tus Alojamientos",
      description:
        "Nuestros agentes de IA atienden llamadas telefónicas las 24 horas, gestionan incidencias en tiempo real y coordinan con equipos de mantenimiento o limpieza. Integrados con WhatsApp y Telegram para enviar información multimedia, ubicaciones y enlaces. Cuando necesitan ayuda, colaboran entre ellos o escalan a tu equipo humano.",
    },
    benefits: {
      phoneService: {
        title: "Atención Telefónica Inteligente",
        description:
          "Tus huéspedes llaman a un número de teléfono y conversan por voz con nuestros agentes de IA. Disponibles las 24 horas, entienden múltiples idiomas y resuelven consultas al instante.",
      },
      multichannel: {
        title: "WhatsApp & Telegram Integrados",
        description:
          "Durante las llamadas, los agentes envían imágenes, ubicaciones, enlaces y documentos por WhatsApp o Telegram. Combinan la conversación por voz con contenido multimedia al instante.",
      },
      teamwork: {
        title: "Trabajo en Equipo Inteligente",
        description:
          "Cuando un agente no puede resolver algo, colabora con otros agentes especialistas o escala a tu equipo humano. Pueden coordinar con equipos de mantenimiento o limpieza durante la misma llamada.",
      },
    },
    features: {
      title: "Capacidades de Nuestros Agentes de IA",
      subtitle: "Reduce tu carga de trabajo mientras tus huéspedes reciben atención profesional las 24 horas.",
      multilingual: {
        title: "Conversación Natural Multiidioma",
        description:
          "Conversan por voz como humanos en español, inglés, francés, alemán y más idiomas. Comprenden acentos y contexto para ofrecer respuestas precisas.",
      },
      maintenanceCoordination: {
        title: "Coordinación con Equipos de Mantenimiento",
        description:
          "Durante la llamada con el huésped, pueden contactar simultáneamente con fontaneros, electricistas o equipos de limpieza. Coordinan la cita y confirman al huésped en tiempo real.",
      },
      intelligentEscalation: {
        title: "Escalación Inteligente",
        description:
          "Cuando no pueden resolver algo, colaboran con agentes especialistas o transfieren la llamada a tu equipo con todo el contexto de la conversación.",
      },
      personalizedRecommendations: {
        title: "Recomendaciones Personalizadas",
        description:
          "Conocen tu zona perfectamente y envían por WhatsApp fotos de restaurantes, mapas de ubicación, enlaces de reservas y recomendaciones personalizadas según las preferencias del huésped.",
      },
      responseTime: {
        title: "Tiempo Respuesta",
        value: "< 3 segundos",
        description: "Resolución instantánea",
      },
    },
    demo: {
      title: "Ejemplo: Avería de Fontanería",
      subtitle: "Caso Práctico Real",
      description:
        "Descubre cómo nuestros agentes de IA resuelven incidencias reales paso a paso, coordinando con equipos de mantenimiento durante la misma llamada del huésped.",
      steps: {
        step1: {
          title: "Huésped llama:",
          description: "No hay agua caliente en el apartamento",
        },
        step2: {
          title: "Diagnóstico y escalación:",
          description: "El agente entiende el problema y al no poder resolverlo transfiere la llamada a un agente especialista que contacta directamente con el fontanero",
        },
        step3: {
          title: "Coordinación especializada:",
          description: "El agente especialista explica la avería al fontanero con todos los detalles y agenda la cita de reparación",
        },
        step4: {
          title: "Confirmación al huésped:",
          description: "El fontanero llegará mañana a las 10:00. Te envío sus datos por WhatsApp",
        },
      },
      workflow: {
        guest: "Huésped",
        aiAgent: "Agente IA",
        whatsapp: "WhatsApp",
        plumber: "Fontanero",
        coordination: "Coordinación en Tiempo Real",
        resolution: "Todo resuelto en una sola llamada",
      },
    },
  },

  // CheckinPage
  checkinPage: {
    meta: {
      title: "Automatización de Check-in y Registro SES | Host Helper AI",
      description:
        "Automatiza el registro de viajeros según la normativa española (SES) y simplifica el proceso de check-in para tus huéspedes y para ti.",
    },
    hero: {
      title: "Automatización de Check-in",
      subtitle: "Beneficios del Registro Automatizado",
      description:
        "Simplifica el registro de viajeros según la normativa española (SES) y optimiza el proceso de check-in, ahorrando tiempo a tus huéspedes y reduciendo tu carga administrativa.",
    },
    benefits: {
      compliance: {
        title: "Cumplimiento Legal",
        description:
          "Cumple automáticamente con la normativa española de registro de viajeros (SES) sin preocupaciones ni riesgo de sanciones por incumplimiento.",
      },
      timeSaving: {
        title: "Ahorro de Tiempo",
        description:
          "Reduce el tiempo de gestión hasta en un 90%. El proceso de registro que solía tomar horas ahora se completa en minutos sin tu intervención.",
      },
      experience: {
        title: "Mejor Experiencia",
        description:
          "Brinda a tus huéspedes una experiencia digital moderna y fluida que pueden completar antes de su llegada, facilitando un check-in sin complicaciones.",
      },
    },
    features: {
      title: "Características y Capacidades",
      subtitle: "Tecnología avanzada",
      description:
        "Nuestro sistema de automatización de check-in está diseñado específicamente para cumplir con las normativas españolas y optimizar la gestión de alojamientos turísticos.",
      sesIntegration: {
        title: "Integración con SES",
        description:
          "Conexión directa con el sistema SES del Ministerio del Interior, garantizando el cumplimiento de la normativa española de registro de viajeros.",
      },
      customForms: {
        title: "Formularios Personalizables",
        description:
          "Adapta los formularios de registro a tu marca y estilo, incluyendo todos los campos obligatorios según la normativa vigente.",
      },
      documentCapture: {
        title: "Captura de Documentos",
        description:
          "Permite a los huéspedes subir fotografías de sus documentos de identidad de forma segura antes de su llegada.",
      },
      reservationManagement: {
        title: "Gestión de Reservas",
        description:
          "Creación manual o importación automática de reservas desde Airbnb, Booking y otras plataformas, manteniendo todos los datos sincronizados.",
      },
      registrationTime: {
        title: "Tiempo promedio de registro",
        value: "< 2 min",
        description: "por huésped",
      },
    },
    demo: {
      title: "Proceso de Check-in Simplificado",
      subtitle: "Ver en acción",
      description:
        "Nuestro sistema automatiza todo el proceso de registro de viajeros, desde la recopilación de datos hasta el envío al SES, ahorrándote tiempo y evitando errores.",
      capabilities: {
        dataCollection:
          "Recopilación automática de datos de reservas desde Airbnb, Booking y otras plataformas",
        links:
          "Envío de enlaces personalizados a huéspedes para completar su registro",
        validation: "Validación automática de datos y documentos de identidad",
        transmission:
          "Transmisión segura y directa de la información al sistema SES",
      },
      videoPlaceholder: "Video Demo del Sistema de Check-in",
    },
  },

  // UpsellingPage
  upsellingPage: {
    meta: {
      title: "Upselling y Generación de Ingresos Adicionales | Host Helper AI",
      description:
        "Aumenta tus ingresos con nuestro sistema de venta cruzada que recomienda servicios adicionales a tus huéspedes mientras mejora su experiencia.",
    },
    hero: {
      title: "Upselling y Comisiones",
      subtitle: "Incrementa tus Ingresos",
      description:
        "Genera ingresos adicionales recomendando servicios y experiencias relevantes a tus huéspedes, mejorando su estancia mientras aumentas tu rentabilidad.",
    },
    benefits: {
      passiveIncome: {
        title: "Ingresos Pasivos",
        description:
          "Obtén comisiones por cada servicio contratado a través de tus recomendaciones, creando una fuente de ingresos adicional sin esfuerzo extra.",
      },
      betterExperience: {
        title: "Mejor Experiencia",
        description:
          "Tus huéspedes valoran las recomendaciones personalizadas, lo que mejora su experiencia general y aumenta las valoraciones positivas.",
      },
      totalControl: {
        title: "Control Total",
        description:
          "Accede a informes detallados sobre comisiones generadas, servicios más populares y tasas de conversión para optimizar tus estrategias.",
      },
    },
    features: {
      title: "Características y Posibilidades",
      subtitle: "Sistema inteligente",
      description:
        "Nuestro sistema de upselling está diseñado para maximizar tus ingresos adicionales mientras ofrece valor real a tus huéspedes con recomendaciones relevantes.",
      utmLinks: {
        title: "Links Personalizados con UTM",
        description:
          "Genera enlaces de seguimiento automáticamente para cada recomendación, permitiendo un rastreo preciso de conversiones y comisiones.",
      },
      smartRecommendations: {
        title: "Recomendaciones Inteligentes",
        description:
          "El sistema analiza las preferencias y comportamientos de tus huéspedes para ofrecer sugerencias personalizadas de alta conversión.",
      },
      localIntegration: {
        title: "Integración con Proveedores Locales",
        description:
          "Conecta con servicios de alta calidad en tu área: desde tours y actividades hasta transfers y servicios gastronómicos.",
      },
      dashboard: {
        title: "Dashboard de Comisiones",
        description:
          "Visualiza en tiempo real tus ingresos por comisiones, con informes detallados por tipo de servicio, temporada y propiedades.",
      },
      incomeIncrease: {
        title: "Incremento promedio",
        value: "+15%",
        description: "en ingresos mensuales",
      },
    },
    demo: {
      title: "Cómo Funciona el Sistema de Comisiones",
      subtitle: "Ver en acción",
      description:
        "Nuestro sistema se integra con tu operativa actual sin complejidades, generando ingresos adicionales mientras mejora la experiencia de tus huéspedes.",
      process: {
        recommendations:
          "Los chatbots recomiendan servicios y experiencias relevantes a tus huéspedes",
        tracking:
          "El sistema genera enlaces de seguimiento personalizados (UTM) para cada recomendación",
        commissions:
          "Cada reserva o compra realizada a través de estos enlaces genera una comisión automáticamente",
        dashboard:
          "Las comisiones se acumulan en tu cuenta y puedes seguirlas en tiempo real en tu dashboard",
      },
      videoPlaceholder: "Video Demo del Sistema de Upselling",
    },
  },
  
  // Widget de Calendly
  calendly: {
    title: "Agenda una demostración personalizada",
    subtitle:
      "Reserva una cita con nuestro equipo para conocer cómo Host Helper AI puede ayudarte a automatizar la gestión de tus alojamientos turísticos",
    button: "Reservar cita ahora",
    linkText: "Agendar demo",
    pageTitle: "Calendario de Demostraciones",
    pageSubtitle: "Selecciona una fecha y hora conveniente para ti",
    backToHome: "Volver al inicio",
  },
  
  // Testimonios
  testimonials: {
    title: "Testimonios",
    subtitle: "Lo que dicen nuestros clientes sobre Host Helper AI",
    more: "Más experiencias de nuestros clientes",
    visitWebsite: "Visitar web",
    testimonial1: {
      description:
        "Alojamiento rural con encanto en Sierra de Gata, Extremadura.",
      text: "Host Helper ha transformado nuestra gestión de reservas. Los huéspedes están encantados con la atención 24/7 y nosotros ahorramos tiempo en responder preguntas repetitivas.",
      author: "María González",
      position: "Propietaria",
    },
    testimonial2: {
      description:
        "Casa de vacaciones en el auténtico pueblo español de Ojén, Andalucía, con vistas a las montañas y cerca de la playa.",
      text: "Host Helper AI ha sido fundamental para gestionar Casa María Flora desde los Países Bajos. ¡Una solución perfecta para propietarios internacionales!",
      author: "Elske Lena",
      position: "Propietaria",
    },
    testimonial3: {
      description: "Alojamiento boutique en el centro histórico de Lucena.",
      text: "La función de venta de servicios adicionales nos ha permitido aumentar nuestros ingresos en un 30%. Los huéspedes valoran mucho la facilidad para solicitar servicios extra.",
      author: "Lola Martínez",
      position: "Gerente",
    },
    additionalTestimonials: {
      testimonial1: {
        author: "Ana Moreno",
        company: "Apartamentos Turísticos Sevilla",
        text: "Los agentes de IA de Host Helper han sido una revolución para nuestra gestión diaria. Los huéspedes reciben respuestas inmediatas y nosotros podemos centrarnos en mejorar otros aspectos del negocio.",
      },
      testimonial2: {
        author: "Javier López",
        company: "Villa Costa del Sol",
        text: "Hemos reducido en un 70% el tiempo que dedicábamos a responder preguntas básicas de los huéspedes. La integración fue muy sencilla y el equipo de soporte siempre está disponible.",
      },
      testimonial3: {
        author: "Patricia García",
        company: "Hostal Madrid Centro",
        text: "Lo que más me gusta es que los huéspedes pueden hacer check-in a cualquier hora sin problemas. Es como tener un recepcionista 24/7 pero sin los costes asociados.",
      },
      testimonial4: {
        author: "Ricardo Fernández",
        company: "Apartamentos Turísticos Barcelona",
        text: "Desde que implementamos Host Helper, hemos incrementado nuestras ventas de servicios adicionales en un 40%. Es increíble cómo el chatbot puede sugerir servicios de forma natural y no intrusiva.",
      },
    },
    cta: {
      title: "Únete a nuestros clientes satisfechos",
      subtitle:
        "Comienza a disfrutar de los beneficios de Host Helper AI y transforma la gestión de tus alojamientos",
      button: "Solicitar demo gratuita",
    },
  },
  
  // Precios
  pricing: {
    title: "Planes y Precios",
    subtitle: "Soluciones adaptadas a tus necesidades",
    basic: "Básico",
    pro: "Profesional",
    enterprise: "Empresarial",
    month: "/mes",
    cta: "Comenzar",
    contact: "Contactar",
    monthly: "Mensual",
    annual: "Anual",
    annualDiscount: "Ahorra 20%",
    billedAnnually: "Facturado anualmente",
    mostPopular: "Más popular",
    customPrice: "Personalizado",
    scheduleDemo: "Agendar demo",
    features: {
      support247: "Soporte 24/7",
      basicDataManagement: "Gestión básica de datos",
      upTo: "Hasta",
      allFrom: "Todo lo de",
      automaticCalls: "Llamadas automáticas",
      advancedDataManagement: "Gestión avanzada de datos",
      analyticsReports: "Analíticas e informes",
      unlimitedProperties: "Propiedades ilimitadas",
      dedicatedAPI: "API dedicada",
      prioritySupport: "Soporte prioritario",
      fullCustomization: "Personalización completa",
      aiAgentVoiceCalls: "Agente IA con llamadas de voz",
      whatsappIntegrated: "WhatsApp integrado",
      interactionDashboard: "Dashboard de interacciones",
      priorityAttention: "Atención prioritaria",
      advancedAnalyticsReports: "Analíticas e informes avanzados",
      legalTourismConsulting: "Consultoría legal turística",
      programmableAutomaticCalls: "Llamadas automáticas programables",
      dedicatedPersonalizedAPI: "API dedicada y personalizada",
      prioritySupport247: "Soporte prioritario 24/7",
      completeCustomization: "Personalización completa",
      advancedMultichannelIntegration: "Integración avanzada multicanal",
    },
    faq: {
      title: "Preguntas Frecuentes",
      q1: "¿Qué incluye el soporte prioritario?",
      a1: "El soporte prioritario incluye atención telefónica en horario extendido, tiempo de respuesta garantizado menor a 2 horas y un gestor de cuenta dedicado.",
      q2: "¿Puedo cambiar de plan más adelante?",
      a2: "Sí, puedes actualizar o cambiar tu plan en cualquier momento de manera prorrateada.",
      q3: "¿En qué idiomas está disponible el asistente?",
      a3: "El asistente está disponible en español e inglés, con capacidad para detectar automáticamente el idioma del huésped y responder adecuadamente.",
      q4: "¿Cómo funciona el sistema de ingresos extra?",
      a4: "El asistente ofrece proactivamente servicios adicionales a tus huéspedes, como transfers, entradas a espectáculos o reservas en restaurantes, generando comisiones para ti.",
      q5: "¿Es fácil implementar Host Helper AI?",
      a5: "Sí, la implementación es muy sencilla. Nuestro equipo te guiará durante todo el proceso y tendrás tus agentes de IA funcionando en menos de 24 horas.",
      q6: "¿Hay un período de prueba?",
      a6: "Ofrecemos una demostración personalizada gratuita donde podrás ver cómo funcionan los agentes de IA con tus propios datos y casos de uso específicos.",
      q7: "¿Qué soporte técnico está incluido?",
      a7: "Todos los planes incluyen soporte técnico por correo electrónico. Los planes Pro y Empresarial también incluyen soporte prioritario y acceso a un gestor de cuenta dedicado.",
    },
    ctaSection: {
      title: "¿Listo para revolucionar la gestión de tus alojamientos?",
      subtitle:
        "Comienza a ahorrar tiempo y aumentar tus ingresos con Host Helper AI hoy mismo",
      button: "Iniciar prueba gratuita",
    },
  },
  
  // Dashboard
  dashboard: {
    welcome: "Bienvenido al dashboard",
    description:
      "Esta es una versión preliminar del dashboard para Host Helper AI. Aquí podrás gestionar tus alojamientos, revisar reservas y acceder a todas las funcionalidades de nuestra plataforma.",
    notice:
      "Estamos trabajando en la implementación de todas las funcionalidades. Por ahora, esto es una demo de la interfaz.",
    loading: "Cargando...",
    stats: {
      properties: "Propiedades",
      pendingReservations: "Reservas Pendientes",
      incidents: "Incidencias",
      activePropertiesFooter: "Propiedades activas",
      pendingReservationsFooter: "Porcentaje: {{percent}}%",
      noReservations: "Sin reservas",
      resolutionRate: "Tasa de resolución: {{rate}}%"
    },
    properties: {
      title: "Tus Propiedades",
      subtitle: "Gestiona todas tus propiedades desde aquí",
      total: "Total de propiedades",
      view: "Ver propiedades",
      add: "Añadir propiedad",
      filters: {
        all: "Todas",
        active: "Activas",
        inactive: "Inactivas"
      },
      search: {
        placeholder: "Buscar propiedades..."
      },
      status: {
        active: "Activo",
        inactive: "Inactivo"
      },
      buttons: {
        add: "Añadir propiedad",
        edit: "Editar",
        delete: "Eliminar",
        viewDetails: "Ver detalles",
        cancel: "Cancelar",
        deleting: "Eliminando...",
      },
      modal: {
        add: "Añadir propiedad",
        edit: "Editar propiedad",
        confirmDelete: "Confirmar eliminación",
        deleteProperty: "Eliminar propiedad",
        deleteConfirmMessage: "¿Estás seguro de que deseas eliminar la propiedad \"{{propertyName}}\"? Esta acción no se puede deshacer."
      },
      empty: {
        title: "No hay propiedades",
        noResults: "No hay resultados que coincidan con tus filtros.",
        addFirst: "Comienza añadiendo tu primera propiedad."
      },
      form: {
        validation: {
          nameRequired: "El nombre es obligatorio",
          addressRequired: "La dirección es obligatoria",
          imageFormat: "El archivo debe ser una imagen (JPG, PNG, GIF)",
          imageSize: "La imagen debe ser menor a 5MB"
        },
        labels: {
          name: "Nombre de la propiedad",
          address: "Dirección",
          description: "Descripción",
          status: "Estado",
          images: "Imágenes",
          documents: "Documentos"
        },
        steps: {
          step: "Paso",
          of: "de",
          basicInfo: "Información básica",
          additionalImages: "Imágenes adicionales",
          documents: "Documentos"
        },
        buttons: {
          previous: "Anterior",
          next: "Siguiente",
          save: "Guardar propiedad",
          saving: "Guardando..."
        }
      },
      detail: {
        tabs: {
          info: "Información",
          additionalImages: "Imágenes adicionales",
          documents: "Documentos"
        },
        description: "Descripción",
        noDescription: "No hay descripción disponible.",
        amenities: "Comodidades",
        additionalImagesInfo: "Estas imágenes adicionales se mostrarán al turista cuando consulte información específica de la propiedad a través del chatbot.",
        noAdditionalImages: "No hay imágenes adicionales",
        addImagesWhileEditing: "Puedes añadir imágenes adicionales con descripciones al editar la propiedad.",
        documentsInfo: "Estos documentos contienen información importante sobre la propiedad que ayudará al chatbot a resolver dudas de los turistas.",
        noDocuments: "No hay documentos disponibles",
        addDocumentsWhileEditing: "Puedes añadir documentos como guías, FAQs o reglas al editar la propiedad."
      }
    },
    reservations: {
      title: "Reservas",
      upcoming: "Próximas",
      pending: "Pendientes",
      view: "Ver reservas",
      emptyState: "No hay reservas",
      actions: {
        create: "Nueva Reserva",
        edit: "Editar",
        delete: "Eliminar",
        viewDetails: "Ver Detalles",
        sendToSes: "Enviar a SES"
      },
      status: {
        confirmed: "Confirmada",
        pending: "Pendiente",
        canceled: "Cancelada"
      },
      success: {
        created: "Reserva creada correctamente",
        updated: "Reserva actualizada correctamente",
        deleted: "Reserva eliminada correctamente",
        sentToSES: "Datos enviados correctamente al Sistema de Entrada de Viajeros (SES)"
      },
      errors: {
        loadingData: "Error al cargar los datos. Por favor, inténtalo de nuevo más tarde.",
        saving: "Error al guardar la reserva. Por favor, inténtalo de nuevo.",
        deleting: "Error al eliminar la reserva. Por favor, inténtalo de nuevo.",
        sendingToSES: "Error al enviar datos al SES. Por favor, inténtalo de nuevo más tarde."
      },
      mockNotes: {
        confirmed: "Llegan tarde, después de las 8pm.",
        pending: "Primera vez en el alojamiento."
      },
    },
    registrations: {
      title: "Registro SES",
      pending: "Pendientes de envío al SES",
      view: "Ver registros",
      manage: "Gestionar registros SES",
    },
    quickActions: {
      title: "Acciones Rápidas",
      messages: "Ver mensajes",
      help: "Ayuda",
    },
    incidents: {
      title: "Incidencias Recientes",
      empty: "No hay incidencias para mostrar",
      viewAll: "Ver todas las incidencias",
      pending: "Pendientes",
      resolutionRate: "Tasa de resolución",
      noIncidents: "No hay incidencias que mostrar",
      filters: {
        allProperties: "Todas las propiedades",
        clearFilters: "Limpiar filtros",
        activeFilters: "Filtros activos"
      },
      status: {
        resolved: "Resuelta",
        pending: "Pendiente",
      },
      categories: {
        all: "Todas",
        checkInOut: "Check-in/Check-out",
        propertyIssue: "Problemas de Propiedad",
        touristInfo: "Información Turística",
        emergency: "Emergencias",
        other: "Otros",
      },
      table: {
        title: "Título",
        property: "Propiedad",
        category: "Categoría",
        status: "Estado",
        phoneNumber: "Número de Teléfono",
        date: "Fecha",
        resolved: "Resuelto",
        pending: "Pendiente"
      },
    },
    sesRegistration: {
      title: "Registro SES",
      description: "Gestión de registros de viajeros para la Secretaría de Estado de Seguridad",
      register: "Registrar viajero",
      downloadForm: "Descargar formulario"
    },
    ses: {
      title: "Registro de Viajeros",
      newRegistration: "Nuevo registro SES",
      travelerRegistered: "Viajero registrado correctamente",
      workInProgress: "Estamos trabajando en esta funcionalidad. La página estará lista en breve.",
      importantNotice: "El registro de viajeros en el sistema SES es obligatorio para todos los alojamientos turísticos en España.",
      backToDashboard: "Volver al Dashboard",
      relevantInfo: {
        title: "Información Relevante",
        content: "El Sistema de Entrada de Seguridad (SES) es obligatorio para todos los alojamientos en España. Todos los viajeros mayores de edad deben ser registrados."
      },
      sections: {
        mandatory: {
          title: "Registro obligatorio",
          description: "Todos los viajeros extracomunitarios deben ser registrados en el Sistema de Entrada de Seguridad (SES)."
        },
        optional: {
          title: "Registro opcional",
          description: "Los viajeros comunitarios pueden ser registrados opcionalmente por motivos de seguridad."
        }
      },
      status: {
        approved: "Aprobado",
        pending: "Pendiente",
        rejected: "Rechazado",
        error: "Error",
        submitted: "Enviado"
      },
      statusPanel: {
        title: "Estado de Envíos SES",
        noSubmissions: "No hay envíos SES registrados",
        pending: "Pendientes",
        approvalRate: "Tasa de aprobación",
        all: "Todos",
        property: "Propiedad",
        guest: "Huésped",
        checkInDate: "Fecha Check-in",
        status: "Estado",
        submissionDate: "Fecha Envío",
        actions: "Acciones",
        retry: "Reintentar",
        generateLink: "Generar Enlace",
        retrySuccess: "Reintento programado correctamente",
        linkGenerated: "Enlace generado y copiado al portapapeles"
      },
      form: {
        title: "Registro de Viajero (SES)",
        fields: {
          firstName: "Nombre",
          lastName: "Apellidos",
          documentType: "Tipo de Documento",
          passport: "Pasaporte",
          documentNumber: "Número de Documento",
          issuingCountry: "País Expedición",
          nationality: "Nacionalidad",
          birthDate: "Fecha de Nacimiento"
        },
        countries: {
          spain: "España",
          germany: "Alemania",
          france: "Francia",
          italy: "Italia",
          uk: "Reino Unido",
          us: "Estados Unidos"
        },
        nationalities: {
          spanish: "Española",
          german: "Alemana",
          french: "Francesa",
          italian: "Italiana",
          british: "Británica",
          american: "Estadounidense"
        },
        validation: {
          firstNameRequired: "El nombre es obligatorio",
          lastNameRequired: "Los apellidos son obligatorios",
          documentNumberRequired: "El número de documento es obligatorio",
          birthDateRequired: "La fecha de nacimiento es obligatoria",
          invalidDateFormat: "Formato de fecha inválido",
          futureDateNotAllowed: "La fecha de nacimiento no puede ser en el futuro"
        }
      },
      buttons: {
        cancel: "Cancelar",
        register: "Registrar Viajero",
        newRegistration: "Nuevo registro SES",
        update: "Actualizar Estado"
      }
    },
    menu: {
      dashboard: "Dashboard",
      properties: "Propiedades",
      reservations: "Reservas",
      registrations: "Registro SES",
      account: "Mi Cuenta",
      settings: "Configuración",
      logout: "Cerrar sesión",
    },
  },
  
  // Autenticación
  auth: {
    loginTitle: "Inicia sesión en tu cuenta",
    emailLabel: "Correo electrónico",
    passwordLabel: "Contraseña",
    forgotPassword: "¿Olvidaste tu contraseña?",
    login: "Iniciar sesión",
    loggingIn: "Iniciando sesión...",
    noAccount: "¿No tienes una cuenta?",
    registerNow: "Regístrate ahora",
    forceSync: "Forzar sincronización con Supabase",
    invalidCredentials:
      "Credenciales incorrectas. Verifica tu email y contraseña.",
    emailNotConfirmed:
      "Necesitas confirmar tu correo electrónico antes de iniciar sesión. Por favor, revisa tu bandeja de entrada ({email}) y haz clic en el enlace de confirmación. Si no encuentras el correo, revisa tu carpeta de spam.",
    connectionError:
      "Error de conexión: No se pudo conectar con el servidor. Verifica tus credenciales de Supabase en el archivo .env",
    loginError: "Error durante el inicio de sesión",
    unknownError: "Ha ocurrido un error desconocido al iniciar sesión",
    authCallback: {
      title: "Autenticación",
      processing: "Procesando autenticación...",
      success: "Autenticación exitosa. Redirigiendo...",
      emailConfirmed: "Correo confirmado. Redirigiendo al dashboard...",
      verifying: "Verificando autenticación...",
      failed: "No se pudo completar la autenticación. Intente iniciar sesión nuevamente.",
      noAuthInfo: "No se encontró información de autenticación",
      error: "Error de autenticación: {error}"
    }
  },
  
  // Pagos
  payment: {
    processing: "Procesando pago",
    verifying: "Estamos verificando tu suscripción. Esto puede tomar unos momentos...",
    success: "¡Pago completado con éxito!",
    error: "Ha ocurrido un error",
    thankYou: "Gracias por tu suscripción a Host Helper AI. Ya puedes comenzar a utilizar todas las funcionalidades.",
    goToDashboard: "Ir al Dashboard",
    backToPricing: "Volver a Precios"
  },
  
  // Footer
  footer: {
    support: "Con el apoyo de",
    follow: "Síguenos",
    contact: "Contacto",
    slogan: "Automatizando la gestión de alojamientos turísticos con IA",
    copyright: "© 2025 Host Helper AI. Todos los derechos reservados.",
  },
  
  // Común
  common: {
    // General
    appName: "Host Helper AI",
    welcome: "Bienvenido",
    error: "Error",
    success: "Éxito",
    loading: "Cargando...",
    continue: "Continuar",
    cancel: "Cancelar",
    submit: "Enviar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar",
    update: "Actualizar",
    dismiss: "Descartar",
    important: "Importante",
    documentation: "Documentación",
    sesDocumentationDesc: "Consulta la documentación oficial para más detalles sobre el proceso de registro de viajeros.",
    referenceCode: "Código de referencia",
    openMenu: "Abrir menú",
    closeMenu: "Cerrar menú",
    language: "Idioma",
    spanish: "Español",
    english: "English",
    property: "propiedad",
    properties: "propiedades",
  },
  
  // Datos de ejemplo
  mockData: {
    properties: {
      apartment: {
        name: "Apartamento Centro",
        address: "Calle Mayor 10, Madrid"
      },
      beach: {
        name: "Casa de Playa",
        address: "Paseo Marítimo 23, Barcelona"
      }
    },
    guests: {
      guest1: "Carlos Rodríguez",
      guest2: "Laura Martínez"
    },
    incidents: {
      hotWater: {
        title: "Problemas con el agua caliente",
        description: "El huésped reportó que el agua caliente no funciona en el baño principal."
      },
      wifi: {
        title: "WiFi no funciona",
        description: "El router parece tener problemas de conexión."
      },
      transport: {
        title: "Información sobre transporte público",
        description: "El huésped solicitó información sobre cómo llegar al centro desde el alojamiento."
      },
      checkin: {
        title: "Problema con el check-in",
        description: "El huésped no pudo acceder al sistema de check-in automático."
      }
    }
  },
  
  // Mensajes de error
  errors: {
    loadProperties: "Error al cargar propiedades:",
    deleteProperty: "Error al eliminar propiedad:",
    saveProperty: "Error al guardar propiedad:",
    savePropertyAlert: "Hubo un error al guardar la propiedad. Por favor, intenta de nuevo.",
    signOut: "Error al cerrar sesión"
  }
};
