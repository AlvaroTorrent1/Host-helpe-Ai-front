import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

interface CalendlyWidgetProps {
  url?: string;
  text?: string;
}

const CalendlyWidget: React.FC<CalendlyWidgetProps> = ({
  url = "https://calendly.com/hosthelperai-services/30min",
  text,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    // Load Calendly script with improved handling
    const existingScript = document.querySelector('script[src*="calendly"]');
    
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://assets.calendly.com/assets/external/widget.js";
      script.async = true;
      document.head.appendChild(script);
      
      script.onload = () => {
        console.log('✅ CalendlyWidget: Script cargado');
        
        // Inicializar widget usando API cuando esté disponible
        setTimeout(() => {
          if ((window as any).Calendly) {
            const widget = document.querySelector('.calendly-inline-widget') as HTMLElement;
            if (widget) {
              (window as any).Calendly.initInlineWidget({
                url,
                parentElement: widget,
                prefill: {},
                utm: {}
              });
            }
          }
        }, 1000);
      };
    }

    return () => {
      // No cleanup to avoid navigation issues
    };
  }, [url]);

  return (
    <section className="py-12 md:py-16 bg-gray-50 w-full">
      <div className="container-limited">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {text || t("calendly.title")}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            {t("calendly.subtitle")}
          </p>
        </div>

        <div
          className="calendly-inline-widget"
          data-url={url}
          style={{ 
            minWidth: "320px", 
            height: "630px",
            width: "100%",
            border: "none",
            overflow: "hidden"
          }}
        ></div>
      </div>
    </section>
  );
};

export default CalendlyWidget;
