import { Context, Scenes, SessionStore, Telegraf, session } from "telegraf";
import start from "./bot/controllers/start";
import { ScenesId } from "./bot/scenes";
import setup from "./bot/controllers/setup";
import { OrderAddress } from "@prisma/client";
export interface TGContext extends Context {
  session: Scenes.WizardSession;

  scene: Scenes.SceneContextScene<TGContext, Scenes.WizardSessionData>;
  wizard: Scenes.WizardContextWizard<TGContext>;
}

export interface SetupContext extends Context {
  session: Scenes.WizardSession;

  phoneNumber?: string;
  orderAddress?: OrderAddress;
  deliveryAddress?: { latitude: number; longitude: number } | string;

  scene: Scenes.SceneContextScene<SetupContext, Scenes.WizardSessionData>;
  wizard: Scenes.WizardContextWizard<SetupContext>;
}

const bot = new Telegraf<TGContext>(process.env.BOT_TOKEN || "");

const stage = new Scenes.Stage<TGContext | SetupContext>([start, setup]);

bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) => ctx.scene.enter(ScenesId.START));

export default bot;
