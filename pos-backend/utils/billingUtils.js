// utils/billingUtils.js
import prisma from "../config/prismaConfig.js";

const TAX_RATE = 0.11;   // 11%
const SERVICE_RATE = 0.0; // Service A = 0%

const typeCodeMap = {
  "Dine-In": "DI",
  DINE_IN: "DI",
  "Take-Away": "TA",
  TAKE_AWAY: "TA",
  DELIVERY: "DL",
  ROOM: "RC",
};

export async function generateBillNumber(outletId, orderType) {
  const outlet = await prisma.outlets.findUnique({ where: { id: outletId } });
  if (!outlet || !outlet.code) {
    throw new Error("Invalid outlet or outlet code not set");
  }

  const typeCode = typeCodeMap[orderType] || "XX";
  const outletCode = outlet.code;
  const yearMonth = new Date().toISOString().slice(2, 7).replace("-", "");

  const count = await prisma.customers.count({
    where: { /* bisa filter per outlet kalau mau */ },
  });

  const billNumber = `${outletCode}-${typeCode}-${yearMonth}-${String(
    count + 1
  ).padStart(4, "0")}`;

  return billNumber;
}

export async function recalcCustomerTotals(customerId) {
  const transactions = await prisma.transactions.findMany({
    where: { customerId },
    include: { order_items: true },
  });

  let total = 0;

  for (const trx of transactions) {
    for (const item of trx.order_items) {
      total += Number(item.subtotal);
    }
  }

  const tax = total * TAX_RATE;
  const serviceCharge = total * SERVICE_RATE;
  const grandTotal = total + tax + serviceCharge;

  const updated = await prisma.customers.update({
    where: { id: customerId },
    data: {
      total,
      tax,
      serviceCharge,
      grandTotal,
    },
  });

  return {
    total: Number(updated.total),
    tax: Number(updated.tax),
    serviceCharge: Number(updated.serviceCharge),
    grandTotal: Number(updated.grandTotal),
  };
}
