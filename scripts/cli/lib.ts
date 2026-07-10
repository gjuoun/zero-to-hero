/** Shell helpers for monorepo tasks. */

export function repoRoot(): string {
  return new URL("../..", import.meta.url).pathname;
}

function shell(cwd: string) {
  return (cmd: string) => {
    console.error(`$ ${cmd}`);
    const proc = Bun.spawn(["bash", "-c", cmd], {
      cwd,
      stdout: "inherit",
      stderr: "inherit",
    });
    return proc.exited.then((code) => {
      if (code !== 0) throw new Error(`command failed (${code}): ${cmd}`);
    });
  };
}

export const $root = shell(repoRoot());
export const $rust = shell(`${repoRoot()}/rust`);
export const $py = shell(`${repoRoot()}/py`);
export const $contracts = shell(`${repoRoot()}/contracts`);
