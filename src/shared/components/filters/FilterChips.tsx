// src/shared/components/filters/FilterChips.tsx
import React from "react";

interface FilterChipsProps {
  filters: { property?: string; category?: string; status?: string; month?: string };
  onOpenFilters?: () => void;
}

const Chip: React.FC<{ label: string }> = ({ label }) => (
  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700 border border-gray-200">
    {label}
  </span>
);

const FilterChips: React.FC<FilterChipsProps> = ({ filters, onOpenFilters }) => {
  const entries = Object.entries(filters).filter(([, v]) => v && v !== "all");
  if (entries.length === 0) return null;
  return (
    <div className="md:hidden flex items-center justify-between mb-3">
      <div className="flex flex-wrap gap-2">
        {entries.slice(0, 4).map(([key, value]) => (
          <Chip key={key} label={`${key}: ${value}`} />
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


