# Sistema de Traducciones - Host Helper AI

## Estado Actual

El proyecto tiene múltiples sistemas de traducción implementados que necesitan ser unificados:

1. **LanguageContext (ACTIVO)** - Sistema principal usado en la aplicación
   - Ubicación: `src/shared/contexts/LanguageContext.tsx`
   - Traducciones: `src/translations/es.ts` y `src/translations/en.ts`
   - Hook: `useLanguage()`

2. **i18n simple** - Sistema secundario no utilizado
   - Ubicación: `src/i18n/i18n.ts`
   - No debe ser usado

3. **react-i18next** - Intento de implementación (ELIMINADO)
   - Archivos relacionados eliminados

## Sistema Recomendado: LanguageContext

### Ventajas
- Ya está integrado en toda la aplicación
- Simple y directo
- No requiere dependencias adicionales
- Manejo personalizado de fallbacks

### Cómo usar

```typescript
import { useLanguage } from "@shared/contexts/LanguageContext";

const MyComponent = () => {
  const { t, language, setLanguage } = useLanguage();
  
  return (
    <div>
      <h1>{t("mySection.title")}</h1>
      <button onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}>
        {t("common.changeLanguage")}
      </button>
    </div>
  );
};
```

### Estructura de traducciones

Las traducciones deben seguir esta estructura en `src/translations/[idioma].ts`:

```typescript
export const es = {
  common: {
    // Traducciones comunes
  },
  dashboard: {
    // Traducciones del dashboard
  },
  reservations: {
    // Traducciones de reservas
  },
  // ... más secciones
};
```

## Tareas Pendientes

1. [ ] Eliminar completamente el sistema i18n simple (`src/i18n/i18n.ts`)
2. [ ] Revisar y eliminar cualquier referencia a react-i18next
3. [ ] Consolidar todas las traducciones en el formato del LanguageContext
4. [ ] Verificar que no haya conflictos entre sistemas

## Notas Importantes

- NO instalar react-i18next
- NO usar el archivo `src/i18n/i18n.ts`
- Siempre usar el hook `useLanguage()` del LanguageContext
- Las traducciones deben estar en `src/translations/` 