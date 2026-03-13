# Architecture

**Analysis Date:** 2026-03-13

## Pattern Overview

**Overall:** Single Page Application (SPA) with Client-Side Rendering

**Key Characteristics:**
- React 19 with TypeScript for type-safe component development
- React Router v7 for declarative client-side routing
- Context API for global authentication state management
- Axios for HTTP communication with backend API
- PWA (Progressive Web App) with service worker caching strategies

## Layers

**UI Layer:**
- Purpose: Render pages and handle user interactions
- Location: `src/components/`, `src/pages/`
- Contains: React components, pages, modals
- Depends on: Context layer, Service layer
- Used by: React Router

**Context Layer:**
- Purpose: Global state management for authentication
- Location: `src/context/AuthContext.tsx`
- Contains: AuthProvider, useAuth hook, user role state
- Depends on: localStorage (for token persistence)
- Used by: All authenticated components, ProtectedRoute

**Service Layer:**
- Purpose: API communication with backend
- Location: `src/services/`
- Contains: Axios-based API clients for donations, users, admin, CMS, regions
- Depends on: axios library, VITE_API_URL environment
- Used by: UI components

**Utility Layer:**
- Purpose: Helper functions and reusable utilities
- Location: `src/utils/`
- Contains: Date utilities, Excel export, chart components
- Used by: Service layer and UI components

## Data Flow

**Authentication Flow:**

1. User submits login credentials in `src/pages/Login.tsx`
2. Login page attempts login sequentially: `/login` → `/admin/login` → `/superadmin/login`
3. On success, token stored via AuthContext login function
4. Token persisted in localStorage for session persistence
5. ProtectedRoute checks authentication on route access

**Donation Recording Flow:**

1. User navigates to `/dashboard/transaksi`
2. `TransaksiDonasi` component loads via ProtectedRoute
3. Component calls `DonationService.getDonations()` with filters
4. Service layer makes Axios request to backend
5. Response mapped to TypeScript interfaces
6. Component renders transaction list

**State Management:**

- **Authentication:** AuthContext (global, persists in localStorage)
- **Component State:** useState hooks for local state
- **Side Effects:** useEffect hooks for data fetching
- **No Redux/Zustand:** State management is minimal, uses Context + local state

## Key Abstractions

**API Services:**
- Purpose: Encapsulate backend communication
- Examples: `src/services/DonationService.ts`, `src/services/UserService.ts`, `src/services/AdminService.ts`, `src/services/CMSService.ts`, `src/services/RegionService.ts`, `src/services/MasjidService.ts`, `src/services/InfaqService.ts`
- Pattern: Named export functions returning Promises

**ProtectedRoute:**
- Purpose: Guard authenticated routes
- Location: `src/components/ProtectedRoute.tsx`
- Pattern: Wraps child components, redirects to /login if not authenticated

**Role-Based Access:**
- Three roles: `user`, `admin`, `superadmin`
- Roles control sidebar navigation visibility
- Roles stored in AuthContext and localStorage

## Entry Points

**Application Entry:**
- Location: `src/main.tsx`
- Triggers: Browser loads index.html
- Responsibilities: Render AuthProvider, render App, register PWA service worker

**Routing Entry:**
- Location: `src/App.tsx`
- Triggers: App component renders
- Responsibilities: Define all routes, wrap with BrowserRouter, provide MainLayout

**Dashboard Routing:**
- Location: `src/pages/Dashboard.tsx`
- Triggers: Route matches /dashboard/*
- Responsibilities: Nested routes for dashboard sections, role-based protection

## Error Handling

**Pattern:**
- Service layer catches Axios errors, throws descriptive Error objects
- Components use try/catch with toast notifications (react-hot-toast)
- Network errors handled gracefully with user-friendly messages
- 401 responses trigger logout in some contexts

**User Feedback:**
- react-hot-toast for success/error notifications
- Loading states on forms and data fetching
- Empty states for lists

## Cross-Cutting Concerns

**Authentication:** AuthContext with localStorage persistence
**Routing:** React Router v7 with nested routes
**Styling:** Tailwind CSS v4 with custom primary color (#10B981)
**Animations:** Framer Motion for page transitions and micro-interactions
**PWA:** vite-plugin-pwa with NetworkFirst for HTML, StaleWhileRevalidate for assets, CacheFirst for images

---

*Architecture analysis: 2026-03-13*
