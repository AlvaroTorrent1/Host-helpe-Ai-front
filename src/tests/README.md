# Tests Directory

This directory contains test setup files and global test utilities for the Host Helper AI project.

## Structure

- `setup.ts`: Global setup file for tests, loaded by Vitest before tests run
- `helpers/`: Helper utilities and mock functions for testing
- `integration/`: Integration tests that verify multiple components work together
- `e2e/`: End-to-end tests (future implementation)

## Test Utilities

The `helpers/` directory contains utilities to simplify testing:

- Mock providers for React context
- Mock implementations of services
- Test data factories
- Specialized rendering utilities

## Running Tests

Run tests using the npm scripts defined in `package.json`:

```bash
# Run all tests
npm test

# Run tests in watch mode (development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Writing Tests

### Where to Place Tests

1. **Unit Tests**: Place unit tests next to the file being tested with a `.test.ts` or `.test.tsx` extension.

Example:
```
src/
  utils/
    formatting.ts
    formatting.test.ts
  components/
    Button.tsx
    Button.test.tsx
```

2. **Integration Tests**: Place integration tests in `src/tests/integration/`.

3. **End-to-End Tests**: Place E2E tests in `src/tests/e2e/` (future implementation).

### Test Best Practices

1. **Use Testing Library Queries Wisely**:
   - Prefer `getByRole` over `getByTestId` when possible
   - Use `findBy*` for async elements
   - Use `queryBy*` for elements that might not exist

2. **Mock Only What's Necessary**:
   - Try to test with minimal mocking
   - Create reusable mock factories for common dependencies

3. **Test User Interactions**:
   - Use `userEvent` over `fireEvent` for more realistic user interactions
   - Test full user flows in integration tests

## Additional Resources

For a comprehensive guide to testing approach, see:
- [TESTING.md](../../doc/TESTING.md): Complete testing strategy
- [TEST_SETUP.md](../../doc/TEST_SETUP.md): Test environment setup details

## Example

```tsx
// src/components/PropertyCard.test.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PropertyCard from './PropertyCard';

describe('PropertyCard', () => {
  const mockProperty = {
    id: '123',
    name: 'Beachfront Villa',
    address: '123 Ocean Dr',
    imageUrl: '/path/to/image.jpg',
    pricePerNight: 200
  };

  it('renders property details correctly', () => {
    render(
      <MemoryRouter>
        <PropertyCard property={mockProperty} />
      </MemoryRouter>
    );
    
    expect(screen.getByText('Beachfront Villa')).toBeInTheDocument();
    expect(screen.getByText('123 Ocean Dr')).toBeInTheDocument();
    expect(screen.getByText('€200 / night')).toBeInTheDocument();
  });
});
```