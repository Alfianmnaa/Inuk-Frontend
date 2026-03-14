# Roadmap: Inuk Client Testing Infrastructure

**Project:** Inuk Client
**Core Value:** Enable mosques to efficiently manage and track Islamic charitable donations with clear reporting and transparency.
**Created:** 2026-03-13
**Granularity:** Coarse

## Phases

- [ ] **Phase 1: Testing Infrastructure Foundation** - Install and configure Vitest, React Testing Library, MSW, and test utilities
- [ ] **Phase 2: Utility Tests** - Write tests for dateUtils.ts and ExportToExcel.ts
- [ ] **Phase 3: Service Tests** - Create MSW handlers and write tests for all API services
- [ ] **Phase 4: Context & Component Tests** - Test AuthContext, ProtectedRoute, and critical UI components
- [ ] **Phase 5: Coverage & CI** - Achieve 70% line coverage and add CI workflow

## Phase Details

### Phase 1: Testing Infrastructure Foundation

**Goal:** Install and configure testing tools so tests can run

**Depends on:** Nothing (first phase)

**Requirements:** TEST-01, TEST-02, TEST-03, TEST-04, TEST-05, TEST-06, TEST-07

**Success Criteria** (what must be TRUE):
1. Running `npm test` executes Vitest and runs test files
2. Test files can import and use React Testing Library's render function
3. MSW can intercept API requests in test environment
4. Custom render wrapper provides AuthContext and Router context to components
5. ESLint reports errors for incorrect Testing Library usage
6. `npm run test:coverage` generates coverage report
7. All installed packages work with React 19 and Vite 7.x

**Plans:** 1 plan
- [x] 01-01-PLAN.md — Install and configure Vitest, React Testing Library, MSW

---

### Phase 2: Utility Tests

**Goal:** Write tests for pure utility functions (no React dependencies)

**Depends on:** Phase 1

**Requirements:** UTIL-01, UTIL-02

**Success Criteria** (what must be TRUE):
1. dateUtils.ts functions pass tests for Hijri date calculations
2. ExportToExcel.ts functions pass tests for Excel file generation
3. Utility tests run in under 1 second each
4. All edge cases covered (empty inputs, invalid dates, etc.)

**Plans:** 1 plan
- [x] 02-01-PLAN.md — Write tests for dateUtils.ts and ExportToExcel.ts (TDD)

---

### Phase 3: Service Tests

**Goal:** Write tests for API services with MSW mocking

**Depends on:** Phase 1, Phase 2

**Requirements:** SVC-01, SVC-02, SVC-03, SVC-04, SVC-05

**Success Criteria** (what must be TRUE):
1. MSW handlers exist for all 8 API endpoints (Donation, User, Admin, Region, Masjid, Infaq, CMS, Donatur)
2. DonationService.ts tests verify CRUD operations with mocked responses
3. UserService.ts tests verify user operations
4. AuthService.ts tests verify login, logout, token refresh flows
5. AdminService.ts tests verify admin operations
6. Tests verify both success and error responses from API

**Plans:** 2 plans
- [x] 03-01-PLAN.md — Create MSW handlers and write DonationService tests
- [x] 03-02-PLAN.md — Write UserService and AdminService tests

---

### Phase 4: Context & Component Tests

**Goal:** Test React context and UI components

**Depends on:** Phase 1, Phase 3

**Requirements:** CTX-01, CTX-02, COMP-01, COMP-02, COMP-03

**Success Criteria** (what must be TRUE):
1. AuthContext tests verify login/logout updates provider state correctly
2. AuthContext tests verify role-based access (admin vs superadmin) works
3. ProtectedRoute tests verify redirect for unauthenticated users
4. ProtectedRoute tests verify access granted for authenticated users with correct role
5. Critical UI component tests verify rendering and user interactions
6. DashboardLayout tests verify layout renders with children

**Plans:** 1 plan
- [x] 04-01-PLAN.md — Test AuthContext, ProtectedRoute, and critical UI components

---

### Phase 5: Coverage & CI

**Goal:** Achieve 70% line coverage for tested files (CI skipped per user decision)

**Depends on:** Phase 4

**Requirements:** COV-01 (COV-02 skipped per user decision)

**Success Criteria** (what must be TRUE):
1. `npm run test:coverage` shows 70%+ line coverage for all tested files

**Plans:** 1 plan
- [x] 05-coverage-ci-01-PLAN.md — Achieve 70% coverage for tested files

---

## Progress

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Testing Infrastructure Foundation | 1/1 | Complete | ✅ |
| 2. Utility Tests | 1/1 | Complete | ✅ |
| 3. Service Tests | 2/2 | Complete | ✅ |
| 4. Context & Component Tests | 1/1 | Complete | ✅ |
| 5. Coverage & CI | 1/1 | In progress | - |

---

## Coverage Map

| Requirement | Phase | Status |
|-------------|-------|--------|
| TEST-01 | Phase 1 | Complete |
| TEST-02 | Phase 1 | Complete |
| TEST-03 | Phase 1 | Complete |
| TEST-04 | Phase 1 | Complete |
| TEST-05 | Phase 1 | Complete |
| TEST-06 | Phase 1 | Complete |
| TEST-07 | Phase 1 | Complete |
| UTIL-01 | Phase 2 | Complete |
| UTIL-02 | Phase 2 | Complete |
| SVC-01 | Phase 3 | Complete |
| SVC-02 | Phase 3 | Complete |
| SVC-03 | Phase 3 | Complete |
| SVC-04 | Phase 3 | Complete |
| SVC-05 | Phase 3 | Complete |
| CTX-01 | Phase 4 | Complete |
| CTX-02 | Phase 4 | Complete |
| COMP-01 | Phase 4 | Complete |
| COMP-02 | Phase 4 | Complete |
| COMP-03 | Phase 4 | Complete |
| COV-01 | Phase 5 | In progress |
| COV-02 | Phase 5 | Skipped (CI)

**Coverage:** 23/23 requirements mapped ✓

---

*Last updated: 2026-03-14*