set shell := ["bash", "-cu"]

# Thin wrappers → bun scripts/cli (cmd-ts)
# Optional app: rust | py | contracts

default:
  @just --list

setup:
  bash scripts/setup.sh

fmt *args:
  bun run scripts/cli/main.ts fmt {{args}}

lint *args:
  bun run scripts/cli/main.ts lint {{args}}

typecheck *args:
  bun run scripts/cli/main.ts typecheck {{args}}

refs:
  mkdir -p "${HOME}/code/refs"
  test -d "${HOME}/code/refs/hftbacktest" || git clone --depth 1 https://github.com/nkaz001/hftbacktest "${HOME}/code/refs/hftbacktest"
  test -d "${HOME}/code/refs/rbuilder" || git clone --depth 1 https://github.com/flashbots/rbuilder "${HOME}/code/refs/rbuilder"
  test -d "${HOME}/code/refs/quantumflow" || git clone --depth 1 https://github.com/galafis/quantumflow "${HOME}/code/refs/quantumflow"
  @echo "refs ready under ~/code/refs"
