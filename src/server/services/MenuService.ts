import prisma from "../../client";

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
