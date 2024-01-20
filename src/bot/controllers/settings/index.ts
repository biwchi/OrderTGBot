import { Scenes } from "telegraf";
import { AppContext, SetupContext } from "../../context";
import { ScenesId } from "../../scenes";
import { getSettingsKeyboard } from "../../utils/keybords";
import { orderAddress, phoneNumber } from "./scenes";

export const enum SettingsScenes {
  PHONE_NUMBER = "changePhoneNumber",
  DELIVERY_ADDRESS = "changeDeliveryAddress",
  ORDER_ADDRESS = "changeOrderAddress",
}

const settings = new Scenes.BaseScene<SetupContext>(ScenesId.SETTINGS);

settings.enter(async (ctx) => {
  await ctx.reply("⚙️ Чтобы вы хотели изменить?", getSettingsKeyboard());
});

settings.action(SettingsScenes.PHONE_NUMBER, async (ctx) => {
  await ctx.scene.enter(SettingsScenes.PHONE_NUMBER);
});

settings.action(SettingsScenes.ORDER_ADDRESS, async (ctx) => {
  await ctx.scene.enter(SettingsScenes.ORDER_ADDRESS);
});

settings.action(SettingsScenes.DELIVERY_ADDRESS, async (ctx) => {
  await ctx.scene.enter(SettingsScenes.DELIVERY_ADDRESS);
});

const settingsStage = new Scenes.Stage<AppContext>([settings, phoneNumber, orderAddress]);

export default settingsStage;
