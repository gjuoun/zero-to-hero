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
just setup        # Bootstrap toolchains + workspaces
just check        # lint + format-check
just typecheck    # typecheck
```

### Quality commands

CLI is Bun + `cmd-ts` (`scripts/cli/commands/`). `just` is a thin wrapper.

```bash
just check       # or: bun run check
just fmt
just lint
just typecheck
bun run z2h --help
```

| Layer | Format | Lint | Typecheck |
|-------|--------|------|-----------|
| **rust** | `cargo fmt` | `cargo clippy` | `cargo check` |
| **py** | `ruff format` | `ruff check` | `pyright` |
| **contracts** | `forge fmt` | `forge lint` | `forge build` |

Need a dedicated flow later? Add a new file under `scripts/cli/commands/`.

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
