import prisma from "../../../client";

import { Scenes } from "telegraf";
import { getMainKeyboard } from "../../utils/keybords";
import { ScenesId } from "../../scenes";
import { SetupContext } from "../../context";

const start = new Scenes.BaseScene<SetupContext>(ScenesId.START);

start.enter(async (ctx) => {
  const telegramId = ctx.from?.id;
  const user = await prisma.user.findFirst({
    where: {
      telegramId,
    },
  });

  if (!user) {
    ctx.scene.enter(ScenesId.SETUP);
    return;
  }

  const welcomeMessage =
    "🤖 Доброго дня! Желайте что нибудь заказать? Тогда открывайте меню и делайте заказ!";

  await ctx.reply(welcomeMessage, getMainKeyboard());
});

start.action("settings", (ctx) => {
  ctx.scene.enter(ScenesId.SETTINGS);
  ctx.answerCbQuery();
});

export default start;
