# Phase 0 Manual Checklist

Complete these manual steps alongside the automated toolchain setup (`just setup` / `just check`).

## Accounts & API Keys

- [ ] **Dune Analytics — Register** at [dune.com](https://dune.com) and run any simple query to verify access.
- [ ] **The Graph Studio — Register** at [thegraph.com/studio](https://thegraph.com/studio) (optional for Phase 1 start; required for subgraph-based strategies later).
- [ ] **DefiLlama — API awareness** at [defillama.com](https://defillama.com) — free, no key required. Familiarise yourself with the API docs.
- [ ] **Alchemy or Infura RPC — Obtain key** and add it to your local `.env`:
  ```
  RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
  ```

## Local Toolchain Gates

- [ ] `just setup` exits 0 (installs tools, syncs workspaces, verifies forge)
- [ ] `just check` exits 0 (cargo check, uv run imports, forge --version)

## Optional

- [ ] `just refs` — clone learning repos (`hftbacktest`, `rbuilder`, `quantumflow`) into `~/code/refs/`

## Next

Once all manual items above are checked and `just check` passes: proceed to **Phase 1** (Dune on-chain data strategies).
