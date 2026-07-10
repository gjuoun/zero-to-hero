# Review Findings

- **Artifact:** `/Users/junguo/code/gjuoun/zero-to-hero/docs/plan/2026-07-10/phase-0-monorepo/impl.md`
- **Scope:** `overview (architecture coherence, task dependency chains, cross-package boundaries, human-gate triggers)`
- **Status:** fail

## Blocking

- **Title:** Setup flow silently bypasses the spec’s toolchain gate
  - **Evidence:** `scripts/setup.sh` is planned to ignore `mise install` failures via `mise install || true` and to continue with host tools when `mise` is missing (`impl.md:142-147`). The spec requires missing or failed mise setup to fail the bootstrap instead of continuing in a silent partial state (`spec.md:153-156`).
  - **Required Fix:** Rewrite Task 2 so the automated gate is explicit and fail-fast: remove `|| true`, stop warning-and-continuing on missing `mise`, and print concrete install guidance before exiting non-zero if the required toolchain manager is unavailable.
  - **Re-check:** Confirm `just setup` still keeps account registration manual while enforcing the automated toolchain gate strictly.

- **Title:** Python verification targets the wrong workspace boundary
  - **Evidence:** The root Python project is defined with `dependencies = []` while `pandas`, `numpy`, and `ccxt` live only in the `data` workspace member (`impl.md:301-333`), but both Task 2 and Task 4 verify with `cd py && uv sync` and `cd py && uv run python -c "import pandas, numpy, ccxt; print('py-ok')"` from the workspace root (`impl.md:152-161`, `impl.md:188-191`, `impl.md:355-359`). Two independent doc checks agreed that `uv sync` / `uv run` operate on the workspace root by default, so member-only dependencies are not installed or exposed unless the plan uses `--package`, `--all-packages`, or explicit root-to-member wiring.
  - **Required Fix:** Make the cross-package contract concrete. Recommended: verify the member directly with `cd py && uv run --package data python -c "import pandas, numpy, ccxt; print('py-ok')"` and pair it with the matching sync strategy (`uv sync --package data` or `uv sync --all-packages`), or explicitly add the member as a root dependency.
  - **Re-check:** Re-read `py/pyproject.toml`, `justfile`, and `scripts/setup.sh` together to ensure the Python gate exercises the intended member package rather than the empty root project.

- **Title:** `mise.toml` does not concretely encode the architecture’s full pinning contract
  - **Evidence:** Task 2 says `mise.toml` should pin compatible tools including rust and foundry, but the provided file content only defines `python`, `uv`, and `just` (`impl.md:117-128`), then leaves rust/foundry handling to a non-concrete note (`impl.md:130`). The spec architecture and component contract describe root pinning for rust, python, uv, just, and foundry (`spec.md:64-66`, `spec.md:108-110`).
  - **Required Fix:** Either add explicit `mise.toml` entries plus verification for rust and foundry, or narrow the architecture contract in the plan/spec with a concrete, testable exception path so the executor knows exactly what to create and how to validate it.
  - **Re-check:** Confirm the architecture section, `mise.toml` task, setup script, and acceptance sweep all name the same source of truth for each toolchain.

## Non-blocking

- **Title:** The justfile snippet omits the language helper recipes promised by the plan/spec
  - **Evidence:** The file mapping says `justfile` should cover `setup`, `check`, `refs`, and language helpers (`impl.md:22`), and the spec architecture/components call out `rust.*` and `py.*` helpers (`spec.md:65`, `spec.md:109`), but the planned `justfile` only defines `default`, `setup`, `check`, and `refs` (`impl.md:177-199`).
  - **Required Fix:** Add minimal `rust.*` / `py.*` helper recipes or explicitly narrow the justfile contract everywhere they are mentioned.
  - **Re-check:** Verify the README and plan text match the final recipe surface.

- **Title:** Task order creates intermediate commits whose orchestration commands cannot work yet
  - **Evidence:** Task 2 commits `scripts/setup.sh` and `justfile` before Tasks 3-5 create the `rust/`, `py/`, and `contracts/` roots those commands reference (`impl.md:149-172`, `impl.md:188-199` vs. `impl.md:217-398`). That makes the sequential commit trail temporarily advertise broken top-level commands.
  - **Required Fix:** Either defer the Task 2 commit until the language roots exist or add an explicit note that `setup` / `check` are not expected to pass until Task 7 completes.
  - **Re-check:** Confirm the dependency chain never asks the implementer to rely on root orchestration before its target workspaces exist.

## Summary

- The plan’s high-level layout matches the language-first Phase 0 intent, but the current overview still has three execution-shaping gaps: weak mise gating, an incorrect Python workspace verification path, and an under-specified tool pinning contract.
- After those are fixed, the remaining overview issue is mainly ergonomic: align the justfile surface and commit sequencing with the architecture the spec already describes.
