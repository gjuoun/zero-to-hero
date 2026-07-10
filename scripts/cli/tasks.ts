import { type App, apps } from "./app";
import { $contracts, $py, $rust } from "./lib";

export async function fmtRust() {
  await $rust("cargo fmt");
}

export async function fmtPy() {
  await $py("mise exec -- uv run ruff format packages");
}

export async function fmtContracts() {
  await $contracts("forge fmt");
}

export async function lintRust() {
  await $rust("cargo clippy --all-targets -- -D warnings");
}

export async function lintPy() {
  await $py("mise exec -- uv run ruff check packages");
}

export async function lintContracts() {
  await $contracts("forge lint");
}

export async function typecheckRust() {
  await $rust("cargo check --all-targets");
}

export async function typecheckPy() {
  await $py("mise exec -- uv run pyright");
}

export async function typecheckContracts() {
  await $contracts("forge build");
}

export async function runFmt(app: App | undefined) {
  for (const a of apps(app)) {
    if (a === "rust") await fmtRust();
    else if (a === "py") await fmtPy();
    else await fmtContracts();
  }
}

export async function runLint(app: App | undefined) {
  for (const a of apps(app)) {
    if (a === "rust") await lintRust();
    else if (a === "py") await lintPy();
    else await lintContracts();
  }
}

export async function runTypecheck(app: App | undefined) {
  for (const a of apps(app)) {
    if (a === "rust") await typecheckRust();
    else if (a === "py") await typecheckPy();
    else await typecheckContracts();
  }
}
