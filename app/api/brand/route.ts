import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { auth } from "@/auth"

export async function GET(request: NextRequest) {

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

    const brand = await prisma.brand.findMany({

      where: {
        shopId: shopId,

      },
      orderBy: {
        name: 'asc',
      },
    });

    // Return the sorted list of units
    return NextResponse.json(brand, { status: 200 });
    
  } catch (error) {
    console.error('Request error', error);
    return NextResponse.json(
      { error: 'Error fetching brand' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {

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
  
    const body = await req.json();
    const { name } = body;

    // 1. Validation
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Brand name is required' },
        { status: 400 }
      );
    }

    // 2. Check for unique constraint [name, shopId]
    // This prevents Prisma from throwing a generic error if the brand exists
    const existingBrand = await prisma.brand.findUnique({
      where: {
        name_shopId: {
          name: name.trim(),
          shopId: shopId,
        },
      },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: 'This brand already exists in your shop' },
        { status: 400 }
      );
    }

    // 3. Create new Brand
    const newBrand = await prisma.brand.create({
      data: {
        name: name.trim(),
        shopId: shopId,
      },
    });

    return NextResponse.json(newBrand, { status: 201 });

  } catch (error) {
    console.error("Post Brand Error:", error);
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    );
  }
}