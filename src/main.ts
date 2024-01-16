import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import { createServer } from "http";
import application from "./application";

dotenv.config();

const botToken = process.env.BOT_TOKEN || "";

const bot = new Telegraf(botToken);
const server = createServer(application.instance);

bot.launch();
server.listen(process.env.PORT || 3000, () =>
  console.log(`Server started on port ${process.env.PORT || 3000}`),
);

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
