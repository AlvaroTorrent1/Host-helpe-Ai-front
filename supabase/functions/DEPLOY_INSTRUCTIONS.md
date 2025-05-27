# Instrucciones para desplegar las funciones Edge de Supabase

Después de modificar las funciones Edge, necesitas desplegarlas a Supabase para que los cambios surtan efecto.

## Prerrequisitos

1. Asegúrate de tener instalada la CLI de Supabase:
   ```bash
   npm install -g supabase
   ```

2. Asegúrate de estar autenticado con Supabase:
   ```bash
   supabase login
   ```

## Desplegar la función create-payment-intent

```bash
# Navega a la carpeta raíz del proyecto
cd C:\Users\Usuario\Desktop\nuevo-repo

# Despliega la función específica
supabase functions deploy create-payment-intent --project-ref blnuemtvokdlfarlen

# Alternativamente, puedes usar la interfaz web de Supabase para desplegar la función.
# Ve a https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/functions
```

## Verificar variables de entorno

Asegúrate de que las siguientes variables de entorno estén configuradas en Supabase:

1. `STRIPE_SECRET_KEY`: Tu clave secreta de Stripe
2. `SUPABASE_URL`: URL de tu proyecto Supabase
3. `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio de Supabase

Puedes verificar y configurar estas variables en:
https://supabase.com/dashboard/project/[YOUR_PROJECT_ID]/settings/functions

## Probar la función

Después de desplegar, puedes probar la función usando Curl o Postman:

```bash
curl -X POST 'https://blnuemtvokdlfarlen.supabase.co/functions/v1/create-payment-intent' \
  -H 'Content-Type: application/json' \
  -d '{"amount": 1000, "currency": "eur"}'
```

## Solución de problemas CORS

Si experimentas problemas de CORS, verifica:

1. Que la función está configurada para permitir el origen de tu aplicación
2. Que la respuesta incluye los encabezados CORS correctos
3. Que el método OPTIONS está correctamente manejado

Recuerda que los cambios en las funciones Edge requieren un nuevo despliegue para que surtan efecto. 