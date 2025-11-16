import express from "express";
import { addTable, getTables, updateTable, deleteTable } from "../controllers/tableController.js";
const router = express.Router();

router.post("/", addTable);
router.get("/", getTables);
router.put("/:id", updateTable);
router.delete("/:id", deleteTable);

export default router;
