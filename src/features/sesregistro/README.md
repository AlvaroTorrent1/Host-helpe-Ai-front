# SES Registro - Sistema de Check-in de Viajeros

Sistema completo de check-in online para viajeros, cumpliendo con el **Real Decreto 933/2021** del Ministerio del Interior de España.

## 📋 Descripción

Este módulo permite a los turistas completar el registro de viajeros de forma online a través de un enlace único y temporal. Los datos se envían al proveedor LynxCheckin que los transmite al Ministerio del Interior.

## 🎯 Características

- ✅ **Wizard multi-paso** (4 pasos) para añadir viajeros
- ✅ **Validación en tiempo real** con mensajes de error claros
- ✅ **Selector de países** con búsqueda y banderas
- ✅ **Input de teléfono** con código de país
- ✅ **Timer de expiración** con countdown
- ✅ **Responsive mobile-first** - optimizado para móviles
- ✅ **Internacionalización** (Español/Inglés)
- ✅ **Diseño con paleta naranja** de Host Helper

## 🛣️ Ruta

La ruta es **pública** (no requiere autenticación):

```
/check-in/:propertyName
```

**Ejemplos:**
```
/check-in/Doña Carlota
/check-in/Villa%20Marbella
/check-in/Apartamento%20Centro
```

El nombre de la propiedad se pasa en la URL y el usuario completa todos los demás datos (fechas, viajeros, etc.).

## 📁 Estructura de Archivos

```
src/features/sesregistro/
├── SesRegistroPage.tsx           # Página principal (pública)
├── SesReportPage.tsx             # Dashboard para agentes (protegida)
├── types.ts                      # Interfaces TypeScript
├── constants.ts                  # Países, códigos, constantes
├── components/
│   ├── CountrySelector.tsx       # Selector de países reutilizable
│   ├── PhoneInput.tsx            # Input de teléfono con código
│   ├── TravelerCard.tsx          # Card individual de viajero
│   ├── TravelersList.tsx         # Lista de viajeros
│   ├── AddTravelerWizard.tsx     # Modal wizard completo
│   ├── SesReportForm.tsx         # Formulario dashboard (existente)
│   └── wizard/
│       ├── WizardProgressBar.tsx       # Barra de progreso
│       ├── PersonalInfoStep.tsx        # Paso 1: Datos personales
│       ├── ResidenceCountryStep.tsx    # Paso 2: País residencia
│       ├── AddressInfoStep.tsx         # Paso 3: Dirección
│       └── ContactInfoStep.tsx         # Paso 4: Contacto
├── services/
│   └── sesRegistroService.ts     # Comunicación con API
└── utils/
    └── mapSesReportFormToPayload.ts  # Utils existentes

```

## 🔧 Configuración

### Variables de Entorno

Añade a tu archivo `.env`:

```env
# API del proveedor SES (LynxCheckin)
VITE_SES_API_BASE_URL=https://api-provider.example.com
```

## 📝 Datos Requeridos por Viajero

Según el Real Decreto 933/2021:

### Obligatorios ✅
- Nombre
- Primer apellido
- Segundo apellido (opcional en el sistema, pero recomendado)
- Nacionalidad
- Sexo/Género
- País de residencia
- Ciudad
- Código postal
- Dirección completa
- Email
- Teléfono con código de país

### Opcionales
- Teléfono alternativo
- Información adicional de dirección (Apto, Piso, etc.)

## 🎨 Componentes Principales

### 1. **SesRegistroPage**
Página principal donde los turistas completan el check-in.

**Props**: Ninguno (usa URL params)

**Features**:
- Timer de expiración
- Resumen de reserva
- Lista de viajeros
- Botón de envío

### 2. **AddTravelerWizard**
Modal con wizard de 4 pasos para añadir/editar viajeros.

**Props**:
```typescript
{
  isOpen: boolean;
  onClose: () => void;
  onSave: (traveler: Traveler) => void;
  editingTraveler?: Traveler | null;
}
```

**Features**:
- Navegación entre pasos
- Validación por paso
- Guardado de progreso
- Edición de viajeros existentes

### 3. **CountrySelector**
Selector de países reutilizable con búsqueda.

**Props**:
```typescript
{
  value: string;                    // Código ISO del país
  onChange: (code: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  showFlag?: boolean;
}
```

### 4. **PhoneInput**
Input de teléfono con selector de código de país.

**Props**:
```typescript
{
  phoneCountry: string;
  phoneNumber: string;
  onPhoneCountryChange: (code: string) => void;
  onPhoneNumberChange: (number: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
}
```

## 🔌 API Service

### Métodos Disponibles

```typescript
// Obtener datos de reserva
fetchReservationData(propertyId, reservationId, token): Promise<Reservation>

// Añadir viajero
addTraveler(propertyId, reservationId, token, traveler): Promise<Traveler>

// Actualizar viajero
updateTraveler(propertyId, reservationId, token, travelerId, traveler): Promise<Traveler>

// Eliminar viajero
deleteTraveler(propertyId, reservationId, token, travelerId): Promise<void>

// Enviar check-in completo
submitCheckin(propertyId, reservationId, token): Promise<void>
```

### Manejo de Errores

El servicio mapea errores a keys de traducción:

```typescript
{
  'LINK_INVALID': 'sesRegistro.errors.linkInvalid',
  'LINK_EXPIRED': 'sesRegistro.errors.linkExpired',
  'LINK_USED': 'sesRegistro.errors.linkUsed',
  'NETWORK_ERROR': 'sesRegistro.errors.networkError',
  'SERVER_ERROR': 'sesRegistro.errors.serverError',
}
```

## 🌐 Internacionalización

Todas las traducciones están en:
- `src/translations/es.json` → Sección `sesRegistro`
- `src/translations/en.json` → Sección `sesRegistro`

## 🧪 Testing

### Datos Mock

El sistema usa datos mock actualmente en `SesRegistroPage.tsx`:

```typescript
const mockReservation: Reservation = {
  propertyName: 'Doña Carlota',
  checkIn: '2026-03-04',
  checkOut: '2026-03-18',
  numberOfNights: 14,
  numberOfTravelers: 1,
  paymentMethod: 'destination',
  travelers: [],
  expiresAt: new Date(Date.now() + 15 * 60 * 60 * 1000).toISOString(),
};
```

### Cómo Probar

1. **Accede a la URL con el nombre de tu propiedad**:
   ```
   http://localhost:4000/check-in/Doña%20Carlota
   ```
   o simplemente:
   ```
   http://localhost:4000/check-in/Villa-Marbella
   ```

2. **Verifica datos iniciales**: La página carga con fechas de hoy/mañana, 1 viajero, pago en destino

3. **Click en "Editar" (al lado de "Datos")**:
   - Cambia fechas de check-in/check-out
   - Selecciona número de viajeros
   - Elige método de pago
   - Click en "Guardar"

4. **Click en "+ Añadir" viajero**

5. **Completa los 4 pasos del wizard**:
   - Paso 1: Datos personales
   - Paso 2: País de residencia
   - Paso 3: Dirección
   - Paso 4: Contacto

6. **Verifica el viajero añadido en la lista**

7. **Añade más viajeros si es necesario** (según el número configurado)

8. **Click en "Enviar Check-in"** (se habilita cuando hay al menos 1 viajero)

## 📱 Mobile First

El diseño está optimizado para móviles:
- Modal pantalla completa en móvil
- Inputs grandes (44px min)
- Font size 16px (evita auto-zoom en iOS)
- Teclados apropiados (`type="email"`, `type="tel"`)
- Touch targets de 44x44px mínimo

## 🎨 Paleta de Colores

- **Primario**: `#ECA408` (Naranja Host Helper)
- **Secundario**: `#FBC748` (Naranja claro)
- **Fondos**: `#FFFFFF`, `#F8F9FA`
- **Bordes**: `#E9ECEF`
- **Texto**: `#333333`, `#6C757D`

## 🔒 Seguridad

- ✅ Enlaces temporales con expiración (15 horas mock)
- ✅ Token único de seguridad
- ✅ Validación de datos en frontend
- ✅ Sanitización de inputs
- ✅ HTTPS obligatorio en producción

## 📚 Normativa Legal

**Real Decreto 933/2021**:
- Obliga a comunicar datos de huéspedes al Ministerio del Interior
- Mejora la seguridad ciudadana
- Control exhaustivo de viajeros
- Plazo de comunicación establecido

## 🚀 Próximas Mejoras

- [ ] Escaneo de documentos (pasaporte/DNI)
- [ ] OCR para auto-rellenar datos
- [ ] Firma digital del viajero
- [ ] Dashboard para hosts con estadísticas
- [ ] Tests automatizados (Vitest)
- [ ] Modo offline con sync posterior

## 👥 Flujo de Usuario

1. **Host/Agente** envía enlace simple al turista: `/check-in/[nombre-propiedad]`
2. **Turista** abre el enlace en su móvil
3. **Turista** configura su reserva:
   - Selecciona fechas de entrada/salida
   - Indica número de viajeros
   - Elige método de pago
4. **Turista** añade datos de cada viajero (wizard 4 pasos)
5. **Turista** revisa toda la información
6. **Turista** envía check-in
7. **Sistema** envía datos al proveedor
8. **Proveedor** transmite al Ministerio del Interior
9. **✅ Check-in completado**

---

**Desarrollado con ❤️ por Host Helper**
**Cumplimiento normativo: Real Decreto 933/2021**

