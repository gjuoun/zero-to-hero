import { type App, apps } from "./app";
import { pyCwd, sh } from "./lib";

async function fmtRust(check: boolean): Promise<void> {
  const args = ["cargo", "fmt", "--manifest-path", "rust/Cargo.toml"];
  if (check) args.push("--", "--check");
  await sh(args);
}

async function fmtPy(check: boolean): Promise<void> {
  const args = ["mise", "exec", "--", "uv", "run", "ruff", "format"];
  if (check) args.push("--check");
  args.push("packages");
  await sh(args, { cwd: pyCwd() });
}

async function fmtContracts(check: boolean): Promise<void> {
  await sh(
    check
      ? ["forge", "fmt", "--check", "--root", "contracts"]
      : ["forge", "fmt", "--root", "contracts"],
  );
}

async function lintRust(): Promise<void> {
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

async function lintPy(): Promise<void> {
  await sh(["mise", "exec", "--", "uv", "run", "ruff", "check", "packages"], {
    cwd: pyCwd(),
  });
}

async function lintContracts(): Promise<void> {
  await sh(["forge", "lint", "--root", "contracts"]);
}

async function typecheckRust(): Promise<void> {
  await sh([
    "cargo",
    "check",
    "--manifest-path",
    "rust/Cargo.toml",
    "--all-targets",
  ]);
}

async function typecheckPy(): Promise<void> {
  await sh(["mise", "exec", "--", "uv", "run", "pyright"], { cwd: pyCwd() });
}

async function typecheckContracts(): Promise<void> {
  await sh(["forge", "build", "--root", "contracts"]);
}

export async function runFmt(app: App | undefined, check: boolean): Promise<void> {
  for (const a of apps(app)) {
    if (a === "rust") await fmtRust(check);
    else if (a === "py") await fmtPy(check);
    else await fmtContracts(check);
  }
}

export async function runLint(app: App | undefined): Promise<void> {
  for (const a of apps(app)) {
    if (a === "rust") await lintRust();
    else if (a === "py") await lintPy();
    else await lintContracts();
  }
}

export async function runTypecheck(app: App | undefined): Promise<void> {
  for (const a of apps(app)) {
    if (a === "rust") await typecheckRust();
    else if (a === "py") await typecheckPy();
    else await typecheckContracts();
  }
}

export async function runCheck(app: App | undefined): Promise<void> {
  await runFmt(app, true);
  await runLint(app);
}
