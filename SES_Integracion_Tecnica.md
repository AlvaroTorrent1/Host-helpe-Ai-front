# Documento Técnico de Implementación: Integración con Sistema de Entrada de Seguridad (SES)

## 1. Introducción

Este documento técnico detalla los requisitos y pasos necesarios para implementar la integración con el Sistema de Entrada de Seguridad (SES) del Ministerio del Interior de España, en cumplimiento del Real Decreto 933/2021, de 26 de octubre, que establece obligaciones de registro documental e información para establecimientos de hospedaje.

## 2. Marco Legal

### 2.1 Base Normativa

- **Real Decreto 933/2021, de 26 de octubre**: Establece las obligaciones de registro documental e información de personas físicas o jurídicas que ejercen actividades de hospedaje y alquiler de vehículos a motor.
- **Ley Orgánica 4/2015, de 30 de marzo**, de protección de la seguridad ciudadana, artículo 25.1.
- **Normativa RGPD**: Reglamento General de Protección de Datos de la UE para el tratamiento de datos personales.

### 2.2 Plazos de Implementación

- Entrada en vigor: 27 de abril de 2022
- Obligaciones de comunicación: A partir del 2 de enero de 2023

## 3. Modalidades de Integración

### 3.1 Usuario para Servicio Web (Recomendado)

Para establecimientos con volumen elevado de operaciones o que buscan automatizar completamente el proceso de registro.

#### Características:
- Conexión API mediante servicio web con seguridad HTTPS
- Autenticación básica mediante token
- Datos enviados en formato XML comprimidos y codificados en Base64
- Validaciones automatizadas con retroalimentación en tiempo real

### 3.2 Usuario para Introducción Manual

Para pequeños establecimientos con bajo volumen de operaciones.

#### Características:
- Acceso web a través de la Sede Electrónica
- Interfaz de usuario con formularios para entrada manual
- No requiere conocimientos técnicos avanzados

## 4. Especificaciones Técnicas de la API

### 4.1 Requisitos Previos

- Programa de Gestión Hotelera (PMS) compatible con integraciones API
- Certificado digital y credenciales de acceso al sistema SES
- Equipo técnico o proveedor de software para implementar la integración

### 4.2 Autenticación y Seguridad

- Protocolo: HTTPS
- Autenticación: Básica con token
- Certificados digitales: Obligatorios para la comunicación segura

### 4.3 Formato de Datos

- Formato: XML
- Codificación: Base64
- Compresión: Requerida para optimizar la transmisión

### 4.4 Endpoints Principales

- Alta de comunicaciones (partes de viajeros, reservas)
- Consulta de lotes y comunicaciones
- Anulación de comunicaciones

### 4.5 Flujo de Integración

1. Solicitud de acceso al API
2. Implementación de endpoints en el PMS
3. Configuración del formato XML requerido
4. Pruebas en entorno sandbox
5. Activación en producción

## 5. Datos Requeridos para Comunicación

### 5.1 Datos del Establecimiento

- Nombre o razón social
- CIF/NIF
- Ubicación (municipio, provincia)
- Información de contacto (teléfono, email)
- Tipo de establecimiento
- Dirección completa

### 5.2 Datos de Viajeros (Obligatorios)

- Nombre completo
- Documento de identidad (tipo, número, soporte)
- Nacionalidad
- Fecha de nacimiento
- Dirección de residencia habitual
- Datos de contacto
- Relación de parentesco (en caso de menores)

### 5.3 Datos de la Transacción

- Información del contrato (número, fecha)
- Fechas de entrada y salida
- Información del inmueble
- Datos del método de pago

## 6. Protocolo de Comunicación

### 6.1 Registro Previo al Inicio de la Actividad

- Comunicación de datos del establecimiento
- Plazo: 10 días desde la tramitación administrativa o antes del inicio de actividad

### 6.2 Comunicaciones Operativas

- Plazo máximo: 24 horas desde la formalización de la reserva/contrato o inicio del servicio
- Método: Telemático obligatorio (excepto hospedaje no profesional)

### 6.3 Conservación de Datos

- Plazo de conservación: 3 años desde la finalización del servicio
- Formato: Registro informático según especificaciones oficiales

## 7. Implementación en la Aplicación Host Helper

### 7.1 Análisis de Requisitos

- Integración con el modelo de datos existente
- Adaptación de los formularios de registro de huéspedes
- Desarrollo de módulo específico para comunicación con SES

### 7.2 Plan de Desarrollo

1. Diseño de estructura de datos compatible
2. Implementación de funciones de comunicación API
3. Desarrollo de interfaz de gestión y monitorización
4. Implementación de validaciones previas al envío
5. Sistema de logs y gestión de errores

### 7.3 Pruebas y Validación

- Test unitarios para cada componente
- Pruebas de integración con el entorno de sandbox
- Validación de escenarios de error y recuperación

## 8. Consideraciones de Seguridad y RGPD

### 8.1 Seguridad de los Datos

- Cifrado en tránsito: HTTPS obligatorio
- Cifrado en almacenamiento: Datos sensibles deben estar cifrados
- Control de acceso: Acceso restringido basado en roles

### 8.2 Cumplimiento RGPD

- Información al viajero sobre el tratamiento de datos
- Base legal: Cumplimiento de obligación legal
- Derechos ARCO: Implementación de procedimientos para atender solicitudes

### 8.3 Auditoría y Trazabilidad

- Registro de todas las comunicaciones realizadas
- Trazabilidad completa de modificaciones y anulaciones
- Sistema de alertas para fallos en las comunicaciones

## 9. Soporte y Mantenimiento

### 9.1 Procedimientos ante Incidencias

- Protocolo de comunicación con soporte técnico del Ministerio
- Procedimientos de contingencia ante fallos del sistema

### 9.2 Actualizaciones y Adaptaciones

- Monitorización de cambios normativos
- Plan de actualización para adaptarse a modificaciones del API

## 10. Referencias y Contactos

### 10.1 Documentación Oficial

- Portal oficial SES Hospedajes del Ministerio del Interior
- Documentación técnica de la API (solicitar acceso)

### 10.2 Soporte Técnico

- Contacto técnico Ministerio del Interior
- Proveedores homologados para integración SES 