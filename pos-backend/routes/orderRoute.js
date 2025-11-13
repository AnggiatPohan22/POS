import express from "express";
import { addOrder, getOrders, updateOrder, getOrderById } from "../controllers/orderController.js";
import { isVerifiedUser } from "../middlewares/tokenVerification.js";

const router = express.Router();

router.route("/").post(isVerifiedUser, addOrder);
router.route("/").get(isVerifiedUser, getOrders);
router.route("/:id").get(isVerifiedUser, getOrderById);
router.route("/:id").put(isVerifiedUser, updateOrder);

export default router;