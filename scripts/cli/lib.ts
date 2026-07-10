/** Shell helpers for monorepo tasks. */

import { $ } from "bun";

export function repoRoot(): string {
  return new URL("../..", import.meta.url).pathname;
}

function shell(cwd: string) {
  return (strings: TemplateStringsArray, ...values: string[]) => {
    const cmd = strings
      .map((s, i) => s + (i < values.length ? String(values[i] ?? "") : ""))
      .join("")
      .trim();
    console.error(`$ ${cmd}`);
    return $.cwd(cwd)(strings, ...values);
  };
}

export const $root = shell(repoRoot());
export const $rust = shell(`${repoRoot()}/rust`);
export const $py = shell(`${repoRoot()}/py`);
export const $contracts = shell(`${repoRoot()}/contracts`);
