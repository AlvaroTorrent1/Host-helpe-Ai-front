import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AuthProvider } from "./shared/contexts/AuthContext";
import { PaymentFlowProvider } from "./shared/contexts/PaymentFlowContext";
import { GlobalLoadingProvider } from "./shared/contexts/GlobalLoadingContext";
import { UserStatusProvider } from "./shared/contexts/UserStatusContext";
import "./index.css";
import "./App.css";
import "./i18n"; // Importar i18n para inicializarlo
import { Toaster } from "react-hot-toast";
import { LoadingScreen } from "./shared/components/loading";
import ProtectedRoute from "./shared/components/ProtectedRoute";
import { getProtectedRoutes } from "./config/routes";
import { HelmetProvider } from "react-helmet-async";

// Lazy loading de componentes
const LandingPage = lazy(() => import("./features/landing/LandingPage"));
const ChatbotPage = lazy(() => import("./features/landing/ChatbotPage"));
const CheckinPage = lazy(() => import("./features/landing/CheckinPage"));
const UpsellingPage = lazy(() => import("./features/landing/UpsellingPage"));
const PricingPage = lazy(() => import("./features/landing/Pricing"));
const SesRegistroPage = lazy(() => import("./features/sesregistro/SesRegistroPage"));
// const TestimoniosPage = lazy(() => import("./features/landing/Testimonios"));
const PrivacyPolicyPage = lazy(() => import("./features/landing/PrivacyPolicy"));
const TerminosCondicionesPage = lazy(() => import("./features/landing/TerminosYCondiciones"));
const DataDeletionPage = lazy(() => import("./features/landing/DataDeletion"));
const DeletionStatusPage = lazy(() => import("./features/landing/DeletionStatus"));
const ScheduleDemoPage = lazy(() => import("./features/landing/ScheduleDemoPage"));
const LoginPage = lazy(() => import("./features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("./features/auth/pages/RegisterPage"));
const AuthCallbackPage = lazy(() => import("./features/auth/pages/AuthCallbackPage"));
const PaymentSuccessPage = lazy(() => import("./features/payment/PaymentSuccess"));
const DashboardPage = lazy(() => import("./features/dashboard/DashboardPage"));
const NotFoundPage = lazy(() => import("./shared/components/NotFoundPage"));
const PropertyManagement = lazy(() => import("./features/properties/PropertyManagement"));

// Componente para rastrear navegación
const RouteTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
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
  const protectedRoutes = getProtectedRoutes();

  useEffect(() => {
    const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
    if (measurementId) {
      import('./services/analytics').then(({ initGA }) => {
        initGA(measurementId);
      });
    } else {
      console.warn('ID de medición de Google Analytics no configurado en las variables de entorno');
    }
  }, []);

  return (
    <GlobalLoadingProvider>
      <AuthProvider>
        <UserStatusProvider>
          <PaymentFlowProvider>
            <div className="w-full min-h-screen">
              <HelmetProvider>
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
                      {/* Redirección suave a la sección de testimonios en la landing */}
                      <Route path="/testimonios" element={<LandingPage />} />
                      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
                      <Route path="/terminos-condiciones" element={<TerminosCondicionesPage />} />
                      <Route path="/data-deletion" element={<DataDeletionPage />} />
                      <Route path="/deletion-status" element={<DeletionStatusPage />} />
                      <Route path="/schedule-demo" element={<ScheduleDemoPage />} />
                      <Route path="/login" element={<LoginPage />} />
                      <Route path="/register" element={<RegisterPage />} />
                      <Route path="/auth/callback" element={<AuthCallbackPage />} />
                      <Route path="/payment/success" element={<PaymentSuccessPage />} />
                      
                      {/* Ruta pública para Check-in de turistas (SES Registro) */}
                      <Route path="/check-in/:propertyName" element={<SesRegistroPage />} />

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
                        .filter((route) => route.path !== "/dashboard")
                        .map((route) => {
                          const Component = lazy(() => {
                            const componentName = route.componentName;
                            
                            if (componentName === 'PropertiesPage') {
                              return import('./features/propertiespage/PropertiesPage.tsx');
                            }
                            
                            if (componentName === 'ReservationsPage') {
                              return import('./features/reservations/ReservationsPage.tsx');
                            }
                            

                            
                            const alternativeFolderName = componentName.toLowerCase().replace('page', '');
                            return import(`./features/${alternativeFolderName}/${componentName}.tsx`);
                          });
                          
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

                      {/* Nueva ruta temporal para acceder al PropertyManagement correcto */}
                      <Route 
                        path="/properties/management" 
                        element={
                          <ProtectedRoute>
                            <PropertyManagement />
                          </ProtectedRoute>
                        } 
                      />
                    </Routes>
                  </Suspense>
                </Router>
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
          </PaymentFlowProvider>
        </UserStatusProvider>
      </AuthProvider>
    </GlobalLoadingProvider>
  );
}

export default App;
