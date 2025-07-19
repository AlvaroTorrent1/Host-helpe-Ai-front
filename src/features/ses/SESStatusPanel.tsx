import React, { useState } from "react";
import { useTranslation } from "react-i18next";

interface SESSubmission {
  id: string;
  property_name: string;
  guest_name: string;
  check_in_date: string;
  status: "pending" | "submitted" | "approved" | "error";
  submission_date?: string;
  confirmation_code?: string;
  error_message?: string;
}

const SESStatusPanel: React.FC = () => {
  const { t } = useTranslation();
  
  // Array vacío en lugar de mock data
  const [submissions] = useState<SESSubmission[]>([]);

  // Función para mostrar el estado de manera amigable
  const renderStatus = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            {t("dashboard.ses.status.approved")}
          </span>
        );
      case "submitted":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            {t("dashboard.ses.status.submitted")}
          </span>
        );
      case "pending":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            {t("dashboard.ses.status.pending")}
          </span>
        );
      case "error":
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            {t("dashboard.ses.status.error")}
          </span>
        );
      default:
        return status;
    }
  };

  const handleRetry = (id: string) => {
    alert(t("dashboard.ses.statusPanel.retrySuccess"));
  };

  const handleGenerateLink = (id: string) => {
    alert(t("dashboard.ses.statusPanel.linkGenerated"));
  };

  // Contador de registros pendientes
  const pendingCount = submissions.filter(s => s.status === "pending" || s.status === "error").length;
  // Tasa de aprobación
  const approvedCount = submissions.filter(s => s.status === "approved").length;
  const submittedCount = submissions.filter(s => s.status !== "pending").length;
  const approvalRate = submittedCount > 0 ? Math.round((approvedCount / submittedCount) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">
        {t("dashboard.ses.statusPanel.title")}
      </h2>

      <div className="flex justify-between mb-4">
        <div>
          <span className="text-gray-700">{t("dashboard.ses.statusPanel.pending")}</span>
          <span className="ml-2 text-xl font-semibold">{pendingCount}</span>
        </div>
        <div>
          <span className="text-gray-700">{t("dashboard.ses.statusPanel.approvalRate")}</span>
          <span className="ml-2 text-xl font-semibold">{approvalRate}%</span>
        </div>
      </div>

      <div className="mb-4 flex space-x-2">
        <button className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
          {t("dashboard.ses.statusPanel.all")}
        </button>
        <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
          {t("dashboard.ses.status.pending")}
        </button>
        <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
          {t("dashboard.ses.status.approved")}
        </button>
        <button className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
          {t("dashboard.ses.status.error")}
        </button>
      </div>

      {submissions.length === 0 ? (
        <div className="py-8 text-center text-gray-500">
          {t("dashboard.ses.statusPanel.noSubmissions")}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="text-left font-medium text-gray-500 uppercase tracking-wider py-3">
                  {t("dashboard.ses.statusPanel.property")}
                </th>
                <th className="text-left font-medium text-gray-500 uppercase tracking-wider py-3">
                  {t("dashboard.ses.statusPanel.guest")}
                </th>
                <th className="text-left font-medium text-gray-500 uppercase tracking-wider py-3">
                  {t("dashboard.ses.statusPanel.checkInDate")}
                </th>
                <th className="text-left font-medium text-gray-500 uppercase tracking-wider py-3">
                  {t("dashboard.ses.statusPanel.status")}
                </th>
                <th className="text-left font-medium text-gray-500 uppercase tracking-wider py-3">
                  {t("dashboard.ses.statusPanel.submissionDate")}
                </th>
                <th className="text-left font-medium text-gray-500 uppercase tracking-wider py-3">
                  {t("dashboard.ses.statusPanel.actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((submission, index) => (
                <tr 
                  key={submission.id} 
                  className={index % 2 === 0 ? "bg-white border-b border-gray-100" : "bg-gray-50 border-b border-gray-100"}
                >
                  <td className="py-4 pr-4 text-sm text-gray-900 text-left">
                    {submission.property_name}
                  </td>
                  <td className="py-4 pr-4 text-sm text-gray-900 text-left">
                    {submission.guest_name}
                  </td>
                  <td className="py-4 pr-4 text-sm text-gray-500 text-left">
                    {new Date(submission.check_in_date).toLocaleDateString()}
                  </td>
                  <td className="py-4 pr-4 text-left">
                    {renderStatus(submission.status)}
                  </td>
                  <td className="py-4 pr-4 text-sm text-gray-500 text-left">
                    {submission.submission_date
                      ? new Date(submission.submission_date).toLocaleString()
                      : "—"}
                  </td>
                  <td className="py-4 text-sm text-gray-500 text-left">
                    {submission.status === "error" && (
                      <button
                        onClick={() => handleRetry(submission.id)}
                        className="text-primary-600 hover:text-primary-900 mr-2"
                      >
                        {t("dashboard.ses.statusPanel.retry")}
                      </button>
                    )}

                    {submission.status === "pending" && (
                      <button
                        onClick={() => handleGenerateLink(submission.id)}
                        className="text-primary-600 hover:text-primary-900"
                      >
                        {t("dashboard.ses.statusPanel.generateLink")}
                      </button>
                    )}

                    {submission.confirmation_code && (
                      <span className="text-xs text-gray-500 block mt-1">
                        {t("common.referenceCode")}: {submission.confirmation_code}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SESStatusPanel;
