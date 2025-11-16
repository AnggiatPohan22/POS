// controllers/transactionController.js
import prisma from "../config/prismaConfig.js";
import createHttpError from "http-errors";
import { recalcCustomerTotals } from "../utils/billingUtils.js";

// ➕ Create Transaction (per meja / outlet)
export const createTransaction = async (req, res, next) => {
  try {
    const { customerId, outletId, tableId, orderType } = req.body;

    if (!customerId) return next(createHttpError(400, "customerId is required"));
    if (!outletId) return next(createHttpError(400, "outletId is required"));

    const customer = await prisma.customers.findUnique({ where: { id: customerId } });
    if (!customer) return next(createHttpError(404, "Customer not found"));

    // ⚠️ Rule A: meja tidak boleh dipakai kalau sudah ada order aktif
    if (tableId) {
      const table = await prisma.tables.findUnique({
        where: { id: tableId },
      });

      if (!table) return next(createHttpError(404, "Table not found"));

      if (table.currentOrderId) {
        return next(createHttpError(400, "Table already has active order"));
      }
    }

    const trx = await prisma.transactions.create({
      data: {
        customerId,
        outletId,
        tableId: tableId || null,
        orderType: orderType || "DINE_IN", // tapi di schema String, ini cuma default value
        status: "PENDING",
      },
      include: {
        tables: true,
        outlets: true,
      },
    });

    // update status meja
    if (tableId) {
      await prisma.tables.update({
        where: { id: tableId },
        data: {
          status: "Dine-in",
          currentOrderId: trx.id,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Transaction created",
      data: trx,
    });
  } catch (error) {
    console.error("❌ createTransaction error:", error);
    next(error);
  }
};

// 📌 Get Transactions (filter optional)
export const getTransactions = async (req, res, next) => {
  try {
    const { outletId, customerId, status } = req.query;

    const trxs = await prisma.transactions.findMany({
      where: {
        ...(outletId ? { outletId } : {}),
        ...(customerId ? { customerId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        customers: true,
        tables: true,
        outlets: true,
        order_items: {
          include: { menu_items: true },
        },
      },
    });

    res.json({ success: true, data: trxs });
  } catch (error) {
    next(error);
  }
};

// 🔍 Get Transaction by ID
export const getTransactionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trx = await prisma.transactions.findUnique({
      where: { id },
      include: {
        customers: true,
        tables: true,
        outlets: true,
        order_items: {
          include: { menu_items: true },
        },
      },
    });

    if (!trx) return next(createHttpError(404, "Transaction not found"));

    res.json({ success: true, data: trx });
  } catch (error) {
    next(error);
  }
};

// 📝 Update Transaction (status, pindah meja)
export const updateTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, tableId } = req.body;

    const trx = await prisma.transactions.findUnique({
      where: { id },
    });

    if (!trx) return next(createHttpError(404, "Transaction not found"));

    // handle pindah meja
    if (trx.tableId && tableId && trx.tableId !== tableId) {
      // release meja lama
      await prisma.tables.update({
        where: { id: trx.tableId },
        data: {
          status: "Available",
          currentOrderId: null,
        },
      });

      // cek meja baru belum dipakai
      const newTable = await prisma.tables.findUnique({ where: { id: tableId } });
      if (!newTable) return next(createHttpError(404, "New table not found"));
      if (newTable.currentOrderId) {
        return next(createHttpError(400, "New table already has active order"));
      }

      // occupy meja baru
      await prisma.tables.update({
        where: { id: tableId },
        data: {
          status: "Dine-in",
          currentOrderId: id,
        },
      });
    }

    const updated = await prisma.transactions.update({
      where: { id },
      data: {
        status: status || trx.status,
        tableId: tableId || trx.tableId,
      },
    });

    // jika transaksi selesai → bebaskan meja
    if (status === "PAID" || status === "CANCELLED") {
      if (updated.tableId) {
        await prisma.tables.update({
          where: { id: updated.tableId },
          data: {
            status: "Available",
            currentOrderId: null,
          },
        });
      }
    }

    // kalau status PAID → cek apakah semua transaksi customer sudah selesai
    if (status === "PAID") {
      const pendingCount = await prisma.transactions.count({
        where: {
          customerId: updated.customerId,
          status: { in: ["PENDING", "IN_PROGRESS"] },
        },
      });

      if (pendingCount === 0) {
        await prisma.customers.update({
          where: { id: updated.customerId },
          data: { status: "PAID" },
        });
      }

      await recalcCustomerTotals(updated.customerId);
    }

    res.json({
      success: true,
      message: "Transaction updated",
      data: updated,
    });
  } catch (error) {
    console.error("❌ updateTransaction error:", error);
    next(error);
  }
};

// ❌ Delete Transaction (release table + recalc totals)
export const deleteTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;

    const trx = await prisma.transactions.findUnique({
      where: { id },
      include: { order_items: true },
    });

    if (!trx) return next(createHttpError(404, "Transaction not found"));

    // release meja
    if (trx.tableId) {
      await prisma.tables.update({
        where: { id: trx.tableId },
        data: {
          status: "Available",
          currentOrderId: null,
        },
      });
    }

    // hapus items
    await prisma.order_items.deleteMany({
      where: { transactionId: id },
    });

    // hapus transaksi
    await prisma.transactions.delete({ where: { id } });

    // recalc total customer
    await recalcCustomerTotals(trx.customerId);

    res.json({
      success: true,
      message: "Transaction deleted",
    });
  } catch (error) {
    next(error);
  }
};
