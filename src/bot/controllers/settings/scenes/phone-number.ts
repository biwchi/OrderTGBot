import prisma from "../../../../client";

import { Markup, Scenes } from "telegraf";
import { message } from "telegraf/filters";
import { SettingsScenes } from "..";
import { RegEx } from "../../../../utils/regex";
import { SetupContext } from "../../../context";
import { ScenesId } from "../../../scenes";
import { errorHandlerCtx } from "../../../utils";

const phoneNumber = new Scenes.BaseScene<SetupContext>(SettingsScenes.PHONE_NUMBER);

phoneNumber.enter(async (ctx) => {
  await ctx.reply(
    'Нажмите на кнопку "📱 Отправить телефон" или ✍️ введите его вручную в международном формате +998711234567.',
    Markup.keyboard([Markup.button.contactRequest("Отправить номер")])
      .resize()
      .oneTime(),
  );
});

phoneNumber.on([message("contact"), message("text")], async (ctx) => {
  if ("contact" in ctx.message) {
    ctx.session.setupSession.phoneNumber = ctx.message.contact.phone_number;
  } else if ("text" in ctx.message && RegExp(RegEx.PHONE).test(ctx.message.text)) {
    ctx.session.setupSession.phoneNumber = ctx.message.text;
  } else {
    return await ctx.reply("❌ Неверный формат номера.");
  }

  const { isSetup } = ctx.session.setupSession;
  isSetup ? await ctx.scene.enter(SettingsScenes.DELIVERY_ADDRESS) : await savePhoneNumber(ctx);
});

async function savePhoneNumber(ctx: SetupContext) {
  try {
    await prisma.user.update({
      where: { telegramId: ctx.from?.id },
      data: {
        phoneNumber: ctx.session.setupSession.phoneNumber,
      },
    });

    await ctx.reply("✅ Номер телефона успешно изменен.");
  } catch (error) {
    await errorHandlerCtx(error, ctx);
  }

  await ctx.scene.enter(ScenesId.SETTINGS);
}

export default phoneNumber;
