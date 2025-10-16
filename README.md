# 🏠 Host Helper AI

> Modern property rental management platform with AI automation

An intelligent application for managing property rentals, guests, and reservations with integrated AI workflows powered by n8n.

---

## ✨ Features

- 🏡 **Property Management** - Add, edit, and manage rental properties
- 📄 **Document Management** - Upload and organize property documents
- 🖼️ **Media Gallery** - Photos and videos for properties
- 👥 **Guest Management** - Track guests and their information
- 📅 **Reservation System** - Complete reservation tracking
- 🌍 **Multilingual** - Full support for English and Spanish
- 🤖 **AI Automation** - n8n workflows for intelligent property assistance
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile

---

## 🛠️ Technology Stack

### Frontend
- **React 18** with **TypeScript**
- **Vite** for fast development
- **Tailwind CSS** for styling
- **react-i18next** for translations

### Backend & Services
- **Supabase** (PostgreSQL + Auth + Storage + APIs)
- **n8n** for AI automation and workflows
- **Stripe** for payments
- **React Query** for state management

### Testing & Quality
- **Vitest** for unit and integration tests
- **ESLint** for code quality

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Supabase account
- Git

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/AlvaroTorrent1/Host-helpe-Ai-front.git
cd Host-helpe-Ai-front

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env with your credentials

# 4. Start development server
npm run dev
```

The application will be available at `http://localhost:4000`

---

## 📂 Project Structure

```
host-helper-ai/
├── src/
│   ├── components/        # Reusable UI components
│   ├── config/            # App configuration
│   ├── features/          # Feature modules (properties, reservations, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── i18n/              # Internationalization
│   ├── services/          # API integrations
│   ├── translations/      # Translation files (ES/EN)
│   ├── types/             # TypeScript definitions
│   └── utils/             # Utility functions
├── documentation/         # Complete project documentation
├── supabase/             # Database migrations and functions
└── public/               # Static assets
```

---

## 🔧 Available Commands

```bash
# Development
npm run dev              # Start development server
npm run dev:prod         # Start with production config
npm run build            # Build for production
npm run preview          # Preview production build

# Testing
npm test                 # Run all tests
npm run test:watch       # Run tests in watch mode
npm run test:coverage    # Generate coverage report

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

---

## 🌐 Internationalization

The app uses **react-i18next** for translations. Currently supports:
- 🇪🇸 Spanish
- 🇬🇧 English

Translation files are located in `src/translations/`.

### Adding translations:

```typescript
// Use in components
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  return <h1>{t('mySection.title')}</h1>;
}
```

---

## 🤖 AI Automation with n8n

Host Helper AI includes intelligent workflows powered by n8n:

- **Property Processing** - Automatic property data enrichment
- **Guest Assistant** - AI-powered guest communication
- **Reservation Management** - Automated booking workflows

See [`documentation/integrations/n8n-setup.md`](./documentation/integrations/n8n-setup.md) for setup instructions.

---

## 📚 Documentation

**Complete documentation available in [`documentation/`](./documentation/README.md)**

### Quick Links:
- 🏗️ **Architecture**: [`documentation/architecture/overview.md`](./documentation/architecture/overview.md)
- 🛠️ **Development**: [`documentation/development/`](./documentation/development/)
- 🤖 **n8n Integration**: [`documentation/integrations/n8n-setup.md`](./documentation/integrations/n8n-setup.md)
- 📡 **API Reference**: [`documentation/api/endpoints.md`](./documentation/api/endpoints.md)
- 🚀 **Deployment**: [`documentation/guides/deployment.md`](./documentation/guides/deployment.md)
- 🔧 **Troubleshooting**: [`documentation/guides/troubleshooting.md`](./documentation/guides/troubleshooting.md)

---

## 🔐 Authentication Setup

### Supabase Configuration

1. **In Supabase Dashboard** (Authentication > URL Configuration):
   - **Site URL**: `https://hosthelperai.com`
   - **Redirect URLs**:
     - `https://hosthelperai.com/auth/callback` (production)
     - `http://localhost:4000/auth/callback` (development)

2. **Environment Variables**:
   ```bash
   # Development
   VITE_SITE_URL=http://localhost:4000
   
   # Production
   VITE_SITE_URL=https://hosthelperai.com
   ```

3. **Troubleshooting Auth Issues**:
   - Verify Site URL matches your domain
   - Check redirect URLs are correctly configured
   - Clear browser cache if testing
   - Check browser console for detailed error messages

---

## 🌍 Environment Configuration

The app supports multiple environments:

| Environment | Command | Use Case |
|-------------|---------|----------|
| Development | `npm run dev` | Local development |
| Production (local) | `npm run dev:prod` | Test production config locally |
| Production (build) | `npm run build` | Build for deployment |

For detailed environment setup, see [`documentation/guides/environment-variables-setup.md`](./documentation/guides/environment-variables-setup.md)

---

## 🧪 Testing

Tests are written using **Vitest** and **Testing Library**.

```bash
# Run all tests
npm test

# Watch mode for development
npm run test:watch

# Generate coverage report
npm run test:coverage
```

Test files are located in `src/tests/`.

See [`documentation/development/testing.md`](./documentation/development/testing.md) for testing guidelines.

---

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `dist/` directory.

### Deploy

The app is configured for deployment to:
- **GitHub Pages** (current)
- **Vercel** (supported)
- **Netlify** (supported)

For deployment instructions, see [`documentation/guides/deployment.md`](./documentation/guides/deployment.md)

---

## 🧰 Utility Modules

The project includes well-organized utility modules:

- **dateUtils** - Date formatting and manipulation
- **validation** - Form validation helpers
- **formatting** - Number and text formatting
- **storageUtils** - LocalStorage management
- **textUtils** - Text processing utilities

All utilities are located in `src/utils/`.

---

## 📊 Project Status (October 2025)

```
✅ Core Features: Complete and stable
✅ AI Integration: n8n workflows active
✅ Translations: ES/EN fully implemented
✅ Testing: Unit and integration tests configured
✅ Documentation: Consolidated and up-to-date
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

MIT License - See [LICENSE](LICENSE) for details.

---

## 🔗 Links

- **Live App**: [hosthelperai.com](https://hosthelperai.com)
- **Repository**: [GitHub](https://github.com/AlvaroTorrent1/Host-helpe-Ai-front)
- **Documentation**: [/documentation](./documentation/README.md)
- **Issues**: [GitHub Issues](https://github.com/AlvaroTorrent1/Host-helpe-Ai-front/issues)

---

**Built with ❤️ using React, TypeScript, and n8n**
