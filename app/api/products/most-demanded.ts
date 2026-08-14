import  prisma  from '@/lib/prisma';



export async function getMostDemandedProducts(
  shopId: number,
  startDate: Date,
  endDate: Date,
  limit: number = 10,
  order: "asc" | "desc"
) {

  const products = await prisma.saleItem.groupBy({
    by: ["productId"],
    _sum: {
      quantity: true,
    },

    where: {
      sale: {
        shopId: shopId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "COMPLETED",
      },
    },

    orderBy: {
      _sum: {
        quantity: order,
      },
    },

    take: limit,
  });

  const result = await Promise.all(
    products.map(async (item) => {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: {
          id: true,
          name: true,
          sku: true,
        },
      });

      return {
        product,
        soldQuantity: item._sum.quantity,
      };
    })
  );

  return result;
}