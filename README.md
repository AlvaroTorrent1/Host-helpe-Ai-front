# Simple Host Helper

## Descripción
Una aplicación para gestionar propiedades y reservas de alojamientos, optimizando la comunicación con huéspedes mediante automatizaciones.

## Nueva estructura del proyecto
El proyecto ahora sigue una estructura estándar de aplicación React/TypeScript:

### Estructura de directorios

```
src/
  ├── features/              # Organización basada en características
  │   ├── auth/              # Todo lo relacionado con autenticación
  │   │   ├── components/    # Componentes específicos de autenticación
  │   │   ├── pages/         # Páginas de login/registro
  │   ├── dashboard/         # Todo lo relacionado con el dashboard
  │   ├── properties/        # Gestión de propiedades
  │   ├── reservations/      # Gestión de reservaciones
  │   ├── ses/               # Registro de viajeros (SES)
  │   └── landing/           # Páginas públicas (landing, pricing, testimonios)
  ├── shared/                # Elementos compartidos
  │   ├── components/        # Componentes reutilizables
  │   ├── hooks/             # Hooks genéricos
  │   ├── utils/             # Utilidades generales
  │   └── contexts/          # Contextos globales
  ├── translations/          # Traducciones multilenguaje
  ├── services/              # Servicios de API y externos
  ├── types/                 # Tipos TypeScript globales
  └── assets/                # Recursos estáticos
```

### Beneficios de esta estructura

1. **Cohesión**: El código relacionado se mantiene junto, facilitando entender cómo funciona cada característica.
2. **Encapsulamiento**: Cada característica puede evolucionar de forma independiente.
3. **Escalabilidad**: Facilita agregar nuevas características sin afectar las existentes.
4. **Mantenimiento**: Es más fácil identificar y corregir problemas dentro de una característica específica.
5. **Colaboración**: Diferentes equipos pueden trabajar en diferentes características simultáneamente.

### Convenciones de naming

- Los nombres de archivos para componentes React usan PascalCase: `LoginPage.tsx`
- Los nombres de archivos para hooks, utilidades y servicios usan camelCase: `useAuth.ts`
- Los nombres de directorios usan kebab-case para facilitar la navegación en sistemas case-sensitive

## Tecnologías principales

- React
- TypeScript
- React Router
- Tailwind CSS
- Supabase (Autenticación, Base de datos)

## Cómo iniciar el proyecto

```bash
# Instalar dependencias
npm install

# Iniciar en modo desarrollo
npm run dev

# Compilar para producción
npm run build
```

## Características Principales

- **Chatbot 24/7**: Atención al cliente automatizada para huéspedes a cualquier hora del día.
- **Check-in Automatizado**: Simplifica el proceso de registro de huéspedes.
- **Upselling Inteligente**: Incrementa tus ingresos ofreciendo servicios adicionales.
- **Dashboard Centralizado**: Gestiona todas tus propiedades desde un solo lugar.
- **Gestión de Incidencias**: Sistema automatizado para resolver problemas.

## Instalación

1. Clona el repositorio
2. Instala las dependencias:
   ```
   npm install
   ```
3. Configura las variables de entorno:
   - Copia el archivo `.env.example` a un nuevo archivo llamado `.env`:
     ```
     cp .env.example .env
     ```
   - Edita el archivo `.env` y reemplaza los valores de marcador con tus credenciales reales de Supabase:
     ```
     VITE_SUPABASE_URL=tu-url-de-supabase
     VITE_SUPABASE_ANON_KEY=tu-clave-anonima-de-supabase
     ```
   - **⚠️ IMPORTANTE**: Nunca añadas el archivo `.env` al control de versiones. Contiene información sensible.
   - Para obtener tus credenciales, visita [Supabase Dashboard](https://app.supabase.io) → Proyecto → Settings → API.

4. Inicia el servidor de desarrollo:
   ```
   npm run dev
   ```

## Seguridad

- **Variables de entorno**: Siempre utiliza el archivo `.env` para tus credenciales y nunca lo añadas al control de versiones.
- **Rotación de credenciales**: Si sospechas que tus credenciales han sido expuestas, rótalas inmediatamente desde el panel de Supabase.
- **Entornos de producción**: En entornos de producción, configura las variables de entorno directamente en tu proveedor de hosting (Vercel, Netlify, etc.) en lugar de usar archivos `.env`.

## Licencia

Todos los derechos reservados © 2025 Host Helper AI.
