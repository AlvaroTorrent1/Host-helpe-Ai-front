import React, { useState } from "react";
import { useLanguage } from "@shared/contexts/LanguageContext";

interface TravelerFormData {
  firstName: string;
  lastName: string;
  documentType: "dni" | "nie" | "passport";
  documentNumber: string;
  documentCountry: string;
  birthDate: string;
  nationality: string;
}

interface TravelerRegistrationFormProps {
  onSubmit: (data: TravelerFormData) => void;
  onCancel: () => void;
}

const TravelerRegistrationForm: React.FC<TravelerRegistrationFormProps> = ({
  onSubmit,
  onCancel,
}) => {
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState<TravelerFormData>({
    firstName: "",
    lastName: "",
    documentType: "passport",
    documentNumber: "",
    documentCountry: "ES",
    birthDate: "",
    nationality: "ES",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof TravelerFormData, string>>
  >({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Limpiar error al cambiar el valor
    if (errors[name as keyof TravelerFormData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof TravelerFormData, string>> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t("dashboard.ses.form.validation.firstNameRequired");
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = t("dashboard.ses.form.validation.lastNameRequired");
    }

    if (!formData.documentNumber.trim()) {
      newErrors.documentNumber = t("dashboard.ses.form.validation.documentNumberRequired");
    }

    if (!formData.birthDate) {
      newErrors.birthDate = t("dashboard.ses.form.validation.birthDateRequired");
    } else {
      // Verificar que la fecha es válida y no está en el futuro
      const birthDate = new Date(formData.birthDate);
      const today = new Date();

      if (isNaN(birthDate.getTime())) {
        newErrors.birthDate = t("dashboard.ses.form.validation.invalidDateFormat");
      } else if (birthDate > today) {
        newErrors.birthDate = t("dashboard.ses.form.validation.futureDateNotAllowed");
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {t("dashboard.ses.form.title")}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("dashboard.ses.form.fields.firstName")} *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={`w-full p-2 border rounded focus:ring-primary-500 focus:border-primary-500 ${
                errors.firstName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("dashboard.ses.form.fields.lastName")} *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={`w-full p-2 border rounded focus:ring-primary-500 focus:border-primary-500 ${
                errors.lastName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label
              htmlFor="documentType"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("dashboard.ses.form.fields.documentType")} *
            </label>
            <select
              id="documentType"
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="dni">DNI</option>
              <option value="nie">NIE</option>
              <option value="passport">{t("dashboard.ses.form.fields.passport")}</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="documentNumber"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("dashboard.ses.form.fields.documentNumber")} *
            </label>
            <input
              type="text"
              id="documentNumber"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleChange}
              className={`w-full p-2 border rounded focus:ring-primary-500 focus:border-primary-500 ${
                errors.documentNumber ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.documentNumber && (
              <p className="mt-1 text-sm text-red-600">
                {errors.documentNumber}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="documentCountry"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("dashboard.ses.form.fields.issuingCountry")} *
            </label>
            <select
              id="documentCountry"
              name="documentCountry"
              value={formData.documentCountry}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="ES">{t("dashboard.ses.form.countries.spain")}</option>
              <option value="DE">{t("dashboard.ses.form.countries.germany")}</option>
              <option value="FR">{t("dashboard.ses.form.countries.france")}</option>
              <option value="IT">{t("dashboard.ses.form.countries.italy")}</option>
              <option value="UK">{t("dashboard.ses.form.countries.uk")}</option>
              <option value="US">{t("dashboard.ses.form.countries.us")}</option>
              {/* Añadir más países según necesidad */}
            </select>
          </div>

          <div>
            <label
              htmlFor="nationality"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("dashboard.ses.form.fields.nationality")} *
            </label>
            <select
              id="nationality"
              name="nationality"
              value={formData.nationality}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="ES">{t("dashboard.ses.form.nationalities.spanish")}</option>
              <option value="DE">{t("dashboard.ses.form.nationalities.german")}</option>
              <option value="FR">{t("dashboard.ses.form.nationalities.french")}</option>
              <option value="IT">{t("dashboard.ses.form.nationalities.italian")}</option>
              <option value="UK">{t("dashboard.ses.form.nationalities.british")}</option>
              <option value="US">{t("dashboard.ses.form.nationalities.american")}</option>
              {/* Añadir más nacionalidades según necesidad */}
            </select>
          </div>

          <div>
            <label
              htmlFor="birthDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              {t("dashboard.ses.form.fields.birthDate")} *
            </label>
            <input
              type="date"
              id="birthDate"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className={`w-full p-2 border rounded focus:ring-primary-500 focus:border-primary-500 ${
                errors.birthDate ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.birthDate && (
              <p className="mt-1 text-sm text-red-600">{errors.birthDate}</p>
            )}
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {t("common.cancel")}
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {t("dashboard.ses.buttons.register")}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TravelerRegistrationForm;
