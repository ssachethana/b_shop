import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import  prisma  from "@/lib/prisma";
import { auth } from "@/auth"

const createShopSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Shop name must be at least 2 characters")
    .max(100, "Shop name is too long"),
  currency: z
    .string()
    .trim()
    .length(3, "Currency must be a 3-letter code, e.g. USD")
    .default("USD"),
  location: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((val) => (val ? val : undefined)),
});

// POST /api/shops — create a new shop owned by the signed-in user
export async function POST(req: NextRequest) {

   const session = await auth();
  
  // 1. Extract the raw string ID safely
  const rawUserId = session?.user?.id; 

  if (!rawUserId) {
    return NextResponse.json(
      { error: "You must be signed in to create a shop." },
      { status: 401 }
    );
  }

  // 2. Explicitly convert it to a number for Prisma
  const userId = Number(rawUserId);

  if (isNaN(userId)) {
    return NextResponse.json(
      { error: "Invalid user session configuration." },
      { status: 400 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = createShopSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed.",
        fields: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    );
  }

  const { name, currency, location } = parsed.data;

  try {
    const shop = await prisma.$transaction(
  async (tx) => {
    const newShop = await tx.shop.create({
      data: {
        name,
        currency,
        location,
        ownerId: userId,
      },
    });

    await tx.userShopRole.create({
      data: {
        userId,
        shopId: newShop.id,
        role: "OWNER",
      },
    });

    return newShop;
  },
  {
    // Increase limits if connecting to a remote/serverless DB
    maxWait: 5000, // Maximum time to wait for a connection from the pool (default 2000ms)
    timeout: 10000, // Maximum time the transaction can run before failing (default 5000ms)
  }
);

    return NextResponse.json({ shop }, { status: 201 });
  } catch (err) {
    console.error("Failed to create shop:", err);
    return NextResponse.json(
      { error: "Something went wrong while creating the shop." },
      { status: 500 }
    );
  }
}

// GET /api/shops — list the signed-in user's shops
// GET /api/shops — list the signed-in user's shops
export async function GET() { 
  const session = await auth();
  const rawUserId = session?.user?.id; 

  if (!rawUserId) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 });
  }

  // Convert the string ID to a Number at runtime
  const userId = Number(rawUserId);

  if (isNaN(userId)) {
    return NextResponse.json({ error: "Invalid user ID configuration." }, { status: 400 });
  }

  try {
    const shops = await prisma.shop.findMany({
      where: { ownerId: userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ shops });
  } catch (error) {
    console.error("Failed to fetch shops:", error);
    return NextResponse.json(
      { error: "Something went wrong while fetching shops." }, 
      { status: 500 }
    );
  }
}