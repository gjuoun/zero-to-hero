import { type App, apps } from "./app";
import { $py, $root } from "./lib";

async function fmtRust(check: boolean): Promise<void> {
  if (check) {
    await $root()`cargo fmt --manifest-path rust/Cargo.toml -- --check`;
  } else {
    await $root()`cargo fmt --manifest-path rust/Cargo.toml`;
  }
}

async function fmtPy(check: boolean): Promise<void> {
  if (check) {
    await $py()`mise exec -- uv run ruff format --check packages`;
  } else {
    await $py()`mise exec -- uv run ruff format packages`;
  }
}

async function fmtContracts(check: boolean): Promise<void> {
  if (check) {
    await $root()`forge fmt --check --root contracts`;
  } else {
    await $root()`forge fmt --root contracts`;
  }
}

async function lintRust(): Promise<void> {
  await $root()`cargo clippy --manifest-path rust/Cargo.toml --all-targets -- -D warnings`;
}

async function lintPy(): Promise<void> {
  await $py()`mise exec -- uv run ruff check packages`;
}

async function lintContracts(): Promise<void> {
  await $root()`forge lint --root contracts`;
}

async function typecheckRust(): Promise<void> {
  await $root()`cargo check --manifest-path rust/Cargo.toml --all-targets`;
}

async function typecheckPy(): Promise<void> {
  await $py()`mise exec -- uv run pyright`;
}

async function typecheckContracts(): Promise<void> {
  await $root()`forge build --root contracts`;
}

export async function runFmt(
  app: App | undefined,
  check: boolean,
): Promise<void> {
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
