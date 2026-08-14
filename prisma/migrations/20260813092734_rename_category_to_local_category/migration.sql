/*
  Warnings:

  - You are about to drop the `Category` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Category" DROP CONSTRAINT "Category_shopId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_categoryId_fkey";



ALTER TABLE "Category" RENAME TO "LocalCategory";

-- CreateIndex
CREATE UNIQUE INDEX "LocalCategory_name_shopId_key" ON "LocalCategory"("name", "shopId");

-- AddForeignKey
ALTER TABLE "LocalCategory" ADD CONSTRAINT "LocalCategory_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "LocalCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
