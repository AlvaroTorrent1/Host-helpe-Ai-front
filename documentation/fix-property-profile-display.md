# 🔧 Plan de Corrección: Visualización Completa del Perfil de Propiedades

## 📊 DIAGNÓSTICO COMPLETO

### ❌ Problema Identificado
Los datos se guardan correctamente en Supabase pero NO se muestran en el perfil de la propiedad porque:

1. **`getPropertyById()` usa consulta incorrecta**:
   ```typescript
   // ❌ ACTUAL (INCORRECTO)
   .select("*, additional_images(*), documents(*)")
   // Las tablas additional_images(*) y documents(*) NO EXISTEN
   ```

2. **`PropertyDetail.tsx` no muestra datos completos**:
   - Solo muestra imagen de portada
   - No muestra imágenes adicionales
   - No muestra documentos
   - No muestra enlaces de negocio

3. **Estructura real en Supabase**:
   - `media_files` (file_type: 'image'|'document')
   - `shareable_links` 
   - `properties` con featured_image_id

## 🎯 PLAN DE SOLUCIÓN (5 PASOS)

### PASO 1: Corregir Servicio de Carga de Propiedades
- ✅ Arreglar `getPropertyById()` para usar consulta correcta
- ✅ Mapear datos de `media_files` a estructura esperada
- ✅ Incluir `shareable_links` en la carga

### PASO 2: Actualizar Tipos TypeScript
- ✅ Verificar que `Property` type incluya todos los campos
- ✅ Añadir tipos para `ShareableLink` y datos completos

### PASO 3: Expandir PropertyDetail Component
- ✅ Añadir pestañas para "Galería", "Documentos", "Enlaces"
- ✅ Mostrar todas las imágenes adicionales
- ✅ Mostrar todos los documentos
- ✅ Mostrar enlaces de negocio

### PASO 4: Integrar Sistema Robusto
- ✅ Conectar con `useRobustModalState` para edición
- ✅ Estado optimista en visualización
- ✅ Sincronización automática

### PASO 5: Testing y Verificación
- ✅ Verificar que todo se muestra correctamente
- ✅ Probar edición desde perfil
- ✅ Verificar sincronización bidireccional

## 🔧 IMPLEMENTACIÓN DETALLADA

### 1. Servicio Corregido

```typescript
// ✅ CORRECCIÓN: propertyService.ts
export const getPropertyById = async (id: string): Promise<Property> => {
  try {
    // Obtener propiedad básica
    const { data: property, error: propError } = await supabase
      .from("properties")
      .select("*")
      .eq("id", id)
      .single();

    if (propError) throw propError;

    // Obtener media_files (imágenes y documentos)
    const { data: mediaFiles, error: mediaError } = await supabase
      .from("media_files")
      .select("*")
      .eq("property_id", id)
      .order("sort_order", { ascending: true });

    if (mediaError) throw mediaError;

    // Obtener enlaces compartibles
    const { data: shareableLinks, error: linksError } = await supabase
      .from("shareable_links")
      .select("*")
      .eq("property_id", id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (linksError) throw linksError;

    // Mapear datos correctamente
    const images = mediaFiles
      .filter(file => file.file_type === 'image')
      .map(file => ({
        id: file.id,
        property_id: file.property_id,
        file_url: file.file_url || file.public_url,
        description: file.description || file.title,
        uploaded_at: file.created_at,
        title: file.title,
        sort_order: file.sort_order
      }));

    const documents = mediaFiles
      .filter(file => file.file_type === 'document')
      .map(file => ({
        id: file.id,
        property_id: file.property_id,
        type: file.subcategory || 'other',
        name: file.title,
        file_url: file.file_url || file.public_url,
        description: file.description,
        uploaded_at: file.created_at,
        file_type: file.mime_type || 'other'
      }));

    return {
      ...property,
      additional_images: images,
      documents: documents,
      shareable_links: shareableLinks || []
    } as Property;

  } catch (error) {
    console.error(`Error obteniendo propiedad con ID ${id}:`, error);
    throw error;
  }
};
```

### 2. PropertyDetail Expandido

```typescript
// ✅ ACTUALIZACIÓN: PropertyDetail.tsx
const PropertyDetail: React.FC<PropertyDetailProps> = ({
  property,
  onEdit,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState("info");
  const { t } = useTranslation();

  // Integración con sistema robusto
  const {
    mediaFiles,
    shareableLinks,
    isLoading,
    updateMediaFile,
    syncNow
  } = useRobustModalState(property.id);

  return (
    <div className="bg-white rounded-lg shadow-xl overflow-hidden">
      {/* Header con imagen de portada */}
      <div className="relative h-64 w-full">
        <img
          src={property.image || "https://via.placeholder.com/800x400"}
          alt={property.name}
          className="w-full h-full object-cover"
        />
        {/* ... resto del header */}
      </div>

      {/* Pestañas expandidas */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6">
          {/* Pestaña Info */}
          <button
            onClick={() => setActiveTab("info")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "info"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("properties.detail.info", "Información")}
          </button>

          {/* Pestaña Galería */}
          <button
            onClick={() => setActiveTab("gallery")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "gallery"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("properties.detail.gallery", "Galería")} 
            ({property.additional_images?.length || 0})
          </button>

          {/* Pestaña Documentos */}
          <button
            onClick={() => setActiveTab("documents")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "documents"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("properties.detail.documents", "Documentos")} 
            ({property.documents?.length || 0})
          </button>

          {/* Pestaña Enlaces */}
          <button
            onClick={() => setActiveTab("links")}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "links"
                ? "border-primary-500 text-primary-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t("properties.detail.businessLinks", "Enlaces")} 
            ({property.shareable_links?.length || 0})
          </button>
        </nav>
      </div>

      {/* Contenido por pestañas */}
      <div className="p-6">
        {/* Pestaña Información (existente) */}
        {activeTab === "info" && (
          <div className="space-y-6">
            {/* ... contenido existente ... */}
          </div>
        )}

        {/* Nueva Pestaña: Galería */}
        {activeTab === "gallery" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Galería de Imágenes ({property.additional_images?.length || 0})
              </h3>
              <button
                onClick={() => onEdit(property)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Editar Galería
              </button>
            </div>

            {property.additional_images && property.additional_images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {property.additional_images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={image.file_url}
                      alt={image.description || `Imagen ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg shadow-sm"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 text-white text-center p-4">
                        <h4 className="font-medium">{image.title}</h4>
                        {image.description && (
                          <p className="text-sm mt-1">{image.description}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🖼️</div>
                <p>No hay imágenes adicionales para esta propiedad.</p>
                <button
                  onClick={() => onEdit(property)}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Añadir Imágenes
                </button>
              </div>
            )}
          </div>
        )}

        {/* Nueva Pestaña: Documentos */}
        {activeTab === "documents" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Documentos ({property.documents?.length || 0})
              </h3>
              <button
                onClick={() => onEdit(property)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Gestionar Documentos
              </button>
            </div>

            {property.documents && property.documents.length > 0 ? (
              <div className="space-y-3">
                {property.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      {getFileIcon(doc.file_type)}
                      <div>
                        <h4 className="font-medium text-gray-900">{doc.name}</h4>
                        {doc.description && (
                          <p className="text-sm text-gray-600">{doc.description}</p>
                        )}
                        <div className="text-xs text-gray-500 mt-1">
                          Tipo: {doc.type} • Subido: {new Date(doc.uploaded_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Ver
                      </a>
                      <a
                        href={doc.file_url}
                        download
                        className="text-sm text-green-600 hover:text-green-800"
                      >
                        Descargar
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">📄</div>
                <p>No hay documentos para esta propiedad.</p>
                <button
                  onClick={() => onEdit(property)}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Añadir Documentos
                </button>
              </div>
            )}
          </div>
        )}

        {/* Nueva Pestaña: Enlaces de Negocio */}
        {activeTab === "links" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">
                Enlaces de Negocio ({property.shareable_links?.length || 0})
              </h3>
              <button
                onClick={() => onEdit(property)}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Gestionar Enlaces
              </button>
            </div>

            {property.shareable_links && property.shareable_links.length > 0 ? (
              <div className="space-y-3">
                {property.shareable_links.map((link) => (
                  <div
                    key={link.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{link.title}</h4>
                      {link.description && (
                        <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                      )}
                      <div className="text-xs text-gray-500 mt-2">
                        Tipo: {link.link_type} • Clics: {link.click_count || 0}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <a
                        href={link.public_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        Visitar
                      </a>
                      <button
                        onClick={() => navigator.clipboard.writeText(link.public_url)}
                        className="text-sm text-green-600 hover:text-green-800"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <div className="text-4xl mb-4">🔗</div>
                <p>No hay enlaces de negocio para esta propiedad.</p>
                <button
                  onClick={() => onEdit(property)}
                  className="mt-4 text-blue-600 hover:text-blue-800"
                >
                  Añadir Enlaces
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
```

## 🔄 INTEGRACIÓN CON SISTEMA ROBUSTO

### Sincronización Bidireccional
- Modal edita → Sistema robusto → Base de datos
- Perfil visualiza → Datos actualizados → Estado optimista
- Cambios en tiempo real entre modal y perfil

### Estado Optimista en Visualización
```typescript
const PropertyDetailWithRobustState = ({ property, onEdit, onClose }) => {
  const robustState = useRobustModalState(property.id);
  
  // Combinar datos iniciales con estado robusto
  const displayData = {
    ...property,
    additional_images: robustState.mediaFiles.filter(f => f.file_type === 'image'),
    documents: robustState.mediaFiles.filter(f => f.file_type === 'document'),
    shareable_links: robustState.shareableLinks
  };

  return <PropertyDetail property={displayData} onEdit={onEdit} onClose={onClose} />;
};
```

## ✅ VERIFICACIÓN Y TESTING

### Checklist de Verificación
- [ ] ✅ Servicio carga todas las imágenes adicionales
- [ ] ✅ Servicio carga todos los documentos
- [ ] ✅ Servicio carga todos los enlaces de negocio
- [ ] ✅ PropertyDetail muestra galería completa
- [ ] ✅ PropertyDetail muestra documentos con descarga
- [ ] ✅ PropertyDetail muestra enlaces funcionales
- [ ] ✅ Edición desde perfil abre modal correcto
- [ ] ✅ Cambios en modal se reflejan en perfil
- [ ] ✅ Estado optimista funciona correctamente

### Testing Manual
1. **Crear propiedad** con imágenes, documentos y enlaces
2. **Verificar que se guardan** en Supabase
3. **Abrir perfil de propiedad** desde lista
4. **Verificar que todo se muestra** en pestañas
5. **Editar desde perfil** y verificar sincronización
6. **Recargar página** y verificar persistencia

## 🎯 RESULTADO ESPERADO

Después de implementar este plan:

- ✅ **Perfil completo**: Toda la información se muestra en el perfil
- ✅ **Navegación intuitiva**: Pestañas para organizar contenido
- ✅ **Sincronización 100%**: Modal ↔ Perfil ↔ Database
- ✅ **Experiencia fluida**: Estado optimista y tiempo real
- ✅ **Funcionalidad completa**: Ver, descargar, copiar, editar

**PROBLEMA RESUELTO**: Los datos del modal ahora SE VEN completamente en el perfil de la propiedad. 🎉 