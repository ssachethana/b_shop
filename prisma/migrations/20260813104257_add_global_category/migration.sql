-- AlterTable
ALTER TABLE "LocalCategory" ADD COLUMN     "globalCategoryId" INTEGER;

-- CreateTable
CREATE TABLE "GlobalCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GlobalCategory_name_key" ON "GlobalCategory"("name");

-- CreateIndex
CREATE INDEX "LocalCategory_globalCategoryId_idx" ON "LocalCategory"("globalCategoryId");

-- AddForeignKey
ALTER TABLE "LocalCategory" ADD CONSTRAINT "LocalCategory_globalCategoryId_fkey" FOREIGN KEY ("globalCategoryId") REFERENCES "GlobalCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
