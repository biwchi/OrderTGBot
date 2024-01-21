import prisma from "../../../client";
import logger from "../../../utils/logger";

import { Scenes } from "telegraf";
import { ScenesId } from "../../scenes";
import { SetupContext } from "../../context";
import { getOrderAddressesKeyboard } from "../../utils/keybords";
import { step1, step2, step3 } from "./steps";

const setup = new Scenes.WizardScene<SetupContext>(ScenesId.SETUP, step1, step2, step3);

setup.enter(async (ctx) => {
  const addressesButtons = await getOrderAddressesKeyboard();
  ctx.session.setupSession = {};
  await ctx.reply("Выберите адрес откуда вы хотите сделать заказ", addressesButtons);
});

setup.leave(async (ctx) => {
  if (
    !ctx.session.setupSession.deliveryAddress ||
    !ctx.session.setupSession.phoneNumber ||
    !ctx.session.setupSession.orderAddress
  ) {
    await ctx.scene.reenter();
    return;
  }

  if (!ctx.from) {
    return;
  }

  try {
    const newUser = await prisma.user.create({
      data: {
        deliveryAddress: ctx.session.setupSession.deliveryAddress,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name || null,
        orderAddress: {
          connect: {
            id: ctx.session.setupSession.orderAddress?.id,
          },
        },
        phoneNumber: ctx.session.setupSession.phoneNumber,
        telegramId: ctx.from.id,
        username: ctx.from.username || null,
      },
    });

    logger.debug(`User created: ${JSON.stringify(newUser)}`, ctx);
  } catch (error) {
    logger.error(JSON.stringify(error), ctx);

    await ctx.reply("❌ Произошла ошибка при регистрации. Попробуйте ещё раз");
    await ctx.scene.reenter();

    return;
  }

  ctx.scene.enter(ScenesId.START);
});

export default setup;
