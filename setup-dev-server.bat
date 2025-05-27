@echo off
echo ========================================
echo  CONFIGURACION DEL SERVIDOR DE DESARROLLO
echo ========================================
echo.

echo [1/4] Verificando Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Node.js no esta instalado
    echo Por favor instala Node.js desde https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js detectado: 
node --version

echo.
echo [2/4] Instalando dependencias del servidor de desarrollo...
npm install --prefix . express cors stripe nodemon

echo.
echo [3/4] Verificando instalacion...
if not exist "node_modules\express" (
    echo ERROR: No se pudo instalar Express
    pause
    exit /b 1
)

if not exist "node_modules\stripe" (
    echo ERROR: No se pudo instalar Stripe
    pause
    exit /b 1
)

echo Dependencias instaladas correctamente
echo.

echo [4/4] Iniciando servidor de desarrollo...
echo.
echo ========================================
echo  SERVIDOR DE DESARROLLO PARA STRIPE
echo ========================================
echo.
echo Puerto: 3001
echo Endpoint: http://localhost:3001/functions/v1/create-payment-intent
echo Health check: http://localhost:3001/health
echo.
echo Presiona Ctrl+C para detener el servidor
echo.

node dev-server.js 