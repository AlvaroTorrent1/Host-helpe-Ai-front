// src/shared/components/filters/FilterChips.tsx
import React from "react";

type FilterEntry = { key: string; label: string; onRemove?: () => void };

interface FilterChipsProps {
  // Admite objeto simple (Dashboard) o array de entradas con etiqueta (Reservas)
  filters: Record<string, string | undefined> | FilterEntry[];
  onOpenFilters?: () => void;
}

const Chip: React.FC<{ label: string; onRemove?: () => void }> = ({ label, onRemove }) => (
  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">
    {label}
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        className="ml-1 text-gray-500 hover:text-gray-700"
        aria-label="Quitar filtro"
      >
        ×
      </button>
    )}
  </span>
);

const FilterChips: React.FC<FilterChipsProps> = ({ filters, onOpenFilters }) => {
  const entries: FilterEntry[] = Array.isArray(filters)
    ? (filters as FilterEntry[])
    : Object.entries(filters as Record<string, string | undefined>)
        .filter(([, v]) => v && v !== "all")
        .map(([key, value]) => ({ key, label: `${key}: ${value as string}` }));

  if (entries.length === 0) return null;

  return (
    <div className="md:hidden flex items-center justify-between mb-3">
      <div className="flex flex-wrap gap-2">
        {entries.slice(0, 4).map((item) => (
          <Chip key={item.key} label={item.label} onRemove={item.onRemove} />
        ))}
      </div>
      <button
        type="button"
        onClick={onOpenFilters}
        className="ml-2 px-2 py-1 text-xs rounded border border-gray-200 text-gray-700 hover:bg-gray-50"
      >
        Editar filtros
      </button>
    </div>
  );
};

export default FilterChips;


