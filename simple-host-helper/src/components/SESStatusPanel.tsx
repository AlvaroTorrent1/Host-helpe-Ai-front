import React, { useState } from 'react';

interface SESSubmission {
  id: string;
  property_name: string;
  guest_name: string;
  check_in_date: string;
  status: 'pending' | 'submitted' | 'approved' | 'error';
  submission_date?: string;
  confirmation_code?: string;
  error_message?: string;
}

const SESStatusPanel: React.FC = () => {
  // Mock data para demostración
  const [submissions] = useState<SESSubmission[]>([
    {
      id: '1',
      property_name: 'Apartamento Centro',
      guest_name: 'Carlos Rodríguez',
      check_in_date: '2025-04-15',
      status: 'approved',
      submission_date: '2025-04-12T10:30:00Z',
      confirmation_code: 'SES-2025-04120001'
    },
    {
      id: '2',
      property_name: 'Casa de Playa',
      guest_name: 'Laura Martínez',
      check_in_date: '2025-04-05',
      status: 'pending'
    },
    {
      id: '3',
      property_name: 'Apartamento Centro',
      guest_name: 'Miguel Fernández',
      check_in_date: '2025-04-10',
      status: 'error',
      submission_date: '2025-04-07T14:22:00Z',
      error_message: 'Formato de documento inválido'
    },
    {
      id: '4',
      property_name: 'Casa de Playa',
      guest_name: 'Ana López',
      check_in_date: '2025-04-18',
      status: 'submitted',
      submission_date: '2025-04-15T09:45:00Z'
    }
  ]);
  
  // Función para mostrar el estado de manera amigable
  const renderStatus = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
            Aprobado
          </span>
        );
      case 'submitted':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
            Enviado
          </span>
        );
      case 'pending':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            Pendiente
          </span>
        );
      case 'error':
        return (
          <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
            Error
          </span>
        );
      default:
        return status;
    }
  };

  const handleRetry = (id: string) => {
    alert(`Retrying submission with ID: ${id}`);
  };

  const handleGenerateLink = (id: string) => {
    alert(`Generating link for guest registration: ${id}`);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Registro de Viajeros (SES)</h2>
        <button 
          className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-md transition duration-150"
        >
          Actualizar
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Propiedad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Huésped
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Check-in
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Fecha Envío
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {submissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {submission.property_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {submission.guest_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(submission.check_in_date).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {renderStatus(submission.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {submission.submission_date 
                    ? new Date(submission.submission_date).toLocaleString() 
                    : '—'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {submission.status === 'error' && (
                    <button
                      onClick={() => handleRetry(submission.id)}
                      className="text-primary-600 hover:text-primary-900 mr-2"
                    >
                      Reintentar
                    </button>
                  )}
                  
                  {submission.status === 'pending' && (
                    <button
                      onClick={() => handleGenerateLink(submission.id)}
                      className="text-primary-600 hover:text-primary-900"
                    >
                      Generar enlace
                    </button>
                  )}
                  
                  {submission.confirmation_code && (
                    <span className="text-xs text-gray-500 block mt-1">
                      Ref: {submission.confirmation_code}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SESStatusPanel; 