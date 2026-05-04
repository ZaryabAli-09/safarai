# New App Structure Visualization

```
app/
│
├── 📄 layout.tsx                    # Root layout (SessionProvider, Toaster)
├── 📄 page.tsx                      # Home/Landing page  
├── 📄 globals.css                   # Global styles
│
├── 📁 _components/                  # Shared components (not a route)
│   ├── 📄 index.ts                  # Barrel export
│   ├── 📁 navigation/
│   │   ├── 📄 Navbar.tsx
│   │   ├── 📄 AppNav.tsx
│   │   └── 📄 index.ts
│   ├── 📁 landing/
│   │   ├── 📄 LandingPage.tsx
│   │   └── 📄 index.ts
│   └── 📁 common/
│       ├── 📄 CardSkeleton.tsx
│       ├── 📄 DatePicker.tsx
│       └── 📄 index.ts
│
├── 📁 (public)/                     # Public routes group
│   ├── 📄 layout.tsx
│   └── 📁 (auth)/                   # Authentication routes
│       ├── 📄 layout.tsx
│       ├── 📁 sign-in/
│       │   └── 📄 page.tsx
│       ├── 📁 register/
│       │   └── 📄 page.tsx
│       ├── 📁 forgot-password/
│       │   └── 📄 page.tsx
│       └── 📁 reset-password/
│           └── 📄 page.tsx
│
├── 📁 (dashboard)/                  # Protected routes group ✅ Auth Required
│   ├── 📄 layout.tsx                # Includes AppNav + Auth check
│   ├── 📄 page.tsx                  # Dashboard home
│   ├── 📁 trips/
│   │   ├── 📄 page.tsx              # List all trips
│   │   └── 📁 [id]/
│   │       └── 📄 page.tsx          # Trip details
│   ├── 📁 new-trip/
│   │   └── 📄 page.tsx              # Create new trip
│   ├── 📁 profile/
│   │   └── 📄 page.tsx              # User profile
│   └── 📁 admin/
│       ├── 📄 layout.tsx
│       └── 📄 page.tsx              # Admin panel
│
└── 📁 api/                           # API Routes
    ├── 📁 auth/
    │   ├── 📁 [...nextauth]/
    │   │   └── 📄 route.ts
    │   ├── 📁 register/
    │   │   └── 📄 route.ts
    │   ├── 📁 forgot-password/
    │   │   └── 📄 route.ts
    │   ├── 📁 reset-password/
    │   │   └── 📄 route.ts
    │   └── 📁 verify-email/
    │       └── 📄 route.ts
    ├── 📁 profile/
    │   └── 📁 [userid]/
    │       └── 📄 route.ts
    └── 📁 trips/
        └── 📁 [userid]/
            └── 📄 route.ts

═══════════════════════════════════════════════════════════════════

🎯 KEY IMPROVEMENTS:

✅ Route Organization
   - (public)    = Open access (login, register, password reset)
   - (dashboard) = Protected by auth middleware
   
✅ Component Structure  
   - _components = Shared across routes
   - Organized by feature (navigation, landing, common)
   - Barrel exports for clean imports
   
✅ API Routes
   - Grouped logically by feature
   - No unnecessary wrapper folders
   
✅ Clarity
   - Clear separation of concerns
   - Easy to understand what's public vs protected
   - Follows Next.js App Router best practices

═══════════════════════════════════════════════════════════════════

📌 IMPORTANT NOTES:

1. Route Groups: Parentheses don't create URL segments
   - /sign-in → (public)/(auth)/sign-in/page.tsx
   - /dashboard/trips → (dashboard)/trips/page.tsx

2. _components Folder: Underscore prefix = NOT a route
   - Used only for organizing shared components
   - Improves IDE performance & code organization

3. Middleware Protection:
   - All (dashboard) routes protected by middleware.ts
   - Automatically redirects unauthenticated users to /sign-in

4. Layouts:
   - (dashboard)/layout.tsx includes AppNav
   - (public)/layout.tsx is minimal (no navbar)
   - All child routes inherit parent layouts

═══════════════════════════════════════════════════════════════════
