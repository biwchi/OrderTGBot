import { Scenes } from "telegraf";
import prisma from "../../../client";
import { getMainKeyboard } from "../../utils/keybords";
import { ScenesId } from '../../scenes';
import { TGContext } from '../../../bot';
import logger from '../../../utils/logger';

const start = new Scenes.BaseScene<TGContext>(ScenesId.START);

start.enter(async (ctx) => {
  const telegramId = ctx.from?.id;
  const user = await prisma.user.findFirst({
    where: {
      telegramId,
    },
  });

  if (user) {
    const welcomeMessage =
      "Доброго дня! Желайте что нибудь заказать? Тогда открывайте меню и делайте заказ!";

    ctx.reply(welcomeMessage, getMainKeyboard());
    return
  }
  logger.debugWithCtx(ctx, "Entering setup scene");

  ctx.scene.enter(ScenesId.SETUP);
});

start.leave((ctx) => {

})

export default start;