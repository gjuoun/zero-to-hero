import { command } from "cmd-ts";
import { lintContracts, lintPy, lintRust } from "../tasks";

/** lint (all apps) */
export const lint = command({
  name: "lint",
  description: "lint (all apps)",
  args: {},
  handler: async () => {
    await lintRust();
    await lintPy();
    await lintContracts();
  },
});
