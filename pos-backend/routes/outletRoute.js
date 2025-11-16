import express from "express";
import prisma from "../config/prismaConfig.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const outlets = await prisma.outlets.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: outlets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
