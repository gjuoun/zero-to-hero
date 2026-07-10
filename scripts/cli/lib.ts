/** Shared shell helpers for the monorepo CLI. */

export const APPS = ["rust", "py", "contracts"] as const;
export type App = (typeof APPS)[number];

export function repoRoot(): string {
  return new URL("../..", import.meta.url).pathname;
}

/** Run a shell command; inherit stdio; throw on non-zero. */
export async function sh(
  cmd: string[],
  opts: { cwd?: string } = {},
): Promise<void> {
  const cwd = opts.cwd ?? repoRoot();
  const proc = Bun.spawn(cmd, {
    cwd,
    stdout: "inherit",
    stderr: "inherit",
    stdin: "inherit",
  });
  const code = await proc.exited;
  if (code !== 0) {
    throw new Error(`command failed (${code}): ${cmd.join(" ")}`);
  }
}

export const pyCwd = () => `${repoRoot()}/py`;
