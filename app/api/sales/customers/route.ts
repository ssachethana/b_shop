// app/api/sales/customers/route.ts
import { NextRequest, NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";

// GET /api/sales/customers?shopId=1&q=john
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const shopId = Number(searchParams.get("shopId"));
  const q = searchParams.get("q")?.trim() ?? "";

  if (!shopId) {
    return NextResponse.json({ error: "shopId is required" }, { status: 400 });
  }

  try {
    const customers = await prisma.customer.findMany({
      where: {
        shopId,
        OR: q
          ? [
              { name: { contains: q, mode: "insensitive" } },
              { phone: { contains: q } },
            ]
          : undefined,
      },
      orderBy: { name: "asc" },
      take: 20,
    });

    return NextResponse.json({ customers });
  } catch (error) {
    console.error("[GET /api/sales/customers]", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}