import React, { useState, useEffect, useRef } from "react";
import { Property } from "@/types/property";
import PropertyCard from "./PropertyCard";
import PropertyDetail from "./PropertyDetail";
import Modal from "@shared/components/Modal";
import { useTranslation } from "react-i18next";

interface PropertyListProps {
  properties: Property[];
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
  onAdd: () => void;
}

const PropertyList: React.FC<PropertyListProps> = ({
  properties,
  onEdit,
  onDelete,
  onAdd,
}) => {
  const { t, i18n } = useTranslation();
  const language = i18n.language; // Obtener idioma actual
  const [filter, setFilter] = useState<"all" | "active" | "inactive">("all");
  const [search, setSearch] = useState("");
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null,
  );
  const [isTemplateDropdownOpen, setIsTemplateDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Efecto para cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsTemplateDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Filtrar propiedades basado en el estado y búsqueda
  const filteredProperties = properties.filter((property) => {
    // NOTA: Campo status eliminado - todas las propiedades son consideradas "activas"
    // Solo filtrar por "all" o si no hay filtro específico
    if (filter !== "all" && filter !== "active") {
      // Si el filtro es "inactive", no mostrar ninguna propiedad ya que no hay inactivas
      return false;
    }

    // Filtrar por término de búsqueda
    if (
      search &&
      !property.name.toLowerCase().includes(search.toLowerCase()) &&
      !property.address.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }

    return true;
  });

  // Manejar clic en una propiedad para ver detalles
  const handleViewProperty = async (property: Property) => {
    try {
      // Recargar la propiedad con todos los datos actualizados
      const { getPropertyById } = await import('../../services/propertyService');
      const fullProperty = await getPropertyById(property.id);
      setSelectedProperty(fullProperty);
    } catch (error) {
      console.error('Error loading property details:', error);
      // Fallback a la propiedad de la lista si falla la recarga
      setSelectedProperty(property);
    }
  };

  // Cerrar el modal de detalles
  const handleCloseDetail = () => {
    setSelectedProperty(null);
  };

  // Manejar descarga de plantillas
  const handleDownloadTemplate = (templateType: string) => {
    console.log('🔄 Iniciando descarga de plantilla:', templateType);
    
    try {
      // Usar la variable language del nivel superior del componente
      console.log('🌐 Idioma detectado:', language);
      
      let filename = '';
      
      // Mapear tipo de plantilla y idioma a archivo específico
      switch (templateType) {
        case 'faq':
          filename = language === 'es' 
            ? 'Preguntas_frecuentes_Host_Helper_Ai.docx' 
            : 'FAQ _Host_Helper_Ai.docx';
          break;
          
        case 'inventory':
          filename = language === 'es' 
            ? 'Plantilla_Inventario_Host_Helper_Ai.docx' 
            : 'Inventory_Template_Host_Helper_Ai.docx';
          break;
          
        case 'welcome':
          filename = language === 'es' 
            ? 'Mensaje_Bienvenida_Host_Helper_Ai.docx' 
            : 'Welcome_Message_Host_Helper_Ai.docx';
          break;
          
        default:
          console.error('❌ Tipo de plantilla no reconocido:', templateType);
          return;
      }
      
      console.log('📄 Archivo a descargar:', filename);
      
      // Crear URL con encoding para manejar espacios y caracteres especiales
      const encodedFilename = encodeURIComponent(filename);
      const fileUrl = `/templates/${encodedFilename}`;
      console.log('🔗 URL generada:', fileUrl);
      
      // Crear enlace y descargar archivo directamente desde public/templates/
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = filename;
      link.style.display = 'none';
      
      console.log('🔗 Creando enlace de descarga...');
      document.body.appendChild(link);
      
      // Intentar hacer click
      console.log('👆 Haciendo click en enlace...');
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      console.log('✅ Descarga iniciada correctamente');
      
    } catch (error) {
      console.error('❌ Error en descarga de plantilla:', error);
      alert('Error al descargar la plantilla. Revisa la consola para más detalles.');
    } finally {
      // Cerrar el dropdown
      setIsTemplateDropdownOpen(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div className="text-left">
          <h2 className="text-xl font-semibold text-gray-900 text-left">
            {t("properties.title")}
          </h2>
          <p className="mt-1 text-sm text-gray-500 text-left">
            {t("properties.subtitle")}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Desplegable de plantillas */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsTemplateDropdownOpen(!isTemplateDropdownOpen)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
            >
              <svg
                className="h-4 w-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              {t("dashboard.properties.templates.download")}
              <svg
                className={`ml-2 h-4 w-4 transition-transform ${isTemplateDropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {/* Contenido del dropdown */}
            {isTemplateDropdownOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                <div className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    {t("dashboard.properties.templates.dropdownTitle")}
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    {t("dashboard.properties.templates.description")}
                  </p>
                  
                  <div className="space-y-2">
                    <button
                      onClick={() => handleDownloadTemplate('faq')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{t("dashboard.properties.templates.faqTemplate")}</div>
                        <div className="text-xs text-gray-500">{t("dashboard.properties.templates.faqDescription")}</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleDownloadTemplate('inventory')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{t("dashboard.properties.templates.inventoryTemplate")}</div>
                        <div className="text-xs text-gray-500">{t("dashboard.properties.templates.inventoryDescription")}</div>
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleDownloadTemplate('welcome')}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md flex items-start space-x-3"
                    >
                      <div className="flex-shrink-0 mt-0.5">
                        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{t("dashboard.properties.templates.welcomeTemplate")}</div>
                        <div className="text-xs text-gray-500">{t("dashboard.properties.templates.welcomeDescription")}</div>
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Botón añadir propiedad */}
          <button
            onClick={onAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <svg
              className="h-4 w-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t("properties.buttons.add")}
          </button>
        </div>
      </div>

      {/* Filtros y búsqueda */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between space-y-4 sm:space-y-0">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              filter === "all"
                ? "bg-primary-100 text-primary-700"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t("properties.filters.all")}
          </button>
          <button
            onClick={() => setFilter("active")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              filter === "active"
                ? "bg-primary-100 text-primary-700"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t("properties.filters.active")}
          </button>
          <button
            onClick={() => setFilter("inactive")}
            className={`px-3 py-1.5 text-sm font-medium rounded-md ${
              filter === "inactive"
                ? "bg-primary-100 text-primary-700"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            {t("properties.filters.inactive")}
          </button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder={t("properties.search.placeholder")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Lista de propiedades */}
      {filteredProperties.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 9L12 2l9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9zm7 9h4v-4H10v4z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t("properties.empty.title")}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {search || filter !== "all"
              ? t("properties.empty.noResults")
              : t("properties.empty.addFirst")}
          </p>
          {!search && filter === "all" && (
            <div className="mt-6">
              <button
                onClick={onAdd}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                {t("properties.buttons.add")}
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onEdit={onEdit}
              onDelete={onDelete}
              onView={() => handleViewProperty(property)}
            />
          ))}
        </div>
      )}

      {/* Modal de detalle de propiedad */}
      {selectedProperty && (
        <Modal
          isOpen={!!selectedProperty}
          onClose={handleCloseDetail}
          title=""
          size="xl"
          noPadding
        >
          <PropertyDetail
            property={selectedProperty}
            onClose={handleCloseDetail}
          />
        </Modal>
      )}
    </div>
  );
};

export default PropertyList;
