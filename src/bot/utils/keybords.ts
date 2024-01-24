import prisma from "../../client";
import { Markup } from "telegraf";
import { ScenesId } from "../scenes";
import { SettingsScenes } from "../controllers/settings";

export const BACK_BUTTON = "⬅️ Назад";

export function getMainKeyboard() {
  return Markup.inlineKeyboard([Markup.button.callback("⚙️ Настройки", ScenesId.SETTINGS)]);
}

export function getSettingsKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback("📱 Изменить номер телефона", SettingsScenes.PHONE_NUMBER)],
    [Markup.button.callback("🗺️ Изменить адрес доставки", SettingsScenes.DELIVERY_ADDRESS)],
    [Markup.button.callback("📍 Изменить точку доставки", SettingsScenes.ORDER_ADDRESS)],
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
