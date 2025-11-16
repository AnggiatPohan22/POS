import prisma from "../config/prismaConfig.js";
import createHttpError from "http-errors";

// type code mapping
const typeCodeMap = {
  "Dine-In": "DI",
  "Take-Away": "TA",
  "Delivery": "DL",
  "Room": "RC",
};

// Generate unique Bill Number with retry if duplicate
async function generateBillNumber(orderType, outlet) {
  const outletData = await prisma.outlets.findUnique({ where: { id: outlet } });
  if (!outletData) throw createHttpError(400, "Invalid outlet");

  const typeCode = typeCodeMap[orderType] || "XX";
  const outletCode = outletData.code;
  const yearMonth = new Date().toISOString().slice(2, 7).replace("-", "");

  let billNumber;
  let exists = true;
  let attempt = 1;

  while (exists) {
    const count = await prisma.orders.count({ where: { outlet, orderType } });
    billNumber = `${outletCode}-${typeCode}-${yearMonth}-${String(count + attempt).padStart(4, "0")}`;
    exists = await prisma.orders.findUnique({ where: { billNumber } });
    attempt++;
  }

  return billNumber;
}

// ➕ CREATE ORDER
export const addOrder = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      guests,
      items = [],
      total,
      tax,
      totalWithTax,
      table,
      orderType,
      outlet,
    } = req.body;

    if (!customerName || !customerPhone) return next(createHttpError(400, "Customer name & phone required"));
    if (!outlet) return next(createHttpError(400, "Outlet required"));

    const billNumber = await generateBillNumber(orderType, outlet);
    const now = new Date();
    const orderDateFormatted = now.toLocaleString("id-ID", {
      timeZone: "Asia/Makassar",
      hour12: false,
    });

    const newOrder = await prisma.orders.create({
      data: {
        billNumber,
        outlet,
        table: table || null,
        orderType,
        customer_name: customerName,
        customer_phone: customerPhone,
        guests: guests ? Number(guests) : null,
        total: Number(total),
        tax: Number(tax),
        totalWithTax: Number(totalWithTax),
        items,
        orderDate: now,
        orderDateFormatted,
        orderStatus: "PENDING",
      },
      include: {
        table_orders_tableTotables: true,
        outlets_orders_outletToutlets: true,
      },
    });

    // Update table status jika dine-in
    if (table) {
      await prisma.tables.update({
        where: { id: table },
        data: {
          status: "Occupied",
          currentOrderId: newOrder.id,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Order created!",
      data: newOrder,
    });
  } catch (error) {
    console.log("❌ addOrder error:", error);
    next(error);
  }
};

// 📌 GET ALL
export const getOrders = async (req, res, next) => {
  try {
    const orders = await prisma.orders.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        table_orders_tableTotables: true,
        outlets_orders_outletToutlets: true,
      },
    });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};

// 🔍 GET ONE
export const getOrderById = async (req, res, next) => {
  try {
    const id = req.params.id;

    const order = await prisma.orders.findUnique({
      where: { id, deletedAt: null },
      include: {
        table_orders_tableTotables: true,
        outlets_orders_outletToutlets: true,
      },
    });

    if (!order) return next(createHttpError(404, "Order not found!"));
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    next(error);
  }
};

// 📝 UPDATE ORDER DETAILS (table move, items, status jne)
export const updateOrder = async (req, res, next) => {
  try {
    const id = req.params.id;
    const {
      orderStatus,
      items,
      guests,
      total,
      tax,
      totalWithTax,
      table, // table change support
    } = req.body;

    const order = await prisma.orders.findUnique({ where: { id } });
    if (!order) return next(createHttpError(404, "Order not found"));

    // Auto release old table when moving
    if (order.table && table && order.table !== table) {
      await prisma.tables.update({
        where: { id: order.table },
        data: { status: "Available", currentOrderId: null },
      });
    }

    // Occupy new table
    if (table) {
      await prisma.tables.update({
        where: { id: table },
        data: { status: "Occupied", currentOrderId: id },
      });
    }

    const updated = await prisma.orders.update({
      where: { id },
      data: {
        orderStatus: orderStatus || order.orderStatus,
        items: items || undefined,
        guests: guests ? Number(guests) : undefined,
        table: table || undefined,
        total: total ? Number(total) : undefined,
        tax: tax ? Number(tax) : undefined,
        totalWithTax: totalWithTax ? Number(totalWithTax) : undefined,
      },
    });

    res.json({ success: true, message: "Order updated", data: updated });
  } catch (error) {
    console.log("❌ updateOrder error:", error);
    next(error);
  }
};

// 🚫 SOFT DELETE ORDER
export const deleteOrder = async (req, res, next) => {
  try {
    const id = req.params.id;

    await prisma.orders.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await prisma.tables.updateMany({
      where: { currentOrderId: id },
      data: { status: "Available", currentOrderId: null },
    });

    res.json({ success: true, message: "Order moved to trash" });
  } catch (error) {
    next(error);
  }
};

// ♻️ RESTORE ORDER
export const restoreOrder = async (req, res, next) => {
  try {
    const id = req.params.id;

    await prisma.orders.update({
      where: { id },
      data: { deletedAt: null },
    });

    res.json({ success: true, message: "Order restored" });
  } catch (error) {
    next(error);
  }
};

// ❌ DELETE PERMANENT
export const forceDeleteOrder = async (req, res, next) => {
  try {
    const id = req.params.id;
    await prisma.orders.delete({ where: { id } });
    res.json({ success: true, message: "Order permanently deleted" });
  } catch (error) {
    next(error);
  }
};
