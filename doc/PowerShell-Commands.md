# Guía de Comandos PowerShell para el Desarrollo

Este documento proporciona una referencia rápida de comandos PowerShell para tareas comunes de desarrollo.

## Navegación y Gestión de Archivos

### Listado de Archivos y Directorios
```powershell
# Listar contenido del directorio actual (equivalente a ls en Unix)
Get-ChildItem
# Alias más cortos
gci
dir
ls

# Listar solo directorios
Get-ChildItem -Directory

# Listar solo archivos
Get-ChildItem -File

# Búsqueda recursiva con patrón
Get-ChildItem -Recurse -Filter "*.js"
```

### Navegación
```powershell
# Cambiar directorio (equivalente a cd en Unix)
Set-Location ruta\del\directorio
# Alias más corto
cd ruta\del\directorio

# Ir al directorio padre
cd ..

# Ir a la raíz del proyecto
cd C:\Users\Usuario\Desktop\nuevo-repo
```

### Manipulación de Archivos
```powershell
# Eliminar archivo (equivalente a rm en Unix)
Remove-Item archivo.txt

# Eliminar directorio
Remove-Item -Recurse directorio

# Crear directorio (equivalente a mkdir en Unix)
New-Item -ItemType Directory -Path nombre_directorio
# Alias más corto
mkdir nombre_directorio

# Copiar archivo
Copy-Item origen.txt destino.txt
# Alias más corto
cp origen.txt destino.txt

# Mover archivo
Move-Item origen.txt nueva\ubicacion\
# Alias más corto
mv origen.txt nueva\ubicacion\
```

## Comandos Git Comunes

```powershell
# Ver estado del repositorio
git status

# Añadir archivos al staging
git add .
git add archivo.js

# Hacer commit de cambios
git commit -m "Mensaje descriptivo"

# Traer cambios del repositorio remoto
git pull origin main

# Enviar cambios al repositorio remoto
git push origin main

# Crear nueva rama
git checkout -b nueva-funcionalidad

# Cambiar de rama
git checkout main
```

## Comandos npm/Yarn

```powershell
# Instalar dependencias
npm install
# o
yarn

# Instalar una dependencia específica
npm install nombre-paquete
# o
yarn add nombre-paquete

# Ejecutar scripts definidos en package.json
npm run dev
npm run build
# o
yarn dev
yarn build
```

## Técnicas Útiles

### Usar scripts de npm en lugar de comandos de shell
Definir scripts en package.json es una forma multiplataforma de ejecutar comandos:

```json
"scripts": {
  "clean": "rimraf dist",
  "dev": "vite",
  "build": "tsc && vite build",
  "preview": "vite preview"
}
```

### Configurar aliases para comandos Unix

Si prefieres la sintaxis de Unix, puedes crear aliases en tu perfil de PowerShell ($PROFILE):

```powershell
# Añadir a tu perfil de PowerShell
Set-Alias -Name rm -Value Remove-Item
Set-Alias -Name cp -Value Copy-Item
Set-Alias -Name mv -Value Move-Item
Set-Alias -Name ls -Value Get-ChildItem
Set-Alias -Name grep -Value Select-String
```

## Solución de Problemas Comunes

### Error "No se puede cargar el archivo... porque la ejecución de scripts está deshabilitada"
```powershell
# Comprobar la política actual
Get-ExecutionPolicy

# Cambiar política (requiere permisos de administrador)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Error al eliminar directorios profundamente anidados
```powershell
# Usar -Force para directorios problemáticos
Remove-Item -Recurse -Force directorio
```

---

Si encuentras un comando Unix que no sabes cómo traducir a PowerShell, consulta la documentación o pregunta al equipo. 