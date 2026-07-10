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
