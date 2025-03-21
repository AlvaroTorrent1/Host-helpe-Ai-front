# Arquitectura de Gestión de Medios Escalable

Este documento describe la arquitectura implementada para el manejo escalable de imágenes y videos en Host Helper AI.

## Visión General

El sistema utiliza una arquitectura distribuida que separa metadatos de archivos físicos, aprovechando servicios de almacenamiento en la nube con CDN para entregar medios de manera eficiente a nivel global.

```
┌───────────────┐         ┌───────────────┐        ┌───────────────┐
│  Aplicación   │────────▶│   Supabase    │───────▶│  Navegador    │
│    React      │         │  PostgreSQL   │        │   Cliente     │
└───────┬───────┘         └───────────────┘        └───────────────┘
        │                        ▲                        ▲
        │                        │                        │
        ▼                        │                        │
┌───────────────┐         ┌──────┴────────┐        ┌──────┴────────┐
│   Supabase    │─────────┤     CDN       │────────▶   Medios      │
│   Storage     │         │   Global      │        │  Optimizados  │
└───────────────┘         └───────────────┘        └───────────────┘
```

## Componentes Principales

### 1. Almacenamiento de Medios
- **Supabase Storage**: Almacenamiento de objetos basado en S3
- **Estructura de Buckets**: Un bucket principal `property-media` organizado por ID de propiedad
- **Nombres de Archivo**: Generados con UUIDs para evitar colisiones

### 2. Base de Datos de Metadatos
- **Tabla `media`**: Almacena metadatos separados de los archivos físicos
- **Relaciones**: Vinculada a propiedades mediante `property_id`
- **Políticas RLS**: Seguridad a nivel de fila para acceso restringido

### 3. Capa de Servicio
- **mediaService.ts**: API unificada para todas las operaciones de medios
- **Operaciones asíncronas**: Subida, eliminación y consulta de medios optimizadas

### 4. Componentes de UI
- **MediaGallery**: Componente React para visualización y gestión de medios
- **Dropzone**: Sistema de arrastrar y soltar archivos para carga intuitiva
- **Carga por lotes**: Soporte para subida de múltiples archivos simultáneamente

## Beneficios de la Arquitectura

### Escalabilidad
- Separación entre metadatos (PostgreSQL) y archivos binarios (Storage)
- CDN para distribución global con baja latencia
- Carga y procesamiento asíncrono para mejor experiencia de usuario

### Rendimiento
- Optimización automática de imágenes mediante parámetros de URL
- Generación de thumbnails para videos
- Carga perezosa (lazy loading) de imágenes
- Paginación para manejo eficiente de grandes colecciones

### Seguridad
- Políticas RLS que aseguran que solo los propietarios de las propiedades puedan ver/modificar sus medios
- Validación de tipos de archivo
- Límites de tamaño configurables

## Implementación

### Estructura de la Base de Datos
```sql
CREATE TABLE public.media (
  id UUID PRIMARY KEY,
  property_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  url TEXT NOT NULL,
  thumbnail_url TEXT,
  size BIGINT NOT NULL,
  dimensions JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB
);
```

### Flujo de Datos
1. El usuario selecciona archivos para cargar
2. El cliente procesa los archivos localmente (validación, extracción de metadatos)
3. Los archivos se cargan al almacenamiento de Supabase
4. Los metadatos se almacenan en la tabla `media`
5. Los archivos se sirven desde la CDN de Supabase con optimizaciones on-demand

## Futuras Mejoras

### Corto Plazo
- Implementar procesamiento de imágenes en el lado del servidor para optimizaciones avanzadas
- Añadir soporte para etiquetas y categorización de medios
- Implementar reconocimiento de objetos para búsqueda inteligente

### Largo Plazo
- Microservicio dedicado de procesamiento de medios en Kubernetes
- Integración con servicios de IA para análisis automático de contenido
- Implementación de streaming adaptativo para videos

## Conclusión

Esta arquitectura proporciona una base sólida para el manejo de medios escalable, permitiendo a Host Helper AI gestionar eficientemente grandes cantidades de imágenes y videos para las propiedades, con una experiencia de usuario óptima y un rendimiento excelente. 