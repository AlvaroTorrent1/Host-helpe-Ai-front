# Contributing to Host Helper AI

Thank you for your interest in contributing to Host Helper AI! This document provides guidelines and instructions for contributing to this project.

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm 8.x or later
- Git

### Setting Up Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/your-username/host-helper-ai.git
   cd host-helper-ai
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Copy the environment variables template:
   ```bash
   cp .env.example .env.local
   ```
5. Update the `.env.local` file with your Supabase credentials
6. Start the development server:
   ```bash
   npm run dev
   ```

## Development Workflow

1. Create a new branch for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b bugfix/issue-description
   ```

2. Implement your changes, following our [coding standards](#coding-standards)

3. Write or update tests to cover your changes (see [TESTING.md](./TESTING.md))

4. Run tests and ensure they pass:
   ```bash
   npm test
   ```

5. Run the linter and fix any issues:
   ```bash
   npm run lint
   npm run lint:fix  # to automatically fix issues
   ```

6. Commit your changes with a clear commit message following [conventional commits](https://www.conventionalcommits.org/) format:
   ```bash
   git commit -m "feat: add property search functionality"
   # or
   git commit -m "fix: correct reservation date validation"
   ```

7. Push to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

8. Create a Pull Request (PR) to the `develop` branch of the main repository

## Pull Request Process

1. Ensure your PR includes:
   - A clear title that follows conventional commits format
   - A description of the changes and why they're needed
   - Reference to any related issues (e.g., "Fixes #123")
   - Screenshots for UI changes

2. Respond to code review feedback and update your PR as needed

3. Once approved, your PR will be merged by a maintainer

## Coding Standards

Please follow the standards and best practices outlined in our [BEST_PRACTICES.md](./BEST_PRACTICES.md) document. Key points include:

### General Guidelines

- Follow the project structure and organization patterns
- Use TypeScript for all new code
- Ensure proper typing (avoid `any` type)
- Write clean, readable, and maintainable code
- Keep files under 200 lines
- Write meaningful comments to explain complex logic

### Components

- Use functional components with hooks
- Define prop types with TypeScript interfaces
- Keep components focused on a single responsibility
- Extract reusable components to the appropriate shared directory

### State Management

- Use React Context for global state
- Keep state as local as possible
- Avoid prop drilling by lifting state up or using context

### Styling

- Use TailwindCSS for styling
- Follow the existing design system and UI patterns
- Ensure components are responsive

## Testing Requirements

See [TESTING.md](./TESTING.md) for complete testing guidelines. Key points:

- Write tests for new features and bug fixes
- Aim for high test coverage in core utilities and services
- Test components for proper rendering and behavior
- Test critical user flows with integration tests

## Adding Dependencies

Before adding a new dependency:

1. Discuss with the team to ensure it's necessary
2. Consider bundle size impact
3. Check for security issues
4. Prefer established libraries with good maintenance history
5. Update the project documentation to reference the new dependency

## Documentation

For significant changes, update relevant documentation:

- Update README.md if necessary
- Document new features in appropriate files
- Add JSDoc comments to public functions and components
- Update API.md if you change API interactions

## Reporting Issues

When reporting issues:

1. Use the GitHub issue tracker
2. Check if the issue already exists
3. Include detailed steps to reproduce
4. Share error messages and screenshots
5. Specify your environment (OS, browser, Node.js version)

## Feature Requests

Feature requests are welcome! Please use the GitHub issue tracker and:

1. Explain the problem your feature would solve
2. Describe the solution you'd like
3. Consider alternatives you've thought about
4. Provide context and explain how it would benefit users

## Code of Conduct

Please treat all team members with respect. This includes:

- Using inclusive language
- Being respectful of differing viewpoints
- Accepting constructive criticism gracefully
- Focusing on what's best for the community
- Showing empathy towards other community members

## Questions?

If you have any questions, feel free to reach out to the maintainers or open an issue for clarification.

Thank you for contributing to Host Helper AI! 