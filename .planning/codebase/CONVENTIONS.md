# Coding Conventions

**Analysis Date:** 2026-03-13

## Languages

**Primary:**
- TypeScript 5.9.3 - All application code
- JavaScript (ES2022) - Transpiled via Vite

**Secondary:**
- CSS - Tailwind CSS for styling

## Naming Patterns

**Files:**
- PascalCase for components: `UserManagement.tsx`, `AddEditUserModal.tsx`
- camelCase for utilities and services: `dateUtils.ts`, `UserService.ts`
- camelCase for contexts: `AuthContext.tsx`
- Descriptive names with clear intent: `DeleteConfirmationModal.tsx`, `TransaksiDonasi.tsx`

**Functions:**
- camelCase for all functions
- Descriptive verbs: `getUserProfile`, `handleEditClick`, `fetchUsers`
- useCallback-wrapped functions for dependencies: `fetchUsers` in components

**Variables:**
- camelCase: `usersList`, `searchTerm`, `sortConfig`
- Boolean prefixes: `isOpen`, `isLoading`, `isSubmitting`, `isEditMode`
- Collections use plural: `usersList`, `filteredUsers`

**Types/Interfaces:**
- PascalCase: `UserDisplay`, `GetUsersResponse`, `SortConfig`
- Descriptive suffixes: `Payload`, `Response`, `Props`
- Exported interfaces for shared types

## Code Style

**Formatting:**
- Prettier (via ESLint integration)
- Tailwind CSS v4 with `@import "tailwindcss"` syntax
- Custom theme colors defined in `src/index.css`

**Linting:**
- ESLint 9.39.2 with TypeScript support
- React Hooks plugin enabled
- React Refresh plugin for HMR
- Config file: `eslint.config.js`

**Key ESLint Rules (from tsconfig.app.json):**
- `strict: true` - Full TypeScript strict mode
- `noUnusedLocals: true` - No unused local variables
- `noUnusedParameters: true` - No unused parameters
- `noFallthroughCasesInSwitch: true` - All switch cases must handle
- `verbatimModuleSyntax: true` - Explicit imports/exports

**Import Organization:**
1. React imports: `import React, { useState, useEffect } from "react";`
2. Third-party libraries: `import { motion } from "framer-motion";`, `import { toast } from "react-hot-toast";`
3. Relative imports (services/contexts): `import { useAuth } from "../../context/AuthContext";`
4. Local components: `import DashboardLayout from "./DashboardLayout";`

**Path Aliases:**
- None configured (using relative paths)

## Error Handling

**API Errors:**
- Try-catch blocks with typed errors: `catch (error: any)`
- Axios error extraction pattern:
  ```typescript
  if (axios.isAxiosError(error) && error.response) {
    const backendMessage = error.response.data?.message || error.response.data?.error || "Default message";
    throw new Error(backendMessage);
  }
  throw new Error("Network error message");
  ```
- Toast notifications for user feedback: `toast.error(error.message || "Gagal memuat data pengguna.")`
- Console logging for debugging: `console.error("Fetch Users Error:", error.response?.data || error);`

**Component Errors:**
- Early returns for closed modals: `if (!isOpen) return null;`
- Null checks before accessing properties
- Token validation before API calls: `if (!token) return;`

## Logging

**Framework:** Console logging via `console.error()` for API errors

**Patterns:**
- API errors: `console.error("Fetch Users Error:", error.response?.data || error);`
- No structured logging library currently in use

## Comments

**When to Comment:**
- Explain complex logic (e.g., date calculation in `dateUtils.ts`)
- Document API payload interfaces that match backend
- In-line comments for workarounds: `// FIX: Perubahan dari secretary_phone`
- Section markers: `// --- BARU: Interfaces untuk User Profile ---`

**JSDoc/TSDoc:**
- Minimal usage - mostly inline comments
- Function-level JSDoc in services: `/** Mengambil data profil lengkap user... */`

## Function Design

**Size:** No strict limit - components can be large (200+ lines)

**Parameters:**
- Props interface for components: `interface AddEditUserModalProps { isOpen, onClose, onSuccess, initialData }`
- Token passed explicitly in service functions
- Payload objects for API calls

**Return Values:**
- Async functions return Promises
- Type annotations on all functions: `const fetchUsers = useCallback(async () => { ... }): void => { ... }`
- API responses typed with generics: `AxiosResponse<GetUsersResponse[]>`

## Component Patterns

**State Management:**
- React useState for local component state
- useMemo for expensive computations: `const filteredUsers = useMemo(() => { ... }, [dependencies]);`
- useCallback for callback functions passed as props

**Component Structure:**
- Imports at top
- Type definitions
- Helper components (e.g., `TableSortHeader`)
- Main component with hooks
- Export at bottom: `export default UserManagement;`

**Props:**
- Interface-based prop typing
- Default values handled in useEffect or inline

## Styling Conventions

**Tailwind CSS:**
- Utility classes for all styling
- Custom color: `--color-primary: rgb(0, 208, 132)`
- Component-scoped classes
- Hover states: `hover:bg-green-600`
- Transitions: `transition-colors`, `transition-all`

## Module Design

**Exports:**
- Named exports for services and interfaces: `export const getUsers = ...`, `export interface UserDisplay { ... }`
- Default exports for components: `export default UserManagement;`

**Barrel Files:**
- Not used - direct imports from files

---

*Convention analysis: 2026-03-13*
