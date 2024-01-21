import prisma from "../../../client";
import logger from "../../../utils/logger";

import { Composer, Markup } from "telegraf";
import { callbackQuery, message } from "telegraf/filters";
import { RegEx } from "../../../utils/regex";
import { SetupContext } from "../../context";
import { GeocodeResponseAddress } from "./types";
import { getOrderAddressesKeyboard } from "../../utils/keybords";

function saveOrderAddress() {
  const composer = new Composer<SetupContext>();

  composer.on(message("text"), async (ctx) => {
    const addressesButtons = await getOrderAddressesKeyboard();
    await ctx.reply("Выберите адрес из списка.", addressesButtons);
  });

  return composer.on(callbackQuery("data"), async (ctx) => {
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

    ctx.answerCbQuery();
    ctx.session.setupSession.orderAddress = orderAddress;

    await ctx.reply(
      'Нажмите на кнопку "📱 Отправить телефон" или ✍️ введите его вручную в международном формате +998711234567.',
      Markup.keyboard([Markup.button.contactRequest("Отправить номер телефона")])
        .resize()
        .oneTime(),
    );

    return ctx.wizard.next();
  });
}

export async function getPhoneNumber(ctx: SetupContext) {
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

  await ctx.reply(
    "✍️ Введите или отправите нам адрес доставки.",
    Markup.keyboard([Markup.button.locationRequest("Отправить адрес")])
      .resize()
      .oneTime(),
  );

  return ctx.wizard.next();
}

async function getLocation(ctx: SetupContext) {
  if (!ctx.message) {
    return;
  }

  if ("location" in ctx.message) {
    try {
      const lat = ctx.message.location.latitude;
      const lon = ctx.message.location.longitude;

      const addressResponse = await fetch(
        `${process.env.GEOCODE_MAP_API_URL}&lat=${lat}&lon=${lon}`,
      );
      const addressJson = (await addressResponse.json()) as GeocodeResponseAddress;

      const addressString = `${addressJson.address.county}, ${addressJson.address.quarter} ${addressJson.address.house_number}`;
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

  ctx.scene.leave();
}

const step1 = saveOrderAddress();
const step2 = getPhoneNumber;
const step3 = getLocation;

export { step1, step2, step3 };
