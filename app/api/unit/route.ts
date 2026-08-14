import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 1. Fetch units from the database
    // 2. Use 'orderBy' on the 'name' field with 'asc' (ascending) for A-Z
    const units = await prisma.unit.findMany({
      orderBy: {
        name: 'asc',
      },
    });

    // Return the sorted list of units
    return NextResponse.json(units, { status: 200 });
    
  } catch (error) {
    console.error('Request error', error);
    return NextResponse.json(
      { error: 'Error fetching units' },
      { status: 500 }
    );
  }
}