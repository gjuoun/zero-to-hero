import type { App } from "./lib";
import { repoRoot, resolveApps, sh } from "./lib";

const pyCwd = () => `${repoRoot()}/py`;

async function rustFmt(check: boolean): Promise<void> {
  const args = ["cargo", "fmt", "--manifest-path", "rust/Cargo.toml"];
  if (check) args.push("--", "--check");
  await sh(args);
}

async function pyFmt(check: boolean): Promise<void> {
  const args = ["mise", "exec", "--", "uv", "run", "ruff", "format"];
  if (check) args.push("--check");
  args.push("packages");
  await sh(args, { cwd: pyCwd() });
}

async function contractsFmt(check: boolean): Promise<void> {
  const args = check
    ? ["forge", "fmt", "--check", "--root", "contracts"]
    : ["forge", "fmt", "--root", "contracts"];
  await sh(args);
}

export async function runFmt(
  app: App | undefined,
  check: boolean,
): Promise<void> {
  for (const a of resolveApps(app)) {
    if (a === "rust") await rustFmt(check);
    else if (a === "py") await pyFmt(check);
    else await contractsFmt(check);
  }
}

async function rustLint(): Promise<void> {
  await sh([
    "cargo",
    "clippy",
    "--manifest-path",
    "rust/Cargo.toml",
    "--all-targets",
    "--",
    "-D",
    "warnings",
  ]);
}

async function pyLint(): Promise<void> {
  await sh(["mise", "exec", "--", "uv", "run", "ruff", "check", "packages"], {
    cwd: pyCwd(),
  });
}

async function contractsLint(): Promise<void> {
  await sh(["forge", "lint", "--root", "contracts"]);
}

export async function runLint(app: App | undefined): Promise<void> {
  for (const a of resolveApps(app)) {
    if (a === "rust") await rustLint();
    else if (a === "py") await pyLint();
    else await contractsLint();
  }
}

async function rustTypecheck(): Promise<void> {
  await sh([
    "cargo",
    "check",
    "--manifest-path",
    "rust/Cargo.toml",
    "--all-targets",
  ]);
}

async function pyTypecheck(): Promise<void> {
  await sh(["mise", "exec", "--", "uv", "run", "pyright"], { cwd: pyCwd() });
}

async function contractsTypecheck(): Promise<void> {
  await sh(["forge", "build", "--root", "contracts"]);
}

export async function runTypecheck(app: App | undefined): Promise<void> {
  for (const a of resolveApps(app)) {
    if (a === "rust") await rustTypecheck();
    else if (a === "py") await pyTypecheck();
    else await contractsTypecheck();
  }
}

/** lint + format-check */
export async function runCheck(app: App | undefined): Promise<void> {
  await runFmt(app, true);
  await runLint(app);
}
