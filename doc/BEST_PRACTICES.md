# Best Practices - Host Helper AI

Este documento establece las mejores prácticas a seguir en el desarrollo y mantenimiento del proyecto Host Helper AI. Estas directrices ayudan a mantener un código limpio, de alta calidad y accesible, evitando errores comunes y asegurando una evolución sostenible del proyecto.

## Índice

1. [Calidad de Código](#calidad-de-código)
2. [Manejo de Errores](#manejo-de-errores)
3. [Accesibilidad](#accesibilidad)
4. [Rendimiento](#rendimiento)
5. [Gestión de Documentación](#gestión-de-documentación)
6. [Flujo de Desarrollo](#flujo-de-desarrollo)

## Calidad de Código

### Principios Generales

1. **Código Simple y Legible**
   - Preferir soluciones simples y directas sobre código complejo.
   - Nombrar variables, funciones y componentes de manera descriptiva.
   - Evitar abreviaciones poco claras o nombres genéricos.

2. **Archivos Pequeños y Enfocados**
   - Limitar archivos a menos de 200 líneas cuando sea posible.
   - Un componente por archivo, siguiendo el principio de responsabilidad única.
   - Extraer lógica compleja en hooks o utilidades separadas.

3. **Consistencia en Patrones**
   - Seguir patrones establecidos en el proyecto (componentes presentacionales vs. contenedores).
   - Mantener la estructura de directorios basada en características.
   - Respetar las convenciones de nomenclatura definidas.

### TypeScript

1. **Rigurosidad en Tipos**
   - Usar tipos específicos en lugar de `any`.
   - Definir interfaces para props de componentes y estructuras de datos.
   - Aprovechar la inferencia de tipos cuando sea apropiado.

   ```typescript
   // Incorrecto
   const fetchData = async (id: any): Promise<any> => {
     // ...
   };

   // Correcto
   interface PropertyData {
     id: string;
     name: string;
     // ...
   }

   const fetchProperty = async (id: string): Promise<PropertyData> => {
     // ...
   };
   ```

2. **Tipos Explícitos para APIs**
   - Definir tipos para respuestas de API y parámetros de función.
   - Usar genéricos para funciones reutilizables que trabajen con diferentes tipos.

3. **Evitar Type Assertions**
   - Minimizar el uso de aserciones de tipo (`as Type`).
   - Preferir guardas de tipo y comprobaciones en tiempo de ejecución.

### Linting y Formato

1. **ESLint**
   - Todo el código debe pasar ESLint sin warnings ni errores.
   - No desactivar reglas de linting a menos que sea absolutamente necesario.
   - Si se desactiva una regla, documentar el motivo con un comentario.

2. **Prettier**
   - Usar Prettier para formateo consistente.
   - No mezclar diferentes estilos de formateo en el mismo archivo.

3. **Git Hooks**
   - Utilizar pre-commit hooks para ejecutar linters antes de cada commit.
   - Corregir errores de linting antes de solicitar revisiones de código.

## Manejo de Errores

### Patrones de Manejo de Errores

1. **Recuperación Silenciosa**
   - Utilizar bloques catch silenciosos para errores no críticos que no deberían interrumpir la experiencia del usuario.
   - Ideal para operaciones por lotes donde un error en un elemento no debería afectar a otros.

   ```typescript
   // Ejemplo: Subida de múltiples documentos
   for (const doc of documents) {
     try {
       await uploadDocument(doc);
     } catch {
       // Error silencioso, continuamos con el siguiente documento
       // Opcional: registrar el error en un servicio de logging
     }
   }
   ```

2. **Feedback Informativo**
   - Proporcionar mensajes de error claros y accionables al usuario.
   - Evitar términos técnicos o detalles de implementación en mensajes de error.
   - Usar componentes de UI consistentes para mostrar errores (toasts, banners, etc.).

   ```tsx
   try {
     await saveProperty(data);
   } catch (error) {
     // No mostrar el mensaje técnico del error
     setError("No pudimos guardar la propiedad. Por favor, inténtelo de nuevo.");
   }
   ```

3. **Manejo Tipado de Errores**
   - Usar tipos específicos para errores conocidos.
   - Implementar discriminación de errores para manejar diferentes casos.

   ```typescript
   interface ApiError {
     code: string;
     message: string;
   }

   function isApiError(error: unknown): error is ApiError {
     return (
       typeof error === 'object' &&
       error !== null &&
       'code' in error &&
       'message' in error
     );
   }

   try {
     await api.saveData();
   } catch (error) {
     if (isApiError(error)) {
       // Manejar error específico de API
       if (error.code === 'PERMISSION_DENIED') {
         // Manejar error de permisos
       }
     } else {
       // Manejar error genérico
     }
   }
   ```

### Logging

1. **Sin Console.logs en Producción**
   - Eliminar todas las sentencias `console.log` antes de desplegar a producción.
   - Usar herramientas de logging estructurado en su lugar.

2. **Logging Selectivo**
   - Loguear eventos significativos, no operaciones rutinarias.
   - Incluir contexto suficiente en los logs para diagnóstico.
   - Nunca loguear información sensible (credenciales, datos personales).

3. **Diferentes Niveles de Severidad**
   - Usar niveles apropiados (`info`, `warn`, `error`) según la gravedad.
   - Configurar niveles de logging diferentes para desarrollo y producción.

## Accesibilidad

### Principios WCAG

1. **Navegabilidad por Teclado**
   - Todos los elementos interactivos deben ser accesibles mediante teclado.
   - Orden de tabulación lógico (tab index).
   - Indicadores visuales de foco claros.

   ```tsx
   // Ejemplo de botón accesible
   <button 
     onClick={handleAction}
     aria-label="Crear nueva propiedad"
   >
     <PlusIcon /> 
   </button>
   ```

2. **Atributos ARIA**
   - Usar roles y atributos ARIA apropiadamente.
   - Implementar `aria-live` para contenido dinámico.
   - Asegurar que los formularios tengan etiquetas adecuadas.

3. **Contraste y Texto**
   - Mantener relación de contraste mínima de 4.5:1 para texto normal.
   - No comunicar información solo mediante color.
   - Permitir zoom de texto sin pérdida de funcionalidad.

### Componentes Accesibles

1. **Modales y Diálogos**
   - Implementar trampas de foco para modales.
   - Asegurar que ESC cierre los modales.
   - Devolver el foco al elemento que abrió el modal cuando se cierre.

2. **Formularios**
   - Asociar explícitamente labels con inputs.
   - Mostrar errores de validación claramente junto al campo relevante.
   - Usar atributos `aria-invalid` y `aria-describedby` para errores.

   ```tsx
   <div>
     <label htmlFor="propertyName">Nombre de la propiedad</label>
     <input
       id="propertyName"
       value={name}
       onChange={handleChange}
       aria-invalid={!!errors.name}
       aria-describedby={errors.name ? "name-error" : undefined}
     />
     {errors.name && (
       <div id="name-error" className="error">
         {errors.name}
       </div>
     )}
   </div>
   ```

3. **Testing de Accesibilidad**
   - Incorporar pruebas automatizadas de accesibilidad (Axe, Lighthouse).
   - Probar la aplicación con lectores de pantalla (NVDA, VoiceOver).
   - Incluir usuarios con discapacidades en las pruebas de usuario.

## Rendimiento

### Optimización de Componentes

1. **Memoización**
   - Usar `React.memo` para componentes que renderizan con las mismas props frecuentemente.
   - Utilizar `useMemo` y `useCallback` para optimizar cálculos costosos y funciones en callbacks.

   ```tsx
   // Memoizar una función callback
   const handleSubmit = useCallback((data) => {
     saveData(data);
   }, [saveData]);

   // Memoizar un cálculo costoso
   const sortedItems = useMemo(() => {
     return [...items].sort((a, b) => a.name.localeCompare(b.name));
   }, [items]);
   ```

2. **Code Splitting**
   - Implementar lazy loading para componentes grandes.
   - Dividir el código por rutas para reducir el bundle inicial.

   ```tsx
   // Lazy loading de componentes
   const PropertyDetailPage = React.lazy(() => import('./PropertyDetailPage'));

   function App() {
     return (
       <Suspense fallback={<Spinner />}>
         <Routes>
           <Route path="/property/:id" element={<PropertyDetailPage />} />
           {/* ... */}
         </Routes>
       </Suspense>
     );
   }
   ```

3. **Evitar Re-renders Innecesarios**
   - Usar herramientas como React DevTools para identificar re-renders excesivos.
   - Estructurar componentes para minimizar actualizaciones en cascada.
   - Considerar el uso de Context API con separación de lectura/escritura.

### Optimización de Medios

1. **Lazy Loading de Imágenes**
   - Implementar carga perezosa para imágenes fuera del viewport.
   - Usar atributos `loading="lazy"` y `decoding="async"`.

2. **Responsive Images**
   - Usar `srcset` y `sizes` para servir imágenes optimizadas para diferentes dispositivos.
   - Generar múltiples resoluciones para cada imagen.

3. **Formato y Compresión**
   - Servir imágenes en formatos modernos (WebP, AVIF) con fallback.
   - Optimizar compresión manteniendo calidad aceptable.

### Requests y Datos

1. **Caché de Datos**
   - Implementar cache para solicitudes API frecuentes.
   - Usar SWR o React Query para manejo de datos con caché incorporada.

2. **Paginación y Carga Bajo Demanda**
   - Paginar grandes conjuntos de datos para evitar sobrecargar la UI.
   - Implementar scroll infinito o "load more" para colecciones grandes.

3. **Bundle Size**
   - Monitorear el tamaño del bundle con herramientas como Webpack Bundle Analyzer.
   - Minimizar dependencias de terceros.
   - Aprovechar tree-shaking eliminando importaciones no utilizadas.

## Gestión de Documentación

1. **Documentación de Código**
   - Documentar funciones, hooks, y componentes complejos.
   - Explicar decisiones no obvias o workarounds.
   - Mantener JSDoc para APIs públicas.

   ```typescript
   /**
    * Hook para manejar la subida de documentos a una propiedad
    * @param propertyId ID de la propiedad o 'temp' para documentos temporales
    * @returns Métodos y estado para gestionar documentos
    */
   function useDocumentUpload(propertyId: string) {
     // Implementación...
   }
   ```

2. **Actualización de Documentación Arquitectónica**
   - Mantener los documentos ARCHITECTURE.md y MEDIA_ARCHITECTURE.md actualizados con cada cambio significativo.
   - Documentar nuevos patrones o enfoques añadidos al proyecto.

3. **Gestión de Conocimiento**
   - Documentar problemas resueltos y su solución.
   - Crear wikis o guías para problemas recurrentes.
   - Compartir conocimiento entre el equipo, evitando silos.

## Flujo de Desarrollo

1. **Control de Versiones**
   - Usar nombres descriptivos para ramas (feature/, fix/, refactor/).
   - Escribir mensajes de commit significativos que expliquen el por qué, no solo el qué.
   - Realizar commits pequeños y frecuentes con un propósito claro.

2. **Revisión de Código**
   - Incluir una descripción clara del cambio en los pull requests.
   - Revisar el propio código antes de solicitar revisión.
   - Responder a todos los comentarios en las revisiones.

3. **Testing**
   - Escribir tests para toda la lógica de negocio crítica.
   - Incluir pruebas para casos edge y manejo de errores.
   - Automatizar pruebas en la pipeline de CI.

   ```typescript
   // Ejemplo de test para un componente
   test('muestra error cuando la API falla', async () => {
     // Setup
     server.use(
       rest.get('/api/properties', (req, res, ctx) => {
         return res(ctx.status(500));
       })
     );
     
     render(<PropertyList />);
     
     // Verificación
     expect(await screen.findByText(/no pudimos cargar las propiedades/i)).toBeInTheDocument();
   });
   ```

4. **Monitoreo y Mejora Continua**
   - Implementar herramientas de monitoreo para detectar errores en producción.
   - Analizar el rendimiento y usabilidad regularmente.
   - Iterar basándose en feedback de usuarios y métricas.

---

Este documento de mejores prácticas debe evolucionar con el proyecto. Revisarlo regularmente y actualizarlo basado en la experiencia del equipo y las necesidades cambiantes del proyecto. 