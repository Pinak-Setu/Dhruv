# Project Dhruv Runbook

## Deploy & Rollback
- Deploy: GitHub → merge to `main` triggers Vercel Production.
- Preview: PRs auto-deploy to Vercel Preview.
- Rollback: Use `vercel rollback <deployment-url-or-id>` to restore last good build within minutes.

## Feature Flags
- `FLAG_PARSE`: Controls parsing pipeline.
  - Production default: OFF (enable via Vercel env).
  - Dev/Test default: ON (set `FLAG_PARSE=off` to disable).
- Change flags in Vercel Project → Settings → Environment Variables.

## Health & Monitoring
- API: `/api/health` returns `{status:'ok', traceId}`.
- Synthetic checks via CI: k6 (p95 <= 300ms), Lighthouse (perf), axe (a11y).

## CI Quality Gates
- Coverage: lines >= 95%, branches >= 70%.
- Required checks: lint, type, unit, coverage gate, security, SBOM/licenses, web-a11y-perf, perf-k6, e2e, IaC, audit.

## Incident Playbook
1) Identify failing check in GitHub Actions (use `./scripts/ci-watch.sh`).
2) Reproduce locally; create minimal fix with tests (TDD), push.
3) If Production issue, disable via flag or `vercel rollback`.
4) Follow-up PR to re-enable with root-cause fixes.

