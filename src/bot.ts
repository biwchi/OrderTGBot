import start from "./bot/controllers/start";
import settingsStage from "./bot/controllers/settings";
import setup from "./bot/controllers/setup";

import { Scenes, Telegraf, session } from "telegraf";
import { ScenesId } from "./bot/scenes";
import { AppContext } from "./bot/context";

const bot = new Telegraf<AppContext>(process.env.BOT_TOKEN || "");
const stage = new Scenes.Stage<AppContext>([start, setup, ...settingsStage.scenes.values()]);

bot.use(
  session({
    defaultSession: () => ({ setupSession: {} }),
  }),
);
bot.use(stage.middleware());

bot.start((ctx) => ctx.scene.enter(ScenesId.START));

bot.action(ScenesId.SETTINGS, (ctx) => ctx.scene.enter(ScenesId.SETTINGS));

export default bot;
