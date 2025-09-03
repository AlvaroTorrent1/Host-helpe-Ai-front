# Paleta de Colores - Host Helper

## Estilo Visual

Nuestra web app implementa un **estilo minimalista** basado en tres colores principales: naranja, blanco y plateado claro. Este enfoque garantiza una experiencia visual limpia, moderna y profesional.

## Colores Principales

### 🟠 Naranja Principal (ECA)
- **Hex**: `#ECA408`
- **Uso**: Color de acento, botones principales, enlaces de navegación hover, elementos destacados
- **Propósito**: Aporta calidez y dinamismo, guía la atención del usuario hacia acciones importantes

### ⚪ Blanco Base
- **Hex**: `#FFFFFF`
- **Uso**: Fondos principales, texto en elementos de acento, espacios en blanco
- **Propósito**: Base limpia que permite que el contenido respire y destaque

### 🔘 Plateado Claro
- **Hex**: `#F8F9FA` (principal)
- **Hex**: `#E9ECEF` (bordes y separadores)
- **Hex**: `#CED4DA` (elementos secundarios)
- **Uso**: Fondos alternativos, bordes sutiles, elementos de navegación secundarios, sombras suaves
- **Propósito**: Proporciona estructura y jerarquía visual sin ser intrusivo

## Escalas de Grises Complementarias

Para elementos de texto y detalles:

- **Texto Principal**: `#333333`
- **Texto Secundario**: `#6C757D`
- **Texto Claro**: `#ADB5BD`
- **Texto Oscuro**: `#212529`

## Aplicación del Estilo Minimalista

### Principios de Diseño
1. **Simplicidad**: Uso generoso del espacio en blanco
2. **Jerarquía Clara**: El naranja guía la atención, el plateado estructura
3. **Consistencia**: Paleta limitada para mantener cohesión visual
4. **Legibilidad**: Alto contraste entre texto y fondos

### Proporciones Recomendadas
- **70%** Blanco (fondos principales)
- **25%** Plateado claro (estructuras y separadores)
- **5%** Naranja (acentos y acciones)

## Variables CSS Actuales

Las variables están definidas en `src/index.css`:

```css
:root {
  --primary-color: #eca408;           /* Naranja principal */
  --background-color: #ffffff;        /* Blanco base */
  --secondary-background: #f8f9fa;    /* Plateado claro */
  --border-color: #e9ecef;           /* Plateado bordes */
  --text-color: #333333;             /* Texto principal */
}
```

## Configuración Tailwind

Los colores están configurados en `tailwind.config.js`:

```javascript
colors: {
  primary: {
    DEFAULT: '#ECA408',              // Naranja principal
    // ... escalas de naranja
  },
  gray: {
    50: '#F8F9FA',                   // Plateado muy claro
    200: '#E9ECEF',                  // Plateado bordes
    400: '#CED4DA',                  // Plateado elementos
    // ... escalas completas
  }
}
```

## Elementos de Interfaz

### Botones Principales
- **Fondo**: Blanco
- **Borde**: Naranja ECA
- **Hover**: Fondo naranja, texto blanco

### Tarjetas y Contenedores
- **Fondo**: Blanco
- **Bordes**: Plateado claro
- **Sombras**: Plateado muy sutil

### Navegación
- **Fondo**: Blanco
- **Elementos**: Plateado claro
- **Hover/Activo**: Naranja ECA

## Fechas de Actualización

- **Creado**: Diciembre 2024
- **Última actualización**: Diciembre 2024
- **Versión**: 1.0

## Notas de Implementación

Esta paleta está diseñada para:
- Transmitir profesionalismo y confianza
- Facilitar la lectura y navegación
- Mantener coherencia visual en toda la aplicación
- Ser accesible y cumplir estándares de contraste
- Proyectar modernidad con simplicidad
