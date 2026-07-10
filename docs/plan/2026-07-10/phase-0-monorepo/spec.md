# Spec: Phase 0 — Polyglot Monorepo Bootstrap

**Date:** 2026-07-10  
**Issue:** JG-57 (Crypto Quant Trading Roadmap)  
**Status:** Pending approval  
**Roadmap source:** `~/.notebook/inbox/crypto-quant-roadmap.md` (Phase 0)

---

## Context

`zero-to-hero` is an empty greenfield repo (single commit, bare README) intended to host a 6-phase crypto quant trading journey for a chain-native Rust/Solidity developer with zero quant background.

Phase 0 must:

1. Bootstrap a **modern polyglot monorepo** that can grow through Phases 1–6 without rewiring layout.
2. Install/verify **local toolchains** so code, data queries, and simulations can start immediately.
3. Leave **external accounts** (Dune, RPC, The Graph) as a short manual checklist — not brittle automation.

Related knowledge lives outside this repo (`~/.notebook/inbox/crypto-quant-roadmap.md`, quant primer research). This repo becomes the **execution home**.

---

## Goal

Turn `zero-to-hero` into a language-first monorepo with pinned tools (`mise` including `uv`), root orchestration (`just` + `scripts/setup.sh`), and minimal stubs so `just setup` / `just check` prove the environment is ready for Phase 1.

---

## Scope

### In

- Language-first layout: `rust/`, `py/`, `contracts/` (+ root tooling/docs)
- Skeleton only: workspace files + stubs (`strategy-core`, `py/packages/data`, contracts placeholder)
- Tooling: `mise.toml`, root `justfile`, `scripts/setup.sh`, `.gitignore`, `.env.example`
- Hybrid setup: automate installs; accounts/RPC as checklist
- Optional reference clones to `~/code/refs/` (not vendored into monorepo)
- Phase 0 verify gates aligned with roadmap deliverables (local side)

### Out

- Phase 1+ implementation (Dune strategies, monitors, backtest, flash loans, MEV)
- Pre-creating all phase crates (`dex-monitor`, `mev-bot`, etc.)
- Vendoring hftbacktest / rbuilder / quantumflow into the repo
- Live Dune/RPC smoke tests as hard gates
- Bazel / Nx / Turborepo / multi-Foundry workspaces
- Committing secrets or real API keys

---

## Design Summary

Phase 0 creates a language-first polyglot monorepo with `mise` (pins rust, python, uv, just, foundry), `just` orchestration, and minimal stubs. Success is local health green plus a completed manual account checklist — not trading logic.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  zero-to-hero (repo root)                               │
├─────────────────────────────────────────────────────────┤
│  mise.toml     pin: rust, python, uv, just, foundry     │
│  justfile      setup | check | rust.* | py.*            │
│  scripts/setup.sh   idempotent local bootstrap          │
│  .env.example  RPC_URL, DUNE_API_KEY (no secrets)       │
│  docs/         plan + Phase 0 checklist                 │
└──────────┬──────────────────┬──────────────────┬────────┘
           │                  │                  │
           ▼                  ▼                  ▼
┌──────────────────┐ ┌──────────────────┐ ┌──────────────────┐
│  rust/           │ │  py/             │ │  contracts/      │
│  Cargo workspace │ │  uv workspace    │ │  Foundry stub    │
├──────────────────┤ ├──────────────────┤ ├──────────────────┤
│  crates/         │ │  packages/data/  │ │  foundry.toml    │
│    strategy-core │ │  notebooks/      │ │  src/.gitkeep    │
│  cargo check ✓   │ │  uv sync ✓       │ │  forge --version │
└──────────────────┘ └──────────────────┘ └──────────────────┘
           │
           │ optional (outside monorepo)
           ▼
┌──────────────────┐
│  ~/code/refs/    │  hftbacktest, rbuilder, quantumflow
│  just refs       │  learning clones only — not vendored
└──────────────────┘
```

---

## Approaches (decided)

| Decision | Choice | Alternatives rejected |
|----------|--------|------------------------|
| Layout | **Language-first hybrid** | App-first domains; phase folders as roots |
| Scaffold depth | **Skeleton only** | Full phase stubs; tooling-only |
| Setup model | **Hybrid** (auto tools, manual accounts) | Fully automated accounts; docs-only |
| Delivery | **Tooling-first bootstrap** | Live smoke-test gate; skeleton without installs |
| Orchestration | **just + mise + uv** | Bazel; cargo-make-only; Turborepo day-one |
| Reference repos | **Outside monorepo** (`~/code/refs/`) | git submodules; vendor/ |

---

## Components

| Component | Role | Phase 0 deliverable |
|-----------|------|---------------------|
| `mise.toml` | Pin tool versions; mise manages `uv` | rust, python, uv, just, foundry (as available) |
| `justfile` | Root recipes: `setup`, `check`, language helpers, optional `refs` | Documented, runnable |
| `scripts/setup.sh` | Idempotent bootstrap called by `just setup` | Installs/syncs local deps |
| `rust/` | Cargo workspace | `crates/strategy-core` stub; `cargo check` passes |
| `py/` | uv workspace | `packages/data` stub + `notebooks/`; deps include pandas, numpy, scikit-learn, statsmodels, jupyter, ccxt |
| `contracts/` | Foundry placeholder | Minimal `foundry.toml` + empty `src/`; no production contracts yet |
| `.env.example` | Document required env vars | `RPC_URL`, `DUNE_API_KEY`, placeholders only |
| `docs/phase-0-checklist.md` | Manual account steps | Dune, The Graph, DefiLlama, Alchemy/Infura |
| `README.md` | How to bootstrap and verify | Points to just recipes + checklist |
| `~/code/refs/` (optional) | Learning clones | Not part of git tree |

---

## Data Flow

```python
# Phase 0 bootstrap
on just setup:
  mise install                          # pin/install tools (incl. uv)
  ensure rust toolchain via rustup/mise
  cargo check --manifest-path rust/Cargo.toml
  cd py && uv sync                      # workspace + data-stack deps
  forge --version                       # Foundry present
  print docs/phase-0-checklist.md summary

on just check:
  cargo check --manifest-path rust/Cargo.toml
  cd py && uv run python -c "import pandas, numpy, ccxt"
  forge --version
  → all green or fail with clear missing piece

on just refs:  # optional
  mkdir -p ~/code/refs
  clone hftbacktest, rbuilder, quantumflow if missing

# Manual (not automated)
user registers Dune / Alchemy|Infura / The Graph
user copies .env.example → .env and fills keys
user runs one Dune query in browser (roadmap deliverable)
```

---

## Error Handling

- **mise tool missing / install fail** — Fail with command output; do not continue silent partial setup
- **cargo check fail** — Fail `just setup` / `just check`; fix workspace before claiming Phase 0 done
- **uv sync fail** — Fail with pip/uv error; no fallback to global `pip install` into system Python
- **forge not found** — Fail check; instruct Foundry install (or mise backend) rather than skipping
- **alloy-cli** — Best-effort: install if recipe includes it; if crate/name unavailable, document skip without blocking Phase 0
- **refs clone fail** — Non-fatal for Phase 0; warn only (`just refs` optional)
- **Secrets** — Never write real keys into repo; `.env` gitignored

---

## Testing / Verification

| Gate | How |
|------|-----|
| Rust workspace | `cargo check --manifest-path rust/Cargo.toml` succeeds |
| Python stack | `uv run python -c "import pandas, numpy, ccxt"` succeeds |
| Foundry | `forge --version` succeeds |
| Orchestration | `just setup` then `just check` both exit 0 on a clean machine with network |
| Docs | README documents setup; checklist lists Dune + RPC + The Graph |
| Hygiene | No secrets committed; `.env` ignored; `target/`, `.venv`, `out/` ignored |

Roadmap Phase 0 items that remain **manual** (tracked in checklist, not CI):

- Dune query returns results in browser
- Account registration for The Graph / DefiLlama
- RPC key obtained and placed in local `.env`

---

## Target tree (Phase 0)

```
zero-to-hero/
├── .github/workflows/          # optional minimal CI later; not required for Phase 0 gate
├── .env.example
├── .gitignore
├── mise.toml
├── justfile
├── README.md
├── scripts/
│   └── setup.sh
├── docs/
│   ├── phase-0-checklist.md
│   └── plan/2026-07-10/phase-0-monorepo/
│       └── spec.md             # this file
├── rust/
│   ├── Cargo.toml              # workspace
│   └── crates/
│       └── strategy-core/
│           ├── Cargo.toml
│           └── src/lib.rs
├── py/
│   ├── pyproject.toml          # uv workspace
│   ├── packages/
│   │   └── data/
│   │       ├── pyproject.toml
│   │       └── src/data/__init__.py
│   └── notebooks/
│       └── .gitkeep
└── contracts/
    ├── foundry.toml
    └── src/.gitkeep
```

---

## Acceptance Criteria

1. **Layout** — Repo has language-first roots `rust/`, `py/`, `contracts/` with workspace/stub files as above; no phase-numbered top-level dirs.
2. **Tooling** — Root `mise.toml` pins tools and includes `uv` managed via mise; root `justfile` exposes at least `setup` and `check`.
3. **Rust** — `strategy-core` stub exists; `cargo check` on the workspace succeeds.
4. **Python** — uv workspace syncs; `pandas`, `numpy`, and `ccxt` import successfully under `uv run`.
5. **Foundry** — `contracts/` stub exists; `forge --version` works in the environment after setup.
6. **Secrets hygiene** — `.env.example` documents vars; `.env` and build artifacts are gitignored; no real keys in git.
7. **Docs** — README explains bootstrap; `docs/phase-0-checklist.md` covers Dune, RPC, The Graph (and DefiLlama as optional).
8. **References** — No learning repos vendored into monorepo; optional `just refs` targets external path (e.g. `~/code/refs/`).
9. **Scope discipline** — No Phase 1+ strategy code, no full phase crate pre-creation, no live trading logic.

---

## Non-goals (explicit)

- Implementing Dune SQL strategies or Telegram monitors
- Deploying contracts or mainnet transactions
- Docker/Grafana production stack (Phase 6)
- PyO3/maturin bridges (defer until a hot path needs them)

---

## Handoff notes (post-approval)

After this spec is approved:

1. Write implementation plan via `super/writing` (TDD/checklist-style tasks for skeleton + setup scripts).
2. Execute plan (scaffold files, run `just setup` / `just check`).
3. Update JG-57 Phase 0 subtask when local gates pass; leave manual checklist items open until user completes accounts.
