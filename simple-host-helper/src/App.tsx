import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import './index.css'
import './App.css'
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import LandingPage from './pages/LandingPage';
import Pricing from './pages/Pricing';
import Testimonios from './pages/Testimonios';
import SESRegistrationPage from './pages/SESRegistrationPage';
import DashboardPage from './pages/DashboardPage';
import PropertyManagementPage from './pages/PropertyManagementPage';
import ReservationManagementPage from './pages/ReservationManagementPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NotFoundPage from './pages/NotFoundPage';

// Componente de carga
const LoadingSpinner = () => (
  <div className="flex justify-center items-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
  </div>
);

function App() {
  return (
    <div className="w-full min-h-screen overflow-hidden">
      <AuthProvider>
        <Router>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/testimonios" element={<Testimonios />} />
            
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
    </div>
  );
}

export default App;
