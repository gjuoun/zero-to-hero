import { command } from "cmd-ts";
import { app } from "../app";
import { runLint } from "../tasks";

export const lint = command({
  name: "lint",
  description: "lint",
  args: { app },
  handler: async ({ app }) => {
    await runLint(app);
  },
});
