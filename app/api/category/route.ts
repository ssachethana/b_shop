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

    const category = await prisma.localCategory.findMany({

      where: {
        shopId: shopId,

      },
      orderBy: {
        name: 'asc',
      },
    });
    

    // Return the sorted list of units
    return NextResponse.json(category, { status: 200 });
    
  } catch (error) {
    console.error('Request error', error);
    return NextResponse.json(
      { error: 'Error fetching category' },
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

    // 1. Validation: Ensure name exists
    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // 2. Check for duplicates: 
    // Your schema has @@unique([name, shopId]), so Prisma would throw an error anyway, 
    // but checking manually allows for a cleaner error message.
    const existingCategory = await prisma.localCategory.findUnique({
      where: {
        name_shopId: {
          name: name,
          shopId: shopId,
        },
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: 'A category with this name already exists in this shop' },
        { status: 400 }
      );
    }

    // 3. Create the category
    const newCategory = await prisma.localCategory.create({
      data: {
        name: name,
        shopId: shopId,
      },
    });

    return NextResponse.json(newCategory, { status: 201 });

  } catch (error: any) {
    console.error("Post Category Error:", error);
    
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}