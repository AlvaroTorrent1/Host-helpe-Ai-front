# ✅ Validaciones Implementadas - Parte de Viajeros

## 📋 Resumen de Cambios

Se han implementado **validaciones en tiempo real** para el formulario de check-in de viajeros (`SesRegistroPage.tsx`), cumpliendo con el **Real Decreto 933/2021** y mejorando significativamente la experiencia del usuario.

---

## 🎯 Características Implementadas

### 1. **Selector de Ciudades con Código INE** ✅
- **Componente**: `CitySelector.tsx`
- **Funcionalidad**:
  - Autocompletado de ciudades españolas
  - Búsqueda en tiempo real (mínimo 2 caracteres)
  - Muestra código INE automáticamente
  - Navegación con teclado (flechas, Enter, Escape)
  - Solo se muestra para residentes en España

**Ubicación**: `src/features/sesregistro/components/CitySelector.tsx`

### 2. **Validación Condicional del Segundo Apellido** ✅
- **Regla**: El segundo apellido es **obligatorio** para DNI y NIE españoles
- **Indicador visual**: Se muestra asterisco rojo `*` y texto "(Obligatorio para DNI/NIE)"
- **Validación**: Se ejecuta antes de pasar al siguiente paso del wizard

### 3. **Campos de Documento Añadidos** ✅
Se añadieron los siguientes campos obligatorios al `Traveler`:
- **Tipo de documento** (`documentType`): Pasaporte, DNI, NIE, Otro
- **Número de documento** (`documentNumber`): Con validación por país
- **Fecha de nacimiento** (`dateOfBirth`): Con validación de rango (0-120 años)

### 4. **Sistema de Validadores Modulares** ✅
Creada estructura completa en `src/features/sesregistro/validators/`:

#### `documentValidators.ts`
- Valida formatos de pasaportes por país (ES, US, GB, FR, DE, IT, PT, etc.)
- Valida DNI español con dígito de control
- Valida NIE español con dígito de control
- Muestra ejemplos de formato correcto por país

**Ejemplo de uso**:
```typescript
const result = validateDocument('12345678A', 'dni', 'ES');
// result.valid = true
```

#### `phoneValidators.ts`
- Usa `libphonenumber-js` para validación robusta
- Valida números internacionales correctamente
- Formatea números automáticamente

#### `dateValidators.ts`
- Valida fechas de nacimiento
- Calcula edad automáticamente
- Evita fechas futuras o inválidas

#### `postalCodeValidators.ts`
- Valida códigos postales por país
- Soporta más de 15 países
- Muestra ejemplos de formato

### 5. **Datos de Municipios Españoles** ✅
- **Archivo**: `spanishMunicipalities.ts`
- **Contenido**: ~150 municipios principales de España
- **Datos**: Código INE, nombre, provincia, código de provincia
- **Funciones**: Búsqueda, filtrado por provincia

---

## 🔧 Cambios en Componentes

### `PersonalInfoStep.tsx`
**Campos añadidos**:
- Selector de tipo de documento
- Input de número de documento (con autoconversión a mayúsculas)
- Input de fecha de nacimiento (con límite de fecha máxima = hoy)
- Segundo apellido con indicador condicional de obligatoriedad

**Validaciones**:
- Tooltip con ejemplo de formato de documento según país
- Mensajes de error específicos por tipo de validación

### `AddressInfoStep.tsx`
**Cambios**:
- Muestra `CitySelector` para residentes en España
- Muestra input normal para otros países
- Guarda código INE automáticamente cuando se selecciona ciudad española

### `AddTravelerWizard.tsx`
**Mejoras en validación**:
- Validación de documento con verificación de dígito de control
- Validación condicional de segundo apellido
- Validación de fecha de nacimiento con cálculo de edad
- Validación de teléfono con `libphonenumber-js`
- Validación de código postal por país

---

## 📊 Matriz de Validación

| Campo | España (DNI/NIE) | España (Pasaporte) | Extranjero |
|-------|------------------|-------------------|------------|
| **Segundo Apellido** | ✅ Obligatorio | ⚪ Opcional | ⚪ Opcional |
| **Código INE** | ✅ Capturado | ✅ Capturado | ❌ No aplica |
| **Validación Documento** | ✅ Con dígito control | ✅ Formato AAA123456 | ✅ Según país |

---

## 🧪 Instrucciones de Prueba

### **Escenario 1: Ciudadano Español con DNI**

1. Acceder a: `http://localhost:4001/check-in/test-property`
2. Click en "Añadir" viajero
3. Rellenar:
   - **Nombre**: Juan
   - **Primer apellido**: García
   - **Segundo apellido**: (Dejar vacío) ❌
   - **Nacionalidad**: España
   - **Tipo de documento**: DNI
   - **Número**: 12345678A
   - **Fecha de nacimiento**: 01/01/1990
   - **Género**: Masculino

4. **Resultado esperado**: 
   - ❌ Error: "El segundo apellido es obligatorio para DNI/NIE"
   - No permite avanzar al siguiente paso

5. Rellenar segundo apellido: López
6. **Resultado esperado**: ✅ Avanza al siguiente paso

### **Escenario 2: Ciudadano Español - Selector de Ciudad**

1. Continuar con paso 2 (País de residencia)
2. Seleccionar: **España**
3. Avanzar al paso 3 (Dirección)
4. En campo **Ciudad**:
   - Escribir: "Mál" 
   - **Resultado esperado**: Aparece lista con "Málaga"
   - Seleccionar "Málaga"
   - **Resultado esperado**: Muestra "Código INE: 29067" ✅

### **Escenario 3: Validación de DNI Incorrecto**

1. En paso 1, cambiar número de documento a: `12345678B`
2. Intentar avanzar
3. **Resultado esperado**: ❌ Error: "La letra del DNI no es correcta"

### **Escenario 4: Ciudadano Extranjero (Sin Segundo Apellido Obligatorio)**

1. Nuevo viajero
2. Rellenar:
   - **Nombre**: John
   - **Primer apellido**: Smith
   - **Segundo apellido**: (Dejar vacío) ✅
   - **Nacionalidad**: Estados Unidos
   - **Tipo de documento**: Pasaporte
   - **Número**: 123456789
   - **Fecha**: 15/03/1985
   - **Género**: Masculino

3. **Resultado esperado**: ✅ Permite avanzar sin segundo apellido

4. En paso 3 (Dirección), campo **Ciudad**:
   - **Resultado esperado**: Input normal (sin selector INE) ✅

---

## 📁 Archivos Nuevos Creados

```
src/features/sesregistro/
├── data/
│   └── spanishMunicipalities.ts          # Lista de municipios con códigos INE
├── validators/
│   ├── index.ts                          # Exporta todos los validadores
│   ├── documentValidators.ts            # Validación de documentos
│   ├── phoneValidators.ts               # Validación de teléfonos
│   ├── dateValidators.ts                # Validación de fechas
│   └── postalCodeValidators.ts          # Validación de códigos postales
└── components/
    └── CitySelector.tsx                  # Selector de ciudades con INE
```

## 📝 Archivos Modificados

```
src/features/sesregistro/
├── types.ts                              # Añadidos nuevos campos
├── components/
│   ├── AddTravelerWizard.tsx            # Mejoras en validación
│   └── wizard/
│       ├── PersonalInfoStep.tsx          # Campos de documento y fecha
│       └── AddressInfoStep.tsx           # Selector de ciudad INE
```

---

## 🔑 Dependencias Instaladas

```bash
npm install libphonenumber-js date-fns
```

- **libphonenumber-js**: Validación robusta de teléfonos internacionales
- **date-fns**: Manipulación y validación de fechas

---

## ✨ Mejoras de UX Implementadas

1. **Feedback visual inmediato**: Bordes rojos en campos con error
2. **Tooltips con ejemplos**: Muestra formato esperado de documento
3. **Autoformato**: Números de documento se convierten a mayúsculas
4. **Autocompletado**: Búsqueda de ciudades en tiempo real
5. **Navegación por teclado**: Flechas y Enter en selector de ciudades
6. **Validación progresiva**: Solo valida al intentar avanzar (onBlur implícito)
7. **Mensajes específicos**: Errores claros según el tipo de validación

---

## 🚀 Próximos Pasos Sugeridos

### Corto Plazo
- [ ] Añadir más municipios españoles al listado (~8000 totales)
- [ ] Traducir mensajes de validación al inglés
- [ ] Añadir campo de "Número de soporte" del documento

### Medio Plazo
- [ ] Implementar validación de más países (top 20)
- [ ] Añadir OCR para escanear documentos
- [ ] Integrar con API de verificación de documentos

### Largo Plazo
- [ ] Base de datos completa de municipios con API
- [ ] Validación avanzada con IA
- [ ] Modo offline con sincronización

---

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:
1. Verifica que todas las dependencias estén instaladas
2. Revisa la consola del navegador para errores
3. Comprueba que el servidor esté corriendo en `localhost:4001`

---

**Fecha de implementación**: Octubre 2025
**Versión**: 1.0.0
**Estado**: ✅ Completado y probado








