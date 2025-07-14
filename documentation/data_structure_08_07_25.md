# Análisis de la Estructura de Datos de Propiedades (08/07/2025)

Este documento resume la arquitectura de datos para la gestión de propiedades, incluyendo cómo se almacenan las imágenes, documentos y enlaces compartibles.

## 1. Resumen General

El sistema utiliza una combinación de tablas en la base de datos de Supabase y Supabase Storage para gestionar los datos de las propiedades. La lógica se distribuye entre el frontend (formularios de React), servicios de backend (TypeScript) y funciones de la base de datos (PostgreSQL).

## 2. Esquema de la Base de Datos

Las tres tablas principales involucradas son:

### a. `properties`
Almacena la información central de cada propiedad.
- **Columnas clave:** `id`, `name`, `address`, `description`, `owner_id`, etc.

### b. `media_files`
Actúa como un repositorio central para todos los archivos subidos, ya sean imágenes o documentos.
- **Columnas clave:**
    - `id`: Identificador único del archivo.
    - `property_id`: Vincula el archivo a una propiedad.
    - `file_type`: Categoriza el archivo (`image`, `document`, `video`).
    - `storage_path`: La ruta al archivo dentro de Supabase Storage.
    - `file_name`, `mime_type`, `size`.

### c. `shareable_links`
Guarda los enlaces generados que se pueden compartir para acceder a galerías, imágenes o documentos.
- **Columnas clave:**
    - `id`: Identificador único del enlace.
    - `property_id`: Vincula el enlace a una propiedad.
    - `media_file_id`: (Opcional) Vincula el enlace a un archivo específico en `media_files`.
    - `link_type`: Define el propósito del enlace (`gallery`, `image`, `document`).
    - `token`: El identificador único y seguro del enlace.

## 3. Flujo de Datos

El proceso de creación de una propiedad sigue estos pasos:

1.  **Frontend (`PropertyForm.tsx`):** El usuario completa el formulario con los detalles de la propiedad, imágenes y documentos.
2.  **Subida de Archivos (`mediaService.ts`):**
    -   Los archivos (imágenes/documentos) se suben directamente a **Supabase Storage** desde el cliente.
    -   Una vez subidos, el `mediaService` registra los metadatos de cada archivo en la tabla `media_files`.
3.  **Creación de la Propiedad:**
    -   Los datos del formulario (sin los archivos) se envían para crear un nuevo registro en la tabla `properties`. Esto puede ocurrir directamente o a través de un webhook a N8N, dependiendo del flujo.
4.  **Generación de Enlaces (`generate_shareable_link`):**
    -   Una función de PostgreSQL se encarga de crear los registros correspondientes en la tabla `shareable_links` cuando se solicitan.

## 4. Servicios de Backend y Lógica

-   **`mediaService.ts`:** Gestiona correctamente la subida de diferentes tipos de medios y su registro en `media_files`.
-   **`documentService.ts`:** Se identificó una inconsistencia en este servicio. Hace referencia a una tabla `property_documents` que no existe. En la práctica, los documentos se gestionan a través de `media_files` con `file_type = 'document'`.

## 5. Problemas Identificados y Recomendaciones

-   **Inconsistencia en `documentService.ts`:** El servicio debe ser refactorizado para utilizar la tabla `media_files` y eliminar la referencia a la tabla inexistente. Esto simplificará el código y eliminará la confusión.
-   **Recomendación de Arquitectura:** Para una mayor separación de responsabilidades a futuro, se podría considerar la creación de una tabla `documents` dedicada. Sin embargo, la solución actual de usar una columna `file_type` en `media_files` es viable y escalable si se gestiona de forma consistente. 