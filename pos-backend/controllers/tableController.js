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

// 📌 Get All Tables (Optional filter by outletId)
export const getTables = async (req, res) => {
  try {
    const { outletId } = req.query;

    const tables = await prisma.tables.findMany({
      where: outletId ? { outletId } : {},
      include: { outlets: true }
    });

    res.status(200).json({
      status: true,
      message: "Tables fetched successfully",
      data: tables,
    });
  } catch (error) {
    console.error("❌ Get tables error:", error);
    res.status(500).json({ status: false, message: "Failed to fetch tables", error: error.message });
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
