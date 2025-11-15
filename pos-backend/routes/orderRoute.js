import express from "express";
import {
  addOrder,
  getOrders,
  updateOrder,
  getOrderById,
} from "../controllers/orderController.js";
//import { isVerifiedUser } from "../middlewares/tokenVerification.js";
import Order from "../models/orderModel.js"; // ✅ Import model untuk cek order aktif

const router = express.Router();

// === ROUTE UTAMA ===
router.route("/").post(/* isVerifiedUser, */ addOrder);
router.route("/").get(/* isVerifiedUser, */ getOrders);
router.route("/:id").get(/* isVerifiedUser, */ getOrderById);
router.route("/:id").put(/* isVerifiedUser, */ updateOrder);

// === ✅ ROUTE TAMBAHAN: CEK STATUS TABLE ===
router.get("/check/:tableId", async (req, res) => {
  try {
    const { tableId } = req.params;

    const activeOrder = await Order.findOne({
      table: tableId,
      orderStatus: "PENDING", // ✔ harus PENDING untuk dianggap masih ditempati
    });

    return res.json({
      success: true,
      isBooked: Boolean(activeOrder),
    });
  } catch (error) {
    console.error("❌ Error checking order:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});


export default router;
