import express from "express";
import {
  addOrder,
  getOrders,
  updateOrder,
  getOrderById,
  restoreOrder,
  forceDeleteOrder
} from "../controllers/orderController.js";
import prisma from "../config/prismaConfig.js";

const router = express.Router();

// Routes Orders
router.post("/", addOrder);
router.get("/", getOrders);
router.get("/:id", getOrderById);
router.put("/:id", updateOrder);
router.post("/:id/restore", restoreOrder);
router.delete("/:id/force", forceDeleteOrder);


// Check active order by Table ID
router.get("/check/:tableId", async (req, res) => {
  try {
    const { tableId } = req.params;

    const activeOrder = await prisma.orders.findFirst({
      where: {
        table: Number(tableId),
        orderStatus: "PENDING",
      }
    });

    res.json({
      success: true,
      isBooked: !!activeOrder,
    });

  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
