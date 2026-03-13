# Codebase Concerns

**Analysis Date:** 2026-03-13

## Tech Debt

**Duplicate RegionService Files:**
- Issue: Two nearly identical region service files exist: `src/services/RegionService.ts` (181 lines) and `src/services/RegionService copy.ts` (219 lines)
- Files: `src/services/RegionService.ts`, `src/services/RegionService copy.ts`
- Impact: Code duplication, maintenance burden, potential for inconsistencies
- Fix approach: Delete the copy file and consolidate functions into one service

**Duplicate AuthContext Files:**
- Issue: Two auth context files with subtle differences: `AuthContext.tsx` supports "superadmin" role while `AuthContextAsli.tsx` does not
- Files: `src/context/AuthContext.tsx`, `src/context/AuthContextAsli.tsx`
- Impact: Confusion about which to use, potential runtime issues
- Fix approach: Consolidate into single AuthContext with proper role handling, delete duplicate

**Duplicate Navbar:**
- Issue: `src/components/layout/Navbar copy.tsx` appears to be a backup of the Navbar component
- Files: `src/components/layout/Navbar.tsx`, `src/components/layout/Navbar copy.tsx`
- Impact: Unused code, potential confusion
- Fix approach: Delete the copy file

**Duplicate RegionService copy.ts functions:**
- Issue: The copied file contains duplicate functions with slightly different implementations (e.g., `getRegions` appears in both files with same logic)
- Files: `src/services/RegionService copy.ts`
- Impact: Redundant code increases bundle size
- Fix approach: Remove duplicate service file entirely

## Known Bugs

**Login Sequential Endpoint probing:**
- Symptoms: The login page tries `/login`, then `/admin/login`, then `/superadmin/login` sequentially, leaking information about valid user roles
- Files: `src/pages/Login.tsx` (lines 59-80)
- Trigger: Any login attempt reveals whether a phone number exists in the system
- Workaround: None
- Fix approach: Use a single login endpoint that returns the user role, or implement account lockout after failed attempts

**Empty Return Arrays Without Proper Error Indication:**
- Issue: Multiple service functions return empty arrays on error (`return []`) instead of propagating errors or providing error state
- Files: `src/services/InfaqService.ts` (lines 140, 183, 197), `src/services/RegionService.ts` (lines 72, 75, 133-180), `src/services/MasjidService.ts` (line 54)
- Impact: UI cannot distinguish between "no data" and "error occurred"
- Fix approach: Return proper error objects or throw errors for the UI to handle appropriately

**Missing Error Handling in useAuth Hook:**
- Issue: The `useAuth` hook returns `context!` with non-null assertion without properly handling undefined case
- Files: `src/context/AuthContext.tsx` (line 46), `src/context/AuthContextAsli.tsx` (line 46)
- Impact: Runtime errors if used outside AuthProvider
- Fix approach: Properly throw error or return default value when context is undefined

## Security Considerations

**Token Storage in localStorage:**
- Risk: Tokens are stored in localStorage which is accessible via XSS attacks
- Files: `src/context/AuthContext.tsx` (lines 16, 25-26)
- Current mitigation: None
- Recommendations: Use httpOnly cookies for token storage, implement token refresh mechanism

**Sequential Login Probing:**
- Risk: Attacker can enumerate valid users by trying phone numbers against login endpoint
- Files: `src/pages/Login.tsx`
- Current mitigation: None visible
- Recommendations: Single unified login endpoint, rate limiting, CAPTCHA

**No API URL Validation:**
- Risk: Application uses fallback to localhost (`http://localhost:8000`) if env variable missing, could leak development credentials in production
- Files: All service files (e.g., `src/services/InfaqService.ts` line 3)
- Current mitigation: None
- Recommendations: Fail fast if API URL is not configured in production

**No HTTPS Enforcement:**
- Risk: API calls could be made over HTTP in production
- Files: `src/services/*.ts` (VITE_API_URL can be HTTP)
- Current mitigation: None
- Recommendations: Validate HTTPS in production build

## Performance Bottlenecks

**Large Service Files:**
- Problem: `AdminService.ts` (253 lines), `InfaqService.ts` (240 lines), `UserService.ts` (239 lines) are monolithic
- Files: `src/services/AdminService.ts`, `src/services/InfaqService.ts`, `src/services/UserService.ts`
- Cause: All API calls in single files, no lazy loading
- Improvement path: Split into domain-specific modules (e.g., separate donation API, user API, admin API into subdirectories)

**No Request Caching:**
- Problem: Every component mount triggers fresh API calls with no caching
- Files: All service files
- Cause: No React Query or SWR implementation
- Improvement path: Implement React Query for automatic caching and deduplication

**Large Dashboard Bundle:**
- Problem: Dashboard loads all components upfront
- Files: `src/pages/Dashboard.tsx`
- Cause: No code splitting for route-based lazy loading
- Improvement path: Use React.lazy() for route components

## Fragile Areas

**Type Safety Gaps:**
- Files: Multiple service files use `any` type extensively (27 occurrences found)
- Why fragile: Type `any` bypasses TypeScript checks, errors only appear at runtime
- Safe modification: Replace `any` with proper types, use unknown where type is unknown
- Test coverage: N/A - no tests exist

**Inconsistent Error Handling:**
- Files: Services have inconsistent patterns - some throw, some return empty arrays, some use handleError function
- Why fragile: Different patterns make it unpredictable how errors will be handled
- Safe modification: Standardize error handling across all services
- Test coverage: N/A - no tests exist

**Hardcoded Fallback Values:**
- Files: All service files fallback to `http://localhost:8000`
- Why fragile: Could connect to wrong environment accidentally
- Safe modification: Throw error if API_URL is not set in production
- Test coverage: N/A - no tests exist

## Scaling Limits

**Monolithic Service Architecture:**
- Current capacity: Single service file handles all operations for a domain
- Limit: As more features are added, files grow linearly
- Scaling path: Split services into sub-modules by feature

**No Pagination in API Calls:**
- Current capacity: All records loaded at once
- Limit: Will fail with large datasets (1000+ records)
- Scaling path: Implement pagination in list endpoints and UI

## Dependencies at Risk

**Axios (^1.13.2):**
- Risk: Older Axios versions have known security vulnerabilities (CVE-2023-45857, CVE-2022-25942)
- Impact: HTTP request smuggling, credential leakage
- Migration plan: Upgrade to latest Axios 1.x or migrate to fetch API

**xlsx (npm:@e965/xlsx@0.20.3):**
- Risk: This is a fork of the original xlsx library, may not receive security updates
- Impact: Potential vulnerabilities in spreadsheet parsing
- Migration plan: Consider using official xlsx package or alternatives like exceljs

**React Router (^7.11.0):**
- Risk: Version 7 is a major rewrite, potential breaking changes in future
- Impact: Migration complexity
- Migration plan: Stay current with minor versions, test thoroughly on upgrades

## Missing Critical Features

**No Test Suite:**
- Problem: Zero test files exist in the codebase
- Files: No `*.test.ts`, `*.spec.ts`, or `*.test.tsx` files found
- Blocks: Safe refactoring, regression detection, TDD workflow

**No Input Validation:**
- Problem: Forms submit data without client-side validation
- Blocks: UX (users get server errors), performance (unnecessary API calls)

**No Loading States in Some Components:**
- Problem: Some components don't show loading indicators during API calls
- Blocks: Users may double-click, unclear app state

## Test Coverage Gaps

**No Unit Tests:**
- What's not tested: All business logic, service functions, utilities
- Files: `src/services/*.ts`, `src/utils/*.ts`
- Risk: Refactoring could break functionality without detection
- Priority: High

**No Integration Tests:**
- What's not tested: Component-to-service communication, auth flow
- Files: All components in `src/components/`
- Risk: Integration bugs go undetected
- Priority: High

**No E2E Tests:**
- What's not tested: Full user flows (login, donate, admin tasks)
- Risk: Critical user journeys could break
- Priority: Medium

**No Error Boundary:**
- What's not tested: Error handling in React tree
- Files: No error boundary component exists
- Risk: One component error crashes entire app
- Priority: High

---

*Concerns audit: 2026-03-13*
