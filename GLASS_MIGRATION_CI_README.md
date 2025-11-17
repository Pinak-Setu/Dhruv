# Glass Migration CI Documentation

## Overview
This document outlines the CI pipeline for the glass-section-card migration, ensuring production-ready quality gates are maintained.

## CI Commands

### Primary Test Command (Run All)
```bash
npm run test:ci
```
This runs all required tests in sequence:
1. Unit tests (`npm test`)
2. Legacy guard tests (`npm run test:legacy-guard`)
3. Theme consistency tests (`npm run test:theme`)
4. E2E smoke tests (`npm run e2e:smoke`)
5. Performance checks (`npm run lighthouse`)

### Individual Test Commands

#### Unit Tests
```bash
npm test
```
- Runs Vitest unit tests
- Includes 16/16 glass-section-card contract tests
- **Failure Condition**: Any test fails

#### Legacy Guard Tests
```bash
npm run test:legacy-guard
```
- Prevents legacy `glassmorphic-card` usage
- Scans all component files for violations
- **Failure Condition**: Any `glassmorphic-card` class found

#### Theme Consistency Tests
```bash
npm run test:theme
```
- Validates CSS token consistency
- Checks for proper glass-section-card usage counts
- **Failure Condition**: Theme violations detected

#### E2E Smoke Tests
```bash
npm run e2e:smoke
```
- Runs Playwright E2E tests against main tabs
- Covers Home, Dashboard, Analytics, Review, CommandView
- **Failure Condition**: Any E2E test fails or browser setup issues

#### Performance Checks
```bash
npm run lighthouse
```
- Automated performance validation using Puppeteer
- Checks load times, glass component presence, legacy component absence
- **Failure Condition**:
  - Load time > 3 seconds
  - Navigation time > 5 seconds
  - No glass-section-card components found
  - Legacy glassmorphic-card components present
  - Page has insufficient content

## CI Pipeline Configuration

### GitHub Actions Workflow
Located at: `.github/workflows/ci-glass-migration.yml`

#### Triggers
- Push to `main` or `demo-glass-component` branches
- Pull requests to `main` or `demo-glass-component` branches

#### Environment Requirements
- Node.js 18+
- Ubuntu latest
- Playwright browsers installed

#### Pipeline Steps
1. Checkout code
2. Setup Node.js with caching
3. Install dependencies
4. Install Playwright browsers
5. Run unit tests
6. Run legacy guard tests
7. Run theme consistency tests
8. Start dev server in background
9. Wait for server readiness (60s timeout)
10. Run E2E tests
11. Run performance checks
12. Upload test artifacts

## Failure Conditions & Exit Codes

### Test Failure Exit Codes
- **Unit Tests**: Exit code 1 if any Vitest spec fails
- **Legacy Guard**: Exit code 1 if glassmorphic-card violations found
- **Theme Tests**: Exit code 1 if CSS/token inconsistencies detected
- **E2E Tests**: Exit code 1 if any Playwright test fails
- **Performance**: Exit code 1 if performance thresholds exceeded

### Performance Thresholds
- **Load Time**: ≤ 3,000ms
- **Navigation Time**: ≤ 5,000ms
- **Glass Components**: ≥ 1 glass-section-card required
- **Legacy Components**: 0 glassmorphic-card allowed
- **Content Check**: Page must have sufficient content (>100 chars)

## Artifacts & Reports

### Generated Reports
- `test-results/results.json` - Playwright test results
- `test-results/junit.xml` - JUnit format for CI integration
- `reports/performance-check.json` - Performance metrics
- `playwright-report/` - HTML test reports

### CI Artifacts
All reports are uploaded as GitHub Actions artifacts on completion/failure for debugging.

## Local Development

### Running Tests Locally
```bash
# Start dev server in background
npm run dev &

# Run all CI tests
npm run test:ci

# Or run individual tests
npm test
npm run test:legacy-guard
npm run test:theme
npm run e2e:smoke
npm run lighthouse
```

### Debugging Failures
1. Check test output for specific failure reasons
2. Review generated reports in `reports/` and `test-results/`
3. For E2E failures, check `playwright-report/index.html`
4. For performance issues, examine `reports/performance-check.json`

## Migration Completion Criteria

The glass migration is considered **production-ready** when:
1. ✅ Unit + contract + guard tests pass
2. ✅ E2E tests run successfully (browsers installed, no infra blocks)
3. ✅ Performance checks pass with glass components present
4. ✅ All CI commands execute without manual intervention
5. ✅ Legacy components eliminated (0 glassmorphic-card found)

Current Status: **70% Complete** - E2E and performance infrastructure ready, awaiting component migration completion.