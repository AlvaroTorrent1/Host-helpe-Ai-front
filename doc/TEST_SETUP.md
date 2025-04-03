# Configuración del Entorno de Pruebas

Este documento detalla la configuración del entorno de pruebas para el proyecto Host Helper AI.

## Tecnologías Utilizadas

- **Framework de Testing**: [Vitest](https://vitest.dev/) - Framework nativo para aplicaciones Vite
- **Biblioteca de Testing**: [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) para pruebas de componentes
- **Mocking**: Capacidades de mocking integradas en Vitest (vi.fn(), vi.mock(), etc.)
- **Entorno de navegador**: [jsdom](https://github.com/jsdom/jsdom) para simular un entorno DOM

## Configuración del Entorno

El archivo `src/tests/setup.ts` configura el entorno global de pruebas con las siguientes características:

### Polyfills y Mocks Globales

```typescript
import '@testing-library/jest-dom';
import { expect, afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extender los matchers de Vitest con los de @testing-library/jest-dom
expect.extend(matchers);

// Limpiar después de cada test
afterEach(() => {
  cleanup();
});

// Mock de ResizeObserver
const ResizeObserverMock = vi.fn(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.stubGlobal('ResizeObserver', ResizeObserverMock);

// Mock de window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock Intersection Observer
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockReturnValue({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn().mockReturnValue([])
});
window.IntersectionObserver = mockIntersectionObserver;
```

### Utilidades de Testing

El entorno proporciona algunas utilidades para facilitar el testing:

```typescript
// Utilidad para pausar la ejecución (útil para código asíncrono)
export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
```

## Estructura de Directorios de Tests

```
src/
  tests/
    setup.ts             # Configuración global de pruebas
    README.md            # Documentación de tests
    helpers/             # Funciones auxiliares y mocks
      authMock.tsx       # Mock del contexto de autenticación
      supabaseMock.ts    # Mock del cliente Supabase
    integration/         # Tests de integración
      PropertyForm.test.tsx  # Ejemplo de test de integración
    unit/                # Tests unitarios específicos
      SESSubmissionHistory.test.tsx  # Test del componente SES
      Button.test.tsx    # Test del componente Button
```

## Archivos de Prueba

Los tests unitarios se ubican junto al archivo que prueban, con extensión `.test.ts` o `.test.tsx`:

```
src/
  utils/
    formatting.ts
    formatting.test.ts   # Test unitario de la utilidad
  components/
    Button.tsx
    Button.test.tsx      # Test del componente
  features/
    ses/
      SESSubmissionHistory.tsx
```

### Tests Específicos

Los tests más complejos o que requieren un entorno específico se ubican en la carpeta `src/tests/unit` o `src/tests/integration`.

#### Ejemplo: SESSubmissionHistory Tests

```typescript
// src/tests/unit/SESSubmissionHistory.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SESSubmissionHistory from '../../features/ses/SESSubmissionHistory';
import { SESSubmission } from '../../types/ses';

// Mock de react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'ses.noSubmissionsFound': 'No submissions found',
        'ses.filters.all': 'All',
        'ses.filters.pending': 'Pending',
        'ses.filters.submitted': 'Submitted',
        'ses.filters.error': 'Error',
        'ses.pagination.next': 'Next',
        'ses.pagination.previous': 'Previous'
      };
      return translations[key] || key;
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
});
```

## Ejecución de Pruebas

Las pruebas se pueden ejecutar utilizando los siguientes scripts de npm:

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch (desarrollo)
npm run test:watch

# Ejecutar pruebas con informe de cobertura
npm run test:coverage
```

### Configuración en vitest.config.ts

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['./src/tests/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'coverage/**',
        'dist/**',
        '**/[.]**',
        'packages/*/test{,s}/**',
        '**/*.d.ts',
        'test{,s}/**',
        'test{,-*}.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}',
        '**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}',
        '**/__tests__/**',
        '**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress}.config.*',
        '**/.{eslint,mocha,prettier}rc.{js,cjs,yml}',
      ],
    },
  },
});
```

## Mocking de Servicios

### Mocking de Supabase

```typescript
import { vi } from 'vitest';

// Mock básico
vi.mock('../../services/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { /* datos mock */ },
      error: null
    })
  }
}));
```

### Mocking de Context Providers

```typescript
const mockAuthContext = {
  user: { id: '123', email: 'test@example.com' },
  session: { /* sesión mock */ },
  signIn: vi.fn(),
  signOut: vi.fn(),
  isLoading: false
};

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => <div>{children}</div>
}));
```

### Mocking de i18n

```typescript
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'common.save': 'Guardar',
        'common.cancel': 'Cancelar',
        // Más traducciones...
      };
      return translations[key] || key;
    }
  })
}));
```

## Supresión de Errores de Consola

Para evitar mensajes de error innecesarios durante las pruebas:

```typescript
const originalConsoleError = console.error;
console.error = (...args: any[]) => {
  // Suprimir mensajes específicos de React que aparecen durante las pruebas
  const suppressedMessages = [
    'Warning: ReactDOM.render is no longer supported',
    'Warning: useLayoutEffect does nothing on the server',
    'Warning: React does not recognize the'
  ];
  
  if (typeof args[0] === 'string' && suppressedMessages.some(msg => args[0].includes(msg))) {
    return;
  }
  
  originalConsoleError(...args);
};
```

## Guía Rápida de Testing

### Componentes Básicos

```typescript
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renderiza correctamente el texto', () => {
    render(<Button text="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

### Interacciones de Usuario

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('llama a onClick cuando se hace clic', () => {
    const handleClick = vi.fn();
    render(<Button text="Click me" onClick={handleClick} />);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Componentes Asíncronos

```typescript
import { render, screen, waitFor } from '@testing-library/react';
import { AsyncComponent } from './AsyncComponent';

describe('AsyncComponent', () => {
  it('carga datos de forma asíncrona', async () => {
    render(<AsyncComponent />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('Datos cargados')).toBeInTheDocument();
    });
  });
});
```

## Recursos Adicionales

Para una guía completa sobre nuestra estrategia de testing, consulta:
- [TESTING.md](./TESTING.md): Estrategia completa de testing
- [TESTING_APPROACH.md](./TESTING_APPROACH.md): Enfoques específicos para diferentes tipos de tests
- [scripts/setup-testing.js](../scripts/setup-testing.js): Script para configurar el entorno de pruebas 