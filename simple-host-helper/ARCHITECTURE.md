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
  │   ├── utils/             # Utilidades generales
  │   └── contexts/          # Contextos globales
  ├── translations/          # Traducciones multilenguaje
  ├── services/              # Servicios de API y externos
  │   ├── supabase.ts        # Cliente y funciones de Supabase
  │   └── mediaService.ts    # Servicio de gestión de medios
  ├── types/                 # Tipos TypeScript globales
  └── assets/                # Recursos estáticos
```

## Principios Arquitectónicos

### 1. Organización basada en características

El código se organiza por funcionalidad (feature) y no por tipo de archivo. Cada característica contiene todos los archivos necesarios para implementar esa funcionalidad específica, incluyendo componentes, hooks, utilidades y hasta tests relacionados.

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

## Patrones de Diseño

### Patrón de Contexto para Estado Global

Utilizamos React Context API para gestionar el estado global de la aplicación:
- **AuthContext**: Estado de autenticación y usuario
- **LanguageContext**: Configuración de idioma y traducciones

### Patrón de Repositorio

Para acceder a los datos, usamos un patrón de repositorio que abstrae las operaciones CRUD:
```typescript
// Ejemplo: features/properties/api/propertyRepository.ts
export const propertyRepository = {
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

Para más detalles, consulte [docs/MEDIA_ARCHITECTURE.md](./docs/MEDIA_ARCHITECTURE.md).

## Convenciones de Nomenclatura

- **Archivos de componentes**: `PascalCase.tsx` (ej. `LoginPage.tsx`)
- **Archivos de hooks**: `useNombreDelHook.ts` (ej. `useAuth.ts`)
- **Archivos de utilidades**: `camelCase.ts` (ej. `dateUtils.ts`)
- **Archivos de contextos**: `NombreContext.tsx` (ej. `AuthContext.tsx`)
- **Archivos de tests**: `[nombre].test.tsx` (ej. `LoginPage.test.tsx`)

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

## Evolución Futura

La arquitectura basada en características permite:

1. **Lazy loading de características**: Cargar código solo cuando sea necesario
2. **Micro-frontends**: Potencialmente migrar a una arquitectura de micro-frontends donde cada característica es una aplicación independiente
3. **Feature flags**: Habilitar/deshabilitar características para diferentes usuarios o entornos 

### Expansión Cloud y Kubernetes

A medida que la aplicación crezca, estamos preparados para:

1. **Microservicios especializados**: Migrar funcionalidades específicas a microservicios independientes
2. **Orquestación con Kubernetes**: Desplegar servicios en contenedores para escalado horizontal
3. **Procesamiento asíncrono**: Implementar colas de trabajo para tareas intensivas como procesamiento de video 