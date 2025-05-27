@echo off
echo Iniciando funciones de Supabase...
cd supabase
npx supabase functions serve create-payment-intent --no-verify-jwt 