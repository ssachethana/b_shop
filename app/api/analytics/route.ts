// app/api/analytics/route.ts

import { NextRequest, NextResponse } from "next/server";
import prisma from '@/lib/prisma';
import { auth } from "@/auth"

export async function GET(
  
) {

  const session = await auth();
  
  // 1. Extract the raw string ID safely
  const rawShopId = session?.user?.shopId; 

  if (!rawShopId) {
    return NextResponse.json(
      { error: "You must be signed " },
      { status: 401 }
    );
  }

  // 2. Explicitly convert it to a number for Prisma
  const shopId   = Number(rawShopId);

  

  if (isNaN(shopId)) {
    return NextResponse.json({ error: "Invalid shop ID" }, { status: 400 });
  }

  const analytics = await prisma.shopAnalytics.findUnique({
    where: { shopId },
  });

  if (!analytics) {
    return NextResponse.json(
      { error: "Analytics not found for this shop" },
      { status: 404 }
    );
  }

  return NextResponse.json({ data: analytics }, { status: 200 });
}