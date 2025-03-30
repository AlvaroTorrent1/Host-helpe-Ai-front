import React from "react";
import { useLanguage } from "@shared/contexts/LanguageContext";
import { LanguageCode } from "@translations/index";

const DashboardLanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();

  const handleLanguageChange = (lang: LanguageCode) => {
    setLanguage(lang);
  };

  return (
    <div className="flex items-center space-x-1 text-sm">
      <button
        onClick={() => handleLanguageChange("es")}
        className={`px-2 py-1 rounded ${
          language === "es"
            ? "bg-white text-gray-800 border border-gray-300"
            : "text-gray-600 hover:bg-white hover:border hover:border-gray-300"
        }`}
        aria-label="Español"
      >
        ES
      </button>
      <span className="text-gray-300">|</span>
      <button
        onClick={() => handleLanguageChange("en")}
        className={`px-2 py-1 rounded ${
          language === "en"
            ? "bg-white text-gray-800 border border-gray-300"
            : "text-gray-600 hover:bg-white hover:border hover:border-gray-300"
        }`}
        aria-label="English"
      >
        EN
      </button>
    </div>
  );
};

export default DashboardLanguageSelector;
