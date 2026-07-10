# Review Findings

- **Artifact:** `docs/plan/2026-07-10/phase-0-monorepo/impl.md`
- **Scope:** overview (architecture coherence, task dependency chains, cross-package boundaries, human-gate triggers)
- **Status:** pass with notes

## Blocking

- **Title:** No explicit `mkdir -p` for subdirectory creation before file writes
  - **Evidence:** File mapping table lists 14 file paths under subdirectories (`scripts/`, `rust/crates/strategy-core/src/`, `py/packages/data/src/data/`, `py/notebooks/`, `contracts/src/`, `docs/`). None of the 7 tasks include a `mkdir -p` step. Task 1 Step 2 creates `.env.example` at root; Task 2 Step 2 writes `scripts/setup.sh` — if a worker uses bash `cat >` or `echo >` to create files, this fails with "No such file or directory" before any directory exists.
  - **Required Fix:** Add an explicit `mkdir -p` step in each task before its first subdirectory file creation, or add a single pre-Task-1 "create all directories" step. Example: `mkdir -p scripts rust/crates/strategy-core/src py/packages/data/src/data py/notebooks contracts/src docs`.
  - **Re-check:** Confirm every `Create` entry in the file mapping has its parent directory created before the file write.

## Non-blocking

- **Title:** `alloy-cli` best-effort install omitted from plan entirely
  - **Evidence:** `AGENTS.md` tooling_decisions table lists Alloy CLI as "Best-effort via `cargo install`" and spec §Error Handling says "install if recipe includes it; if crate/name unavailable, document skip without blocking Phase 0." The impl plan has zero references to alloy-cli — no recipe, no documentation of the skip. While the spec marks this as non-blocking, the plan should at least document the skip decision.
  - **Required Fix:** Add a brief note in Task 2 (or a separate sentence in `setup.sh`) documenting why alloy-cli is skipped — e.g., "alloy-cli crate not available on crates.io as of 2026-07; skip without blocking." Or add a commented-out just recipe for future reference.
  - **Re-check:** Verify alloy-cli disposition is explicitly acknowledged in plan.

- **Title:** `just check` verifies only 3 of 6 declared Python dependencies
  - **Evidence:** Task 4 `pyproject.toml` installs `scikit-learn`, `statsmodels`, `jupyter` in addition to `pandas`, `numpy`, `ccxt`. The `just check` recipe in Task 2 only verifies `pandas, numpy, ccxt`. This is consistent with spec acceptance criterion #4, but leaves the other 3 heavy dependencies unverified at gate time — a future `uv sync` failure on those would pass `just check` but break at first use.
  - **Required Fix:** Option A (Recommended) — Extend `just check` to verify all declared deps: `uv run python -c "import pandas, numpy, ccxt, sklearn, statsmodels; print('py-ok')"`. Option B — Add a `just py.check-all` recipe for exhaustive verification while keeping `just check` as the minimal gate. Option C — Document that `just check` is minimal and deeper verification is deferred to Phase 1.
  - **Re-check:** Confirm decision is documented or verification is extended.

- **Title:** `mise.toml` foundry/rust hedging is underspecified for a sequential task
  - **Evidence:** Task 2 Step 1 note says: "If foundry/rust mise backends are awkward on this host, document that rustup + foundry remain source of truth and mise still pins python/uv/just." This leaves a conditional decision to the worker — "if awkward" is subjective. The worker must evaluate host tools and decide. AGENTS.md host_environment already documents that rustup and foundry are installed standalone, so the decision is pre-made: skip rust/foundry in mise.toml. The plan should state this definitively rather than conditionally.
  - **Required Fix:** Replace the conditional note with a definitive statement: "Do not pin rust/foundry in mise.toml — they are managed by rustup and standalone install respectively. mise pins python/uv/just only." This removes the judgment call from the worker.
  - **Re-check:** Confirm mise.toml content is definitive, not conditional.

- **Title:** Task 7 Step 4 commit guard is vague
  - **Evidence:** "Only if verification required small fixes; otherwise no empty commit." The worker must decide what counts as "small fixes" vs. "verification gaps." In a greenfield bootstrap, this gate is unlikely to trigger, but the ambiguity remains for edge cases (e.g., whitespace in a stub file, a missing newline).
  - **Required Fix:** Clarify: "Commit only if acceptance criteria step 3 revealed a file that needed editing. If all 9 criteria pass without file changes, stop without committing." This gives a concrete trigger instead of "small fixes."
  - **Re-check:** Confirm the guard is binary (file changed? → commit | no changes → stop).

## Summary

- **Architecture coherence:** PASS — Language-first layout (`rust/`, `py/`, `contracts/`) matches spec; tooling stack (mise + just + uv + Cargo + Foundry) is internally consistent; no framework-level conflicts.
- **Task dependency chains:** PASS — Sequential ordering (1→2→3→4→5→6→7) is correct. `setup.sh` is created in Task 2 but not invoked until Task 7, avoiding the file-not-found race. Task 6 (docs) correctly depends on all preceding tasks for accurate README content.
- **Cross-package boundaries:** PASS — Each language root is independently verifiable (`cargo check`, `uv sync`, `forge --version`). No cross-language coupling exists in Phase 0. The `just check` recipe correctly scopes each command to its root directory via inline `cd` or manifest flags.
- **Human-gate triggers:** PASS — Manual account steps (Dune, Alchemy, The Graph, DefiLlama) are properly isolated in `docs/phase-0-checklist.md`. Automated gates (`just setup`, `just check`) do not depend on external accounts. The setup.sh end message explicitly reminds the user about the manual checklist.
- **Key risks:** The missing directory-creation step is the only execution risk for workers using bash-based file writes. The 4 non-blocking notes are low-impact clarifications that improve plan robustness without changing outcomes.
