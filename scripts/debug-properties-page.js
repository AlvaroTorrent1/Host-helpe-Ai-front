// scripts/debug-properties-page.js
// Debug: ¿Por qué Casa María Flora no aparece en la página de Propiedades?

console.log(`
🔍 DEBUG: PROPIEDAD DESAPARECIDA DE PÁGINA PROPIEDADES
====================================================

PROBLEMA:
- ✅ Dashboard: SÍ muestra "Casa María Flora"  
- ❌ Página Propiedades: NO muestra "Casa María Flora"

DIFERENCIAS IDENTIFICADAS:
1. Dashboard: Consulta SQL directa simple
2. Página Propiedades: getProperties() con JOINs complejos

LOGS A VERIFICAR EN CONSOLA DEL NAVEGADOR:
=========================================

CUANDO ABRAS LA PÁGINA DE PROPIEDADES, DEBERÍAS VER:

1. 🔍 PropertyManagementPage: Iniciando carga de propiedades...
2. 🔍 PropertyManagementPage: Llamando a getProperties()...
3. Usuario autenticado: [email] ID: [user_id]
4. Propiedades obtenidas: [array de datos]
5. 🔍 PropertyManagementPage: Propiedades recibidas: [array]
6. 🔍 PropertyManagementPage: Número de propiedades: [número]

POSIBLES ESCENARIOS:

❌ ESCENARIO 1: No aparecen logs 1-2
   → El useEffect no se ejecuta
   → Problema de renderizado/contexto

❌ ESCENARIO 2: Aparecen logs 1-2, pero no 3-4
   → getProperties() falla antes de la consulta
   → Problema de autenticación

❌ ESCENARIO 3: Aparecen logs 1-4, pero data está vacío
   → La consulta SQL no devuelve resultados
   → Problema de user_id o filtros

❌ ESCENARIO 4: Error en console.error
   → Exception en getProperties()
   → Ver detalles del error

PASOS PARA DEBUGGEAR:
==================

1. Abre el navegador en modo Developer Tools (F12)
2. Ve a la pestaña Console
3. Navega a la página de Propiedades
4. Observa qué logs aparecen
5. Reporta cuál de los 4 escenarios ocurre

COMPARACIÓN CON DASHBOARD:
========================

El Dashboard usa esta consulta simple que SÍ funciona:
\`\`\`sql
SELECT * FROM properties 
WHERE user_id = 'ae4bf72a-c538-4b27-8c1e-7f28ba49de7d'
\`\`\`

La página Propiedades usa getProperties() que hace:
\`\`\`sql
SELECT *, media_files(*), shareable_links(*)
FROM properties
WHERE user_id = userAuth.user.id
\`\`\`

SOLUCIÓN RÁPIDA SI FALLA:
=======================

Si getProperties() sigue fallando, podemos hacer rollback temporal:
1. Usar la consulta simple del Dashboard
2. Cargar media/links bajo demanda en el modal de edición
`); 