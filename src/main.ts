import dotenv from "dotenv";
import expressApplication from "./express";
import bot from "./bot";

import { createServer } from "http";

dotenv.config();
bot.launch();

const server = createServer(expressApplication.instance);

server.listen(process.env.PORT || 3000, () =>
  console.log(`Server started on port ${process.env.PORT || 3000}`),
);

process.once("SIGINT", () => {
  bot.stop("SIGINT")
  server.close(() => console.log("Server closed"));
});
process.once("SIGTERM", () => bot.stop("SIGTERM"));