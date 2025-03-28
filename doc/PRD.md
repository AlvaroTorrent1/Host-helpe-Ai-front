# PRD: Sistema de Gestión de Alojamientos Turísticos con Asistencia IA

## Resumen Ejecutivo

Este documento detalla el desarrollo de una plataforma web inspirada en Host Helper AI, diseñada para propietarios y gestores de viviendas turísticas en España. El sistema ofrece una solución integral para la gestión de reservas, automatización del registro de viajeros (SES), resolución de incidencias mediante chatbots y generación de ingresos adicionales a través de venta cruzada. El enfoque de desarrollo será incremental, comenzando con un MVP centrado en la gestión de reservas y ampliando posteriormente con funcionalidades avanzadas.

## Objetivos del Producto

1. Automatizar el registro de viajeros según la normativa española (SES)
2. Proporcionar un sistema de chatbots para atención al cliente 24/7
3. Permitir la venta cruzada de servicios con un modelo de comisiones
4. Ofrecer un dashboard intuitivo para gestores de propiedades
5. Facilitar la gestión documental necesaria para entrenar los chatbots

## Usuarios Objetivo

- **Usuarios primarios**: Propietarios individuales y gestores de viviendas turísticas en España
- **Usuarios secundarios**: Administradores de la plataforma (para gestión de contenidos y entrenamiento de IA)

## Modelos de Negocio

- **SaaS B2B** con varios niveles de suscripción:
  - Plan Básico: 1 propiedad
  - Plan Pro: hasta 5 propiedades
  - Plan Enterprise: personalizable (precio a acordar)
- **Comisiones** por venta cruzada de servicios turísticos

## Stack Tecnológico

- **Frontend**: React con Tailwind CSS
- **Backend**: Supabase (incluye base de datos PostgreSQL)
- **Autenticación**: Sistema nativo de Supabase
- **Pagos**: Integración con Stripe
- **Analytics**: Google Analytics
- **Integración con chatbots**: Botpress
- **Integración con SES**: API del Ministerio del Interior

## Entorno de Desarrollo y Operaciones

- **Sistema Operativo**: Windows (usando PowerShell para scripts y tareas)
- **Control de Versiones**: Git con GitHub
- **CI/CD**: GitHub Actions
- **Gestión de Dependencias**: npm/yarn
- **Automatización**: Scripts PowerShell estandarizados

## Funcionalidades del MVP (Fase 1)

### 1. Sistema de Autenticación y Perfiles

- Registro mediante email o perfil de Google
- Login seguro
- Gestión de perfil de usuario
- Selección de idioma (español/inglés)

### 2. Dashboard Principal

- Visión general de propiedades
- Resumen de métricas principales: reservas activas, incidencias, comisiones mensuales
- Acceso rápido a funciones principales

### 3. Gestión de Propiedades

- Creación y edición de propiedades
- Subida de documentación (house rules, inventarios, PDFs informativos, fotos)
- Estado de cada propiedad

### 4. Gestión de Reservas

- Listado de reservas con filtrado por fecha, propiedad y estado
- Creación manual de nuevas reservas
- Campos requeridos:
  - Datos del huésped principal (nombre, apellidos, email, teléfono)
  - DNI/Pasaporte
  - Fecha de nacimiento
  - Nacionalidad
  - Fecha de entrada y salida
  - Número de huéspedes
  - Información de pago (si aplica)
- Integración con SES para envío de datos

### 5. Sistema de Comisiones

- Visualización de comisiones generadas
- Listado de servicios vendidos con fecha y monto

### 6. Panel de Incidencias

- Resumen de incidencias resueltas por los chatbots
- Clasificación por categorías generales:
  - Check-in/Check-out
  - Problemas con la propiedad
  - Información turística
  - Emergencias
  - Otros

### 7. Panel de Administración

- Acceso exclusivo para administradores
- Visualización de documentos subidos por usuarios
- Gestión de mensajes de contacto
- Área para entrenamiento de chatbots

## Funcionalidades Post-MVP (Fases Futuras)

### Fase 2: Mejoras en Integración y Experiencia

- Transcripciones completas de conversaciones de chatbots
- Sistema de prueba de chatbots para propietarios
- Integración con plataformas de reserva (Airbnb, Booking)
- Dashboard mejorado con visualizaciones avanzadas

### Fase 3: Expansión y Escalabilidad

- Aplicación móvil para gestores
- Sistema de notificaciones en tiempo real
- Expansión a EE.UU. (adaptación a normativas locales)
- Posibilidad de que propietarios añadan sus propios servicios

## Flujos de Usuario

### Registro y Onboarding

1. El propietario se registra con email o Google
2. Completa su perfil con datos de contacto
3. Añade su primera propiedad
4. Sube documentación relevante para entrenar al chatbot
5. Mensaje de confirmación indicando que el equipo procesará la información en 48h

### Gestión de Reservas

1. Propietario recibe nueva reserva desde plataforma externa (Airbnb, Booking)
2. El chatbot actúa como punto de contacto y envía enlace para registro SES
3. Huésped completa sus datos a través del enlace
4. Sistema verifica datos y los envía al SES
5. Propietario visualiza estado del registro en su dashboard

### Creación Manual de Reserva

1. Propietario accede a sección de reservas en dashboard
2. Selecciona "Nueva reserva manual"
3. Completa todos los datos requeridos
4. Sistema envía directamente al SES
5. Se actualiza estado en dashboard

### Venta Cruzada

1. Chatbot ofrece servicios adicionales a huéspedes (traslados, tours, etc.)
2. Sistema genera enlaces UTM personalizados
3. Cada conversión se registra en el sistema
4. Las comisiones se calculan y muestran en el dashboard
5. Los pagos se procesan a través de Stripe

## Requisitos Técnicos Detallados

### Base de Datos

**Tablas principales:**
- Usuarios (propietarios)
- Propiedades
- Reservas
- Incidencias
- Comisiones
- Documentos

### API e Integraciones

- Integración con Supabase para autenticación y base de datos
- API de SES del Ministerio del Interior para registro de viajeros
- API de Botpress para gestión de chatbots
- API de Stripe para pagos
- Google Analytics para seguimiento de métricas

### Seguridad y Cumplimiento

- Implementación de medidas RGPD:
  - Política de privacidad clara
  - Consentimiento explícito para recopilación de datos
  - Capacidad de exportar/eliminar datos personales
- Cifrado de datos sensibles
- Autenticación segura

### Accesibilidad y Usabilidad

- **Conformidad WCAG 2.1 Nivel AA**:
  - Todos los elementos interactivos navegables por teclado
  - Suficiente contraste de color para texto e imágenes
  - Alternativas textuales para contenido no textual
  - Estructuras semánticas adecuadas (headings, landmarks)
- **Gestión del Foco**:
  - Control de foco en modales y diálogos
  - Indicadores visuales de foco consistentes
- **Compatibilidad con Lectores de Pantalla**:
  - Textos alternativos para imágenes
  - Etiquetas adecuadas para formularios
  - Mensajes de error accesibles
- **Diseño Responsive**:
  - Funcionamiento en múltiples tamaños de pantalla y dispositivos
  - Soporte para zoom hasta 200%

### Manejo de Errores y Validación

- **Prevención de Errores**:
  - Validación en tiempo real de formularios
  - Instrucciones claras antes de las acciones
  - Confirmación para acciones destructivas
- **Manejo Silencioso de Errores**:
  - Errores no críticos no interrumpen el flujo del usuario
  - Procesamiento continuo en operaciones por lotes (ej. subida de múltiples documentos)
- **Feedback de Errores**:
  - Mensajes de error claros y accionables
  - Sin exposición de detalles técnicos al usuario
  - Indicación visual y textual de campos con error
- **Recuperación**:
  - Guardado automático de datos en formularios extensos
  - Mecanismos de reintento para operaciones fallidas
  - Preservación del contexto cuando ocurre un error

## Métricas de Éxito del MVP

1. Capacidad para gestionar hasta 1000 usuarios con múltiples propiedades
2. Tiempo de procesamiento de registros SES < 2 minutos
3. Usabilidad del dashboard (feedback de usuarios)
4. Tasa de conversión de venta cruzada > 5%
5. Tasa de éxito en resolución de incidencias por chatbot > 80%

## Plan de Implementación

### Fase 1: MVP (8-10 semanas)

**Semanas 1-2:**
- Configuración del entorno técnico
- Diseño de base de datos
- Maquetación básica de UI

**Semanas 3-4:**
- Implementación de autenticación
- Desarrollo de gestión de perfiles y propiedades
- Configuración básica de Supabase

**Semanas 5-6:**
- Desarrollo del sistema de reservas
- Integración con SES
- Panel de incidencias básico

**Semanas 7-8:**
- Sistema de comisiones
- Panel de administración
- Pruebas de integración

**Semanas 9-10:**
- Pruebas de usuario
- Correcciones y optimizaciones
- Lanzamiento de MVP

### Fase 2 y 3: Post-MVP (a determinar según feedback)

## Consideraciones Adicionales

- **Escalabilidad**: La arquitectura debe soportar crecimiento hasta millones de propiedades
- **Internacionalización**: Preparar para expansión a EE.UU.
- **Mantenimiento**: Plan para actualizaciones regulares y soporte técnico

## Apéndices

### Apéndice A: Wireframes y Mockups (a desarrollar)

### Apéndice B: Requisitos detallados del SES
- Datos obligatorios según normativa española
- Formato de comunicación con la API
- Gestión de errores y rechazos

### Apéndice C: Modelos de Precios
- Desglose de planes y funcionalidades por nivel
- Estructura de comisiones por venta cruzada

---

Este PRD establece la base para el desarrollo del sistema, con un enfoque claro en las necesidades de los gestores de propiedades turísticas en España. La implementación por fases permite un desarrollo ágil y adaptable al feedback de usuarios reales.
