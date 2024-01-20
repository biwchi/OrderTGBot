import { createLogger } from "winston";
import winston, { format } from "winston";
import { Context } from "telegraf";

function prepareMessage(ctx: Context, message: string) {
  if (ctx && ctx.from) {
    return `[${ctx.from.id}/${ctx.from.username}]: ${message}`;
  }

  return `: ${message}`;
}

const { combine, timestamp, printf } = format;
const customFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toLocaleUpperCase()}]: ${message}`;
});

const loggerBase = createLogger({
  transports: [
    new winston.transports.File({ filename: "./logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "./logs/info.log", level: "info" }),
    new winston.transports.File({ filename: "./logs/debug.log", level: "debug" }),
    new winston.transports.Console(),
  ],
  level: "debug",
  format: combine(timestamp(), customFormat),
});

const logger = {
  debug(message: string, ctx?: Context) {
    return loggerBase.debug(ctx ? prepareMessage(ctx, message) : message);
  },
  info(message: string, ctx?: Context) {
    return loggerBase.info(ctx ? prepareMessage(ctx, message) : message);
  },
  error(message: string, ctx?: Context) {
    return loggerBase.error(ctx ? prepareMessage(ctx, message) : message);
  },
};

export default logger;
