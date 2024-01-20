import { User } from "@prisma/client";
import { Context } from "telegraf";

export default interface BaseContext extends Context {
  session: {
    user: User;
  };
}
