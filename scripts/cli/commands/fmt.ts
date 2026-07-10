import { command } from "cmd-ts";
import { app } from "../app";
import { runFmt } from "../tasks";

export const fmt = command({
  name: "fmt",
  description: "apply format",
  args: { app },
  handler: async ({ app }) => {
    await runFmt(app);
  },
});
