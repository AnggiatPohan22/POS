import express from "express";
import {
  addOrderItem,
  updateOrderItem,
  deleteOrderItem,
  getOrderItemsByTransaction,
} from "../controllers/orderItemController.js";

const router = express.Router();

router.get("/:transactionId", getOrderItemsByTransaction);
router.post("/", addOrderItem);
router.put("/:id", updateOrderItem);
router.delete("/:id", deleteOrderItem);

export default router;
