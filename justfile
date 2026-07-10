set shell := ["bash", "-cu"]

default:
  @just --list

# ── Bootstrap ─────────────────────────────────────────────

setup:
  bash scripts/setup.sh

# Health: toolchains + workspace smoke (not full QA)
check:
  cargo check --manifest-path rust/Cargo.toml
  cd py && mise exec -- uv sync --all-packages
  cd py && mise exec -- uv run --package data python -c "import pandas, numpy, ccxt; print('py-ok')"
  forge --version

# ── Rust ──────────────────────────────────────────────────

[group('rust')]
rust-fmt:
  cargo fmt --manifest-path rust/Cargo.toml

[group('rust')]
rust-fmt-check:
  cargo fmt --manifest-path rust/Cargo.toml -- --check

[group('rust')]
rust-lint:
  cargo clippy --manifest-path rust/Cargo.toml --all-targets -- -D warnings

[group('rust')]
rust-typecheck:
  cargo check --manifest-path rust/Cargo.toml --all-targets

[group('rust')]
rust-test:
  cargo test --manifest-path rust/Cargo.toml

[group('rust')]
rust-qa: rust-fmt-check rust-lint rust-typecheck

# ── Python ────────────────────────────────────────────────

[group('py')]
py-sync:
  cd py && mise exec -- uv sync --all-packages

[group('py')]
py-fmt:
  cd py && mise exec -- uv run ruff format packages

[group('py')]
py-fmt-check:
  cd py && mise exec -- uv run ruff format --check packages

[group('py')]
py-lint:
  cd py && mise exec -- uv run ruff check packages

[group('py')]
py-typecheck:
  cd py && mise exec -- uv run pyright

[group('py')]
py-check:
  cd py && mise exec -- uv run --package data python -c "import pandas, numpy, ccxt; print('py-ok')"

[group('py')]
py-qa: py-fmt-check py-lint py-typecheck

# ── Contracts (Foundry) ───────────────────────────────────

[group('contracts')]
contracts-fmt:
  forge fmt --root contracts

[group('contracts')]
contracts-fmt-check:
  forge fmt --check --root contracts

[group('contracts')]
contracts-lint:
  forge lint --root contracts

[group('contracts')]
contracts-typecheck:
  # Compile = Solidity typecheck; empty src is fine for Phase 0
  forge build --root contracts

[group('contracts')]
contracts-qa: contracts-fmt-check contracts-lint contracts-typecheck

# ── Aggregate ─────────────────────────────────────────────

[group('qa')]
fmt: rust-fmt py-fmt contracts-fmt

[group('qa')]
fmt-check: rust-fmt-check py-fmt-check contracts-fmt-check

[group('qa')]
lint: rust-lint py-lint contracts-lint

[group('qa')]
typecheck: rust-typecheck py-typecheck contracts-typecheck

[group('qa')]
qa: rust-qa py-qa contracts-qa

# ── Refs ──────────────────────────────────────────────────

refs:
  mkdir -p "${HOME}/code/refs"
  test -d "${HOME}/code/refs/hftbacktest" || git clone --depth 1 https://github.com/nkaz001/hftbacktest "${HOME}/code/refs/hftbacktest"
  test -d "${HOME}/code/refs/rbuilder" || git clone --depth 1 https://github.com/flashbots/rbuilder "${HOME}/code/refs/rbuilder"
  test -d "${HOME}/code/refs/quantumflow" || git clone --depth 1 https://github.com/galafis/quantumflow "${HOME}/code/refs/quantumflow"
  @echo "refs ready under ~/code/refs"
