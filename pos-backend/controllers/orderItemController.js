// controllers/orderItemController.js
import prisma from "../config/prismaConfig.js";
import createHttpError from "http-errors";
import { recalcCustomerTotals } from "../utils/billingUtils.js";

// ➕ Add Order Item
export const addOrderItem = async (req, res, next) => {
  try {
    const { transactionId, menuId, qty } = req.body;

    if (!transactionId) return next(createHttpError(400, "transactionId is required"));
    if (!menuId) return next(createHttpError(400, "menuId is required"));
    if (!qty) return next(createHttpError(400, "qty is required"));

    const trx = await prisma.transactions.findUnique({ where: { id: transactionId } });
    if (!trx) return next(createHttpError(404, "Transaction not found"));

    const menu = await prisma.menu_items.findUnique({ where: { id: menuId } });
    if (!menu || menu.basePrice == null) {
      return next(createHttpError(400, "Invalid menu item or basePrice is null"));
    }

    const price = Number(menu.basePrice);
    const subtotal = price * Number(qty);

    const item = await prisma.order_items.create({
      data: {
        transactionId,
        menuId,
        qty: Number(qty),
        price,
        subtotal,
      },
      include: {
        menu_items: true,
      },
    });

    const totals = await recalcCustomerTotals(trx.customerId);

    res.status(201).json({
      success: true,
      message: "Order item added",
      data: { item, totals },
    });
  } catch (error) {
    console.error("❌ addOrderItem error:", error);
    next(error);
  }
};

// ✏️ Update order item (qty)
export const updateOrderItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { qty } = req.body;

    if (!qty) return next(createHttpError(400, "qty is required"));

    const item = await prisma.order_items.findUnique({
      where: { id },
      include: { transactions: true },
    });

    if (!item) return next(createHttpError(404, "Order item not found"));

    const price = Number(item.price);
    const subtotal = price * Number(qty);

    const updated = await prisma.order_items.update({
      where: { id },
      data: {
        qty: Number(qty),
        subtotal,
      },
      include: {
        menu_items: true,
      },
    });

    const totals = await recalcCustomerTotals(item.transactions.customerId);

    res.json({
      success: true,
      message: "Order item updated",
      data: { item: updated, totals },
    });
  } catch (error) {
    console.error("❌ updateOrderItem error:", error);
    next(error);
  }
};

// ❌ Delete order item
export const deleteOrderItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await prisma.order_items.findUnique({
      where: { id },
      include: { transactions: true },
    });

    if (!item) return next(createHttpError(404, "Order item not found"));

    await prisma.order_items.delete({ where: { id } });

    const totals = await recalcCustomerTotals(item.transactions.customerId);

    res.json({
      success: true,
      message: "Order item deleted",
      data: totals,
    });
  } catch (error) {
    next(error);
  }
};

// 📌 Get items per transaction
export const getOrderItemsByTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.params;

    const items = await prisma.order_items.findMany({
      where: { transactionId },
      include: { menu_items: true },
      orderBy: { id: "asc" },
    });

    res.json({ success: true, data: items });
  } catch (error) {
    next(error);
  }
};
