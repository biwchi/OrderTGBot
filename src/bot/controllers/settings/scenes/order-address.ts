import prisma from "../../../../client";
import logger from "../../../../utils/logger";

import { Scenes } from "telegraf";
import { callbackQuery } from "telegraf/filters";
import { SettingsScenes } from "..";
import { SetupContext } from "../../../context";
import { getOrderAddressesKeyboard } from "../../../utils/keybords";
import { ScenesId } from "../../../scenes";
import { OrderAddress } from "@prisma/client";
import { errorHandlerCtx } from "../../../utils";

const orderAddress = new Scenes.BaseScene<SetupContext>(SettingsScenes.ORDER_ADDRESS);

orderAddress.enter(
  async (ctx) =>
    await ctx.reply(
      "🤖 Выберите адрес откуда вы хотите сделать заказ",
      await getOrderAddressesKeyboard(),
    ),
);

orderAddress.on(callbackQuery("data"), async (ctx) => {
  const { data } = ctx.callbackQuery;
  const addressId = Number(data.split("_")[1]);
  const isSetup = ctx.session.setupSession.isSetup;

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

  await ctx.answerCbQuery();

  if (isSetup) {
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
