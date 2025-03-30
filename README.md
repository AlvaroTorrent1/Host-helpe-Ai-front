# Host Helper AI

An application for managing property rentals, guests, and reservations with modern web technologies.

## 🚀 Features

- Property management (add, edit, delete properties)
- Document management for properties (upload, organize, access)
- Media gallery for property photos and videos
- Guest management
- Reservation tracking and management
- Multilingual support (English and Spanish)
- Responsive interface for desktop and mobile

## 🛠️ Technology Stack

- **Frontend**: React with TypeScript
- **Backend**: Supabase (PostgreSQL + APIs)
- **Storage**: Supabase Storage
- **Authentication**: Supabase Auth
- **State Management**: React Query and Context API
- **UI Components**: Custom components with modern design
- **Styling**: CSS/SCSS modules
- **Testing**: Vitest for unit tests

## 📂 Project Structure

```
host-helper-ai/
├── src/
│   ├── components/        # Reusable UI components
│   ├── config/            # Configuration files and environment variables
│   ├── features/          # Feature-specific components and logic
│   ├── hooks/             # Custom React hooks
│   ├── i18n/              # Internationalization system
│   ├── layouts/           # Page layout components
│   ├── pages/             # Page components
│   ├── services/          # API and external service integrations
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── App.tsx            # Main application component
├── public/                # Static assets
└── docs/                  # Documentation files
```

## 🔧 Environment Setup

1. Clone the repository
2. Copy `.env.example` to `.env` and update the values
3. Install dependencies:

```bash
npm install
```

4. Start the development server:

```bash
npm run dev
```

## 🧪 Running Tests

```bash
npm test
```

## 🌐 Internationalization

The application supports multiple languages through our custom i18n system. To add or modify translations, update the translation files in `src/i18n/`.

## 🧰 Utilities

The project includes several utility modules that handle common tasks:

- **commonUtils**: General-purpose utilities like debouncing, throttling, error handling
- **dateUtils**: Date formatting and manipulation
- **validation**: Form validation and data checks
- **formatting**: Number and text formatting
- **textUtils**: Text processing utilities
- **animationUtils**: Handling animations and transitions
- **storageUtils**: Local storage and cache management

## 📚 Documentation

Additional documentation is available in the `docs/` directory:

- [API Documentation](docs/API.md)
- [Best Practices](docs/BEST_PRACTICES.md)

## 🏗️ Recent Improvements

1. **Code Organization**:
   - Reorganized service files for better separation of concerns
   - Extracted utilities into specialized modules
   - Centralized configuration in environment variables

2. **Internationalization**:
   - Added support for English and Spanish
   - Created a flexible translation system
   - Implemented locale-aware formatting

3. **Error Handling**:
   - Implemented consistent error handling with tryCatch utilities
   - Added better error reporting and fallbacks
   - Improved error recovery

4. **Type Safety**:
   - Enhanced TypeScript types throughout the application
   - Eliminated unsafe type assertions
   - Fixed linting issues

5. **Performance**:
   - Added debouncing for intensive operations
   - Implemented caching for expensive calculations
   - Optimized media loading and processing

## 📜 License

MIT License - See [LICENSE](LICENSE) for details.

## Supabase Authentication Configuration

For the authentication system to work properly in production, you need to configure the following:

1. **Supabase Dashboard**:
   - Log in to your Supabase dashboard
   - Go to Authentication > URL Configuration
   - Set the Site URL to: `https://hosthelperai.com`
   - Add additional redirect URLs if needed (for development/staging environments)

2. **Environment Variables**:
   - In development, set `VITE_SITE_URL=http://localhost:4004` in your `.env` file
   - In production, set `VITE_SITE_URL=https://hosthelperai.com` 
   - The GitHub Actions workflow has been configured to use the production URL

3. **Email Templates**:
   - If you've customized the email templates in Supabase, ensure they use `{{ .RedirectTo }}` instead of `{{ .SiteURL }}` where appropriate

This configuration ensures that authentication emails (registration confirmation, password reset, etc.) will contain the correct domain in their links rather than "localhost".
