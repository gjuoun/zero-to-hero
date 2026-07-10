/** Shell helpers for monorepo tasks. */

import { $ } from "bun";

export function repoRoot(): string {
  return new URL("../..", import.meta.url).pathname;
}

export const pyCwd = () => `${repoRoot()}/py`;

/** Shell at repo root (throws on non-zero). */
export function $root() {
  return $.cwd(repoRoot());
}

/** Shell in py/ workspace. */
export function $py() {
  return $.cwd(pyCwd());
}
