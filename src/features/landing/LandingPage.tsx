// File: src/features/landing/LandingPage.tsx
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";
import LandingHeader from "@shared/components/LandingHeader";
import CalendlyLink from "@shared/components/CalendlyLink";
import Footer from "@shared/components/Footer";
import { useTranslation } from "react-i18next";
import { initializeHeroAnimations } from "../../utils/heroAnimations";
import useParallaxTilt from "../../hooks/useParallaxTilt";



declare global {
  namespace JSX {
    interface IntrinsicElements {
      'elevenlabs-convai': any;
    }
  }
}

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const language = i18n.language as 'es' | 'en';

  // Initialize hero animations
  useEffect(() => {
    let cleanup: (() => void) | null = null;
    
    // Add a small delay to ensure DOM elements are rendered
    const timer = setTimeout(() => {
      try {
        // Get translated rotating words
        const rotatingWords = t("landing.hero.rotatingWords", { returnObjects: true }) as string[];
        cleanup = initializeHeroAnimations(rotatingWords);
      } catch (error) {
        console.warn('Failed to initialize hero animations:', error);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (cleanup) {
        cleanup();
      }
    };
  }, [t]);

  // Handle hash navigation on page load
  useEffect(() => {
    const handleHashNavigation = () => {
      const hash = window.location.hash;
      if (hash) {
        // Small delay to ensure all elements are rendered
        setTimeout(() => {
          const element = document.querySelector(hash);
          if (element) {
            element.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 300);
      }
    };

    // Handle hash on initial load
    handleHashNavigation();

    // Handle hash changes (if user navigates with browser back/forward)
    window.addEventListener('hashchange', handleHashNavigation);

    return () => {
      window.removeEventListener('hashchange', handleHashNavigation);
    };
  }, []);

  // Configuración de videos según idioma
  // const videoConfig: Record<'es' | 'en', { videoId: string; thumbnail: string }> = {
  //   es: {
  //     videoId: "MX8ypfuCieU",
  //     thumbnail: "https://img.youtube.com/vi/MX8ypfuCieU/maxresdefault.jpg"
  //   },
  //   en: {
  //     videoId: "plXI2I-vaxo", 
  //     thumbnail: "https://img.youtube.com/vi/plXI2I-vaxo/maxresdefault.jpg"
  //   }
  // };

  // Configuración de video promocional según idioma
  const promoVideoConfig: Record<'es' | 'en', { videoId: string; thumbnail: string }> = {
    es: {
      videoId: "wB1csIUiHxM",
      thumbnail: "https://img.youtube.com/vi/wB1csIUiHxM/maxresdefault.jpg"
    },
    en: {
      videoId: "m7SL2_w5yP0", 
      thumbnail: "https://img.youtube.com/vi/m7SL2_w5yP0/maxresdefault.jpg"
    }
  };

  // Obtener configuración del video actual basada en el idioma
  // const currentVideo = videoConfig[language] || videoConfig.es;
  const currentPromoVideo = promoVideoConfig[language] || promoVideoConfig.es;

  // Estado para controlar las animaciones de scroll
  // Expandido para incluir las 3 tarjetas de características
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>([false, false, false]);
  const [visibleFeatures, setVisibleFeatures] = useState<boolean[]>([false, false, false]);
  
  // KPI stats state – values rotate every 12 seconds within requested ranges
  // We keep these simple integers to match the lightweight UI and avoid heavy animations
  // KPI ranges (strict)
  const KPI_RANGES = {
    queries: { min: 140, max: 450 },
    minutes: { min: 140, max: 450 },
    resolved: { min: 78, max: 93 },
    services: { min: 15, max: 42 },
  } as const;

  // Initialize within range
  const [statQueries, setStatQueries] = useState<number>(
    Math.floor((KPI_RANGES.queries.min + KPI_RANGES.queries.max) / 2)
  );
  const [statMinutes, setStatMinutes] = useState<number>(
    Math.floor((KPI_RANGES.minutes.min + KPI_RANGES.minutes.max) / 2)
  );
  const [statResolved, setStatResolved] = useState<number>(
    Math.floor((KPI_RANGES.resolved.min + KPI_RANGES.resolved.max) / 2)
  );
  const [statServices, setStatServices] = useState<number>(
    Math.floor((KPI_RANGES.services.min + KPI_RANGES.services.max) / 2)
  );

  // Simple flags to trigger a short pulse animation when values change
  const [animateStats, setAnimateStats] = useState({
    queries: false,
    minutes: false,
    resolved: false,
    services: false,
  });

  // Refs to hold latest values for smooth animations without stale closures
  const queriesRef = useRef(statQueries);
  const minutesRef = useRef(statMinutes);
  const resolvedRef = useRef(statResolved);
  const servicesRef = useRef(statServices);

  useEffect(() => { queriesRef.current = statQueries; }, [statQueries]);
  useEffect(() => { minutesRef.current = statMinutes; }, [statMinutes]);
  useEffect(() => { resolvedRef.current = statResolved; }, [statResolved]);
  useEffect(() => { servicesRef.current = statServices; }, [statServices]);
  
  // Estado para controlar si el video está reproduciéndose
  // const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  // Estado para controlar el video promocional entre secciones
  const [isPromoVideoPlaying, setIsPromoVideoPlaying] = useState(false);
  
  // Referencias para los pasos
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  // NOTE: Parallax/Tilt removed to stabilize hero phone sizing and layout

  // Tipo y estado para conversaciones dinámicas del teléfono
  type ChatMessage = {
    role: 'ai' | 'user' | 'system';
    text?: string; // Texto simple
    // Link opcional. "icon: 'google'" muestra un pequeño logotipo de Google junto al texto
    link?: { text: string; href: string; icon?: 'google' } | null;
    card?: { title: string; description: string; imageSrc?: string } | null; // Tarjeta rica
    typing?: boolean; // Indicador de escritura del asistente
  };

  // Conversaciones de ejemplo (ES/EN/RU/ZH) que muestran capacidades
  const phoneConversations: ChatMessage[][] = [
    // 1) Lockbox code
    [
      { role: 'user', text: 'What is the lockbox code?' },
      { role: 'ai', typing: true },
      { role: 'ai', text: 'The lockbox code is 7429. The box is next to the main door.' },
    ],
    // 2) Early check-in
    [
      { role: 'user', text: '¿Puedo hacer check-in temprano?' },
      { role: 'ai', text: 'Un momento por favor, consulto con el equipo de limpieza…' },
      { role: 'ai', typing: true },
      { role: 'ai', text: '¡Listo! El equipo confirma que estará preparado. Puedes entrar a las 13:00.' },
    ],
    // 3) Post-stay review with Google logo link
    [
      { role: 'ai', text: '¡Gracias por tu estancia! Ha sido un placer atenderte. 😊' },
      { role: 'ai', text: 'Si te hemos ayudado, tu reseña en Google nos apoya muchísimo y ayuda a otros viajeros.' },
      { role: 'ai', link: { text: 'Dejar reseña en Google', href: 'https://g.page/r/hosthelperai/review', icon: 'google' } },
    ],
    // 4) Property access card (with image)
    [
      { role: 'user', text: 'Necesito la información de acceso a la propiedad' },
      { role: 'ai', typing: true },
      { role: 'ai', card: { title: 'Acceso a la propiedad', description: 'Dirección: Calle Mayor 12, Málaga. Suba al 3ºB. El portal se abre con el código 8412. La llave está en el cajetín de la izquierda.', imageSrc: '/imagenes/CasaMarbella.png' } },
    ],
    // 5) Extend stay
    [
      { role: 'user', text: 'I need to extend my stay for 2 more nights' },
      { role: 'ai', text: 'Let me check availability for you...' },
      { role: 'ai', typing: true },
      { role: 'ai', text: 'Great news! I can extend your stay. The rate will be €85/night. Shall I confirm?' },
    ],
    // Rest (unchanged relative order)
    [
      { role: 'ai', text: '¿Necesitas alguna recomendación local?' },
      { role: 'user', text: 'Sí, restaurantes cerca' },
      { role: 'ai', typing: true },
      { role: 'ai', text: 'Aquí tienes tres opciones muy valoradas a 5 minutos:' },
      { role: 'ai', link: { text: 'Restaurantes cerca', href: 'https://maps.google.com/?q=restaurants+near+me' } },
    ],
    [
      { role: 'user', text: 'Can you share local services like pharmacy and supermarkets?' },
      { role: 'ai', text: 'Sure! Here is a curated list near the apartment:' },
      { role: 'ai', link: { text: 'Local services map', href: 'https://maps.google.com/?q=pharmacy,supermarket' } },
    ],
    [
      { role: 'user', text: 'El aire acondicionado no funciona' },
      { role: 'ai', text: 'Gracias por avisar. Contacto ahora con el técnico.' },
      { role: 'ai', typing: true },
      { role: 'ai', text: 'Pablo (técnico) puede pasar hoy a las 17:30. ¿Te viene bien?' },
    ],
    [
      { role: 'user', text: 'Где ближайший супермаркет?' },
      { role: 'ai', text: 'Вот карта с ближайшими супермаркетами:' },
      { role: 'ai', link: { text: 'Супермаркеты рядом', href: 'https://maps.google.com/?q=supermarket' } },
    ],
    [
      { role: 'user', text: '可以给我Wi‑Fi密码吗？' },
      { role: 'ai', text: '当然可以。Wi‑Fi: CasaSol，密码: 2024-Helpy.' },
    ],
    [
      { role: 'user', text: 'Se ha roto la cerradura de la puerta' },
      { role: 'ai', text: 'Entiendo la urgencia. Contacto inmediatamente con el cerrajero de confianza.' },
      { role: 'ai', typing: true },
      { role: 'ai', text: 'Miguel (cerrajero) puede estar allí en 30 minutos. Te envío su contacto por si necesitas hablar directamente.' },
    ],
    [
      { role: 'user', text: 'Where can I find the best tapas in the area?' },
      { role: 'ai', text: 'I have some excellent recommendations! Here are the top 3 tapas bars locals love:' },
      { role: 'ai', link: { text: 'Best tapas guide', href: 'https://maps.google.com/?q=best+tapas+bars' } },
      { role: 'ai', text: 'All within 10 minutes walking distance!' },
    ],
    [
      { role: 'user', text: '¿Hay algún evento especial esta semana en la ciudad?' },
      { role: 'ai', typing: true },
      { role: 'ai', text: 'Sí! Esta semana hay un festival de música en la plaza principal (jueves-sábado) y mercadillo artesanal el domingo.' },
      { role: 'ai', link: { text: 'Eventos de la semana', href: 'https://example.com/events' } },
    ],
    [
      { role: 'user', text: 'How do I get to the beach from here?' },
      { role: 'ai', text: 'The nearest beach is just 15 minutes away! You have several options:' },
      { role: 'ai', text: '🚶‍♂️ Walk: 15 min via Paseo Marítimo\n🚌 Bus line 3: 8 min, stops right outside\n🚗 Taxi: 5 min ride' },
      { role: 'ai', link: { text: 'Beach directions', href: 'https://maps.google.com/?q=beach+directions' } },
    ],
    [
      { role: 'user', text: 'La nevera hace mucho ruido por la noche' },
      { role: 'ai', text: 'Disculpa las molestias. Voy a contactar con el técnico de electrodomésticos.' },
      { role: 'ai', typing: true },
      { role: 'ai', text: 'Carlos puede revisar la nevera mañana entre 10:00-12:00. Mientras tanto, puedes ajustar el termostato al nivel 3.' },
    ],
    [
      { role: 'user', text: 'Can you recommend a good pharmacy nearby?' },
      { role: 'ai', text: 'Of course! There are 2 excellent pharmacies very close:' },
      { role: 'ai', text: '💊 Farmacia Central - 3 min walk, open 24h\n💊 Farmacia San Miguel - 5 min walk, closes at 22:00' },
      { role: 'ai', link: { text: 'Pharmacy locations', href: 'https://maps.google.com/?q=pharmacy+near+me' } },
    ],
    [
      { role: 'user', text: '¿Dónde puedo aparcar el coche?' },
      { role: 'ai', typing: true },
      { role: 'ai', text: 'Tienes varias opciones de aparcamiento cerca:' },
      { role: 'ai', text: '🅿️ Plaza Mayor (2 min) - €1.50/hora\n🅿️ Parking Centro (5 min) - €12/día\n🅿️ Calle lateral - gratuito pero limitado' },
    ],
    [
      { role: 'user', text: 'Is there a laundromat around here?' },
      { role: 'ai', text: 'Yes! There\'s a modern laundromat just 2 blocks away.' },
      { role: 'ai', text: 'LavaExpress is open 7:00-23:00 daily. Wash €4, dry €2. They also offer wash & fold service.' },
      { role: 'ai', link: { text: 'Laundromat info', href: 'https://maps.google.com/?q=laundromat' } },
    ],
    [
      { role: 'user', text: 'Se me ha olvidado el cargador del móvil' },
      { role: 'ai', text: 'No te preocupes, tengo varias soluciones:' },
      { role: 'ai', text: '🔌 Hay un cargador universal en el cajón de la mesita\n🏪 Tienda de electrónicos a 200m\n📱 Puedo pedirle a María (limpieza) que te traiga uno' },
    ],
    [
      { role: 'user', text: 'I can\'t find the way to the house' },
      { role: 'ai', text: 'I understand the area is poorly signposted. Let me help you with clear directions.' },
      { role: 'ai', typing: true },
      { role: 'ai', text: 'Take the road that exits the village and take the first left turn. Here\'s the exact path you need to follow:' },
      { role: 'ai', card: { title: 'Route to the property', description: 'Follow this country road until you reach the property. The house will be on your right after about 2km.', imageSrc: '/imagenes/country_road.jpg' } },
    ],
  ];

  // Estado y control de animación de las conversaciones
  const [currentConversationIndex, setCurrentConversationIndex] = useState<number>(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  // Respeta preferencias de movimiento reducido del sistema
  const prefersReducedMotion = useReducedMotion();

  // Auto-scroll inteligente al último mensaje (solo si usuario está cerca del final)
  // - Detecta si el usuario está cerca del final del chat (150px en móvil, 100px en desktop)
  // - Solo hace scroll automático si el usuario está viendo los mensajes recientes
  // - Usa scroll instantáneo en móviles para mejor rendimiento, smooth en desktop
  // - Respeta las preferencias de movimiento reducido del sistema
  useEffect(() => {
    const container = chatContainerRef.current;
    if (container) {
      // Verificar si el usuario está cerca del final del chat (dentro de 150px para móviles)
      const threshold = window.innerWidth < 768 ? 150 : 100; // Mayor tolerancia en móviles
      const isNearBottom = container.scrollTop + container.clientHeight >= container.scrollHeight - threshold;

      // Solo hacer auto-scroll si el usuario está cerca del final
      if (isNearBottom) {
        // Usar requestAnimationFrame para mejor rendimiento en móviles
        requestAnimationFrame(() => {
          if (container) {
            // Usar scroll instantáneo en móviles para mejor rendimiento, smooth en desktop
            const scrollBehavior = window.innerWidth < 768 ? 'instant' : 'smooth';
            container.scrollTo({
              top: container.scrollHeight,
              behavior: scrollBehavior
            });
          }
        });
      }
    }
  }, [chatMessages]);

  // Reproduce las conversaciones en bucle con pequeños delays
  useEffect(() => {
    let isCancelled = false;

    const playConversation = async (convIdx: number) => {
      const convo = phoneConversations[convIdx];
      setChatMessages([]);

      for (let i = 0; i < convo.length; i++) {
        if (isCancelled) return;
        const m = convo[i];
        if (m.typing) {
          // Mostrar indicador de escritura durante ~900ms
          setChatMessages(prev => [...prev, { role: 'ai', typing: true }]);
          await new Promise(r => setTimeout(r, 900));
          // Eliminar typing antes de añadir el mensaje siguiente
          setChatMessages(prev => prev.filter(x => !x.typing));
          continue;
        }
        setChatMessages(prev => [...prev, m]);
        await new Promise(r => setTimeout(r, 2500)); // Tiempo más relajado para lectura sin prisas
      }

      // Pausa al final y pasar a la siguiente conversación
      await new Promise(r => setTimeout(r, 3500)); // Pausa más larga entre conversaciones
      if (!isCancelled) {
        const next = (convIdx + 1) % phoneConversations.length;
        setCurrentConversationIndex(next);
      }
    };

    playConversation(currentConversationIndex);
    return () => { isCancelled = true; };
  }, [currentConversationIndex]);

  // Referencias para las tarjetas de características
  const feature1Ref = useRef<HTMLDivElement>(null);
  const feature2Ref = useRef<HTMLDivElement>(null);
  const feature3Ref = useRef<HTMLDivElement>(null);
  // Ref para el teléfono del hero (para parallax/tilt en desktop)
  const phoneRef = useRef<HTMLDivElement>(null);

  // Activar efecto parallax/tilt solo en escritorio (respetando reduced-motion)
  useParallaxTilt(phoneRef, {
    maxTiltDeg: 6,
    perspectivePx: 1000,
    activationMarginPx: 160,
    scale: 1,
    desktopMinWidth: 1024,
  });

  // Navigation links configuration - now handled by LandingHeader

  // Intersection Observer para animaciones de scroll
  useEffect(() => {
    const observerOptions = {
      threshold: 0.3, // Se activa cuando el 30% del elemento es visible
      rootMargin: "-50px 0px", // Margen para ajustar cuándo se activa
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Manejar pasos de "Cómo funciona"
          const stepRefs = [step1Ref, step2Ref, step3Ref];
          const stepIndex = stepRefs.findIndex(ref => ref.current === entry.target);
          
          if (stepIndex !== -1) {
            setVisibleSteps(prev => {
              const newVisible = [...prev];
              newVisible[stepIndex] = true;
              return newVisible;
            });
          }

          // Manejar tarjetas de características
          const featureRefs = [feature1Ref, feature2Ref, feature3Ref];
          const featureIndex = featureRefs.findIndex(ref => ref.current === entry.target);
          
          if (featureIndex !== -1) {
            setVisibleFeatures(prev => {
              const newVisible = [...prev];
              newVisible[featureIndex] = true;
              return newVisible;
            });
          }
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observar cada paso y cada tarjeta de características
    const allRefs = [step1Ref, step2Ref, step3Ref, feature1Ref, feature2Ref, feature3Ref];
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

  // Utility to get an integer within a closed range [min, max]
  const getRandomInt = (min: number, max: number) => {
    const m = Math.ceil(min);
    const M = Math.floor(max);
    return Math.floor(Math.random() * (M - m + 1)) + m;
  };

  // Animate a numeric state from current value to target value over durationMs, clamped to range
  const animateTo = (
    setter: (n: number) => void,
    from: number,
    to: number,
    durationMs = 1200,
    clampMin?: number,
    clampMax?: number
  ) => {
    // Ensure from and to values are within bounds before starting animation
    if (clampMin !== undefined && clampMax !== undefined) {
      from = Math.max(clampMin, Math.min(clampMax, from));
      to = Math.max(clampMin, Math.min(clampMax, to));
    }

    if (from === to) {
      const v = clampMin !== undefined && clampMax !== undefined
        ? Math.max(clampMin, Math.min(clampMax, to))
        : to;
      setter(v);
      return;
    }
    
    const startTs = performance.now();
    const step = (now: number) => {
      const elapsed = now - startTs;
      const progress = Math.min(elapsed / durationMs, 1);
      let value = Math.round(from + (to - from) * progress);
      
      // Double-check clamping to ensure we never go outside bounds
      if (clampMin !== undefined && clampMax !== undefined) {
        value = Math.max(clampMin, Math.min(clampMax, value));
      }
      
      setter(value);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Rotate KPI numbers every 12 seconds with a brief pulse animation
  useEffect(() => {
    const updateStats = () => {
      setAnimateStats({ queries: true, minutes: true, resolved: true, services: true });
      const nextQueries = getRandomInt(KPI_RANGES.queries.min, KPI_RANGES.queries.max);
      const nextMinutes = getRandomInt(KPI_RANGES.minutes.min, KPI_RANGES.minutes.max);
      const nextResolved = getRandomInt(KPI_RANGES.resolved.min, KPI_RANGES.resolved.max);
      const nextServices = getRandomInt(KPI_RANGES.services.min, KPI_RANGES.services.max);

      animateTo(
        setStatQueries,
        queriesRef.current,
        nextQueries,
        1200,
        KPI_RANGES.queries.min,
        KPI_RANGES.queries.max
      );
      animateTo(
        setStatMinutes,
        minutesRef.current,
        nextMinutes,
        1200,
        KPI_RANGES.minutes.min,
        KPI_RANGES.minutes.max
      );
      animateTo(
        setStatResolved,
        resolvedRef.current,
        nextResolved,
        1200,
        KPI_RANGES.resolved.min,
        KPI_RANGES.resolved.max
      );
      animateTo(
        setStatServices,
        servicesRef.current,
        nextServices,
        1200,
        KPI_RANGES.services.min,
        KPI_RANGES.services.max
      );

      // Remove animation flags after the count-up ends
      setTimeout(
        () => setAnimateStats({ queries: false, minutes: false, resolved: false, services: false }),
        1300
      );
    };

    // Protection mechanism: ensure values are always within bounds
    const validateAndCorrectValues = () => {
      // Check and correct queries value
      if (queriesRef.current < KPI_RANGES.queries.min || queriesRef.current > KPI_RANGES.queries.max) {
        const correctedValue = Math.max(KPI_RANGES.queries.min, Math.min(KPI_RANGES.queries.max, queriesRef.current));
        setStatQueries(correctedValue);
        console.warn(`Corrected queries value from ${queriesRef.current} to ${correctedValue}`);
      }

      // Check and correct minutes value
      if (minutesRef.current < KPI_RANGES.minutes.min || minutesRef.current > KPI_RANGES.minutes.max) {
        const correctedValue = Math.max(KPI_RANGES.minutes.min, Math.min(KPI_RANGES.minutes.max, minutesRef.current));
        setStatMinutes(correctedValue);
        console.warn(`Corrected minutes value from ${minutesRef.current} to ${correctedValue}`);
      }

      // Check and correct resolved value
      if (resolvedRef.current < KPI_RANGES.resolved.min || resolvedRef.current > KPI_RANGES.resolved.max) {
        const correctedValue = Math.max(KPI_RANGES.resolved.min, Math.min(KPI_RANGES.resolved.max, resolvedRef.current));
        setStatResolved(correctedValue);
        console.warn(`Corrected resolved value from ${resolvedRef.current} to ${correctedValue}`);
      }

      // Check and correct services value
      if (servicesRef.current < KPI_RANGES.services.min || servicesRef.current > KPI_RANGES.services.max) {
        const correctedValue = Math.max(KPI_RANGES.services.min, Math.min(KPI_RANGES.services.max, servicesRef.current));
        setStatServices(correctedValue);
        console.warn(`Corrected services value from ${servicesRef.current} to ${correctedValue}`);
      }
    };

    // Initial update on mount, then every 12s
    updateStats();
    const interval = setInterval(updateStats, 12000);
    
    // Validation check every 2 seconds to catch any out-of-bounds values
    const validationInterval = setInterval(validateAndCorrectValues, 2000);
    
    return () => {
      clearInterval(interval);
      clearInterval(validationInterval);
    };
  }, []);

  // Ejemplo de uso directo de logEvent con importación dinámica
  // const handleHeroInteraction = () => {
  //   // Activar el video al hacer clic
  //   setIsVideoPlaying(true);
  //   
  //   // Analytics
  //   import('@services/analytics').then(async ({ logEvent }) => {
  //     try {
  //       await logEvent('Landing', 'Hero Video Play', 'User clicked to play demo video');
  //     } catch (error) {
  //       console.error('Error al registrar evento:', error);
  //     }
  //   }).catch(error => {
  //     console.error('Error al importar servicio de analytics:', error);
  //   });
  // };

  // Función para manejar clic en video promocional
  const handlePromoVideoClick = () => {
    // Activar el video promocional al hacer clic
    setIsPromoVideoPlaying(true);
    
    // Analytics
    import('@services/analytics').then(async ({ logEvent }) => {
      try {
        await logEvent('Landing', 'Promo Video Play', 'User clicked to play promotional video');
      } catch (error) {
        console.error('Error al registrar evento:', error);
      }
    }).catch(error => {
      console.error('Error al importar servicio de analytics:', error);
    });
  };

  // Parallax/tilt effect intentionally removed for a simpler, stable hero



  return (
    <div className="min-h-screen bg-white">
      {/* Header - Now using modular LandingHeader component */}
      <LandingHeader />

      <main>
        {/* Revolutionary AI Hero Section */}
        {/* Height reduced ~40%: mobile 50vh -> 30vh, desktop 100vh -> 60vh */}
        <section className="relative isolate min-h-[30vh] md:min-h-[60vh] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 overflow-hidden">
          {/* Animated Particle Background */}
          <div className="absolute inset-0">
            <canvas 
              id="particle-canvas" 
              className="absolute inset-0 w-full h-full"
              style={{ background: 'transparent' }}
            ></canvas>
          </div>

          {/* Golden Morphing Shapes */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <style>
              {`
                @keyframes morph {
                  0%, 100% { 
                    transform: scale(1) rotate(0deg);
                    border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
                  }
                  25% { 
                    transform: scale(1.1) rotate(90deg);
                    border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
                  }
                  50% { 
                    transform: scale(0.9) rotate(180deg);
                    border-radius: 50% 40% 60% 30% / 70% 50% 40% 60%;
                  }
                  75% { 
                    transform: scale(1.2) rotate(270deg);
                    border-radius: 40% 70% 30% 60% / 40% 70% 60% 50%;
                  }
                }
                
                @keyframes float {
                  0%, 100% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-20px) rotate(180deg); }
                }
                
                @keyframes pulse-golden {
                  0%, 100% { opacity: 0.2; transform: scale(1); }
                  50% { opacity: 0.5; transform: scale(1.1); }
                }
                
                @keyframes text-slide {
                  0% { opacity: 1; transform: translateY(0); }
                  25% { opacity: 0; transform: translateY(-10px); }
                  75% { opacity: 0; transform: translateY(10px); }
                  100% { opacity: 1; transform: translateY(0); }
                }
              `}
            </style>
            
            {/* Main golden shape */}
            <div className="absolute top-1/4 right-1/4 w-96 h-96 opacity-40">
              <div className="relative w-full h-full">
                <div 
                  className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-600 blur-3xl"
                  style={{ 
                    animation: 'morph 12s ease-in-out infinite',
                    borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%'
                  }}
                ></div>
              </div>
            </div>
            
            {/* Secondary golden elements */}
            <div className="absolute bottom-1/4 left-1/6 w-64 h-64 opacity-35">
              <div 
                className="w-full h-full bg-gradient-to-br from-primary-400 to-primary-500 blur-2xl"
                style={{ 
                  animation: 'float 8s ease-in-out infinite',
                  borderRadius: '50%'
                }}
              ></div>
            </div>

            {/* Floating particles */}
            <div className="absolute top-32 right-20 w-3 h-3 bg-primary-400 rounded-full animate-bounce opacity-40" style={{ animationDelay: '1s' }}></div>
            <div className="absolute bottom-20 left-1/4 w-2 h-2 bg-primary-500 rounded-full animate-bounce opacity-50" style={{ animationDelay: '2s' }}></div>
          </div>

          {/* AI Network Grid Overlay */}
          <div className="absolute inset-0 opacity-15">
            <div className="grid grid-cols-20 gap-2 h-full">
              {Array.from({ length: 400 }, (_, i) => (
                <div 
                  key={i}
                  className="border border-primary-500 aspect-square"
                  style={{
                    animation: `pulse-golden ${2 + (i % 3)}s ease-in-out infinite`,
                    animationDelay: `${(i % 20) * 0.05}s`
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Sync inner container min-height to keep layout consistent with reduced hero */}
          <div className="container-limited relative z-20 min-h-[30vh] md:min-h-[60vh] flex md:items-center pt-32 md:pt-16 lg:pt-0 pb-40 md:pb-72 lg:pb-80">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
              
              {/* Left Content */}
              <div className="text-center lg:text-left space-y-8">
                {/* Dynamic Title */}
                <div className="space-y-6 px-4 sm:px-0">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight text-center lg:text-left mt-[1em] md:mt-0">
                    <span className="block">{t("landing.hero.titlePart1")}</span>
                    <span className="block">
                      <span className="text-primary-500">
                        {t("landing.hero.titlePart2")}{" "}
                        <span className="relative inline-block">
                          {t("landing.hero.titlePart3")}
                          <div className="absolute -bottom-2 left-0 right-0 mx-auto w-full h-1 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full animate-pulse"></div>
                        </span>
                      </span>
                    </span>
                </h1>
                  
                  {/* Dynamic Rotating Text - single centered line: "Automatiza X".
                     The word "Automatiza" remains static; rotating word has fixed width
                     to prevent horizontal shifting. */}
                  <div className="text-xl sm:text-2xl text-gray-700 font-light text-center lg:text-left">
                    <div className="lg:whitespace-nowrap">
                      <span className="block lg:inline">{t("landing.hero.subtitlePrefix")}</span>
                      <span className="hidden lg:inline">{' '}</span>
                      <span 
                        id="rotating-text"
                        className="block lg:inline text-primary-500 font-semibold transition-all duration-500 mt-1 lg:mt-0"
                      >
                        {t("landing.hero.rotatingWords.0")}
                      </span>
                    </div>
                  </div>
          </div>
          
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 px-4 sm:px-0">
                  <div className="text-center">
                    <div className={`text-xl sm:text-2xl font-bold text-primary-500 transition-transform duration-500 ${animateStats.queries ? 'animate-pulse scale-105' : ''}`} id="stat-queries">{statQueries}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{t("landing.hero.stats.queries")}</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl sm:text-2xl font-bold text-primary-500 transition-transform duration-500 ${animateStats.minutes ? 'animate-pulse scale-105' : ''}`} id="stat-minutes">{statMinutes}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{t("landing.hero.stats.minutes")}</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl sm:text-2xl font-bold text-primary-500 transition-transform duration-500 ${animateStats.resolved ? 'animate-pulse scale-105' : ''}`}>{statResolved}%</div>
                    <div className="text-xs sm:text-sm text-gray-600">{t("landing.hero.stats.incidents")}</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-xl sm:text-2xl font-bold text-primary-500 transition-transform duration-500 ${animateStats.services ? 'animate-pulse scale-105' : ''}`} id="stat-services">{statServices}</div>
                    <div className="text-xs sm:text-sm text-gray-600">{t("landing.hero.stats.services")}</div>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start px-4 sm:px-0">
                  <CalendlyLink />
                  <Link
                    to="/pricing"
                    className="group relative inline-flex items-center justify-center px-6 py-3 lg:px-8 lg:py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 text-sm lg:text-base"
                  >
                    <span className="relative z-10 font-normal">{t("landing.hero.cta")}</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-gray-200 to-gray-400 rounded-xl opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="flex items-center gap-4 text-gray-600 text-sm justify-center lg:justify-start flex-wrap px-4 sm:px-0">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    <span>{t("landing.hero.trustIndicators.setup")}</span>
              </div>
                  <div className="w-px h-4 bg-gray-300 hidden sm:block"></div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                    <span>{t("landing.hero.trustIndicators.noTech")}</span>
                  </div>
                </div>
              </div>

              {/* Right Side - iPhone Demo - Simplified */}
              <div 
                className="relative"
              >
                {/* iPhone Container - Simplified Structure */}
                <div 
                  className="relative max-w-[270px] sm:max-w-[288px] lg:w-[270px] mx-auto lg:mx-0 lg:ml-auto lg:mr-16 lg:mt-6 scale-75 lg:scale-100"
                >
                  {/* iPhone Frame */}
                  <div ref={phoneRef} className="relative bg-gradient-to-b from-gray-800 to-black rounded-[3rem] p-1 shadow-2xl">
                    {/* iPhone Screen */}
                    <div className="bg-white rounded-[2.5rem] overflow-hidden relative w-full aspect-[9/18]">
                        
                      {/* Dynamic Island */}
                      <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-32 h-7 bg-black rounded-full z-50 flex items-center justify-center">
                        <div className="absolute left-3 w-1.5 h-1.5 bg-gray-700 rounded-full"></div>
                        <div className="w-12 h-1 bg-gray-800 rounded-full"></div>
                        <div className="absolute right-3 w-1 h-1 bg-gray-700 rounded-full"></div>
                      </div>

                      {/* Status Bar - transparent over header, white icons/text */}
                      <div className="absolute top-10 left-2 right-2 h-8 flex items-center justify-between px-3 text-white z-40 bg-transparent">
                        <div className="flex items-center gap-1 text-sm font-semibold">
                          <span>9:41</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5 items-end">
                            <div className="w-0.5 h-1 bg-white rounded-sm"></div>
                            <div className="w-0.5 h-1.5 bg-white rounded-sm"></div>
                            <div className="w-0.5 h-2 bg-white rounded-sm"></div>
                            <div className="w-0.5 h-2.5 bg-white rounded-sm"></div>
                          </div>
                          <div className="w-3 h-3 relative">
                            <div className="absolute inset-0 border-2 border-white rounded-full" style={{ clipPath: 'polygon(0 100%, 100% 100%, 50% 0)' }}></div>
                          </div>
                          <div className="w-6 h-3 border border-white rounded-sm relative">
                            <div className="absolute inset-0.5 bg-white rounded-sm"></div>
                            <div className="absolute -right-0.5 top-1 w-0.5 h-1 bg-white rounded-sm"></div>
                          </div>
                        </div>
                      </div>

                      {/* Chat Header - Host Helper AI Brand Colors */}
                      <div className="absolute top-16 left-0 right-0 bg-primary-500 px-4 py-3 flex items-center gap-2 z-30">
                        <button className="text-white text-lg">‹</button>
                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary-500 leading-none select-none">AI</span>
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-semibold text-sm whitespace-nowrap overflow-hidden text-ellipsis">Host Helper AI</div>
                          <div className="text-primary-100 text-xs flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            {t("landing.hero.phoneDemo.onlineStatus")}
                          </div>
                        </div>
                        <button className="text-white p-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                          </svg>
                        </button>
                        <button className="text-white p-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                          </svg>
                        </button>
                        <button className="text-white p-1">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/>
                          </svg>
                        </button>
                      </div>

                      {/* Chat Messages Area (dynamic) */}
                      <div className="absolute top-28 bottom-16 left-0 right-0 overflow-hidden bg-gradient-to-b from-gray-50 to-gray-100">
                        <AnimatePresence mode="popLayout">
                          <motion.div
                            key={currentConversationIndex}
                            ref={chatContainerRef}
                            id="chat-demo"
                            className="h-full overflow-y-auto px-4 py-3 space-y-3"
                            initial={prefersReducedMotion ? false : { opacity: 0, y: 12, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
                            transition={{ duration: prefersReducedMotion ? 0.12 : 0.28, ease: [0.22, 1, 0.36, 1] }}
                          >
                            {chatMessages.map((m, idx) => (
                              <div key={idx} className={`flex mb-1 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className="max-w-[70%]">
                                  {m.typing ? (
                                    <div className="bg-white rounded-2xl rounded-bl-md px-3 py-2 shadow-sm border border-gray-200">
                                      <div className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse"></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></span>
                                        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></span>
                                      </div>
                                    </div>
                                  ) : m.card ? (
                                    <div className="bg-primary-50 rounded-2xl px-3 py-2 shadow-sm border border-primary-200">
                                      <div className="text-sm font-medium text-primary-800 mb-1">{m.card.title}</div>
                                      {m.card.imageSrc && (
                                        <img src={m.card.imageSrc} alt={m.card.title} className="w-full rounded-lg mb-2" />
                                      )}
                                      <p className="text-sm text-gray-700">{m.card.description}</p>
                                    </div>
                                  ) : (
                                    <div className={`${
                                      m.role === 'user' 
                                        ? 'bg-primary-100 text-primary-800 rounded-2xl rounded-br-md border border-primary-200' 
                                        : 'bg-white text-gray-800 rounded-2xl rounded-bl-md border border-gray-200'
                                    } px-3 py-2 shadow-sm`}>
                                      <p className="text-sm">
                                        {m.text}
                                        {m.link && (
                                          <>
                                            {' '}
                                            <a className="inline-flex items-center gap-1 text-primary-600 underline" href={m.link.href} target="_blank" rel="noreferrer">{m.link.icon === 'google' && (<svg aria-hidden="true" width="14" height="14" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.642 6.053 29.084 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.817C14.413 16.232 18.822 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C33.642 6.053 29.084 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.678-1.977 12.987-5.174l-5.996-5.066C28.936 35.879 26.62 36.8 24 36.8c-5.204 0-9.616-3.362-11.277-8.045l-6.566 5.06C9.49 39.743 16.186 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-0.792 2.236-2.237 4.153-3.989 5.579l0.001-0.001 5.996 5.066C39.83 35.888 44 30.5 44 24c0-1.341-0.138-2.651-0.389-3.917z"/></svg>)}{m.link.text}</a>
                                          </>
                                        )}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </motion.div>
                        </AnimatePresence>
                      </div>

                      {/* iPhone Home Indicator */}
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gray-900 rounded-full"></div>

                      {/* Chat Input Area - Host Helper Brand */}
                      <div className="absolute bottom-4 left-2 right-2 bg-white rounded-full px-4 py-2 flex items-center gap-3 shadow-lg border border-gray-200">
                        <div className="flex-1 text-sm text-gray-600 py-1">
                          {t("landing.hero.phoneDemo.messageInput")}
                        </div>
                        <div className="w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M13 5l7 7-7 7"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Modern transition to next section */}
          {/*
            FIX: We restore a taller, blurred white gradient at the bottom of the hero
            to achieve a seamless fade into the features section.
            - Layer 1: white gradient that fades to transparent (ensures color continuity)
            - Layer 2: subtle backdrop blur to soften shapes behind the fade
            Notes:
            - pointer-events-none prevents blocking interactions near the fold
            - height scales across breakpoints to keep the fade luxurious on mobile/desktop
          */}
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-48 sm:h-64 lg:h-72 z-10">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent"></div>
            <div className="absolute inset-0 backdrop-blur-enhanced"></div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative py-12 md:py-20 bg-white w-full border-b border-gray-100 scroll-mt-24 md:scroll-mt-28">
          {/* Mobile fade-from-hero fix: add top gradient only on small screens */}
          <div className="pointer-events-none absolute -top-8 left-0 right-0 h-12 sm:hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-white/0 via-white/60 to-white"></div>
          </div>
          <div className="container-limited">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4">
                {t("landing.features.title")}
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                {t("landing.features.subtitle")}
              </p>
            </div>



            {/* TEMPORAL: Grid cambiado de 3 a 2 columnas - Check-in temporalmente oculto */}
            {/* Desktop: Morphing cards with liquid animation, Mobile: Original carousel */}
            <div 
              id="features-container"
              className="flex md:flex md:justify-center md:items-center md:gap-16 gap-4 md:gap-8 overflow-x-auto md:overflow-x-visible scrollbar-hide px-4 md:px-0 mobile-carousel"
            >
              {/* Primera tarjeta de características - Agentes IA 24/7 */}
              <div 
                ref={feature1Ref}
                className={`
                  w-[calc(100vw-2rem)] md:w-96 md:h-[500px] 
                  mobile-carousel-item flex-shrink-0 
                  p-8 rounded-3xl
                  shadow-xl hover:shadow-2xl 
                  md:morphing-card md:relative md:overflow-hidden
                  transition-all duration-1000 ease-out 
                  md:hover:scale-105 md:hover:rotate-1
                  ${visibleFeatures[0] 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                  }
                `}
                style={{
                  background: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 75%, #f0f0f0 88%, #e5e5e5 100%)'
                }}
              >
                <div className="mb-4">
                  <div className={`w-64 h-64 mx-auto overflow-hidden relative transition-all duration-700 delay-200 ${
                    visibleFeatures[0] 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-90'
                  }`}>
                    <div className="absolute inset-0 bg-primary-500/10 mix-blend-overlay"></div>
                    <img
                      src="/imagenes/Helpy - office 1.png"
                      alt="Agentes IA 24/7"
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
                <div className="group">
                  <h3 className={`text-xl font-bold mb-2 text-black group-hover:text-gray-800 transition-all duration-700 delay-400 ${
                    visibleFeatures[0] 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 -translate-x-4'
                  }`}>
                    <Link
                      to="/chatbot"
                      className="text-black hover:text-gray-800 transition-colors inline-flex items-center"
                    >
                      {t("landing.features.chatbot")}
                      <svg
                        className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </Link>
                  </h3>
                </div>
                <p className={`text-gray-600 mb-4 transition-all duration-700 delay-600 ${
                  visibleFeatures[0] 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-4'
                }`}>
                  {t("landing.features.chatbotDesc")}
                </p>
              </div>

              {/* TEMPORAL: Segunda tarjeta de características - Check-in automatizado OCULTO */}
              {/* 
              Nota: Esta tarjeta está temporalmente comentada pero se mantiene el código
              para poder reactivarla fácilmente cuando el servicio esté disponible
              
              <div 
                ref={feature2Ref}
                className={`w-[calc(100vw-2rem)] md:w-auto mobile-carousel-item flex-shrink-0 bg-white p-8 rounded-lg shadow-xl hover:shadow-2xl transition-all duration-1000 ease-out delay-200 ${
                  visibleFeatures[1] 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                }`}
              >
                <div className="mb-4">
                  <div className={`w-64 h-64 mx-auto overflow-hidden relative bg-white transition-all duration-700 delay-400 ${
                    visibleFeatures[1] 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-90'
                  }`}>
                    <div className="absolute inset-0 bg-primary-500/10 mix-blend-overlay"></div>
                    <img
                      src="/imagenes/seshospedajes.png"
                      alt="Check-in automatizado"
                      className="w-full h-full object-contain transform hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
                <div className="group">
                  <h3 className={`text-xl font-bold mb-2 text-gray-900 group-hover:text-primary-600 transition-all duration-700 delay-600 ${
                    visibleFeatures[1] 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 -translate-x-4'
                  }`}>
                    <Link
                      to="/check-in"
                      className="text-gray-900 hover:text-primary-600 transition-colors inline-flex items-center"
                    >
                      {t("landing.features.checkIn")}
                      <svg
                        className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </Link>
                  </h3>
                </div>
                <p className={`text-gray-600 mb-4 transition-all duration-700 delay-800 ${
                  visibleFeatures[1] 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-4'
                }`}>
                  {t("landing.features.checkInDesc")}
                </p>
              </div>
              */}

              {/* Segunda tarjeta visible - Upselling inteligente (antes tercera) */}
              <div 
                ref={feature3Ref}
                className={`
                  w-[calc(100vw-2rem)] md:w-96 md:h-[500px] 
                  mobile-carousel-item flex-shrink-0 
                  p-8 rounded-3xl
                  shadow-xl hover:shadow-2xl 
                  md:morphing-card md:relative md:overflow-hidden
                  transition-all duration-1000 ease-out delay-400 
                  md:hover:scale-105 md:hover:-rotate-1
                  ${visibleFeatures[2] 
                    ? 'opacity-100 translate-y-0 scale-100' 
                    : 'opacity-0 translate-y-8 scale-95'
                  }
                `}
                style={{
                  background: 'linear-gradient(to bottom, #ffffff 0%, #ffffff 75%, #f0f0f0 88%, #e5e5e5 100%)'
                }}
              >
                <div className="mb-4">
                  <div className={`w-64 h-64 mx-auto overflow-hidden relative transition-all duration-700 delay-600 ${
                    visibleFeatures[2] 
                      ? 'opacity-100 scale-100' 
                      : 'opacity-0 scale-90'
                  }`}>
                    <div className="absolute inset-0 bg-primary-500/10 mix-blend-overlay"></div>
                    <img
                      src="/imagenes/phoneCall.png"
                      alt="Upselling inteligente"
                      className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                    />
                  </div>
                </div>
                <div className="group">
                  <h3 className={`text-xl font-bold mb-2 text-black group-hover:text-gray-800 transition-all duration-700 delay-800 ${
                    visibleFeatures[2] 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 -translate-x-4'
                  }`}>
                    <Link
                      to="/upselling"
                      className="text-black hover:text-gray-800 transition-colors inline-flex items-center"
                    >
                      {t("landing.features.upselling")}
                      <svg
                        className="w-4 h-4 ml-1 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </Link>
                  </h3>
                </div>
                <p className={`text-gray-600 mb-4 transition-all duration-700 delay-1000 ${
                  visibleFeatures[2] 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-4'
                }`}>
                  {t("landing.features.upsellingDesc")}
                </p>
              </div>
            </div>

            {/* Navigation arrows for mobile - positioned below cards, same style as dashboard */}
            <div className="flex justify-center mt-6 md:hidden">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const container = document.getElementById('features-container');
                    if (container) {
                      container.scrollBy({ left: -container.clientWidth, behavior: 'smooth' });
                    }
                  }}
                  className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                  aria-label="Ver características anteriores"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const container = document.getElementById('features-container');
                    if (container) {
                      container.scrollBy({ left: container.clientWidth, behavior: 'smooth' });
                    }
                  }}
                  className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
                  aria-label="Ver características siguientes"
                >
                  <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Video Promocional */}
        <section className="py-16 bg-gray-50 silver:bg-gray-50">
          <div className="container-limited">
            <div className="text-center mb-12">
              <h2
                className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
                dangerouslySetInnerHTML={{
                  __html: t("landing.promoVideo.title").replace('Host Helper Ai', (match) => 
                    match.replace('Ai', `<span style="color: #ECA404;">Ai</span>`)
                  )
                }}
              />
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {t("landing.promoVideo.subtitle")}
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <div 
                className="relative w-full cursor-pointer group"
                onClick={handlePromoVideoClick}
              >
                {!isPromoVideoPlaying ? (
                  // Imagen miniatura con botón de play personalizado
                  <div className="relative w-full h-full">
                    <img
                      src={currentPromoVideo.thumbnail}
                      alt="Host Helper AI - Video promocional"
                      className="w-full h-full object-cover rounded-2xl shadow-2xl transition-all duration-700 ease-in-out group-hover:scale-[1.02]"
                      style={{
                        aspectRatio: "16/9",
                      }}
                    />
                    {/* Overlay con botón de play personalizado */}
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center group-hover:bg-black/20 transition-all duration-300 rounded-2xl">
                      <div className="bg-white/95 rounded-full p-3 shadow-lg group-hover:scale-110 transition-transform duration-300">
                        <svg 
                          className="w-6 h-6 text-primary-600 ml-0.5" 
                          fill="currentColor" 
                          viewBox="0 0 20 20"
                        >
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Video de YouTube cuando está activado
                  <iframe
                    src={`https://www.youtube.com/embed/${currentPromoVideo.videoId}?autoplay=1&controls=1&modestbranding=1&rel=0&showinfo=0`}
                    className="w-full h-full rounded-2xl shadow-2xl"
                    style={{
                      aspectRatio: "16/9",
                    }}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title="Host Helper AI - Video Promocional"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="py-24 bg-gray-50" id="how-it-works">
          <div className="container-limited">
            <div className="text-center mb-16">
              <h2
                className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
                dangerouslySetInnerHTML={{
                  __html: t("landing.howItWorks.title").replace('Host Helper Ai', (match) => 
                    match.replace('Ai', `<span style="color: #ECA404;">Ai</span>`)
                  )
                }}
              />
            </div>

            {/* Paso 1 */}
            <div 
              ref={step1Ref}
              className={`flex flex-col md:flex-row items-center mb-16 transition-all duration-1000 ease-out ${
                visibleSteps[0] 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <div className="flex items-start mb-4">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-primary-500 text-xl font-semibold mr-4 flex-shrink-0 transition-all duration-700 delay-200 shadow-lg border border-gray-300 ${
                      visibleSteps[0] 
                        ? 'scale-100 rotate-0' 
                        : 'scale-0 -rotate-45'
                    }`}
                    style={{
                      background: 'radial-gradient(circle at center, white 30%, #d1d5db 70%, #9ca3af 100%)'
                    }}
                  >
                    1
                  </div>
                  <h3 className={`text-2xl font-bold text-gray-900 text-left flex-1 leading-tight transition-all duration-700 delay-300 ${
                    visibleSteps[0] 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 -translate-x-4'
                  }`}>
                    {t("landing.howItWorks.step1.title")}
                  </h3>
                </div>
                <p className={`text-gray-600 mb-4 transition-all duration-700 delay-500 ${
                  visibleSteps[0] 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-4'
                }`}>
                  {t("landing.howItWorks.step1.description")}
                </p>
              </div>
              <div className="md:w-1/2">
                <div
                  className={`group relative w-5/6 h-64 mx-auto overflow-hidden shadow-xl transition-all duration-1000 delay-400 ${
                    visibleSteps[0] 
                      ? 'opacity-100 translate-x-0 scale-100' 
                      : 'opacity-0 translate-x-8 scale-95'
                  }`}
                  style={{
                    clipPath:
                      "polygon(0% 0%, 100% 0%, 95% 85%, 90% 100%, 0% 100%)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-tr from-primary-500/20 to-transparent z-10"></div>
                  <img
                    src="/imagenes/CasaMarbella.png"
                    alt="Registro y añadir propiedad"
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute -bottom-10 left-0 w-32 h-32 bg-primary-600 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-all duration-500"></div>
                </div>
              </div>
            </div>

            {/* Paso 2 */}
            <div 
              ref={step2Ref}
              className={`flex flex-col md:flex-row-reverse items-center mb-16 transition-all duration-1000 ease-out ${
                visibleSteps[1] 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="md:w-1/2 mb-8 md:mb-0 md:pl-8">
                <div className="flex items-start mb-4">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-primary-500 text-xl font-semibold mr-4 flex-shrink-0 transition-all duration-700 delay-200 shadow-lg border border-gray-300 ${
                      visibleSteps[1] 
                        ? 'scale-100 rotate-0' 
                        : 'scale-0 -rotate-45'
                    }`}
                    style={{
                      background: 'radial-gradient(circle at center, white 30%, #d1d5db 70%, #9ca3af 100%)'
                    }}
                  >
                    2
                  </div>
                  <h3 className={`text-2xl font-bold text-gray-900 text-left flex-1 leading-tight transition-all duration-700 delay-300 ${
                    visibleSteps[1] 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 translate-x-4'
                  }`}>
                    {t("landing.howItWorks.step2.title")}
                  </h3>
                </div>
                <p className={`text-gray-600 mb-4 transition-all duration-700 delay-500 ${
                  visibleSteps[1] 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 translate-x-4'
                }`}>
                  {t("landing.howItWorks.step2.description")}
                </p>
              </div>
              <div className="md:w-1/2">
                <div
                  className={`group relative w-5/6 h-64 mx-auto overflow-hidden shadow-xl transition-all duration-1000 delay-400 ${
                    visibleSteps[1] 
                      ? 'opacity-100 translate-x-0 scale-100' 
                      : 'opacity-0 -translate-x-8 scale-95'
                  }`}
                  style={{
                    clipPath:
                      "polygon(0% 0%, 100% 0%, 95% 85%, 90% 100%, 0% 100%)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-bl from-primary-600/30 to-transparent z-10"></div>
                  <img
                    src="/imagenes/Helpy - South Spain street 2.png"
                    alt="Configuración de Agentes de IA"
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute -bottom-10 left-0 w-32 h-32 bg-primary-600 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-all duration-500"></div>
                </div>
              </div>
            </div>

            {/* Paso 3 */}
            <div 
              ref={step3Ref}
              className={`flex flex-col md:flex-row items-center transition-all duration-1000 ease-out ${
                visibleSteps[2] 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-8'
              }`}
            >
              <div className="md:w-1/2 mb-8 md:mb-0 md:pr-8">
                <div className="flex items-start mb-4">
                  <div 
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-primary-500 text-xl font-semibold mr-4 flex-shrink-0 transition-all duration-700 delay-200 shadow-lg border border-gray-300 ${
                      visibleSteps[2] 
                        ? 'scale-100 rotate-0' 
                        : 'scale-0 -rotate-45'
                    }`}
                    style={{
                      background: 'radial-gradient(circle at center, white 30%, #d1d5db 70%, #9ca3af 100%)'
                    }}
                  >
                    3
                  </div>
                  <h3 className={`text-2xl font-bold text-gray-900 text-left flex-1 leading-tight transition-all duration-700 delay-300 ${
                    visibleSteps[2] 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 -translate-x-4'
                  }`}>
                    {t("landing.howItWorks.step3.title")}
                  </h3>
                </div>
                <p className={`text-gray-600 mb-4 transition-all duration-700 delay-500 ${
                  visibleSteps[2] 
                    ? 'opacity-100 translate-x-0' 
                    : 'opacity-0 -translate-x-4'
                }`}>
                  {t("landing.howItWorks.step3.description")}
                </p>
              </div>
              <div className="md:w-1/2">
                <div
                  className={`group relative w-5/6 h-64 mx-auto overflow-hidden shadow-xl transition-all duration-1000 delay-400 ${
                    visibleSteps[2] 
                      ? 'opacity-100 translate-x-0 scale-100' 
                      : 'opacity-0 translate-x-8 scale-95'
                  }`}
                  style={{
                    clipPath:
                      "polygon(0% 0%, 100% 0%, 95% 85%, 90% 100%, 0% 100%)",
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-transparent z-10"></div>
                  <img
                    src="/imagenes/turist_phone.jpg"
                    alt="Compartir enlace con huéspedes"
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:rotate-1"
                  />
                  <div className="absolute -bottom-10 right-0 w-32 h-32 bg-primary-600 rounded-full opacity-20 blur-xl group-hover:opacity-40 transition-all duration-500"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ElevenLabs Convai Widget - removed per design to avoid green bottom bar */}
        <elevenlabs-convai agent-id="agent_3101k2ff56kpfrjaz2zbz13xs57m"></elevenlabs-convai>
        <script src="https://unpkg.com/@elevenlabs/convai-widget-embed" async type="text/javascript"></script>
      </main>

      {/* Footer compartido */}
      <Footer />
    </div>
  );
};

export default LandingPage;
