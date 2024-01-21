import logger from "../../utils/logger";
import { AppContext } from "../context";

export async function errorHandler(error: any, ctx: AppContext) {
  logger.error(JSON.stringify(error), ctx);
  await ctx.reply("❌ Произошла ошибка. Попробуйте ещё раз.");
}
