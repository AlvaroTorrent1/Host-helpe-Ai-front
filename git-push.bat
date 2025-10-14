@echo off
echo Preparando commit de limpieza...
git add -A
git commit -m "feat: limpieza masiva del proyecto - eliminacion codigo legacy y reorganizacion docs"
echo.
echo Haciendo push a GitHub...
git push
echo.
echo Listo!
pause

