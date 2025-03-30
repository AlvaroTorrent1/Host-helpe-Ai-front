# API Documentation

This document outlines the API interactions for the Host Helper AI application, primarily focusing on the Supabase backend.

## Authentication

- **Supabase Auth:** Host Helper AI uses Supabase's built-in authentication system for user registration, login, and password reset functionality. Authentication is handled via the `security.service.ts` file.
- **JWT Handling:** Supabase automatically handles JWTs. When a user logs in, the JWT is stored in the browser's local storage and automatically included in subsequent API requests to authenticated endpoints.

## Supabase Database Tables

### `users`
- **Purpose:** Stores user information beyond what's available in Supabase auth.
- **Key Columns:**
  - `id` (UUID, PK): User ID (matches Supabase Auth ID)
  - `email` (Text): User's email address
  - `name` (Text): User's full name
  - `role` (Text): User's role (default: "user")
  - `created_at` (Timestamp): Account creation timestamp
  - `updated_at` (Timestamp): Last update timestamp
- **RLS Policies:** 
  - Users can read only their own data
  - Users can create/update only their own data
  - Admin role can read/write all user data

### `properties`
- **Purpose:** Stores information about rental properties.
- **Key Columns:**
  - `id` (UUID, PK): Property ID
  - `user_id` (UUID, FK): Owner's user ID
  - `name` (Text): Property name
  - `description` (Text): Property description
  - `address` (Text): Physical address
  - `type` (Text): Property type (apartment, house, etc.)
  - `created_at` (Timestamp): Creation timestamp
  - `updated_at` (Timestamp): Last update timestamp
- **RLS Policies:** 
  - Properties are readable only by their owners
  - Properties can be created/updated only by their owners

### `reservations`
- **Purpose:** Stores booking information for properties.
- **Key Columns:**
  - `id` (UUID, PK): Reservation ID
  - `property_id` (UUID, FK): Property ID
  - `user_id` (UUID, FK): Property owner's user ID
  - `guest_name` (Text): Guest's name
  - `guest_email` (Text): Guest's email
  - `check_in_date` (Date): Check-in date
  - `check_out_date` (Date): Check-out date
  - `status` (Text): Reservation status (confirmed, cancelled, etc.)
  - `created_at` (Timestamp): Creation timestamp
- **RLS Policies:** 
  - Reservations are readable only by the property owner
  - Reservations can be created/updated only by the property owner

### `media`
- **Purpose:** Stores property images and other media files.
- **Key Columns:**
  - `id` (UUID, PK): Media ID
  - `property_id` (UUID, FK): Related property ID
  - `user_id` (UUID, FK): Property owner's user ID
  - `url` (Text): Supabase storage URL
  - `type` (Text): Media type (image, document, etc.)
  - `created_at` (Timestamp): Upload timestamp
- **RLS Policies:** 
  - Media is viewable by property owners
  - Media can be uploaded/deleted only by property owners

### `property_documents`
- **Purpose:** Stores important documents related to properties (e.g., house rules, local regulations).
- **Key Columns:**
  - `id` (UUID, PK): Document ID
  - `property_id` (UUID, FK): Related property ID
  - `user_id` (UUID, FK): Property owner's user ID
  - `name` (Text): Document name
  - `url` (Text): Supabase storage URL
  - `created_at` (Timestamp): Upload timestamp
- **RLS Policies:** 
  - Documents are viewable by property owners
  - Documents can be uploaded/deleted only by property owners

## Supabase Storage

- **Buckets:**
  - `property-images`: Stores property images
  - `property-documents`: Stores property-related documents
  - `user-documents`: Stores user verification documents
- **Access Control:** 
  - Public read access for property images
  - Authenticated read access for documents
  - Write access limited to bucket owners

## Service Integration

The application integrates with Supabase through several service files:

- `services/supabase.ts`: Creates and exports the Supabase client
- `services/security.service.ts`: Handles authentication flows
- `services/propertyService.ts`: Manages property CRUD operations
- `services/mediaService.ts`: Handles file uploads and media management
- `services/documentService.ts`: Manages document uploads and retrieval

## Utility Functions

The application provides several utility modules for common operations:

### Validation Utilities (`src/utils/validation.ts`)
- Email, password, phone number validation
- URL validation
- Range checking
- Spanish ID validation

### Date Utilities (`src/utils/dateUtils.ts`)
- Date manipulation (add days/months/years)
- Date comparison (isToday, isPast, isFuture)
- Date formatting and parsing
- Date ranges and calculations

### String Utilities (`src/utils/stringUtils.ts`)
- Text transformations (capitalize, titleCase)
- String case conversion (camelCase, kebabCase, snakeCase)
- Number formatting (currency, percentage)
- String validation helpers

### Storage Utilities (`src/utils/storageUtils.ts`)
- Type-safe wrappers for localStorage and sessionStorage
- Memory storage fallback for environments without storage access
- Time-based expiration for stored items
- Consistent API across storage types

### Common Utilities (`src/utils/commonUtils.ts`)
- Object manipulation (pick, omit, deepClone, merge)
- Function helpers (debounce, throttle, memoize)
- Array operations (chunk, groupBy)
- Type checking and null handling

All utility functions can be imported from a central location:
```typescript
import { isValidEmail, formatDate, capitalize, getStorage } from 'src/utils';
```

## Environment Variables

The following environment variables are required for Supabase integration:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

## Supabase Edge Functions (If any)

- Document any custom serverless functions used.
- Inputs, outputs, purpose, triggers.

## Third-Party APIs (If any)

- Document integration with any other APIs (e.g., payment gateways, external services).
