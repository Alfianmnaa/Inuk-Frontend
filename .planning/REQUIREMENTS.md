# Requirements: Inuk Client

**Defined:** 2026-03-13
**Core Value:** Enable mosques to efficiently manage and track Islamic charitable donations with clear reporting and transparency.

## v1 Requirements

### Testing Infrastructure

- [ ] **TEST-01**: Install Vitest 3.x as test runner with TypeScript support
- [ ] **TEST-02**: Install React Testing Library 16.x for component testing
- [ ] **TEST-03**: Install MSW 2.x for API mocking
- [ ] **TEST-04**: Configure Vitest in vite.config.ts with test environment
- [ ] **TEST-05**: Create test setup file (setupTests.ts) with custom render
- [ ] **TEST-06**: Configure ESLint for testing rules (testing-library plugins)
- [ ] **TEST-07**: Add test scripts to package.json (test, test:coverage)

### Utility Tests

- [x] **UTIL-01**: Write tests for dateUtils.ts (Islamic calendar calculations)
- [x] **UTIL-02**: Write tests for ExportToExcel.ts

### Service Tests

- [x] **SVC-01**: Create MSW handlers for all API endpoints
- [x] **SVC-02**: Write tests for DonationService.ts
- [x] **SVC-03**: Write tests for UserService.ts
- [x] **SVC-04**: Write tests for AuthService.ts (login, logout, token refresh) - covered by AuthContext tests
- [x] **SVC-05**: Write tests for AdminService.ts

### Context Tests

- [x] **CTX-01**: Write tests for AuthContext.tsx (login, logout, role access)
- [x] **CTX-02**: Test protected route behavior with mock auth

### Component Tests

- [x] **COMP-01**: Write tests for critical UI components (modals, forms)
- [x] **COMP-02**: Write tests for DashboardLayout.tsx
- [x] **COMP-03**: Write tests for ProtectedRoute.tsx

### Coverage

- [ ] **COV-01**: Achieve 70% line coverage for tested files
- [ ] **COV-02**: Add CI workflow to run tests on pull requests

## v2 Requirements

### Additional Testing

- **COMP-04**: Write tests for Landing page components
- **COMP-05**: Write tests for all dashboard management components
- **E2E-01**: Add Playwright for critical user flows
- **E2E-02**: Add visual regression tests

### Quality Improvements

- **QUAL-01**: Resolve all 27 `any` type usages
- **QUAL-02**: Add error boundaries to React app
- **QUAL-03**: Remove duplicate files (AuthContextAsli, RegionService copy)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cypress E2E | Playwright has better Vite integration |
| Visual regression (v1) | Add after component tests stabilized |
| Mobile app | Web-first, mobile later |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TEST-01 through TEST-07 | Phase 1 | Complete |
| UTIL-01 through UTIL-02 | Phase 2 | Complete |
| SVC-01 through SVC-05 | Phase 3 | Complete |
| CTX-01 through CTX-02 | Phase 4 | Complete |
| COMP-01 through COMP-03 | Phase 4 | Complete |
| COV-01 through COV-02 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-13*
*Last updated: 2026-03-13 after research*
