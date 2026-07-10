import { command } from "cmd-ts";
import {
  typecheckContracts,
  typecheckPy,
  typecheckRust,
} from "../tasks";

/** typecheck (all apps) */
export const typecheck = command({
  name: "typecheck",
  description: "typecheck (all apps)",
  args: {},
  handler: async () => {
    await typecheckRust();
    await typecheckPy();
    await typecheckContracts();
  },
});
