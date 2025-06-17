// src/translations/en.ts
// Archivo de traducciones en inglés

export const en = {
  // Navegación
  nav: {
    features: "Features",
    pricing: "Pricing",
    testimonials: "Testimonials",
    login: "Log in",
    contact: "Contact",
  },
  
  // Landing Page
  landing: {
    hero: {
      title: "Intelligent Accommodation Management",
      subtitle: "Automate your business with artificial intelligence",
      cta: "Get Started",
    },
    features: {
      title: "Main Features",
      subtitle:
        "Everything you need to efficiently manage your tourist accommodations",
      chatbot: "AI Agents 24/7",
      chatbotDesc:
        "AI agents for guests that resolve queries in real time",
      registration: "Automated Registration",
      registrationDesc:
        "Simplifies traveler registration according to Spanish regulations (SES)",
      income: "Extra Income Generation",
      incomeDesc: "Cross-selling system for services with commission model",
      dashboard: "Centralized Dashboard",
      dashboardDesc:
        "Intuitive management of all properties from a single place",
      incidents: "Incident Management",
      incidentsDesc: "Automated system for resolving common problems",
      checkIn: "Automated check-in",
      checkInDesc:
        "Automate traveler registration and document verification. Save time and avoid documentation issues.",
      upselling: "Intelligent upselling",
      upsellingDesc:
        "Generate additional income by offering complementary services at the right time. Transfers, local activities, late check-out and more.",
    },
    technologies: {
      title: "Technologies Used",
      frontend: "Frontend",
      frontendDesc: "React, TypeScript, Tailwind CSS",
      backend: "Backend/BaaS",
      backendDesc: "Supabase (PostgreSQL)",
      auth: "Authentication",
      authDesc: "Native Supabase system",
      integration: "Integration",
      integrationDesc: "Ministry of Interior API (SES), Botpress (chatbots)",
      deployment: "Deployment",
      deploymentDesc: "Netlify/Vercel",
    },
    howItWorks: {
      title: "Getting started with Host Helper Ai is very simple",
      step1: {
        title: "Register and add your property",
        description:
          "Create your account in minutes and add the details of your property. Upload photos, description and accommodation rules.",
      },
      step2: {
        title: "Configure your AI agents",
        description:
          "Customize chatbot responses, accommodation information and additional services you want to offer.",
      },
      step3: {
        title: "Share the link with your guests",
        description:
          "Provide your AI agents' link to your guests. They will be able to check-in, receive assistance and purchase additional services easily.",
      },
    },
    cta: {
      title: "Join property owners who are automating their management",
      subtitle:
        "Save time, increase your income and improve guest satisfaction.",
      button: "Start your free trial",
    },
  },

  // ChatbotPage - Updated for AI Agents
  chatbotPage: {
    meta: {
      title: "AI Agents for Tourist Accommodations | Host Helper AI",
      description:
        "Advanced AI agents that handle phone calls 24/7, manage incidents and coordinate with providers. WhatsApp and Telegram integration for property managers.",
    },
    hero: {
      title: "Intelligent AI Agents",
      subtitle: "24/7 Phone Support for Your Accommodations",
      description:
        "Our AI agents handle phone calls 24 hours a day, manage incidents in real time and coordinate with maintenance or cleaning teams. Integrated with WhatsApp and Telegram to send multimedia information, locations and links. When they need help, they collaborate with each other or escalate to your human team.",
    },
    benefits: {
      phoneService: {
        title: "Intelligent Phone Support",
        description:
          "Your guests call a phone number and have voice conversations with our AI agents. Available 24 hours, they understand multiple languages and resolve queries instantly.",
      },
      multichannel: {
        title: "WhatsApp & Telegram Integrated",
        description:
          "During calls, agents send images, locations, links and documents via WhatsApp or Telegram. They combine voice conversation with multimedia content instantly.",
      },
      teamwork: {
        title: "Intelligent Teamwork",
        description:
          "When an agent cannot resolve something, it collaborates with other specialist agents or escalates to your human team. They can coordinate with maintenance or cleaning teams during the same call.",
      },
    },
    features: {
      title: "Capabilities of Our AI Agents",
      subtitle: "Reduce your workload while your guests receive professional attention 24 hours a day.",
      multilingual: {
        title: "Natural Multilingual Conversation",
        description:
          "They converse by voice like humans in Spanish, English, French, German and more languages. They understand accents and context to provide accurate responses.",
      },
      maintenanceCoordination: {
        title: "Coordination with Maintenance Teams",
        description:
          "During the call with the guest, they can simultaneously contact plumbers, electricians or cleaning teams. They coordinate appointments and confirm with the guest in real time.",
      },
      intelligentEscalation: {
        title: "Intelligent Escalation",
        description:
          "When they cannot resolve something, they collaborate with specialist agents or transfer the call to your team with full conversation context.",
      },
      personalizedRecommendations: {
        title: "Personalized Recommendations",
        description:
          "They know your area perfectly and send restaurant photos, location maps, booking links and personalized recommendations via WhatsApp based on guest preferences.",
      },
      responseTime: {
        title: "Response Time",
        value: "< 3 seconds",
        description: "Instant resolution",
      },
    },
    demo: {
      title: "Example: Plumbing Issue",
      subtitle: "Real Practical Case",
      description:
        "Discover how our AI agents resolve real incidents step by step, coordinating with maintenance teams during the same guest call.",
      steps: {
        step1: {
          title: "Guest calls:",
          description: "No hot water in the apartment",
        },
        step2: {
          title: "Diagnosis and escalation:",
          description: "The agent understands the problem and unable to resolve it transfers the call to a specialist agent who contacts the plumber directly",
        },
        step3: {
          title: "Specialized coordination:",
          description: "The specialist agent explains the breakdown to the plumber with all details and schedules the repair appointment",
        },
        step4: {
          title: "Guest confirmation:",
          description: "The plumber will arrive tomorrow at 10:00. I'm sending you their details via WhatsApp",
        },
      },
      workflow: {
        guest: "Guest",
        aiAgent: "AI Agent",
        whatsapp: "WhatsApp",
        plumber: "Plumber",
        coordination: "Real-Time Coordination",
        resolution: "Everything resolved in one call",
      },
    },
  },

  // CheckinPage
  checkinPage: {
    meta: {
      title: "Check-in Automation and SES Registration | Host Helper AI",
      description:
        "Automate traveler registration according to Spanish regulations (SES) and simplify the check-in process for your guests and for you.",
    },
    hero: {
      title: "Check-in Automation",
      subtitle: "Benefits of Automated Registration",
      description:
        "Simplify traveler registration according to Spanish regulations (SES) and optimize the check-in process, saving time for your guests and reducing your administrative burden.",
    },
    benefits: {
      compliance: {
        title: "Legal Compliance",
        description:
          "Automatically comply with Spanish traveler registration regulations (SES) without worries or risk of penalties for non-compliance.",
      },
      timeSaving: {
        title: "Time Saving",
        description:
          "Reduce management time by up to 90%. The registration process that used to take hours is now completed in minutes without your intervention.",
      },
      experience: {
        title: "Better Experience",
        description:
          "Provide your guests with a modern and smooth digital experience that they can complete before arrival, facilitating a hassle-free check-in.",
      },
    },
    features: {
      title: "Features and Capabilities",
      subtitle: "Advanced technology",
      description:
        "Our check-in automation system is specifically designed to comply with Spanish regulations and optimize the management of tourist accommodations.",
      sesIntegration: {
        title: "SES Integration",
        description:
          "Direct connection with the Interior Ministry's SES system, ensuring compliance with Spanish traveler registration regulations.",
      },
      customForms: {
        title: "Customizable Forms",
        description:
          "Adapt registration forms to your brand and style, including all mandatory fields according to current regulations.",
      },
      documentCapture: {
        title: "Document Capture",
        description:
          "Allows guests to securely upload photographs of their identity documents before arrival.",
      },
      reservationManagement: {
        title: "Reservation Management",
        description:
          "Manual creation or automatic import of reservations from Airbnb, Booking and other platforms, keeping all data synchronized.",
      },
      registrationTime: {
        title: "Average registration time",
        value: "< 2 min",
        description: "per guest",
      },
    },
    demo: {
      title: "Simplified Check-in Process",
      subtitle: "See in action",
      description:
        "Our system automates the entire traveler registration process, from data collection to SES submission, saving you time and avoiding errors.",
      capabilities: {
        dataCollection:
          "Automatic data collection from reservations on Airbnb, Booking and other platforms",
        links:
          "Sending personalized links to guests to complete their registration",
        validation: "Automatic validation of data and identity documents",
        transmission:
          "Secure and direct transmission of information to the SES system",
      },
      videoPlaceholder: "Check-in System Demo Video",
    },
  },

  // UpsellingPage
  upsellingPage: {
    meta: {
      title: "Upselling and Additional Income Generation | Host Helper AI",
      description:
        "Increase your revenue with our cross-selling system that recommends additional services to your guests while improving their experience.",
    },
    hero: {
      title: "Upselling and Commissions",
      subtitle: "Increase Your Revenue",
      description:
        "Generate additional income by recommending relevant services and experiences to your guests, enhancing their stay while increasing your profitability.",
    },
    benefits: {
      passiveIncome: {
        title: "Passive Income",
        description:
          "Earn commissions for each service contracted through your recommendations, creating an additional income stream without extra effort.",
      },
      betterExperience: {
        title: "Better Experience",
        description:
          "Your guests value personalized recommendations, which improves their overall experience and increases positive ratings.",
      },
      totalControl: {
        title: "Total Control",
        description:
          "Access detailed reports on generated commissions, most popular services, and conversion rates to optimize your strategies.",
      },
    },
    features: {
      title: "Features and Possibilities",
      subtitle: "Intelligent system",
      description:
        "Our upselling system is designed to maximize your additional income while providing real value to your guests with relevant recommendations.",
      utmLinks: {
        title: "Personalized UTM Links",
        description:
          "Automatically generate tracking links for each recommendation, allowing precise tracking of conversions and commissions.",
      },
      smartRecommendations: {
        title: "Smart Recommendations",
        description:
          "The system analyzes your guests' preferences and behaviors to offer personalized, high-conversion suggestions.",
      },
      localIntegration: {
        title: "Local Provider Integration",
        description:
          "Connect with high-quality services in your area: from tours and activities to transfers and dining services.",
      },
      dashboard: {
        title: "Commission Dashboard",
        description:
          "Visualize your commission income in real time, with detailed reports by service type, season, and properties.",
      },
      incomeIncrease: {
        title: "Average increase",
        value: "+15%",
        description: "in monthly income",
      },
    },
    demo: {
      title: "How the Commission System Works",
      subtitle: "See in action",
      description:
        "Our system integrates with your current operations without complexity, generating additional income while improving your guests' experience.",
      process: {
        recommendations:
          "Chatbots recommend relevant services and experiences to your guests",
        tracking:
          "The system generates personalized tracking links (UTM) for each recommendation",
        commissions:
          "Each reservation or purchase made through these links automatically generates a commission",
        dashboard:
          "Commissions accumulate in your account and you can track them in real time on your dashboard",
      },
      videoPlaceholder: "Upselling System Demo Video",
    },
  },
  
  // Calendly Widget
  calendly: {
    title: "Schedule a personalized demo",
    subtitle:
      "Book an appointment with our team to learn how Host Helper AI can help you automate the management of your tourist accommodations",
    button: "Book appointment now",
    linkText: "Schedule a demo",
    pageTitle: "Demo Scheduling Calendar",
    pageSubtitle: "Select a date and time convenient for you",
    backToHome: "Back to home",
  },
  
  // Testimonios
  testimonials: {
    title: "Testimonials",
    subtitle: "What our clients say about Host Helper AI",
    more: "More experiences from our clients",
    visitWebsite: "Visit website",
    testimonial1: {
      description:
        "Charming rural accommodation in Sierra de Gata, Extremadura.",
      text: "Host Helper has transformed our reservation management. Guests are delighted with 24/7 attention and we save time answering repetitive questions.",
      author: "María González",
      position: "Owner",
    },
    testimonial2: {
      description:
        "Holiday home in the authentic Spanish village of Ojén, Andalusia, with mountain views and close to the beach.",
      text: "Host Helper AI has been essential for managing Casa María Flora from the Netherlands. A perfect solution for international property owners!",
      author: "Elske Lena",
      position: "Owner",
    },
    testimonial3: {
      description: "Boutique accommodation in the historic center of Lucena.",
      text: "The additional services sales feature has allowed us to increase our income by 30%. Guests really appreciate the ease of requesting extra services.",
      author: "Lola Martínez",
      position: "Manager",
    },
    additionalTestimonials: {
      testimonial1: {
        author: "Ana Moreno",
        company: "Seville Tourist Apartments",
        text: "Host Helper's AI agents have been a revolution for our daily management. Guests receive immediate responses and we can focus on improving other aspects of the business.",
      },
      testimonial2: {
        author: "Javier López",
        company: "Costa del Sol Villa",
        text: "We have reduced by 70% the time we spent answering basic guest questions. The integration was very simple and the support team is always available.",
      },
      testimonial3: {
        author: "Patricia García",
        company: "Madrid Centro Hostel",
        text: "What I like most is that guests can check-in at any time without problems. It's like having a 24/7 receptionist but without the associated costs.",
      },
      testimonial4: {
        author: "Ricardo Fernández",
        company: "Barcelona Tourist Apartments",
        text: "Since implementing Host Helper, we have increased our additional services sales by 40%. It's amazing how the chatbot can suggest services in a natural and non-intrusive way.",
      },
    },
    cta: {
      title: "Join our satisfied customers",
      subtitle:
        "Start enjoying the benefits of Host Helper AI and transform your accommodation management",
      button: "Request free demo",
    },
  },
  
  // Precios
  pricing: {
    title: "Plans and Pricing",
    subtitle: "Solutions tailored to your needs",
    basic: "Basic",
    pro: "Professional",
    enterprise: "Enterprise",
    month: "/month",
    cta: "Get Started",
    contact: "Contact Us",
    monthly: "Monthly",
    annual: "Annual",
    annualDiscount: "Save 20%",
    billedAnnually: "Billed annually",
    mostPopular: "Most popular",
    customPrice: "Custom",
    scheduleDemo: "Schedule demo",
    features: {
      support247: "24/7 Support",
      basicDataManagement: "Basic data management",
      upTo: "Up to",
      allFrom: "Everything from",
      automaticCalls: "Automatic calls",
      advancedDataManagement: "Advanced data management",
      analyticsReports: "Analytics and reports",
      unlimitedProperties: "Unlimited properties",
      dedicatedAPI: "Dedicated API",
      prioritySupport: "Priority support",
      fullCustomization: "Full customization",
      aiAgentVoiceCalls: "AI Agent with voice calls",
      whatsappIntegrated: "WhatsApp integrated",
      interactionDashboard: "Interaction dashboard",
      priorityAttention: "Priority attention",
      advancedAnalyticsReports: "Advanced analytics and reports",
      legalTourismConsulting: "Legal tourism consulting",
      programmableAutomaticCalls: "Programmable automatic calls",
      dedicatedPersonalizedAPI: "Dedicated and personalized API",
      prioritySupport247: "Priority support 24/7",
      completeCustomization: "Complete customization",
      advancedMultichannelIntegration: "Advanced multichannel integration",
    },
    faq: {
      title: "Frequently Asked Questions",
      q1: "What does priority support include?",
      a1: "Priority support includes extended hours phone support, guaranteed response time under 2 hours, and a dedicated account manager.",
      q2: "Can I change plans later?",
      a2: "Yes, you can upgrade or change your plan at any time on a prorated basis.",
      q3: "In which languages is the assistant available?",
      a3: "The assistant is available in Spanish and English, with the ability to automatically detect the guest's language and respond appropriately.",
      q4: "How does the extra income system work?",
      a4: "The assistant proactively offers additional services to your guests, such as transfers, show tickets, or restaurant reservations, generating commissions for you.",
      q5: "Is it easy to implement Host Helper AI?",
      a5: "Yes, implementation is very simple. Our team will guide you through the entire process and you will have your AI agents up and running in less than 24 hours.",
      q6: "Is there a trial period?",
      a6: "We offer a free personalized demonstration where you can see how the AI agents work with your own data and specific use cases.",
      q7: "What technical support is included?",
      a7: "All plans include email technical support. Pro and Enterprise plans also include priority support and access to a dedicated account manager.",
    },
    ctaSection: {
      title: "Ready to revolutionize your accommodation management?",
      subtitle:
        "Start saving time and increasing your income with Host Helper AI today",
      button: "Start free trial",
    },
  },
  
  // Dashboard
  dashboard: {
    welcome: "Welcome to the dashboard",
    description:
      "This is a preliminary version of the dashboard for Host Helper AI. Here you will be able to manage your accommodations, review reservations and access all the features of our platform.",
    notice:
      "We are working on implementing all the features. For now, this is a demo of the interface.",
    loading: "Loading...",
    stats: {
      properties: "Properties",
      pendingReservations: "Pending Reservations",
      incidents: "Incidents",
      activePropertiesFooter: "Active properties",
      pendingReservationsFooter: "Percentage: {{percent}}%",
      noReservations: "No reservations",
      resolutionRate: "Resolution rate: {{rate}}%"
    },
    properties: {
      title: "Your Properties",
      subtitle: "Manage all your properties from here",
      total: "Total properties",
      view: "View properties",
      add: "Add property",
      filters: {
        all: "All",
        active: "Active",
        inactive: "Inactive"
      },
    },
    reservations: {
      title: "Reservations",
      upcoming: "Upcoming",
      pending: "Pending",
      view: "View reservations",
      emptyState: "No reservations",
      actions: {
        create: "New Reservation",
        edit: "Edit",
        delete: "Delete",
        viewDetails: "View Details",
        sendToSes: "Send to SES"
      },
      status: {
        confirmed: "Confirmed",
        pending: "Pending",
        canceled: "Canceled"
      },
      success: {
        created: "Reservation created successfully",
        updated: "Reservation updated successfully",
        deleted: "Reservation deleted successfully",
        sentToSES: "Data sent successfully to the Traveler Entry System (SES)"
      },
      errors: {
        loadingData: "Error loading data. Please try again later.",
        saving: "Error saving reservation. Please try again.",
        deleting: "Error deleting reservation. Please try again.",
        sendingToSES: "Error sending data to SES. Please try again later."
      },
      mockNotes: {
        confirmed: "Arriving late, after 8pm.",
        pending: "First time in the accommodation."
      },
    },
    registrations: {
      title: "SES Registration",
      pending: "Pending SES submission",
      view: "View registrations",
      manage: "Manage SES registrations",
    },
    quickActions: {
      title: "Quick Actions",
      messages: "View messages",
      help: "Help",
    },
    incidents: {
      title: "Recent Incidents",
      empty: "No incidents to display",
      viewAll: "View all incidents",
      pending: "Pending",
      resolutionRate: "Resolution Rate",
      noIncidents: "No incidents to display",
      filters: {
        allProperties: "All properties",
        clearFilters: "Clear filters",
        activeFilters: "Active filters"
      },
      status: {
        resolved: "Resolved",
        pending: "Pending",
      },
      categories: {
        all: "All",
        checkInOut: "Check-in/Check-out",
        propertyIssue: "Property Issues",
        touristInfo: "Tourist Information",
        emergency: "Emergencies",
        other: "Others",
      },
      table: {
        title: "Title",
        property: "Property",
        category: "Category",
        status: "Status",
        phoneNumber: "Phone Number",
        date: "Date",
        resolved: "Resolved",
        pending: "Pending"
      },
    },
    sesRegistration: {
      title: "SES Registration",
      description: "Management of traveler registrations for the Secretary of State for Security",
      register: "Register traveler",
      downloadForm: "Download form"
    },
    ses: {
      title: "Traveler Registration",
      newRegistration: "New SES registration",
      travelerRegistered: "Traveler registered successfully",
      workInProgress: "We are working on this functionality. The page will be ready soon.",
      importantNotice: "Traveler registration in the SES system is mandatory for all tourist accommodations in Spain.",
      backToDashboard: "Back to Dashboard",
      relevantInfo: {
        title: "Relevant Information",
        content: "The Security Entry System (SES) is mandatory for all accommodations in Spain. All adult travelers must be registered."
      },
      sections: {
        mandatory: {
          title: "Mandatory registration",
          description: "All non-EU travelers must be registered in the Security Entry System (SES)."
        },
        optional: {
          title: "Optional registration",
          description: "EU travelers can optionally be registered for security reasons."
        }
      },
      status: {
        approved: "Approved",
        pending: "Pending",
        rejected: "Rejected",
        error: "Error",
        submitted: "Submitted"
      },
      statusPanel: {
        title: "SES Submissions Status",
        noSubmissions: "No SES submissions registered",
        pending: "Pending",
        approvalRate: "Approval rate",
        all: "All",
        property: "Property",
        guest: "Guest",
        checkInDate: "Check-in Date",
        status: "Status",
        submissionDate: "Submission Date",
        actions: "Actions",
        retry: "Retry",
        generateLink: "Generate Link",
        retrySuccess: "Retry scheduled successfully",
        linkGenerated: "Link generated and copied to clipboard"
      },
      form: {
        title: "Traveler Registration (SES)",
        fields: {
          firstName: "First Name",
          lastName: "Last Name",
          documentType: "Document Type",
          passport: "Passport",
          documentNumber: "Document Number",
          issuingCountry: "Issuing Country",
          nationality: "Nationality",
          birthDate: "Birth Date"
        },
        countries: {
          spain: "Spain",
          germany: "Germany",
          france: "France",
          italy: "Italy",
          uk: "United Kingdom",
          us: "United States"
        },
        nationalities: {
          spanish: "Spanish",
          german: "German",
          french: "French",
          italian: "Italian",
          british: "British",
          american: "American"
        },
        validation: {
          firstNameRequired: "First name is required",
          lastNameRequired: "Last name is required",
          documentNumberRequired: "Document number is required",
          birthDateRequired: "Birth date is required",
          invalidDateFormat: "Invalid date format",
          futureDateNotAllowed: "Birth date cannot be in the future"
        }
      },
      buttons: {
        cancel: "Cancel",
        register: "Register Traveler",
        newRegistration: "New SES registration"
      }
    },
    menu: {
      dashboard: "Dashboard",
      properties: "Properties",
      reservations: "Reservations",
      registrations: "SES Registration",
      account: "My Account",
      settings: "Settings",
      logout: "Log out",
    },
  },
  
  // Authentication
  auth: {
    loginTitle: "Log in to your account",
    emailLabel: "Email",
    passwordLabel: "Password",
    forgotPassword: "Forgot password?",
    login: "Log in",
    loggingIn: "Logging in...",
    noAccount: "Don't have an account?",
    registerNow: "Register now",
    forceSync: "Force synchronization with Supabase",
    invalidCredentials:
      "Invalid credentials. Please verify your email and password.",
    emailNotConfirmed:
      "You need to confirm your email before logging in. Please check your inbox ({email}) and click on the confirmation link. If you cannot find the email, check your spam folder.",
    connectionError:
      "Connection error: Could not connect to the server. Please verify your Supabase credentials in the .env file.",
    loginError: "Login error",
    unknownError: "An unknown error occurred during login",
    authCallback: {
      title: "Authentication",
      processing: "Processing authentication...",
      success: "Authentication successful. Redirecting...",
      emailConfirmed: "Email confirmed. Redirecting to dashboard...",
      verifying: "Verifying authentication...",
      failed: "Authentication failed. Please try to log in again.",
      noAuthInfo: "No authentication information found",
      error: "Authentication error: {error}"
    }
  },
  
  // Payments
  payment: {
    processing: "Processing payment",
    verifying: "We're verifying your subscription. This may take a moment...",
    success: "Payment completed successfully!",
    error: "An error has occurred",
    thankYou: "Thank you for subscribing to Host Helper AI. You can now start using all features.",
    goToDashboard: "Go to Dashboard",
    backToPricing: "Back to Pricing"
  },
  
  // Footer
  footer: {
    support: "Supported by",
    follow: "Follow us",
    contact: "Contact",
    slogan: "Automating tourist accommodation management with AI",
    copyright: "© 2025 Host Helper AI. All rights reserved.",
  },
  
  // Común
  common: {
    // General
    appName: "Host Helper AI",
    welcome: "Welcome",
    error: "Error",
    success: "Success",
    loading: "Loading...",
    continue: "Continue",
    cancel: "Cancel",
    submit: "Submit",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    update: "Update",
    dismiss: "Dismiss",
    important: "Important",
    documentation: "Documentation",
    sesDocumentationDesc: "Check the official documentation for more details about the traveler registration process.",
    referenceCode: "Reference code",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    language: "Language",
    spanish: "Español",
    english: "English",
    property: "property",
    properties: "properties",
  },
  
  // Sample data
  mockData: {
    properties: {
      apartment: {
        name: "Downtown Apartment",
        address: "10 Main Street, Madrid"
      },
      beach: {
        name: "Beach House",
        address: "23 Seafront Boulevard, Barcelona"
      }
    },
    guests: {
      guest1: "Charles Rodriguez",
      guest2: "Laura Martinez"
    },
    incidents: {
      hotWater: {
        title: "Hot water issues",
        description: "Guest reported hot water not working in the main bathroom."
      },
      wifi: {
        title: "WiFi not working",
        description: "Router appears to have connection problems."
      },
      transport: {
        title: "Public transport information",
        description: "Guest requested information on how to reach downtown from the accommodation."
      },
      checkin: {
        title: "Check-in problem",
        description: "Guest couldn't access the automatic check-in system."
      }
    }
  },
  
  // Error messages
  errors: {
    signOut: "Error while signing out:",
    loadProperties: "Error loading properties:",
    deleteProperty: "Error deleting property:",
    saveProperty: "Error saving property:",
    savePropertyAlert: "There was an error saving the property. Please try again."
  },
  
  properties: {
    title: "Your Properties",
    subtitle: "Manage all your properties from here",
    filters: {
      all: "All",
      active: "Active",
      inactive: "Inactive"
    },
    search: {
      placeholder: "Search properties..."
    },
    status: {
      active: "Active",
      inactive: "Inactive"
    },
    buttons: {
      add: "Add property",
      edit: "Edit",
      delete: "Delete",
      viewDetails: "View details",
      cancel: "Cancel",
      deleting: "Deleting...",
    },
    modal: {
      add: "Add property",
      edit: "Edit property",
      confirmDelete: "Confirm deletion",
      deleteProperty: "Delete property",
      deleteConfirmMessage: "Are you sure you want to delete the property \"{{propertyName}}\"? This action cannot be undone."
    },
    empty: {
      title: "No properties",
      noResults: "No results match your filters.",
      addFirst: "Start by adding your first property."
    },
    form: {
      validation: {
        nameRequired: "Name is required",
        addressRequired: "Address is required",
        imageFormat: "File must be an image (JPG, PNG, GIF)",
        imageSize: "Image must be less than 5MB"
      },
      labels: {
        name: "Property name",
        address: "Address",
        description: "Description",
        status: "Status",
        images: "Images",
        documents: "Documents"
      },
      steps: {
        step: "Step",
        of: "of",
        basicInfo: "Basic information",
        additionalImages: "Additional images",
        documents: "Documents"
      },
      buttons: {
        previous: "Previous",
        next: "Next",
        save: "Save property",
        saving: "Saving..."
      }
    },
    detail: {
      tabs: {
        info: "Information",
        additionalImages: "Additional Images",
        documents: "Documents"
      },
      description: "Description",
      noDescription: "No description available.",
      amenities: "Amenities",
      additionalImagesInfo: "These additional images will be shown to tourists when they ask for specific information about the property through the chatbot.",
      noAdditionalImages: "No additional images",
      addImagesWhileEditing: "You can add additional images with descriptions when editing the property.",
      documentsInfo: "These documents contain important information about the property that will help the chatbot answer tourist questions.",
      noDocuments: "No documents available",
      addDocumentsWhileEditing: "You can add documents such as guides, FAQs, or rules when editing the property."
    }
  }
};
