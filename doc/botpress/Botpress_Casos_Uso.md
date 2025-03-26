# Casos de Uso: Análisis de Conversaciones Botpress+WhatsApp para Host Helper

## Introducción

Este documento presenta casos de uso detallados para la extracción y análisis de datos de conversaciones entre huéspedes y chatbots integrados con WhatsApp en la plataforma Host Helper. Cada caso de uso incluye el problema a resolver, la metodología de análisis, los datos a extraer, los insights esperados y las acciones recomendadas.

## 1. Optimización de Experiencia de Check-in/Check-out

### 1.1 Problema

Los procesos de check-in y check-out son puntos críticos en la experiencia del huésped, pero a menudo generan confusión y fricción. Las conversaciones con el chatbot pueden revelar problemas recurrentes y oportunidades de mejora.

### 1.2 Preguntas de Análisis

- ¿Cuáles son las consultas más frecuentes sobre el proceso de check-in/check-out?
- ¿Qué aspectos generan mayor frustración o confusión?
- ¿Cuánto tiempo se dedica a resolver dudas sobre estos procesos?
- ¿Qué diferencias existen entre las experiencias de diferentes propiedades?

### 1.3 Datos a Extraer

```javascript
// Estructura para análisis de conversaciones sobre check-in/check-out
const checkInAnalysis = {
  propertyId: "prop_123",
  totalCheckInQueries: 128,
  averageResolutionTime: 3.5, // minutos
  commonIssues: [
    {
      issue: "ubicación_llaves",
      frequency: 42,
      avgSentiment: -0.3,
      keywords: ["llaves", "encontrar", "acceso", "caja"]
    },
    {
      issue: "horario_flexible",
      frequency: 38,
      avgSentiment: -0.5,
      keywords: ["tarde", "noche", "flexible", "hora"]
    },
    {
      issue: "proceso_registro",
      frequency: 22,
      avgSentiment: -0.2,
      keywords: ["documento", "formulario", "registro", "identificación"]
    }
  ],
  sentimentByHour: {
    "10-12": 0.4,
    "12-14": 0.2,
    "14-16": -0.3,
    "16-18": -0.2,
    "18-20": -0.4,
    "20-22": -0.6
  }
};
```

### 1.4 Insights Esperados

- Identificar los horarios más problemáticos para check-in
- Descubrir puntos de fricción específicos por tipo de propiedad
- Cuantificar el impacto de diferentes métodos de entrega de llaves
- Detectar correlaciones entre problemas de check-in y quejas posteriores

### 1.5 Acciones Recomendadas

- Crear guías personalizadas de check-in por tipo de propiedad
- Implementar recordatorios proactivos antes de la llegada
- Optimizar procesos en franjas horarias problemáticas
- Desarrollar respuestas automatizadas para las consultas más frecuentes

## 2. Detección y Gestión de Problemas en la Propiedad

### 2.1 Problema

Los huéspedes pueden enfrentar diversos problemas durante su estancia (equipamiento que no funciona, limpieza, ruido, etc.). La detección temprana y resolución eficiente de estos problemas es crucial para la satisfacción.

### 2.2 Preguntas de Análisis

- ¿Cuáles son los problemas más comunes reportados durante la estancia?
- ¿Cómo evoluciona el sentimiento del huésped durante el proceso de resolución?
- ¿Qué problemas tienen mayor impacto en la satisfacción general?
- ¿Cuál es el tiempo promedio de respuesta y resolución por tipo de problema?

### 2.3 Datos a Extraer

```javascript
// Estructura para análisis de problemas reportados
const propertyIssuesAnalysis = {
  propertyId: "prop_123",
  totalReportedIssues: 78,
  issuesByCategory: {
    "equipamiento": 32,
    "limpieza": 18,
    "wifi": 12,
    "ruido": 8,
    "climatización": 5,
    "otros": 3
  },
  equipmentIssueDetails: [
    {
      item: "calentador_agua",
      frequency: 15,
      avgSentiment: -0.7,
      avgResolutionTime: 180 // minutos
    },
    {
      item: "cocina",
      frequency: 8,
      avgSentiment: -0.5,
      avgResolutionTime: 120
    }
  ],
  sentimentProgression: {
    "reporte_inicial": -0.8,
    "respuesta_inicial": -0.6,
    "durante_resolución": -0.4,
    "después_resolución": 0.2
  },
  issuePatterns: {
    "recurrentes": ["wifi_lento", "agua_caliente", "ruido_vecinos"],
    "estacionales": ["calefacción_invierno", "aire_acondicionado_verano"],
    "por_antigüedad": ["electrodomésticos_antiguos", "grifos"]
  }
};
```

### 2.4 Insights Esperados

- Identificar problemas recurrentes por propiedad o tipo de propiedad
- Evaluar la efectividad de diferentes enfoques de resolución
- Detectar problemas estacionales para mantenimiento preventivo
- Medir el impacto de la velocidad de respuesta en la recuperación del sentimiento

### 2.5 Acciones Recomendadas

- Crear un sistema de alertas tempranas para propietarios
- Establecer protocolos de respuesta por tipo de incidencia
- Implementar checklist de mantenimiento preventivo basado en problemas frecuentes
- Desarrollar un catálogo de soluciones rápidas para problemas comunes

## 3. Análisis de Oportunidades de Venta Cruzada

### 3.1 Problema

Existen numerosas oportunidades para ofrecer servicios adicionales relevantes a los huéspedes, pero es difícil identificar el momento óptimo y el servicio más apropiado para cada huésped.

### 3.2 Preguntas de Análisis

- ¿Qué servicios o amenidades adicionales consultan más frecuentemente los huéspedes?
- ¿En qué momento de la estancia surgen estas consultas?
- ¿Qué servicios externos (restaurantes, actividades) generan mayor interés?
- ¿Qué correlaciones existen entre el perfil del huésped y los servicios solicitados?

### 3.3 Datos a Extraer

```javascript
// Estructura para análisis de oportunidades de venta cruzada
const crossSellingAnalysis = {
  propertyId: "prop_123",
  totalOpportunities: 156,
  servicesMentioned: [
    {
      service: "traslado_aeropuerto",
      frequency: 42,
      contextTiming: "pre_estancia",
      avgSentiment: 0.3,
      conversionRate: 0.65
    },
    {
      service: "tour_ciudad",
      frequency: 38,
      contextTiming: "inicio_estancia",
      avgSentiment: 0.6,
      conversionRate: 0.48
    },
    {
      service: "restaurantes",
      frequency: 35,
      contextTiming: "durante_estancia",
      avgSentiment: 0.4,
      conversionRate: 0.22
    }
  ],
  timingAnalysis: {
    "dias_antes": [
      {
        daysBefore: 7,
        topServices: ["traslado", "tour", "alquiler_coche"]
      },
      {
        daysBefore: 1,
        topServices: ["entrada_atracciones", "restaurantes"]
      }
    ],
    "durante_estancia": [
      {
        day: 1,
        topServices: ["tour_orientación", "mapa", "transporte_local"]
      },
      {
        day: 2,
        topServices: ["actividades_culturales", "gastronomía"]
      }
    ]
  },
  correlations: [
    {
      profileAttribute: "familia_niños",
      services: ["parques", "actividades_infantiles", "restaurantes_familiares"]
    },
    {
      profileAttribute: "negocios",
      services: ["transporte_privado", "restaurantes_premium", "workspace"]
    }
  ]
};
```

### 3.4 Insights Esperados

- Identificar el timing óptimo para ofrecer cada servicio
- Descubrir correlaciones entre tipo de huésped y servicios demandados
- Evaluar la efectividad de diferentes técnicas de recomendación
- Detectar servicios con alta demanda para nuevas alianzas comerciales

### 3.5 Acciones Recomendadas

- Implementar sistema de recomendaciones automatizado basado en perfiles
- Crear secuencias de mensajes proactivos en momentos clave
- Desarrollar alianzas estratégicas con proveedores de servicios populares
- Personalizar ofertas según histórico de conversaciones previas

## 4. Personalización de Experiencia Pre-Estancia

### 4.1 Problema

El período entre la reserva y la llegada es crucial para establecer expectativas y mejorar la experiencia general, pero a menudo carece de personalización y relevancia.

### 4.2 Preguntas de Análisis

- ¿Qué información buscan los huéspedes antes de su llegada?
- ¿Qué preocupaciones expresan sobre la propiedad o el destino?
- ¿Qué servicios adicionales consideran contratar antes de llegar?
- ¿Qué diferencias existen entre los distintos perfiles de viajeros?

### 4.3 Datos a Extraer

```javascript
// Estructura para análisis de comunicación pre-estancia
const preStayAnalysis = {
  totalPreStayConversations: 345,
  timeBeforeCheckin: {
    "1-7_días": 112,
    "8-14_días": 95,
    "15-30_días": 86,
    "31+_días": 52
  },
  topQueriesByTime: {
    "31+_días": ["políticas_cancelación", "servicios_básicos", "transporte"],
    "15-30_días": ["clima", "qué_empacar", "restaurantes_cercanos"],
    "8-14_días": ["check-in", "traslados", "atracciones"],
    "1-7_días": ["llegada", "wifi", "instrucciones_acceso"]
  },
  informationCategories: [
    {
      category: "logística_llegada",
      frequency: 187,
      importance: 0.85,
      topics: ["transporte", "llaves", "horarios"]
    },
    {
      category: "servicios_propiedad",
      frequency: 142,
      importance: 0.75,
      topics: ["wifi", "cocina", "lavadora"]
    },
    {
      category: "área_local",
      frequency: 126,
      importance: 0.65,
      topics: ["supermercados", "farmacias", "transporte_público"]
    }
  ],
  travellerProfiles: [
    {
      profile: "familia",
      topConcerns: ["seguridad", "espacios_niños", "actividades_familiares"],
      informationNeeds: ["high", "procedural", "safety-oriented"]
    },
    {
      profile: "negocios",
      topConcerns: ["wifi", "transporte", "check-in_rápido"],
      informationNeeds: ["medium", "efficiency-oriented", "predictable"]
    },
    {
      profile: "vacaciones",
      topConcerns: ["ocio", "recomendaciones", "experiencias"],
      informationNeeds: ["high", "destination-oriented", "flexible"]
    }
  ]
};
```

### 4.4 Insights Esperados

- Identificar la secuencia óptima de comunicaciones pre-estancia
- Descubrir información crítica por tipo de viajero
- Evaluar el impacto de la comunicación proactiva en la reducción de consultas
- Detectar preocupaciones no abordadas en las comunicaciones actuales

### 4.5 Acciones Recomendadas

- Desarrollar secuencias de mensajes automatizados personalizados por perfil
- Crear guías digitales específicas para cada propiedad y tipo de viajero
- Implementar verificaciones pre-llegada para anticipar necesidades
- Diseñar respuestas enriquecidas para las consultas más frecuentes

## 5. Análisis de Satisfacción y Experiencia Post-Estancia

### 5.1 Problema

Comprender la satisfacción real del huésped y los factores que influyen en ella es fundamental para mejorar el servicio, pero las encuestas tradicionales tienen limitaciones.

### 5.2 Preguntas de Análisis

- ¿Qué aspectos de la estancia generan mayor satisfacción o insatisfacción?
- ¿Cuáles son los indicadores implícitos de intención de retorno o recomendación?
- ¿Cómo varía la satisfacción según la temporada, duración de estancia o tipo de propiedad?
- ¿Qué correlación existe entre problemas durante la estancia y evaluación final?

### 5.3 Datos a Extraer

```javascript
// Estructura para análisis de experiencia post-estancia
const postStayAnalysis = {
  totalPostStayConversations: 283,
  overallSentiment: 0.45, // escala de -1 a 1
  sentimentByProperty: [
    { propertyId: "prop_123", sentiment: 0.6, stayCount: 58 },
    { propertyId: "prop_124", sentiment: 0.3, stayCount: 45 },
    { propertyId: "prop_125", sentiment: 0.7, stayCount: 62 }
  ],
  satisfactionDrivers: [
    {
      aspect: "limpieza",
      mentionFrequency: 78,
      positiveRatio: 0.85,
      averageSentiment: 0.7,
      keyPhrases: ["impecable", "muy limpio", "ordenado"]
    },
    {
      aspect: "ubicación",
      mentionFrequency: 65,
      positiveRatio: 0.92,
      averageSentiment: 0.8,
      keyPhrases: ["céntrico", "cerca de todo", "bien comunicado"]
    },
    {
      aspect: "valor",
      mentionFrequency: 49,
      positiveRatio: 0.65,
      averageSentiment: 0.3,
      keyPhrases: ["precio", "caro", "vale la pena"]
    }
  ],
  returnIndications: {
    explicitMentions: 62,
    implicitSignals: 94,
    keyPhrases: ["volveremos", "próxima vez", "repetiremos"],
    correlatedAspects: ["ubicación", "atención", "comodidad"]
  },
  issueImpact: [
    {
      issueType: "limpieza",
      frequency: 23,
      sentimentImpact: -0.5,
      resolutionEffect: 0.3
    },
    {
      issueType: "ruido",
      frequency: 18,
      sentimentImpact: -0.7,
      resolutionEffect: 0.1
    }
  ],
  seasonalVariation: {
    "verano": 0.5,
    "otoño": 0.6,
    "invierno": 0.3,
    "primavera": 0.7
  }
};
```

### 5.4 Insights Esperados

- Identificar los principales impulsores de satisfacción e insatisfacción
- Descubrir patrones estacionales en la satisfacción
- Evaluar el impacto de diferentes tipos de problemas en la experiencia global
- Detectar indicadores tempranos de reseñas negativas

### 5.5 Acciones Recomendadas

- Implementar mejoras prioritarias en aspectos clave de satisfacción
- Desarrollar protocolos de intervención para problemas de alto impacto
- Crear estrategias de recuperación de servicio basadas en análisis de casos
- Diseñar programas de fidelización personalizados según señales de retorno

## 6. Optimización de Información Turística y Recomendaciones Locales

### 6.1 Problema

Los huéspedes buscan constantemente recomendaciones auténticas y relevantes sobre el destino, pero las respuestas genéricas no satisfacen sus necesidades específicas.

### 6.2 Preguntas de Análisis

- ¿Qué tipo de información local solicitan más frecuentemente los huéspedes?
- ¿Cómo varían estas consultas según la temporada, duración de la estancia o tipo de viajero?
- ¿Qué establecimientos o actividades generan mayor interés o satisfacción?
- ¿Qué información local no está siendo adecuadamente cubierta por las respuestas actuales?

### 6.3 Datos a Extraer

```javascript
// Estructura para análisis de consultas de información local
const localInfoAnalysis = {
  totalLocalInfoQueries: 568,
  queriesByCategory: {
    "restaurantes": 187,
    "transporte": 124,
    "atracciones": 98,
    "compras": 76,
    "eventos": 45,
    "servicios": 38
  },
  restaurantQueries: {
    byType: {
      "local": 102,
      "internacional": 43,
      "económico": 28,
      "premium": 14
    },
    topCuisines: ["tradicional", "mediterránea", "tapas", "mariscos"],
    specificNeeds: ["vegetariano", "celíaco", "familiar", "terraza"]
  },
  attractionQueries: {
    byType: {
      "monumentos": 34,
      "museos": 28,
      "naturaleza": 22,
      "playas": 14
    },
    specificInterests: ["historia local", "arte contemporáneo", "arquitectura"],
    logisticalConcerns: ["horarios", "entradas", "accesibilidad"]
  },
  queryTiming: {
    "pre_estancia": {
      percentage: 15,
      topCategories: ["transporte", "planificación"]
    },
    "primer_día": {
      percentage: 35,
      topCategories: ["orientación", "restaurantes", "básicos"]
    },
    "durante_estancia": {
      percentage: 45,
      topCategories: ["actividades", "gastronomía", "eventos"]
    },
    "última_día": {
      percentage: 5,
      topCategories: ["transporte", "recuerdos"]
    }
  },
  seasonalInterests: {
    "verano": ["playas", "actividades_acuáticas", "terrazas"],
    "invierno": ["gastronomía", "museos", "compras"],
    "temporada_alta": ["reservas", "evitar_colas", "alternativas"]
  },
  responseEffectiveness: {
    adequateResponses: 0.72, // porcentaje de respuestas satisfactorias
    informationGaps: ["eventos_actuales", "opciones_niños", "transporte_noche"],
    followUpQueries: 0.28 // porcentaje que requiere aclaraciones adicionales
  }
};
```

### 6.4 Insights Esperados

- Identificar las categorías de información local más demandadas
- Descubrir patrones temporales en consultas sobre el destino
- Evaluar la efectividad de las respuestas actuales sobre información local
- Detectar oportunidades para alianzas con comercios locales frecuentemente solicitados

### 6.5 Acciones Recomendadas

- Crear guías locales personalizadas por temporada y tipo de viajero
- Desarrollar base de conocimiento específica para cada destino
- Implementar actualizaciones periódicas de información sobre eventos locales
- Diseñar respuestas enriquecidas con imágenes y enlaces para consultas frecuentes

## 7. Análisis y Mejora de Comunicación de Políticas y Normas

### 7.1 Problema

La comunicación efectiva de políticas, normas y procedimientos es esencial para establecer expectativas claras y evitar conflictos, pero a menudo genera confusión o malentendidos.

### 7.2 Preguntas de Análisis

- ¿Qué políticas o normas generan más consultas o confusión?
- ¿En qué momento se realizan estas consultas y cómo afectan la experiencia?
- ¿Qué lenguaje o terminología resulta confusa para los huéspedes?
- ¿Qué diferencias existen en la comprensión de políticas entre distintos segmentos de huéspedes?

### 7.3 Datos a Extraer

```javascript
// Estructura para análisis de consultas sobre políticas y normas
const policiesAnalysis = {
  totalPolicyQueries: 246,
  queriesByPolicy: [
    {
      policy: "cancelación",
      frequency: 68,
      timing: {
        "pre_reserva": 15,
        "post_reserva": 42,
        "pre_estancia": 11
      },
      sentiment: -0.2,
      commonConfusions: ["plazos", "devoluciones", "excepciones"]
    },
    {
      policy: "check-in/check-out",
      frequency: 57,
      timing: {
        "pre_reserva": 5,
        "post_reserva": 12,
        "pre_estancia": 40
      },
      sentiment: -0.1,
      commonConfusions: ["horarios_flexibles", "late_check-out", "early_check-in"]
    },
    {
      policy: "mascotas",
      frequency: 43,
      timing: {
        "pre_reserva": 35,
        "post_reserva": 7,
        "pre_estancia": 1
      },
      sentiment: 0.0,
      commonConfusions: ["tamaño_permitido", "razas", "zonas_comunes"]
    },
    {
      policy: "limpieza",
      frequency: 38,
      timing: {
        "pre_reserva": 10,
        "post_reserva": 8,
        "pre_estancia": 20
      },
      sentiment: -0.3,
      commonConfusions: ["proceso_salida", "cargos_adicionales", "estado_esperado"]
    }
  ],
  languageAnalysis: {
    problematicTerms: [
      {
        term: "flexibilidad",
        context: "cancelación",
        interpretations: ["totalmente flexible", "según política"]
      },
      {
        term: "limpieza básica",
        context: "salida",
        interpretations: ["barrer", "limpieza completa", "solo basura"]
      }
    ],
    effectiveFormulations: [
      {
        policy: "cancelación",
        formulation: "Devolución del 100% si cancelas 7 días antes",
        clarity: 0.9
      },
      {
        policy: "check-in",
        formulation: "Acceso autónomo 24h con caja de seguridad",
        clarity: 0.95
      }
    ]
  },
  segmentDifferences: [
    {
      segment: "internacional",
      keyDifferences: ["depósitos", "documentación", "protocolos_limpieza"],
      recommendedApproach: "explicación visual paso a paso"
    },
    {
      segment: "familias",
      keyDifferences: ["daños", "ruido", "zonas_comunes"],
      recommendedApproach: "énfasis en aspectos positivos de seguridad"
    }
  ],
  policyImpact: {
    bookingConversion: {
      "cancelación_flexible": 0.85,
      "cancelación_estricta": 0.65
    },
    satisfactionImpact: {
      "reglas_claras_anticipadas": 0.3,
      "sorpresas_durante_estancia": -0.7
    }
  }
};
```

### 7.4 Insights Esperados

- Identificar las políticas que generan más confusión o fricción
- Descubrir terminología problemática que requiere clarificación
- Evaluar el impacto de diferentes formulaciones de políticas
- Detectar diferencias culturales o demográficas en la comprensión de normas

### 7.5 Acciones Recomendadas

- Reformular políticas clave utilizando lenguaje claro y ejemplos concretos
- Desarrollar explicaciones visuales para políticas complejas
- Implementar confirmaciones proactivas de entendimiento de normas críticas
- Personalizar la comunicación de políticas según perfil del huésped

## 8. Análisis de Necesidades Especiales y Personalización

### 8.1 Problema

Los huéspedes con necesidades especiales (accesibilidad, alergias, familias con niños, etc.) requieren información precisa y servicios adaptados, pero a menudo tienen dificultades para obtenerlos.

### 8.2 Preguntas de Análisis

- ¿Qué necesidades especiales se mencionan con mayor frecuencia?
- ¿Cómo afectan estas necesidades a la elección y experiencia en la propiedad?
- ¿Qué información adicional buscan estos huéspedes antes de su estancia?
- ¿Cómo varía la satisfacción de estos huéspedes en comparación con el promedio?

### 8.3 Datos a Extraer

```javascript
// Estructura para análisis de necesidades especiales
const specialNeedsAnalysis = {
  totalSpecialNeedsQueries: 178,
  categoriesByFrequency: [
    {
      category: "accesibilidad",
      frequency: 58,
      specificConcerns: [
        "acceso_silla_ruedas", "baño_adaptado", "ascensor", 
        "distancia_puntos_interés", "aparcamiento_próximo"
      ],
      propertyPreparation: 0.6, // nivel de preparación de propiedades (0-1)
      informationAccuracy: 0.7 // precisión de la información proporcionada (0-1)
    },
    {
      category: "alergias_intolerancias",
      frequency: 42,
      specificConcerns: [
        "alergenos_ropa_cama", "productos_limpieza", "mascotas_previas",
        "opciones_alimentarias", "alergia_polen"
      ],
      propertyPreparation: 0.5,
      informationAccuracy: 0.6
    },
    {
      category: "familias_niños",
      frequency: 38,
      specificConcerns: [
        "cuna", "seguridad_escaleras", "seguridad_balcón",
        "restaurantes_aptos", "actividades_infantiles"
      ],
      propertyPreparation: 0.7,
      informationAccuracy: 0.8
    },
    {
      category: "mascotas",
      frequency: 25,
      specificConcerns: [
        "zonas_paseo", "veterinarios", "restricciones_tamaño",
        "cargos_adicionales", "áreas_permitidas"
      ],
      propertyPreparation: 0.6,
      informationAccuracy: 0.7
    },
    {
      category: "necesidades_médicas",
      frequency: 15,
      specificConcerns: [
        "proximidad_farmacias", "hospitales", "almacenamiento_medicamentos",
        "servicio_médico", "equipamiento_específico"
      ],
      propertyPreparation: 0.4,
      informationAccuracy: 0.5
    }
  ],
  preStayInformation: {
    requestTiming: {
      "durante_búsqueda": 45,
      "pre_reserva": 82,
      "post_reserva": 38,
      "semana_antes": 13
    },
    informationDetail: {
      "accesibilidad": {
        requestedDetails: ["medidas_exactas", "fotos_específicas", "desniveles"],
        satisfactionWithAnswers: 0.65
      },
      "alergias": {
        requestedDetails: ["materiales_almohadas", "mascotas_previas", "productos_limpieza"],
        satisfactionWithAnswers: 0.55
      }
    }
  },
  adaptationEfforts: {
    proactiveAdaptations: [
      {
        need: "accesibilidad",
        adaptation: "rampa_portátil",
        satisfaction: 0.8,
        implementationRate: 0.3
      },
      {
        need: "alergias",
        adaptation: "ropa_cama_hipoalergénica",
        satisfaction: 0.9,
        implementationRate: 0.5
      }
    ],
    missedOpportunities: [
      "información_detallada_entorno", "servicios_adicionales_especializados",
      "alianzas_con_proveedores_accesibilidad"
    ]
  },
  satisfactionComparison: {
    "huéspedes_necesidades_especiales": 0.4,
    "promedio_general": 0.6,
    "factores_críticos": [
      "precisión_información", "esfuerzo_adaptación", 
      "comprensión_necesidad", "disponibilidad_ayuda"
    ]
  }
};
```

### 8.4 Insights Esperados

- Identificar las necesidades especiales más frecuentes y su impacto
- Descubrir brechas en la información proporcionada sobre accesibilidad y adaptaciones
- Evaluar la efectividad de diferentes adaptaciones y soluciones
- Detectar oportunidades para mejorar la experiencia de huéspedes con necesidades específicas

### 8.5 Acciones Recomendadas

- Desarrollar guías detalladas de accesibilidad para cada propiedad
- Implementar opciones de personalización pre-estancia basadas en necesidades
- Crear alianzas con proveedores de servicios especializados (equipamiento médico, etc.)
- Diseñar protocolos de preparación específicos para diferentes necesidades 