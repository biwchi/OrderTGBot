import { Scenes } from "telegraf";
import { AppContext, SetupContext } from "../../context";
import { ScenesId } from "../../scenes";
import { getSettingsKeyboard } from "../../utils/keybords";
import { deliveryAddress, orderAddress, phoneNumber } from "./scenes";

export const enum SettingsScenes {
  PHONE_NUMBER = "changePhoneNumber",
  DELIVERY_ADDRESS = "changeDeliveryAddress",
  ORDER_ADDRESS = "changeOrderAddress",
}

const settings = new Scenes.BaseScene<SetupContext>(ScenesId.SETTINGS);

settings.enter(async (ctx) => {
  const settingsKeyboard = getSettingsKeyboard();
  await ctx.reply("⚙️ Чтобы вы хотели изменить?", settingsKeyboard);
});

settings.action(SettingsScenes.PHONE_NUMBER, async (ctx) => {
  console.log("try to change phone number");
  await ctx.scene.enter(SettingsScenes.PHONE_NUMBER);
  await ctx.answerCbQuery();
});

settings.action(SettingsScenes.ORDER_ADDRESS, async (ctx) => {
  await ctx.scene.enter(SettingsScenes.ORDER_ADDRESS);
  await ctx.answerCbQuery();
});

settings.action(SettingsScenes.DELIVERY_ADDRESS, async (ctx) => {
  await ctx.scene.enter(SettingsScenes.DELIVERY_ADDRESS);
  await ctx.answerCbQuery();
});

const settingsStage = new Scenes.Stage<AppContext>([
  settings,
  phoneNumber,
  orderAddress,
  deliveryAddress,
]);

export default settingsStage;
