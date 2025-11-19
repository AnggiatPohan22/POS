import { OrderStatus } from "@prisma/client";
import prisma from "../config/prismaConfig.js";
import createHttpError from "http-errors";

// === Generate Bill Number Berdasarkan Outlet + Type Order === //
const typeCodeMap = {
  "Dine-In": "DI",
  "Take-Away": "TA",
  "Delivery": "DL",
  "Room": "RC",
};

async function generateBillNumber(orderType, outletId) {
  const outletData = await prisma.outlets.findUnique({ where: { id: outletId } });
  if (!outletData) throw createHttpError(400, "Invalid Outlet");

  const typeCode = typeCodeMap[orderType] || "XX";
  const outletCode = outletData.code;
  const yearMonth = new Date().toISOString().slice(2, 7).replace("-", "");

  let billNumber;
  let exists = true;
  let attempt = 1;

  while (exists) {
    const count = await prisma.orders.count({ where: { outletId, orderType } });
    billNumber = `${outletCode}-${typeCode}-${yearMonth}-${String(count + attempt).padStart(4, "0")}`;
    exists = await prisma.orders.findUnique({ where: { billNumber } });
    attempt++;
  }

  return billNumber;
}

// === CREATE ORDER WITH RELATIONAL ORDER ITEMS === //
export const addOrder = async (req, res, next) => {
  try {
    const {
      customerId,
      outletId,
      tableId,
      orderType,
      guests = 1,
      items = [],
      total = 0,
      tax = 0,
      serviceCharge = 0,
      totalPayment = 0,
    } = req.body;

    if (!customerId || !outletId) {
      return next(createHttpError(400, "Customer & Outlet required"));
    }

    if (!Array.isArray(items)) {
      return next(createHttpError(400, "Items must be array"));
    }

    console.log("🟡 Received items:", items);

    const billNumber = await generateBillNumber(orderType, outletId);

    // 1️⃣ Save Order Header
    const order = await prisma.orders.create({
      data: {
        billNumber,
        orderType,
        guests: Number(guests),
        total: Number(total),
        tax: Number(tax),
        serviceCharge: Number(serviceCharge),
        totalPayment: Number(totalPayment),
        customerId,
        outletId,
        tableId: tableId || null,
      },
    });

    // 2️⃣ Validate & Insert Order Items
    if (items.length > 0) {
      const mapData = items.map((item) => {
        if (!item.menuId) {
          console.error("❌ Invalid item – missing menuId", item);
          throw createHttpError(400, "Each item must include menuId");
        }
        const qty = Number(item.qty) || 1;
        const price = Number(item.price) || 0;
        return {
          orderId: order.id,
          menuId: item.menuId,
          qty,
          price,
          subtotal: qty * price,
        };
      });

      await prisma.order_items.createMany({ data: mapData });
      console.log("🟢 Order Items Saved:", mapData.length);
    }

    // 3️⃣ Update Table Status
    if (tableId) {
      await prisma.tables.update({
        where: { id: tableId },
        data: { status: "OCCUPIED", currentOrderId: order.id },
      });
    }

    // 4️⃣ Response FULL Data
    const completeOrder = await prisma.orders.findUnique({
      where: { id: order.id },
      include: {
        customers: true,
        outlets: true,
        tables: true,
        orderItems: {
          include: { menuItems: true }, // FIXED
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: completeOrder,
    });
  } catch (error) {
    console.log("❌ addOrder error:", error);
    next(error);
  }
};




// === GET ALL ORDERS === //
export const getOrders = async (req, res, next) => {
  try {
    const orders = await prisma.orders.findMany({
      where: { deletedAt: null },
      include: {
        customers: true,
        tables: true,
        outlets: true,
        orderItems: {
          include: {
            menuItems: true
          }
        }
      },
      orderBy: { orderDate: "desc" }
    });

    res.json({ success: true, data: orders });
  } catch (error) {
    next(error);
  }
};


// === GET ORDER BY ID === //
export const getOrderById = async (req, res, next) => {
  try {
    const id = req.params.id;

    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        customers: true,
        tables: true,
        outlets: true
      }
    });

    if (!order) return next(createHttpError(404, "Order not found"));
    res.status(200).json({ success: true, data: order });

  } catch (error) {
    next(error);
  }
};

// === UPDATE ORDER (HEADER + ITEMS) === //
export const updateOrder = async (req, res, next) => {
  try {
    const id = req.params.id;

    // Ambil semua field yg mungkin dikirim
    const {
      orderStatus,
      guests,
      tableId,
      total,
      tax,
      serviceCharge,
      totalPayment,
      items, // 👈 penting: ini harus array
    } = req.body;

    console.log("🟡 [updateOrder] ID:", id);
    console.log("🟡 [updateOrder] BODY:", req.body);

    const existingOrder = await prisma.orders.findUnique({ where: { id } });
    if (!existingOrder) return next(createHttpError(404, "Order not found"));

    // 🧾 Jalankan dalam transaction biar aman
    const updated = await prisma.$transaction(async (tx) => {
      // 1️⃣ kalau ada ITEMS → sinkron ke order_items
      if (Array.isArray(items) && items.length > 0) {
        console.log("🟡 [updateOrder] items received:", items.length);

        // Hapus dulu item lama
        const delRes = await tx.order_items.deleteMany({
          where: { orderId: id },
        });
        console.log("🧹 [updateOrder] deleted old items:", delRes.count);

        // Map data buat insert
        const orderItemsData = items.map((item, idx) => {
          const qty = Number(item.qty || item.quantity || 0);
          const price = Number(item.price || 0);
          const subtotal =
            item.subtotal !== undefined
              ? Number(item.subtotal)
              : qty * price;

          if (!item.menuId) {
            console.log("❌ [updateOrder] item missing menuId at index", idx, item);
            throw createHttpError(400, "Item is missing menuId");
          }

          return {
            orderId: id,
            menuId: item.menuId,
            qty,
            price,
            subtotal,
          };
        });

        console.log("📝 [updateOrder] inserting items:", orderItemsData);

        const createRes = await tx.order_items.createMany({
          data: orderItemsData,
        });
        console.log("✅ [updateOrder] inserted items count:", createRes.count);
      } else {
        console.log("ℹ️ [updateOrder] no items array provided or empty.");
      }

      // 2️⃣ update header order
      return tx.orders.update({
        where: { id },
        data: {
          orderStatus,
          guests: guests ? Number(guests) : undefined,
          tableId: tableId || undefined,
          total: total !== undefined ? Number(total) : undefined,
          tax: tax !== undefined ? Number(tax) : undefined,
          serviceCharge: serviceCharge !== undefined ? Number(serviceCharge) : undefined,
          totalPayment: totalPayment !== undefined ? Number(totalPayment) : undefined,
        },
        include: {
          customers: true,
          tables: true,
          outlets: true,
          orderItems: {
            include: {
              menuItems: true,
            },
          },
        },
      });
    });

    return res.json({
      success: true,
      message: "Order updated (header + items)",
      data: updated,
    });
  } catch (error) {
    console.log("❌ [updateOrder] error:", error);
    next(error);
  }
};




// === SOFT DELETE ORDER === //
export const deleteOrder = async (req, res, next) => {
  try {
    const id = req.params.id;

    await prisma.orders.update({
      where: { id },
      data: { deletedAt: new Date() }
    });

    await prisma.tables.updateMany({
      where: { currentOrderId: id },
      data: { status: "AVAILABLE", currentOrderId: null }
    });

    res.json({ success: true, message: "Order moved to trash" });
  } catch (error) {
    next(error);
  }
};

// === COMPLETE ORDER (MOVE TO TRANSACTIONS) === //
export const completeOrder = async (req, res, next) => {
  try {
    const id = req.params.id;
    const { paymentMethod = "Cash" } = req.body;

    // Ambil order lengkap dengan items & relasi
    const order = await prisma.orders.findUnique({
      where: { id },
      include: {
        customers: true,
        outlets: true,
        tables: true,
        orderItems: {
          include: {
            menuItems: true,
          },
        },
      },
    });

    if (!order) return next(createHttpError(404, "Order not found"));

    // Simpan Transaksi ← Snapshot items untuk histori
    await prisma.transactions.create({
      data: {
        billNumber: order.billNumber,
        totalPayment: order.totalPayment,
        tax: order.tax,
        serviceCharge: order.serviceCharge,
        paymentMethod,
        outletId: order.outletId,
        customerId: order.customerId,
        orderItems: order.orderItems,
      },
    });

    // Hapus detail order_items
    await prisma.order_items.deleteMany({
      where: { orderId: order.id },
    });

    // Free Table jika ada
    if (order.tableId) {
      await prisma.tables.update({
        where: { id: order.tableId },
        data: {
          status: "AVAILABLE",
          currentOrderId: null,
        },
      });
    }

    // Hapus header order
    await prisma.orders.delete({
      where: { id },
    });

    return res.json({
      success: true,
      message: "Order successfully completed and moved to transactions",
    });

  } catch (error) {
    console.log("❌ completeOrder error:", error);
    next(error);
  }
};

