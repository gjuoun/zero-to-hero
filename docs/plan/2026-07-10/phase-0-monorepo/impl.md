# Phase 0 Monorepo Bootstrap — Implementation Plan

**Goal:** Bootstrap language-first polyglot monorepo tooling and stubs so `just setup` / `just check` prove Phase 0 local readiness.

**Architecture:** Root `mise` + `just` orchestrate independent language roots (`rust/` Cargo workspace, `py/` uv workspace, `contracts/` Foundry stub). Hybrid setup automates toolchains; accounts stay a checklist. No Phase 1+ logic, no vendored learning repos.

**Tech Stack:** mise, just, Rust/Cargo, uv/Python, Foundry/forge, bash setup script

**Execution:** Sequential

**Context:** `docs/plan/2026-07-10/phase-0-monorepo/abstract.md`, `docs/plan/2026-07-10/phase-0-monorepo/AGENTS.md`

---

## File Mapping

| Path | Action | Responsibility |
|------|--------|----------------|
| `.gitignore` | Create | Ignore target, .venv, out, .env, caches |
| `.env.example` | Create | Document RPC_URL, DUNE_API_KEY |
| `mise.toml` | Create | Pin python, uv, just only; rust via rustup, foundry standalone |
| `justfile` | Create | setup, check, refs, language helpers |
| `scripts/setup.sh` | Create | Idempotent bootstrap |
| `rust/Cargo.toml` | Create | Workspace root |
| `rust/crates/strategy-core/Cargo.toml` | Create | Stub lib crate |
| `rust/crates/strategy-core/src/lib.rs` | Create | Minimal public API |
| `py/pyproject.toml` | Create | uv workspace root |
| `py/packages/data/pyproject.toml` | Create | data package + deps |
| `py/packages/data/src/data/__init__.py` | Create | Package marker |
| `py/notebooks/.gitkeep` | Create | Notebooks dir |
| `contracts/foundry.toml` | Create | Minimal Foundry config |
| `contracts/src/.gitkeep` | Create | Contracts src placeholder |
| `docs/phase-0-checklist.md` | Create | Manual account steps |
| `README.md` | Modify | Bootstrap + verify docs |

---

### Task 1: Root hygiene and env template

**Files:**
- Create: `.gitignore`
- Create: `.env.example`

- [ ] **Step 0: Create all parent directories used by later tasks**

```bash
mkdir -p \
  scripts \
  rust/crates/strategy-core/src \
  py/packages/data/src/data \
  py/notebooks \
  contracts/src \
  docs
```

- [ ] **Step 1: Create `.gitignore`**

```gitignore
# Rust
rust/target/
**/target/

# Python
py/.venv/
**/.venv/
**/__pycache__/
**/*.py[cod]
**/.pytest_cache/
**/.mypy_cache/
**/.ruff_cache/
py/**/*.egg-info/
py/uv.lock.bak

# Foundry
contracts/out/
contracts/cache/
contracts/broadcast/
contracts/lib/

# Env / secrets
.env
.env.local
*.pem

# OS / IDE
.DS_Store
.idea/
.vscode/
*.swp

# Notebooks
**/.ipynb_checkpoints/
```

- [ ] **Step 2: Create `.env.example`**

```bash
# Copy to .env and fill locally. Never commit .env.
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
DUNE_API_KEY=
```

- [ ] **Step 3: Verify files exist**

```bash
test -f .gitignore && test -f .env.example && echo OK
```

Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add .gitignore .env.example
git commit -m "chore(repo): add gitignore and env example"
```

---

### Task 2: mise + just + setup script

**Files:**
- Create: `mise.toml`
- Create: `justfile`
- Create: `scripts/setup.sh`

- [ ] **Step 1: Create `mise.toml`**

Pin python/uv/just via mise. **Do not pin rust or foundry in mise.toml** — host uses rustup + standalone Foundry (documented exception; verified by `cargo`/`forge` in setup/check).

```toml
[tools]
# mise manages python + uv + just
# rust: rustup (not mise) — verified by cargo check
# foundry: standalone install — verified by forge --version
python = "3.14"
uv = "latest"
just = "latest"
```

- [ ] **Step 2: Create `scripts/setup.sh`**

Executable, idempotent, fail-fast (`set -euo pipefail`). From repo root.

**Note:** `just setup` / `just check` are not expected to pass until Tasks 3–5 create language roots (full green at Task 7).

```bash
#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

echo "==> mise"
if ! command -v mise >/dev/null 2>&1; then
  echo "error: mise not found. Install: brew install mise (or https://mise.jdx.dev)" >&2
  exit 1
fi
mise install

echo "==> Rust toolchain (rustup source of truth)"
if ! command -v cargo >/dev/null 2>&1; then
  echo "error: cargo not found. Install rustup: https://rustup.rs" >&2
  exit 1
fi
# Only run if rust workspace exists (after Task 3)
if [[ -f rust/Cargo.toml ]]; then
  cargo check --manifest-path rust/Cargo.toml
else
  echo "skip cargo check: rust/Cargo.toml missing (create in Task 3)"
fi

echo "==> Python: uv sync (data package)"
if ! command -v uv >/dev/null 2>&1; then
  echo "error: uv not found after mise install" >&2
  exit 1
fi
if [[ -f py/pyproject.toml ]]; then
  (
    cd py
    uv sync --all-packages
  )
else
  echo "skip uv sync: py/pyproject.toml missing (create in Task 4)"
fi

echo "==> Foundry (standalone source of truth)"
if ! command -v forge >/dev/null 2>&1; then
  echo "error: forge not found. Install Foundry: https://getfoundry.sh" >&2
  exit 1
fi
forge --version

# alloy-cli: best-effort skip — not required for Phase 0 gates
# (roadmap mentions alloy-cli; install later with: cargo install alloy-cli || true)

echo "==> Phase 0 local setup complete"
echo "Next: complete docs/phase-0-checklist.md (Dune, RPC, The Graph)"
```

- [ ] **Step 3: Create root `justfile`**

```just
set shell := ["bash", "-cu"]

default:
  @just --list

# Idempotent local bootstrap (full green after Tasks 3–5)
setup:
  bash scripts/setup.sh

# Health gates
check:
  cargo check --manifest-path rust/Cargo.toml
  cd py && uv sync --all-packages
  cd py && uv run --package data python -c "import pandas, numpy, ccxt; print('py-ok')"
  forge --version

# Language helpers
rust-check:
  cargo check --manifest-path rust/Cargo.toml

rust-test:
  cargo test --manifest-path rust/Cargo.toml

py-sync:
  cd py && uv sync --all-packages

py-check:
  cd py && uv run --package data python -c "import pandas, numpy, ccxt; print('py-ok')"

# Optional learning clones (outside monorepo)
refs:
  mkdir -p "${HOME}/code/refs"
  test -d "${HOME}/code/refs/hftbacktest" || git clone --depth 1 https://github.com/nkaz001/hftbacktest "${HOME}/code/refs/hftbacktest"
  test -d "${HOME}/code/refs/rbuilder" || git clone --depth 1 https://github.com/flashbots/rbuilder "${HOME}/code/refs/rbuilder"
  test -d "${HOME}/code/refs/quantumflow" || git clone --depth 1 https://github.com/galafis/quantumflow "${HOME}/code/refs/quantumflow"
  @echo "refs ready under ~/code/refs"
```

- [ ] **Step 4: chmod +x setup.sh**

```bash
chmod +x scripts/setup.sh
```

- [ ] **Step 5: Commit**

```bash
git add mise.toml justfile scripts/setup.sh
git commit -m "chore(tooling): add mise, just, and setup script"
```

**Commit note:** `just setup`/`just check` intentionally incomplete until Tasks 3–5 land; Task 7 is the green gate.

---

### Task 3: Rust workspace stub

**Files:**
- Create: `rust/Cargo.toml`
- Create: `rust/crates/strategy-core/Cargo.toml`
- Create: `rust/crates/strategy-core/src/lib.rs`

- [ ] **Step 1: Create workspace `rust/Cargo.toml`**

```toml
[workspace]
resolver = "2"
members = [
  "crates/strategy-core",
]

[workspace.package]
edition = "2021"
license = "MIT"
```

- [ ] **Step 2: Create `strategy-core` crate**

`rust/crates/strategy-core/Cargo.toml`:

```toml
[package]
name = "strategy-core"
version = "0.1.0"
edition.workspace = true
license.workspace = true

[dependencies]
```

`rust/crates/strategy-core/src/lib.rs`:

```rust
//! Shared strategy primitives (Phase 0 stub).

/// Placeholder version string for smoke tests.
pub fn version() -> &'static str {
    env!("CARGO_PKG_VERSION")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn version_is_nonempty() {
        assert!(!version().is_empty());
    }
}
```

- [ ] **Step 3: Verify cargo check and test**

```bash
cargo check --manifest-path rust/Cargo.toml
cargo test --manifest-path rust/Cargo.toml -p strategy-core
```

Expected: both succeed; test `version_is_nonempty` passes.

- [ ] **Step 4: Commit**

```bash
git add rust/
git commit -m "feat(rust): add Cargo workspace and strategy-core stub"
```

---

### Task 4: Python uv workspace + data package

**Files:**
- Create: `py/pyproject.toml`
- Create: `py/packages/data/pyproject.toml`
- Create: `py/packages/data/src/data/__init__.py`
- Create: `py/notebooks/.gitkeep`

- [ ] **Step 1: Create uv workspace root `py/pyproject.toml`**

```toml
[project]
name = "zero-to-hero-py"
version = "0.1.0"
description = "Python workspace for zero-to-hero quant stack"
requires-python = ">=3.12"
dependencies = []

[tool.uv.workspace]
members = ["packages/*"]

[dependency-groups]
dev = []
```

- [ ] **Step 2: Create `packages/data` with Phase 0 data-stack deps**

`py/packages/data/pyproject.toml`:

```toml
[project]
name = "data"
version = "0.1.0"
description = "On-chain / market data helpers (Phase 1 home)"
requires-python = ">=3.12"
dependencies = [
  "pandas>=2.2",
  "numpy>=2.0",
  "scikit-learn>=1.5",
  "statsmodels>=0.14",
  "jupyter>=1.0",
  "ccxt>=4.0",
]

[build-system]
requires = ["hatchling"]
build-backend = "hatchling.build"

[tool.hatch.build.targets.wheel]
packages = ["src/data"]
```

If hatch package layout needs adjustment for uv, use the layout uv expects (`src/data` with hatch packages config or flat package). Prefer whatever makes `uv sync` succeed.

`py/packages/data/src/data/__init__.py`:

```python
"""Data package stub for Phase 1 Dune / market data work."""

__version__ = "0.1.0"
```

`py/notebooks/.gitkeep`: empty file.

- [ ] **Step 3: uv sync and import check (member package)**

```bash
cd py && uv sync --all-packages
cd py && uv run --package data python -c "import pandas, numpy, ccxt; print('py-ok')"
```

Expected: sync succeeds; prints `py-ok`. Must use `--package data` / `--all-packages` so member deps are installed (root project has empty dependencies).

- [ ] **Step 4: Commit**

```bash
git add py/
git commit -m "feat(py): add uv workspace and data package with quant deps"
```

---

### Task 5: Foundry contracts stub

**Files:**
- Create: `contracts/foundry.toml`
- Create: `contracts/src/.gitkeep`

- [ ] **Step 1: Create minimal Foundry config**

`contracts/foundry.toml`:

```toml
[profile.default]
src = "src"
out = "out"
libs = ["lib"]
solc_version = "0.8.28"

[fmt]
line_length = 100
```

`contracts/src/.gitkeep`: empty.

Do **not** run `forge init` if it creates unwanted git/readme noise; prefer hand-written minimal stub. Do **not** install forge-std yet (Phase 4).

- [ ] **Step 2: Verify forge**

```bash
forge --version
```

Expected: version string (host has 1.5.1-stable).

- [ ] **Step 3: Commit**

```bash
git add contracts/
git commit -m "chore(contracts): add Foundry stub for future flash-loan work"
```

---

### Task 6: Docs — checklist + README

**Files:**
- Create: `docs/phase-0-checklist.md`
- Modify: `README.md`

- [ ] **Step 1: Create `docs/phase-0-checklist.md`**

Include manual steps from roadmap Phase 0:

- Register Dune Analytics; run any simple query
- Register The Graph Studio (optional for Phase 1 start)
- DefiLlama API awareness (free)
- Obtain Alchemy or Infura free RPC; put URL in `.env` as `RPC_URL`
- Optional: `just refs` for learning clones under `~/code/refs`
- Mark local gates: `just setup`, `just check`

- [ ] **Step 2: Rewrite `README.md`**

Sections:

1. What this repo is (crypto quant zero-to-hero monorepo)
2. Layout diagram (rust / py / contracts)
3. Prerequisites (mise recommended; rustup, foundry, uv)
4. Quickstart: `just setup` then `just check`
5. Manual checklist link: `docs/phase-0-checklist.md`
6. Optional refs: `just refs`
7. Link to plan: `docs/plan/2026-07-10/phase-0-monorepo/spec.md`

- [ ] **Step 3: Commit**

```bash
git add docs/phase-0-checklist.md README.md
git commit -m "docs: Phase 0 checklist and monorepo README"
```

---

### Task 7: End-to-end verification

**Files:** none (verify only)

- [ ] **Step 1: Run full setup**

```bash
just setup
```

Expected: exits 0; cargo check + uv sync + forge version.

- [ ] **Step 2: Run health check**

```bash
just check
```

Expected: exits 0; prints `py-ok` and forge version.

- [ ] **Step 3: Acceptance criteria sweep**

Confirm against spec:

1. Language-first roots present
2. mise.toml + justfile with setup/check
3. cargo check OK
4. pandas/numpy/ccxt import OK
5. forge --version OK
6. .env gitignored; .env.example present
7. README + checklist present
8. No vendored refs in repo
9. No Phase 1+ strategy code

- [ ] **Step 4: Final commit if any fixups**

Commit **only if** Step 3 required editing a tracked file. If all 9 criteria pass with no file changes, stop without committing (no empty commits).

```bash
# only when files changed:
git add -A
git status
git commit -m "fix(phase0): address setup verification gaps"
```

---

## Spec coverage map

| Acceptance criterion | Task |
|----------------------|------|
| Language-first layout | 3, 4, 5 |
| mise + just setup/check | 2, 7 |
| Rust strategy-core + cargo check | 3, 7 |
| Python uv + pandas/numpy/ccxt | 4, 7 |
| Foundry stub + forge | 5, 7 |
| Secrets hygiene | 1, 6 |
| README + checklist | 6 |
| No vendored refs / optional just refs | 2, 7 |
| No Phase 1+ code | all (scope) |
