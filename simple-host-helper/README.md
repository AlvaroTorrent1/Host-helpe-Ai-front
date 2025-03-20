# Host Helper AI - Gestión Inteligente de Alojamientos

Plataforma web para la automatización y gestión de alojamientos turísticos mediante inteligencia artificial.

## Características Principales

- **Chatbot 24/7**: Atención al cliente automatizada para huéspedes a cualquier hora del día.
- **Check-in Automatizado**: Simplifica el proceso de registro de huéspedes.
- **Upselling Inteligente**: Incrementa tus ingresos ofreciendo servicios adicionales.
- **Dashboard Centralizado**: Gestiona todas tus propiedades desde un solo lugar.
- **Gestión de Incidencias**: Sistema automatizado para resolver problemas.

## Tecnologías

- **Frontend**: React, TypeScript, Tailwind CSS
- **Backend**: Supabase (BaaS)
- **Autenticación**: Supabase Auth
- **Base de Datos**: PostgreSQL (Supabase)

## Estructura del Proyecto

```
/src
  /assets - Recursos estáticos
  /components - Componentes React reutilizables
    /auth - Componentes de autenticación
    /dashboard - Componentes del dashboard
    /properties - Gestión de propiedades
    /bookings - Gestión de reservas
    /common - Componentes comunes (Header, Footer)
  /contexts - Contextos de React
  /hooks - Custom hooks
  /pages - Páginas principales
  /services - Servicios para APIs
  /types - Tipos TypeScript
  /utils - Funciones de utilidad
```

## Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```
   npm install
   ```
3. Crea un archivo `.env` con las variables necesarias:
   ```
   VITE_SUPABASE_URL=tu-url-de-supabase
   VITE_SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
   ```
4. Inicia el servidor de desarrollo:
   ```
   npm run dev
   ```

## Licencia

Todos los derechos reservados © 2025 Host Helper AI.
