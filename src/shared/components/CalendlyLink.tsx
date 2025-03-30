import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

const CalendlyLink: React.FC = () => {
  const { t } = useLanguage();

  return (
    <Link
      to="/schedule-demo"
      className="inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-white text-primary-600 font-medium rounded-md hover:bg-gray-100 transition-colors shadow-md hover:shadow-lg group text-center w-full sm:w-auto"
    >
      <span className="mr-2 flex items-center justify-center">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="group-hover:scale-110 transition-transform duration-300"
        >
          <path
            d="M19.25 11.5C19.25 16.0593 15.5593 19.75 11 19.75C6.44065 19.75 2.75 16.0593 2.75 11.5C2.75 6.94065 6.44065 3.25 11 3.25C15.5593 3.25 19.25 6.94065 19.25 11.5Z"
            fill="#ECA408"
            stroke="#ECA408"
            strokeWidth="1.5"
          />
          <path
            d="M11 7.5V11.5L13.5 14"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M21.25 11.5C21.25 17.2132 16.7132 21.75 11 21.75C5.28679 21.75 0.75 17.2132 0.75 11.5C0.75 5.78679 5.28679 1.25 11 1.25C16.7132 1.25 21.25 5.78679 21.25 11.5Z"
            stroke="#ECA408"
            strokeWidth="0.5"
            strokeDasharray="1 3"
          />
        </svg>
      </span>
      <span className="group-hover:translate-x-1 transition-transform duration-300">
        {t("calendly.linkText")}
      </span>
    </Link>
  );
};

export default CalendlyLink;
