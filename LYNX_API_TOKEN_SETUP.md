# Configuración del Token API de Lynx

## Cambio en la API de Lynx (Noviembre 2025)

El proveedor Lynx ha actualizado su API de Partners para requerir autenticación mediante un token API.

## Token Proporcionado

```
X-PARTNERS-API-TOKEN: 3AI7-9c2.c\pW!NFR&m7]N2:"DZ=\HI<P}F
```

## Cómo Configurar el Token en Supabase

### Opción 1: Usando Supabase CLI (Recomendado)

```bash
# Configurar el secret en Supabase
supabase secrets set LYNX_PARTNERS_API_TOKEN="3AI7-9c2.c\pW!NFR&m7]N2:\"DZ=\HI<P}F"
```

**Nota:** Los caracteres especiales están escapados correctamente para bash.

### Opción 2: Usando el Dashboard de Supabase

1. Ve a tu proyecto en [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Navega a **Settings** → **Edge Functions** → **Secrets**
3. Haz clic en **Add a new secret**
4. Ingresa:
   - **Name:** `LYNX_PARTNERS_API_TOKEN`
   - **Value:** `3AI7-9c2.c\pW!NFR&m7]N2:"DZ=\HI<P}F`
5. Haz clic en **Save**

## Verificar la Configuración

Después de configurar el secret, puedes verificarlo llamando a cualquier Edge Function que use Lynx:

```bash
# Test con lynx-list-lodgings
curl -X POST https://your-project.supabase.co/functions/v1/lynx-list-lodgings \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Si el token está configurado correctamente, deberías recibir una respuesta exitosa de la API de Lynx.

## Edge Functions Afectadas

Los siguientes Edge Functions ahora usan el nuevo header de autenticación:

1. **lynx-list-lodgings** - Lista alojamientos registrados
2. **find-ses-property** - Busca propiedades en SES
3. **test-lynx-submission** - Prueba el envío de partes
4. **submit-traveler-form** - Envía formularios de viajeros
5. **lynx-register-lodging** - Registra nuevos alojamientos

## Cambios Técnicos Implementados

### Archivo Modificado: `supabase/functions/_shared/lynxCheckinService.ts`

1. **Nueva constante para el token:**
   ```typescript
   const LYNX_API_TOKEN = Deno.env.get('LYNX_PARTNERS_API_TOKEN') || '';
   ```

2. **Header agregado a todas las llamadas fetch:**
   ```typescript
   headers: {
     'Content-Type': 'application/json',
     'X-PARTNERS-API-TOKEN': LYNX_API_TOKEN,
   }
   ```

3. **Funciones actualizadas:**
   - `listLodgings()` - línea 103
   - `submitTravelerData()` - línea 155
   - `registerLodging()` - línea 415

## Solución de Problemas

### Error: "Unauthorized" o "Invalid API Token"

**Causa:** El secret no está configurado o tiene un valor incorrecto.

**Solución:** Verifica que el secret `LYNX_PARTNERS_API_TOKEN` esté configurado correctamente en Supabase Secrets.

### Error: "LYNX_PARTNERS_API_TOKEN is not defined"

**Causa:** El secret no ha sido desplegado a las Edge Functions.

**Solución:** 
1. Reconfigura el secret usando `supabase secrets set`
2. Redespliega las Edge Functions:
   ```bash
   supabase functions deploy --no-verify-jwt
   ```

### Las llamadas siguen fallando después de configurar el token

**Posibles causas:**
1. El token puede haber expirado o cambiado
2. Hay caracteres especiales mal escapados
3. El proveedor Lynx puede requerir pasos adicionales

**Solución:** Contacta con el equipo de soporte de Lynx para verificar el estado del token.

## Contacto con Lynx

Si tienes problemas con el token o necesitas regenerarlo:

- **Email soporte:** (contactar con el proveedor)
- **Documentación API:** https://vlmfxh4pka.execute-api.eu-south-2.amazonaws.com/partners-api/v1

## Seguridad

⚠️ **IMPORTANTE:**
- **NUNCA** compartas este token públicamente
- **NUNCA** lo commits en el repositorio Git
- **SOLO** lo configures como secret en Supabase
- Trata este token como una contraseña

## Fecha de Cambio

**Fecha:** 5 de Noviembre, 2025  
**Implementado por:** Assistant  
**Razón:** Actualización de seguridad de la API de Lynx Partners

