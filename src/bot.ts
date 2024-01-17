import { Context, Scenes, SessionStore, Telegraf, session } from "telegraf";
import start from "./bot/controllers/start";
import { ScenesId } from "./bot/scenes";
import setup from './bot/controllers/setup';
export interface TGContext extends Context {
  session: Scenes.WizardSession;

  scene: Scenes.SceneContextScene<TGContext, Scenes.WizardSessionData>;
  wizard: Scenes.WizardContextWizard<TGContext>;
}

const bot = new Telegraf<TGContext>(process.env.BOT_TOKEN || "");

const stage = new Scenes.Stage<TGContext>([start, setup]);

bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) => ctx.scene.enter(ScenesId.START));

export default bot;
