import express from "express";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomerStatus,
} from "../controllers/customerController.js";

const router = express.Router();

router.post("/", createCustomer);
router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.put("/:id/status", updateCustomerStatus);

export default router;
