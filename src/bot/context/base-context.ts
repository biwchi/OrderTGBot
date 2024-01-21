import { User } from "@prisma/client";
import { Context } from "telegraf";
import { User as TelegramUser } from "telegraf/typings/core/types/typegram";

export type AppUser = User | TelegramUser;

export default interface BaseContext extends Context {}
