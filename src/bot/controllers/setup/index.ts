import prisma from "../../../client";
import logger from "../../../utils/logger";

import { Scenes } from "telegraf";
import { ScenesId } from "../../scenes";
import { SetupContext } from "../../context";
import { SettingsScenes } from "../settings";
import { errorHandlerCtx } from "../../utils";

const setup = new Scenes.BaseScene<SetupContext>(ScenesId.SETUP);
const createUser = new Scenes.BaseScene<SetupContext>(ScenesId.CREATE_USER);

setup.enter(async (ctx) => {
  ctx.session.setupSession.isSetup = true;
  await ctx.scene.enter(SettingsScenes.ORDER_ADDRESS);
});

createUser.enter(async (ctx) => {
  if (Object.values(ctx.session.setupSession).some((v) => v === null || v === undefined)) {
    return await ctx.scene.enter(ScenesId.SETUP);
  }

  if (!ctx.from) {
    return;
  }

  try {
    const newUser = await prisma.user.create({
      data: {
        deliveryAddress: ctx.session.setupSession.deliveryAddress!,
        firstName: ctx.from.first_name,
        lastName: ctx.from.last_name || null,
        orderAddress: {
          connect: {
            id: ctx.session.setupSession.orderAddress!.id,
          },
        },
        phoneNumber: ctx.session.setupSession.phoneNumber!,
        telegramId: ctx.from.id,
        username: ctx.from.username || null,
      },
    });

    logger.debug(`User created: ${JSON.stringify(newUser)}`, ctx);
  } catch (error) {
    await errorHandlerCtx(error, ctx);
    return await ctx.scene.enter(ScenesId.SETUP);
  }

  ctx.session.setupSession.isSetup = false
  await ctx.scene.enter(ScenesId.START);
});

const SetupStage = new Scenes.Stage<SetupContext>([setup, createUser]);

export default SetupStage;
