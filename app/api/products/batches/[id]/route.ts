import { NextRequest, NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma'; // adjust to your prisma client path

interface RouteParams {
  params: Promise<{ id: string }>;
}
// Returns all batches for a product
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Await the parameters in modern Next.js versions
    const { id } = await params;
    const productId = parseInt(id, 10);

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

