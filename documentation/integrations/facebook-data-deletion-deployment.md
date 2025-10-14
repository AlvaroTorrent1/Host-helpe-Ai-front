# Guía de Despliegue: Sistema de Eliminación de Datos Meta/Facebook

## 📋 **INFORMACIÓN DEL PROYECTO**

- **URL de Supabase**: `https://blxngmtmknkdmikaflen.supabase.co`
- **Proyecto ID**: `blxngmtmknkdmikaflen`

## 🚀 **PASOS DE DESPLIEGUE**

### **PASO 1: Configurar Facebook App Secret**

```bash
npx supabase@latest secrets set FACEBOOK_APP_SECRET=tu_app_secret_aqui
```

**Donde obtener el App Secret:**
- Ve a tu Facebook App Dashboard
- En la imagen que mostraste, es el valor oculto con puntos: `••••••••`
- Copia ese valor y úsalo en el comando

### **PASO 2: Aplicar Migración de Base de Datos**

```bash
npx supabase@latest db push
```

### **PASO 3: Desplegar Edge Functions**

```bash
# Desplegar función de callback
npx supabase@latest functions deploy data-deletion-callback

# Desplegar función de status
npx supabase@latest functions deploy deletion-status
```

### **PASO 4: Obtener URL para Meta**

Una vez desplegado, la URL correcta para configurar en Meta será:

```
https://blxngmtmknkdmikaflen.supabase.co/functions/v1/data-deletion-callback
```

### **PASO 5: Probar el Endpoint**

```bash
curl -X POST https://blxngmtmknkdmikaflen.supabase.co/functions/v1/data-deletion-callback \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "signed_request=test"
```

**Respuesta esperada:**
```json
{
  "error": "Missing signed_request parameter"
}
```
(Esto es normal sin un signed request válido)

### **PASO 6: Configurar en Meta Dashboard**

1. Ve a tu Facebook App Dashboard
2. En "Eliminación de datos de usuario"
3. Cambia la URL de:
   ```
   https://www.hosthelperai.com/data-deletion
   ```
   
   A:
   ```
   https://blxngmtmknkdmikaflen.supabase.co/functions/v1/data-deletion-callback
   ```

4. Guarda la configuración

## 🧪 **TESTING**

### **Probar Página de Status**

Ve a: `https://www.hosthelperai.com/deletion-status`

Introduce cualquier código como: `DEL-2025-TEST123` para probar la interfaz.

### **Probar Callback Completo**

1. Configura `VITE_FACEBOOK_APP_ID` en tu .env
2. Usa el componente `FacebookLoginButton` 
3. Haz login y solicita eliminación
4. Verifica el código generado en la página de status

## ⚡ **COMANDO RÁPIDO PARA DESPLEGAR TODO**

```bash
# 1. Configurar secreto (reemplaza con tu App Secret real)
npx supabase@latest secrets set FACEBOOK_APP_SECRET=tu_app_secret

# 2. Aplicar migración
npx supabase@latest db push

# 3. Desplegar ambas funciones
npx supabase@latest functions deploy data-deletion-callback
npx supabase@latest functions deploy deletion-status

# 4. Verificar que funciona
curl -X POST https://blxngmtmknkdmikaflen.supabase.co/functions/v1/data-deletion-callback
```

## 🔍 **VERIFICACIÓN FINAL**

Una vez desplegado, Meta debería aceptar la URL sin errores. El sistema está completo y listo para producción.

**URLs Finales:**
- **Meta Callback**: `https://blxngmtmknkdmikaflen.supabase.co/functions/v1/data-deletion-callback`
- **Status Check**: `https://blxngmtmknkdmikaflen.supabase.co/functions/v1/deletion-status?code=CODIGO`
- **Frontend Page**: `https://www.hosthelperai.com/deletion-status` 