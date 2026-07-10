set shell := ["bash", "-cu"]

# Apps: rust | py | contracts  (omit = all)

default:
  @just --list

# ── Bootstrap ─────────────────────────────────────────────

setup:
  bash scripts/setup.sh

# ── Public API ────────────────────────────────────────────
# just check [app]       lint + format-check (+ typecheck for that app)
# just fmt [app]         apply format
# just lint [app]        lint only
# just typecheck [app]   typecheck only

# lint + format-check for app (or all)
check app="":
  #!/usr/bin/env bash
  set -euo pipefail
  app="{{app}}"
  case "$app" in
    "")
      just _rust-fmt-check && just _rust-lint
      just _py-fmt-check && just _py-lint
      just _contracts-fmt-check && just _contracts-lint
      ;;
    rust)
      just _rust-fmt-check && just _rust-lint
      ;;
    py)
      just _py-fmt-check && just _py-lint
      ;;
    contracts)
      just _contracts-fmt-check && just _contracts-lint
      ;;
    *)
      echo "error: unknown app '$app' (use: rust | py | contracts)" >&2
      exit 1
      ;;
  esac

# apply format for app (or all)
fmt app="":
  #!/usr/bin/env bash
  set -euo pipefail
  app="{{app}}"
  case "$app" in
    "")
      just _rust-fmt
      just _py-fmt
      just _contracts-fmt
      ;;
    rust) just _rust-fmt ;;
    py) just _py-fmt ;;
    contracts) just _contracts-fmt ;;
    *)
      echo "error: unknown app '$app' (use: rust | py | contracts)" >&2
      exit 1
      ;;
  esac

# lint for app (or all)
lint app="":
  #!/usr/bin/env bash
  set -euo pipefail
  app="{{app}}"
  case "$app" in
    "")
      just _rust-lint
      just _py-lint
      just _contracts-lint
      ;;
    rust) just _rust-lint ;;
    py) just _py-lint ;;
    contracts) just _contracts-lint ;;
    *)
      echo "error: unknown app '$app' (use: rust | py | contracts)" >&2
      exit 1
      ;;
  esac

# typecheck for app (or all)
typecheck app="":
  #!/usr/bin/env bash
  set -euo pipefail
  app="{{app}}"
  case "$app" in
    "")
      just _rust-typecheck
      just _py-typecheck
      just _contracts-typecheck
      ;;
    rust) just _rust-typecheck ;;
    py) just _py-typecheck ;;
    contracts) just _contracts-typecheck ;;
    *)
      echo "error: unknown app '$app' (use: rust | py | contracts)" >&2
      exit 1
      ;;
  esac

# ── Rust (private) ────────────────────────────────────────

[private]
_rust-fmt:
  cargo fmt --manifest-path rust/Cargo.toml

[private]
_rust-fmt-check:
  cargo fmt --manifest-path rust/Cargo.toml -- --check

[private]
_rust-lint:
  cargo clippy --manifest-path rust/Cargo.toml --all-targets -- -D warnings

[private]
_rust-typecheck:
  cargo check --manifest-path rust/Cargo.toml --all-targets

# ── Python (private) ──────────────────────────────────────

[private]
_py-fmt:
  cd py && mise exec -- uv run ruff format packages

[private]
_py-fmt-check:
  cd py && mise exec -- uv run ruff format --check packages

[private]
_py-lint:
  cd py && mise exec -- uv run ruff check packages

[private]
_py-typecheck:
  cd py && mise exec -- uv run pyright

# ── Contracts (private) ───────────────────────────────────

[private]
_contracts-fmt:
  forge fmt --root contracts

[private]
_contracts-fmt-check:
  forge fmt --check --root contracts

[private]
_contracts-lint:
  forge lint --root contracts

[private]
_contracts-typecheck:
  forge build --root contracts

# ── Misc ──────────────────────────────────────────────────

# Optional learning clones (outside monorepo)
refs:
  mkdir -p "${HOME}/code/refs"
  test -d "${HOME}/code/refs/hftbacktest" || git clone --depth 1 https://github.com/nkaz001/hftbacktest "${HOME}/code/refs/hftbacktest"
  test -d "${HOME}/code/refs/rbuilder" || git clone --depth 1 https://github.com/flashbots/rbuilder "${HOME}/code/refs/rbuilder"
  test -d "${HOME}/code/refs/quantumflow" || git clone --depth 1 https://github.com/galafis/quantumflow "${HOME}/code/refs/quantumflow"
  @echo "refs ready under ~/code/refs"
