# Documentación Host Helper AI

## 🌐 Sistema de Traducciones (ACTUALIZADO)

**Estado:** En migración hacia react-i18next como estándar oficial

### 📖 Documentos Clave
- **[Sistema de Traducciones](development/translation-system.md)** - Estándar oficial y guía de migración
- **[Migración Sistema Traducciones](development/migracion-sistema-traducciones.md)** - Estado actual y plan completo de migración
- **[Guía de Migración](development/react-i18next-migration-guide.md)** - Pasos prácticos para migrar componentes  
- **[Troubleshooting](development/translation-troubleshooting.md)** - Solución de problemas comunes

### ⚡ Quick Start para Desarrolladores

#### Para NUEVO código (react-i18next):
```typescript
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();
  return <h1>{t('mySection.title')}</h1>;
};
```

#### Para CÓDIGO EXISTENTE:
- Si ves `useLanguage()` → migrar gradualmente a `useTranslation()`
- Si aparece `[CLAVE_NO_ENCONTRADA]` → agregar traducción a archivos JSON

### 🚨 Reglas Importantes
- ✅ **USAR:** `useTranslation()` para todo nuevo desarrollo
- ❌ **NO USAR:** `useLanguage()` para nuevo código
- 📝 **TRADUCCIONES:** Agregar a archivos JSON (`src/translations/`)

---

## 📁 Estructura de Documentación

---

## 🎨 **Diseño y UI**

### [`design/color-palette.md`](./design/color-palette.md)
- **⭐ PALETA DE COLORES OFICIAL**
- Estilo minimalista: Naranja ECA + Blanco + Plateado claro
- Variables CSS y configuración Tailwind
- Principios de diseño visual y proporciones

---

## 🏗️ **Arquitectura**

### [`architecture/overview.md`](./architecture/overview.md)
- Principios arquitectónicos del proyecto
- Patrones de diseño implementados
- Estructura de directorios y organización
- **Escalabilidad:** ⭐ 8/10 - Arquitectura feature-based preparada para crecimiento

### [`architecture/media-architecture.md`](./architecture/media-architecture.md)
- Sistema especializado de gestión de medios
- Almacenamiento distribuido y CDN
- Optimización y procesamiento automático

---

## 🛠️ **Desarrollo**

### [`development/testing.md`](./development/testing.md)
- Estrategia completa de testing
- Configuración de Vitest y Testing Library
- Tests unitarios, integración y E2E

### [`development/environments.md`](./development/environments.md)
- Configuración de entornos múltiples
- Variables de entorno por ambiente
- Scripts de desarrollo vs producción

### [`development/setup.md`](./development/setup.md)
- Instalación y configuración inicial
- Requisitos del sistema
- Primeros pasos para desarrolladores

---

## 🤖 **Integraciones**

### [`integrations/n8n-setup.md`](./integrations/n8n-setup.md)
- **⭐ NUEVA INTEGRACIÓN - Junio 2025**
- Configuración completa de n8n
- Reemplaza la anterior implementación con Botpress
- Instalación Docker, local y cloud

### [`integrations/n8n-workflows-guide.md`](./integrations/n8n-workflows-guide.md)
- **⭐ WORKFLOWS IMPLEMENTADOS**
- Property Management automatizado
- Asistente IA para huéspedes
- Gestión inteligente de reservas

### [`integrations/supabase.md`](./integrations/supabase.md)
- Configuración de base de datos
- Autenticación y autorización
- Storage y APIs

### [`integrations/stripe.md`](./integrations/stripe.md)
- Configuración de pagos
- Webhooks y eventos
- Testing en desarrollo

---

## 📡 **API**

### [`api/endpoints.md`](./api/endpoints.md)
- Documentación completa de endpoints
- Autenticación y autorización
- Ejemplos de requests/responses

### [`api/authentication.md`](./api/authentication.md)
- Sistema de autenticación Supabase
- Manejo de tokens y sessions
- Seguridad y mejores prácticas

---

## 📖 **Guías**

### [`guides/deployment.md`](./guides/deployment.md)
- Proceso de despliegue a producción
- CI/CD con GitHub Actions
- Configuración de dominios

### [`guides/production-setup.md`](./guides/production-setup.md)
- Setup específico para entorno de producción
- Configuración de variables de entorno
- Optimizaciones de rendimiento

### [`guides/troubleshooting.md`](./guides/troubleshooting.md)
- Solución de problemas comunes
- Debugging y logging
- Contacto de soporte

---

## 🚀 **Inicio Rápido**

### Para Desarrolladores
```bash
# 1. Clonar el repositorio
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

### Para Operaciones
```bash
# Configurar n8n (nuevo sistema IA)
docker run -it --rm --name n8n -p 5678:5678 n8nio/n8n

# Verificar producción
npm run verify:production

# Desplegar
npm run deploy:production
```

---

## 📋 **Cambios Recientes (Junio 2025)**

### ✅ **Implementado**
- **Migración completa de Botpress → n8n**
- **Documentación consolidada en carpeta única**
- **Eliminación de documentación obsoleta**
- **Corrección de vulnerabilidades de seguridad**
- **Nueva estructura de workflows IA**

### 🔄 **En Progreso**
- Implementación de lazy loading
- Sistema de feature flags
- Optimización de bundle size

### 📅 **Planificado**
- Micro-frontends preparación
- Monitoreo avanzado
- Analytics mejorado

---

## 🛠️ **Stack Tecnológico**

### **Frontend**
- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** para estilos
- **React Router** para navegación
- **React Query** para estado servidor

### **Backend**
- **Supabase** (PostgreSQL + APIs + Auth + Storage)
- **n8n** para automatización y IA *(Nuevo - Junio 2025)*
- **Stripe** para pagos

### **DevOps**
- **GitHub Actions** para CI/CD
- **Docker** para contenedores
- **Vercel/Netlify** para despliegue

---

## 🔧 **Comandos Útiles**

```bash
# Desarrollo
npm run dev              # Servidor desarrollo
npm run dev:prod         # Servidor con config producción
npm run build            # Build para producción

# Testing
npm run test             # Tests unitarios
npm run test:watch       # Tests en modo watch
npm run lint             # Linting código

# Calidad
npm run fix:all          # Fix automático
npm run format           # Formatear código
npm audit fix            # Corregir vulnerabilidades
```

---

## 📞 **Soporte**

### **Para Desarrolladores**
- **Issues:** [GitHub Issues](https://github.com/AlvaroTorrent1/Host-helpe-Ai-front/issues)
- **Documentación:** Esta misma documentación
- **Testing:** Revisar `development/testing.md`

### **Para n8n/IA**
- **Setup:** `integrations/n8n-setup.md`
- **Workflows:** `integrations/n8n-workflows-guide.md`
- **Documentación oficial:** [n8n.io/docs](https://docs.n8n.io/)

### **Para Producción**
- **Deployment:** `guides/deployment.md`
- **Troubleshooting:** `guides/troubleshooting.md`
- **Monitoring:** Dashboard de n8n + Supabase

---

## 📊 **Métricas del Proyecto**

```bash
# Estado actual (Junio 2025)
✅ Vulnerabilidades: 0 (corregidas)
✅ Tests: Configurados y funcionando
✅ Documentación: Consolidada y actualizada
✅ IA/Automatización: n8n implementado
✅ Escalabilidad: 8/10 (excelente arquitectura)
```

---

**🎯 Esta documentación es la fuente única de verdad para Host Helper AI.** 

Mantén siempre actualizada esta documentación cuando hagas cambios en el proyecto. 