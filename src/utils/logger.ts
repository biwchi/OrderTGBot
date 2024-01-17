import { createLogger } from "winston";
import winston, { format } from "winston";
import { Context } from "telegraf";

function prepareMessage(ctx: Context, message: string) {
  if (ctx && ctx.from) {
    return `[${ctx.from.id}/${ctx.from.username}]: ${message}`;
  }

  return `: ${message}`;
}

const loggerBase = createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "./logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "./logs/debug.log", level: "debug" }),
  ],
  format: format.simple(),
});

const logger = {
  debugWithCtx(ctx: Context, message: string) {
    return loggerBase.debug(prepareMessage(ctx, message));
  },
  errorWithCtx(ctx: Context, message: string) {
    return loggerBase.error(prepareMessage(ctx, message));
  },

  debug(message: string) {
    return loggerBase.debug(message);
  },
  error(message: string) {
    return loggerBase.error(message);
  },
};

export default logger;
