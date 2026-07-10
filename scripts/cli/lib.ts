/** Shell helpers for monorepo tasks. */

export function repoRoot(): string {
  return new URL("../..", import.meta.url).pathname;
}

export const pyCwd = () => `${repoRoot()}/py`;

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
