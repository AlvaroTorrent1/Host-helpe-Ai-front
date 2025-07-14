# Corrección del Flujo de Carga de Documentos

## Problema Original
El sistema requería guardar la propiedad antes de poder subir documentos, mostrando el error:
"Debe guardar la propiedad antes de subir documentos"

## Solución Implementada

### 1. Cambios en PropertyDocumentsForm.tsx

#### Almacenamiento Temporal de Documentos
- Cuando `propertyId === "temp"`, los documentos ahora se almacenan localmente
- Se crea un objeto documento temporal con:
  - ID temporal prefijado con `temp_`
  - El archivo File adjunto para procesarlo después
  - URL temporal "#" 

```typescript
if (!propertyId || propertyId === "temp") {
  // Crear documento temporal
  const tempDocument: PropertyDocument = {
    id: `temp_${Date.now()}`,
    property_id: "temp",
    name: currentDocument.name,
    file: selectedFile, // Archivo para procesar después
    // ...
  };
  
  // Añadir a la lista sin enviar al webhook
  onChange([...documents, tempDocument]);
  return;
}
```

#### Verificación Condicional del Webhook
- La verificación de salud del webhook solo se ejecuta para propiedades guardadas
- Evita errores innecesarios durante la creación de propiedades

```typescript
useEffect(() => {
  if (propertyId && propertyId !== "temp") {
    // Solo verificar webhook para propiedades existentes
    checkWebhook();
  }
}, [propertyId]);
```

### 2. Cambios en types/property.ts

Se añadió el campo opcional `file` a PropertyDocument:
```typescript
export interface PropertyDocument {
  // ... campos existentes
  file?: File; // Campo opcional para almacenar archivo temporalmente
}
```

### 3. Mejoras en la UI

#### Indicador de Estado
- Se muestra un aviso cuando hay documentos pendientes de procesar
- Mensaje claro: "Los documentos se procesarán automáticamente cuando guardes la propiedad completa"

#### Mensajes por Documento
- Cada documento temporal muestra: "Pendiente de procesar - Se enviará al guardar la propiedad"

## Flujo Completo

1. **Creación de Propiedad**
   - Usuario completa información básica (paso 1)
   - Sube imágenes (paso 2)
   - Añade documentos (paso 3) - se almacenan temporalmente
   - Añade URLs de Google Business (paso 4)

2. **Al Guardar**
   - Se crea la propiedad en la base de datos
   - Se obtiene el ID real de la propiedad
   - Se procesan las imágenes
   - Se envían los documentos al webhook con el ID real
   - Se guardan los enlaces de Google Business

3. **Manejo de Errores**
   - Si el webhook falla, se muestra error pero no se bloquea el proceso
   - Los documentos pueden reintentarse después

## Beneficios

1. **Mejor UX**: El usuario puede completar todo el formulario sin interrupciones
2. **Flujo Natural**: Guardar todo al final es más intuitivo
3. **Menos Errores**: No se requiere conexión al webhook durante la creación
4. **Flexibilidad**: Los documentos se pueden añadir/eliminar antes de guardar

## Consideraciones

- Los documentos temporales solo existen en memoria del navegador
- Si el usuario recarga la página antes de guardar, los documentos se perderán
- El webhook debe estar disponible al momento de guardar la propiedad 