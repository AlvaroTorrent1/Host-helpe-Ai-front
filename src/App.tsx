import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './shared/contexts/AuthContext';
import { LanguageProvider } from './shared/contexts/LanguageContext';
import './index.css'
import './App.css'
import LoginPage from './features/auth/pages/LoginPage';
import RegisterPage from './features/auth/pages/RegisterPage';
import LandingPage from './features/landing/LandingPage';
import ChatbotPage from './features/landing/ChatbotPage';
import CheckinPage from './features/landing/CheckinPage';
import UpsellingPage from './features/landing/UpsellingPage';
import Pricing from './features/landing/Pricing';
import Testimonios from './features/landing/Testimonios';
import ScheduleDemoPage from './features/landing/ScheduleDemoPage';
import SESRegistrationPage from './features/ses/SESRegistrationPage';
import DashboardPage from './features/dashboard/DashboardPage';
import PropertyManagementPage from './features/properties/PropertyManagementPage';
import ReservationManagementPage from './features/reservations/ReservationManagementPage';
import ProtectedRoute from './features/auth/components/ProtectedRoute';
import NotFoundPage from './shared/components/NotFoundPage';
import { HelmetProvider } from 'react-helmet-async';

// Componente de carga
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

function App() {
  return (
    <div className="w-full min-h-screen overflow-hidden">
      <HelmetProvider>
        <LanguageProvider>
          <AuthProvider>
            <Router>
              <Routes>
                {/* Rutas públicas */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/testimonios" element={<Testimonios />} />
                <Route path="/schedule-demo" element={<ScheduleDemoPage />} />
                <Route path="/chatbot" element={<ChatbotPage />} />
                <Route path="/checkin" element={<CheckinPage />} />
                <Route path="/upselling" element={<UpsellingPage />} />
                
                {/* Rutas protegidas */}
                <Route 
                  path="/" 
                  element={
                    <ProtectedRoute>
                      <Outlet />
                    </ProtectedRoute>
                  }
                >
                  <Route 
                    path="dashboard" 
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <DashboardPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="properties" 
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <PropertyManagementPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="reservations" 
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <ReservationManagementPage />
                      </Suspense>
                    } 
                  />
                  <Route 
                    path="ses-registration" 
                    element={
                      <Suspense fallback={<LoadingSpinner />}>
                        <SESRegistrationPage />
                      </Suspense>
                    } 
                  />
                </Route>
                
                {/* Ruta para manejar URLs no encontradas */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Router>
          </AuthProvider>
        </LanguageProvider>
      </HelmetProvider>
    </div>
  );
}

export default App;
