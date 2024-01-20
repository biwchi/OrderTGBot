import { Scenes, Telegraf, session } from "telegraf";
import start from "./bot/controllers/start";
import { ScenesId } from "./bot/scenes";
import setup from "./bot/controllers/setup";
import { AppContext, SetupContext } from "./bot/context";
import settingsStage from "./bot/controllers/settings";

const bot = new Telegraf<AppContext>(process.env.BOT_TOKEN || "");
const stage = new Scenes.Stage<AppContext>([start, setup]);

bot.use(session());
bot.use(stage.middleware());
bot.use(settingsStage.middleware());

bot.start((ctx) => ctx.scene.enter(ScenesId.START));

export default bot;
