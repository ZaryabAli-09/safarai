# App Folder Structure Guide

## Overview
This document explains the new, cleaner app folder structure designed for better maintainability and scalability.

## Folder Organization

### Root Level (`/app`)
- **`layout.tsx`** - Root layout wrapping entire application (SessionProvider, Toaster)
- **`page.tsx`** - Home/landing page
- **`globals.css`** - Global styles

### `_components/` - Shared Components
Non-routable folder (underscore prefix) containing shared components organized by feature:

```
_components/
├── navigation/          # Navigation components (Navbar, AppNav)
├── landing/            # Landing page specific components
├── common/             # Reusable utility components (CardSkeleton, DatePicker)
└── index.ts            # Barrel export for clean imports
```

**Usage:** `import { AppNav, Navbar } from '@/_components'`

### `(public)/` - Public Routes Group
Routes accessible without authentication (Route Group for organization).

**Auth Routes:** `(public)/(auth)/`
- `/sign-in` - Sign in page
- `/register` - User registration
- `/forgot-password` - Forgot password flow
- `/reset-password` - Reset password flow

### `(dashboard)/` - Protected Routes Group
Routes requiring authentication (Route Group for organization).
Protected by middleware in `middleware.ts`

**Sub-routes:**
- `/` - Dashboard home
- `/trips` - View all trips
- `/trips/[id]` - Trip details
- `/new-trip` - Create new trip
- `/profile` - User profile
- `/admin` - Admin panel (requires admin role)

### `api/` - API Routes
Server-only routes organized by feature:

```
api/
├── auth/
│   ├── [...nextauth]/   - NextAuth dynamic route
│   ├── register/        - User registration endpoint
│   ├── forgot-password/ - Forgot password endpoint
│   ├── reset-password/  - Reset password endpoint
│   └── verify-email/    - Email verification endpoint
├── profile/
│   └── [userid]/        - Profile operations
└── trips/
    └── [userid]/        - Trip operations
```

## Migration Guide

### Old Structure → New Structure

**Old:** `app/(client)/(auth)/sign-in/page.tsx`
**New:** `app/(public)/(auth)/sign-in/page.tsx`

**Old:** `app/(client)/app/trips/page.tsx`
**New:** `app/(dashboard)/trips/page.tsx`

**Old:** `import { AppNav } from '@/app/custom components/AppNav'`
**New:** `import { AppNav } from '@/_components'`

**Old:** `app/(server)/api/auth/[...nextauth]/route.ts`
**New:** `app/api/auth/[...nextauth]/route.ts`

## Import Patterns

### Import from _components (Cleaner)
```typescript
// ✅ Good
import { AppNav, Navbar, CardSkeleton } from '@/_components';

// Or specific
import { AppNav } from '@/_components/navigation';
```

### Import from Specific Sub-folders
```typescript
// ✅ Also good for tree-shaking
import { CardSkeleton } from '@/_components/common';
```

## Next Steps

1. Move component files from `custom components/` to `_components/`
2. Update all import paths to use new structure
3. Move pages from `(client)` routes to new route groups
4. Verify all layouts are properly configured
5. Delete old `(client)` and `(server)` folders once migration is complete

## Benefits

✅ **Clarity** - Clear separation of public and protected routes
✅ **Scalability** - Easy to add new features/routes
✅ **Maintainability** - Organized component structure
✅ **Type Safety** - Barrel exports improve IDE support
✅ **Best Practices** - Follows Next.js 15 App Router conventions
