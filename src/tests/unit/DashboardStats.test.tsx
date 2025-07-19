/**
 * src/tests/unit/DashboardStats.test.tsx
 * Test unitario para el componente DashboardStats
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';
import DashboardStats from '@features/dashboard/DashboardStats';

// Mock de react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key, // Retorna la clave como está para testing
    i18n: {
      language: 'es'
    }
  })
}));

// Mock de AuthContext
vi.mock('@shared/contexts/AuthContext', () => ({
  useAuth: () => ({
    user: { id: '1' }
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