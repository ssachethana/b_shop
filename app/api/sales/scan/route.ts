// app/api/sales/scan/route.ts
import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";

// GET /api/sales/scan?shopId=1&code=SKU123  (barcode or SKU lookup)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shopId = Number(searchParams.get("shopId"));
  const code = searchParams.get("code")?.trim();

  if (!shopId || !code) {
    return NextResponse.json({ error: "shopId and code are required" }, { status: 400 });
  }

  try {
    const now = new Date();

    const product = await prisma.product.findFirst({
      where: {
        shopId,
        isActive: true,
        OR: [{ sku: code }, { barcode: code }],
      },
      include: {
        unit: true,
        category: true,
        brand: true,
        batches: {
          where: {
            remaining: { gt: 0 },
            OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
          },
          orderBy: { purchasedAt: "asc" },
          take: 1,
          select: { sellPrice: true, costPerUnit: true, remaining: true },
        },
        promotions: {
          where: {
            isActive: true,
            startDate: { lte: now },
            endDate: { gte: now },
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const stockAgg = await prisma.purchaseBatch.aggregate({
      where: {
        productId: product.id,
        shopId,
        remaining: { gt: 0 },
        OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
      },
      _sum: { remaining: true },
    });

    const firstBatch = product.batches[0] ?? null;
    const promo = product.promotions[0] ?? null;

    return NextResponse.json({
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        barcode: product.barcode,
        imageUrl: product.imageUrl,
        description: product.description,
        lowStockThreshold: product.lowStockThreshold,
        isActive: product.isActive,
        displayProductInApp: product.displayProductInApp,
        unit: product.unit,
        category: product.category,
        brand: product.brand,
        currentStock: stockAgg._sum.remaining ?? 0,
        sellPrice: firstBatch?.sellPrice ? Number(firstBatch.sellPrice) : null,
        costPerUnit: firstBatch?.costPerUnit ? Number(firstBatch.costPerUnit) : null,
        activePromotion: promo
          ? {
              id: promo.id,
              name: promo.name,
              discountType: promo.discountType,
              value: Number(promo.value),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("[GET /api/sales/scan]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}