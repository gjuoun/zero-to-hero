# Guide: Phase 1 On-chain Data Hunter

**Date:** 2026-07-10
**Roadmap:** `~/.notebook/inbox/crypto-quant-roadmap.md`
**Status:** Ready to start

## Goal

Use Dune SQL to explore on-chain data and find trading opportunities — **read data first, write code later.**

## Prerequisites

- [x] Dune Analytics account
- [ ] Dune API key (from [dune.com/settings/api](https://dune.com/settings/api))
- [ ] Alchemy or Infura RPC key (free tier works)

## Setup

### 1. Get your Dune API key

1. Go to [dune.com/settings/api](https://dune.com/settings/api)
2. Click **"New API Key"**
3. Copy the key

### 2. Configure `.env`

```bash
cp .env.example .env
```

Fill in:

```
DUNE_API_KEY=your_key_here
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY
```

For RPC, grab a free key from [Alchemy](https://dashboard.alchemy.com/) or [Infura](https://infura.io/).

---

## The 4 Questions to Answer

1. How many swaps/day does the Uniswap V3 ETH/USDC pool have? What's the average size?
2. How often does the spread between Uniswap V3 and Sushiswap exceed 0.5%?
3. How frequent are sandwich attacks? What's the average profit?
4. What's the Aave ETH borrow vs deposit rate gap?

---

## Dune Queries

Open [dune.com/query/new](https://dune.com/query/new) and run each query below.

### Query 1 — Uniswap V3 ETH-USDC Summary (last 24h)

Answers: total volume, trade count, average size, price range.

Run this **aggregate query first** — it tells you the big picture in one row.

```sql
SELECT
    COUNT(*) AS trade_count,
    SUM(amount_usd) AS total_volume_usd,
    AVG(amount_usd) AS avg_trade_usd,
    MIN(amount_usd) AS min_trade_usd,
    MAX(amount_usd) AS max_trade_usd,
    MIN(block_time) AS earliest,
    MAX(block_time) AS latest
FROM uniswap_v3_ethereum.trades
WHERE block_time >= NOW() - INTERVAL '24' HOUR
  AND token_bought_symbol IN ('WETH', 'USDC')
  AND token_sold_symbol IN ('WETH', 'USDC')
```

### Query 1b — Hourly Volume Breakdown

Shows volume by hour — helps you see when the pool is most active.

```sql
SELECT
    DATE_TRUNC('hour', block_time) AS hour,
    COUNT(*) AS trades,
    SUM(amount_usd) AS volume_usd,
    AVG(amount_usd) AS avg_size_usd
FROM uniswap_v3_ethereum.trades
WHERE block_time >= NOW() - INTERVAL '24' HOUR
  AND token_bought_symbol IN ('WETH', 'USDC')
  AND token_sold_symbol IN ('WETH', 'USDC')
GROUP BY DATE_TRUNC('hour', block_time)
ORDER BY hour
```

### Query 2 — Sandwich Attacks (last 7 days)

Answers: attack frequency, most active attackers, volume.

Uses the `dex.sandwiches` curated table — attacker's front-run/back-run trades.

```sql
SELECT
    tx_from AS attacker,
    COUNT(DISTINCT tx_hash) AS attack_count,
    SUM(amount_usd) AS total_volume_usd,
    AVG(amount_usd) AS avg_trade_usd
FROM dex.sandwiches
WHERE blockchain = 'ethereum'
  AND block_time >= NOW() - INTERVAL '7' DAY
GROUP BY 1
ORDER BY total_volume_usd DESC
LIMIT 20
```

### Query 2b — Sandwich Attacks Over Time (daily)

Shows daily attack frequency and volume trends.

```sql
SELECT
    DATE_TRUNC('day', block_time) AS day,
    COUNT(*) AS attack_count,
    SUM(amount_usd) AS total_volume_usd,
    AVG(amount_usd) AS avg_trade_usd
FROM dex.sandwiches
WHERE blockchain = 'ethereum'
  AND block_time >= NOW() - INTERVAL '7' DAY
GROUP BY DATE_TRUNC('day', block_time)
ORDER BY day
```

### Query 3 — Cross-DEX Spread (Uniswap vs Other DEXes)

Answers: how often spread exceeds 0.3%, which direction, magnitude.

**Step 1:** First run this diagnostic to see which DEXes have ETH/USDC volume:

```sql
SELECT
    project,
    COUNT(*) AS trades,
    SUM(amount_usd) AS total_volume
FROM dex.trades
WHERE blockchain = 'ethereum'
  AND token_bought_symbol = 'WETH'
  AND token_sold_symbol = 'USDC'
  AND block_time >= NOW() - INTERVAL '24' HOUR
GROUP BY project
ORDER BY total_volume DESC
```

**Step 2:** Check what spreads actually exist (no threshold filter):

```sql
WITH dex_prices AS (
    SELECT
        DATE_TRUNC('hour', block_time) AS hour,
        project,
        AVG(amount_usd / token_bought_amount) AS avg_price,
        COUNT(*) AS trade_count
    FROM dex.trades
    WHERE blockchain = 'ethereum'
      AND token_bought_symbol = 'WETH'
      AND token_sold_symbol = 'USDC'
      AND block_time >= NOW() - INTERVAL '24' HOUR
      AND project IN ('uniswap', 'native', 'ekubo', 'fluid')
    GROUP BY 1, 2
    HAVING COUNT(*) >= 2
)
SELECT
    u.hour,
    u.trade_count AS uni_trades,
    d.project AS other_dex,
    d.trade_count AS other_trades,
    u.avg_price AS uni_price,
    d.avg_price AS other_price,
    ((d.avg_price - u.avg_price) / u.avg_price) * 100 AS spread_pct
FROM dex_prices u
JOIN dex_prices d ON u.hour = d.hour AND d.project != 'uniswap'
WHERE u.project = 'uniswap'
ORDER BY u.hour DESC, d.project
LIMIT 100
```

---

## What to Look For

| Query | Key Metric | Success Signal |
|-------|-----------|----------------|
| Swaps | Swaps/day, avg size | High volume = more opportunities |
| Sandwich | Frequency, avg profit | Understanding MEV landscape |
| Spread | Spread %, frequency | **>0.5% spread regularly = viable arbitrage** |

---

## Findings (2026-07-19)

### Query 1a — ETH-USDC Pool Summary (24h)

| Metric | Value |
|--------|-------|
| Trade count | 14,747 |
| Total volume | $47.3M |
| Avg trade size | $3,209 |
| Min trade | $0 (failed txs) |
| Max trade | $1.5M (whale) |
| Time range | 24h 30m |

**Verdict:** Very active pool — ~614 trades/hour, strong liquidity.

### Query 1b — Hourly Volume Breakdown

| Hour (UTC) | Trades | Volume USD | Avg Size |
|------------|--------|------------|----------|
| Jul 18, 18:00 | **927** | **$8.1M** | $8,762 |
| Jul 18, 17:00 | 676 | $2.7M | $4,020 |
| Jul 18, 20:00 | 866 | $2.6M | $2,991 |
| Jul 19, 02:00 | 855 | $4.4M | $5,104 |
| Jul 19, 01:00 | 472 | $530K | $1,122 |

### Key Insights

- **Peak hours:** 18:00-21:00 UTC = **2:00-5:00 PM Eastern (EDT)**
- **Quietest:** 00:00-05:00 UTC = 8:00 PM - 1:00 AM Eastern
- **Trade frequency:** 400-900 trades/hour consistently
- **Volume spikes:** $8M+ during US afternoon — whale activity
- **Market follows US hours** — most DeFi liquidity and bots are US-based

### Arbitrage Implications

- **Best monitoring window:** 2:00-5:00 PM Eastern (your local time)
- **High frequency** = more price movements = more spread opportunities
- **Avg trade $1K-$5K** = meaningful price impact per trade
- **$47M daily volume** = sufficient liquidity for arbitrage execution

---

### Query 2 — Top Sandwich Attackers (7 days)

| Attacker | Attacks | Total Volume | Avg Trade |
|----------|---------|--------------|-----------|
| `0x654fae...` | 1,108 | **$745M** | $672K |
| `0xaf6062...` | 70 | $282M | **$4M** |
| `0xae2fc4...` | **7,159** | $139M | $15.9K |
| `0xdeda0a...` | 186 | $66M | $242K |
| `0x3ee92c...` | 1,644 | $66M | $39.5K |

**Key patterns:**
- **Most active:** `0xae2fc4...` — 7,159 attacks, high frequency, smaller size
- **Largest volume:** `0x654fae...` — $745M, professional operation
- **Largest trades:** `0xaf6062...` — $4M avg, whale hunting
- **20+ active attackers** operating 24/7

### Query 2b — Sandwich Attacks Daily Trend

| Date | Attacks | Volume USD | Avg Trade | BTC Close | BTC Change |
|------|---------|------------|-----------|-----------|------------|
| Jul 12 | 1,929 | $100M | $51,979 | $63,775 | −0.09% |
| Jul 13 | 2,821 | $184M | $65,604 | $62,335 | **−2.26%** |
| Jul 14 | 2,658 | $214M | $80,655 | $65,067 | **+4.38%** |
| Jul 15 | 2,715 | **$344M** | $126,837 | $64,793 | −0.42% |
| Jul 16 | 2,250 | $286M | $127,325 | $63,850 | −1.46% |
| Jul 17 | 2,832 | $237M | $84,020 | $63,968 | +0.18% |
| Jul 18 | 2,697 | $159M | $59,281 | $64,862 | +1.40% |
| Jul 19 | 784 | $22M | $29,066 | — | (partial) |

### Key Insights — Sandwich Attacks

- **$100M+ daily business** on Ethereum alone
- **~2,500 attacks/day** average
- **Volatility correlation:** Higher BTC volatility = more sandwich attacks
  - Jul 13: BTC −2.26% (Iran news) → $184M sandwich volume
  - Jul 14: BTC +4.38% (UK tax policy) → $214M
  - Jul 15: BTC hit $65,618 (3-week high) → **$344M peak** — $1.1B liquidations triggered more swaps
- **Sandwich bots thrive on volatility** — more large swaps = more opportunities

### Arbitrage Implications — Sandwich Data

- **Competition is real** — 20+ professional bots running 24/7
- **Volatility = opportunity** — monitor during BTC price swings
- **Liquidation events** create the biggest MEV opportunities
- **Phase 4-5 preparation** — understand their patterns to compete

---

### Query 3 — Cross-DEX Spread Analysis (Uniswap vs native/ekubo/fluid)

**Step 1 — DEX Volume Distribution (ETH/USDC, 24h):**

| DEX | Trades | Volume |
|-----|--------|--------|
| **Uniswap** | 8,064 | **$25.1M** |
| native | 196 | $1.3M |
| ekubo | 1,181 | $890K |
| fluid | 135 | $887K |
| pancakeswap | 1,267 | $334K |
| Sushiswap | 38 | $30.6K |

**Step 2 — Hourly Spread Results:**

| Hour (UTC) | Uni Price | Other DEX | Other Price | Spread % |
|------------|-----------|-----------|-------------|----------|
| Jul 19, 02:00 | $1,866.60 | fluid | $1,864.16 | **−0.131%** |
| Jul 19, 02:00 | $1,866.60 | ekubo | $1,864.60 | **−0.107%** |
| Jul 18, 17:00 | $1,845.15 | native | $1,843.36 | **−0.097%** |
| Jul 19, 04:00 | $1,865.72 | native | $1,866.92 | **+0.064%** |
| Jul 18, 16:00 | $1,842.17 | fluid | $1,843.36 | **+0.065%** |
| Jul 18, 21:00 | $1,857.17 | native | $1,858.66 | **+0.080%** |

### Key Insights — Cross-DEX Spreads

- **Spreads are tiny:** Most are 0.001% to 0.06%
- **Largest spread found:** ~0.13% (fluid vs Uniswap)
- **No spreads > 0.3%** in the 24-hour window
- **Direction varies:** Sometimes Uniswap is cheaper, sometimes other DEXes are
- **Hourly averaging smooths out spikes** — real-time spreads might be larger

### Arbitrage Implications — Spread Data

- **ETH/USDC is well-arbitraged** — professional bots close spreads quickly
- **Hourly data hides short-term opportunities** — real-time monitoring essential
- **0.5% spread target unlikely** with this pair at hourly granularity
- **Phase 2 approach:**
  1. Monitor in real-time (not hourly averages)
  2. Look at less liquid pairs
  3. Accept smaller spreads with higher volume

---

## Deliverables

- [x] Dune API key in `.env`
- [ ] RPC key in `.env`
- [x] Query 1 (ETH-USDC swaps) — ✅ Complete
- [x] Query 2 (Sandwich attacks) — ✅ Complete
- [x] Query 3 (Cross-DEX spread) — ✅ Complete
- [ ] Found at least 1 pair with >0.5% spread — ❌ Not found (max 0.13%)
- [x] Screenshot or note your findings — ✅ Added to doc

---

## Phase 1 Summary — What We Learned

### 1. Sandwich Attacks Spike During Market Volatility

- **$100M+/day** in sandwich attack volume on Ethereum
- **~2,500 attacks/day** by 20+ professional bots
- **Volatility correlation:** BTC price swings → more attacks
  - Jul 13: BTC −2.26% → $184M sandwich volume
  - Jul 15: BTC hit $65,618 → **$344M peak** (liquidation events)
- **Implication:** MEV bots thrive on chaos — more large swaps = more opportunities

### 2. Cross-DEX Spreads Exist but Are Tiny for Popular Pairs

- **ETH/USDC is saturated** — 20+ bots competing to close spreads
- **Largest spread found:** 0.13% (vs 0.5% target)
- **Most spreads:** 0.001% to 0.06%
- **Implication:** Popular pairs are efficient — spreads are captured in seconds

### 3. The Arbitrage Opportunity

| Factor | Finding | Implication |
|--------|---------|-------------|
| Volume | $47M/day ETH-USDC | Sufficient liquidity |
| Frequency | 600+ trades/hour | Many small opportunities |
| Spread | < 0.13% | Need high volume or less liquid pairs |
| Competition | 20+ bots | Speed is critical |
| Best hours | 2-5 PM Eastern | Monitor during US afternoon |

### 4. Strategic Options

**Option A — High-frequency on popular pairs:**
- Target: ETH/USDC, ETH/USDT
- Strategy: Tiny spreads, high volume
- Requirement: Sub-second execution, Flashbots

**Option B — Less liquid pairs:**
- Target: Smaller cap tokens
- Strategy: Wider spreads, lower competition
- Requirement: More research, higher risk

**Option C — Volatility events:**
- Target: Large price swings
- Strategy: Capture spreads during liquidations
- Requirement: Real-time monitoring, fast execution

---

## Key Insight

If spread frequency × spread magnitude > gas cost + slippage, the arbitrage is profitable. This is what you're looking for.

## Next

After completing this phase, move to Phase 2 (Rust spread monitor) under `rust/` — real-time monitoring to capture fleeting spreads that hourly data misses.
