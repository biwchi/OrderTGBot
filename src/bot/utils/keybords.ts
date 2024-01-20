import { Markup } from "telegraf";
import prisma from "../../client";

export function getMainKeyboard() {
  return Markup.inlineKeyboard([Markup.button.callback("⚙️ Настройки", "settings")]);
}

export function getSettingsKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📱 Изменить номер телефона", "changePhoneNumber")],
    [Markup.button.callback("🗺️ Изменить адрес доставки", "changeDeliveryAddress")],
    [Markup.button.callback("📍 Изменить точку доставки", "changeOrderAddress")],
  ]);
}

export async function getOrderAddressesKeyboard() {
  const addresses = await prisma.orderAddress.findMany();

  return Markup.inlineKeyboard(
    addresses.map((address) => {
      return Markup.button.callback(address.title, `address_${address.id}`);
    }),
  );
}
