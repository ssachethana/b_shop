import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";
import { auth } from "@/auth"

const PALETTE = ["#F39D2E", "#FBC978", "#111827", "#93C5FD", "#E5E7EB"];
const MAX_SLICES = 5; // top 4 categories + "Other"

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
      const shopId   = Number(rawShopId);
    
    
      if (isNaN(shopId)) {
        return NextResponse.json({ error: "Invalid shop ID" }, { status: 400 });
      }
  try {

    const { searchParams } = new URL(req.url);
    
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");


    

    
    const shop = await prisma.shop.findUnique({ where: { id: shopId }, select: { id: true } });
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const createdAt: { gte?: Date; lte?: Date } = {};
    if (startDateParam) createdAt.gte = new Date(startDateParam);
    if (endDateParam) createdAt.lte = new Date(endDateParam);

    const saleItems = await prisma.saleItem.findMany({
      where: {
        sale: {
          shopId,
          status: "COMPLETED",
          ...(startDateParam || endDateParam ? { createdAt } : {}),
        },
      },
      select: {
        quantity: true,
        price: true,
        product: {
          select: {
            category: { select: { name: true } },
          },
        },
      },
    });

    if (saleItems.length === 0) {
      return NextResponse.json({ categoryBreakdown: [] });
    }

    // Sum revenue (price * quantity) per category
    const revenueByCategory = new Map<string, number>();
    for (const item of saleItems) {
      const categoryName = item.product.category?.name ?? "Uncategorized";
      const revenue = Number(item.quantity) * Number(item.price);
      revenueByCategory.set(categoryName, (revenueByCategory.get(categoryName) ?? 0) + revenue);
    }

    const totalRevenue = [...revenueByCategory.values()].reduce((sum, v) => sum + v, 0);

    const sorted = [...revenueByCategory.entries()]
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    // Keep top categories, bucket the rest into "Other"
    let topEntries = sorted;
    let otherRevenue = 0;
    if (sorted.length > MAX_SLICES) {
      topEntries = sorted.slice(0, MAX_SLICES - 1);
      otherRevenue = sorted.slice(MAX_SLICES - 1).reduce((sum, e) => sum + e.revenue, 0);
    }

    const categoryBreakdown = topEntries.map((entry, i) => ({
      name: entry.name,
      value: Math.round((entry.revenue / totalRevenue) * 100),
      color: PALETTE[i % PALETTE.length],
    }));

    if (otherRevenue > 0) {
      categoryBreakdown.push({
        name: "Other",
        value: Math.round((otherRevenue / totalRevenue) * 100),
        color: PALETTE[PALETTE.length - 1],
      });
    }

    return NextResponse.json({ categoryBreakdown });
  } catch (err) {
    console.error("[category-breakdown] error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}