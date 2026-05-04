# App Restructuring - Migration Checklist

## Phase 1: Component Organization ✅ (Completed)

- [x] Create `_components/` folder structure
  - [x] `_components/navigation/`
  - [x] `_components/landing/`
  - [x] `_components/common/`
- [x] Create barrel export files for each folder
- [x] Create main `_components/index.ts` export

## Phase 2: Route Group Setup ✅ (Completed)

- [x] Create `(public)/` route group
  - [x] `(public)/layout.tsx`
  - [x] `(public)/(auth)/` sub-group
  - [x] `(public)/(auth)/layout.tsx`
- [x] Create `(dashboard)/` route group
  - [x] `(dashboard)/layout.tsx` with auth protection

## Phase 3: File Movement (TODO - Manual)

### Move Components to New Structure
```
FROM                                  TO
-----------------------------------   -----------------------------------
custom components/Navbar.tsx     →    _components/navigation/Navbar.tsx
custom components/AppNav.tsx     →    _components/navigation/AppNav.tsx
custom components/LandingPage.tsx →   _components/landing/LandingPage.tsx
custom components/CardSkeleton/* →    _components/common/CardSkeleton.tsx
custom components/DatePicker/*   →    _components/common/DatePicker.tsx
```

### Move Pages to New Route Structure
```
FROM                                  TO
-----------------------------------   -----------------------------------
(client)/(auth)/sign-in/     →        (public)/(auth)/sign-in/
(client)/(auth)/register/    →        (public)/(auth)/register/
(client)/(auth)/forgot-password/ →    (public)/(auth)/forgot-password/
(client)/(auth)/reset-password/ →     (public)/(auth)/reset-password/

(client)/app/                →        (dashboard)/
(client)/app/trips/          →        (dashboard)/trips/
(client)/app/new-trip/       →        (dashboard)/new-trip/
(client)/app/profile/        →        (dashboard)/profile/
(client)/admin/              →        (dashboard)/admin/
```

### Flatten API Routes
```
FROM                                  TO
-----------------------------------   -----------------------------------
(server)/api/auth/*          →        api/auth/*
(server)/api/profile/*       →        api/profile/*
(server)/api/trip/*          →        api/trips/*
```

## Phase 4: Update Imports (TODO)

### Files That Need Import Updates
- [x] `app/page.tsx` - Root home page
  - Change: `import { Navbar, LandingPage } from "./custom components/..."`
  - To: `import { Navbar, LandingPage } from "@/_components"`

- [ ] `app/(dashboard)/layout.tsx` - Already created with updated imports
  - Uses: `import { AppNav } from "@/_components/navigation/AppNav"`

- [ ] All auth pages in `(public)/(auth)/`
  - Check: LoginForm imports from components/ (keep as is, it's in root components/)
  
- [ ] All trip pages in `(dashboard)/trips/`
  - Update: Any references to `custom components/`

- [ ] All profile pages in `(dashboard)/profile/`
  - Update: Any references to `custom components/`

- [ ] All API routes
  - Verify: No import path changes needed (they import from lib/)

### Search Pattern
Search workspace for: `from "@/app/custom components`
Replace with appropriate import from: `@/_components/[subfolder]`

## Phase 5: Clean Up (TODO)

- [ ] Verify all old imports are updated
- [ ] Test all routes still work
- [ ] Delete `custom components/` folder
- [ ] Delete `(client)/` folder (after moving all files)
- [ ] Delete `(server)/` folder (keep only api files, move to root api/)
- [ ] Remove this checklist (or mark as completed)

## Notes

- **No functionality changes**: This is purely structural reorganization
- **Backup first**: Consider backing up before mass file moves
- **Test gradually**: Move one section, test, then move next section
- **Import paths**: Pay special attention to updated component imports
- **Middleware**: Verify `middleware.ts` still works with new route structure

## Quick Reference: Import Changes

```typescript
// OLD
import { AppNav } from "@/app/custom components/AppNav"
import { CardSkeleton } from "@/app/custom components/CardSkeleton/CardSkeleton"
import { LandingPage } from "@/app/custom components/LandingPage"

// NEW
import { AppNav, CardSkeleton, LandingPage } from "@/_components"
// OR for specificity
import { AppNav } from "@/_components/navigation"
import { CardSkeleton } from "@/_components/common"
import { LandingPage } from "@/_components/landing"
```
