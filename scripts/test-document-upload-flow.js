// scripts/test-document-upload-flow.js
// Script para verificar el flujo completo de subida de documentos

// Simular datos de prueba
const testPropertyData = {
  id: "9bb8188b-1e42-44c5-b25a-0c27e671d59a", // ID de "casa pepe" existente
  name: "casa pepe"
};

const testDocumentData = {
  name: "Manual de instrucciones test",
  description: "Documento de prueba para verificar el flujo",
  type: "guide"
};

// Simular archivo de prueba
const createTestFile = () => {
  const content = "Este es un documento de prueba para verificar el flujo de subida";
  const blob = new Blob([content], { type: 'text/plain' });
  const file = new File([blob], 'test-document.txt', { type: 'text/plain' });
  return file;
};

console.log("=== INICIANDO VERIFICACIÓN DE FLUJO DE DOCUMENTOS ===");

// Test 1: Verificar datos actuales en Supabase
console.log("\n1️⃣ VERIFICANDO DATOS ACTUALES EN SUPABASE:");

console.log("📊 Properties actuales:");
console.log("SELECT id, name FROM properties ORDER BY created_at DESC LIMIT 3;");

console.log("\n📊 Media_files actuales:");
console.log("SELECT id, property_id, file_type, category, title FROM media_files ORDER BY created_at DESC LIMIT 5;");

console.log("\n📊 Documents table:");
console.log("SELECT COUNT(*) as total FROM documents;");

console.log("\n📊 Shareable_links table:");
console.log("SELECT COUNT(*) as total FROM shareable_links;");

// Test 2: Verificar configuración del storage bucket
console.log("\n2️⃣ VERIFICANDO CONFIGURACIÓN DE STORAGE:");
console.log("- Bucket: 'property-documents'");
console.log("- Tamaño límite: 10MB");
console.log("- Acceso público: habilitado");

// Test 3: Verificar flujo de PropertyDocumentsForm
console.log("\n3️⃣ SIMULANDO FLUJO DE PROPERTYDOCUMENTSFORM:");
console.log(`
FLUJO ESPERADO:
1. Usuario selecciona archivo en PropertyDocumentsForm
2. handleUpload() llama a documentService.uploadDocument()
3. documentService verifica si propertyId === "temp"
4. Si NO es temp: sube a Storage + guarda en media_files
5. Si es PDF: envía para vectorización 
6. Retorna PropertyDocument objeto

DATOS DE PRUEBA:
- Property ID: ${testPropertyData.id}
- Documento: ${testDocumentData.name}
- Tipo: ${testDocumentData.type}
- Categoría mapeada: document_manual (para type="guide")
`);

// Test 4: Verificar posibles errores
console.log("\n4️⃣ POSIBLES PUNTOS DE FALLO:");
console.log(`
❌ FALLO 1: Error de autenticación
   - Usuario no autenticado al subir documento
   - Fallback a handleTempPropertyDocument()
   
❌ FALLO 2: Error en Storage upload  
   - Bucket no existe o sin permisos
   - Archivo demasiado grande
   
❌ FALLO 3: Error en media_files insert
   - Validación de schema fallando
   - Foreign key constraint error
   - Enum values incorrectos (file_type, category)
   
❌ FALLO 4: Error en vectorización
   - Webhook de vectorización fallando
   - Bloqueando todo el proceso
`);

// Test 5: Verificar Google Business Profile
console.log("\n5️⃣ VERIFICANDO GOOGLE BUSINESS PROFILE:");
console.log("Campo esperado: properties.google_business_profile_url");
console.log("SELECT google_business_profile_url FROM properties WHERE google_business_profile_url IS NOT NULL;");

// Test 6: Pasos de verificación manual
console.log("\n6️⃣ PASOS DE VERIFICACIÓN MANUAL:");
console.log(`
PARA DIAGNOSTICAR:
1. Crear propiedad de prueba
2. Intentar subir documento pequeño (.txt)
3. Verificar logs del navegador para errores
4. Verificar si archivo aparece en Storage
5. Verificar si metadata aparece en media_files
6. Verificar si se envía para vectorización

COMANDOS SUPABASE:
-- Ver estructura de media_files
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'media_files';

-- Ver enums disponibles
SELECT enum_range(NULL::media_file_type);
SELECT enum_range(NULL::media_category_type);

-- Ver intentos fallidos recientes
SELECT * FROM media_files 
WHERE property_id = '${testPropertyData.id}' 
AND file_type = 'document';
`);

console.log("\n=== VERIFICACIÓN COMPLETA ===");
console.log("Ejecutar este script para diagnosticar el problema de documentos"); 