# Guía de Pruebas - Sistema Check-in SES

## 🧪 Cómo Probar el Sistema Completo

### URL de Acceso

Accede con el nombre de cualquier propiedad:

```
http://localhost:4000/check-in/Doña%20Carlota
```

Otros ejemplos válidos:
```
http://localhost:4000/check-in/Villa-Marbella
http://localhost:4000/check-in/Apartamento-Centro
http://localhost:4000/check-in/Casa-Rural-El-Olivar
```

### Paso 1: Verificar Carga Inicial ✅

Al acceder, deberías ver:
- ✅ Logo de Host Helper (grande)
- ✅ Timer de 24 horas funcionando
- ✅ Nombre de la propiedad: "Doña Carlota" (o el que pusiste en URL)
- ✅ Fechas por defecto: Hoy y mañana
- ✅ 1 noche calculada automáticamente
- ✅ Número de viajeros: 1
- ✅ Método de pago: "Pago en Destino"
- ✅ Lista de viajeros vacía
- ✅ Botón "Enviar Check-in" deshabilitado (gris)

### Paso 2: Editar Datos de Reserva ✅

1. Click en **"Editar"** (botón naranja al lado de "Datos")
2. Se abre modal con formulario
3. Cambiar **fecha de entrada**: Elige una fecha futura
4. Cambiar **fecha de salida**: Elige fecha posterior a la entrada
5. Verifica que se calcula automáticamente el número de **noches**
6. Cambiar **número de viajeros**: Prueba con 2, 3, 4...
7. Cambiar **método de pago**: Prueba "Pago Online", "Transferencia", etc.
8. Click **"Guardar"**
9. ✅ Toast verde: "Datos de reserva actualizados"
10. ✅ Los datos se actualizan en la pantalla principal

### Paso 3: Añadir Primer Viajero ✅

1. Click en **"+ Añadir"**
2. Se abre modal con wizard
3. Verifica barra de progreso (paso 1 de 4)

#### Paso 1/4: Información Personal
- Nombre: "Juan"
- Primer Apellido: "García"
- Segundo Apellido: "López" (opcional)
- Nacionalidad: Buscar "España" o seleccionar con bandera 🇪🇸
- Sexo: Seleccionar "Hombre"
- Click **"Siguiente"**

#### Paso 2/4: País de Residencia
- Buscar "España" en el selector
- Seleccionar España 🇪🇸
- Click **"Siguiente"**

#### Paso 3/4: Dirección
- Ciudad: "Madrid"
- Código Postal: "28001"
- Dirección: "Calle Gran Vía 123"
- Info Adicional: "Piso 3B" (opcional)
- Click **"Siguiente"**

#### Paso 4/4: Contacto
- Email: "juan.garcia@example.com"
- Teléfono: 
  - País: España (+34)
  - Número: "612345678"
- Teléfono Alternativo (opcional): Dejar vacío
- Click **"Enviar"**

### Paso 4: Verificar Viajero Añadido ✅

Deberías ver:
- ✅ Toast verde: "Viajero añadido correctamente"
- ✅ Card del viajero con:
  - Nombre completo: "Juan García López"
  - Bandera y nacionalidad: 🇪🇸 España
  - Email: juan.garcia@example.com
  - Teléfono: 🇪🇸 +34 612345678
  - Residencia: 🇪🇸 Madrid, España
  - Botones: Editar ✏️ y Eliminar 🗑️
- ✅ Contador: "Viajeros (1)"

### Paso 5: Añadir Segundo Viajero ✅

1. Click en **"+ Añadir"** de nuevo
2. Rellenar datos diferentes:
   - Nombre: "María"
   - Apellidos: "Rodríguez Sánchez"
   - Nacionalidad: Francia 🇫🇷
   - Sexo: Mujer
   - Residencia: Francia
   - Ciudad: "París"
   - Código: "75001"
   - Dirección: "Rue de Rivoli 45"
   - Email: "maria@example.fr"
   - Teléfono: +33 612345678
3. Click **"Enviar"**
4. ✅ Ahora hay 2 viajeros en la lista

### Paso 6: Editar un Viajero ✅

1. Click en botón **"Editar" ✏️** del primer viajero
2. Modal se abre con datos pre-cargados
3. Cambiar email a: "juan.nuevo@example.com"
4. Navegar pasos con "Siguiente"
5. En el último paso, click **"Enviar"**
6. ✅ Toast: "Viajero actualizado correctamente"
7. ✅ Email actualizado en la card

### Paso 7: Eliminar un Viajero ✅

1. Click en botón **"Eliminar" 🗑️** del segundo viajero
2. Aparece confirmación: "¿Está seguro de que desea eliminar este viajero?"
3. Click **"Aceptar"**
4. ✅ Toast: "Viajero eliminado correctamente"
5. ✅ Contador vuelve a "Viajeros (1)"

### Paso 8: Validaciones ✅

#### Validación de Viajeros Requeridos
1. Si hay 0 viajeros:
   - ✅ Botón "Enviar Check-in" está **deshabilitado** (gris)
   - Al hacer click: Toast rojo con error

#### Validación en Wizard
1. En paso 1, dejar campos vacíos y click "Siguiente"
   - ✅ Mensajes de error rojos bajo cada campo
2. En paso 4, poner email inválido "test@"
   - ✅ Error: "Por favor, ingrese un email válido"

#### Validación de Fechas
1. En editar reserva, poner fecha salida anterior a entrada
   - ✅ Error: "La fecha de salida debe ser posterior a la de entrada"

### Paso 9: Enviar Check-in ✅

Con al menos 1 viajero añadido:
1. Click en **"Enviar Check-in"** (botón grande naranja)
2. ✅ Toast verde: "Check-in completado exitosamente"
3. ✅ Console log con todos los datos de la reserva

### Paso 10: Responsive Testing 📱

#### Desktop (>1024px)
- ✅ Modal wizard centrado, ancho máximo ~800px
- ✅ 2 columnas en datos de reserva

#### Tablet (640px - 1024px)
- ✅ Modal wizard más ancho
- ✅ Diseño adaptativo

#### Mobile (<640px)
- ✅ Modal wizard pantalla completa
- ✅ 1 columna en datos de reserva
- ✅ Inputs grandes y fáciles de tocar
- ✅ Botones mínimo 44px altura

### Paso 11: Testing Multi-idioma 🌐

1. Cambiar idioma del navegador a inglés
2. Recargar página
3. ✅ Todos los textos en inglés
4. ✅ Nombres de países en inglés
5. Volver a español
6. ✅ Todo vuelve a español

## 🎨 Verificaciones Visuales

### Paleta de Colores
- ✅ Naranja primario: `#ECA408` en botones, enlaces, timer
- ✅ Fondos blancos y plateados claros
- ✅ Progress bar naranja en wizard

### Interacciones
- ✅ Hover en botones cambia color
- ✅ Focus en inputs muestra anillo naranja
- ✅ Transiciones suaves
- ✅ Selectors de país con scroll

### Iconos
- ✅ Banderas en selectores de país
- ✅ Iconos de calendario, teléfono, email
- ✅ Icons de editar y eliminar

## 🐛 Casos de Error a Probar

### 1. Enlace Expirado
- Cambiar el timer para que sea 0
- ✅ Muestra pantalla de "Enlace expirado"

### 2. Nombre Propiedad Inválido
- Acceder a `/check-in/`
- ✅ Manejo gracioso del error

### 3. Caracteres Especiales en URL
- Probar: `/check-in/Doña%20Carlota%20-%20Piso%201A`
- ✅ Se decodifica correctamente

## ✅ Checklist Final

- [ ] Logo visible y del tamaño correcto
- [ ] Timer funcionando (countdown)
- [ ] Editar datos de reserva funciona
- [ ] Añadir viajero (wizard 4 pasos) funciona
- [ ] Editar viajero existente funciona
- [ ] Eliminar viajero con confirmación
- [ ] Selector de países con búsqueda
- [ ] Input de teléfono con código país
- [ ] Validaciones en todos los pasos
- [ ] Botón enviar deshabilitado sin viajeros
- [ ] Toast notifications funcionan
- [ ] Responsive en móvil
- [ ] Traducciones ES/EN
- [ ] Sin errores en consola
- [ ] Sin warnings de React

## 📊 Datos de Prueba Sugeridos

### Viajero 1 (España)
```
Nombre: Juan
Apellidos: García López
Nacionalidad: España
Sexo: Hombre
Residencia: España
Ciudad: Madrid
CP: 28001
Dirección: Calle Gran Vía 123
Email: juan@example.com
Teléfono: +34 612345678
```

### Viajero 2 (Francia)
```
Nombre: Marie
Apellidos: Dupont Blanc
Nacionalidad: Francia
Sexo: Mujer
Residencia: Francia
Ciudad: Paris
CP: 75001
Dirección: Rue de Rivoli 45
Email: marie@example.fr
Teléfono: +33 612345678
```

### Viajero 3 (USA)
```
Nombre: John
Apellidos: Smith
Nacionalidad: Estados Unidos
Sexo: Hombre
Residencia: Estados Unidos
Ciudad: New York
CP: 10001
Dirección: 5th Avenue 123
Email: john@example.com
Teléfono: +1 5551234567
```

---

**Última actualización**: Octubre 2025


































