# Codebase Structure

**Analysis Date:** 2026-03-13

## Directory Layout

```
inuk-client/
├── public/                 # Static assets (logos, favicons)
├── src/
│   ├── assets/             # Images and static files
│   ├── components/        # React components
│   │   ├── dashboard/     # Dashboard-specific components
│   │   ├── landing/       # Landing page components
│   │   └── layout/         # Shared layout components (Navbar, Footer)
│   ├── context/           # React Context providers
│   ├── pages/             # Page-level components
│   ├── services/          # API service modules
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main app with routing
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── compose.dev.yaml       # Docker Compose development
├── compose.prod.yaml      # Docker Compose production
├── compose.staging.yaml   # Docker Compose staging
├── Dockerfile             # Production Dockerfile
├── index.html             # HTML entry
├── nginx.conf             # Production nginx config
├── nginx-storage.conf     # Storage nginx config
├── package.json           # Dependencies
├── tsconfig.json          # TypeScript config
├── tsconfig.app.json      # TypeScript app config
├── tsconfig.node.json     # TypeScript node config
└── vite.config.ts         # Vite bundler config
```

## Directory Purposes

**`src/components/`:**
- Purpose: Reusable React components
- Contains: UI components organized by feature
- Key files: `ProtectedRoute.tsx`, `InstallPWA.tsx`

**`src/components/dashboard/`:**
- Purpose: Dashboard-specific components
- Contains: Management pages, modals, visualizations
- Key files: `DashboardLayout.tsx`, `TransaksiDonasi.tsx`, `UserManagement.tsx`, `InfaqManagement.tsx`, `Visualisasi.tsx`

**`src/components/dashboard/ui/`:**
- Purpose: Reusable modal and UI components for dashboard
- Contains: AddEdit modals, Delete confirmations, Pagination
- Key files: `AddEditUserModal.tsx`, `DeleteConfirmationModal.tsx`, `Pagination.tsx`

**`src/components/landing/`:**
- Purpose: Public landing page components
- Contains: Hero, Features, Blog, Testimonials, FAQ sections
- Key files: `HeroSection.tsx`, `Blog.tsx`, `ArticleDetail.tsx`

**`src/components/layout/`:**
- Purpose: Shared layout components
- Contains: Navbar, Footer
- Key files: `Navbar.tsx`, `Footer.tsx`

**`src/context/`:**
- Purpose: React Context providers
- Contains: Authentication state management
- Key files: `AuthContext.tsx`

**`src/pages/`:**
- Purpose: Page-level components (route destinations)
- Contains: Landing, Login, Dashboard
- Key files: `Landing.tsx`, `Login.tsx`, `Dashboard.tsx`

**`src/services/`:**
- Purpose: API communication layer
- Contains: Axios-based service modules
- Key files: `DonationService.ts`, `UserService.ts`, `AdminService.ts`, `RegionService.ts`, `MasjidService.ts`, `InfaqService.ts`, `CMSService.ts`, `DonaturService.ts`

**`src/utils/`:**
- Purpose: Helper functions and utilities
- Contains: Date utilities, Excel export, scroll-to-top button, chart components
- Key files: `dateUtils.ts`, `ExportToExcel.ts`, `ScrollToTopButton.tsx`, `DonationChart.tsx`

## Key File Locations

**Entry Points:**
- `src/main.tsx`: Application bootstrap, AuthProvider wrapper, PWA registration
- `src/App.tsx`: Route definitions with BrowserRouter

**Routing:**
- `src/App.tsx`: Public routes (Landing, Login, article detail)
- `src/pages/Dashboard.tsx`: Protected dashboard routes with role-based access

**Authentication:**
- `src/context/AuthContext.tsx`: Auth state management
- `src/components/ProtectedRoute.tsx`: Route guard
- `src/pages/Login.tsx`: Login form with role detection

**API Services:**
- `src/services/DonationService.ts`: Donations CRUD
- `src/services/UserService.ts`: User management
- `src/services/AdminService.ts`: Admin operations
- `src/services/RegionService.ts`: Geographic regions
- `src/services/MasjidService.ts`: Masjid management
- `src/services/InfaqService.ts`: Infaq tracking
- `src/services/CMSService.ts`: Content management

## Naming Conventions

**Files:**
- PascalCase: `UserManagement.tsx`, `DonationService.ts`
- camelCase: `dateUtils.ts`, `ExportToExcel.ts`

**Directories:**
- camelCase: `src/components/dashboard`, `src/services`

**Components:**
- PascalCase for component files and exports
- Descriptive names: `AddEditUserModal.tsx`, `DeleteConfirmationModal.tsx`

**Interfaces:**
- PascalCase: `DonationDataRecap`, `TransactionAPI`, `GetUsersResponse`

## Where to Add New Code

**New Feature (Dashboard):**
- Implementation: `src/components/dashboard/`
- Modal UI: `src/components/dashboard/ui/`
- Service: `src/services/`
- Route: Add to `src/pages/Dashboard.tsx`

**New Feature (Landing Page):**
- Implementation: `src/components/landing/`
- Route: Add to `src/App.tsx`

**New API Endpoint:**
- Create/update: `src/services/`
- Follow existing pattern: export interface + async functions using axios

**New Utility:**
- Location: `src/utils/`
- Export for use in components

## Special Directories

**`.planning/codebase/`:**
- Purpose: Codebase analysis documents
- Generated: Yes
- Committed: Yes (for GSD planning)

**`public/`:**
- Purpose: Static assets served directly
- Generated: No
- Committed: Yes

**`node_modules/`:**
- Purpose: Dependencies
- Generated: Yes (npm install)
- Committed: No (.gitignore)

**`dist/`:**
- Purpose: Build output
- Generated: Yes (npm run build)
- Committed: No (.gitignore)

---

*Structure analysis: 2026-03-13*
