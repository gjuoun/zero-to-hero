import { pyCwd, sh } from "./lib";

export async function fmtRust(check = false): Promise<void> {
  const args = ["cargo", "fmt", "--manifest-path", "rust/Cargo.toml"];
  if (check) args.push("--", "--check");
  await sh(args);
}

export async function fmtPy(check = false): Promise<void> {
  const args = ["mise", "exec", "--", "uv", "run", "ruff", "format"];
  if (check) args.push("--check");
  args.push("packages");
  await sh(args, { cwd: pyCwd() });
}

export async function fmtContracts(check = false): Promise<void> {
  await sh(
    check
      ? ["forge", "fmt", "--check", "--root", "contracts"]
      : ["forge", "fmt", "--root", "contracts"],
  );
}

export async function lintRust(): Promise<void> {
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

export async function lintPy(): Promise<void> {
  await sh(["mise", "exec", "--", "uv", "run", "ruff", "check", "packages"], {
    cwd: pyCwd(),
  });
}

export async function lintContracts(): Promise<void> {
  await sh(["forge", "lint", "--root", "contracts"]);
}

export async function typecheckRust(): Promise<void> {
  await sh([
    "cargo",
    "check",
    "--manifest-path",
    "rust/Cargo.toml",
    "--all-targets",
  ]);
}

export async function typecheckPy(): Promise<void> {
  await sh(["mise", "exec", "--", "uv", "run", "pyright"], { cwd: pyCwd() });
}

export async function typecheckContracts(): Promise<void> {
  await sh(["forge", "build", "--root", "contracts"]);
}
