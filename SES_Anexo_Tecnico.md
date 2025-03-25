# Anexo Técnico: Integración con Sistema de Entrada de Seguridad (SES)

## 1. Estructura del XML para Comunicaciones

A continuación se muestran ejemplos de la estructura XML requerida para los diferentes tipos de comunicaciones con el sistema SES.

### 1.1 Ejemplo de XML para Parte de Entrada de Viajero

```xml
<?xml version="1.0" encoding="UTF-8"?>
<comunicaciones xmlns="http://www.mir.es/schemas/ses/comunicaciones">
  <comunicacion>
    <establecimiento>
      <codigo>12345678X</codigo>
      <tipo>H</tipo>
    </establecimiento>
    <viajero>
      <documentacion>
        <tipo>D</tipo>
        <numero>12345678A</numero>
        <soporte>123456789</soporte>
        <expedicion>ESP</expedicion>
      </documentacion>
      <apellido1>GARCIA</apellido1>
      <apellido2>GOMEZ</apellido2>
      <nombre>JUAN</nombre>
      <sexo>M</sexo>
      <nacionalidad>ESP</nacionalidad>
      <fechaNacimiento>1980-01-01</fechaNacimiento>
      <direccion>
        <calle>GRAN VIA</calle>
        <numero>1</numero>
        <localidad>MADRID</localidad>
        <pais>ESP</pais>
      </direccion>
      <contacto>
        <telefono>600000000</telefono>
        <email>ejemplo@correo.com</email>
      </contacto>
    </viajero>
    <estancia>
      <fechaEntrada>2023-01-01T12:00:00</fechaEntrada>
      <fechaSalida>2023-01-05T10:00:00</fechaSalida>
      <habitacion>101</habitacion>
    </estancia>
  </comunicacion>
</comunicaciones>
```

### 1.2 Ejemplo de XML para Reserva

```xml
<?xml version="1.0" encoding="UTF-8"?>
<comunicaciones xmlns="http://www.mir.es/schemas/ses/comunicaciones">
  <comunicacion>
    <establecimiento>
      <codigo>12345678X</codigo>
      <tipo>H</tipo>
    </establecimiento>
    <reserva>
      <referencia>RES12345</referencia>
      <fechaEntrada>2023-03-15T14:00:00</fechaEntrada>
      <fechaSalida>2023-03-20T11:00:00</fechaSalida>
      <titular>
        <documentacion>
          <tipo>P</tipo>
          <numero>XYZ123456</numero>
          <expedicion>FRA</expedicion>
        </documentacion>
        <apellido1>SMITH</apellido1>
        <nombre>JOHN</nombre>
        <sexo>M</sexo>
        <nacionalidad>GBR</nacionalidad>
        <fechaNacimiento>1975-06-15</fechaNacimiento>
        <contacto>
          <telefono>+44123456789</telefono>
          <email>john.smith@email.com</email>
        </contacto>
      </titular>
      <pago>
        <tipo>T</tipo>
        <tarjeta>
          <tipo>V</tipo>
          <numero>4111XXXXXXXX1111</numero>
          <caducidad>2025-12</caducidad>
          <titular>JOHN SMITH</titular>
        </tarjeta>
      </pago>
    </reserva>
  </comunicacion>
</comunicaciones>
```

### 1.3 Ejemplo de XML para Anulación

```xml
<?xml version="1.0" encoding="UTF-8"?>
<comunicaciones xmlns="http://www.mir.es/schemas/ses/comunicaciones">
  <anulacion>
    <establecimiento>
      <codigo>12345678X</codigo>
      <tipo>H</tipo>
    </establecimiento>
    <referencia>RES12345</referencia>
    <motivo>Cancelación por cliente</motivo>
  </anulacion>
</comunicaciones>
```

## 2. Códigos de Referencia

### 2.1 Tipos de Documentos

| Código | Tipo de Documento |
|--------|-------------------|
| D      | DNI               |
| P      | Pasaporte         |
| C      | Permiso de Conducir |
| N      | Permiso de Residencia Español |
| X      | Permiso de Residencia UE |
| T      | Tarjeta de Identidad de Extranjero |
| O      | Otros             |

### 2.2 Códigos de Países (ISO 3166-1 alpha-3)

| Código | País              |
|--------|-------------------|
| ESP    | España            |
| FRA    | Francia           |
| DEU    | Alemania          |
| GBR    | Reino Unido       |
| ITA    | Italia            |
| PRT    | Portugal          |
| USA    | Estados Unidos    |
| ...    | ...               |

### 2.3 Tipos de Alojamiento

| Código | Tipo de Alojamiento |
|--------|--------------------|
| H      | Hotel              |
| A      | Apartamento        |
| C      | Camping            |
| R      | Alojamiento Rural  |
| V      | Vivienda Vacacional |
| P      | Pensión            |
| O      | Otros              |

### 2.4 Tipos de Pago

| Código | Tipo de Pago      |
|--------|-------------------|
| T      | Tarjeta de Crédito |
| E      | Efectivo          |
| B      | Transferencia Bancaria |
| P      | Plataforma de Pago |
| O      | Otros             |

## 3. Manejo de Errores y Códigos de Respuesta

### 3.1 Estructura de Respuesta

```xml
<?xml version="1.0" encoding="UTF-8"?>
<respuesta xmlns="http://www.mir.es/schemas/ses/respuesta">
  <identificador>ABC123456789</identificador>
  <fechaRespuesta>2023-01-01T12:30:45</fechaRespuesta>
  <estado>
    <codigo>200</codigo>
    <descripcion>Comunicación procesada correctamente</descripcion>
  </estado>
  <detalles>
    <referencia>RES12345</referencia>
    <tipo>COMUNICACION</tipo>
  </detalles>
</respuesta>
```

### 3.2 Códigos de Estado Comunes

| Código | Descripción        | Acción Recomendada |
|--------|--------------------|--------------------|
| 200    | Comunicación procesada correctamente | Ninguna acción requerida |
| 400    | Error en formato de datos | Verificar la estructura XML y los datos enviados |
| 401    | Error de autenticación | Comprobar credenciales |
| 403    | Acceso denegado | Verificar permisos y tipo de usuario |
| 404    | Recurso no encontrado | Verificar identificadores y referencias |
| 409    | Conflicto de datos | Verificar si existe duplicidad o inconsistencia |
| 500    | Error interno del servidor | Contactar con soporte técnico |

## 4. Implementación de Cliente API

### 4.1 Pseudocódigo para Envío de Comunicación

```javascript
// Ejemplo de implementación en pseudocódigo
function enviarComunicacionSES(datos) {
  // 1. Generar el XML según estructura requerida
  const xmlData = generarXML(datos);
  
  // 2. Codificar en Base64
  const base64Data = btoa(xmlData);
  
  // 3. Comprimir datos (opcional pero recomendado)
  const compressedData = comprimirDatos(base64Data);
  
  // 4. Configurar cabeceras de autenticación
  const headers = {
    'Authorization': 'Basic ' + btoa(username + ':' + password),
    'Content-Type': 'application/xml',
    'Accept': 'application/xml'
  };
  
  // 5. Enviar petición al endpoint
  const response = fetch('https://seshospedajes.es/api/comunicacion', {
    method: 'POST',
    headers: headers,
    body: compressedData
  });
  
  // 6. Procesar respuesta
  if (response.status === 200) {
    const responseData = await response.text();
    const resultado = procesarRespuestaXML(responseData);
    return {
      success: true,
      referencia: resultado.referencia,
      mensaje: resultado.descripcion
    };
  } else {
    return {
      success: false,
      codigo: response.status,
      mensaje: await response.text()
    };
  }
}
```

### 4.2 Manejo de Reintentos y Recuperación

```javascript
async function enviarConReintentos(datos, maxIntentos = 3) {
  let intento = 0;
  let resultado = null;
  
  while (intento < maxIntentos) {
    try {
      resultado = await enviarComunicacionSES(datos);
      
      if (resultado.success) {
        // Comunicación exitosa
        return resultado;
      } else if (esErrorRecuperable(resultado.codigo)) {
        // Esperar antes del siguiente intento (backoff exponencial)
        await esperar(Math.pow(2, intento) * 1000);
        intento++;
      } else {
        // Error no recuperable
        return resultado;
      }
    } catch (error) {
      // Error de conexión o inesperado
      console.error(`Intento ${intento + 1} fallido: ${error.message}`);
      await esperar(Math.pow(2, intento) * 1000);
      intento++;
    }
  }
  
  return {
    success: false,
    codigo: 'MAX_INTENTOS',
    mensaje: 'Se alcanzó el número máximo de intentos sin éxito'
  };
}

function esErrorRecuperable(codigo) {
  // Códigos de error que pueden resolverse con un reintento
  return [500, 502, 503, 504].includes(codigo);
}

function esperar(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

## 5. Pruebas y Validación

### 5.1 Lista de Verificación para Testing

- [ ] Verificar formato XML correcto
- [ ] Prueba de comunicación de viajero individual
- [ ] Prueba de comunicación de grupo familiar
- [ ] Prueba de modificación de reserva
- [ ] Prueba de anulación de reserva
- [ ] Prueba de recuperación ante errores de red
- [ ] Verificación de flujo completo (reserva → check-in → check-out)
- [ ] Validación de mensajes de error y manejo de excepciones

### 5.2 Herramientas Recomendadas

- **Validadores XML**: XMLSpy, XML Validator
- **Herramientas de Testing API**: Postman, Insomnia
- **Monitorización**: Grafana, Prometheus
- **Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)

## 6. Consideraciones para Desarrollo

- Implementar caché local para comunicaciones pendientes en caso de fallo de conexión
- Establecer un sistema de notificaciones para comunicaciones fallidas
- Crear un panel de administración para monitorizar el estado de las comunicaciones
- Implementar validación de datos antes del envío para reducir errores
- Mantener un registro detallado de todas las comunicaciones para auditoría

## 7. Recomendaciones de Seguridad

- No almacenar datos de tarjetas de crédito completos, utilizar tokenización
- Implementar cifrado en tránsito y reposo para todos los datos personales
- Establecer política de rotación de credenciales de acceso
- Auditar regularmente los logs de acceso y comunicación
- Implementar mecanismos de detección de accesos no autorizados 