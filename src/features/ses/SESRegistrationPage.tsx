import React from 'react';
import { Link } from "react-router-dom";
import { useAuth } from "@shared/contexts/AuthContext";
import DashboardNavigation from "@features/dashboard/DashboardNavigation";
import DashboardHeader from "@shared/components/DashboardHeader";
import { useLanguage } from "@shared/contexts/LanguageContext";

interface SESRegistrationPageProps {
  className?: string;
}

const SESRegistrationPage: React.FC<SESRegistrationPageProps> = ({ className = '' }) => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();

  // Fallback text in case translations are missing
  const fallbackText = {
    workInProgress: "We are working on this functionality. The page will be ready soon.",
    importantNotice: "Traveler registration in the SES system is mandatory for all tourist accommodations in Spain.",
    backToDashboard: "Back to Dashboard"
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className={`min-h-screen bg-gray-100 ${className}`}>
      {/* Header con navegación */}
      <DashboardHeader onSignOut={handleSignOut} />

      {/* Navegación secundaria */}
      <DashboardNavigation />

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow-sm rounded-lg p-8 text-center">
          <div className="mb-6">
            <svg className="w-16 h-16 text-primary-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {t("dashboard.ses.title")}
            </h2>
          </div>

          <p className="text-lg text-gray-600 mb-6">
            {t("dashboard.ses.workInProgress") || fallbackText.workInProgress}
          </p>

          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 text-yellow-700 mb-6 inline-block mx-auto text-left">
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
                  <strong>{t("common.important")}:</strong> {t("dashboard.ses.importantNotice") || fallbackText.importantNotice}
                      </p>
                    </div>
                  </div>
                </div>

          <Link
            to="/dashboard"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {t("dashboard.ses.backToDashboard") || fallbackText.backToDashboard}
          </Link>
        </div>
      </main>
    </div>
  );
};

export default SESRegistrationPage;
