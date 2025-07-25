// src/features/reservations/components/ReservationTabs.tsx

import React from "react";
import { useTranslation } from "react-i18next";
import { ReservationTabType } from "../utils/reservationFilters";

interface ReservationTabsProps {
  activeTab: ReservationTabType;
  onTabChange: (tab: ReservationTabType) => void;
  currentCount: number;
  pastCount: number;
}

/**
 * Componente de pestañas para navegación entre reservas actuales y pasadas
 */
const ReservationTabs: React.FC<ReservationTabsProps> = ({
  activeTab,
  onTabChange,
  currentCount,
  pastCount,
}) => {
  const { t } = useTranslation();

  const tabs = [
    {
      id: 'current' as ReservationTabType,
      label: t("reservations.tabs.current"),
      count: currentCount,
    },
    {
      id: 'past' as ReservationTabType,
      label: t("reservations.tabs.past"),
      count: pastCount,
    },
  ];

  return (
    <div className="flex items-center space-x-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`${
            activeTab === tab.id
              ? "text-gray-900 font-semibold border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-700 font-medium"
          } pb-2 whitespace-nowrap text-lg transition-colors duration-200 flex items-center`}
        >
          {tab.label}
          {tab.count > 0 && (
            <span
              className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                activeTab === tab.id
                  ? "bg-gray-100 text-gray-800"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default ReservationTabs; 