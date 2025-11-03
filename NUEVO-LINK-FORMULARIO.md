# 🔗 NUEVO LINK DEL FORMULARIO DE VIAJEROS

## ✅ Nueva Reserva Creada

### 📋 Datos de la Reserva

| Campo | Valor |
|-------|-------|
| **Reserva ID** | 83 |
| **Reserva UUID** | 62a67859-6659-4063-b74c-0ee827ca604f |
| **Propiedad** | Cabaña Mirlo Blanco |
| **Huésped** | Ana Martínez García |
| **Teléfono** | +34655444333 |
| **Email** | ana.martinez.test@example.com |
| **Check-in** | 2025-11-05 |
| **Check-out** | 2025-11-08 |
| **Estado** | active |

### 🎫 Datos del Form Request

| Campo | Valor |
|-------|-------|
| **Form Request ID** | 7869a3a3-911a-4d49-82d0-00f76fb56d70 |
| **Token** | adac3467-8b28-4b8c-bb4e-8a94ec8fef6a |
| **Estado** | pending |
| **Expira** | 2025-12-03 |

---

## 🌐 LINK DEL FORMULARIO

### ⭐ LINK CORRECTO (puerto 5173 - Vite):

```
http://localhost:5173/check-in/adac3467-8b28-4b8c-bb4e-8a94ec8fef6a
```

### 📋 COPIA Y PEGA EN TU NAVEGADOR:

**Localhost:**
```
http://localhost:5173/check-in/adac3467-8b28-4b8c-bb4e-8a94ec8fef6a
```

**Para compartir (Producción):**
```
https://[TU-DOMINIO]/check-in/adac3467-8b28-4b8c-bb4e-8a94ec8fef6a
```

---

## 🚀 Pasos para Probar

### 1. Verificar que el servidor esté corriendo

El servidor de desarrollo debería estar corriendo en `http://localhost:5173`

Si no está corriendo, ejecuta:
```bash
cd c:\Users\Usuario\Desktop\nuevo-repo
npm run dev
```

### 2. Abrir el link del formulario

Copia y pega en tu navegador:
```
http://localhost:5173/check-in/adac3467-8b28-4b8c-bb4e-8a94ec8fef6a
```

### 3. Completar el formulario

Verás el formulario de check-in con:
- Información de la reserva (Cabaña Mirlo Blanco, fechas, etc.)
- Formulario para agregar viajeros
- Opción para firmar digitalmente

### 4. Campos importantes a completar

Especialmente para direcciones en **España**:
- **Código INE**: Ahora se guarda correctamente (ej: 29067 para Málaga)
- **Ciudad**
- **Código postal**
- **Dirección completa**

### 5. Después de enviar el formulario

Una vez completado, puedes enviar el parte a Lynx usando:
```
http://localhost:4000/test-lynx-envio.html
```

O directamente con curl:
```bash
curl -X POST \
  https://blxngmtmknkdmikaflen.supabase.co/functions/v1/test-lynx-submission \
  -H "Content-Type: application/json" \
  -d '{"formRequestId":"7869a3a3-911a-4d49-82d0-00f76fb56d70"}'
```

---

## 🔍 Verificar en Base de Datos

### Ver el traveler_form_request:
```sql
SELECT * FROM traveler_form_requests
WHERE id = '7869a3a3-911a-4d49-82d0-00f76fb56d70';
```

### Ver los datos del viajero (después de completar el formulario):
```sql
SELECT * FROM traveler_form_data
WHERE form_request_id = '7869a3a3-911a-4d49-82d0-00f76fb56d70';
```

---

## ⚠️ Diferencia de Puertos

- **Puerto 4000**: Servidor HTTP simple (Python) para la página de prueba HTML
- **Puerto 5173**: Servidor de desarrollo Vite (React) - ESTE ES EL CORRECTO

El error que viste era porque estabas usando el puerto 4000 en lugar del 5173.

---

## 📝 Notas

- ✅ El código INE ahora se captura y guarda correctamente
- ✅ La reserva está activa y lista
- ✅ El token expira el 2025-12-03
- ✅ El formulario está en español

---

**Fecha de creación**: 2025-11-03  
**Reserva ID**: 83  
**Token**: adac3467-8b28-4b8c-bb4e-8a94ec8fef6a  
**Estado**: ✅ Listo para usar

