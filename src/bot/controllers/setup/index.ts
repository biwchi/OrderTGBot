import { Composer, Context, Markup, Scenes } from "telegraf";
import { callbackQuery, message } from "telegraf/filters";
import { ScenesId } from "../../scenes";
import { SetupContext, TGContext } from "../../../bot";
import { getOrderAddressesKeyboard } from "../../utils/keybords";
import prisma from "../../../client";
import { RegEx } from "../../../utils/regex";

const setup = new Scenes.WizardScene<SetupContext>(
  ScenesId.SETUP,
  async (ctx) => {
    const addressesButtons = await getOrderAddressesKeyboard();

    if (!ctx.orderAddress) {
      await ctx.reply("Выберите адрес откуда вы хотите сделать заказ", addressesButtons);
    }

    return ctx.wizard.next();
  },
  Composer.on(callbackQuery("data"), async (ctx) => {
    const { data } = ctx.callbackQuery;
    console.log(data);

    if (!data.startsWith("address_")) {
      return;
    }

    let addressId = Number(data.split("_")[1]);

    const orderAddress = await prisma.orderAddress.findFirst({
      where: {
        id: addressId,
      },
    });

    if (!orderAddress) {
      await ctx.reply("Адрес не найден");
      return;
    }

    ctx;
    ctx.answerCbQuery();

    await ctx.reply(
      'Нажмите на кнопку "📱 Отправить телефон" или введите его вручную в международном формате +998711234567',
      Markup.keyboard([Markup.button.contactRequest("Отправить номер телефона")]).resize(),
    );

    return ctx.wizard.next();
  }),
  async (ctx) => {
    if (!ctx.message) {
      return;
    }

    if ("contact" in ctx.message) {
      ctx.phoneNumber = ctx.message.contact.phone_number;
    }

    if ("text" in ctx.message && RegExp(RegEx.PHONE).test(ctx.message.text)) {
      ctx.phoneNumber = ctx.message.text;
    } else {
      return await ctx.reply("Неверный формат номера");
    }

    if (!ctx.phoneNumber) {
      return await ctx.reply(
        'Нажмите на кнопку "📱 Отправить телефон" или введите его вручную в международном формате +998711234567',
        Markup.keyboard([Markup.button.contactRequest("Отправить номер телефона")]).resize(),
      );
    }

    if (!ctx.deliveryAddress) {
      await ctx.reply(
        "Введите или отправите нам адрес доставки",
        Markup.keyboard([Markup.button.locationRequest("Отправить адрес")]).resize(),
      );
    }

    return ctx.wizard.next();
  },
  async (ctx) => {
    if (!ctx.message) {
      return;
    }

    if ("location" in ctx.message) {
      ctx.deliveryAddress = ctx.message.location;
    }

    if ("text" in ctx.message) {
      ctx.deliveryAddress = ctx.message.text;
    }

    ctx.scene.leave();
  },
);

setup.leave(async (ctx) => {
  await ctx.reply("Вы зарегерированы! Ваши данные:");
  await ctx.replyWithMarkdownV2(
    "```json\n" +
      JSON.stringify({
        "Адресс доставки": ctx.deliveryAddress,
        "Номер телефона": ctx.phoneNumber,
        Точка: ctx.orderAddress?.title,
      }) +
      "\n```",
  );
});
export default setup;
