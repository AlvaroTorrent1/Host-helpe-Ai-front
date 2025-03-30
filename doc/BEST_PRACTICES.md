# Best Practices & Conventions

This document outlines the coding standards, architectural patterns, and conventions used in the Host Helper AI project.

## Project Structure

- **`src/`**: Main source code directory.
  - **`assets/`**: Static assets (images, fonts, etc.).
  - **`config/`**: Application configuration (routes, constants, theme).
    - `routes.ts`: Centralized route definitions
    - `constants.ts`: Application-wide constants
    - `theme.ts`: UI theme configuration
  - **`contexts/`**: React Context API providers.
    - `AuthContext.tsx`: User authentication state
    - `LanguageContext.tsx`: Internationalization (i18n) setup
  - **`core/`**: Core business logic (potentially reusable across frameworks).
  - **`features/`**: Feature-specific modules organized by domain.
    - `auth/`: Authentication-related components and logic
    - `dashboard/`: Main user dashboard interface
    - `landing/`: Public marketing pages (LandingPage, ChatbotPage, etc.)
    - `properties/`: Property management features
    - `reservations/`: Reservation management features 
    - `ses/`: Spanish resident registration functionality
    - Each feature contains its own `components/`, `pages/`, etc. as needed.
  - **`hooks/`**: Global custom React hooks.
  - **`services/`**: API interaction logic.
    - `supabase.ts`: Supabase client configuration
    - `security.service.ts`: Authentication and security utilities
    - `propertyService.ts`: Property data operations
    - `mediaService.ts`: Media management (images, etc.)
    - `documentService.ts`: Document management
  - **`shared/`**: Components, types, and utilities shared across multiple features.
    - **`components/`**: Reusable UI components like Button, Modal, etc.
    - **`contexts/`**: Shared contexts duplicated from the root contexts
    - **`types/`**: Shared TypeScript types/interfaces.
  - **`tests/`**: Testing files (unit, integration, e2e).
  - **`translations/`**: i18n translation files (en.ts, es.ts).
  - **`types/`**: Global TypeScript types.
  - **`utils/`**: Global utility functions.
  - **`App.tsx`**: Root application component with routing setup.
  - **`main.tsx`**: Application entry point.
- **`doc/`**: Project documentation.
- **`public/`**: Static assets, including the `imagenes/` folder.

## Feature-First Organization

Host Helper AI follows a feature-first organization approach:

1. **What is a Feature?** A feature is a cohesive part of the application that serves a specific domain or user need (e.g., properties, reservations, auth).

2. **Feature Isolation:** Each feature should be self-contained within its directory with minimal dependencies on other features.

3. **Shared Components:** Only truly reusable components should be in `shared/components`. Feature-specific components stay within their feature.

4. **Feature Structure:** Each feature typically includes:
   - `pages/`: Top-level route components
   - `components/`: Feature-specific UI components
   - `hooks/`: Feature-specific hooks
   - `types/`: Feature-specific types
   - `utils/`: Feature-specific utilities

## Naming Conventions

- **Components:** PascalCase (e.g., `UserProfile.tsx`, `PrimaryButton.tsx`).
- **Functions/Variables:** camelCase (e.g., `getUserData`, `isLoading`).
- **Types/Interfaces:** PascalCase (e.g., `type UserProfile`, `interface ReservationData`).
- **Constants:** UPPER_SNAKE_CASE (e.g., `MAX_RETRIES`, `API_BASE_URL`).
- **Files:** 
  - React components: `ComponentName.tsx`
  - Services: `featureName.service.ts`
  - Contexts: `FeatureContext.tsx`
  - Types: `featureName.types.ts`

## Styling Approach

- Host Helper AI uses TailwindCSS for styling.
- Use utility classes directly in components.
- For complex components, consider using:
  - CSS modules for component-specific styles
  - Tailwind's `@apply` directive for repeated patterns
  - Theme values from `theme.ts` for consistency

## Component Guidelines

- **Keep Files Small:** Components should ideally be under 200 lines. Split larger components.
- **Single Responsibility:** Each component should do one thing well.
- **Props Interface:** Always define prop types for components:
  ```tsx
  interface ButtonProps {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
  }
  
  const Button: React.FC<ButtonProps> = ({ text, onClick, variant = 'primary' }) => {
    // ...
  };
  ```
- **Default Exports:** Use named exports for utilities and default exports for components.

## State Management

- Use React Context for global or shared state where appropriate.
- Use component local state (`useState`, `useReducer`) for UI-specific or non-shared state.
- Avoid prop drilling; lift state up or use context.
- Limit context size: create multiple small contexts rather than one large one.

## Internationalization (i18n)

- All user-facing text should use the `t()` function from `useLanguage()` hook.
- Translation keys should follow the pattern: `feature.section.key`.
- Add new translations to both `en.ts` and `es.ts`.

## API Interaction

- Centralize API calls within the `src/services` directory.
- Use async/await for asynchronous operations.
- Handle errors with try/catch blocks and provide user feedback.
- Use the `supabase` client from `services/supabase.ts`.

## Performance Considerations

- Use `React.lazy()` for code splitting (already implemented for routes).
- Memoize expensive calculations with `useMemo()`.
- Optimize re-renders with `useCallback()` for function props.
- Use pagination for long lists.

## Error Handling

- Catch errors at the service level.
- Use `react-hot-toast` for user notifications.
- Log errors to console in development with informative messages.

## Testing

- See `TESTING.md` for details.

## Git Workflow

- **Branches:**
  - `main`: Production-ready code
  - `develop`: Integration branch
  - `feature/feature-name`: For new features
  - `bugfix/issue-description`: For bug fixes
  
- **Commit Messages:** Follow conventional commits format:
  ```
  feat: add property search functionality
  fix: correct reservation date validation
  docs: update README with setup instructions
  test: add tests for authentication flow
  ```
  
- **Pull Requests:** Should include:
  - Reference to related issue
  - Brief description of changes
  - Testing notes
  - Screenshot if UI changes
