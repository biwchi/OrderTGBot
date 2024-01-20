import prisma from "../../../../client";
import logger from "../../../../utils/logger";

import { Scenes } from "telegraf";
import { message } from "telegraf/filters";
import { SettingsScenes } from "..";
import { RegEx } from "../../../../utils/regex";
import { SetupContext } from "../../../context";
import { ScenesId } from "../../../scenes";

const phoneNumber = new Scenes.BaseScene<SetupContext>(SettingsScenes.PHONE_NUMBER);

phoneNumber.enter(async (ctx) => {
  await ctx.reply("✍️ Введите или отправьте нам новый номер телефона");
});

phoneNumber.on([message("contact"), message("text")], async (ctx) => {
  if (!ctx.message) {
    return;
  }

  if ("contact" in ctx.message) {
    ctx.session.setupSession.phoneNumber = ctx.message.contact.phone_number;
  } else if ("text" in ctx.message && RegExp(RegEx.PHONE).test(ctx.message.text)) {
    ctx.session.setupSession.phoneNumber = ctx.message.text;
  } else {
    return await ctx.reply("❌ Неверный формат номера.");
  }

  ctx.scene.leave();
});

phoneNumber.leave(async (ctx) => {
  const userId = ctx.session.user.id;

  try {
    await prisma.user.update({
      where: { id: userId },
      data: {
        phoneNumber: ctx.session.setupSession.phoneNumber,
      },
    });
  } catch (error) {
    logger.error(JSON.stringify(error), ctx);
    await ctx.reply("❌ Произошла ошибка. Попробуйте ещё раз.");
  }

  await ctx.scene.enter(ScenesId.SETTINGS);
});

export default phoneNumber;
