import express from "express";
import { addTable, getTables, updateTable, deleteTable, getTablesWithStatus, bulkInsertTables } from "../controllers/tableController.js";
const router = express.Router();

router.post("/", addTable);
router.get("/", getTables);
router.put("/:id", updateTable);
router.delete("/:id", deleteTable);
router.get("/with-status", getTablesWithStatus);


// Bulk insert tables
router.post("/bulk", bulkInsertTables);

export default router;
