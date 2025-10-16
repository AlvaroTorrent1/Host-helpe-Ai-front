# Documentación Host Helper AI

> **Documentación consolidada y actualizada - Octubre 2025**

Esta documentación representa el estado actual y operativo del proyecto.

---

## 📋 Índice Rápido

- [🏗️ Arquitectura](#-arquitectura)
- [🎨 Diseño](#-diseño)
- [🛠️ Desarrollo](#-desarrollo)
- [🤖 Integraciones](#-integraciones)
- [📡 API](#-api)
- [📖 Guías Operativas](#-guías-operativas)
- [⚡ Guías Rápidas](#-guías-rápidas)

---

## 🏗️ Arquitectura

### [`architecture/overview.md`](./architecture/overview.md)
- Principios arquitectónicos del proyecto
- Patrones de diseño implementados
- Estructura de directorios feature-based
- **Escalabilidad:** 8/10 - Preparada para crecimiento

### [`architecture/media-architecture.md`](./architecture/media-architecture.md)
- Sistema especializado de gestión de medios
- Almacenamiento en Supabase Storage
- Procesamiento automático de imágenes
- CDN y optimización

---

## 🎨 Diseño

### [`design/color-palette.md`](./design/color-palette.md)
- **⭐ PALETA DE COLORES OFICIAL**
- Estilo minimalista: Naranja ECA + Blanco + Plateado claro
- Variables CSS y configuración Tailwind
- Principios de diseño visual

### [`design/hero-redesign.md`](./design/hero-redesign.md)
- Especificaciones de diseño del hero principal
- Layout y componentes visuales

---

## 🛠️ Desarrollo

### [`development/translation-system.md`](./development/translation-system.md)
- **⭐ SISTEMA OFICIAL DE TRADUCCIONES**
- react-i18next como estándar
- Estructura de archivos JSON
- Guía de uso para desarrolladores

### [`development/testing.md`](./development/testing.md)
- Estrategia de testing con Vitest
- Tests unitarios e integración
- Configuración y buenas prácticas

### [`development/environments.md`](./development/environments.md)
- Configuración de entornos (dev/prod)
- Variables de entorno requeridas
- Scripts de desarrollo y build

---

## 🤖 Integraciones

### Automatización con n8n

#### [`integrations/n8n-setup.md`](./integrations/n8n-setup.md)
- **⭐ SETUP COMPLETO DE N8N**
- Instalación local y Docker
- Configuración de credenciales
- Integración con Supabase

#### [`integrations/n8n-workflows-guide.md`](./integrations/n8n-workflows-guide.md)
- **WORKFLOWS IMPLEMENTADOS**
- Property Management automatizado
- Asistente IA para huéspedes
- Gestión de reservas

#### Documentación Técnica N8N
- [`n8n-webhook-implementation.md`](./integrations/n8n-webhook-implementation.md) - Webhooks
- [`n8n-webhook-environment-config.md`](./integrations/n8n-webhook-environment-config.md) - Config entornos
- [`n8n-vectorstore-supabase-config.md`](./integrations/n8n-vectorstore-supabase-config.md) - Vector store
- [`n8n-vectorstore-property-mapping.md`](./integrations/n8n-vectorstore-property-mapping.md) - Mapeo de propiedades
- [`n8n-property-processing-code.js`](./integrations/n8n-property-processing-code.js) - Código de procesamiento

### Otras Integraciones

#### [`integrations/document-vectorization-guide.md`](./integrations/document-vectorization-guide.md)
- Vectorización de documentos para IA
- Integración con bases de datos vectoriales

#### [`integrations/elevenlabs-integration.md`](./integrations/elevenlabs-integration.md)
- Text-to-speech con ElevenLabs
- Configuración y uso

#### [`integrations/ical-system-activated.md`](./integrations/ical-system-activated.md)
- Sistema iCal para sincronización de calendarios
- Configuración activa

#### Meta/Facebook
- [`facebook-data-deletion-deployment.md`](./integrations/facebook-data-deletion-deployment.md)
- [`meta-data-deletion-complete-implementation.md`](./integrations/meta-data-deletion-complete-implementation.md)

---

## 📡 API

### [`api/endpoints.md`](./api/endpoints.md)
- Documentación completa de endpoints
- Autenticación con Supabase Auth
- Request/Response examples
- Rate limiting y seguridad

---

## 📖 Guías Operativas

### [`guides/deployment.md`](./guides/deployment.md)
- **Proceso de despliegue a producción**
- Build y optimización
- Configuración de dominio

### [`guides/production-setup.md`](./guides/production-setup.md)
- Setup específico de producción
- Variables de entorno críticas
- Optimizaciones de rendimiento

### [`guides/environment-variables-setup.md`](./guides/environment-variables-setup.md)
- Guía completa de variables de entorno
- Configuración por servicio

### [`guides/stripe-production-setup.md`](./guides/stripe-production-setup.md)
- Configuración de Stripe para producción
- Webhooks y testing

### [`guides/calendly-localization.md`](./guides/calendly-localization.md)
- Integración de Calendly
- Localización y configuración

### [`guides/troubleshooting.md`](./guides/troubleshooting.md)
- **Solución de problemas comunes**
- Debugging y logs
- Contacto de soporte

---

## ⚡ Guías Rápidas

### UI/Components
- [`Button-usage.md`](./quick-guides/Button-usage.md) - Uso del componente Button

### Deployment & Testing
- [`deploy-webhook.md`](./quick-guides/deploy-webhook.md) - Despliegue de webhooks
- [`DEPLOYMENT-STATUS.md`](./quick-guides/DEPLOYMENT-STATUS.md) - Estado de deployments
- [`TESTING-PRODUCTION-MODE.md`](./quick-guides/TESTING-PRODUCTION-MODE.md) - Testing en modo producción

### Workflows
- [`property-creation-flow.md`](./quick-guides/property-creation-flow.md) - Flujo de creación de propiedades

### Stripe
- [`QUICK-STRIPE-SETUP.md`](./quick-guides/QUICK-STRIPE-SETUP.md) - Setup rápido de Stripe

---

## 🚀 Inicio Rápido

### Para Desarrolladores

```bash
# 1. Clonar repositorio
git clone https://github.com/AlvaroTorrent1/Host-helpe-Ai-front.git
cd Host-helpe-Ai-front

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Iniciar desarrollo
npm run dev
```

### Desarrollo con n8n

```bash
# Iniciar n8n local
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n

# O instalar globalmente
npm install n8n -g
n8n start
```

---

## 🛠️ Stack Tecnológico

### Frontend
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **react-i18next** para traducciones

### Backend
- **Supabase** (PostgreSQL + Auth + Storage + APIs)
- **n8n** para automatización y workflows IA
- **Stripe** para pagos

### DevOps
- **GitHub** para control de versiones
- **GitHub Pages** / **Vercel** para hosting
- **Docker** para n8n

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
npm run dev              # Servidor desarrollo
npm run dev:prod         # Con config producción
npm run build            # Build para producción

# Testing
npm test                 # Tests unitarios
npm run test:watch       # Tests en modo watch
npm run lint             # Linting código

# Calidad
npm run format           # Formatear código
```

---

## 📊 Estado del Proyecto (Octubre 2025)

```bash
✅ Tests: Configurados y funcionando
✅ Documentación: Consolidada y limpia
✅ IA/Automatización: n8n implementado
✅ Traducciones: react-i18next activo
✅ Arquitectura: Feature-based escalable
```

---

## 📞 Soporte y Referencias

### Desarrollo
- **Issues:** [GitHub Issues](https://github.com/AlvaroTorrent1/Host-helpe-Ai-front/issues)
- **Testing:** Ver `development/testing.md`
- **Traducciones:** Ver `development/translation-system.md`

### Integraciones
- **n8n Setup:** Ver `integrations/n8n-setup.md`
- **n8n Workflows:** Ver `integrations/n8n-workflows-guide.md`
- **Docs n8n:** [n8n.io/docs](https://docs.n8n.io/)

### Producción
- **Deployment:** Ver `guides/deployment.md`
- **Troubleshooting:** Ver `guides/troubleshooting.md`
- **Environment Setup:** Ver `guides/environment-variables-setup.md`

---

## 🎯 Frontend Integration

Para integraciones frontend específicas, consulta:
- [`frontend-integration-guide.md`](./frontend-integration-guide.md)

---

**Esta documentación es la fuente única de verdad para Host Helper AI.**

Última actualización: Octubre 16, 2025
