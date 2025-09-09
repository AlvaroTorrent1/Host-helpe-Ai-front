## Botón compartido: variantes y tamaños

Ubicación: `src/components/ui/Button.tsx`

API:
- `variant`: `primary` | `secondary` | `danger` | `dangerOutline` | `ghost` | `link`
- `size`: `xs` | `sm` | `md` | `lg` | `icon`
- `leadingIcon` / `trailingIcon`: nodos opcionales para iconos

Ejemplos:

```tsx
import Button from '@/components/ui/Button';

// Primario
<Button variant="primary">Guardar</Button>

// Secundario
<Button variant="secondary">Cancelar</Button>

// Peligro contorneado (usado en Dashboard: Limpiar filtros)
<Button variant="dangerOutline" size="sm" leadingIcon={<XIcon />}>Limpiar filtros</Button>

// Icon-only (usado en Dashboard: flechas móviles)
<Button variant="secondary" size="icon" aria-label="Anterior">
  <ChevronLeftIcon />
  </Button>

// Enlaces (para tipografía tipo link)
<Button variant="link">Ver más</Button>
```

Notas:
- Usa `className` para pequeños ajustes visuales sin romper la API (p.ej. `bg-white border border-gray-200` en flechas móviles).
- Mantén `aria-label` en botones de solo icono.
- `focus:ring` consistente y `disabled` gestionado por el componente.


