# Review Findings

- **Artifact:** `docs/plan/2026-07-10/phase-0-monorepo/impl.md`
- **Scope:** Overview — architecture coherence, task dependency chains, cross-package boundaries, human-gate triggers
- **Status:** pass with notes

## Blocking

None.

## Non-blocking

- **Title:** mise.toml does not pin rust or foundry backends
  - **Evidence:** Spec acceptance criterion 2 says "Root `mise.toml` pins tools and includes `uv`." Spec Components table lists `mise.toml` role as "Pin tool versions; mise manages `uv`" with deliverable "rust, python, uv, just, foundry (as available)." The impl `mise.toml` (Task 2 Step 1) only pins `python`, `uv`, and `just` — no `rust` or `foundry` entries. The plan acknowledges this: "If foundry/rust mise backends are awkward on this host, document that rustup + foundry remain source of truth." This is pragmatic but creates a soft gap with the spec's wording.
  - **Required Fix:** Add a comment or note in `mise.toml` (or `scripts/setup.sh`) explicitly documenting that rust and foundry are managed by rustup/standalone-install respectively, and that mise delegates to them. This closes the documentation gap without forcing awkward backend config.
  - **Re-check:** Verify `mise.toml` contains either backend entries for rust/foundry or inline comments explaining the delegation. Confirm `AGENTS.md` tooling table already documents this split (it does).

- **Title:** `just check` imports scikit-learn and statsmodels implicitly but does not verify them
  - **Evidence:** Spec acceptance criterion 4 says "pandas, numpy, and ccxt import successfully under `uv run`." The `justfile` `check` recipe (Task 2 Step 3) tests `import pandas, numpy, ccxt` — matching the spec exactly. However, `py/packages/data/pyproject.toml` (Task 4) also declares `scikit-learn>=1.5` and `statsmodels>=0.14` as dependencies. These are installed by `uv sync` but never verified by `just check`. This is fine per spec (spec only gates pandas/numpy/ccxt), but worth noting for Phase 1 readiness confidence.
  - **Required Fix:** None required for Phase 0. Optionally extend the `just check` import line to `import pandas, numpy, ccxt, sklearn, statsmodels` for fuller coverage.
  - **Re-check:** No re-check needed; this is a suggestion, not a gap.

- **Title:** Task 7 acceptance criteria sweep is manual, not scripted
  - **Evidence:** Task 7 Step 3 lists 9 acceptance criteria to "confirm against spec" but provides no automated script or assertion. The executor must manually eyeball each item. Steps 1-2 (`just setup` / `just check`) cover criteria 2-5 and partially 8, but criteria 1 (layout), 6 (secrets hygiene), 7 (docs), and 9 (scope discipline) are human judgment calls.
  - **Required Fix:** Consider adding a small shell snippet in Task 7 Step 3 that verifies file existence for layout (e.g., `test -d rust/crates/strategy-core && test -d py/packages/data && test -d contracts`) and gitignore coverage (e.g., `git check-ignore .env`). This reduces reliance on manual inspection.
  - **Re-check:** Verify Task 7 includes at least one automated layout/assertion check beyond `just setup` / `just check`.

- **Title:** `py/pyproject.toml` declares `requires-python = ">=3.12"` but host runs 3.14
  - **Evidence:** The spec and AGENTS.md document Python 3.14 on the host. The `py/pyproject.toml` (Task 4 Step 1) sets `requires-python = ">=3.12"`, which is compatible but looser than necessary. The `data` package also uses `>=3.12`. This is not a bug — 3.14 satisfies `>=3.12` — but tightening to `>=3.14` would better reflect the pinned toolchain and catch drift early.
  - **Required Fix:** None strictly required. Optionally tighten to `>=3.14` to match the mise-pinned Python version.
  - **Re-check:** No re-check needed.

## Summary

- The plan is well-structured and faithfully implements the spec's intent. Task ordering (root hygiene → tooling → language stubs → docs → verification) is coherent and dependency-safe.
- Cross-package boundaries are clean: each language root (`rust/`, `py/`, `contracts/`) is self-contained with its own workspace config; no cross-language coupling in Phase 0.
- Human-gate triggers are properly scoped: account registration (Dune, RPC, The Graph) lives in `docs/phase-0-checklist.md`, not in automated gates. `just refs` is optional and non-blocking.
- The only material gap is the `mise.toml` not pinning rust/foundry backends, which the plan already acknowledges and works around pragmatically. Documenting the delegation explicitly would fully close this.
- No blocking issues found. The plan is ready for execution.
