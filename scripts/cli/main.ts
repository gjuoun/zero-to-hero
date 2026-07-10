#!/usr/bin/env bun
/**
 * Monorepo task CLI — check | fmt | lint | typecheck [app]
 * Apps: rust | py | contracts  (omit = all)
 */
import {
  command,
  oneOf,
  optional,
  positional,
  run,
  subcommands,
} from "cmd-ts";
import { APPS, type App } from "./lib";
import { runCheck, runFmt, runLint, runTypecheck } from "./tasks";

const appArg = positional({
  type: optional(oneOf(APPS)),
  displayName: "app",
  description: "Target app: rust | py | contracts (omit = all)",
});

function withApp(
  name: string,
  description: string,
  handler: (app: App | undefined) => Promise<void>,
) {
  return command({
    name,
    description,
    args: { app: appArg },
    handler: async ({ app }) => {
      try {
        await handler(app as App | undefined);
      } catch (e) {
        console.error(e instanceof Error ? e.message : e);
        process.exit(1);
      }
    },
  });
}

const check = withApp(
  "check",
  "lint + format-check for app (or all)",
  runCheck,
);

const fmt = withApp("fmt", "apply format for app (or all)", (app) =>
  runFmt(app, false),
);

const lint = withApp("lint", "lint for app (or all)", runLint);

const typecheck = withApp(
  "typecheck",
  "typecheck for app (or all)",
  runTypecheck,
);

const cli = subcommands({
  name: "z2h",
  description: "zero-to-hero monorepo tasks",
  cmds: { check, fmt, lint, typecheck },
});

await run(cli, process.argv.slice(2));
