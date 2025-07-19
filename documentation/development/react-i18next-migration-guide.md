# Guía Práctica de Migración a react-i18next

## 🎯 Objetivo

Esta guía proporciona pasos concretos para migrar componentes del LanguageContext (deprecado) a react-i18next (estándar oficial).

## 📋 Checklist de Migración por Componente

### Antes de Empezar
- [ ] Identificar todas las claves de traducción usadas en el componente
- [ ] Verificar si las traducciones existen en los archivos JSON
- [ ] Hacer backup del estado actual del componente

### Pasos de Migración

#### 1. Cambiar el Import
```typescript
// ❌ ANTES (LanguageContext)
import { useLanguage } from "@shared/contexts/LanguageContext";

// ✅ DESPUÉS (react-i18next)
import { useTranslation } from 'react-i18next';
```

#### 2. Cambiar el Hook
```typescript
// ❌ ANTES
const { t, language, setLanguage } = useLanguage();

// ✅ DESPUÉS
const { t, i18n } = useTranslation();
```

#### 3. Migrar Cambio de Idioma
```typescript
// ❌ ANTES
const toggleLanguage = () => setLanguage(language === 'es' ? 'en' : 'es');

// ✅ DESPUÉS
const toggleLanguage = () => i18n.changeLanguage(i18n.language === 'es' ? 'en' : 'es');
```

#### 4. Verificar Claves de Traducción
```typescript
// Las claves siguen igual, pero verificar que existan en JSON
t('reservations.delete.title')  // ✅ Funciona igual
```

#### 5. Migrar Traducciones a JSON
Mover de `src/translations/es.ts` a `src/translations/es.json`:

```typescript
// ❌ ANTES (es.ts)
export const es = {
  reservations: {
    delete: {
      title: "¿Eliminar reserva?",
      confirm: "Eliminar"
    }
  }
};
```

```json
// ✅ DESPUÉS (es.json)
{
  "reservations": {
    "delete": {
      "title": "¿Eliminar reserva?",
      "confirm": "Eliminar"
    }
  }
}
```

## 🔍 Ejemplo Práctico: DeleteConfirmationModal

### Estado Actual (LanguageContext)
```typescript
import { useTranslation } from 'react-i18next';  // ✅ Ya usa react-i18next!

const DeleteConfirmationModal = ({...props}) => {
  const { t } = useTranslation();
  // ...resto del código
};
```

**Nota:** Este componente ya está usando react-i18next correctamente ✅

### Verificación de Traducciones

Claves usadas en DeleteConfirmationModal:
- `reservations.delete.warning`
- `reservations.delete.deleting`
- `reservations.delete.confirm`
- `reservations.delete.cancel`

#### Verificar en archivos JSON:
```bash
# Buscar si las claves existen
grep -r "reservations.delete" src/translations/
```

## 🔧 Herramientas de Migración

### Script para Encontrar Componentes a Migrar
```bash
# Encontrar componentes que usan LanguageContext
grep -r "useLanguage" src/components/ --include="*.tsx"
grep -r "useLanguage" src/features/ --include="*.tsx"
grep -r "useLanguage" src/shared/ --include="*.tsx"
```

### Script para Encontrar Traducciones Faltantes
```bash
# Buscar mensajes de clave no encontrada
grep -r "\[CLAVE_NO_ENCONTRADA" src/
grep -r "\[TRADUCCIÓN_FALTANTE" src/
```

### Verificar Consistencia de Traducciones
```bash
# Comparar claves entre es.json y en.json
diff <(jq -r 'keys_unsorted[]' src/translations/es.json) \
     <(jq -r 'keys_unsorted[]' src/translations/en.json)
```

## 📊 Estado de Migración por Módulo

### ✅ Módulos Migrados (react-i18next)
- [ ] `shared/components/loading/` - Parcialmente migrado
- [x] `shared/components/DeleteConfirmationModal.tsx` - ✅ COMPLETO

### ⚠️ Módulos en Proceso
- [ ] `features/reservations/` - Mixto
- [ ] `features/properties/` - Mixto
- [ ] `features/auth/` - Mixto

### ❌ Módulos Pendientes (LanguageContext)
- [ ] `shared/contexts/LanguageContext.tsx` - Mantener hasta final
- [ ] `features/dashboard/` - Por migrar
- [ ] `features/landing/` - Por migrar

## 🚨 Problemas Comunes y Soluciones

### 1. Traducción No Encontrada
```typescript
// Si ves: [CLAVE_NO_ENCONTRADA: reservations.delete.title]

// Solución: Agregar la clave al JSON
{
  "reservations": {
    "delete": {
      "title": "¿Eliminar reserva?"
    }
  }
}
```

### 2. Variables de Interpolación
```typescript
// ❌ ANTES (puede fallar)
t('welcome', { name: userName });

// ✅ DESPUÉS (más robusto)
t('welcome', { name: userName || 'Usuario' });
```

### 3. Claves Anidadas Profundas
```typescript
// Si la estructura es muy profunda, considerar aplanar:

// ❌ Evitar
t('module.submodule.component.action.confirmation.title')

// ✅ Mejor
t('deleteConfirmation.title')
```

## 📝 Template de Migración

### Para Componente Funcional
```typescript
// Template base para migrar un componente
import React from 'react';
import { useTranslation } from 'react-i18next';

const MyComponent: React.FC<Props> = ({...props}) => {
  const { t, i18n } = useTranslation();

  // Migrar lógica del componente...
  
  return (
    <div>
      <h1>{t('myModule.title')}</h1>
      <p>{t('myModule.description')}</p>
    </div>
  );
};

export default MyComponent;
```

## 🎯 Prioridades de Migración

### Alta Prioridad
1. Componentes compartidos (`shared/components/`)
2. Componentes de autenticación (`features/auth/`)
3. Componentes principales del dashboard

### Media Prioridad
1. Páginas de funcionalidades específicas
2. Modales y formularios

### Baja Prioridad
1. Páginas de landing (menos críticas)
2. Componentes de ejemplo o demo

## ✅ Validación Post-Migración

### Checklist
- [ ] El componente compila sin errores
- [ ] Todas las traducciones se muestran correctamente
- [ ] El cambio de idioma funciona
- [ ] No hay mensajes de `[CLAVE_NO_ENCONTRADA]`
- [ ] Tests pasan (si existen)
- [ ] No hay warnings en consola relacionados con i18n

### Testing Manual
1. Cargar el componente en ambos idiomas
2. Verificar todas las cadenas de texto
3. Probar interpolación de variables (si aplica)
4. Verificar comportamiento en casos edge

---

**Próximos pasos:** Usar esta guía para migrar componentes uno por uno cuando se realicen cambios o mejoras. 