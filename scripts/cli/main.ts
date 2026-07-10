#!/usr/bin/env bun
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

await run(cli, process.argv.slice(2));
