# Installing Testing Dependencies

This guide explains how to set up the testing environment for the Host Helper AI project.

## Prerequisites

Ensure you have:
- Node.js 18.x or later
- npm 8.x or later
- The project checked out locally

## Installation Steps

1. Install the required testing dependencies:

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom happy-dom @vitest/coverage-c8
```

2. Create or update your `vite.config.ts` file to include Vitest configuration:

```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    css: true,
    coverage: {
      provider: 'c8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/tests/',
        '**/*.d.ts',
        '**/*.test.{ts,tsx}',
        'src/main.tsx',
        'src/vite-env.d.ts'
      ]
    }
  }
});
```

3. Add test scripts to your `package.json`:

```json
"scripts": {
  "test": "vitest run",
  "test:watch": "vitest",
  "test:coverage": "vitest run --coverage",
  "test:ui": "vitest --ui"
}
```

4. Install the Vitest UI (optional):

```bash
npm install --save-dev @vitest/ui
```

## Creating Test Files

1. For component tests, create a file next to the component with a `.test.tsx` extension:

```tsx
// src/shared/components/Button.test.tsx
import { render, screen } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button text="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});
```

2. For utility tests, create a file next to the utility with a `.test.ts` extension:

```typescript
// src/utils/formatCurrency.test.ts
import { formatCurrency } from './formatCurrency';

describe('formatCurrency', () => {
  it('formats currency correctly', () => {
    expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
  });
});
```

## Running Tests

You can now run tests using the npm scripts:

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Generate a coverage report
npm run test:coverage

# Open the Vitest UI (if installed)
npm run test:ui
```

## Troubleshooting

If you encounter issues:

1. **Module resolution errors**: Ensure that the paths in your imports match your project structure.

2. **TypeScript errors in tests**: Make sure you have the proper TypeScript configuration for tests.

3. **JSX errors**: Check that your `tsconfig.json` is properly configured for React.

4. **DOM-related errors**: Ensure that `@testing-library/jest-dom` is properly set up in your test files.

## Additional Resources

- [Vitest Documentation](https://vitest.dev/guide/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)
- [Testing Library Queries](https://testing-library.com/docs/queries/about) 