# Botpress - Guía de Integración Técnica

## Introducción

Esta guía proporciona instrucciones detalladas para la integración técnica de Botpress con Host Helper. Botpress es una plataforma de creación de chatbots que permite construir, implementar y gestionar conversaciones automatizadas.

## Requisitos previos

- Cuenta en Botpress Cloud o instalación local de Botpress
- Acceso a la API de Botpress
- Credenciales de autenticación para Botpress
- Acceso al panel de administración de Host Helper

## Arquitectura de integración

La integración entre Host Helper y Botpress sigue el siguiente esquema:

```
Host Helper App <-> API Gateway <-> Botpress API
```

### Componentes principales:

1. **Frontend de Host Helper**: Interfaz de usuario que integra el widget del chatbot.
2. **Backend de Host Helper**: Gestiona la lógica de negocio y se comunica con Botpress.
3. **API Gateway**: Maneja las solicitudes entre Host Helper y Botpress.
4. **Botpress Cloud/Server**: Plataforma donde se construye y gestiona el chatbot.

## Pasos de integración

### 1. Crear un bot en Botpress

1. Inicia sesión en [Botpress Cloud](https://app.botpress.cloud/)
2. Crea un nuevo bot (o utiliza uno existente)
3. Configura los flujos de conversación, intenciones y entidades según los requisitos de Host Helper
4. Prueba el bot en el entorno de Botpress para asegurarte de que funciona correctamente

### 2. Obtener credenciales de API

Para conectar Host Helper con Botpress, necesitarás:

- Bot ID
- API Key
- Webhook Secret (para recibir eventos)

Estos datos se encuentran en la sección de configuración del bot en Botpress.

### 3. Integrar el widget en Host Helper

#### Opción 1: Uso del script de Botpress

Añade el siguiente código en el archivo donde deseas que aparezca el chatbot (generalmente en el componente principal o layout):

```html
<script src="https://cdn.botpress.cloud/webchat/v0/inject.js"></script>
<script>
  window.botpressWebChat.init({
    botId: 'TU_BOT_ID',
    hostUrl: 'https://cdn.botpress.cloud/webchat/v0',
    messagingUrl: 'https://messaging.botpress.cloud',
    clientId: 'TU_CLIENT_ID',
    webhookId: 'TU_WEBHOOK_ID',
    lazySocket: true,
    themeName: 'prism',
    frontendVersion: 'v1',
    theme: {
      style: {
        background: '#ffffff',
        textColor: '#000000',
        headerBackground: '#0f172a',
        headerTextColor: '#ffffff'
      }
    }
  });
</script>
```

#### Opción 2: Integración mediante React Component

Para aplicaciones React como Host Helper, puedes crear un componente dedicado:

```jsx
// BotpressChat.jsx
import React, { useEffect } from 'react';

const BotpressChat = () => {
  useEffect(() => {
    // Cargar el script de Botpress
    const script = document.createElement('script');
    script.src = 'https://cdn.botpress.cloud/webchat/v0/inject.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      window.botpressWebChat.init({
        botId: process.env.REACT_APP_BOTPRESS_BOT_ID,
        hostUrl: 'https://cdn.botpress.cloud/webchat/v0',
        messagingUrl: 'https://messaging.botpress.cloud',
        clientId: process.env.REACT_APP_BOTPRESS_CLIENT_ID,
        webhookId: process.env.REACT_APP_BOTPRESS_WEBHOOK_ID,
        lazySocket: true,
        themeName: 'prism',
        frontendVersion: 'v1',
        theme: {
          style: {
            background: '#ffffff',
            textColor: '#000000',
            headerBackground: '#0f172a',
            headerTextColor: '#ffffff'
          }
        }
      });
    };

    return () => {
      // Limpiar al desmontar
      document.body.removeChild(script);
    };
  }, []);

  return <div id="botpress-webchat-container"></div>;
};

export default BotpressChat;
```

### 4. Configurar la comunicación con Botpress API

Para comunicaciones más avanzadas, configura el backend de Host Helper para interactuar con la API de Botpress:

```javascript
// Ejemplo de servicio para comunicarse con Botpress
import axios from 'axios';

const BOTPRESS_API_URL = 'https://api.botpress.cloud/v1';
const API_KEY = process.env.BOTPRESS_API_KEY;

export const botpressService = {
  // Enviar mensaje al bot programáticamente
  sendMessage: async (botId, userId, message) => {
    try {
      const response = await axios.post(
        `${BOTPRESS_API_URL}/bots/${botId}/converse/${userId}`,
        { type: 'text', text: message },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message to Botpress:', error);
      throw error;
    }
  },

  // Obtener historial de conversación
  getConversationHistory: async (botId, userId) => {
    try {
      const response = await axios.get(
        `${BOTPRESS_API_URL}/bots/${botId}/conversations/${userId}`,
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching conversation history:', error);
      throw error;
    }
  }
};
```

### 5. Configurar webhooks

Para permitir que Botpress notifique a Host Helper sobre eventos específicos:

1. Crea un endpoint en el backend de Host Helper para recibir notificaciones
2. Configura el webhook en el panel de control de Botpress, apuntando a tu endpoint
3. Implementa la lógica de manejo de eventos en Host Helper

Ejemplo de endpoint para webhook:

```javascript
// En Express.js
app.post('/api/botpress/webhook', (req, res) => {
  const { type, payload } = req.body;
  
  // Verificar el secreto para seguridad
  const providedSignature = req.headers['x-bp-signature'];
  const expectedSignature = createHmac('sha256', process.env.BOTPRESS_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (providedSignature !== expectedSignature) {
    return res.status(401).send('Unauthorized');
  }

  // Procesar diferentes tipos de eventos
  switch (type) {
    case 'message':
      // Lógica para nuevos mensajes
      break;
    case 'conversation_started':
      // Lógica para conversaciones nuevas
      break;
    // Otros tipos de eventos
    default:
      console.log('Evento no manejado:', type);
  }

  res.status(200).send('Event received');
});
```

## Personalización del chatbot

### Personalización visual

El widget de Botpress puede personalizarse para que coincida con la identidad visual de Host Helper. Las opciones principales incluyen:

- Colores (fondo, texto, encabezado)
- Posición en la pantalla
- Botón de apertura
- Avatar del bot

Ejemplo de personalización completa:

```javascript
window.botpressWebChat.init({
  // Credenciales (como antes)
  // ...
  
  // Personalización visual
  theme: {
    style: {
      background: '#ffffff',
      textColor: '#333333',
      headerBackground: '#0f172a',
      headerTextColor: '#ffffff',
      botMessageBackground: '#f0f0f0',
      botMessageColor: '#333333',
      userMessageBackground: '#0f172a',
      userMessageColor: '#ffffff',
      placeholderColor: '#a0a0a0'
    },
    layout: {
      hideBotAvatar: false,
      hideUserAvatar: true,
      hideTimestamp: false
    }
  },
  // Botón personalizado
  showConversationButton: true,
  disableAnimations: false,
  avatarUrl: 'https://tuservidor.com/logo-hosthelper.png',
  // Posición y tamaño
  containerWidth: '360px',
  layoutWidth: '360px',
  hideWidget: false,
  disableNotificationSound: false,
  closeOnEscape: true,
  showCloseButton: true,
  // Posición del botón en la pantalla
  // (bottom-right, bottom-left, top-right, top-left)
  botConversationDescription: 'Asistente de Host Helper',
  enableTranscriptDownload: false,
  stylesheet: 'https://tuservidor.com/ruta/a/estilos-personalizados.css'
});
```

### Personalización de comportamiento

Para adaptar el comportamiento del chatbot a Host Helper:

1. Configura **variables de entorno** para pasar información contextual al bot
2. Implementa **acciones personalizadas** para integrar con funcionalidades específicas
3. Configura **flujos específicos** para diferentes secciones de Host Helper

Ejemplo de inicialización con datos contextuales:

```javascript
// Pasando información contextual de usuario
window.botpressWebChat.init({
  // Configuración básica
  // ...
  
  // Datos para personalizar la experiencia
  userId: 'user-123',
  enableReset: true,
  extraStylesheet: '/assets/custom-chat.css',
  
  // Pasar información de contexto al bot
  conversationId: 'existing-conversation-id',
  initialPayload: 'INICIAR_FLUJO_RESERVAS',
  
  // Variables para el bot
  locale: 'es',
  botConversationDescription: '¿Cómo puedo ayudarte con tu propiedad?',
  
  // Referencia cruzada con datos de usuario
  userProfile: {
    userId: 'user-123',
    propertyId: 'property-456',
    tier: 'premium',
    language: 'es'
  }
});
```

## Manejo de integraciones con APIs externas

Para permitir que Botpress acceda a datos de Host Helper:

1. Configura acciones en Botpress para realizar solicitudes API
2. Crea endpoints API en Host Helper para proporcionar datos al bot
3. Gestiona la autenticación entre sistemas

Ejemplo de acción personalizada en Botpress (hook de código):

```javascript
const axios = require('axios')

/**
 * Obtiene propiedades del usuario desde Host Helper
 * @title Obtener propiedades
 * @category Host Helper
 * @author Bot Developer
 */
const getUserProperties = async () => {
  const userId = event.state.user.id

  try {
    const response = await axios.get(
      `https://api.hosthelper.com/users/${userId}/properties`,
      {
        headers: {
          'Authorization': `Bearer ${process.env.HOST_HELPER_API_KEY}`
        }
      }
    )
    
    // Guardar las propiedades en el estado de la conversación
    temp.properties = response.data.properties
    
    if (response.data.properties.length > 0) {
      return {
        hasProperties: true,
        count: response.data.properties.length
      }
    } else {
      return {
        hasProperties: false,
        count: 0
      }
    }
  } catch (error) {
    console.error('Error fetching properties:', error)
    temp.error = error.message
    return { hasProperties: false, error: true }
  }
}

return getUserProperties()
```

## Seguridad y privacidad

Es crucial seguir estas prácticas de seguridad:

1. **No almacenar información sensible** en conversaciones de Botpress
2. **Utilizar tokens de autenticación** para la comunicación entre sistemas
3. **Implementar validación de firmas** para webhooks
4. **Cifrar las comunicaciones** mediante HTTPS
5. **Limitar permisos de API** a lo estrictamente necesario
6. **Registrar eventos de seguridad** relacionados con la integración

## Pruebas y depuración

### Herramientas para pruebas

- **Botpress Debugger**: Para probar flujos de conversación
- **Emulador de chat**: Para simular interacciones de usuario
- **API Testers** (como Postman): Para probar endpoints de integración
- **Logs de conversación**: Para monitorear interacciones reales

### Proceso de pruebas recomendado

1. Prueba unitaria de cada flujo de conversación
2. Prueba de integración de la API
3. Prueba de usuario en entorno controlado
4. Monitorización inicial en producción

## Despliegue y mantenimiento

### Proceso de despliegue

1. Desplegar cambios en Botpress (flujos, contenido)
2. Actualizar cualquier endpoint de API en Host Helper
3. Probar la integración en entorno de staging
4. Desplegar a producción

### Monitorización

- Configura alertas para errores de comunicación API
- Revisa regularmente los logs de conversación
- Monitorea métricas clave (tasa de finalización, fallback)

## Resolución de problemas comunes

### El widget no se carga

- Verificar que los scripts están incluidos correctamente
- Comprobar errores de consola del navegador
- Confirmar que el Bot ID es correcto

### Errores de comunicación API

- Verificar credenciales de API
- Comprobar formato de solicitudes
- Revisar logs de servidor

### Respuestas incorrectas del bot

- Revisar flujos de conversación en Botpress
- Comprobar entrenamiento de intenciones
- Verificar variables de contexto

## Recursos adicionales

- [Documentación oficial de Botpress](https://botpress.com/docs)
- [Referencia de API de Botpress](https://botpress.com/docs/api-reference)
- [Foro de la comunidad](https://forum.botpress.com)
- [Ejemplos de integración](https://github.com/botpress/botpress/tree/master/examples)

## Contacto y soporte

Para soporte específico sobre esta integración:

- Email: soporte@hosthelper.com
- Canal de Slack: #botpress-integration
- Documentación interna: [Wiki de integración](https://wiki.hosthelper.internal/botpress)

---

Este documento se actualiza periódicamente para reflejar los cambios en la integración y las mejores prácticas. Última actualización: 15/03/2024. 