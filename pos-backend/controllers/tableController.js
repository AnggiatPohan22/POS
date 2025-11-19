import prisma from "../config/prismaConfig.js";
import createHttpError from "http-errors";

// ➕ Create Table
export const addTable = async (req, res) => {
  try {
    const { tableNo, status, seats, outletId } = req.body;

    const newTable = await prisma.tables.create({
      data: { tableNo, status, seats, outletId }
    });

    res.status(201).json({
      status: true,
      message: "Table created successfully",
      data: newTable,
    });
  } catch (error) {
    console.error("❌ Add table error:", error);
    res.status(500).json({ status: false, message: "Failed to create table", error: error.message });
  }
};

// 📌 Get All Tables + Status + Current Customer Initials
export const getTables = async (req, res) => {
  try {
    const { outletId } = req.query;

    const tables = await prisma.tables.findMany({
      where: outletId ? { outletId } : {},
      include: {
        orders: {
          where: {
            // order aktif = belum dihapus & belum dibayar
            deletedAt: null,
            orderStatus: {
              in: ["Pending", "ACTIVE", "IN_PROGRESS"] // sesuaikan sama enum/status yang kamu pakai
            }
          },
          include: {
            customers: true
          },
          orderBy: { orderDate: "desc" },
          take: 1
        }
      },
      orderBy: { tableNo: "asc" }
    });

    const formatted = tables.map((t) => {
      const activeOrder = t.orders[0] || null;
      const customerName = activeOrder?.customers?.customerName || null;

      return {
        id: t.id,
        tableNo: t.tableNo,
        seats: t.seats,
        status: activeOrder ? "OCCUPIED" : "AVAILABLE",
        currentCustomer: customerName
      };
    });

    res.status(200).json({
      status: true,
      message: "Tables fetched successfully",
      data: formatted,
    });

  } catch (error) {
    console.error("❌ Get tables error:", error);
    res.status(500).json({
      status: false,
      message: "Failed to fetch tables",
      error: error.message
    });
  }
};


export const getTablesWithStatus = async (req, res) => {
  try {
    const tables = await prisma.tables.findMany({
      include: {
        orders: {
          where: {
            deletedAt: null,
            orderStatus: { in: ["Pending", "ACTIVE"] } // sesuaikan lagi sama value di DB
          },
          select: {
            customers: {
              select: { customerName: true }
            }
          },
          take: 1,
          orderBy: { orderDate: "desc" }
        }
      },
      orderBy: { tableNo: "asc" }
    });

    const formatted = tables.map(t => ({
      id: t.id,
      tableNo: t.tableNo,
      seats: t.seats,
      isBooked: t.orders.length > 0,
      currentCustomer: t.orders[0]?.customers?.customerName || null
    }));

    res.status(200).json({ success: true, data: formatted });
  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// 📝 Update Table
export const updateTable = async (req, res) => {
  try {
    const { id } = req.params;
    const { tableNo, status, seats, outletId } = req.body;

    const updatedTable = await prisma.tables.update({
      where: { id },
      data: { tableNo, status, seats, outletId },
    });

    res.status(200).json({
      status: true,
      message: "Table updated successfully",
      data: updatedTable,
    });
  } catch (error) {
    console.error("❌ Update table error:", error);
    res.status(500).json({ status: false, message: "Failed to update table", error: error.message });
  }
};

// ❌ Delete Table
export const deleteTable = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.tables.delete({
      where: { id },
    });

    res.status(200).json({
      status: true,
      message: "Table deleted successfully",
    });
  } catch (error) {
    console.error("❌ Delete table error:", error);
    res.status(500).json({ status: false, message: "Failed to delete table", error: error.message });
  }
};

// === BULK INSERT TABLES === //
export const bulkInsertTables = async (req, res, next) => {
  try {
    if (!Array.isArray(req.body)) {
      return next(createHttpError(400, "Invalid data format. Must be an array."));
    }

    const result = await prisma.tables.createMany({
      data: req.body,
      skipDuplicates: true // avoid inserting same tableNo twice
    });

    res.status(201).json({
      success: true,
      inserted: result.count,
      message: "Tables inserted successfully"
    });
  } catch (error) {
    console.log("❌ Bulk Insert Error:", error);
    next(error);
  }
};
