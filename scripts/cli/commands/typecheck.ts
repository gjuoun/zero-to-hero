import { command } from "cmd-ts";
import { app } from "../app";
import { runTypecheck } from "../tasks";

export const typecheck = command({
  name: "typecheck",
  description: "typecheck",
  args: { app },
  handler: async ({ app }) => {
    await runTypecheck(app);
  },
});
