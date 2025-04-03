# Guía de Testing para Host Helper AI

Esta carpeta contiene los tests y configuraciones para el proyecto Host Helper AI. Este documento proporciona instrucciones prácticas para escribir y ejecutar tests.

## Estructura de Directorios

```
src/tests/
  ├── setup.ts                # Configuración global de tests
  ├── README.md               # Este archivo
  ├── helpers/                # Utilidades y mocks para tests
  │   ├── authMock.tsx        # Mock del contexto de autenticación
  │   └── supabaseMock.ts     # Mock para Supabase
  ├── integration/            # Tests de integración
  │   └── PropertyForm.test.tsx
  └── unit/                   # Tests unitarios específicos
      ├── SESSubmissionHistory.test.tsx
      ├── Button.test.tsx
      └── ...
```

## Ejecutar Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar en modo watch (desarrollo)
npm run test:watch

# Ejecutar con cobertura
npm run test:coverage
```

## Escribir Tests

### 1. Tests Unitarios

#### Componentes React

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../components/ui/Button';

describe('Button', () => {
  it('renders correctly with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

#### Utilidades y Funciones

```typescript
import { describe, it, expect } from 'vitest';
import { formatCurrency } from '../../utils/formatting';

describe('formatCurrency', () => {
  it('formats numbers as euros correctly', () => {
    expect(formatCurrency(1234.56)).toBe('1.234,56 €');
  });

  it('handles zero correctly', () => {
    expect(formatCurrency(0)).toBe('0,00 €');
  });
});
```

### 2. Tests con Internacionalización

Para componentes que usan traducciones con i18n:

```typescript
// Mock de react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'ses.noSubmissionsFound': 'No submissions found',
        'ses.filters.all': 'All',
        // Añadir más traducciones según sea necesario
      };
      return translations[key] || key;
    }
  })
}));
```

### 3. Tests con Supabase

Para componentes que utilizan Supabase:

```typescript
// Mock de Supabase
vi.mock('@services/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ 
        data: { user: { id: 'test-id', email: 'test@example.com' } },
        error: null 
      })
    },
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { /* datos de prueba */ },
      error: null
    })
  }
}));
```

### 4. Tests de Componentes con Estado

Para componentes con estado o efectos:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Counter from '../../components/Counter';

describe('Counter', () => {
  it('increments count when button is clicked', async () => {
    render(<Counter initialValue={0} />);
    
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
    
    fireEvent.click(screen.getByText('Increment'));
    
    await waitFor(() => {
      expect(screen.getByText('Count: 1')).toBeInTheDocument();
    });
  });
});
```

### 5. Tests de Integración

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PropertyForm from '../../features/properties/PropertyForm';

// Mockear contextos y servicios necesarios

describe('PropertyForm Integration', () => {
  it('submits property data and redirects on success', async () => {
    // Configurar mocks
    const navigateMock = vi.fn();
    vi.mock('react-router-dom', async () => {
      const actual = await vi.importActual('react-router-dom');
      return {
        ...actual,
        useNavigate: () => navigateMock
      };
    });
    
    // Renderizar con wrappers necesarios
    render(
      <MemoryRouter>
        <PropertyForm />
      </MemoryRouter>
    );
    
    // Interactuar con el formulario
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: 'Test Property' }
    });
    
    // Simular envío
    fireEvent.click(screen.getByText(/save/i));
    
    // Verificar resultado esperado
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith('/properties');
    });
  });
});
```

## Buenas Prácticas

1. **Mantén los tests simples**
   - Cada test debe verificar una sola funcionalidad
   - Nombre descriptivos para tests y grupos

2. **Usa fixtures para datos comunes**
   - Crea objetos de datos reutilizables en archivos separados
   - Mantén los datos de prueba consistentes

3. **Mock inteligente**
   - Solo mockea lo que es necesario
   - Implementa mocks que se comporten como el servicio real

4. **Evita pruebas frágiles**
   - No dependas de selectores CSS específicos
   - Prefiere `getByRole`, `getByText` sobre `getByTestId`

5. **Documentación**
   - Añade comentarios para tests complejos
   - Documenta comportamientos específicos o edge cases

## Recursos Adicionales

Para más información sobre testing en el proyecto, consulta:
- [doc/TEST_SETUP.md](/doc/TEST_SETUP.md) - Configuración detallada
- [doc/TESTING.md](/doc/TESTING.md) - Estrategia general de testing
- [doc/TESTING_APPROACH.md](/doc/TESTING_APPROACH.md) - Enfoque por tipo de tests