@echo off
REM Script para desplegar proxy-n8n-webhook con verify_jwt=false
REM Esto resuelve el error 401 Unauthorized

echo ========================================
echo Desplegando proxy-n8n-webhook sin JWT
echo ========================================
echo.
echo Este script desplegara la funcion con verify_jwt=false
echo para permitir llamadas sin autenticacion JWT.
echo.
echo IMPORTANTE: Primero debes hacer login con:
echo   npx supabase login
echo.
pause

echo.
echo Desplegando funcion...
npx --yes supabase functions deploy proxy-n8n-webhook --no-verify-jwt

echo.
echo ========================================
echo Despliegue completado!
echo ========================================
echo.
echo La funcion ahora deberia aceptar peticiones sin JWT.
echo URL: https://blxngmtmknkdmikaflen.supabase.co/functions/v1/proxy-n8n-webhook
echo.
pause 