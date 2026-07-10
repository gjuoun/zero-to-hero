import { command } from "cmd-ts";
import {
  fmtContracts,
  fmtPy,
  fmtRust,
  lintContracts,
  lintPy,
  lintRust,
} from "../tasks";

/** lint + format-check (all apps) */
export const check = command({
  name: "check",
  description: "lint + format-check (all apps)",
  args: {},
  handler: async () => {
    await fmtRust(true);
    await fmtPy(true);
    await fmtContracts(true);
    await lintRust();
    await lintPy();
    await lintContracts();
  },
});
