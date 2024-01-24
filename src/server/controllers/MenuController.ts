import Controller from '../utils/controller.decorator';

import { Request, Response } from "express";
import { MenuService } from '../services/MenuService';
import { Get } from '../utils/handlers.decorator';

@Controller("/menu")
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  public async getMenu(req: Request, res: Response) {
    res.json(await this.menuService.getMenu());
  }
}
