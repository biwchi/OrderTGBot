import { Telegraf } from "telegraf";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const botToken = process.env.BOT_TOKEN || "";

const bot = new Telegraf(botToken);
const app = express();

app.listen(process.env.PORT || 3000, () => console.log("Server started"));
bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
