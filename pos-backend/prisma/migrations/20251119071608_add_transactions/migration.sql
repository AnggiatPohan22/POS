/*
  Warnings:

  - You are about to drop the column `transactionsId` on the `order_items` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `orderType` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `tableId` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `billNumber` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `serviceCharge` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tax` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalPayment` to the `transactions` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "order_items" DROP CONSTRAINT "order_items_transactionsId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_customerId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_outletId_fkey";

-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_tableId_fkey";

-- AlterTable
ALTER TABLE "order_items" DROP COLUMN "transactionsId";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "createdAt",
DROP COLUMN "orderType",
DROP COLUMN "status",
DROP COLUMN "tableId",
ADD COLUMN     "billNumber" TEXT NOT NULL,
ADD COLUMN     "customersId" UUID,
ADD COLUMN     "outletsId" UUID,
ADD COLUMN     "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "paymentMethod" TEXT NOT NULL,
ADD COLUMN     "serviceCharge" DECIMAL(18,2) NOT NULL,
ADD COLUMN     "tablesId" UUID,
ADD COLUMN     "tax" DECIMAL(18,2) NOT NULL,
ADD COLUMN     "totalPayment" DECIMAL(18,2) NOT NULL,
ALTER COLUMN "customerId" DROP NOT NULL,
ALTER COLUMN "customerId" SET DATA TYPE TEXT,
ALTER COLUMN "outletId" DROP NOT NULL,
ALTER COLUMN "outletId" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "transaction_items" (
    "id" UUID NOT NULL,
    "menuName" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "price" DECIMAL(18,2) NOT NULL,
    "subtotal" DECIMAL(18,2) NOT NULL,
    "transactionId" UUID NOT NULL,

    CONSTRAINT "transaction_items_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_outletsId_fkey" FOREIGN KEY ("outletsId") REFERENCES "outlets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_tablesId_fkey" FOREIGN KEY ("tablesId") REFERENCES "tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_customersId_fkey" FOREIGN KEY ("customersId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transaction_items" ADD CONSTRAINT "transaction_items_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
