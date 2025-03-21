import React, { useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

interface CalendlyWidgetProps {
  url?: string;
  text?: string;
}

const CalendlyWidget: React.FC<CalendlyWidgetProps> = ({ 
  url = "https://calendly.com/hosthelperai-services", 
  text 
}) => {
  const { t } = useLanguage();
  
  useEffect(() => {
    // Load Calendly script
    const script = document.createElement('script');
    script.src = 'https://assets.calendly.com/assets/external/widget.js';
    script.async = true;
    document.body.appendChild(script);
    
    return () => {
      // Cleanup
      document.body.removeChild(script);
    };
  }, []);
  
  return (
    <section className="py-12 md:py-16 bg-gray-50 w-full">
      <div className="container-limited">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            {text || t('calendly.title')}
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
            {t('calendly.subtitle')}
          </p>
        </div>
        
        <div className="calendly-inline-widget" 
          data-url={url}
          style={{ minWidth: '320px', height: '630px' }}>
        </div>
      </div>
    </section>
  );
};

export default CalendlyWidget; 