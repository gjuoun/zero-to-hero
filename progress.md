# zero-to-hero — Project Progress

## Overview

Crypto quant trading monorepo — 6-phase journey from zero quant background to profitable strategies.

**Last updated:** 2026-07-19

---

## Phase Status

| Phase | Status | Description |
|-------|--------|-------------|
| **Phase 0** | ✅ Complete | Monorepo bootstrap (Rust, Python, Solidity, CLI) |
| **Phase 1** | ✅ Complete | On-chain data hunter (Dune SQL analysis) |
| **Phase 2** | ⏳ Next | Spread monitor (Rust real-time) |
| Phase 3 | ⏸️ Pending | Backtest engine (revm) |
| Phase 4 | ⏸️ Pending | Flash loan arbitrage |
| Phase 5 | ⏸️ Pending | MEV bot |
| Phase 6 | ⏸️ Pending | Multi-strategy system |

---

## Phase 0 — Monorepo Bootstrap ✅

**Completed:** 2026-07-10

### What was built:
- **Rust** — Cargo workspace with `strategy-core` stub
- **Python** — uv workspace with `packages/data` (pandas, numpy, ccxt, etc.)
- **Solidity** — Foundry stub under `contracts/`
- **CLI** — Bun + `cmd-ts` orchestrator (`fmt`, `lint`, `typecheck`)
- **Tooling** — `mise.toml`, `justfile`, `scripts/setup.sh`, `.env.example`

---

## Phase 1 — On-chain Data Hunter ✅

**Completed:** 2026-07-19

### Key Findings

#### 1. ETH-USDC Pool Analysis
- **Daily volume:** $47.3M
- **Trade count:** 14,747/day (~614/hour)
- **Peak hours:** 2:00-5:00 PM Eastern (US afternoon)
- **Verdict:** Very active pool, sufficient liquidity for arbitrage

#### 2. Sandwich Attacks
- **Daily volume:** $100M+ on Ethereum
- **Attack count:** ~2,500/day by 20+ professional bots
- **Volatility correlation:** BTC price swings → more attacks
- **Peak day:** Jul 15 with $344M volume (BTC hit $65,618)

#### 3. Cross-DEX Spreads
- **Largest spread found:** 0.13% (vs 0.5% target)
- **Most spreads:** 0.001% to 0.06%
- **Conclusion:** ETH/USDC is well-arbitraged, popular pairs are saturated

#### 4. Flash Loan Economics
- **Flash loan fee:** $0 (Aave V3 free)
- **Gas cost:** 0.044 Gwei (~$0.029 per swap)
- **Total cost:** ~$0.10-0.15 per flash loan execution
- **This is the cheapest MEV environment ever**

#### 5. Top Attacker Analysis
- **Top 10 bots:** All self-funded ($20M-$684M capital)
- **Flash loan usage:** 0% (none use flash loans)
- **Implication:** Flash loans are for learning, self-funding is for competing

### Strategic Insights

| Factor | Finding | Implication |
|--------|---------|-------------|
| Volume | $47M/day ETH-USDC | Sufficient liquidity |
| Frequency | 600+ trades/hour | Many small opportunities |
| Spread | < 0.13% | Need high volume or less liquid pairs |
| Competition | 20+ bots | Speed is critical |
| Best hours | 2-5 PM Eastern | Monitor during US afternoon |
| Funding | Flash loans for learning | Self-funding for winning |

### Self-Funded vs Flash Loan Bots

| Factor | Flash Loan Bot | Self-Funded Bot |
|--------|----------------|-----------------|
| Speed | +50ms latency | Direct execution |
| Gas | 2x cost | 1x cost |
| Reliability | More failure points | Simpler |
| Win rate | Lower | **Higher** |

**Key insight:** Flash loans are the entry point, not the endgame.

---

## Phase 2 — Spread Monitor (Next)

**Goal:** Build a Rust real-time spread monitor to capture fleeting opportunities that hourly Dune data misses.

### Requirements:
- Real-time price monitoring (sub-second)
- Compare prices across DEXes
- Alert when spread exceeds threshold
- Record historical spread data

### Deliverables:
- Rust program monitoring ETH/USDC prices
- Alerts for spreads > 0.1%
- Historical data for Phase 3 backtesting

---

## Repository Structure

```
zero-to-hero/
├── mise.toml              # python, uv, just
├── justfile               # setup | check | rust-* | py-* | refs
├── scripts/setup.sh       # fail-fast bootstrap
├── rust/                  # Cargo workspace → strategy-core
├── py/                    # uv workspace → packages/data + notebooks
├── contracts/             # Foundry stub
└── docs/
    ├── base/_guide/       # Phase guides
    │   ├── phase-0-monorepo.md
    │   └── phase-1-data-hunter.md
    └── plan/              # Implementation plans
```

---

## Git History

| Date | Commit | Description |
|------|--------|-------------|
| 2026-07-10 | Phase 0 | Monorepo bootstrap |
| 2026-07-19 | 7ef9667 | Phase 1 complete — all findings documented |

---

## Next Steps

1. **Phase 2:** Build Rust spread monitor
2. **Phase 3:** Backtest with revm
3. **Phase 4:** Flash loan arbitrage (use flash loans to learn)
4. **Phase 5:** MEV bot (accumulate capital, become self-funded)
5. **Phase 6:** Multi-strategy system

---

*This file tracks overall project progress. See `docs/base/_guide/` for detailed phase guides.*
