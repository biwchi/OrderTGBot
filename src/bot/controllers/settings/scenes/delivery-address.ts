import logger from "../../../../utils/logger";
import prisma from "../../../../client";

import { Markup, Scenes } from "telegraf";
import { SetupContext } from "../../../context";
import { SettingsScenes } from "..";
import { message } from "telegraf/filters";
import { GeocodeResponseAddress } from "../../setup/types";
import { ScenesId } from "../../../scenes";
import { BACK_BUTTON, errorHandlerCtx } from "../../../utils";
import { backAction } from "../../../utils/back-button-action";

const deliveryAddress = new Scenes.BaseScene<SetupContext>(SettingsScenes.DELIVERY_ADDRESS);

deliveryAddress.enter(async (ctx) => {
  await ctx.reply(
    "✍️ Введите или отправите нам адрес доставки.",
    Markup.keyboard([Markup.button.locationRequest("Отправить адрес"), BACK_BUTTON])
      .resize()
      .oneTime(),
  );
});

deliveryAddress.hears(...backAction(ScenesId.SETTINGS));

deliveryAddress.on([message("location"), message("text")], async (ctx) => {
  if ("location" in ctx.message) {
    try {
      const lat = ctx.message.location.latitude;
      const lon = ctx.message.location.longitude;

      const response = await fetch(`${process.env.GEOCODE_MAP_API_URL}&lat=${lat}&lon=${lon}`);
      const address = (await response.json()) as GeocodeResponseAddress;

      const addressString = `${address.address.county}, ${address.address.quarter} ${address.address.house_number}`;
      ctx.session.setupSession.deliveryAddress = addressString;
    } catch (error) {
      logger.error(JSON.stringify(error), ctx);
      await ctx.reply("❌ Произошла ошибка. Попробуйте ещё раз или введите адрес вручную.");
      return;
    }
  } else if ("text" in ctx.message) {
    ctx.session.setupSession.deliveryAddress = ctx.message.text;
  } else {
    return await ctx.reply("✍️ Напишите или отправьте нам адрес доставки.");
  }

  ctx.session.setupSession.isSetup
    ? await ctx.scene.enter(ScenesId.CREATE_USER)
    : await saveDeliveryAddress(ctx);
});

async function saveDeliveryAddress(ctx: SetupContext) {
  if (!ctx.session.setupSession.deliveryAddress) {
    return await ctx.scene.reenter();
  }

  try {
    await prisma.user.update({
      data: {
        deliveryAddress: ctx.session.setupSession.deliveryAddress,
      },
      where: {
        telegramId: ctx.from?.id,
      },
    });

    await ctx.reply("✅ Адрес доставки успешно изменен.");
  } catch (error) {
    await errorHandlerCtx(error, ctx);
  }

  await ctx.scene.enter(ScenesId.SETTINGS);
}

export default deliveryAddress;
