import prisma from "../../../../client";

import { Scenes, Markup } from "telegraf";
import { callbackQuery } from "telegraf/filters";
import { SettingsScenes } from "..";
import { SetupContext } from "../../../context";
import { getOrderAddressesKeyboard } from "../../../utils/keybords";
import logger from "../../../../utils/logger";
import { ScenesId } from "../../../scenes";

const orderAddress = new Scenes.BaseScene<SetupContext>(SettingsScenes.ORDER_ADDRESS);

orderAddress.enter(async (ctx) => {
  const addressesButtons = await getOrderAddressesKeyboard();
  await ctx.reply("🤖 Выберите адрес откуда вы хотите сделать заказ", addressesButtons);
});

orderAddress.on(callbackQuery("data"), async (ctx) => {
  const { data } = ctx.callbackQuery;
  const addressId = Number(data.split("_")[1]);

  if (!data.startsWith("address_") || addressId < 1) {
    return;
  }

  const orderAddress = await prisma.orderAddress.findFirst({
    where: {
      id: addressId,
    },
  });

  if (!orderAddress) {
    await ctx.reply("❌ Адрес не найден");
    return;
  }

  ctx.session.setupSession.orderAddress = orderAddress;
  
  await ctx.answerCbQuery();
  await saveOrderAddress(ctx);
});

async function saveOrderAddress(ctx: SetupContext) {
  if (!ctx.session.setupSession.orderAddress) {
    await ctx.scene.reenter();
    return;
  }

  const userId = ctx.from?.id;

  try {
    prisma.user.update({
      where: {
        telegramId: userId,
      },
      data: {
        orderAddress: {
          connect: {
            id: ctx.session.setupSession.orderAddress.id,
          },
        },
      },
    });

    await ctx.reply("✅ Адрес доставки успешно изменен.");
  } catch (error) {
    logger.error(JSON.stringify(error), ctx);
    await ctx.reply("❌ Произошла ошибка. Попробуйте ещё раз.");
  }

  await ctx.scene.enter(ScenesId.SETTINGS);
}

export default orderAddress;
