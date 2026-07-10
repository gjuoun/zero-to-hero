/** Shell helpers for monorepo tasks. */

import { $ } from "bun";

export function repoRoot(): string {
  return new URL("../..", import.meta.url).pathname;
}

export function $root() {
  return $.cwd(repoRoot());
}

export function $rust() {
  return $.cwd(`${repoRoot()}/rust`);
}

export function $py() {
  return $.cwd(`${repoRoot()}/py`);
}

export function $contracts() {
  return $.cwd(`${repoRoot()}/contracts`);
}
