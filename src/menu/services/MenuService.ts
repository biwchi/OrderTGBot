import { injectable } from "inversify";
import prisma from "../../client";

@injectable()
export class MenuService {
  public getMenu() {
    return prisma.menu.findFirst({
      include: {
        categories: {
          include: {
            products: true,
          },
        },
      },
    });
  }
}
