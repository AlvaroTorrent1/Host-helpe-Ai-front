# Arquitectura de Host Helper AI

## Visión General

Host Helper AI utiliza una arquitectura basada en características (Feature-Based Architecture) para organizar el código. Este documento describe los principios arquitectónicos, patrones y convenciones utilizados en el proyecto.

## Estructura de Directorios

```
src/
  ├── features/              # Organización basada en características
  │   ├── auth/              # Todo lo relacionado con autenticación
  │   │   ├── components/    # Componentes específicos de autenticación
  │   │   ├── pages/         # Páginas de login/registro
  │   │   └── hooks/         # Hooks específicos de autenticación
  │   ├── dashboard/         # Todo lo relacionado con el dashboard
  │   ├── properties/        # Gestión de propiedades
  │   ├── reservations/      # Gestión de reservaciones
  │   ├── ses/               # Registro de viajeros (SES)
  │   └── landing/           # Páginas públicas
  ├── shared/                # Elementos compartidos
  │   ├── components/        # Componentes reutilizables
  │   ├── hooks/             # Hooks genéricos
  │   ├── contexts/          # Contextos globales
  ├── translations/          # Traducciones multilenguaje
  ├── services/              # Servicios de API y externos
  │   ├── supabase.ts        # Cliente y funciones de Supabase
  │   └── mediaService.ts    # Servicio de gestión de medios
  ├── config/                # Configuración global
  │   ├── constants.ts       # Constantes globales
  │   ├── environment.ts     # Acceso a variables de entorno
  │   ├── routes.ts          # Definición centralizada de rutas
  │   └── theme.ts           # Configuración del tema
  ├── types/                 # Tipos TypeScript globales
  ├── utils/                 # Utilidades generales
  │   ├── dateUtils.ts       # Utilidades para fechas
  │   ├── formatting.ts      # Formateo de valores
  │   └── validation.ts      # Funciones de validación
  ├── tests/                 # Tests globales y configuración
  │   ├── setup.ts           # Configuración global para tests
  │   ├── helpers/           # Utilidades para testing
  │   ├── integration/       # Tests de integración
  │   └── unit/              # Tests unitarios específicos
  └── assets/                # Recursos estáticos
```

## Principios Arquitectónicos

### 1. Organización basada en características

El código se organiza por funcionalidad (feature) y no por tipo de archivo. Cada característica contiene todos los archivos necesarios para implementar esa funcionalidad específica, incluyendo componentes, hooks, utilidades y tests relacionados.

### 2. División clara entre elementos compartidos y específicos

- **Features**: Contiene código específico para una característica particular
- **Shared**: Contiene código reutilizable en múltiples características

### 3. Responsabilidad única

Cada componente, hook, o utilidad debe tener una única responsabilidad bien definida.

### 4. Modularidad

Las características deben ser tan independientes como sea posible, para permitir:
- Desarrollo paralelo por diferentes equipos
- Sustitución o refactorización de una característica sin afectar a otras
- Testing aislado de cada característica

### 5. Límite de tamaño para componentes

Para mantener la legibilidad y facilitar el mantenimiento:
- Archivos de componentes: Máximo 200 líneas
- Funciones individuales: Máximo 50 líneas
- Componentes complejos: Dividir en subcomponentes

## Patrones de Diseño

### Patrón de Contexto para Estado Global

Utilizamos React Context API para gestionar el estado global de la aplicación:
- **AuthContext**: Estado de autenticación y usuario
- **LanguageContext**: Configuración de idioma y traducciones

### Patrón de Repositorio

Para acceder a los datos, usamos un patrón de repositorio que abstrae las operaciones CRUD:
```typescript
// Ejemplo: services/propertyService.ts
export const propertyService = {
  getAll: async () => { /* ... */ },
  getById: async (id: string) => { /* ... */ },
  create: async (data: PropertyInput) => { /* ... */ },
  // ...
};
```

### Componentes Presentacionales y Contenedores

Distinguimos entre:
- **Componentes Presentacionales**: Se enfocan en la UI, reciben props y renderizan el contenido
- **Componentes Contenedores**: Manejan lógica y estado, y pasan datos a componentes presentacionales

## Estructura de Componentes Compartidos

Los componentes compartidos deben diseñarse con los siguientes principios:

### 1. Interfaces TypeScript Explícitas

```typescript
interface ButtonProps {
  text: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  text,
  onClick,
  variant = 'primary',
  disabled = false,
  size = 'md'
}) => {
  // ...
};
```

### 2. Estilos Consistentes con Tailwind

```tsx
// Uso de variantes con clases condicionales
const buttonClasses = {
  base: "px-4 py-2 rounded-md font-medium transition-colors",
  variant: {
    primary: "bg-primary-500 hover:bg-primary-600 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    outline: "border border-primary-500 text-primary-500 hover:bg-primary-50"
  },
  size: {
    sm: "text-sm px-3 py-1",
    md: "text-base px-4 py-2",
    lg: "text-lg px-6 py-3"
  },
  state: {
    disabled: "opacity-50 cursor-not-allowed"
  }
};

<button 
  className={`
    ${buttonClasses.base} 
    ${buttonClasses.variant[variant]} 
    ${buttonClasses.size[size]}
    ${disabled ? buttonClasses.state.disabled : ''}
  `}
  onClick={onClick}
  disabled={disabled}
>
  {text}
</button>
```

### 3. Composición y Componentes Compuestos

Para componentes complejos, utiliza patrones de composición:

```typescript
// Ejemplo de patrón de composición
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> & {
  Header: React.FC<{children: React.ReactNode}>;
  Body: React.FC<{children: React.ReactNode}>;
  Footer: React.FC<{children: React.ReactNode}>;
} = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  );
};

Card.Header = ({ children }) => {
  return <div className="p-4 border-b">{children}</div>;
};

Card.Body = ({ children }) => {
  return <div className="p-4">{children}</div>;
};

Card.Footer = ({ children }) => {
  return <div className="p-4 border-t bg-gray-50">{children}</div>;
};

// Uso:
<Card>
  <Card.Header>Título</Card.Header>
  <Card.Body>Contenido</Card.Body>
  <Card.Footer>Pie</Card.Footer>
</Card>
```

## Arquitectura de Medios Escalable

Hemos implementado una arquitectura especializada para la gestión escalable de medios (imágenes y videos):

### 1. Almacenamiento Distribuido
- **Metadatos**: Almacenados en PostgreSQL (tabla `media`)
- **Archivos Binarios**: Almacenados en Supabase Storage
- **Entrega**: Servidos a través de CDN global para baja latencia

### 2. Características Principales
- Carga asíncrona de archivos mediante drag & drop
- Procesamiento de medios optimizado para múltiples dispositivos
- Gestión eficiente de colecciones grandes mediante paginación
- Generación automática de thumbnails para videos
- Optimización de imágenes bajo demanda

### 3. Componentes
- **mediaService.ts**: Servicio centralizado para operaciones CRUD de medios
- **MediaGallery.tsx**: Componente para visualización y gestión de galerías
- **Tabla media**: Almacena metadatos y relaciones con propiedades
- **Bucket property-media**: Almacena archivos físicos organizados por propiedad

Para más detalles, consulte [MEDIA_ARCHITECTURE.md](./MEDIA_ARCHITECTURE.md).

## Convenciones de Nomenclatura

- **Archivos de componentes**: `PascalCase.tsx` (ej. `LoginPage.tsx`)
- **Archivos de hooks**: `useNombreDelHook.ts` (ej. `useAuth.ts`)
- **Archivos de utilidades**: `camelCase.ts` (ej. `dateUtils.ts`)
- **Archivos de contextos**: `NombreContext.tsx` (ej. `AuthContext.tsx`)
- **Archivos de tests**: `[nombre].test.tsx` (ej. `LoginPage.test.tsx`)
- **Archivos de servicios**: `nombreService.ts` (ej. `propertyService.ts`)

## Flujo de Datos

El flujo de datos en la aplicación sigue estos principios:
1. **Unidireccional**: Los datos fluyen de padres a hijos mediante props
2. **Estado centralizado**: El estado global se gestiona mediante contextos
3. **Estado local**: Cuando el estado solo es relevante para un componente, se mantiene localmente

## Estrategia de Testing

La organización por características facilita las pruebas, ya que cada característica puede ser probada de manera aislada:

- **Tests unitarios**: Para funciones, hooks y componentes aislados
- **Tests de integración**: Para características completas
- **Tests end-to-end**: Para flujos de usuario completos

Para detalles sobre la configuración de tests, consulte [TEST_SETUP.md](./TEST_SETUP.md).
Para la estrategia completa de testing, consulte [TESTING.md](./TESTING.md).

## Oportunidades de Mejora

### 1. Lazy Loading de Características

Implementar carga perezosa de módulos para mejorar el rendimiento inicial:

```typescript
// Ejemplo de implementación futura de lazy loading
const DashboardPage = React.lazy(() => import('./features/dashboard/DashboardPage'));
const PropertyManagementPage = React.lazy(() => import('./features/properties/PropertyManagementPage'));

// En el router
<Route 
  path="/dashboard" 
  element={
    <Suspense fallback={<LoadingScreen />}>
      <DashboardPage />
    </Suspense>
  } 
/>
```

### 2. Feature Flags

Implementar un sistema de feature flags para habilitar/deshabilitar características:

```typescript
// Ejemplo de implementación futura de feature flags
const featureFlags = {
  newDashboardUI: process.env.VITE_ENABLE_NEW_DASHBOARD === 'true',
  advancedFiltering: process.env.VITE_ENABLE_ADVANCED_FILTERING === 'true',
  chatbotIntegration: process.env.VITE_ENABLE_CHATBOT === 'true',
};

// Uso
{featureFlags.newDashboardUI ? (
  <NewDashboardUI />
) : (
  <LegacyDashboardUI />
)}
```

### 3. Componentes Encabezados Compartidos

Convertir los encabezados repetidos en componentes compartidos:

```typescript
// Implementación recomendada para LandingHeader compartido
// shared/components/LandingHeader.tsx
interface LandingHeaderProps {
  navLinks: Array<{
    text: string;
    href: string;
    isButton?: boolean;
  }>;
}

export const LandingHeader: React.FC<LandingHeaderProps> = ({ navLinks }) => {
  // Implementación de header que se repite en múltiples páginas
  return (
    <header className="bg-white shadow-sm w-full">
      {/* ... código del header ... */}
    </header>
  );
};
```

### 4. Micro-frontends

A medida que la aplicación crezca, considerar la migración a una arquitectura de micro-frontends:

- Cada característica principal como una aplicación independiente
- Carga independiente de cada micro-frontend
- Gestión de estado aislada por micro-frontend
- Comunicación entre micro-frontends a través de eventos o API común

## Error Handling Patterns

Seguimos estos principios para el manejo de errores:

1. **Recuperación Silenciosa**: Utilizamos bloques catch que no propagan errores hacia arriba en componentes de cara al usuario cuando el error no impide que el usuario continúe.
2. **Feedback Informativo**: Cuando ocurren errores, proporcionamos información significativa a los usuarios sin exponer detalles técnicos.
3. **Sin Console Logs**: El código en producción no debe contener sentencias console.log. Se debe usar un sistema de logging estructurado.
4. **Manejo Tipado de Errores**: Utilizamos TypeScript para manejar errores de manera segura en cuanto a tipos.

### Ejemplo de Manejo Silencioso de Errores:
```typescript
try {
  await someAsyncOperation();
} catch (error) {
  // Manejo silencioso del error, permitiendo que el proceso continúe
  // Usar cuando el fallo de esta operación no debería bloquear la experiencia del usuario
  if (process.env.NODE_ENV === 'development') {
    console.error('Error no crítico:', error);
  }
}
```

## Logging Strategy

1. **Desarrollo vs Producción**: Utilizamos diferentes enfoques de logging para desarrollo y producción.
2. **Qué Loguear**: Registramos eventos significativos, no operaciones rutinarias.
3. **Logging Estructurado**: Usamos un formato consistente para logs que permita análisis y parsing.
4. **Datos Sensibles**: Nunca se deben registrar datos sensibles de usuarios o detalles de autenticación.

### Implementación Recomendada:
```typescript
// utils/logger.ts
export const logger = {
  info: (message: string, data?: Record<string, unknown>) => {
    if (import.meta.env.VITE_DEBUG_MODE === 'true') {
      console.info(`[INFO] ${message}`, data);
    }
  },
  error: (message: string, error: unknown) => {
    console.error(`[ERROR] ${message}`, error);
    // Aquí podría añadirse integración con servicios de monitoreo
  },
  warn: (message: string, data?: Record<string, unknown>) => {
    console.warn(`[WARN] ${message}`, data);
  }
};
```

## Code Quality Standards

1. **Linting**: Todo el código debe pasar las reglas de ESLint sin warnings o errores.
2. **Rigurosidad TypeScript**: Usamos verificación estricta de tipos, evitando el tipo 'any' cuando sea posible.
3. **Tamaño de Archivos**: Mantenemos los archivos por debajo de 200 líneas para mantener la legibilidad.
4. **Tamaño de Componentes**: Seguimos el Principio de Responsabilidad Única para los componentes.
5. **Testing**: Implementamos pruebas unitarias para la lógica de negocio crítica.

## Accessibility Guidelines

1. **Navegación por Teclado**: Todos los elementos interactivos deben ser accesibles mediante teclado.
2. **Atributos ARIA**: Usamos roles y atributos ARIA apropiados.
3. **Contraste de Color**: Aseguramos que el texto tenga suficiente contraste con el fondo.
4. **Gestión de Foco**: Implementamos el manejo adecuado del foco en modales y diálogos.
5. **Pruebas con Lectores de Pantalla**: Probamos todos los componentes con lectores de pantalla.

### Implementación Recomendada:
```tsx
// Ejemplo de botón accesible
<button
  aria-label={ariaLabel || text}
  className={buttonClasses}
  disabled={disabled}
  onClick={onClick}
  ref={ref}
  tabIndex={tabIndex || 0}
>
  {text}
  {icon && <span className="sr-only">{iconDescription}</span>}
</button>
```

## Evolución Futura

A medida que la aplicación crezca, estamos preparados para expandir la arquitectura:

1. **Microservicios especializados**: Migrar funcionalidades específicas a microservicios independientes
2. **Orquestación con Kubernetes**: Desplegar servicios en contenedores para escalado horizontal
3. **Procesamiento asíncrono**: Implementar colas de trabajo para tareas intensivas como procesamiento de video
4. **API Gateway**: Centralizar la gestión de API para distintos microservicios
5. **Monitorización avanzada**: Implementar sistemas comprensivos de logging y alertas 