# Troubleshooting de Traducciones

## 🔍 Detectar Problemas de Traducción

### Claves Faltantes en Desarrollo
En modo desarrollo, las claves faltantes aparecen como:
```
[CLAVE_NO_ENCONTRADA: reservations.delete.title]
[TRADUCCIÓN_FALTANTE: common.save]
```

### Comandos de Diagnóstico

#### 1. Encontrar todas las claves faltantes
```bash
# Buscar en archivos fuente
grep -r "\[CLAVE_NO_ENCONTRADA" src/
grep -r "\[TRADUCCIÓN_FALTANTE" src/

# En Windows PowerShell
Select-String -Pattern "\[CLAVE_NO_ENCONTRADA" -Path "src/*" -Recurse
Select-String -Pattern "\[TRADUCCIÓN_FALTANTE" -Path "src/*" -Recurse
```

#### 2. Identificar componentes que usan LanguageContext (deprecado)
```bash
# Linux/Mac
grep -r "useLanguage" src/ --include="*.tsx" --include="*.ts"

# Windows PowerShell
Select-String -Pattern "useLanguage" -Path "src/*" -Include "*.tsx","*.ts" -Recurse
```

#### 3. Verificar si una clave existe en los archivos JSON
```bash
# Linux/Mac
grep -r "clave.especifica" src/translations/ --include="*.json"

# Windows PowerShell
Select-String -Pattern "clave.especifica" -Path "src/translations/*.json"
```

## 🛠️ Soluciones Comunes

### 1. Clave Faltante en react-i18next

**Problema:** Component usa react-i18next pero la clave no está en JSON

**Solución:**
1. Identificar la clave faltante: `reservations.delete.confirm`
2. Buscar si existe en archivos TS:
   ```bash
   grep -r "confirm" src/translations/ --include="*.ts"
   ```
3. Agregar a ambos archivos JSON:

```json
// src/translations/es.json
{
  "reservations": {
    "delete": {
      "confirm": "Eliminar"
    }
  }
}

// src/translations/en.json
{
  "reservations": {
    "delete": {
      "confirm": "Delete"
    }
  }
}
```

### 2. Componente Mixto (usa ambos sistemas)

**Problema:** Componente importa tanto `useLanguage` como `useTranslation`

**Solución:**
1. Elegir UN sistema (preferir react-i18next)
2. Remover el import no usado
3. Migrar todas las claves al sistema elegido

### 3. Estructura de Claves Inconsistente

**Problema:** Misma funcionalidad con claves diferentes en cada sistema

**Ejemplo:**
- LanguageContext: `dashboard.properties.delete.title`
- react-i18next: `properties.delete.title`

**Solución:**
1. Elegir UNA estructura (react-i18next)
2. Actualizar componentes para usar la nueva estructura
3. Eliminar claves duplicadas del LanguageContext

## 📋 Checklist de Migración de Componente

### Antes de Migrar
- [ ] ✅ Hacer backup del componente
- [ ] 🔍 Identificar todas las claves `t('clave')` usadas
- [ ] 📝 Verificar que existen en archivos JSON
- [ ] 🧪 Preparar tests si existen

### Durante la Migración
- [ ] 🔄 Cambiar import de `useLanguage` a `useTranslation`
- [ ] 🏷️ Actualizar claves si es necesario
- [ ] ➕ Agregar traducciones faltantes a JSON
- [ ] 🧹 Limpiar imports no usados

### Después de Migrar
- [ ] ✅ Verificar que compila sin errores
- [ ] 🌐 Probar en ambos idiomas (es/en)
- [ ] 👀 Verificar que no aparecen `[CLAVE_NO_ENCONTRADA]`
- [ ] 🧪 Ejecutar tests si existen

## 🚨 Casos Especiales

### Variables en Interpolación
```typescript
// LanguageContext (TS)
t('welcome', { name: 'Juan', property: 'Casa' })

// react-i18next (JSON) - funciona igual
t('welcome', { name: 'Juan', property: 'Casa' })
```

```json
{
  "welcome": "Bienvenido {{name}} a {{property}}"
}
```

### Claves Anidadas Profundas
```typescript
// Si tienes claves muy profundas, considera aplanar:

// ❌ Evitar
"dashboard.properties.management.actions.delete.confirmation.title"

// ✅ Mejor
"propertyDeleteConfirmation.title"
```

### Pluralización (react-i18next)
```json
{
  "items": "{{count}} elemento",
  "items_plural": "{{count}} elementos"
}
```

```typescript
// Uso automático de plurales
t('items', { count: 1 })    // "1 elemento"
t('items', { count: 5 })    // "5 elementos"
```

## 🔧 Scripts Útiles

### Generar Lista de Claves Faltantes
```bash
#!/bin/bash
# Crear archivo: scripts/find-missing-translations.sh

echo "=== Claves Faltantes ==="
grep -r "\[CLAVE_NO_ENCONTRADA" src/ | cut -d':' -f3 | sort | uniq

echo -e "\n=== Componentes con LanguageContext ==="
grep -r "useLanguage" src/ --include="*.tsx" -l
```

### Validar Consistencia entre ES/EN
```javascript
// scripts/validate-translations.js
const fs = require('fs');

const es = JSON.parse(fs.readFileSync('src/translations/es.json'));
const en = JSON.parse(fs.readFileSync('src/translations/en.json'));

function getKeys(obj, prefix = '') {
  let keys = [];
  for (let key in obj) {
    if (typeof obj[key] === 'object') {
      keys = keys.concat(getKeys(obj[key], prefix + key + '.'));
    } else {
      keys.push(prefix + key);
    }
  }
  return keys;
}

const esKeys = getKeys(es).sort();
const enKeys = getKeys(en).sort();

console.log('Claves solo en ES:', esKeys.filter(k => !enKeys.includes(k)));
console.log('Claves solo en EN:', enKeys.filter(k => !esKeys.includes(k)));
```

## 📈 Estado de Migración Actual

### ✅ Completado
- DeleteConfirmationModal - Migrado a react-i18next
- Documentación actualizada
- Guías de migración creadas

### 🔄 En Proceso
- Auditoría completa de claves faltantes
- Componentes de loading/ - Parcialmente migrados

### ⏳ Pendiente
- features/reservations/ - Mixto
- features/properties/ - Mixto
- features/dashboard/ - LanguageContext
- features/landing/ - LanguageContext

---

**Tip:** Siempre probar en ambos idiomas después de cada cambio de traducción. 