# Abstract — Phase 0 Monorepo Bootstrap

Session command doc for all downstream agents. Plan dir:
`docs/plan/2026-07-10/phase-0-monorepo/`

## Docs

- **Spec:** `docs/plan/2026-07-10/phase-0-monorepo/spec.md` (approved intent)
- **AGENTS.md:** `docs/plan/2026-07-10/phase-0-monorepo/AGENTS.md` (auto-loaded discovery)
- **Impl:** `docs/plan/2026-07-10/phase-0-monorepo/impl.md`

## Spec Review (`spec-reviewer`)

Verify:

- Plan covers every acceptance criterion in `spec.md`
- Tasks are executable with concrete paths and commands
- Skeleton-only scope (no Phase 1–6 crates, no vendored refs)
- Hybrid setup: auto toolchains, manual account checklist
- Secrets hygiene (`.env` ignored, example only)
- Error handling and verify gates match spec
- No human-gate infra mutations beyond local install scripts

## Build (`worker`)

Implement exactly per `impl.md` tasks:

- Root tooling: `mise.toml`, `justfile`, `scripts/setup.sh`, `.gitignore`, `.env.example`
- `rust/` Cargo workspace + `strategy-core` stub
- `py/` uv workspace + `packages/data` + notebooks
- `contracts/` Foundry stub
- Docs: README rewrite, `docs/phase-0-checklist.md`
- Verify with `just setup` / `just check` (or equivalent commands in plan)

Boundaries:

- Do not implement Phase 1+ trading logic
- Do not vendor reference repos into the monorepo
- Do not commit secrets
- Prefer host tools already installed; mise pins versions

## Discover (`finder` / `searcher`)

If blocked during implementation:

- Spec + AGENTS.md first
- Host tool versions: `mise`, `just`, `uv`, `cargo`, `forge`
- Optional pattern reference only: sibling `blackhodl` monorepo layout (do not copy stack)

## UI Review

Omit — no UI in Phase 0.
