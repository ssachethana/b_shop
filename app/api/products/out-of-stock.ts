import  prisma  from '@/lib/prisma';

export async function getOutOfStockProducts(shopId: number) {
  const products = await prisma.product.findMany({
    where: {
      shopId,
      batches: {
        none: {
          remaining: {
            gt: 0
          }
        }
      }
    },
    include: {
      category: true,
      brand: true
    }
  });

  return products;
}