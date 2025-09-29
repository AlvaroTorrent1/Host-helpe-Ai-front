// File: src/features/landing/components/FeaturedTestimonials.tsx
// Componente extraído desde Testimonios.tsx para reutilizar la sección
// "Testimonios Destacados" dentro de la landing. Incluye id="testimonios".

import React from "react";
import { useTranslation } from "react-i18next";

const FeaturedTestimonials: React.FC = () => {
  const { t } = useTranslation();

  const testimonials = [
    {
      id: 1,
      name: "Casa Rural El Pilar",
      image: "/imagenes/ELPILAR.jpg",
      description: t("testimonials.testimonial1.description"),
      testimonial: t("testimonials.testimonial1.text"),
      author: t("testimonials.testimonial1.author"),
      position: t("testimonials.testimonial1.position"),
      website: "https://www.casaruralelpilar.com/",
    },
    {
      id: 2,
      name: "Casa María Flora",
      image: "/imagenes/OjenSpain-scaled.jpeg",
      description: t("testimonials.testimonial2.description"),
      testimonial: t("testimonials.testimonial2.text"),
      author: t("testimonials.testimonial2.author"),
      position: t("testimonials.testimonial2.position"),
      website: "https://casa-maria-flora.com/",
    },
    {
      id: 3,
      name: "Hotel Platería",
      image: "/imagenes/Hotel plateria.png",
      description: t("testimonials.testimonial3.description"),
      testimonial: t("testimonials.testimonial3.text"),
      author: t("testimonials.testimonial3.author"),
      position: t("testimonials.testimonial3.position"),
      website:
        "https://booking.com/hotel/es/plateria.en.html?aid=311984;label=plateria-u6VTVmJODM99KTPrtpSm3wS442477547736:pl:ta:p1:p2:ac:ap:neg:fi:tikwd-12683080509:lp9197933:li:dec:dm:ppccp=UmFuZG9tSVYkc2RlIyh9YTQUGSsRwx9_3qo3uPTHyoo;ws=&gad_source=1&gad_campaignid=345388365&gbraid=0AAAAAD_Ls1Jx88C1asg6z3lYFUWDHMa5E&gclid=CjwKCAjwtrXFBhBiEiwAEKen13goyq_hFjOzuqItGj0oBixZdgDBXTIJcIlKmsUjyplVjPMFrK86CRoCgcUQAvD_BwE",
    },
  ];

  return (
    <section id="testimonios" className="py-16 bg-gray-100 scroll-mt-24 md:scroll-mt-28">
      <div className="container-limited">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            {t("testimonials.title")}
          </h2>
        </div>

        <div className="flex md:grid md:grid-cols-3 gap-4 md:gap-8 overflow-x-auto md:overflow-x-visible scrollbar-hide px-4 md:px-0 mobile-carousel">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={`w-[calc(100vw-2rem)] md:w-auto mobile-carousel-item flex-shrink-0 bg-white rounded-xl shadow-xl hover:shadow-2xl overflow-hidden transition-all duration-300 border border-gray-200`}
            >
              <div className="relative h-56 overflow-hidden">
                <img src={testimonial.image} alt={testimonial.name} className="w-full h-full object-cover" />
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{testimonial.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{testimonial.description}</p>

                <div className="mb-6 relative">
                  <div className="absolute -top-2 -left-2 text-4xl text-primary-300 opacity-50">"</div>
                  <p className="text-gray-700 italic relative z-10 pl-4">{testimonial.testimonial}</p>
                  <div className="absolute -bottom-4 -right-2 text-4xl text-primary-300 opacity-50">"</div>
                </div>

                <div className="flex justify-between items-center mt-6">
                  <div>
                    <p className="font-semibold text-gray-900">{testimonial.author}</p>
                    <p className="text-sm text-gray-600">{testimonial.position}</p>
                  </div>
                  <a
                    href={testimonial.website}
                    className="text-primary-500 hover:text-primary-600 text-sm font-medium"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {t("testimonials.visitWebsite")}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedTestimonials;


