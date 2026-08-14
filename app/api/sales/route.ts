// app/api/sales/route.ts
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@/app/generated/prisma/client"
import { auth } from "@/auth"
import { sendLowStockEmail } from "@/lib/email";

// ─── Helper: get current UTC date strings ────────────────────────────────────
function getDateKeys() {
  const now = new Date();
  const dayKey = now.toISOString().slice(0, 10);
  const year = now.getUTCFullYear();
  const weekNum = getISOWeek(now);
  return {
    dayKey,
    weekKey: `${year}-W${String(weekNum).padStart(2, "0")}`,
    monthKey: `${year}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`,
    yearKey: String(year),
  };
}

function getISOWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// ─── GET /api/sales?shopId=X  →  products list with ALL valid batches ─────────

// import { auth } from "..." 
// import prisma from "..."

// Helper function to shuffle an array (Fisher-Yates Algorithm)
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export async function GET(req: NextRequest) {
  const session = await auth();

  // 1. Extract the raw string ID safely
  const rawShopId = session?.user?.shopId;

  if (!rawShopId) {
    return NextResponse.json(
      { error: "You haven't shop " },
      { status: 401 }
    );
  }

  // 2. Explicitly convert it to a number for Prisma
  const shopId = Number(rawShopId);

  if (isNaN(shopId)) {
    return NextResponse.json({ error: "Invalid shop ID" }, { status: 400 });
  }

  try {
    const now = new Date();

    const products = await prisma.product.findMany({
      where: {
        shopId,
        isActive: true,
        displayProductInApp: true,
      },
      include: {
        unit: true,
        category: true,
        brand: true,
        // ── Fetch ALL valid batches (not just the first one) ──────────────────
        batches: {
          where: {
            remaining: { gt: 0 },
            OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
          },
          orderBy: { purchasedAt: "asc" }, // oldest first (FIFO default)
          select: {
            id: true,
            sellPrice: true,
            costPerUnit: true,
            remaining: true,
            purchasedAt: true,
            expiryDate: true,
          },
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

    // Compute total stock per product across all valid batches
    const stockMap = await prisma.purchaseBatch.groupBy({
      by: ["productId"],
      where: {
        shopId,
        remaining: { gt: 0 },
        OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
      },
      _sum: { remaining: true },
    });

    const stockByProduct = new Map<number, number>(
      stockMap.map((s) => [s.productId, s._sum.remaining ? Number(s._sum.remaining) : 0])
    );

    const serialised = products.map((p) => {
      const firstBatch = p.batches[0] ?? null;
      const promo = p.promotions[0] ?? null;

      return {
        id: p.id,
        name: p.name,
        sku: p.sku,
        barcode: p.barcode,
        imageUrl: p.imageUrl,
        description: p.description,
        lowStockThreshold: p.lowStockThreshold,
        isActive: p.isActive,
        displayProductInApp: p.displayProductInApp,
        unit: p.unit,
        category: p.category,
        brand: p.brand,
        currentStock: stockByProduct.get(p.id) ?? 0,
        // Default sell/cost price comes from the first (oldest) batch
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
        // ── All valid batches exposed to the client ───────────────────────────
        batches: p.batches.map((b) => ({
          id: b.id,
          sellPrice: b.sellPrice ? Number(b.sellPrice) : null,
          costPerUnit: b.costPerUnit ? Number(b.costPerUnit) : null,
          remaining: Number(b.remaining),
          purchasedAt: b.purchasedAt.toISOString(),
          expiryDate: b.expiryDate ? b.expiryDate.toISOString() : null,
        })),
      };
    });

    // 3. Randomize the finalized array before returning it
    const randomizedProducts = shuffleArray(serialised);

    return NextResponse.json({ products: randomizedProducts });
  } catch (error) {
    console.error("[GET /api/sales]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── POST /api/sales  →  create a sale ───────────────────────────────────────
export async function POST(req: NextRequest) {
  const session = await auth();
  const rawShopId = session?.user?.shopId;

  if (!rawShopId) {
    return NextResponse.json({ error: "You haven't shop " }, { status: 401 });
  }

  const shopId = Number(rawShopId);
  if (isNaN(shopId)) {
    return NextResponse.json({ error: "Invalid shop ID" }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { cashierId, customerId, paymentMethod, totalAmount, items } = body as {
      cashierId?: number;
      customerId?: number;
      paymentMethod: string;
      totalAmount: number;
      items: {
        productId: number;
        quantity: number;
        price: number;
        costAtSale: number;
        batchId?: number;
      }[];
    };

    if (!items?.length || !totalAmount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const now = new Date();
    const { dayKey, weekKey, monthKey, yearKey } = getDateKeys();

    // ── Pre-fetch read-only data OUTSIDE the transaction ──────────────────────
    // This is the big win: valuationMethod lookups don't need to hold a
    // transactional connection, so we do them all up front with the
    // regular (larger) connection pool instead of serially inside $transaction.
    const productIds = [...new Set(items.map((it) => it.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        valuationMethod: true,
        name: true,
        lowStockThreshold: true,
        reminder: true,
      },
    });
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Pre-fetch candidate batches outside the transaction too. We still
    // re-validate `remaining` and lock via the decrement inside the
    // transaction, so staleness here can't cause overselling — worst case
    // a batch we picked has since been depleted and we throw / retry below.
    const batchCandidates = new Map<
      string,
      Awaited<ReturnType<typeof prisma.purchaseBatch.findMany>>
    >();

    for (const item of items) {
      const product = productMap.get(item.productId);
      const orderDir = product?.valuationMethod === 1 ? "desc" : "asc";
      const key = `${item.productId}:${item.batchId ?? "any"}`;

      if (item.batchId) {
        const pinnedBatch = await prisma.purchaseBatch.findFirst({
          where: {
            id: item.batchId,
            productId: item.productId,
            shopId,
            remaining: { gt: 0 },
            OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
          },
        });

        if (!pinnedBatch) {
          return NextResponse.json(
            { error: `Selected batch ${item.batchId} for product ${item.productId} is unavailable` },
            { status: 422 }
          );
        }

        const fallbackBatches = await prisma.purchaseBatch.findMany({
          where: {
            productId: item.productId,
            shopId,
            id: { not: item.batchId },
            remaining: { gt: 0 },
            OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
          },
          orderBy: { purchasedAt: orderDir },
        });

        batchCandidates.set(key, [pinnedBatch, ...fallbackBatches]);
      } else {
        const availableBatches = await prisma.purchaseBatch.findMany({
          where: {
            productId: item.productId,
            shopId,
            remaining: { gt: 0 },
            OR: [{ expiryDate: null }, { expiryDate: { gt: now } }],
          },
          orderBy: { purchasedAt: orderDir },
        });

        batchCandidates.set(key, availableBatches);
      }
    }

    // ── Transaction: ONLY the atomic writes (decrements + sale creation) ──────
    const sale = await prisma.$transaction(
      async (tx) => {
        const saleItemsData: Prisma.SaleItemCreateManySaleInput[] = [];
        const batchLinks: { saleItemIdx: number; batchId: number; qty: Prisma.Decimal }[] = [];

        for (let i = 0; i < items.length; i++) {
          const item = items[i];
          const key = `${item.productId}:${item.batchId ?? "any"}`;
          const availableBatches = batchCandidates.get(key) ?? [];

          // ── Decimal-safe depletion loop ────────────────────────────────────
          let needed = new Prisma.Decimal(item.quantity);
          const consumed: { id: number; take: Prisma.Decimal }[] = [];

          for (const batch of availableBatches) {
            if (needed.lessThanOrEqualTo(0)) break;

            const batchRemaining = new Prisma.Decimal(batch.remaining);
            const take = Prisma.Decimal.min(needed, batchRemaining);
            if (take.lessThanOrEqualTo(0)) continue;

            needed = needed.minus(take);
            consumed.push({ id: batch.id, take });
          }

          if (needed.greaterThan(0)) {
            throw new Error(`Insufficient stock for product ${item.productId}`);
          }

          // Decrement all consumed batches for this item in parallel —
          // they're independent rows, so no need to serialize round trips.
          // A conditional `remaining: { gte: take }` guard means a batch
          // depleted by a concurrent sale since our pre-fetch will simply
          // update 0 rows rather than going negative.
          const updateResults = await Promise.all(
            consumed.map((c) =>
              tx.purchaseBatch.updateMany({
                where: { id: c.id, remaining: { gte: c.take } },
                data: { remaining: { decrement: c.take } },
              })
            )
          );

          if (updateResults.some((r) => r.count === 0)) {
            throw new Error(
              `Insufficient stock for product ${item.productId} (stock changed concurrently, please retry)`
            );
          }

          for (const c of consumed) {
            batchLinks.push({ saleItemIdx: i, batchId: c.id, qty: c.take });
          }

          saleItemsData.push({
            productId: item.productId,
            quantity: new Prisma.Decimal(item.quantity),
            price: new Prisma.Decimal(item.price),
            costAtSale: new Prisma.Decimal(item.costAtSale),
          });
        }

        const newSale = await tx.sale.create({
          data: {
            shopId,
            cashierId: cashierId ?? null,
            customerId: customerId ?? null,
            paymentMethod: paymentMethod as any,
            totalAmount: new Prisma.Decimal(totalAmount),
            status: "COMPLETED",
            items: { createMany: { data: saleItemsData } },
          },
          include: { items: true },
        });

        // Bulk insert instead of one createMany call per batch link.
        if (batchLinks.length > 0) {
          await tx.saleItemBatch.createMany({
            data: batchLinks.map((link) => ({
              saleItemId: newSale.items[link.saleItemIdx].id,
              batchId: link.batchId,
              quantity: link.qty,
            })),
          });
        }

        // Analytics — costAtSale * quantity is now Decimal * Decimal-ish; keep as numbers here
        // since ShopAnalytics fields are Float, this is fine as-is.
        const totalCost = items.reduce((s, it) => s + it.costAtSale * it.quantity, 0);
        const totalRevenue = totalAmount;
        const totalProfit = totalRevenue - totalCost;

        const analytics = await tx.shopAnalytics.findUnique({ where: { shopId } });

        if (!analytics) {
          await tx.shopAnalytics.create({
            data: {
              shopId,
              currentDayKey: dayKey,
              currentWeekKey: weekKey,
              currentMonthKey: monthKey,
              currentYearKey: yearKey,
              dayTotalRevenue: totalRevenue,
              dayTotalCost: totalCost,
              dayTotalProfit: totalProfit,
              daySaleCount: 1,
              weekTotalRevenue: totalRevenue,
              weekTotalCost: totalCost,
              weekTotalProfit: totalProfit,
              weekSaleCount: 1,
              monthTotalRevenue: totalRevenue,
              monthTotalCost: totalCost,
              monthTotalProfit: totalProfit,
              monthSaleCount: 1,
              yearTotalRevenue: totalRevenue,
              yearTotalCost: totalCost,
              yearTotalProfit: totalProfit,
              yearSaleCount: 1,
            },
          });
        } else {
          const isDayReset = analytics.currentDayKey !== dayKey;
          const isWeekReset = analytics.currentWeekKey !== weekKey;
          const isMonthReset = analytics.currentMonthKey !== monthKey;
          const isYearReset = analytics.currentYearKey !== yearKey;

          await tx.shopAnalytics.update({
            where: { shopId },
            data: {
              currentDayKey: dayKey,
              currentWeekKey: weekKey,
              currentMonthKey: monthKey,
              currentYearKey: yearKey,
              dayTotalRevenue: isDayReset ? totalRevenue : { increment: totalRevenue },
              dayTotalCost: isDayReset ? totalCost : { increment: totalCost },
              dayTotalProfit: isDayReset ? totalProfit : { increment: totalProfit },
              daySaleCount: isDayReset ? 1 : { increment: 1 },
              weekTotalRevenue: isWeekReset ? totalRevenue : { increment: totalRevenue },
              weekTotalCost: isWeekReset ? totalCost : { increment: totalCost },
              weekTotalProfit: isWeekReset ? totalProfit : { increment: totalProfit },
              weekSaleCount: isWeekReset ? 1 : { increment: 1 },
              monthTotalRevenue: isMonthReset ? totalRevenue : { increment: totalRevenue },
              monthTotalCost: isMonthReset ? totalCost : { increment: totalCost },
              monthTotalProfit: isMonthReset ? totalProfit : { increment: totalProfit },
              monthSaleCount: isMonthReset ? 1 : { increment: 1 },
              yearTotalRevenue: isYearReset ? totalRevenue : { increment: totalRevenue },
              yearTotalCost: isYearReset ? totalCost : { increment: totalCost },
              yearTotalProfit: isYearReset ? totalProfit : { increment: totalProfit },
              yearSaleCount: isYearReset ? 1 : { increment: 1 },
            },
          });
        }

        return newSale;
      },
      {
        // Give the pool more time to hand out a connection, and give the
        // transaction itself more time to finish its (now much shorter)
        // sequence of writes.
        maxWait: 10000,
        timeout: 20000,
      }
    );

    // ── Low stock check + email alert (OUTSIDE the transaction) ───────────────
    // Runs after the sale has committed. Slow I/O like email must never live
    // inside prisma.$transaction() — it would hold a DB connection open for
    // the duration of the network call and risk hitting the transaction
    // timeout above.
    try {
      const postSaleStock = await prisma.purchaseBatch.groupBy({
        by: ["productId"],
        where: {
          productId: { in: productIds },
          shopId,
          remaining: { gt: 0 },
          OR: [{ expiryDate: null }, { expiryDate: { gt: new Date() } }],
        },
        _sum: { remaining: true },
      });
      const stockNow = new Map<number, number>(
        postSaleStock.map((s) => [s.productId, Number(s._sum.remaining ?? 0)])
      );

      const toNotify = products.filter((p) => {
        const stock = stockNow.get(p.id) ?? 0;
        return stock <= p.lowStockThreshold && !p.reminder;
      });

      if (toNotify.length > 0) {
        const shop = await prisma.shop.findUnique({
          where: { id: shopId },
          select: { owner: { select: { email: true } } },
        });

        if (shop?.owner?.email) {
          await Promise.all(
            toNotify.map((p) =>
              sendLowStockEmail(
                shop.owner.email,
                p.name,
                stockNow.get(p.id) ?? 0,
                p.lowStockThreshold
              )
            )
          );
        }

        await prisma.product.updateMany({
          where: { id: { in: toNotify.map((p) => p.id) } },
          data: { reminder: true },
        });
      }
    } catch (notifyError) {
      // Never fail the sale response because of a notification hiccup.
      console.error("[POST /api/sales] low-stock notification failed:", notifyError);
    }

    return NextResponse.json(
      {
        sale: {
          id: sale.id,
          totalAmount: Number(sale.totalAmount),
          status: sale.status,
          paymentMethod: sale.paymentMethod,
          shopId: sale.shopId,
          cashierId: sale.cashierId,
          customerId: sale.customerId,
          createdAt: sale.createdAt.toISOString(),
          items: sale.items.map((it) => ({
            id: it.id,
            productId: it.productId,
            quantity: Number(it.quantity), // Decimal → number for the client
            price: Number(it.price),
            costAtSale: Number(it.costAtSale),
          })),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[POST /api/sales]", error);
    if (error.message?.includes("Insufficient stock")) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    if (error.message?.includes("unavailable")) {
      return NextResponse.json({ error: error.message }, { status: 422 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}