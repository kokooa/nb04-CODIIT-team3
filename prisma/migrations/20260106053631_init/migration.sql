/*
  Warnings:

  - The values [BRONZE,SILVER,GOLD,PLATINUM] on the enum `UserGrade` will be removed. If these variants are still used in the database, this will fail.
  - The primary key for the `CartItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `FavoriteStore` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Inquiry` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `hasAnswer` on the `Inquiry` table. All the data in the column will be lost.
  - The primary key for the `Order` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `OrderItem` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Product` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `mainImageUrl` on the `Product` table. All the data in the column will be lost.
  - The primary key for the `ProductStock` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Review` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Store` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `description` on the `Store` table. All the data in the column will be lost.
  - You are about to drop the column `storeImageUrl` on the `Store` table. All the data in the column will be lost.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `nickname` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `profileImageUrl` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `role` on the `User` table. All the data in the column will be lost.
  - The primary key for the `UserPoint` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `currentPoints` on the `UserPoint` table. All the data in the column will be lost.
  - You are about to drop the `InquiryAnswer` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[name]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `image` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Added the required column `detailAddress` to the `Store` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "UserGrade_new" AS ENUM ('Green', 'Orange', 'Red', 'Black', 'VIP');
ALTER TABLE "public"."UserPoint" ALTER COLUMN "grade" DROP DEFAULT;
ALTER TABLE "UserPoint" ALTER COLUMN "grade" TYPE "UserGrade_new" USING ("grade"::text::"UserGrade_new");
ALTER TYPE "UserGrade" RENAME TO "UserGrade_old";
ALTER TYPE "UserGrade_new" RENAME TO "UserGrade";
DROP TYPE "public"."UserGrade_old";
ALTER TABLE "UserPoint" ALTER COLUMN "grade" SET DEFAULT 'Green';
COMMIT;

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_userId_fkey";

-- DropForeignKey
ALTER TABLE "FavoriteStore" DROP CONSTRAINT "FavoriteStore_storeId_fkey";

-- DropForeignKey
ALTER TABLE "FavoriteStore" DROP CONSTRAINT "FavoriteStore_userId_fkey";

-- DropForeignKey
ALTER TABLE "Inquiry" DROP CONSTRAINT "Inquiry_productId_fkey";

-- DropForeignKey
ALTER TABLE "Inquiry" DROP CONSTRAINT "Inquiry_userId_fkey";

-- DropForeignKey
ALTER TABLE "InquiryAnswer" DROP CONSTRAINT "InquiryAnswer_inquiryId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_productId_fkey";

-- DropForeignKey
ALTER TABLE "Product" DROP CONSTRAINT "Product_storeId_fkey";

-- DropForeignKey
ALTER TABLE "ProductStock" DROP CONSTRAINT "ProductStock_productId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_orderItemId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_productId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropForeignKey
ALTER TABLE "Store" DROP CONSTRAINT "Store_sellerId_fkey";

-- DropForeignKey
ALTER TABLE "UserPoint" DROP CONSTRAINT "UserPoint_userId_fkey";

-- DropIndex
DROP INDEX "User_nickname_key";

-- AlterTable
ALTER TABLE "CartItem" DROP CONSTRAINT "CartItem_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "productId" SET DATA TYPE TEXT,
ADD CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "CartItem_id_seq";

-- AlterTable
ALTER TABLE "FavoriteStore" DROP CONSTRAINT "FavoriteStore_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "storeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "FavoriteStore_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "FavoriteStore_id_seq";

-- AlterTable
ALTER TABLE "Inquiry" DROP CONSTRAINT "Inquiry_pkey",
DROP COLUMN "hasAnswer",
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'WaitingAnswer',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "productId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Inquiry_id_seq";

-- AlterTable
ALTER TABLE "Order" DROP CONSTRAINT "Order_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Order_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Order_id_seq";

-- AlterTable
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "orderId" SET DATA TYPE TEXT,
ALTER COLUMN "productId" SET DATA TYPE TEXT,
ADD CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "OrderItem_id_seq";

-- AlterTable
ALTER TABLE "Product" DROP CONSTRAINT "Product_pkey",
DROP COLUMN "mainImageUrl",
ADD COLUMN     "image" TEXT NOT NULL,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "storeId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Product_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Product_id_seq";

-- AlterTable
ALTER TABLE "ProductStock" DROP CONSTRAINT "ProductStock_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "productId" SET DATA TYPE TEXT,
ADD CONSTRAINT "ProductStock_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "ProductStock_id_seq";

-- AlterTable
ALTER TABLE "Review" DROP CONSTRAINT "Review_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "productId" SET DATA TYPE TEXT,
ALTER COLUMN "orderItemId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Review_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Review_id_seq";

-- AlterTable
ALTER TABLE "Store" DROP CONSTRAINT "Store_pkey",
DROP COLUMN "description",
DROP COLUMN "storeImageUrl",
ADD COLUMN     "content" TEXT,
ADD COLUMN     "detailAddress" TEXT NOT NULL,
ADD COLUMN     "image" TEXT,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "sellerId" SET DATA TYPE TEXT,
ADD CONSTRAINT "Store_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Store_id_seq";

-- AlterTable
ALTER TABLE "User" DROP CONSTRAINT "User_pkey",
DROP COLUMN "nickname",
DROP COLUMN "profileImageUrl",
DROP COLUMN "role",
ADD COLUMN     "image" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "type" "UserRole" NOT NULL DEFAULT 'BUYER',
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "User_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "User_id_seq";

-- AlterTable
ALTER TABLE "UserPoint" DROP CONSTRAINT "UserPoint_pkey",
DROP COLUMN "currentPoints",
ADD COLUMN     "points" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "userId" SET DATA TYPE TEXT,
ALTER COLUMN "grade" SET DEFAULT 'Green',
ADD CONSTRAINT "UserPoint_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "UserPoint_id_seq";

-- DropTable
DROP TABLE "InquiryAnswer";

-- CreateTable
CREATE TABLE "InquiryReply" (
    "id" TEXT NOT NULL,
    "inquiryId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InquiryReply_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InquiryReply_inquiryId_key" ON "InquiryReply"("inquiryId");

-- CreateIndex
CREATE UNIQUE INDEX "User_name_key" ON "User"("name");

-- AddForeignKey
ALTER TABLE "Store" ADD CONSTRAINT "Store_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductStock" ADD CONSTRAINT "ProductStock_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryReply" ADD CONSTRAINT "InquiryReply_inquiryId_fkey" FOREIGN KEY ("inquiryId") REFERENCES "Inquiry"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InquiryReply" ADD CONSTRAINT "InquiryReply_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPoint" ADD CONSTRAINT "UserPoint_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteStore" ADD CONSTRAINT "FavoriteStore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoriteStore" ADD CONSTRAINT "FavoriteStore_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
