# Cómo Configurar el Token de Lynx en Supabase

## ✅ Token Original (Sin Base64)

El token debe configurarse **tal cual** como lo proporciona Lynx:

```
3AI7-9c2.c\pW!NFR&m7]N2:"DZ=\HI<P}F
```

## 📝 Pasos para Configurar en Supabase

### Opción 1: Dashboard de Supabase (Recomendado)

1. Ve a [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. **Settings** → **Edge Functions** → **Secrets**
4. Haz clic en **"Add a new secret"**
5. Configura:
   - **Name:** `LYNX_PARTNERS_API_TOKEN`
   - **Value:** Pega exactamente: `3AI7-9c2.c\pW!NFR&m7]N2:"DZ=\HI<P}F`
6. Guarda

### Opción 2: CLI de Supabase

Si Supabase escapa automáticamente los caracteres, el token llegará escapado a la función.
**Esto es lo que queremos** - que los backslashes lleguen literales.

## ⚠️ Importante

- **NO uses Base64** - el token debe estar en su formato original
- **NO agregues comillas** alrededor del token
- El token **NO está hardcodeado** - se lee desde la variable de entorno `LYNX_PARTNERS_API_TOKEN`
- Los backslashes (`\`) y comillas (`"`) son **parte del token**

## 🔍 Verificación

Después de configurar, en los logs de la Edge Function deberías ver:

```
✅ Token configurado: 45 chars
```

Si ves un número diferente de caracteres, el token no se configuró correctamente.

## 📂 Archivos que Usan el Token

- `supabase/functions/lynx-register-lodging/index.ts`
- `supabase/functions/_shared/lynxCheckinService.ts` (usado por otras funciones)

Todos leen el token desde `Deno.env.get('LYNX_PARTNERS_API_TOKEN')` - **ninguno lo tiene hardcodeado**.

## 🚀 Después de Configurar

1. El secret se aplica automáticamente a todas las Edge Functions
2. No necesitas redesplegar (a menos que hayas cambiado el código)
3. Prueba registrando una propiedad
4. Verifica los logs para confirmar que el token se leyó correctamente

## 🆘 Solución de Problemas

### Si ves "Token vacío" en los logs:
- El secret no está configurado o tiene nombre incorrecto
- Debe llamarse exactamente: `LYNX_PARTNERS_API_TOKEN`

### Si ves "35 chars" en lugar de "45 chars":
- El token se pegó incompleto
- Verifica que el valor en Supabase sea exactamente el token completo

### Si ves "Unauthorized" de Lynx:
- Contacta al proveedor de Lynx para verificar que el token es correcto
- Confirma que el token no ha expirado




