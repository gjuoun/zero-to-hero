# zero-to-hero

Crypto quant trading journey — from zero to profitable strategies in 6 phases.

Rust/Solidity developer going deep on on-chain data, market microstructure, MEV, and backtesting.

## Layout

```
zero-to-hero/
├── rust/          # Cargo workspace (strategy-core, future crates)
├── py/            # uv workspace (data package, notebooks)
├── contracts/     # Foundry workspace (Solidity stubs, future flash-loan)
├── mise.toml      # Tool version pins (python, uv, just)
├── justfile       # Root orchestration (setup, check, refs)
└── docs/          # Plans, specs, checklists
```

## Prerequisites

- [mise](https://mise.jdx.dev) — tool version manager (recommended; install via `brew install mise`)
- [rustup](https://rustup.rs) — Rust toolchain manager
- [Foundry](https://getfoundry.sh) — Solidity dev toolkit (`forge`, `cast`)
- [uv](https://docs.astral.sh/uv/) — Python package & workspace manager (managed by mise)

## Quickstart

```bash
just setup   # Bootstrap all toolchains and workspaces
just check   # Health: cargo + py imports + forge
just qa      # Lint + format-check + typecheck (all languages)
```

### Quality commands

| Recipe | Rust | Python | Contracts |
|--------|------|--------|-----------|
| **fmt** | `cargo fmt` | `ruff format` | `forge fmt` |
| **lint** | `cargo clippy` | `ruff check` | `forge lint` |
| **typecheck** | `cargo check` | `pyright` | `forge build` |
| **qa** | all of the above (check mode) | same | same |

Per-language: `just rust-qa`, `just py-qa`, `just contracts-qa`.  
Apply format: `just fmt` (or `just rust-fmt` / `py-fmt` / `contracts-fmt`).

## Manual Checklist

Some steps require a browser — see **[Phase 0 Checklist](docs/phase-0-checklist.md)**:

- Dune Analytics registration + test query
- Alchemy/Infura RPC key → `.env`
- The Graph Studio + DefiLlama awareness

## Optional: Learning References

```bash
just refs   # Clone hftbacktest, rbuilder, quantumflow into ~/code/refs/
```

These live outside the monorepo and are not vendored or tracked.

## Plan

See the full Phase 0 spec at [docs/plan/2026-07-10/phase-0-monorepo/spec.md](docs/plan/2026-07-10/phase-0-monorepo/spec.md).
