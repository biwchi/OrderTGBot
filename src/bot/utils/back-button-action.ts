import { BACK_BUTTON } from ".";
import { AppContext } from "../context";
import { ScenesId } from "../scenes";

export function backAction(scene: ScenesId): [string, (ctx: AppContext) => Promise<unknown>] {
  return [
    BACK_BUTTON,
    async (ctx: AppContext) => {
      return await ctx.scene.enter(scene);
    },
  ];
}
