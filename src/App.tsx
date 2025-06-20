import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./shared/contexts/AuthContext";
import { LanguageProvider } from "./shared/contexts/LanguageContext";
import { PaymentFlowProvider } from "./shared/contexts/PaymentFlowContext";
import "./index.css";
import "./App.css";
import { Toaster } from "react-hot-toast";
import LoadingScreen from "./shared/components/LoadingScreen";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import { getProtectedRoutes } from "./config/routes";
import { HelmetProvider } from "react-helmet-async";

// Lazy load pages for better performance
const LandingPage = lazy(() => import("./features/landing/LandingPage"));
const ChatbotPage = lazy(() => import("./features/landing/ChatbotPage"));
const CheckinPage = lazy(() => import("./features/landing/CheckinPage"));
const UpsellingPage = lazy(() => import("./features/landing/UpsellingPage"));
const PricingPage = lazy(() => import("./features/landing/Pricing"));
const TestimoniosPage = lazy(() => import("./features/landing/Testimonios"));
const ScheduleDemoPage = lazy(() => import("./features/landing/ScheduleDemoPage"));
const LoginPage = lazy(() => import("./features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("./features/auth/pages/RegisterPage"));
const AuthCallbackPage = lazy(() => import("./features/auth/pages/AuthCallbackPage"));
const DashboardPage = lazy(() => import("./features/dashboard/DashboardPage"));
const PaymentSuccessPage = lazy(() => import("./features/payment/PaymentSuccess"));
const NotFoundPage = lazy(() => import("./shared/components/NotFoundPage"));
const SESRegistrationPage = lazy(() => import('./features/ses/SESRegistrationPage'));

// TEMPORAL: Componente de testing
// const TestConnectivity = lazy(() => import("./components/TestConnectivity"));

// Componente para rastrear navegación
const RouteTracker = () => {
  const location = useLocation();
  
  // Registrar cambio de página
  useEffect(() => {
    // Uso de importación dinámica para evitar problemas
    import('./services/analytics').then(({ logPageView }) => {
      try {
        logPageView(location.pathname + location.search);
      } catch (error) {
        console.error('Error al registrar vista de página:', error);
      }
    }).catch(error => {
      console.error('Error al importar servicio de analytics:', error);
    });
  }, [location]);
  
  return null;
};

function App() {
  // Obtenemos las rutas públicas y protegidas
  const protectedRoutes = getProtectedRoutes();

  // Inicializar Google Analytics
  useEffect(() => {
    // Obtener ID de medición del entorno
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (measurementId) {
      // Importación dinámica para evitar problemas de Server-Side Rendering
      import('./services/analytics').then(({ initGA }) => {
        initGA(measurementId);
      });
    } else {
      console.warn('ID de medición de Google Analytics no configurado en las variables de entorno');
    }
  }, []);

  return (
    <div className="w-full min-h-screen">
      <HelmetProvider>
        <LanguageProvider>
          <AuthProvider>
            <PaymentFlowProvider>
            <Router>
              <RouteTracker />
              <Suspense fallback={<LoadingScreen />}>
                <Routes>
                  {/* Rutas públicas */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/chatbot" element={<ChatbotPage />} />
                  <Route path="/check-in" element={<CheckinPage />} />
                  <Route path="/upselling" element={<UpsellingPage />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/testimonios" element={<TestimoniosPage />} />
                  <Route path="/schedule-demo" element={<ScheduleDemoPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  <Route path="/payment/success" element={<PaymentSuccessPage />} />

                    {/* TEMPORAL: Ruta de testing */}
                    {/* <Route path="/test-connectivity" element={<TestConnectivity />} /> */}

                  {/* Rutas protegidas */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Definir el resto de rutas protegidas de forma dinámica */}
                  {protectedRoutes
                    .filter((route) => route.path !== "/dashboard") // Excluimos la ruta que ya definimos
                    .map((route) => {
                      const Component = lazy(
                        () => {
                          // Intentar diferentes combinaciones de rutas para manejar estructuras de carpetas inconsistentes
                          const componentName = route.componentName;
                          const folderName = componentName.toLowerCase();
                          const alternativeFolderName = componentName.toLowerCase().replace('page', '');
                          
                          // Para PropertiesPage y ReservationsPage, usar nombres específicos
                          if (componentName === 'PropertiesPage') {
                            return import(/* @vite-ignore */ './features/propertiespage/PropertiesPage.tsx');
                          }
                          
                          if (componentName === 'ReservationsPage') {
                            return import(/* @vite-ignore */ './features/reservations/ReservationsPage.tsx');
                          }
                          
                          // Para la página SES, usar la ruta específica
                          if (componentName === 'SESRegistrationPage') {
                            return import(/* @vite-ignore */ './features/ses/SESRegistrationPage.tsx');
                          }
                          
                          // Para otros componentes, usar la estructura general
                          return import(/* @vite-ignore */ `./features/${alternativeFolderName}/${componentName}.tsx`);
                        }
                      );
                      return (
                        <Route
                          key={route.path}
                          path={route.path}
                          element={
                            <ProtectedRoute>
                              <Component />
                            </ProtectedRoute>
                          }
                        />
                      );
                    })}

                  {/* Ruta 404 para cualquier otra URL */}
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </Router>
            </PaymentFlowProvider>
          </AuthProvider>
        </LanguageProvider>
      </HelmetProvider>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#fff",
            color: "#333",
          },
          success: {
            style: {
              border: "1px solid #10b981",
            },
          },
          error: {
            style: {
              border: "1px solid #ef4444",
            },
          },
        }}
      />
    </div>
  );
}

export default App;
