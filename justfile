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
