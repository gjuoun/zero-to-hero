import { type App, apps } from "./app";
import { $contracts, $py, $rust } from "./lib";

export async function fmtRust(): Promise<void> {
  console.error("$ cargo fmt");
  await $rust()`cargo fmt`;
}

export async function fmtPy(): Promise<void> {
  console.error("$ uv run ruff format packages");
  await $py()`mise exec -- uv run ruff format packages`;
}

export async function fmtContracts(): Promise<void> {
  console.error("$ forge fmt");
  await $contracts()`forge fmt`;
}

export async function lintRust(): Promise<void> {
  console.error("$ cargo clippy --all-targets -- -D warnings");
  await $rust()`cargo clippy --all-targets -- -D warnings`;
}

export async function lintPy(): Promise<void> {
  console.error("$ uv run ruff check packages");
  await $py()`mise exec -- uv run ruff check packages`;
}

export async function lintContracts(): Promise<void> {
  console.error("$ forge lint");
  await $contracts()`forge lint`;
}

export async function typecheckRust(): Promise<void> {
  console.error("$ cargo check --all-targets");
  await $rust()`cargo check --all-targets`;
}

export async function typecheckPy(): Promise<void> {
  console.error("$ uv run pyright");
  await $py()`mise exec -- uv run pyright`;
}

export async function typecheckContracts(): Promise<void> {
  console.error("$ forge build");
  await $contracts()`forge build`;
}

export async function runFmt(app: App | undefined): Promise<void> {
  for (const a of apps(app)) {
    if (a === "rust") await fmtRust();
    else if (a === "py") await fmtPy();
    else await fmtContracts();
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
