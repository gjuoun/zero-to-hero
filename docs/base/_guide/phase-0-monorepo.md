# Guide: Phase 0 Polyglot Monorepo Bootstrap

**Date:** 2026-07-10  
**Issue:** JG-57  
**Plan:** `docs/plan/2026-07-10/phase-0-monorepo/`

## What was built

Greenfield `zero-to-hero` is now a language-first polyglot monorepo ready for the crypto quant roadmap:

- **Rust** — Cargo workspace with `strategy-core` stub
- **Python** — uv workspace with `packages/data` (pandas, numpy, ccxt, …)
- **Solidity** — Foundry stub under `contracts/`
- **Orchestration** — `mise` (python/uv/just) + root `justfile` + `scripts/setup.sh`

Local gates: `just setup` and `just check` both exit 0.

## Key design decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Layout | Language-first (`rust/`, `py/`, `contracts/`) | Native workspaces; scales to Phases 1–6 |
| Tool pin | mise pins python/uv/just only | rustup + standalone Foundry already on host |
| Python pkg mgr | uv workspace + `uv run --package data` | Fast lockfile; member deps isolated |
| Refs | `just refs` → `~/code/refs/` | Learning clones not vendored |
| Accounts | Manual checklist | Dune/RPC/The Graph need human signup |
| Scaffold depth | Skeleton only | No pre-created phase crates |

## Architecture

```
zero-to-hero/
├── mise.toml          # python, uv, just
├── justfile           # setup | check | rust-* | py-* | refs
├── scripts/setup.sh   # fail-fast bootstrap
├── rust/              # Cargo workspace → strategy-core
├── py/                # uv workspace → packages/data + notebooks
├── contracts/         # Foundry stub
└── docs/phase-0-checklist.md
```

## Usage

```bash
# Bootstrap local toolchains + workspaces
just setup

# Health gates
just check

# Language helpers
just rust-check
just rust-test
just py-sync
just py-check

# Optional learning clones (outside repo)
just refs
```

## Configuration

| File | Purpose |
|------|---------|
| `.env.example` | `RPC_URL`, `DUNE_API_KEY` placeholders |
| `.env` | Local secrets only (gitignored) |
| `docs/phase-0-checklist.md` | Manual Dune / RPC / The Graph steps |

## Environment notes

- **Rust / Foundry:** Verified via `cargo` / `forge` on PATH (not mise-pinned)
- **uv versions:** Older uv (0.4.x) lacks `--all-packages`; recipes use plain `uv sync` + `uv run --package data`
- **alloy-cli:** Intentionally skipped for Phase 0; install later if needed (`cargo install alloy-cli`)

## Next

1. Complete `docs/phase-0-checklist.md` (Dune query + RPC key)
2. Start Phase 1 (Dune SQL / data hunter) under `py/packages/data` and `py/notebooks`
