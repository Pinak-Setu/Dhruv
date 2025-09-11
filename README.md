# Project Dhruv — SOTA Parsing Engine

**Digital Twin + Reasoning Engine** for political landscape analysis with **TDD-first**, **ironclad quality gates**, and **enterprise-grade observability**.

[![CI](https://github.com/your-org/Project_Dhruv/actions/workflows/ironclad.yml/badge.svg)](https://github.com/your-org/Project_Dhruv/actions/workflows/ironclad.yml)
[![Coverage](https://img.shields.io/badge/coverage-95%2B%25-brightgreen)](https://github.com/your-org/Project_Dhruv/actions/workflows/ironclad.yml)

## 📋 Single Sources of Truth (SSOT)

This project implements two complementary brain documents:

### 🧠 [v3.5 TEXT-FIRST Brain](Brains%20🧠/PROJECT_DHRUV_SOTA_BRAIN_v3.5_TEXT_FIRST%20(1).md)
- **Immediate focus**: Robust text-only parsing + reasoning loop + Story Arcs
- **Multi-modal provisioned**: Vision/video behind feature flags (disabled by default)
- **Architecture**: Flask APIs, Neo4j KG, Postgres mirrors, Great Expectations validation
- **Execution**: TDD-first, atomic PRs, CI-only "done"

### 🧠 [v4.0 SOTA Brain](Brains%20🧠/PROJECT_DHRUV_SOTA_BRAIN_v4.0_SOTA.md)
- **End-state vision**: Full multi-modal parsing with foresight, analytics, KBC
- **Enterprise requirements**: SLOs ≤800ms P95, 99.5% uptime, DPDP compliance
- **Advanced features**: MLflow experiments, pgvector embeddings, Prefect orchestration

## 🎯 Project Goals

- **Accurate Parsing**: F1 ≥85% on labeled event type, actors, place, time
- **Reliable Reasoning**: ≥70% approved causal links from auto-suggestions
- **Strategic Foresight**: Top-1 event forecast accuracy ≥55% on backtests
- **Production Excellence**: P95 latency within SLO, MTTR <30 min

## 🏗️ Architecture Overview

```
Ingest (text) → Preprocess (normalize) → Reason (hypothesis loop) → Persist (Neo4j/Postgres) → Serve → Validate → Observe
```

- **APIs**: `/api/sota/parse`, `/api/sota/events/link`, `/api/health`
- **Knowledge Graph**: Neo4j 5 (system of record) + Postgres (relational mirrors)
- **Validation**: Great Expectations suites + Pandera DataFrame contracts
- **Observability**: OpenTelemetry traces, RED metrics, structured logs
- **Infrastructure**: Docker Compose (dev/CI parity), feature flags for safety

## 🚀 Implementation Roadmap

### Phase 1: Foundation (PR-01 to PR-05) ✅
- [x] **PR-01**: Feature flags + health exposure (ENABLE_VISION=false, ENABLE_VIDEO=false)
- [x] **PR-02**: Docker Compose infra (Postgres+PostGIS, Neo4j) + health checks
- [x] **PR-03**: Text preprocessor (nukta normalization, candidate extraction)
- [x] **PR-04**: Parse API skeleton (text-only, dry_run) — *In Progress*
- [x] **PR-05**: Event dataset GE suite + validation harness

### Phase 2: Core Engine (PR-06 to PR-10)
- [ ] **PR-06**: Neo4j + Postgres idempotent loaders
- [ ] **PR-07**: Graph retriever (context fetch)
- [ ] **PR-08**: Reasoning loop (Hypothesize→Retrieve→Re-evaluate→Update)
- [ ] **PR-09**: Observability (OTel + RED metrics + structlog)
- [ ] **PR-10**: Story Arc linking (backend first)

### Phase 3: Advanced Features (PR-11 to PR-15)
- [ ] **PR-11**: Parser Sandbox (dry-run mode)
- [ ] **PR-12**: Narrative tagging (topics, text-only)
- [ ] **PR-13**: KBC stub (deferred orchestration)
- [ ] **PR-14**: Security/Privacy hardening
- [ ] **PR-15**: Performance & heavy tests

## 🛡️ Quality Gates (Ironclad)

- **TDD**: Red → Green → Refactor for every change
- **Coverage**: Unit ≥90%, Integration ≥85%, E2E ≥80%
- **CI Checks**: lint, typecheck, unit, coverage gate, security, SBOM, a11y, perf, e2e
- **Data Integrity**: Great Expectations validation + idempotent writes
- **Security**: PII redaction, secrets via env, DPDP compliant

## 🏃‍♂️ Quick Start

### Prerequisites
- Python 3.11+, Node 18+, Docker + Docker Compose
- Git worktrees for isolated development

### Local Development
```bash
# Clone and setup worktree
git clone <repo-url>
cd Project_Dhruv
git worktree add ../dhruv-agent-worktree feature/sota-parsing-engine-bootstrap

# Start infrastructure
cd infra
docker-compose up -d

# Install dependencies
cd ../api
pip install -r requirements.txt

# Run API
python -m api.src.app

# Health check
curl http://localhost:5000/api/health
```

### Testing
```bash
# Unit tests
PYTHONPATH=/path/to/api pytest api/tests/unit/

# Integration tests
PYTHONPATH=/path/to/api pytest api/tests/integration/

# With real client data
pytest api/tests/unit/test_normalization_rules.py -v
```

## 📊 Feature Flags

Central switches for safe deployment:

```python
# api/src/config/feature_flags.py
ENABLE_VISION = os.getenv("ENABLE_VISION", "false").lower() == "true"      # Default: OFF
ENABLE_VIDEO = os.getenv("ENABLE_VIDEO", "false").lower() == "true"       # Default: OFF  
ENABLE_EMBEDDINGS = os.getenv("ENABLE_EMBEDDINGS", "true").lower() == "true"  # Default: ON
```

## 📚 Documentation

- **[Runbook](runbook.md)**: Operational procedures, flags, monitoring
- **[Agent Guidelines](AGENTS.md)**: Development workflow and standards
- **[DevOps Policy](.agent-policy/devops_agent_policy.yaml)**: Quality gates and rules
- **[PR Template](.github/pull_request_template.md)**: Atomic PR checklist

## 🤝 Contributing

1. **Worktree Isolation**: Create dedicated worktree for your changes
2. **Atomic PRs**: One concern per PR, TDD-first, CI green required
3. **Documentation**: Update runbook/docs alongside code
4. **Real Data**: Use `data/posts.json` and `data/posts_new.json` for tests

## 📈 Current Status

- ✅ Foundation infrastructure complete
- ✅ Text preprocessing with nukta normalization
- ✅ Feature flags and health monitoring
- 🚧 Parse API skeleton (text-only)
- 📋 Validation harness with Great Expectations

**Next**: Complete PR-04 (Parse API) and PR-05 (GE validation), then proceed to KG integration.

---

*Built with ❤️ for robust, observable, and reversible software that "just works".*

**SSOT References**: [v3.5 TEXT-FIRST](Brains%20🧠/PROJECT_DHRUV_SOTA_BRAIN_v3.5_TEXT_FIRST%20(1).md) | [v4.0 SOTA](Brains%20🧠/PROJECT_DHRUV_SOTA_BRAIN_v4.0_SOTA.md)