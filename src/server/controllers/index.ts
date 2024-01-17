import { MenuService } from "../services/MenuService";
import { MenuController } from "./MenuController";

export const controllers = [
  {
    instance: new MenuController(new MenuService()),
    _class: MenuController,
  },
];
