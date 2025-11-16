import express from "express";
import { createVA, vaCallback } from "../controllers/paymentController.js";
import { getOrderById as getOrder } from "../controllers/orderController.js";
import prisma from "../config/prismaConfig.js";

const router = express.Router();

router.post("/create-va", createVA);
router.get("/order/:orderId", getOrder);

router.post("/callback/va", vaCallback);

router.get("/transactions", async (req, res) => {
  try {
    const data = await prisma.orders.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
