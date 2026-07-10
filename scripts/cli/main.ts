#!/usr/bin/env bun
/**
 * Monorepo task CLI — check | fmt | lint | typecheck
 * One file per subcommand under commands/.
 */
import { run, subcommands } from "cmd-ts";
import { check } from "./commands/check";
import { fmt } from "./commands/fmt";
import { lint } from "./commands/lint";
import { typecheck } from "./commands/typecheck";

const cli = subcommands({
  name: "z2h",
  description: "zero-to-hero monorepo tasks",
  cmds: { check, fmt, lint, typecheck },
});

try {
  await run(cli, process.argv.slice(2));
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
}
