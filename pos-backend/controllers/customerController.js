// controllers/customerController.js
import prisma from "../config/prismaConfig.js";
import createHttpError from "http-errors";
import { generateBillNumber } from "../utils/billingUtils.js";
import { formatWithOutletTimezone } from "../utils/dateUtils.js";

// ➕ Create Customer (Bill Utama)
export const createCustomer = async (req, res, next) => {
  try {
    const { customerName, phone, guests, outletId, orderType } = req.body;

    if (!customerName) return next(createHttpError(400, "customerName is required"));
    if (!outletId) return next(createHttpError(400, "outletId is required"));
    if (!orderType) return next(createHttpError(400, "orderType is required"));

    const billNumber = await generateBillNumber(outletId, orderType);

    const customer = await prisma.customers.create({
      data: {
        billNumber,
        customerName,
        phone: phone || null,
        guests: guests ? Number(guests) : null,
        // outletId tidak ada di model customers (sesuai schema kamu),
        // jadi info outlet diwakili di transactions
      },
    });

    res.status(201).json({
      success: true,
      message: "Customer (bill) created",
      data: customer,
    });
  } catch (error) {
    console.error("❌ createCustomer error:", error);
    next(error);
  }
};

// 📌 Get Customers (opsional filter status)
export const getCustomers = async (req, res, next) => {
  try {
    const { status } = req.query;

    const customers = await prisma.customers.findMany({
      where: {
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: customers });
  } catch (error) {
    next(error);
  }
};

// 🔍 Get Customer by ID (include transaksi + items)
export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const customer = await prisma.customers.findUnique({
      where: { id },
      include: {
        transactions: {
          include: { outlets: true, tables: true, order_items: true }
        },
        payment_logs: true,
      },
    });

    if (!customer) return next(createHttpError(404, "Customer not found"));

    let outletTimezoneFormat = async (date) => date;

    if (customer.transactions.length > 0) {
      const outletId = customer.transactions[0].outletId;
      outletTimezoneFormat = async (date) =>
        date ? await formatWithOutletTimezone(date, outletId) : null;
    }

    const formattedCustomer = {
      ...customer,
      createdAt: await outletTimezoneFormat(customer.createdAt),
      paidAt: await outletTimezoneFormat(customer.paidAt),
    };

    res.json({ success: true, data: formattedCustomer });
  } catch (error) {
    next(error);
  }
};

// 📝 Update Status Customer (PENDING / PAID / CANCELLED)
export const updateCustomerStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) return next(createHttpError(400, "status is required"));

    const existing = await prisma.customers.findUnique({ where: { id } });
    if (!existing) return next(createHttpError(404, "Customer not found"));

    const data = { status };

    if (status === "PAID") {
      data.paidAt = new Date();
    }

    const updated = await prisma.customers.update({
      where: { id },
      data,
    });

    res.json({
      success: true,
      message: "Customer status updated",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

