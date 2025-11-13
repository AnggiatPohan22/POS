import express from "express";
import { createVA, vaCallback, getOrder } from "../controllers/paymentController.js";
import Order from "../models/orderModel.js";

const router = express.Router();

// Routes untuk frontend
router.post("/create-va", createVA);
router.get("/order/:orderId", getOrder);

// Route untuk callback Xendit (WEBHOOK)
router.post("/callback/va", vaCallback);

// Route untuk get transactions
router.get("/transactions", async (req, res) => {
    try {
        const data = await Order.find().sort({ createdAt: -1 });
        res.json({ success: true, data });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error" });
    }
});

export default router;