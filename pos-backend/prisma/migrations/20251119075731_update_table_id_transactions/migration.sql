/*
  Warnings:

  - You are about to drop the column `tablesId` on the `transactions` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_tablesId_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "tablesId",
ADD COLUMN     "tableId" UUID;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;
