import { Markup } from "telegraf";
import prisma from "../../client";

export function getMainKeyboard() {
  return Markup.inlineKeyboard([
    Markup.button.webApp("Открыть меню", process.env.WEB_APP_URL || ""),
    Markup.button.callback("Настройки", "settings"),
  ]);
}

export async function getOrderAddressesKeyboard() {
  const addresses = await prisma.orderAddress.findMany();
  console.log(addresses)
  return Markup.inlineKeyboard(
    addresses.map((address) => {
      return Markup.button.callback(address.title, `address_${address.id}`);
    }),
  );
}
