import { command } from "cmd-ts";
import { app } from "../app";
import { runCheck } from "../tasks";

export const check = command({
  name: "check",
  description: "lint + format-check",
  args: { app },
  handler: async ({ app }) => {
    await runCheck(app);
  },
});
