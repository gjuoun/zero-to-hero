import { oneOf, optional, positional } from "cmd-ts";

export const APPS = ["rust", "py", "contracts"] as const;
export type App = (typeof APPS)[number];

/** Optional positional app — omit for all. */
export const app = positional({
  type: optional(oneOf(APPS)),
  displayName: "app",
  description: "rust | py | contracts (default: all)",
});

export function apps(selected?: App): App[] {
  return selected ? [selected] : [...APPS];
}
