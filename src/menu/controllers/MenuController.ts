import Controller from "../../utils/controller.decorator";
import { Get } from "../../utils/handlers.decorator";
import { MenuService } from "../services/MenuService";
import { Request, Response } from "express";

@Controller("/menu")
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  public async getMenu(req: Request, res: Response) {
    res.json(await this.menuService.getMenu());
  }
}
