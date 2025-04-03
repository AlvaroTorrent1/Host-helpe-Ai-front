/**
 * src/tests/unit/DashboardStats.test.tsx
 * Test unitario para el componente DashboardStats
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import DashboardStats from '../../features/dashboard/DashboardStats';

// Mock del contexto de idioma
vi.mock('@shared/contexts/LanguageContext', () => ({
  useLanguage: () => ({
    t: (key: string, params?: any) => {
      // Simulación simple de traducciones para tests
      const translations: Record<string, string> = {
        'dashboard.stats.properties': 'Properties',
        'dashboard.stats.activePropertiesFooter': 'Active properties',
        'dashboard.stats.pendingReservations': 'Pending Reservations',
        'dashboard.stats.pendingReservationsFooter': 'Percentage: {{percent}}%',
        'dashboard.stats.noReservations': 'No reservations yet',
        'dashboard.stats.incidents': 'Pending Incidents',
        'dashboard.stats.resolutionRate': 'Resolution rate: {{rate}}%'
      };
      
      // Si hay parámetros, reemplazar los placeholders
      if (params) {
        let result = translations[key] || key;
        Object.entries(params).forEach(([paramKey, paramValue]) => {
          result = result.replace(`{{${paramKey}}}`, paramValue);
        });
        return result;
      }
      
      return translations[key] || key;
    }
  })
}));

describe('DashboardStats Component', () => {
  test('renders all stat cards correctly', () => {
    render(
      <DashboardStats
        activeProperties={5}
        pendingReservations={3}
        totalReservations={10}
        pendingIncidents={2}
        resolutionRate={80}
      />
    );
    
    // Verificar que se muestran los títulos de las tarjetas
    expect(screen.getByText('Properties')).toBeInTheDocument();
    expect(screen.getByText('Pending Reservations')).toBeInTheDocument();
    expect(screen.getByText('Pending Incidents')).toBeInTheDocument();
    
    // Verificar que se muestran los valores correctos
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    
    // Verificar que se muestran los textos de pie de página
    expect(screen.getByText('Active properties')).toBeInTheDocument();
    expect(screen.getByText('Percentage: 30%')).toBeInTheDocument();
    expect(screen.getByText('Resolution rate: 80%')).toBeInTheDocument();
  });
  
  test('handles zero values correctly', () => {
    render(
      <DashboardStats
        activeProperties={0}
        pendingReservations={0}
        totalReservations={0}
        pendingIncidents={0}
        resolutionRate={0}
      />
    );
    
    // Verificar que se muestran ceros
    expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(3);
    
    // Verificar texto especial para reservas vacías
    expect(screen.getByText('No reservations yet')).toBeInTheDocument();
  });
}); 