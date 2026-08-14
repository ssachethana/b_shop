import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Await the parameters in modern Next.js versions
    const { id } = await params;
    const productId = parseInt(id, 10);

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    // Fetch the single product matching the unique ID
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        category: {
          select: { name: true },
        },
        unit: {
          select: { name: true, symbol: true },
        },
        batches: {
          select: {
            remaining: true,
            sellPrice: true,
          },
        },
        brand: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product details' },
      { status: 500 }
    );
  }
}