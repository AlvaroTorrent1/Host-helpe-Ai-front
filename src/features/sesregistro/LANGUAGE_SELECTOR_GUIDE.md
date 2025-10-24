# Guía del Selector de Idiomas - Check-in de Viajeros

## Resumen de Implementación

Se ha implementado un selector de idiomas multilingüe para la página pública de check-in de viajeros.

## Idiomas Soportados

1. 🇪🇸 **Español** (es)
2. 🇬🇧 **Inglés** (en)
3. 🇫🇷 **Francés** (fr)
4. 🇩🇪 **Alemán** (de)
5. 🇳🇱 **Holandés** (nl)
6. 🇨🇳 **Chino** (zh)
7. 🇷🇺 **Ruso** (ru)
8. 🇵🇹 **Portugués** (pt)

## Archivos Creados/Modificados

### Nuevos Archivos
- `src/features/sesregistro/components/LanguageSelector.tsx` - Componente del selector de idiomas
- `src/translations/fr.json` - Traducciones en francés
- `src/translations/de.json` - Traducciones en alemán
- `src/translations/nl.json` - Traducciones en holandés
- `src/translations/zh.json` - Traducciones en chino
- `src/translations/ru.json` - Traducciones en ruso
- `src/translations/pt.json` - Traducciones en portugués

### Archivos Modificados
- `src/i18n.ts` - Configuración actualizada para incluir todos los idiomas
- `src/features/sesregistro/SesRegistroPage.tsx` - Integración del selector de idiomas

## Características

### 1. Detección Automática de Idioma
El sistema detecta automáticamente el idioma del navegador del usuario y lo establece como idioma inicial si está soportado.

### 2. Persistencia de Preferencias
La selección de idioma del usuario se guarda en `localStorage` para futuras visitas.

### 3. Dropdown Interactivo
- Icono de globo y bandera del idioma actual
- Lista desplegable con todos los idiomas disponibles
- Checkmark visual en el idioma activo
- Cierre automático al hacer clic fuera

### 4. Ubicación del Selector
El selector se muestra en la esquina superior derecha en:
- Página principal de check-in
- Pantalla de confirmación (después de enviar)

## Cómo Probar

### 1. Iniciar el servidor de desarrollo
```bash
npm run dev
```

### 2. Acceder a la página de check-in
Navega a: `http://localhost:5173/check-in/[nombre-propiedad]`

Por ejemplo:
```
http://localhost:5173/check-in/Casa-Rural-El-Olivar
```

### 3. Probar el selector de idiomas
1. Haz clic en el botón del selector de idiomas (esquina superior derecha)
2. Selecciona un idioma de la lista desplegable
3. Verifica que toda la interfaz cambie al idioma seleccionado
4. Recarga la página y verifica que el idioma seleccionado se mantenga

### 4. Verificar traducciones
Comprueba que los siguientes elementos cambien de idioma:
- Título "Check-in Online"
- Timer "Tiempo restante"
- Sección "Información de Reserva"
- Botones "Añadir", "Editar", "Eliminar"
- Formulario del wizard de viajeros
- Mensajes de validación
- Botón "Enviar Check-in"
- Pantalla de confirmación

## Estructura de Traducciones

Todas las traducciones están organizadas bajo la clave `sesRegistro` en cada archivo JSON:

```json
{
  "sesRegistro": {
    "title": "...",
    "subtitle": "...",
    "reservation": { ... },
    "travelers": { ... },
    "wizard": { ... },
    "submit": { ... },
    "validation": { ... },
    "errors": { ... },
    "paymentMethods": { ... }
  }
}
```

## Agregar Más Idiomas en el Futuro

Para agregar un nuevo idioma:

1. Crear archivo de traducción: `src/translations/[código-idioma].json`
2. Copiar la estructura de `es.json` o `en.json`
3. Traducir todas las cadenas de texto
4. Actualizar `src/i18n.ts`:
   ```typescript
   import nuevoIdiomaTranslations from "./translations/nuevo-idioma.json";
   
   // Agregar en resources:
   resources: {
     // ... otros idiomas
     'nuevo-idioma': {
       translation: nuevoIdiomaTranslations,
     },
   }
   ```
5. Actualizar `src/features/sesregistro/components/LanguageSelector.tsx`:
   ```typescript
   const LANGUAGES = [
     // ... otros idiomas
     { code: 'nuevo-idioma', name: 'Nombre Nativo', flag: '🏳️' },
   ];
   ```

## Notas Técnicas

- El componente usa `react-i18next` para gestionar las traducciones
- Las banderas son emojis Unicode para evitar dependencias de imágenes
- El dropdown se cierra automáticamente al hacer clic fuera (hook useEffect)
- El código es accesible con atributos ARIA apropiados
- Los estilos usan Tailwind CSS para consistencia con el resto del proyecto

## Soporte

Si encuentras algún problema o necesitas agregar más traducciones, revisa:
- Archivo de configuración: `src/i18n.ts`
- Componente selector: `src/features/sesregistro/components/LanguageSelector.tsx`
- Archivos de traducción: `src/translations/*.json`

