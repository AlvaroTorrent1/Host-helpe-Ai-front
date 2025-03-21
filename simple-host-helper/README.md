# Host Helper AI Frontend

## Estructura del Proyecto

El proyecto sigue una arquitectura basada en características (Feature-Based Architecture) que organiza el código según la funcionalidad en lugar de por tipo de archivo. Esto facilita la navegación, escalabilidad y mantenimiento del código.

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
