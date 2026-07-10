# Review Packet — Round 1

- **Artifact:** `docs/plan/2026-07-10/phase-0-monorepo/impl.md`
- **Round:** 1
- **Mode:** consensus
- **Status:** fail → fixes applied (proceed to round 2 focused re-check)
- **Previous packet:** none

## Blocking findings (merged)

| Finding | Consensus | Fix applied |
|---------|-----------|-------------|
| Missing `mkdir -p` before nested file creates | 1/3 blocking (R1); others silent | **Yes** — Task 1 Step 0 creates all parent dirs |
| `mise install \|\| true` / missing mise continues | 1/3 blocking (R3) | **Yes** — setup.sh fails if mise missing; `mise install` without `\|\| true` |
| Python verify wrong workspace boundary | 1/3 blocking (R3) | **Yes** — `uv sync --all-packages` + `uv run --package data` |
| mise.toml under-specified rust/foundry pin | 2/3 concern (R2 note, R3 block) | **Yes** — explicit exception: rustup + standalone foundry; mise pins python/uv/just only |

## Non-blocking (merged)

| Finding | Consensus | Fix applied |
|---------|-----------|-------------|
| alloy-cli omitted | 1/3 | **Yes** — documented skip in setup.sh |
| justfile missing rust.*/py.* helpers | 1/3 | **Yes** — rust-check, rust-test, py-sync, py-check |
| Partial python import check | 2/3 notes | Kept minimal gate (pandas/numpy/ccxt) per spec AC#4 |
| Intermediate commits before workspaces exist | 1/3 | **Yes** — note that setup/check green only at Task 7 |
| Task 7 commit guard vague | 1/3 | **Yes** — binary: file changed → commit else stop |
| requires-python floor | 1/3 | No change (compatible with 3.14) |

## Next-round focus

Re-check overview only for:

1. Fail-fast mise gate
2. uv package boundary in setup/check/Task 4
3. Definitive mise pin exception for rust/foundry
4. mkdir -p present
5. just helpers present
