# Guía de Uso de Google Analytics en Host Helper AI

Esta guía describe cómo se ha implementado Google Analytics 4 (GA4) en nuestra aplicación y cómo utilizarlo correctamente para realizar un seguimiento efectivo de las métricas importantes.

## Configuración

Google Analytics está configurado en la aplicación utilizando las siguientes variables de entorno:

```
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX  # ID de medición de GA4
VITE_ENABLE_GA=false                 # Habilitar en desarrollo (predeterminado: false)
```

Para habilitar el seguimiento en tu entorno de desarrollo, puedes crear un archivo `.env.local` con estas variables.

## Funcionalidades implementadas

La implementación de GA4 incluye:

1. **Seguimiento automático de páginas vistas**: Se registra cada navegación entre páginas
2. **Seguimiento de usuario**: Se asocia un ID anónimo con cada usuario autenticado
3. **Seguimiento de eventos**: Se registran acciones específicas del usuario

## Componentes y Hooks disponibles

### 1. Servicio principal (`analytics.ts`)

El servicio principal proporciona:

- `initGA(measurementId)`: Inicializa Google Analytics
- `logPageView(page)`: Registra una página vista
- `logEvent(category, action, label, value)`: Registra un evento personalizado
- `logError(description, fatal)`: Registra un error
- `setUser(userId)`: Establece el ID de usuario para el seguimiento

### 2. Componente AnalyticsButton

Botón con seguimiento integrado:

```tsx
import AnalyticsButton from '@shared/components/AnalyticsButton';

<AnalyticsButton 
  category="Checkout" 
  action="Purchase" 
  label="Plan Premium"
  className="btn btn-primary"
  onClick={handlePurchase}
>
  Comprar ahora
</AnalyticsButton>
```

### 3. Hook useAnalytics

```tsx
import useAnalytics from '@hooks/useAnalytics';

function MyComponent() {
  const { trackEvent, trackConversion, trackUIInteraction } = useAnalytics('Página de registro');
  
  const handleSubmit = () => {
    // Lógica de registro...
    trackConversion('Registration', 'User registered successfully');
  };
  
  return (
    <button onClick={() => trackUIInteraction('Submit Button')}>
      Registrar
    </button>
  );
}
```

## Convenciones de nomenclatura

### Categorías de eventos

- `Auth`: Eventos relacionados con autenticación (login, registro, etc.)
- `User`: Acciones relacionadas con el perfil o preferencias del usuario
- `Property`: Acciones relacionadas con propiedades (crear, editar, etc.)
- `Reservation`: Acciones relacionadas con reservas
- `Conversion`: Eventos importantes para el negocio (registros, pagos, etc.)
- `UI Interaction`: Interacciones con elementos de la interfaz
- `Navigation`: Eventos de navegación específicos
- `Error`: Errores de la aplicación

### Acciones

Las acciones deben ser verbos en infinitivo o sustantivos descriptivos:

- `Click`, `Submit`, `View`, `Create`, `Edit`, `Delete`, etc.

### Etiquetas

Las etiquetas deben proporcionar contexto adicional:

- ID del elemento
- Nombre descriptivo
- Información extra relevante

## Eventos importantes a rastrear

1. **Registro e inicio de sesión**
   - Ya implementado automáticamente en AuthContext

2. **Creación y edición de propiedades**
   ```tsx
   trackEvent('Property', 'Create', propertyName);
   ```

3. **Reservas**
   ```tsx
   trackConversion('Reservation', 'Confirmed', reservationAmount);
   ```

4. **Interacciones con chatbot**
   ```tsx
   trackEvent('Chatbot', 'Message Sent', messageContent);
   ```

5. **Errores de la aplicación**
   ```tsx
   trackError('API Error', errorMessage);
   ```

## Acceso a informes en Google Analytics

Los informes están disponibles en la consola de Google Analytics:
https://analytics.google.com/

## Consideraciones de privacidad

- Nunca rastrees información de identificación personal (PII)
- Asegúrate de que la política de privacidad mencione el uso de Google Analytics
- Considera añadir un banner de consentimiento de cookies

## Referencias

- [Documentación oficial de GA4](https://developers.google.com/analytics/devguides/collection/ga4)
- [React GA4 en GitHub](https://github.com/PriceRunner/react-ga4) 