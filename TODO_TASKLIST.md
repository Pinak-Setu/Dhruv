# Project Dhruv — Task List (Atomic, TDD)

Legend: [ ] pending • [~] in_progress • [x] completed (UTC timestamps)

## Phase 1 — Web Dashboard
- [x] P1-02: Expand place/entity lexicon (completed: 2025-09-06T00:00:00Z)
- [x] P1-03: Expand activity lexicon (completed: 2025-09-06T00:00:00Z)
- [x] P1-04: Improve “में” heuristic (completed: 2025-09-06T00:00:00Z)
- [x] P1-06: Date range filter (from/to) (completed: 2025-09-07T14:20:28Z)
- [x] P1-07: Reset/clear filters + clickable summaries + parsing badge + chips (completed: 2025-09-07T16:45:00Z)
- [x] P1-08: Tag/mention quick filter + robust Hindi/Hinglish/English matching (completed: 2025-09-07T16:58:20Z)

## Phase 2 — Sprint 1 (Backend API & Aliases)
- [~] A-01: Scaffold Flask API (`api/`) with `/api/health`
- [ ] A-02: requirements + pytest config
- [ ] A-03: Parsing package skeleton `api/src/parsing/`
- [ ] E-01: Contract tests for `/api/normalize`
- [ ] E-02: Minimal `/api/normalize` returning normalized tokens
- [ ] L-01: Define `aliases.json` schema + validator
- [ ] L-02: Seed `api/data/aliases.json` (locations/tags/events)
- [ ] L-03: Loader + variant→canonical index
- [ ] L-05: Hot reload endpoint `/api/aliases/reload` (flagged)
- [ ] N-01..N-04: Normalization (nukta, translit, phonetics, schwa) with tests
- [ ] O-01..O-03: Structured logs + metrics counters

## Phase 2 — Upcoming (Sprint 2+)
- [ ] Discovery pipeline (discover_aliases.py) + artifact
- [ ] Admin approval UI (secure) + hot reload
- [ ] API p95 ≤300ms load test + alerts
- [ ] Docs & Runbook deep updates

