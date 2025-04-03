/**
 * src/tests/unit/SESSubmissionHistory.test.tsx
 * Test unitario para el componente SESSubmissionHistory
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import SESSubmissionHistory from '../../features/ses/SESSubmissionHistory';
import { describe, it, expect } from 'vitest';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n';
import { SESSubmission } from '../../types/ses';

// Mock de react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'ses.history.noSubmissions': 'No submissions found',
        'ses.history.title': 'SES Submission History',
        'ses.filters.all': 'All',
        'ses.filters.pending': 'Pending',
        'ses.filters.submitted': 'Submitted',
        'ses.filters.error': 'Error',
        'ses.pagination.next': 'Next',
        'ses.pagination.previous': 'Previous',
        'ses.actions.retry': 'Retry',
        'ses.table.guest': 'Guest',
        'ses.table.property': 'Property',
        'ses.table.document': 'Document',
        'ses.table.date': 'Date',
        'ses.table.status': 'Status',
        'ses.table.actions': 'Actions',
        'common.pagination.showing': 'Showing',
        'common.pagination.to': 'to',
        'common.pagination.of': 'of',
        'common.pagination.results': 'results',
        'common.pagination.first': 'First',
        'common.pagination.last': 'Last'
      };
      return translations[key] || key;
    },
    i18n: {
      language: 'en'
    }
  })
}));

describe('SESSubmissionHistory', () => {
  it('renders without submissions', () => {
    render(
      <SESSubmissionHistory 
        submissions={[]} 
        isLoading={false}
        onRetry={() => {}}
      />
    );

    expect(screen.getByText('No submissions found')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(
      <SESSubmissionHistory 
        submissions={[]} 
        isLoading={true}
        onRetry={() => {}}
      />
    );

    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });

  it('filters submissions correctly', () => {
    const submissions: SESSubmission[] = [
      {
        id: '1',
        propertyId: 'prop1',
        guestName: 'John Doe',
        propertyName: 'Beach House',
        documentType: 'passport',
        documentNumber: 'AB123456',
        submissionDate: '2024-01-01T12:00:00Z',
        status: 'pending',
      },
      {
        id: '2',
        propertyId: 'prop2',
        guestName: 'Jane Smith',
        propertyName: 'Mountain Cabin',
        documentType: 'dni',
        documentNumber: '12345678X',
        submissionDate: '2024-01-01T12:00:00Z',
        status: 'submitted',
      },
    ];

    render(
      <SESSubmissionHistory 
        submissions={submissions} 
        isLoading={false}
        onRetry={() => {}}
      />
    );

    // Click en el filtro de pendientes
    fireEvent.click(screen.getByRole('button', { name: /pending/i }));
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Jane Smith')).not.toBeInTheDocument();

    // Click en el filtro de enviados
    fireEvent.click(screen.getByRole('button', { name: /submitted/i }));
    expect(screen.queryByText('John Doe')).not.toBeInTheDocument();
    expect(screen.getByText('Jane Smith')).toBeInTheDocument();
  });

  it('handles pagination correctly', () => {
    const submissions: SESSubmission[] = Array.from({ length: 15 }, (_, i) => ({
      id: String(i + 1),
      propertyId: `prop${i + 1}`,
      guestName: `Guest ${i + 1}`,
      propertyName: `Property ${i + 1}`,
      documentType: 'passport',
      documentNumber: `AB${i + 1}`,
      submissionDate: '2024-01-01T12:00:00Z',
      status: 'pending',
    }));

    render(
      <SESSubmissionHistory 
        submissions={submissions} 
        isLoading={false}
        onRetry={() => {}}
      />
    );

    // Verificar primera página
    expect(screen.getByText('Guest 1')).toBeInTheDocument();
    expect(screen.queryByText('Guest 11')).not.toBeInTheDocument();

    // Click en siguiente página
    fireEvent.click(screen.getByRole('button', { name: /next/i }));
    expect(screen.queryByText('Guest 1')).not.toBeInTheDocument();
    expect(screen.getByText('Guest 11')).toBeInTheDocument();
  });
}); 