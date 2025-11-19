import express from "express";
import { getMenuCategoriesWithItems } from "../controllers/menuController.js";


const router = express.Router();

router.get("/with-items", getMenuCategoriesWithItems);

export default router;
