# Testing Approach in Host Helper AI

This document explains the specific testing approach implemented in the Host Helper AI project.

## Graceful Testing Degradation

One unique aspect of our testing strategy is the use of "graceful degradation" for test files. This means:

1. Test files function properly when testing dependencies are installed
2. Test files compile without errors even when testing dependencies are not installed
3. TypeScript linting does not show errors in the test files before installing dependencies

This approach makes it easier for new developers to work with the codebase and gradually adopt testing practices.

## Implementation Details

### Conditional Testing Imports

Test files use conditional imports to handle the case where Vitest or Testing Library are not installed:

```typescript
// Example from a test file
let describe: any;
let it: any;
let expect: any;

try {
  // This will work after vitest is installed
  const vitest = require('vitest');
  describe = vitest.describe;
  it = vitest.it;
  expect = vitest.expect;
} catch (e) {
  // Fallback for when vitest is not installed
  describe = (name: string, fn: Function) => { console.log(`Test suite: ${name}`); };
  it = (name: string, fn: Function) => { console.log(`  Test: ${name}`); };
  expect = (value: any) => ({
    toBe: (expected: any) => console.log(`    Expected: ${expected}, Actual: ${value}`),
    // Other matchers...
  });
}
```

### Conditional Vitest Configuration

The `vite.config.ts` file includes testing configuration only if Vitest is installed:

```typescript
// Check if vitest is installed
const vitestInstalled = (() => {
  try {
    require.resolve('vitest');
    return true;
  } catch (e) {
    return false;
  }
})();

// Base configuration
const baseConfig = { /* ... */ };

// Vitest configuration - only included if vitest is installed
const testConfig = vitestInstalled ? {
  test: { /* ... */ }
} : {};

export default defineConfig({
  ...baseConfig,
  ...testConfig
})
```

### Test Helper Script

We provide a script to make setting up testing easier:

```bash
node scripts/setup-testing.js
```

This script:
1. Installs all required testing dependencies
2. Updates test files to use the correct imports
3. Creates necessary test directories
4. Updates package.json scripts if needed

## Getting Started with Testing

1. Start by installing the testing dependencies:
   ```bash
   npm install --save-dev vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom happy-dom @vitest/coverage-c8
   ```

2. Or simply run the setup script:
   ```bash
   node scripts/setup-testing.js
   ```

3. Run the tests:
   ```bash
   npm test
   ```

## Test File Organization

- **Unit Tests**: Located next to the files they test or in `src/tests/unit/`
- **Integration Tests**: Located in `src/tests/integration/`
- **Test Helpers**: Located in `src/tests/helpers/`
- **Setup File**: Located at `src/tests/setup.ts`

## Additional Resources

For more detailed information about our testing strategy, see:
- [TESTING.md](./TESTING.md): Complete testing strategy
- [TEST_SETUP.md](./TEST_SETUP.md): Test environment setup details
- [INSTALL_TESTING.md](./INSTALL_TESTING.md): Guide for installing testing dependencies 