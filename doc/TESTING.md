# Testing Strategy

This document outlines the testing approach for the Host Helper AI project. Following these guidelines ensures that our application remains robust and reliable as it evolves.

## Testing Technology Stack

- **Testing Framework**: [Vitest](https://vitest.dev/) - A Vite-native testing framework
- **Testing Library**: [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) for component testing
- **Test Runners**: Vitest CLI and npm scripts
- **Mocking**: Vitest's built-in mocking capabilities
- **Coverage Reports**: Vitest's built-in coverage reporting

## Test Types

### Unit Tests

Unit tests verify that individual functions, hooks, and utilities work as expected in isolation.

**Location**: Place unit tests next to the file being tested with a `.test.ts` or `.test.tsx` extension.

**Example**:
```typescript
// src/utils/formatting.test.ts
import { formatCurrency } from './formatting';

describe('formatCurrency', () => {
  it('formats EUR currency correctly', () => {
    expect(formatCurrency(1000, 'EUR')).toBe('€1,000.00');
  });
  
  it('handles zero values', () => {
    expect(formatCurrency(0, 'EUR')).toBe('€0.00');
  });
});
```

### Component Tests

Component tests verify that UI components render correctly and behave as expected when interacted with.

**Location**: Place component tests next to the component being tested with a `.test.tsx` extension.

**Example**:
```typescript
// src/shared/components/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button text="Click me" onClick={() => {}} />);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
  
  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button text="Click me" onClick={handleClick} />);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Tests

Integration tests verify that multiple components or services work together correctly.

**Location**: `src/tests/integration/`

**Example**:
```typescript
// src/tests/integration/PropertyCreation.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { PropertyForm } from '../../features/properties/components/PropertyForm';

// Mock Supabase client
vi.mock('../../services/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    insert: vi.fn().mockResolvedValue({ data: { id: '123' }, error: null }),
  }
}));

describe('Property Creation Flow', () => {
  it('submits property data correctly', async () => {
    render(
      <AuthProvider>
        <PropertyForm />
      </AuthProvider>
    );
    
    // Fill out form
    fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Beach House' } });
    // ... more form interactions
    
    // Submit form
    fireEvent.click(screen.getByText(/create property/i));
    
    // Assert Supabase was called correctly
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('properties');
      expect(supabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        name: 'Beach House',
      }));
    });
  });
});
```

### End-to-End Tests

End-to-end tests verify complete user flows within the application from start to finish.

**Location**: `src/tests/e2e/`

**Note**: Full E2E testing with tools like Playwright or Cypress will be implemented in a future phase.

## Mocking Strategy

### Mocking Supabase

Use Vitest's mocking capabilities to mock Supabase responses:

```typescript
import { vi } from 'vitest';

// Basic mock
vi.mock('../../services/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { /* mock data here */ },
      error: null
    })
  }
}));

// For more complex mocks, you can use factory functions
const createSupabaseMock = (responseData, error = null) => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: responseData,
      error: error
    })
  }
});
```

### Mocking Context Providers

Wrap components with mock providers for testing:

```typescript
const mockAuthContext = {
  user: { id: '123', email: 'test@example.com' },
  session: { /* mock session */ },
  signIn: vi.fn(),
  signOut: vi.fn(),
  isLoading: false
};

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }) => <div>{children}</div>
}));
```

## Test Setup

The `src/tests/setup.ts` file contains global test setup configuration, including:

- Setting up the testing environment
- Loading Jest DOM matchers
- Setting up global mocks

## Running Tests

Run tests using the following npm scripts:

- `npm test`: Run all tests
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Run tests with coverage report

## Coverage Targets

We aim for the following test coverage:

- Core utilities and services: 90%+
- UI components: 80%+
- Feature implementation: 70%+

## Best Practices

1. **Test Behavior, Not Implementation**: Focus on what the code does, not how it does it.
2. **Use Descriptive Test Names**: Tests should clearly describe what they're verifying.
3. **Arrange-Act-Assert Pattern**: Structure tests with setup, action, and verification phases.
4. **Isolation**: Tests should not depend on each other or external systems.
5. **Avoid Overuse of Mocks**: Mock only what's necessary to keep tests focused.
6. **Test Edge Cases**: Include tests for boundary conditions and error handling.
7. **Keep Tests Fast**: Optimize for speed to encourage running tests frequently.

## TDD Approach (Recommended)

Consider using Test-Driven Development (TDD) for complex functionality:

1. Write a failing test that defines the expected behavior
2. Implement the minimal code to make the test pass
3. Refactor the code while keeping tests passing

This approach leads to more testable code and better test coverage.
