# Sistema de Traducciones - Host Helper AI

## Estado Actual y Estrategia de Migración

El proyecto actualmente tiene dos sistemas de traducción que coexisten. **Estamos en proceso de migración hacia react-i18next como estándar oficial**.

## ✅ Sistema Oficial (USAR PARA NUEVO DESARROLLO): react-i18next

**Ubicación:**
- Configuración: `src/i18n.ts`
- Traducciones: `src/translations/en.json` y `src/translations/es.json`
- Hook: `useTranslation()` from 'react-i18next'

### ¿Por qué react-i18next?
- **Estándar de la industria** con 11M+ descargas semanales
- **Características avanzadas**: pluralización, formateo de fechas, namespaces
- **Comunidad robusta** y mantenimiento activo
- **Escalabilidad** para equipos grandes
- **Ecosistema completo** de herramientas
- **Interpolación robusta** de variables
- **Lazy loading** de traducciones

### Cómo usar react-i18next (NUEVO ESTÁNDAR)

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('mySection.title')}</h1>
      <p>{t('mySection.description', { name: 'Usuario' })}</p>
      <button onClick={() => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es')}>
        {t('common.changeLanguage')}
      </button>
    </div>
  );
};
```

### Estructura de traducciones JSON

Las traducciones deben seguir esta estructura en `src/translations/[idioma].json`:

```json
{
  "common": {
    "loading": "Cargando...",
    "error": "Error",
    "success": "Éxito"
  },
  "dashboard": {
    "title": "Panel de Control",
    "welcome": "Bienvenido {{name}}"
  },
  "reservations": {
    "title": "Reservas",
    "delete": {
      "title": "¿Eliminar reserva?",
      "confirm": "Eliminar"
    }
  }
}
```

## ⚠️ Sistema Heredado (DEPRECADO): LanguageContext

**Ubicación:**
- Contexto: `src/shared/contexts/LanguageContext.tsx`
- Traducciones: `src/translations/es.ts` y `src/translations/en.ts`
- Hook: `useLanguage()`

**Estado: DEPRECADO** - No usar para nuevo desarrollo. Migrar gradualmente.

## 📋 Guía de Migración Gradual

### Para Nuevos Componentes
1. **SIEMPRE** usar `useTranslation()` de react-i18next
2. Agregar traducciones a los archivos JSON (`src/translations/`)
3. **NO** usar `useLanguage()` del LanguageContext

### Para Componentes Existentes
1. Migrar uno a la vez cuando se realicen cambios
2. Cambiar `useLanguage()` por `useTranslation()`
3. Mover traducciones de archivos TS a archivos JSON
4. Actualizar las claves de traducción si es necesario

### Ejemplo de Migración

**ANTES (LanguageContext - DEPRECADO):**
```typescript
import { useLanguage } from "@shared/contexts/LanguageContext";

const Component = () => {
  const { t } = useLanguage();
  return <h1>{t("reservations.title")}</h1>;
};
```

**DESPUÉS (react-i18next - ESTÁNDAR):**
```typescript
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();
  return <h1>{t("reservations.title")}</h1>;
};
```

## 🚀 Mejores Prácticas

### Organización de Claves
- Usar estructura jerárquica: `sección.subsección.elemento`
- Agrupar por contexto funcional, no por páginas
- Usar nombres descriptivos: `delete.confirmTitle` en lugar de `deleteTitle`

### Interpolación de Variables
```typescript
// En JSON
"welcome": "Bienvenido {{name}} a {{property}}"

// En componente
t('welcome', { name: 'Juan', property: 'Casa Rural' })
```

### Pluralización
```json
{
  "items": "{{count}} elemento",
  "items_plural": "{{count}} elementos"
}
```

### Contexto y Namespaces
```typescript
// Para módulos grandes, usar namespaces
const { t } = useTranslation('reservations');
t('title'); // busca en reservations.title
```

## 🎯 Plan de Transición

### Fase 1: Nuevos Desarrollos (ACTUAL)
- ✅ Todo nuevo código usa react-i18next
- ✅ Documentación actualizada
- ✅ Ejemplos y guías disponibles

### Fase 2: Migración Gradual
- [ ] Migrar componentes principales uno por uno
- [ ] Consolidar traducciones duplicadas
- [ ] Eliminar claves no utilizadas del LanguageContext

### Fase 3: Limpieza Final
- [ ] Eliminar LanguageContext completamente
- [ ] Limpiar archivos de traducciones TS
- [ ] Actualizar tests afectados

## 🔧 Configuración Actual

### react-i18next Setup
El sistema ya está configurado en `src/i18n.ts`:
```typescript
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import { en } from "./translations/en";
import { es } from "./translations/es";

i18n.use(initReactI18next).init({
  lng: "es",
  fallbackLng: "es",
  resources: {
    en: { translation: en },
    es: { translation: es }
  },
  interpolation: {
    escapeValue: false,
  },
});
```

## ⚡ Comandos Útiles

### Encontrar uso de LanguageContext (para migración)
```bash
grep -r "useLanguage" src/ --include="*.tsx" --include="*.ts"
```

### Encontrar traducciones faltantes
```bash
grep -r "\[CLAVE_NO_ENCONTRADA" src/
```

## 🚨 Reglas Importantes

### ✅ HACER
- Usar `useTranslation()` para todo nuevo desarrollo
- Agregar traducciones a archivos JSON
- Seguir la estructura jerárquica de claves
- Migrar componentes gradualmente cuando se modifiquen

### ❌ NO HACER
- Usar `useLanguage()` para nuevo código
- Agregar nuevas traducciones a archivos TS
- Mezclar sistemas en el mismo componente
- Eliminar el LanguageContext hasta completar la migración

## 📚 Recursos Adicionales

- [Documentación oficial de react-i18next](https://react.i18next.com/)
- [Guía de migración react-i18next](https://react.i18next.com/latest/migrating-v9-to-v10)
- [Mejores prácticas i18n](https://react.i18next.com/latest/i18next-instance)

---

**Estado del documento:** Actualizado para establecer react-i18next como estándar oficial
**Última actualización:** Enero 2025 