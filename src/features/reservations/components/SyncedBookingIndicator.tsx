// src/features/reservations/components/SyncedBookingIndicator.tsx
// Componente para mostrar indicadores de reservas sincronizadas

import React from 'react';
import { CloudArrowDownIcon } from '@heroicons/react/24/outline';

interface SyncedBookingIndicatorProps {
  isSynced?: boolean;
  syncSource?: string;
  className?: string;
}

const SyncedBookingIndicator: React.FC<SyncedBookingIndicatorProps> = ({
  isSynced = false,
  syncSource,
  className = ''
}) => {
  if (!isSynced) {
    return null;
  }

  return (
    <div className={`inline-flex items-center ${className}`}>
      <div className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-full text-xs">
        <CloudArrowDownIcon className="h-3 w-3" />
        <span className="font-medium">Sincronizado</span>
      </div>
      {syncSource && (
        <div className="ml-1 text-xs text-gray-500">
          desde {syncSource}
        </div>
      )}
    </div>
  );
};

export default SyncedBookingIndicator;


