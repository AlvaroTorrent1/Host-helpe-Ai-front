# Script para commit y push de limpieza
Write-Host "🧹 Preparando commit de limpieza masiva..." -ForegroundColor Cyan

# Añadir todos los cambios
Write-Host "`n📦 Añadiendo cambios al staging..." -ForegroundColor Yellow
git add -A

# Crear commit con mensaje detallado
Write-Host "`n💾 Creando commit..." -ForegroundColor Yellow
$commitMessage = @"
🧹 Limpieza masiva del proyecto: eliminación de código legacy y reorganización

## Resumen
Gran limpieza del proyecto eliminando ~50+ archivos obsoletos, refactorizando componentes principales, 
y reorganizando documentación para mejor mantenibilidad.

## Directorios Eliminados (8)
- components/, hooks/, pages/ (legacy fuera de src/)
- landing-page/ (template no relacionado)
- elevenlabs-mcp/ (proyecto Python vendorizado)
- docs/ (documentación duplicada)
- dist/, .vite/ (artefactos de build/cache)

## Archivos Eliminados (~50)
### Código src/
- services: property.service.ts, stripe.ts, stripeService.ts
- components: FloatingHeader.backup.tsx, SmartAuthRouterTest.tsx

### Scripts de prueba (root)
- test-*.js (15 archivos)
- test-*.ps1 (3 archivos)
- test-*.html (2 archivos)
- test-*.bat (1 archivo)

### Scripts auxiliares obsoletos
- dev-server.js, simple-server.js
- setup-*.js/bat (3 archivos)
- check-documents.js, dashboard-api-examples.js
- query-september-2-calls.js, n8n-property-processing-code.js

### Otros
- webhook-config.ts, package-dev.json
- fix-documents-migration.sql, verificar_llamada_prueba.sql
- Archivos creados por error: t, tatus -sb

## Código Refactorizado
### AuthContext.tsx
- Creados helpers reutilizables para analytics
- Eliminada duplicación de código de tracking (~15 líneas)

### DashboardStats.tsx
- Removido import sin uso (CompactIncidentCard)
- Unificada configuración de stats móvil/desktop (~30 líneas)

## Documentación Reorganizada
Movidos a documentation/:
- CALENDLY_LOCALIZATION_SETUP.md → guides/calendly-localization.md
- ELEVENLABS_INTEGRATION.md → integrations/elevenlabs-integration.md
- HERO_REDESIGN_README.md → design/hero-redesign.md
- CONFIGURACION_VARIABLES.md → guides/environment-variables-setup.md
- deploy-data-deletion.md → integrations/facebook-data-deletion-deployment.md
- webhook-environment-config.md → integrations/n8n-webhook-environment-config.md

Eliminados:
- CLEANUP_ELEVENLABS_LEGACY.md (histórico)

## Dependencias
Removidas:
- date-fns, multer, nodemon (sin uso)

Añadidas (dev):
- @types/chai, @types/sinon

## Configuración
### ESLint
- Añadido override para archivos de test
- Reglas relajadas en tests para permitir mocks

## Impacto
- ✅ ~600+ líneas de código muerto eliminadas
- ✅ Build más rápido y bundle más ligero
- ✅ Documentación centralizada
- ✅ Proyecto más mantenible y navegable

## Notas
- Variables .env.development y .env.production preservadas (críticas)
- Errores de lint preexistentes en src/utils no abordados
- Scripts en scripts/ conservados para debugging futuro
"@

git commit -m $commitMessage

# Verificar branch actual
Write-Host "`n🌿 Branch actual:" -ForegroundColor Yellow
$currentBranch = git branch --show-current
Write-Host "   $currentBranch" -ForegroundColor Green

# Push a GitHub
Write-Host "`n🚀 Haciendo push a GitHub..." -ForegroundColor Yellow
git push origin $currentBranch

Write-Host "`n✅ ¡Limpieza completada y pusheada a GitHub!" -ForegroundColor Green
Write-Host "`n📊 Resumen de cambios:" -ForegroundColor Cyan
git diff --stat HEAD~1 HEAD | Select-Object -First 50

Write-Host "`n🎯 Siguiente paso: Crear PR en GitHub" -ForegroundColor Magenta
Write-Host "   URL: https://github.com/AlvaroTorrent1/Host-helpe-Ai-front/compare/$currentBranch" -ForegroundColor Blue

