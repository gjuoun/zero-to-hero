<agents_md>

<project>

# zero-to-hero — Crypto Quant Trading Journey

**Tagline:** Chain-native Rust/Solidity developer goes from zero quant to profitable strategies in 6 phases.

**Phase 0 Goal:** Bootstrap a modern polyglot monorepo with pinned tools, root orchestration, and minimal stubs so `just setup` / `just check` prove the environment is ready for Phase 1 (Dune on-chain data strategies).

**Roadmap source:** `~/.notebook/inbox/crypto-quant-roadmap.md` (JG-57, Phase 0)

</project>

<current_state>

### Repo State (greenfield)

- Bare `README.md` (1 line)
- `zero-to-hero.code-workspace` (VS Code project file, purple-peacock themed)
- `docs/plan/2026-07-10/phase-0-monorepo/spec.md` — approved spec for Phase 0
- No `.gitignore`, no tooling configs, no source code, no contracts
- Single git commit on `main`

**This is a genuine greenfield bootstrap.** Every tooling file, workspace config, and stub must be created from scratch.

</current_state>

<target_layout>

```
zero-to-hero/
├── .env.example                  # RPC_URL, DUNE_API_KEY placeholders (no secrets)
├── .gitignore                    # target/, .venv/, out/, .env, __pycache__/, node_modules/
├── .github/workflows/            # optional minimal CI later; not required for Phase 0 gate
├── mise.toml                     # pins: rust, python, uv, just, foundry
├── justfile                      # recipes: setup, check, rust.*, py.*, refs
├── README.md                     # bootstrap instructions → just recipes + checklist
├── scripts/
│   └── setup.sh                  # idempotent bootstrap called by `just setup`
├── docs/
│   ├── phase-0-checklist.md      # manual account steps (Dune, Alchemy, The Graph, DefiLlama)
│   └── plan/2026-07-10/phase-0-monorepo/
│       ├── spec.md               # approved spec (this plan's authority)
│       └── AGENTS.md             # this file — session discovery for implementation agents
├── rust/
│   ├── Cargo.toml                # workspace manifest
│   └── crates/
│       └── strategy-core/
│           ├── Cargo.toml
│           └── src/lib.rs        # stub (e.g. pub fn version() -> &'static str)
├── py/
│   ├── pyproject.toml            # uv workspace manifest
│   ├── packages/
│   │   └── data/
│   │       ├── pyproject.toml
│   │       └── src/data/__init__.py  # stub
│   └── notebooks/
│       └── .gitkeep
└── contracts/
    ├── foundry.toml              # minimal (src, out, libs)
    └── src/.gitkeep
```

### Key structural rules

| Rule | Explanation |
|------|-------------|
| **Language-first roots** | `rust/`, `py/`, `contracts/` at top level — NOT app-name or phase-number dirs |
| **Skeleton only** | Workspace files + stubs. No production logic. No pre-creating Phase 1-6 crates |
| **Single Foundry workspace** | One `contracts/` root — no multi-Foundry workspaces |
| **Outside refs** | Learning clones in `~/code/refs/` — NOT vendored, NOT git submodules |
| **Flat is fine** | `crates/` at workspace root inside `rust/` — not nested deep |

</target_layout>

<tooling_decisions>

| Tool | Role | Managed by | Notes |
|------|------|-----------|-------|
| **mise** | Global tool version pinning | — | Installed via Homebrew at `/opt/homebrew/bin/mise` |
| **uv** | Python package & workspace manager | mise (`mise.toml` includes uv) | NOT standalone `pip`/`pipenv`/`poetry` |
| **just** | Root command orchestration | mise | `just setup`, `just check`, `just rust.*`, `just py.*`, `just refs` |
| **Cargo** | Rust workspace build | rustup (toolchain: stable, managed by mise) | Workspace in `rust/Cargo.toml` |
| **Foundry (forge)** | Solidity dev & test | mise or standalone install | Running `forge --version` is the gate, not compiling contracts |
| **rustup** | Rust toolchain | Companion to mise | Installed separately; mise can invoke `rustup` |
| **Alloy CLI** | Rust Ethereum SDK CLI | Best-effort via `cargo install` | If crate unavailable, document skip — non-blocking |

### Orchestration flow

```
just setup
  ├── mise install                          # pin/install tools
  ├── cargo check --manifest-path rust/Cargo.toml
  ├── cd py && uv sync                      # workspace + deps
  ├── forge --version                       # Foundry present
  └── print docs/phase-0-checklist.md

just check
  ├── cargo check --manifest-path rust/Cargo.toml
  ├── uv run python -c "import pandas, numpy, ccxt"
  ├── forge --version
  └── all green or fail with clear message

just refs  (optional, non-blocking)
  └── mkdir -p ~/code/refs && clone learning repos
```

### Hybrid setup model

- **Automated (in scripts/setup.sh):** Toolchain installs, workspace syncs, version checks
- **Manual (tracked in docs/phase-0-checklist.md):** Dune registration, Alchemy/Infura RPC key, The Graph account, DefiLlama registration

</tooling_decisions>

<patterns>

### Language-first layout

- Organise by language (`rust/`, `py/`, `contracts/`), NOT by app name or phase number
- Each language root owns its own workspace config and package manager
- Cross-language integration goes through process boundaries (files, pipes, IPC) — not direct FFI unless explicitly deferred or performance-demanding

### No vendored references

- Learning repos (`hftbacktest`, `rbuilder`, `quantumflow`) live in `~/code/refs/` — outside the monorepo
- `just refs` clones them there, never into `vendor/` or as git submodules
- This keeps the monorepo lean and avoids license/sync headaches

### Secrets hygiene

- `.env.example` documents all required env vars with placeholder values
- `.env` is gitignored at root level
- Real API keys (Dune, Alchemy, Infura) exist only in developer's local `.env`
- Never commit `.env`, never paste keys into issues/PRs
- CI uses repo secrets or service accounts if needed later (Phase 6+)

### Error handling philosophy

- **Fail fast with clear messages** — tool missing → print install command + exit 1
- **No silent fallbacks** — uv sync failing must not fall back to global `pip install`
- **Warnings are for non-essentials** — refs clone failures warn but don't block Phase 0
- **Gate separation** — automated gates (`cargo check`, `uv run`) vs. manual checklist items (account registration)

### justfile style

- One root `justfile` with sections: `setup`, `check`, `rust.*`, `py.*`, `refs`
- Each recipe is a single `# comment` + one or two shell lines
- Use `@` prefix for silent commands, omit for verbose
- Keep it readable and minimal — not a Makefile replacement for compilation

</patterns>

<acceptance_criteria>

| # | Criterion | Verification |
|---|-----------|-------------|
| 1 | **Layout** | Language-first roots `rust/`, `py/`, `contracts/` with workspace/stub files; no phase-numbered top-level dirs |
| 2 | **Tooling** | Root `mise.toml` pins tools and includes `uv`; root `justfile` exposes `setup` and `check` |
| 3 | **Rust** | `strategy-core` stub exists; `cargo check` on the workspace succeeds |
| 4 | **Python** | uv workspace syncs; `pandas`, `numpy`, `ccxt` import under `uv run` |
| 5 | **Foundry** | `contracts/` stub exists; `forge --version` works after setup |
| 6 | **Secrets hygiene** | `.env.example` documents vars; `.env` and build artifacts gitignored; no real keys in git |
| 7 | **Docs** | README explains bootstrap; `docs/phase-0-checklist.md` covers Dune, RPC, The Graph, DefiLlama |
| 8 | **References** | No learning repos vendored; optional `just refs` targets `~/code/refs/` |
| 9 | **Scope discipline** | No Phase 1+ strategy code, no full phase crate pre-creation, no live trading logic |

**Verification command:** `just setup && just check` — both must exit 0 on a clean machine with network access.

### Manual checklist items (not gated in CI)

- [ ] Dune query returns results in browser
- [ ] The Graph / DefiLlama account registration
- [ ] RPC key obtained and placed in local `.env`

</acceptance_criteria>

<anti_patterns>

### What NOT to do (enforce strictly)

| Anti-pattern | Why |
|-------------|-----|
| **Phase 1+ implementation** | No Dune SQL strategies, Telegram monitors, Rust DEX watchers, flash loan contracts, MEV bots, or backtest logic. Phase 0 is tooling + stubs only |
| **Pre-creating all phase crates** | Do NOT scaffold `dex-monitor`, `mev-bot`, `backtest-engine`, etc. Only `strategy-core` (shared foundation) gets a stub |
| **Bazel / Nx / Turborepo** | Rejected explicitly. Use `just` + `mise` + language-native workspaces |
| **Multi-Foundry workspaces** | Single `contracts/` root with one `foundry.toml`. No per-phase Foundry projects |
| **Vendoring learning refs** | No `vendor/` dir, no git submodules for `hftbacktest` / `rbuilder` / `quantumflow` |
| **Live RPC/Dune smoke tests as gates** | Account setup is manual checklist, not automated CI gate |
| **Full automation of accounts** | Dune / Alchemy / The Graph registration requires browser + human steps — do not attempt to script |
| **PyO3 / maturin bridges** | Defer until a hot path in Phases 3-5 proves it needs native Rust->Python FFI |
| **Docker / Grafana stack** | Production infra is Phase 6. Phase 0 is local dev only |
| **Committing real secrets** | `.env.example` only. No API keys in git history, ever |
| **Over-scaffolding** | No CI/CD pipelines beyond `.github/workflows/` skeleton if any. No Grafana dashboards. No production configs |

</anti_patterns>

<external_knowledge>

| Path | Role | Access pattern |
|------|------|---------------|
| `~/.notebook/inbox/crypto-quant-roadmap.md` | Full 6-phase roadmap document | Read-only reference for context on what Phase 1-6 will need |
| `~/code/blackhodl/qqntt/AGENTS.md` | Sibling monorepo AGENTS.md pattern | Reference only — shows XML-section format for AGENTS.md; its tooling (Bun/Turbo) does NOT apply here |
| `~/code/blackhodl/qqntt/justfile` | Sibling justfile pattern | Reference only — demonstrates `just --list` default recipe and recipe naming style |

**Rule:** Use roadmap for context on why Phase 0 exists and what it enables. Use blackhodl for structural reference (how AGENTS.md is organised) — never copy its stack decisions.

</external_knowledge>

<host_environment>

### Installed tooling (as of 2026-07-10)

| Tool | Version | Path | Notes |
|------|---------|------|-------|
| **mise** | 2026.6.4 (macOS-arm64) | `/opt/homebrew/bin/mise` | Active; ready for `mise.toml` config |
| **just** | 1.43.0 | `/opt/homebrew/bin/just` | Active; root justfile target |
| **uv** | 0.4.29 | `~/.cargo/bin/uv` | Installed via Cargo; mise can manage it |
| **rustc** | 1.96.0 | `~/.cargo/bin/rustc` | Stable toolchain; Cargo 1.96.0 |
| **cargo** | 1.96.0 | `~/.cargo/bin/cargo` | Matches rustc |
| **Python** | 3.14.4 | `/opt/homebrew/bin/python3` | System/brew Python |
| **forge** | 1.5.1-stable | `~/.foundry/bin/forge` | Foundry installed standalone |

### Platform

- **OS:** macOS (Darwin, arm64)
- **Shell:** zsh
- **Working directory:** `/Users/junguo/code/gjuoun/zero-to-hero`

### Notes

- `alloy-cli` is a best-effort install — if crate name is unavailable, document the skip without blocking Phase 0
- `rustup` is the companion toolchain manager — mise can delegate to it
- All tools already present on host — `just setup` should verify rather than reinstall
- No Docker daemon required for Phase 0

</host_environment>

<handoff>

### Post-implementation

After Phase 0 files are scaffolded and `just setup` / `just check` pass:

1. Update JG-57 Phase 0 subtask to "done" for automated gates
2. Leave manual checklist items (Dune query, account registration, RPC key) as open subtasks
3. Proceed to Phase 1 planning after manual checklist is completed

### Reference

- **Spec:** `docs/plan/2026-07-10/phase-0-monorepo/spec.md` — authority for all decisions
- **Roadmap:** `~/.notebook/inbox/crypto-quant-roadmap.md` — Phase 0 section for context

</handoff>

</agents_md>
