import React, { useState } from "react";
import { PropertyImage } from "../../types/property";
import { useTranslation } from "react-i18next";

interface PropertyImagesFormProps {
  images?: PropertyImage[];
  onChange: (images: PropertyImage[]) => void;
}

const PropertyImagesForm: React.FC<PropertyImagesFormProps> = ({
  images = [],
  onChange,
}) => {
  const { t } = useTranslation();
  const [validationError, setValidationError] = useState<string | null>(null);

  // Generar un ID único para las nuevas imágenes
  const generateTempId = () =>
    `temp_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

  // Manejar subida de nueva imagen
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo y tamaño
    if (!file.type.match("image.*")) {
      setValidationError("El archivo debe ser una imagen (JPG, PNG, GIF)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB
      setValidationError("La imagen debe ser menor a 5MB");
      return;
    }

    // Crear URL para preview y añadir a la lista
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      const newImage: PropertyImage = {
        id: generateTempId(),
        property_id: "temp",
        file_url: result,
        description: "",
        uploaded_at: new Date().toISOString(),
        file: file,
      };

      onChange([...images, newImage]);
      setValidationError(null);
    };
    reader.readAsDataURL(file);
  };

  // Manejar cambio en la descripción de una imagen
  const handleDescriptionChange = (id: string, description: string) => {
    const updatedImages = images.map((img) =>
      img.id === id ? { ...img, description } : img,
    );
    onChange(updatedImages);
  };

  // Eliminar una imagen
  const handleRemoveImage = (id: string) => {
    const updatedImages = images.filter((img) => img.id !== id);
    onChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      <div className="border-b border-gray-200 pb-2">
        <h3 className="text-lg font-medium text-gray-900">
          {t("properties.form.additionalImages.title")}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {t("properties.form.additionalImages.description")}
        </p>
      </div>

      {/* Lista de imágenes */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
        {images.map((image) => (
          <div key={image.id} className="border rounded-md p-3 bg-white">
            <div className="relative">
              <img
                src={image.file_url}
                alt={image.description || "Imagen de propiedad"}
                className="h-40 w-full object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(image.id)}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 shadow-md"
                title="Eliminar imagen"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="mt-2">
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                value={image.description}
                onChange={(e) =>
                  handleDescriptionChange(image.id, e.target.value)
                }
                placeholder="Añade un contexto descriptivo a esta imagen"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                rows={2}
              />
            </div>
          </div>
        ))}

        {/* Botón para añadir imagen */}
        <div className="border border-dashed border-gray-300 rounded-md p-6 flex items-center justify-center h-48">
          <div className="space-y-1 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4h-12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600 justify-center">
              <label
                htmlFor="additional-image-upload"
                className="relative cursor-pointer rounded-md bg-white font-medium text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-500 focus-within:ring-offset-2 hover:text-primary-500"
              >
                <span>Subir imagen</span>
                <input
                  id="additional-image-upload"
                  name="additional-image-upload"
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 5MB</p>
          </div>
        </div>
      </div>

      {validationError && (
        <p className="mt-1 text-sm text-red-600">{validationError}</p>
      )}
    </div>
  );
};

export default PropertyImagesForm;
