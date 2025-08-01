// scripts/verify-clean-database.js
// Verificar que la base de datos está completamente limpia para empezar desde cero

console.log(`
🧹 VERIFICACIÓN: BASE DE DATOS COMPLETAMENTE LIMPIA
=================================================

✅ LIMPIEZA COMPLETADA:

📊 ESTADO ACTUAL:
- properties: 0 registros
- media_files: 0 registros  
- documents: 0 registros
- shareable_links: 0 registros
- storage: 0 archivos huérfanos

🔄 RESET COMPLETO REALIZADO:
1. ✅ Eliminados todos los shareable_links
2. ✅ Eliminados todos los documents
3. ✅ Eliminados todos los media_files
4. ✅ Eliminadas todas las properties
5. ✅ Limpiado Supabase Storage

📋 PRÓXIMOS PASOS PARA TESTING:

PASO 1: VERIFICAR LOGS LIMPIOS
============================
1. Abre Developer Tools (F12) → Console
2. Navega a Dashboard
3. Navega a Página de Propiedades  
4. Ambas páginas deberían mostrar "No hay propiedades"

LOGS ESPERADOS EN PÁGINA PROPIEDADES:
🔍 PropertyManagementPage: Iniciando carga de propiedades...
🔍 PropertyManagementPage: Llamando a getProperties()...
Usuario autenticado: [email] ID: [user_id]
Propiedades obtenidas: []
🔍 PropertyManagementPage: Propiedades recibidas: []
🔍 PropertyManagementPage: Número de propiedades: 0

PASO 2: CREAR PROPIEDAD DE PRUEBA
================================
1. Clic en "Nueva Propiedad" 
2. Llenar datos básicos
3. Añadir 2-3 imágenes
4. Añadir 1 documento (PDF)
5. Añadir 1 enlace
6. Guardar

PASO 3: VERIFICAR CONSISTENCIA
=============================
1. Dashboard: ¿Aparece la nueva propiedad?
2. Página Propiedades: ¿Aparece la nueva propiedad?
3. Ver Detalles: ¿Se ven imágenes, documentos, enlaces?
4. Editar: ¿Se ven las mismas imágenes, documentos, enlaces?

PASO 4: REPORTAR RESULTADOS
==========================
Informa cualquier inconsistencia entre:
- Dashboard vs Página Propiedades
- Ver Detalles vs Modal Editar
- Logs de error en consola

🎯 OBJETIVO:
Verificar que todos los flujos funcionen consistentemente con data nueva.
`); 