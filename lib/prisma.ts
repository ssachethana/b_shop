import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const connectionString = process.env.DIRECT_URL!;

// Define our global types to cache both the PrismaClient AND the Pool
const globalForPrisma = global as unknown as { 
  prisma: PrismaClient;
  pool: Pool;
};

// 1. Initialize or retrieve the pg.Pool
const pool = globalForPrisma.pool || new Pool({ connectionString });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pool = pool;
}

// 2. Initialize or retrieve the Prisma Client using the adapter
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({ adapter: new PrismaPg(pool) });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export default prisma;