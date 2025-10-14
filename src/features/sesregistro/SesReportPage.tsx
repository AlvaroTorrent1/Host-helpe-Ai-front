// src/features/sesregistro/SesReportPage.tsx
/**
 * Página para que los agentes/hosts creen partes SES desde el dashboard
 * Esta es la versión protegida para usuarios autenticados
 */
import React from "react";
import DashboardHeader from "@shared/components/DashboardHeader";
import DashboardNavigation from "@features/dashboard/DashboardNavigation";
import { useTranslation } from "react-i18next";
import SesReportForm from "./components/SesReportForm";

const SesReportPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardHeader />
      <DashboardNavigation />
      <main className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
            {t("dashboard.menu.ses")}
          </h1>
          <p className="text-gray-600 mt-1">
            {/* Solo front. Simulamos envío al proveedor y generamos el payload requerido. */}
            {t("ses.page.subtitle", "Formulario para crear el Parte del Viajero (SES)")}
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-4 sm:p-6">
          <SesReportForm />
        </div>
      </main>
    </div>
  );
};

export default SesReportPage;



