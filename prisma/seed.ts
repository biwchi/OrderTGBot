import { Prisma, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const menuData: Prisma.MenuCreateInput = {
  categories: {
    create: {
      title: "Category 1",
      products: {
        create: [
          {
            title: "Product 1",
            price: 10,
            description: "Description 1",
          },
          {
            title: "Product 2",
            price: 20,
            description: "Description 2",
          },
        ],
      },
    },
  },
};

const addressesData: Prisma.OrderAddressCreateInput[] = [
  {
    deliveryPrice: 500,
    title: "Сатпаева",
  },
];

async function main() {
  const menu = await prisma.menu.create({
    data: menuData,
  });

  const addresses = await prisma.orderAddress.createMany({
    data: addressesData,
  })

  console.log(menu);
  console.log(addresses)
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
