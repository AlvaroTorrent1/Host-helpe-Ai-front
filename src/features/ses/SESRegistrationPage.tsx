import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import SESStatusPanel from "./SESStatusPanel";
import TravelerRegistrationForm from "./TravelerRegistrationForm";
import { useAuth } from "@shared/contexts/AuthContext";
import DashboardNavigation from "@features/dashboard/DashboardNavigation";
import DashboardHeader from "@shared/components/DashboardHeader";
import { useLanguage } from "@shared/contexts/LanguageContext";
import SESSubmissionHistory from './SESSubmissionHistory';
import { supabase } from '@services/supabase';

interface TravelerFormData {
  firstName: string;
  lastName: string;
  documentType: "dni" | "nie" | "passport";
  documentNumber: string;
  documentCountry: string;
  birthDate: string;
  nationality: string;
}

interface SESRegistrationPageProps {
  className?: string;
}

const SESRegistrationPage: React.FC<SESRegistrationPageProps> = ({ className = '' }) => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    try {
      setIsLoading(true);
      // TODO: Implementar la carga real desde Supabase
      // Por ahora usamos datos de ejemplo
      const mockSubmissions = [
        {
          id: '1',
          propertyId: 'prop1',
          propertyName: 'Beach House',
          guestName: 'John Doe',
          documentType: 'passport',
          documentNumber: 'AB123456',
          submissionDate: new Date().toISOString(),
          status: 'pending'
        },
        {
          id: '2',
          propertyId: 'prop2',
          propertyName: 'Mountain Cabin',
          guestName: 'Jane Smith',
          documentType: 'dni',
          documentNumber: '12345678X',
          submissionDate: new Date(Date.now() - 86400000).toISOString(),
          status: 'submitted'
        },
        {
          id: '3',
          propertyId: 'prop3',
          propertyName: 'City Apartment',
          guestName: 'Robert Johnson',
          documentType: 'passport',
          documentNumber: 'CD789012',
          submissionDate: new Date(Date.now() - 172800000).toISOString(),
          status: 'error',
          errorMessage: 'Error de conexión con el servidor SES'
        }
      ];
      setSubmissions(mockSubmissions);
    } catch (error) {
      console.error('Error loading submissions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmissionRetry = async (submissionId: string) => {
    try {
      // TODO: Implementar el reintento de envío
      console.log('Retrying submission:', submissionId);
      await loadSubmissions(); // Recargar la lista después del reintento
    } catch (error) {
      console.error('Error retrying submission:', error);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTravelerSubmit = (data: TravelerFormData) => {
    // En una implementación real, aquí enviaríamos los datos al backend
    console.log("Datos del viajero:", data);
    alert(t("dashboard.ses.travelerRegistered"));
    setShowRegistrationForm(false);
  };

  return (
    <div className={`min-h-screen bg-gray-100 ${className}`}>
      {/* Header con navegación */}
      <DashboardHeader onSignOut={handleSignOut} />

      {/* Navegación secundaria */}
      <DashboardNavigation />

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <div className="mb-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {t("dashboard.ses.title")}
            </h1>
            <button
              onClick={() => setShowRegistrationForm(true)}
              className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition duration-150"
            >
              {t("dashboard.ses.newRegistration")}
            </button>
          </div>

          {showRegistrationForm ? (
            <TravelerRegistrationForm
              onSubmit={async (data) => {
                // TODO: Implementar el envío real
                console.log('Form submitted:', data);
                await loadSubmissions(); // Recargar la lista después del envío
              }}
              onCancel={() => setShowRegistrationForm(false)}
            />
          ) : (
            <>
              <div className="bg-white rounded-lg shadow p-6 mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  {t("dashboard.ses.relevantInfo.title")}
                </h2>

                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p>
                        <strong>{t("common.important")}:</strong> {t("dashboard.ses.relevantInfo.content")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2">
                      {t("dashboard.ses.sections.mandatory.title")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("dashboard.ses.sections.mandatory.description")}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2">
                      {t("dashboard.ses.sections.optional.title")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("dashboard.ses.sections.optional.description")}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="font-medium text-gray-800 mb-2">
                      {t("common.documentation")}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {t("common.sesDocumentationDesc")}
                    </p>
                  </div>
                </div>
              </div>

              <SESStatusPanel />

              {/* Historial de envíos */}
              <SESSubmissionHistory
                submissions={submissions}
                isLoading={isLoading}
                onRetry={handleSubmissionRetry}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default SESRegistrationPage;
