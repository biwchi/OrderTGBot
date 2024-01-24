import prisma from "../../../../client";

import { Markup, Scenes } from "telegraf";
import { callbackQuery } from "telegraf/filters";
import { SettingsScenes } from "..";
import { SetupContext } from "../../../context";
import { getOrderAddressesKeyboard } from "../../../utils/keybords";
import { ScenesId } from "../../../scenes";
import { OrderAddress } from "@prisma/client";
import { BACK_BUTTON, errorHandlerCtx } from "../../../utils";
import { backAction } from "../../../utils/back-button-action";

const orderAddress = new Scenes.BaseScene<SetupContext>(SettingsScenes.ORDER_ADDRESS);

orderAddress.enter(async (ctx) => {
  await ctx.reply("🤖", Markup.keyboard([BACK_BUTTON]).oneTime().resize());
  await ctx.reply(
    "👇 Выберите адрес откуда вы хотели бы сделать заказ:",
    await getOrderAddressesKeyboard(),
  );
});
  
orderAddress.hears(...backAction(ScenesId.SETTINGS));

orderAddress.action(/^address_\d+/, async (ctx) => {
  if (!("data" in ctx.callbackQuery)) {
    return;
  }

  const id = Number(ctx.callbackQuery.data.split("_")[1]);

  const orderAddress = await prisma.orderAddress.findFirst({
    where: { id },
  });

  if (!orderAddress) {
    await ctx.reply("❌ Адрес не найден");
    return;
  }

  await ctx.answerCbQuery();

  if (ctx.session.setupSession.isSetup) {
    ctx.session.setupSession.orderAddress = orderAddress;
    return await ctx.scene.enter(SettingsScenes.PHONE_NUMBER);
  }

  await saveOrderAddress(ctx, orderAddress);
});

async function saveOrderAddress(ctx: SetupContext, orderAddress: OrderAddress) {
  try {
    prisma.user.update({
      where: {
        telegramId: ctx.from?.id,
      },
      data: {
        orderAddress: {
          connect: {
            id: orderAddress.id,
          },
        },
      },
    });

    await ctx.reply("✅ Адрес доставки успешно изменен.");
  } catch (error) {
    await errorHandlerCtx(error, ctx);
  }

  await ctx.scene.enter(ScenesId.SETTINGS);
}

export default orderAddress;
