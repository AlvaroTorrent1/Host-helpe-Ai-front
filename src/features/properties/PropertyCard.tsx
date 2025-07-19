import React from "react";
import { Property } from "../../types/property";
import { useTranslation } from "react-i18next";

interface PropertyCardProps {
  property: Property;
  onEdit: (property: Property) => void;
  onDelete: (property: Property) => void;
  onView: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onEdit,
  onDelete,
  onView,
}) => {
  const { t } = useTranslation();
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
      <div
        className="relative h-48 bg-gray-200 cursor-pointer"
        onClick={onView}
      >
        {property.image ? (
          <img
            src={property.image}
            alt={property.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gray-100">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
        )}

        {/* Badge de estado */}
        <div className="absolute top-2 right-2 z-10">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800`}
          >
            {t("properties.status.active")}
          </span>
        </div>
      </div>

      <div className="px-4 py-4 cursor-pointer" onClick={onView}>
        <h3 className="text-lg font-medium text-gray-900 truncate">
          {property.name}
        </h3>
        <p className="mt-1 text-sm text-gray-500 truncate">
          {property.address}
        </p>
      </div>

      <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
        <button
          onClick={onView}
          className="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          {t("properties.buttons.viewDetails")}
        </button>

        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(property)}
            className="inline-flex items-center px-2 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg
              className="h-3.5 w-3.5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            {t("properties.buttons.edit")}
          </button>

          <button
            onClick={() => onDelete(property)}
            className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-red-700 bg-red-50 hover:bg-red-100"
          >
            <svg
              className="h-3.5 w-3.5 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            {t("properties.buttons.delete")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PropertyCard;
