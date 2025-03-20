import React from 'react';
import { Link } from 'react-router-dom';
import MobileMenu from '../components/MobileMenu';

const Testimonios = () => {
  // Navigation links configuration
  const navLinks = [
    { text: 'Características', href: '#features' },
    { text: 'Precios', href: '/pricing' },
    { text: 'Testimonios', href: '/testimonios' },
    { text: 'Iniciar sesión', href: '/login', isButton: true }
  ];

  // Testimonials data
  const testimonials = [
    {
      id: 1,
      name: 'Casa Rural El Pilar',
      image: '/imagenes/ELPILAR.jpg',
      description: 'Alojamiento rural con encanto en Sierra de Gata, Extremadura.',
      testimonial: 'Host Helper ha transformado nuestra gestión de reservas. Los huéspedes están encantados con la atención 24/7 y nosotros ahorramos tiempo en responder preguntas repetitivas.',
      author: 'María González',
      position: 'Propietaria',
      website: 'https://www.casaruralelpilar.com/'
    },
    {
      id: 2,
      name: 'Solset Nerja',
      image: '/imagenes/Solset.png',
      description: 'Apartamentos con vistas al mar con terrazas privadas y piscina en Nerja.',
      testimonial: 'Desde que implementamos Host Helper, nuestros huéspedes pueden hacer check-in sin problemas a cualquier hora. Hemos aumentado nuestras valoraciones en un 20%.',
      author: 'Carlos Ruiz',
      position: 'Director',
      website: 'https://solsetnerja.com/en/'
    },
    {
      id: 3,
      name: 'Alojamientos Doña Lola',
      image: '/imagenes/pic9.png',
      description: 'Alojamiento boutique en el centro histórico de Lucena.',
      testimonial: 'La función de venta de servicios adicionales nos ha permitido aumentar nuestros ingresos en un 30%. Los huéspedes valoran mucho la facilidad para solicitar servicios extra.',
      author: 'Lola Martínez',
      position: 'Gerente',
      website: 'https://lolaalojamientos.com/'
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm w-full">
        <div className="container-limited py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center">
            <img 
              src="/imagenes/Logo_hosthelper_new.png" 
              alt="Host Helper AI Logo" 
              className="h-20 sm:h-36 responsive-img" 
            />
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <ul className="flex space-x-4 mr-4">
              {navLinks.map((link, index) => (
                <li key={index}>
                  {link.href.startsWith('/') ? (
                    <Link 
                      to={link.href} 
                      className={link.isButton 
                        ? "bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md" 
                        : "text-gray-600 hover:text-primary-500"
                      }
                    >
                      {link.text}
                    </Link>
                  ) : (
                    <a href={link.href} className="text-gray-600 hover:text-primary-500">
                      {link.text}
                    </a>
                  )}
                </li>
              ))}
            </ul>
            
            {/* Language Selector */}
            <div className="relative group mr-4">
              <button className="flex items-center space-x-1 text-gray-600 hover:text-primary-500 focus:outline-none">
                <span>ES</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              <div className="absolute right-0 mt-2 py-2 w-28 bg-white shadow-lg rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50">
                <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center space-x-2">
                  <span>ES</span>
                  <span>Español</span>
                </a>
                <a href="#" className="block px-4 py-2 text-gray-800 hover:bg-gray-100 flex items-center space-x-2">
                  <span>EN</span>
                  <span>English</span>
                </a>
              </div>
            </div>
          </nav>

          {/* Mobile Menu */}
          <MobileMenu links={navLinks} />
        </div>
      </header>

      <main>
        {/* Page Header */}
        <section className="bg-gradient-to-r from-[#ECA408] to-[#F5B730] py-16 w-full">
          <div className="container-limited">
            <div className="text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">Testimonios</h1>
              <p className="text-xl text-white opacity-90 max-w-2xl mx-auto">
                Lo que dicen nuestros clientes sobre Host Helper AI
              </p>
            </div>
          </div>
        </section>

        {/* Featured Testimonials */}
        <section className="py-16 bg-white">
          <div className="container-limited">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id} 
                  className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform hover:translate-y-[-5px] border border-gray-200"
                >
                  <div className="relative h-56 overflow-hidden">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{testimonial.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{testimonial.description}</p>
                    
                    <div className="mb-6 relative">
                      <div className="absolute -top-2 -left-2 text-4xl text-primary-300 opacity-50">"</div>
                      <p className="text-gray-700 italic relative z-10 pl-4">
                        {testimonial.testimonial}
                      </p>
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
                        Visitar web
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* More Testimonials (Text-based) */}
        <section className="py-16 bg-gray-50">
          <div className="container-limited">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-10 text-center">
              Más experiencias de nuestros clientes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      AM
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Ana Moreno</h3>
                    <p className="text-sm text-gray-600">Apartamentos Turísticos Sevilla</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  "El asistente virtual de Host Helper ha sido una revolución para nuestra gestión diaria. Los huéspedes reciben respuestas inmediatas y nosotros podemos centrarnos en mejorar otros aspectos del negocio."
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      JL
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Javier López</h3>
                    <p className="text-sm text-gray-600">Villa Costa del Sol</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  "Hemos reducido en un 70% el tiempo que dedicábamos a responder preguntas básicas de los huéspedes. La integración fue muy sencilla y el equipo de soporte siempre está disponible."
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      PG
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Patricia García</h3>
                    <p className="text-sm text-gray-600">Hostal Madrid Centro</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  "Lo que más me gusta es que los huéspedes pueden hacer check-in a cualquier hora sin problemas. Es como tener un recepcionista 24/7 pero sin los costes asociados."
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                      RF
                    </div>
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold">Ricardo Fernández</h3>
                    <p className="text-sm text-gray-600">Apartamentos Turísticos Barcelona</p>
                  </div>
                </div>
                <p className="text-gray-700">
                  "Desde que implementamos Host Helper, hemos incrementado nuestras ventas de servicios adicionales en un 40%. Es increíble cómo el chatbot puede sugerir servicios de forma natural y no intrusiva."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-gradient-to-r from-[#ECA408] to-[#F5B730]">
          <div className="container-limited text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Únete a nuestros clientes satisfechos
            </h2>
            <p className="text-white text-lg mb-8 max-w-2xl mx-auto">
              Comienza a disfrutar de los beneficios de Host Helper AI y transforma la gestión de tus alojamientos
            </p>
            <Link 
              to="/register" 
              className="inline-block px-8 py-4 bg-white text-primary-600 font-semibold rounded-md hover:bg-gray-100 transition-colors"
            >
              Solicitar demo gratuita
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 text-gray-800 py-6 w-full relative overflow-hidden">
        {/* Elementos decorativos */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 via-amber-300 to-primary-400 opacity-70"></div>
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-primary-300 rounded-full opacity-10"></div>
        <div className="absolute -top-10 right-10 w-24 h-24 bg-amber-300 rounded-full opacity-10"></div>
        
        <div className="container-limited relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-center">
            {/* Con el apoyo de - Left */}
            <div className="flex flex-col items-center md:items-start">
              <h4 className="text-lg font-medium mb-3 relative inline-block">
                Con el apoyo de
                <span className="absolute -bottom-1 left-1/2 md:left-0 transform -translate-x-1/2 md:translate-x-0 w-10 h-0.5 bg-primary-400"></span>
              </h4>
              <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
                <img 
                  src="/imagenes/LogoMentorDay.png" 
                  alt="MentorDay" 
                  className="max-h-[3.25rem] w-auto object-contain"
                />
                <img 
                  src="/imagenes/logo_eoi.jpg" 
                  alt="Escuela de Organización Industrial" 
                  className="max-h-[3.25rem] w-auto object-contain"
                />
                <img 
                  src="/imagenes/logo_microsoft_for_startups.png" 
                  alt="Microsoft for Startups" 
                  className="max-h-[3.25rem] w-auto object-contain"
                />
                <img 
                  src="/imagenes/logo-incibe.png" 
                  alt="Incibe" 
                  className="max-h-[3.25rem] w-auto object-contain"
                />
                <img 
                  src="/imagenes/andalucia lab.jpg" 
                  alt="Andalucía Lab" 
                  className="max-h-[3.25rem] w-auto object-contain"
                />
              </div>
            </div>
            
            {/* Redes sociales - Centro */}
            <div className="flex flex-col items-center justify-center">
              <h4 className="text-lg font-medium mb-3 relative inline-block">
                Síguenos
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-primary-400"></span>
              </h4>
              <div className="flex space-x-4 justify-center">
                <a href="https://www.linkedin.com/company/host-helper-ai" className="group" aria-label="LinkedIn">
                  <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                    <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </div>
                </a>
                <a href="https://www.instagram.com/host_helper_ai/" className="group" aria-label="Instagram">
                  <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                    <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                </a>
                <a href="https://www.youtube.com/@HostHelperAi" className="group" aria-label="YouTube">
                  <div className="p-3 bg-white rounded-full shadow-sm group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                    <svg className="w-5 h-5 text-primary-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                    </svg>
                  </div>
                </a>
              </div>
            </div>

            {/* Contacto - Derecha */}
            <div className="flex flex-col items-center md:items-end">
              <h4 className="text-lg font-medium mb-3 relative inline-block">
                Contacto
                <span className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-10 h-0.5 bg-primary-400"></span>
              </h4>
              <div className="flex flex-col space-y-2">
                <a href="mailto:support@hosthelperai.com" className="group flex items-center justify-center md:justify-end text-gray-600 hover:text-primary-600 transition-colors">
                  <div className="bg-white p-2 rounded-full shadow-sm mr-3 group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                    <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">support@hosthelperai.com</span>
                </a>
                <a href="tel:+34687472327" className="group flex items-center justify-center md:justify-end text-gray-600 hover:text-primary-600 transition-colors">
                  <div className="bg-white p-2 rounded-full shadow-sm mr-3 group-hover:shadow-md group-hover:translate-y-[-2px] transition-all duration-300">
                    <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <span className="text-sm group-hover:translate-x-1 transition-transform duration-300">+34 687 472 327</span>
                </a>
              </div>
            </div>
          </div>
          
          {/* Host Helper Logo & Description - Moved to bottom center */}
          <div className="mt-6 pt-4 border-t border-gray-200/50 flex flex-col items-center">
            <img 
              src="/imagenes/Logo_hosthelper_new.png" 
              alt="Host Helper AI Logo" 
              className="h-28 md:h-28 responsive-img mb-2" 
            />
            <div className="h-0.5 w-16 bg-gradient-to-r from-primary-400 to-amber-300 rounded mb-2"></div>
            <p className="text-gray-600 text-sm max-w-xs text-center mt-1">
              Automatizando la gestión de alojamientos turísticos con IA
            </p>
          </div>
          
          <div className="mt-6 pt-3 border-t border-gray-200/50 text-center">
            <p className="text-gray-500 text-xs">© 2025 Host Helper AI. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Testimonios; 