import { command } from "cmd-ts";
import { fmtContracts, fmtPy, fmtRust } from "../tasks";

/** apply format (all apps) */
export const fmt = command({
  name: "fmt",
  description: "apply format (all apps)",
  args: {},
  handler: async () => {
    await fmtRust(false);
    await fmtPy(false);
    await fmtContracts(false);
  },
});
