// app/api/batches/route.ts
import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma'; // adjust to your prisma client path
import { auth } from "@/auth"


// GET /api/batches?productId=123
// Returns all batches for a product
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');

    if (!productId || isNaN(Number(productId))) {
      return NextResponse.json({ error: 'Valid productId is required' }, { status: 400 });
    }

    const batches = await prisma.purchaseBatch.findMany({
      where: { productId: Number(productId) },
      include: {
        supplier: { select: { id: true, name: true } },
      },
      orderBy: { purchasedAt: 'desc' },
    });

    return NextResponse.json(batches);
  } catch (error: any) {
    console.error('[GET /api/batches]', error);
    return NextResponse.json({ error: 'Failed to fetch batches' }, { status: 500 });
  }
}

// POST /api/batches
// Body: { productId, shopId, quantity, costPerUnit, sellPrice?, expiryDate?, supplierId? }
export async function POST(req: NextRequest) {

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
    // ── Auth guard ──────────────────────────────────────────────────────────────
    // Uncomment and adjust these lines once your auth is wired up:
    // const session = await getServerSession(authOptions);
    // if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { productId, quantity, costPerUnit, sellPrice, expiryDate, supplierId } = body;

    // ── Validation ──────────────────────────────────────────────────────────────
    if (!productId || isNaN(Number(productId))) {
      return NextResponse.json({ error: 'Valid productId is required' }, { status: 400 });
    }
    
    if (!quantity || isNaN(Number(quantity)) || Number(quantity) <= 0) {
      return NextResponse.json({ error: 'quantity must be a positive number' }, { status: 400 });
    }
    if (!costPerUnit || isNaN(Number(costPerUnit)) || Number(costPerUnit) < 0) {
      return NextResponse.json({ error: 'costPerUnit must be a non-negative number' }, { status: 400 });
    }
    if (sellPrice !== undefined && sellPrice !== null && sellPrice !== '') {
      if (isNaN(Number(sellPrice)) || Number(sellPrice) < 0) {
        return NextResponse.json({ error: 'sellPrice must be a non-negative number' }, { status: 400 });
      }
    }

    // ── Verify product belongs to shop ─────────────────────────────────────────
    const product = await prisma.product.findFirst({
      where: { id: Number(productId), shopId: shopId },
      select: { id: true, lowStockThreshold: true, reminder: true },
    });
    if (!product) {
      return NextResponse.json({ error: 'Product not found in this shop' }, { status: 404 });
    }

    // ── Create the batch, then re-check stock level vs. threshold ──────────────
    const batch = await prisma.$transaction(async (tx) => {
      const createdBatch = await tx.purchaseBatch.create({
        data: {
          productId: Number(productId),
          shopId:    shopId,
          quantity:  Number(quantity),
          remaining: Number(quantity),            // starts full
          costPerUnit: Number(costPerUnit),
          sellPrice:
            sellPrice !== undefined && sellPrice !== null && sellPrice !== ''
              ? Number(sellPrice)
              : null,
          expiryDate:
            expiryDate ? new Date(expiryDate) : null,
          supplierId:
            supplierId && !isNaN(Number(supplierId)) ? Number(supplierId) : null,
        },
        include: {
          supplier: { select: { id: true, name: true } },
        },
      });

      // Total remaining stock across ALL batches for this product,
      // including the one we just created.
      const stockAgg = await tx.purchaseBatch.aggregate({
        where: { productId: Number(productId) },
        _sum: { remaining: true },
      });
      const totalRemaining = Number(stockAgg._sum.remaining ?? 0);

      // Stock has recovered above the low-stock threshold → clear the reminder flag
      if (product.reminder && totalRemaining > product.lowStockThreshold) {
        await tx.product.update({
          where: { id: product.id },
          data: { reminder: false },
        });
      }

      return createdBatch;
    });

    return NextResponse.json(batch, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/batches]', error);
    return NextResponse.json({ error: 'Failed to create batch' }, { status: 500 });
  }
}