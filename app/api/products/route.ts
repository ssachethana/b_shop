
// this file handle get all product 
// create new product 
// filter product with searchParams

import { NextRequest,NextResponse } from 'next/server';
import  prisma  from '@/lib/prisma';

import { getMostDemandedProducts } from './most-demanded'
import { getOutOfStockProducts } from './out-of-stock';
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

  const { searchParams } = new URL(request.url);
  
    
  if (searchParams.size === 0) {
    try {

   

    // 1. Validation: Ensure we are fetching products for a specific shop
    if (!shopId) {
      return NextResponse.json(
        { error: 'shopId is required' },
        { status: 400 }
      );
    }
    // 2. Fetch products with relations
    const products = await prisma.product.findMany({
      where: {
        shopId: shopId,
        isActive: true, // Optional: only get active products
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
          select:{
            name:true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(products);


    
   } catch (error) {
    console.log("hi")
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
   }
  }


  // filter section 

try {

    const categoryId = searchParams.get("categoryId");
    const brandId = searchParams.get("brandId");

    const search = searchParams.get("search");

    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    const lowStock = searchParams.get("lowStock");
    const outOfStock:number = Number(searchParams.get("outOfStock"));
    const inStock = searchParams.get("inStock");

    const profitable = searchParams.get("profitable");
    const demanding:number = Number(searchParams.get("demanding"));
    const startTime = new Date(searchParams.get("startDate")!);
    const endTime = new Date(searchParams.get("endDate")!);
    // active product

    const sort = searchParams.get("sort");

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const skip = (page - 1) * limit;

    // ==========================
    // WHERE FILTER
    // ==========================


        let demandedProducts:any = [];

    if (demanding === 1 || demanding === 0) {

      const order = demanding === 1 ? "desc" : "asc";

        demandedProducts = await getMostDemandedProducts(
        shopId,
        startTime,
        endTime,
        limit,
        order

      );
      
    }

    let outOfStockProduct:any = [];

    if (outOfStock === 1 || outOfStock === 0) {

      outOfStockProduct = await getOutOfStockProducts(shopId)
      
    }


    
    console.log(demandedProducts)
    const result:any = [demandedProducts,outOfStockProduct]
    return NextResponse.json(result);
    
  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );

  }
  




   
    
}





export async function POST(req:Request) {

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
    const {name,
      sku,
      barcode,
      description,
      categoryId,
      unitId,
      imageUrl,
      valuationMethod,
      lowStockThreshold,
      isActive,
      brandId} = body;

      // 2. Validate required fields based on your Prisma schema
    if (!name || !sku || !categoryId || !unitId || !shopId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, sku, categoryId, unitId, or shopId' },
        { status: 400 }
      );
    }

    // 3. Optional: Check if a product with the same SKU already exists to provide a friendly error
    const existingProduct = await prisma.product.findUnique({
      where: { sku },
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'A product with this SKU already exists' },
        { status: 409 } // 409 Conflict
      );
    }

    // 4. Create the product in the database
    const newProduct = await prisma.product.create({
      data: {
        name,
        sku,
        lowStockThreshold,
        barcode: barcode || null,
        description: description || null,
        imageUrl,
        categoryId: parseInt(categoryId),
        brandId: parseInt(brandId),
        unitId: parseInt(unitId),
        shopId: shopId,
        // Use provided values or fallback to Prisma schema defaults
        valuationMethod: valuationMethod !== undefined ? parseInt(valuationMethod) : 0, 
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    // 5. Return the newly created product
    return NextResponse.json(newProduct, { status: 201 }); // 201 Created

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }

    
  
  
}


// update product 

export async function PUT(req: Request) {
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
    const {
      id, // Required to know which product to update
      name,
      sku,
      barcode,
      description,
      categoryId,
      unitId,
      imageUrl,
      valuationMethod,
      lowStockThreshold,
      isActive,
      brandId
    } = body;

    // 1. Validation: Ensure product ID is provided
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    // 2. Verify if the product actually exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // 3. SKU Conflict Check: If SKU is changing, make sure it's not taken by another product
    if (sku && sku !== existingProduct.sku) {
      const skuConflict = await prisma.product.findUnique({
        where: { sku },
      });

      if (skuConflict) {
        return NextResponse.json(
          { error: 'A product with this SKU already exists' },
          { status: 409 } // 409 Conflict
        );
      }
    }

    // 4. Update the product
    // Using 'undefined' for missing fields tells Prisma to leave them unchanged
    const updatedProduct = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name: name !== undefined ? name : undefined,
        sku: sku !== undefined ? sku : undefined,
        lowStockThreshold: lowStockThreshold !== undefined ? parseInt(lowStockThreshold) : undefined,
        barcode: barcode !== undefined ? (barcode || null) : undefined,
        description: description !== undefined ? (description || null) : undefined,
        imageUrl: imageUrl !== undefined ? imageUrl : undefined,
        categoryId: categoryId !== undefined ? parseInt(categoryId) : undefined,
        brandId: brandId !== undefined ? parseInt(brandId) : undefined,
        unitId: unitId !== undefined ? parseInt(unitId) : undefined,
        shopId: shopId !== undefined ? shopId : undefined,
        valuationMethod: valuationMethod !== undefined ? parseInt(valuationMethod) : undefined,
        isActive: isActive !== undefined ? isActive : undefined,
      },
    });

    // 5. Return the updated product
    return NextResponse.json(updatedProduct, { status: 200 });

  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // 1. Validation: Ensure product ID is provided in the URL query params
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required query parameter: id' },
        { status: 400 }
      );
    }

    const productId = parseInt(id);

    // 2. Verify if the product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // 3. Delete the product
    await prisma.product.delete({
      where: { id: productId },
    });

    return NextResponse.json(
      { message: 'Product deleted successfully' }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Error deleting product:', error);

    // Prisma error code P2003 indicates a foreign key constraint violation
    // (e.g., you are trying to delete a product that is referenced by inventory batches or order items)
    if (error.code === 'P2003') {
      return NextResponse.json(
        { 
          error: 'Cannot hard-delete this product because it is linked to other records (like batches or transactions). Use a PUT request to set isActive to false instead.' 
        },
        { status: 409 } // 409 Conflict
      );
    }

    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}