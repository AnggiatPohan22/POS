import express from "express";
import Outlet from "../models/outletModel.js";

const router = express.Router();

// Get all outlets
router.get("/", async (req, res) => {
  try {
    const outlets = await Outlet.find({ isActive: true }).sort({ name: 1 });
    res.json({ success: true, data: outlets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
